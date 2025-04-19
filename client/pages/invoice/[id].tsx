import { useEffect, useState, useRef } from "react";
import { useParams } from "wouter";
import { Loader2, Edit, Save, Printer, RotateCcw, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoiceHtml, setInvoiceHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [originalInvoiceHtml, setOriginalInvoiceHtml] = useState<string | null>(null);
  const invoiceContentRef = useRef<HTMLDivElement>(null);
  
  console.log("Invoice page mounted with ID:", id, "User:", user?.id, "Role:", user?.role);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        
        // Use our universal public endpoint for invoices
        // It doesn't require authentication and works for all users
        const endpoint = `/api/invoices/${id}`;
        
        console.log(`Fetching invoice for order ID: ${id}`);
        
        // Ensure we're making a proper GET request
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/json'
          }
        });
        
        console.log("Response status:", response.status);
        
        // Check if response is successful
        if (!response.ok) {
          try {
            const errorData = await response.json();
            console.error("Error response:", errorData);
            throw new Error(errorData.message || "Failed to fetch invoice");
          } catch (parseError) {
            const text = await response.text();
            console.error("Error parsing response:", text);
            throw new Error(`Server error (${response.status}): ${text || "Unknown error"}`);
          }
        }
        
        // Get the content type to determine how to handle the response
        const contentType = response.headers.get('content-type');
        console.log("Response content type:", contentType);
        
        let htmlContent;
        if (contentType && contentType.includes('application/json')) {
          // If it's JSON, log it and use it as debugging info
          const jsonData = await response.json();
          console.log("Received JSON instead of HTML:", jsonData);
          
          htmlContent = `
            <div class="error-message" style="font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); background-color: #fff;">
              <h1 style="color: #ef4444; font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Error Generating Invoice</h1>
              <p style="margin-bottom: 1rem;">${jsonData.message || 'Unknown error occurred'}</p>
              <pre style="background-color: #f1f5f9; padding: 1rem; border-radius: 0.25rem; overflow-x: auto; font-size: 0.875rem;">${JSON.stringify(jsonData, null, 2)}</pre>
              <button onclick="window.history.back()" style="margin-top: 1rem; padding: 0.5rem 1rem; background-color: #2c5e2d; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">Go Back</button>
            </div>
          `;
        } else {
          // Otherwise get the HTML content
          htmlContent = await response.text();
        }
        
        console.log("Setting invoice HTML, length:", htmlContent.length);
        setInvoiceHtml(htmlContent);
        setOriginalInvoiceHtml(htmlContent);
        
        // Auto-trigger print if needed
        // setTimeout(() => { window.print(); }, 1000);
      } catch (err: any) {
        console.error("Error fetching invoice:", err);
        setError(err.message || "An error occurred while fetching the invoice");
        
        toast({
          title: "Error",
          description: err.message || "Failed to load invoice",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    } else {
      setError("No order ID provided");
      setLoading(false);
    }
  }, [id, user, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-lg text-center mb-6">{error}</p>
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!invoiceHtml) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">No invoice data available</p>
      </div>
    );
  }

  // Handle toggling edit mode
  const toggleEditMode = async () => {
    if (isEditMode) {
      // Save changes before exiting edit mode
      if (invoiceContentRef.current) {
        const newHtmlContent = invoiceContentRef.current.innerHTML;
        setInvoiceHtml(newHtmlContent);
        
        // Save the changes to the backend
        try {
          const response = await apiRequest('POST', `/api/invoices/${id}/save`, {
            htmlContent: newHtmlContent
          });
          
          if (response.ok) {
            toast({
              title: "Success",
              description: "Invoice changes saved successfully",
            });
          } else {
            const error = await response.json();
            toast({
              title: "Error",
              description: error.message || "Failed to save invoice changes",
              variant: "destructive"
            });
          }
        } catch (err: any) {
          console.error("Error saving invoice:", err);
          toast({
            title: "Error",
            description: err.message || "Failed to save invoice changes",
            variant: "destructive"
          });
        }
      }
    }
    setIsEditMode(!isEditMode);
  };

  // Handle resetting to original content
  const resetToOriginal = () => {
    if (originalInvoiceHtml) {
      setInvoiceHtml(originalInvoiceHtml);
      setIsEditMode(false);
      toast({
        title: "Reset Complete",
        description: "The invoice has been reset to its original state",
      });
    }
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Handle download as PDF functionality (could be implemented later)
  const handleDownload = () => {
    // This is a placeholder. For actual PDF generation, you'd need a library
    // like jsPDF or html2pdf.js
    toast({
      title: "Downloading...",
      description: "Invoice download started",
    });
    window.print(); // For now, just trigger print dialog which can save as PDF
  };

  // When in edit mode, make everything contentEditable
  // When not in edit mode, just render the HTML normally
  return (
    <div className="relative">
      {/* Controls toolbar - only visible when not printing */}
      <div className="invoice-controls fixed bottom-4 right-4 bg-white border-2 border-amber-300 shadow-lg rounded-lg p-3 z-50 print:hidden flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={isEditMode ? "default" : "outline"} 
                size="lg" 
                onClick={toggleEditMode}
                className={isEditMode ? "bg-amber-500 hover:bg-amber-600 text-white h-12 w-12" : "h-12 w-12"}
              >
                {isEditMode ? <Save className="h-6 w-6" /> : <Edit className="h-6 w-6" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isEditMode ? "Save changes" : "Edit invoice"}</p>
            </TooltipContent>
          </Tooltip>
          
          {isEditMode && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={resetToOriginal}
                  className="h-12 w-12"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset to original</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handlePrint}
                className="h-12 w-12"
              >
                <Printer className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Print invoice</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleDownload}
                className="h-12 w-12"
              >
                <Download className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download as PDF</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {isEditMode ? (
        <div 
          ref={invoiceContentRef}
          className="invoice-container edit-mode"
          dangerouslySetInnerHTML={{ __html: invoiceHtml || "" }}
          contentEditable={true}
          suppressContentEditableWarning={true}
          style={{
            outline: "none",
            position: "relative"
          }}
        />
      ) : (
        <div 
          className="invoice-container" 
          dangerouslySetInnerHTML={{ __html: invoiceHtml || "" }}
        />
      )}
      
      {/* Overlay message when in edit mode */}
      {isEditMode && (
        <div className="fixed top-4 left-0 right-0 mx-auto w-fit bg-amber-100 text-amber-800 py-3 px-6 rounded-md shadow-lg print:hidden flex items-center gap-3 border-2 border-amber-300 z-50 font-medium">
          <Edit className="h-6 w-6" />
          <span>Edit mode: Click on any text to modify, then click Save when done</span>
        </div>
      )}
      
      {/* Add CSS for edit mode highlighting */}
      <style jsx global>{`
        @media print {
          .invoice-controls, .edit-mode-notice {
            display: none !important;
          }
          
          body, html {
            background: white !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        
        .edit-mode [contenteditable]:hover {
          outline: 1px dashed #f59e0b;
          background-color: rgba(245, 158, 11, 0.05);
          cursor: text;
        }
        
        .edit-mode [contenteditable]:focus {
          outline: 2px solid #f59e0b;
          background-color: rgba(245, 158, 11, 0.1);
        }
      `}</style>
    </div>
  );
}