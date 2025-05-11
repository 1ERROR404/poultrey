import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id?: number;
  userId?: number;
  productId: number;
  product: Product;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [localItems, setLocalItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch cart from API when user is logged in
  const { 
    data: apiCartItems = [], 
    isLoading: isCartLoading,
    refetch: refetchCart
  } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    enabled: !!user // Only run if user is logged in
  });

  // Load local cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setLocalItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
    setIsInitialized(true);
  }, []);

  // Save local cart to localStorage on change
  useEffect(() => {
    if (isInitialized && !user) {
      localStorage.setItem('cart', JSON.stringify(localItems));
    }
  }, [localItems, user, isInitialized]);

  // Sync local cart with API when user logs in
  useEffect(() => {
    const syncCartWithApi = async () => {
      if (user && localItems.length > 0) {
        try {
          // For each local item, add it to the API cart
          for (const item of localItems) {
            await apiRequest('POST', '/api/cart', {
              productId: item.product.id,
              quantity: item.quantity
            });
          }
          
          // Clear local cart
          setLocalItems([]);
          localStorage.removeItem('cart');
          
          // Refetch the cart from API
          await refetchCart();
          
          toast({
            title: 'Cart updated',
            description: 'Your shopping cart has been synced with your account.',
          });
        } catch (error) {
          console.error('Error syncing cart with API:', error);
          toast({
            title: 'Cart sync failed',
            description: 'There was a problem syncing your cart items.',
            variant: 'destructive',
          });
        }
      }
    };

    syncCartWithApi();
  }, [user, localItems.length, refetchCart, toast]);

  // API mutations for cart operations
  const addItemMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const res = await apiRequest('POST', '/api/cart', { productId, quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add item',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const res = await apiRequest('PUT', `/api/cart/${productId}`, { quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update item',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: number) => {
      try {
        await apiRequest('DELETE', `/api/cart/${productId}`);
        return true;
      } catch (error: any) {
        // If the item wasn't found, consider it a success (already removed)
        if (error.status === 404) {
          return true;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to remove item',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/cart');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to clear cart',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Determine which cart to use
  const items = user ? apiCartItems : localItems;

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    if (user) {
      // Add to API cart
      addItemMutation.mutate({ productId: product.id, quantity });
    } else {
      // Add to local cart
      setLocalItems(currentItems => {
        // Check if item already exists in cart
        const existingItemIndex = currentItems.findIndex(item => item.product.id === product.id);
        
        if (existingItemIndex > -1) {
          // Update quantity of existing item
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += quantity;
          return updatedItems;
        } else {
          // Add new item
          return [...currentItems, { 
            productId: product.id,
            product, 
            quantity,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }];
        }
      });
    }
  };

  const removeFromCart = (productId: number) => {
    if (user) {
      // Remove from API cart
      removeItemMutation.mutate(productId);
    } else {
      // Remove from local cart
      setLocalItems(currentItems => currentItems.filter(item => item.product.id !== productId));
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    if (user) {
      // Update in API cart
      updateItemMutation.mutate({ productId, quantity });
    } else {
      // Update in local cart
      setLocalItems(currentItems => 
        currentItems.map(item => 
          item.product.id === productId 
            ? { ...item, quantity, updatedAt: new Date().toISOString() } 
            : item
        )
      );
    }
  };

  const clearCart = () => {
    if (user) {
      // Clear API cart
      clearCartMutation.mutate();
    } else {
      // Clear local cart
      setLocalItems([]);
    }
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const subtotal = items.reduce(
    (total, item) => total + (parseFloat(item.product.price) * item.quantity), 
    0
  );

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isLoading: isCartLoading,
    totalItems,
    subtotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};