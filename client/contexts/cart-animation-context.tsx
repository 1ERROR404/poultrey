import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AddToCartAnimation } from '@/components/cart/add-to-cart-animation';

interface CartAnimationContextProps {
  triggerAddToCartAnimation: (
    imageUrl: string,
    startPosition: { x: number; y: number },
    endPosition: { x: number; y: number }
  ) => void;
}

const CartAnimationContext = createContext<CartAnimationContextProps | undefined>(undefined);

export function CartAnimationProvider({ children }: { children: ReactNode }) {
  const [animationState, setAnimationState] = useState({
    visible: false,
    imageUrl: '',
    startPosition: { x: 0, y: 0 },
    endPosition: { x: 0, y: 0 }
  });

  const triggerAddToCartAnimation = (
    imageUrl: string,
    startPosition: { x: number; y: number },
    endPosition: { x: number; y: number }
  ) => {
    setAnimationState({
      visible: true,
      imageUrl,
      startPosition,
      endPosition
    });
  };

  const resetAnimation = () => {
    setAnimationState({
      visible: false,
      imageUrl: '',
      startPosition: { x: 0, y: 0 },
      endPosition: { x: 0, y: 0 }
    });
  };

  return (
    <CartAnimationContext.Provider value={{ triggerAddToCartAnimation }}>
      {children}
      <AddToCartAnimation
        visible={animationState.visible}
        imageUrl={animationState.imageUrl}
        startPosition={animationState.startPosition}
        endPosition={animationState.endPosition}
        onComplete={resetAnimation}
      />
    </CartAnimationContext.Provider>
  );
}

export const useCartAnimation = () => {
  const context = useContext(CartAnimationContext);
  if (!context) {
    throw new Error('useCartAnimation must be used within CartAnimationProvider');
  }
  return context;
};