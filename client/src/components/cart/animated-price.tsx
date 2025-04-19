import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '@/contexts/currency-context';
import { useLanguage } from '@/hooks/use-language';

interface AnimatedPriceProps {
  value: string | number;
  className?: string;
  fontSize?: 'small' | 'medium' | 'large';
  highlight?: boolean;
}

export function AnimatedPrice({ 
  value, 
  className = '', 
  fontSize = 'medium',
  highlight = false 
}: AnimatedPriceProps) {
  const { currency } = useCurrency();
  const { isRtl } = useLanguage();
  const [displayValue, setDisplayValue] = useState<string | number>(value);
  const [previousValue, setPreviousValue] = useState<string | number>(value);
  const [isIncreasing, setIsIncreasing] = useState(false);
  const [isDecreasing, setIsDecreasing] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Determine font size class
  const fontSizeClass = 
    fontSize === 'small' ? 'text-sm sm:text-base' : 
    fontSize === 'large' ? 'text-lg sm:text-xl font-bold' : 
    'text-base sm:text-lg';

  // Helper function to convert value to number
  const toNumber = (val: string | number): number => {
    return typeof val === 'string' ? parseFloat(val) : val;
  };
  
  // Format the price with the new "amount currency" format
  const formatPrice = (val: string | number): string => {
    const numValue = toNumber(val);
    return `${numValue.toFixed(2)} ${currency.code}`;
  };

  useEffect(() => {
    // Skip animation on first render
    if (String(previousValue) === String(value)) {
      setDisplayValue(value);
      return;
    }

    // Determine if value is increasing or decreasing
    const prev = toNumber(previousValue);
    const current = toNumber(value);
    setIsIncreasing(current > prev);
    setIsDecreasing(current < prev);
    
    // Trigger animation
    setShouldAnimate(true);

    // Store previous value for next comparison
    setPreviousValue(value);

    // Update displayed value after a slight delay for animation
    const timer = setTimeout(() => {
      setDisplayValue(value);
      // Reset animation state
      setTimeout(() => {
        setShouldAnimate(false);
        setIsIncreasing(false);
        setIsDecreasing(false);
      }, 600);
    }, 100);

    return () => clearTimeout(timer);
  }, [value, previousValue]);

  return (
    <div className={`relative ${className} ${isRtl ? 'text-right' : 'text-left'}`}>
      <AnimatePresence>
        {shouldAnimate && (
          <motion.div
            key={`${value}-animation`}
            className={`absolute ${fontSizeClass} ${isIncreasing ? 'text-green-500' : isDecreasing ? 'text-red-500' : ''}`}
            initial={{ opacity: 0, y: isIncreasing ? 20 : -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', textAlign: 'inherit' }}
          >
            {formatPrice(value)}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={`${fontSizeClass} ${shouldAnimate && highlight ? (isIncreasing ? 'text-green-600' : isDecreasing ? 'text-red-500' : '') : ''}`}
        animate={{
          scale: shouldAnimate ? [1, 1.05, 1] : 1,
        }}
        transition={{ 
          duration: 0.5,
          ease: "easeInOut" 
        }}
      >
        {formatPrice(displayValue)}
      </motion.div>
    </div>
  );
}