import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

interface AddToCartAnimationProps {
  imageUrl?: string;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onComplete?: () => void;
  visible: boolean;
}

export function AddToCartAnimation({
  imageUrl,
  startPosition,
  endPosition,
  onComplete,
  visible
}: AddToCartAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsAnimating(true);
    }
  }, [visible]);

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          className="fixed z-50 pointer-events-none"
          initial={{
            x: startPosition.x,
            y: startPosition.y,
            opacity: 1,
            scale: 1
          }}
          animate={{
            x: endPosition.x,
            y: endPosition.y,
            opacity: 0.8,
            scale: 0.3,
            rotate: [0, -10, 10, -10, 0]
          }}
          exit={{ opacity: 0, scale: 0.2 }}
          transition={{
            type: "spring",
            duration: 0.7,
            bounce: 0.25
          }}
          onAnimationComplete={handleAnimationComplete}
        >
          {imageUrl ? (
            <div className="bg-white shadow-lg rounded-lg p-1 w-16 h-16 flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Product"
                className="w-full h-full object-contain rounded"
              />
            </div>
          ) : (
            <div className="bg-green-600 text-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center">
              <ShoppingCart size={20} />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const useAddToCartAnimation = () => {
  const [animationState, setAnimationState] = useState({
    visible: false,
    imageUrl: '',
    startPosition: { x: 0, y: 0 },
    endPosition: { x: 0, y: 0 }
  });

  const triggerAnimation = (
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

  return {
    animationState,
    triggerAnimation,
    resetAnimation
  };
};