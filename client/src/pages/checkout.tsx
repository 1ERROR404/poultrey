import { useState, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useCart } from '@/contexts/cart-context';
import { useLanguage } from '@/hooks/use-language';
import { useTranslation } from '@/hooks/use-translation';
import { useCurrency } from '@/contexts/currency-context';
import { useAuth } from '@/hooks/use-auth';
import { countries, getCountryName } from '@/lib/countries';
import { 
  Check, 
  ChevronRight, 
  MapPin, 
  Truck, 
  Calendar, 
  ArrowLeft,
  Clock,
  ShieldCheck,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription
} from "@/components/ui/alert";

// Using countries from shared countries file

const deliveryOptions = [
  {
    id: 'standard',
    title: 'Standard Delivery',
    price: '0.00',
    eta: '3-5 business days',
    icon: <Truck className="h-5 w-5" />
  },
  {
    id: 'express',
    title: 'Express Delivery',
    price: '15.00',
    eta: '1-2 business days',
    icon: <Clock className="h-5 w-5" />
  }
];

const paymentOptions = [
  {
    id: 'cash',
    title: 'Cash on Delivery',
    description: 'Pay when you receive your order'
  },
  {
    id: 'bank',
    title: 'Bank Transfer',
    description: 'Complete your payment with a direct bank transfer'
  }
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { language, isRtl } = useLanguage();
  const { t, isArabic } = useTranslation();
  const { formatCurrency, currency } = useCurrency();
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'auth' | null>(null);
  
  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>('new');
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  
  // Form state
  const [formState, setFormState] = useState({
    firstName: '', // User schema doesn't have firstName
    lastName: '', // User schema doesn't have lastName
    email: user?.email || '',
    phone: '', // User schema doesn't have phoneNumber
    address: '',
    city: '',
    postalCode: '',
    country: 'ae',
    paymentOption: 'cash',
    deliveryOption: 'standard',
    notes: '',
    // createAccount option removed per client request
  });
  
  // Set checkout mode based on user authentication status
  useEffect(() => {
    if (checkoutMode === null) {
      setCheckoutMode(user ? 'auth' : 'guest');
    }
  }, [user, checkoutMode]);
  
  // Check if cart is empty on page load and redirect if necessary
  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [items.length, orderComplete, navigate]);
  
  // Fetch user's saved addresses when they're logged in
  useEffect(() => {
    if (user && user.id) {
      fetch(`/api/addresses`)
        .then(response => {
          if (response.ok) return response.json();
          throw new Error('Failed to fetch addresses');
        })
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setSavedAddresses(data);
            // If user has a default address, select it
            const defaultAddress = data.find(addr => addr.isDefault);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
              // Populate the form with the default address
              setFormState(prev => ({
                ...prev,
                firstName: defaultAddress.firstName || '',
                lastName: defaultAddress.lastName || '',
                address: defaultAddress.addressLine1 || '',
                city: defaultAddress.city || '',
                postalCode: defaultAddress.postalCode || '',
                country: defaultAddress.country || 'ae',
                phone: defaultAddress.phone || '',
                email: prev.email || user.email || '',
              }));
            } else if (data.length > 0) {
              // If no default, use the first address
              setSelectedAddressId(data[0].id);
              setFormState(prev => ({
                ...prev,
                firstName: data[0].firstName || '',
                lastName: data[0].lastName || '',
                address: data[0].addressLine1 || '',
                city: data[0].city || '',
                postalCode: data[0].postalCode || '',
                country: data[0].country || 'ae',
                phone: data[0].phone || '',
              }));
            } else {
              // If no addresses, select 'new'
              setSelectedAddressId('new');
            }
          } else {
            // If no addresses, select 'new'
            setSelectedAddressId('new');
          }
        })
        .catch(error => {
          console.error('Error fetching addresses:', error);
          setSelectedAddressId('new');
        });
    } else {
      // For guest users, always show the address form
      setSelectedAddressId('new');
    }
  }, [user]);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculated values
  const deliveryOption = deliveryOptions.find(option => option.id === formState.deliveryOption);
  const deliveryPrice = deliveryOption ? parseFloat(deliveryOption.price) : 0;
  const total = subtotal + deliveryPrice;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormState(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle selecting a saved address or creating a new one
  const handleAddressChange = (addressId: number | 'new') => {
    setSelectedAddressId(addressId);
    
    if (addressId === 'new') {
      // Clear form fields if "new address" is selected
      setFormState(prev => ({
        ...prev,
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'ae',
        phone: '',
        email: user?.email || ''
      }));
    } else {
      // Find selected address and populate form
      const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
      if (selectedAddress) {
        setFormState(prev => ({
          ...prev,
          firstName: selectedAddress.firstName || '',
          lastName: selectedAddress.lastName || '',
          address: selectedAddress.addressLine1 || '',
          city: selectedAddress.city || '',
          postalCode: selectedAddress.postalCode || '',
          country: selectedAddress.country || 'ae',
          phone: selectedAddress.phone || '',
          email: prev.email || user?.email || ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields - make phone optional for guest checkout
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'country'];
    
    // Add phone as required only for authenticated users
    if (checkoutMode === 'auth') {
      requiredFields.push('phone');
    }
    
    requiredFields.forEach(field => {
      if (!formState[field as keyof typeof formState]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Email validation
    if (formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (still validate format if provided)
    if (formState.phone && !/^\+?[\d\s()-]{8,15}$/.test(formState.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementsByName(firstErrorField)[0];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Process checkout
    setIsLoading(true);
    
    // Create order in database
    const orderData = {
      userId: user?.id || 0,
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price,
        subtotal: (parseFloat(item.product.price) * item.quantity).toString()
      })),
      shippingMethod: formState.deliveryOption,
      shippingCost: deliveryOption?.price || '0.00',
      paymentMethod: formState.paymentOption,
      status: 'pending',
      paymentStatus: formState.paymentOption === 'cash' ? 'pending' : 'processing',
      totalAmount: total.toString(),
      currency: currency.code,
      notes: formState.notes,
      shippingAddress: {
        firstName: formState.firstName,
        lastName: formState.lastName,
        address: formState.address,
        city: formState.city,
        postalCode: formState.postalCode,
        country: formState.country,
        email: formState.email,
        phone: formState.phone
      }
    };
    
    const submitOrder = () => {
      fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to create order');
        }
        return response.json();
      })
      .then(data => {
        setOrderId(data.orderNumber);
        setOrderComplete(true);
        clearCart(); // Clear the cart on successful order
        
        // Scroll to top to show the order confirmation
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(err => {
        console.error('Error creating order:', err);
        alert('There was an error processing your order. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
    };

    if (user && selectedAddressId === 'new' && saveNewAddress) {
      // Save address first, then process order
      const addressData = {
        firstName: formState.firstName,
        lastName: formState.lastName,
        addressLine1: formState.address,
        city: formState.city,
        postalCode: formState.postalCode,
        country: formState.country,
        phone: formState.phone,
        isDefault: savedAddresses.length === 0, // Make it default if it's the first address
      };
      
      fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to save address');
        }
        return response.json();
      })
      .then(() => {
        // After saving address, process the order
        submitOrder();
      })
      .catch(err => {
        console.error('Error saving address:', err);
        // Continue with the order even if saving address fails
        submitOrder();
      });
    } else {
      // If no need to save address, process order directly
      submitOrder();
    }
  };

  // If no items in cart, redirect to cart page
  if (items.length === 0 && !orderComplete) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('cart_empty_checkout_message')}
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <Link href="/cart">
            <Button variant="outline" className={`${isRtl ? 'ml-2' : 'mr-2'}`}>
              <ArrowLeft className={`h-4 w-4 ${isRtl ? 'ml-2 rotate-180' : 'mr-2'}`} />
              {t('return_to_cart')}
            </Button>
          </Link>
          
          <Link href="/products">
            <Button className="bg-green-700 hover:bg-green-800">
              {t('browse_products')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Order complete screen
  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('thank_you_order')}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {t('order_received_message')}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <div className="flex justify-between text-gray-700 mb-2">
              <span>{t('order_number')}:</span>
              <span className="font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-2">
              <span>{t('date')}:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-2">
              <span>{t('total')}:</span>
              <span className="font-medium">{parseFloat(total.toString()).toFixed(2)} {currency.code}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>{t('payment_method')}:</span>
              <span className="font-medium">
                {formState.paymentOption === 'cash' ? t('cash_on_delivery') : t('bank_transfer')}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="bg-green-700 hover:bg-green-800 w-full sm:w-auto">
                {t('return_to_home')}
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full sm:w-auto">
                {t('continue_shopping')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {t('checkout')}
        </h1>
        <p className="text-gray-600">
          {t('complete_your_purchase')}
        </p>
      </div>
      
      {/* Guest Checkout Banner */}
      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div className={`${isRtl ? 'mr-3' : 'ml-3'}`}>
              <h3 className="text-sm font-medium text-blue-800">{t('continue_as_guest_or_login')}</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>{t('guest_checkout_message')}</p>
              </div>
              <div className="mt-3">
                <Link href="/auth">
                  <Button variant="outline" size="sm" className={`${isRtl ? 'ml-2' : 'mr-2'}`}>
                    {t('login')}
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => setCheckoutMode('guest')}
                >
                  {t('continue_as_guest')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <MapPin className="h-5 w-5 text-green-700" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{t('shipping_information')}</h2>
              </div>
              
              {/* Saved addresses for logged-in users */}
              {user && (
                <div className="mb-6 border border-gray-200 rounded-xl p-5 bg-gray-50/50 shadow-sm">
                  <h3 className="text-lg font-medium mb-4 border-b pb-3 text-green-800">{t('shipping_address')}</h3>
                  
                  <RadioGroup 
                    value={selectedAddressId.toString()} 
                    onValueChange={(value) => handleAddressChange(value === 'new' ? 'new' : parseInt(value))}
                    className="space-y-4"
                  >
                    {savedAddresses.length > 0 && savedAddresses.map((address) => (
                      <div key={address.id} className={`flex items-start p-3 rounded-lg transition-all ${selectedAddressId === address.id ? 'bg-white border border-green-200 shadow-sm' : 'hover:bg-white'}`}>
                        <RadioGroupItem value={address.id.toString()} id={`address-${address.id}`} className="mt-1" />
                        <div className="grid gap-1 ml-3">
                          <Label htmlFor={`address-${address.id}`} className="font-semibold text-gray-900 flex items-center">
                            {address.firstName} {address.lastName}
                            {address.isDefault && (
                              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                                {t('Default')}
                              </span>
                            )}
                            {address.label && (
                              <span className="ml-2 text-sm font-normal text-gray-500">({address.label})</span>
                            )}
                          </Label>
                          <div className="text-sm text-gray-600 mt-1 space-y-1">
                            <p className="font-medium">{address.addressLine1}</p>
                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                            <p>{address.city}, {address.postalCode}</p>
                            <p>{getCountryName(address.country, isArabic)}</p>
                            {address.phone && (
                              <p className="flex items-center mt-2 text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                {address.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className={`flex items-start p-3 rounded-lg transition-all ${selectedAddressId === 'new' ? 'bg-white border border-green-200 shadow-sm' : 'hover:bg-white'}`}>
                      <RadioGroupItem value="new" id="address-new" className="mt-1" />
                      <div className="ml-3">
                        <Label htmlFor="address-new" className="font-semibold text-gray-900">
                          {savedAddresses.length > 0 ? t('Add a new shipping address') : t('Enter new shipping details')}
                        </Label>
                        {savedAddresses.length > 0 && (
                          <p className="text-sm text-gray-500 mt-1">{t('You will be able to save this address for future orders')}</p>
                        )}
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}
              
              {/* Show form fields if "new address" is selected or user has no saved addresses */}
              {(selectedAddressId === 'new' || !user) && (
                <div className="address-form-fields bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium mb-5 border-b pb-3 text-green-800">
                    {user ? t('Enter your new shipping address') : t('Shipping information')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <Label htmlFor="firstName" className="font-medium mb-1.5 block">{t('first_name')} *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formState.firstName}
                        onChange={handleInputChange}
                        placeholder={t('enter_first_name')}
                        className={`h-11 ${errors.firstName ? "border-red-500 focus-visible:ring-red-300" : "focus-visible:ring-green-100"}`}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1.5">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="font-medium mb-1.5 block">{t('last_name')} *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formState.lastName}
                        onChange={handleInputChange}
                        placeholder={t('enter_last_name')}
                        className={`h-11 ${errors.lastName ? "border-red-500 focus-visible:ring-red-300" : "focus-visible:ring-green-100"}`}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1.5">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <Label htmlFor="email" className="font-medium mb-1.5 block">{t('email')} *</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formState.email}
                          onChange={handleInputChange}
                          placeholder={t('enter_email')}
                          className={`h-11 pl-10 ${errors.email ? "border-red-500 focus-visible:ring-red-300" : "focus-visible:ring-green-100"}`}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone" className="font-medium mb-1.5 block">
                        {t('phone_number')} {checkoutMode === 'auth' ? '*' : '(Optional)'}
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          name="phone"
                          value={formState.phone}
                          onChange={handleInputChange}
                          placeholder={t('enter_phone')}
                          className={`h-11 pl-10 ${errors.phone ? "border-red-500 focus-visible:ring-red-300" : "focus-visible:ring-green-100"}`}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-5">
                    <Label htmlFor="address" className="font-medium mb-1.5 block">{t('address')} *</Label>
                    <div className="relative">
                      <Input
                        id="address"
                        name="address"
                        value={formState.address}
                        onChange={handleInputChange}
                        placeholder={t('enter_address')}
                        className={`h-11 pl-10 ${errors.address ? "border-red-500 focus-visible:ring-red-300" : "focus-visible:ring-green-100"}`}
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.address}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                    <div>
                      <Label htmlFor="city" className="font-medium mb-1.5 block">{t('city')} *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formState.city}
                        onChange={handleInputChange}
                        placeholder={t('enter_city')}
                        className={`h-11 ${errors.city ? "border-red-500 focus-visible:ring-red-300" : "focus-visible:ring-green-100"}`}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1.5">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="postalCode" className="font-medium mb-1.5 block">{t('postal_code')}</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formState.postalCode}
                        onChange={handleInputChange}
                        placeholder={t('enter_postal_code')}
                        className="h-11 focus-visible:ring-green-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="font-medium mb-1.5 block">{t('country')} *</Label>
                      <Select
                        value={formState.country}
                        onValueChange={(value) => handleSelectChange('country', value)}
                      >
                        <SelectTrigger 
                          id="country"
                          className={`h-11 ${errors.country ? "border-red-500 focus-visible:ring-red-300" : "focus-visible:ring-green-100"}`}
                        >
                          <SelectValue placeholder={t('select_country')} />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {isArabic ? country.nameAr : country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.country && (
                        <p className="text-red-500 text-xs mt-1.5">{errors.country}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <Label htmlFor="notes" className="font-medium mb-1.5 block">{t('order_notes')}</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formState.notes}
                      onChange={handleInputChange}
                      placeholder={t('order_instructions')}
                      className="min-h-[100px] focus-visible:ring-green-100"
                    />
                  </div>
                  
                  {/* Save address option for logged-in users entering a new address */}
                  {user && selectedAddressId === 'new' && (
                    <div className="mt-5 flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-100">
                      <Checkbox 
                        id="saveAddress" 
                        checked={saveNewAddress}
                        onCheckedChange={(checked) => setSaveNewAddress(checked as boolean)}
                        className="border-green-500 text-green-600 focus:ring-green-200"
                      />
                      <label
                        htmlFor="saveAddress"
                        className="text-sm font-medium leading-none text-gray-700 cursor-pointer"
                      >
                        {t('Save this address for future orders')}
                      </label>
                    </div>
                  )}
                </div>
              )}
              
            </div>
            
            {/* Delivery Options */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Truck className="h-5 w-5 text-green-700" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{t('delivery_options')}</h2>
              </div>
              
              <RadioGroup 
                value={formState.deliveryOption}
                onValueChange={(value) => handleSelectChange('deliveryOption', value)}
                className="space-y-4"
              >
                {deliveryOptions.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border border-gray-200 transition-colors",
                      formState.deliveryOption === option.id ? "border-green-500 bg-green-50" : "hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value={option.id} id={option.id} className="mr-3" />
                      <div className="flex items-center">
                        <div className="mr-3 p-2 bg-gray-100 rounded-md">
                          {option.icon}
                        </div>
                        <div>
                          <Label htmlFor={option.id} className="font-medium cursor-pointer">
                            {option.title}
                          </Label>
                          <p className="text-gray-500 text-sm flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {option.eta}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="font-medium">
                      {option.price === '0.00' ? t('free_label') : `${parseFloat(option.price).toFixed(2)} ${currency.code}`}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <CreditCard className="h-5 w-5 text-green-700" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{t('payment_method')}</h2>
              </div>
              
              <RadioGroup 
                value={formState.paymentOption}
                onValueChange={(value) => handleSelectChange('paymentOption', value)}
                className="space-y-4"
              >
                {paymentOptions.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-center p-4 rounded-lg border border-gray-200 transition-colors",
                      formState.paymentOption === option.id ? "border-green-500 bg-green-50" : "hover:border-gray-300"
                    )}
                  >
                    <RadioGroupItem value={option.id} id={option.id} className="mr-3" />
                    <div>
                      <Label htmlFor={option.id} className="font-medium cursor-pointer">
                        {option.title}
                      </Label>
                      <p className="text-gray-500 text-sm">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
              
              {formState.paymentOption === 'bank' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">{t('bank_transfer_details')}</h3>
                  <p className="text-gray-700 text-sm mb-2">
                    {t('transfer_instructions')}
                  </p>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">{t('bank_name')}:</span> Poultry Gear Bank</p>
                    <p><span className="font-medium">{t('account_number')}:</span> 1234-5678-9012-3456</p>
                    <p><span className="font-medium">IBAN:</span> AE01 2345 6789 0123 4567 89</p>
                    <p><span className="font-medium">{t('account_holder')}:</span> Poultry Gear LLC</p>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {t('transfer_reference')}
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('order_summary')}</h2>
            
            <Accordion type="single" collapsible defaultValue="items" className="mb-6">
              <AccordionItem value="items" className="border-0">
                <AccordionTrigger className="py-2 text-base font-medium">
                  {items.length} {items.length === 1 ? t('item_singular') : t('items_plural')} {t('items_in_cart')}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 mt-2">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center">
                        <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden border border-gray-200">
                          <img
                            src={item.product.imageUrl}
                            alt={language === 'ar' && item.product.nameAr ? item.product.nameAr : item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {language === 'ar' && item.product.nameAr 
                              ? item.product.nameAr 
                              : item.product.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {t('quantity_short')}: {item.quantity}
                          </p>
                        </div>
                        <div className="ml-3 text-sm font-medium text-gray-900">
                          {(parseFloat(item.product.price) * item.quantity).toFixed(2)} {currency.code}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('order_subtotal')}</span>
                <span className="font-medium">{parseFloat(subtotal.toString()).toFixed(2)} {currency.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('shipping_cost')}</span>
                <span className="font-medium">
                  {deliveryPrice === 0 ? t('free_label') : `${parseFloat(deliveryPrice.toString()).toFixed(2)} ${currency.code}`}
                </span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-bold text-lg">
                <span>{t('order_total')}</span>
                <span>{parseFloat(total.toString()).toFixed(2)} {currency.code}</span>
              </div>
              <div className="text-xs text-gray-500 text-right">
                {t('including_taxes_and_fees')}
              </div>
            </div>
            
            <div className="space-y-4">
              <Button 
                className="w-full bg-green-700 hover:bg-green-800 py-6 text-base"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    {t('processing_order')}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {t('place_order')}
                    <ChevronRight className={`${isRtl ? 'mr-2' : 'ml-2'} h-4 w-4`} />
                  </span>
                )}
              </Button>
              
              <Link href="/cart">
                <Button variant="outline" className="w-full border-gray-300">
                  <ArrowLeft className={`${isRtl ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                  {t('return_to_cart')}
                </Button>
              </Link>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <ShieldCheck className={`h-4 w-4 text-green-700 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                {t('secure_checkout')}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Truck className={`h-4 w-4 text-green-700 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                {t('free_shipping')}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className={`h-4 w-4 text-green-700 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                {t('delivery_timeframe')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}