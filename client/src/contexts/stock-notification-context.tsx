import { createContext, useContext, useState, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StockNotificationContextType {
  isOpen: boolean;
  openModal: (productId: number, productName: string) => void;
  closeModal: () => void;
  productId: number | null;
  productName: string;
  isSubmitting: boolean;
  submitNotification: (email: string) => Promise<void>;
}

const StockNotificationContext = createContext<StockNotificationContextType | undefined>(undefined);

export function StockNotificationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);
  const [productName, setProductName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const openModal = (productId: number, productName: string) => {
    setProductId(productId);
    setProductName(productName);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const submitNotification = async (email: string) => {
    if (!productId) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/stock-notifications", {
        email,
        productId
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit notification request");
      }
      
      toast({
        title: "Notification saved!",
        description: "We'll email you when this product is back in stock.",
      });
      
      closeModal();
    } catch (error) {
      console.error("Error submitting stock notification:", error);
      toast({
        title: "Notification Failed",
        description: error instanceof Error ? error.message : "Failed to submit notification request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StockNotificationContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        productId,
        productName,
        isSubmitting,
        submitNotification,
      }}
    >
      {children}
    </StockNotificationContext.Provider>
  );
}

export function useStockNotification() {
  const context = useContext(StockNotificationContext);
  
  if (context === undefined) {
    throw new Error("useStockNotification must be used within a StockNotificationProvider");
  }
  
  return context;
}