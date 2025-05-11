import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Share2, 
  Copy, 
  Check,
  MessagesSquare,
  Send
} from "lucide-react";
import { useState } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  className?: string;
  iconClassName?: string;
  iconSize?: number;
  align?: 'center' | 'start' | 'end';
  variant?: 'default' | 'outline' | 'ghost';
  showLabel?: boolean;
}

export default function SocialShare({
  url,
  title,
  description = "",
  imageUrl = "",
  className = "",
  iconClassName = "",
  iconSize = 18,
  align = 'center', 
  variant = 'ghost',
  showLabel = false
}: SocialShareProps) {
  const [isCopied, setIsCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  
  // Social media share URLs
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
  const emailShareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
  
  // Open share URLs in a popup window
  const handleShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };
  
  // Copy URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant={variant} 
          size="sm"
          className={cn("flex items-center gap-2", className)}
        >
          <Share2 className={cn("h-4 w-4", iconClassName)} size={iconSize} />
          {showLabel && <span>Share</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-56 p-3">
        <div className="space-y-2">
          <h4 className="text-sm font-medium mb-2">Share this product</h4>
          <div className="grid grid-cols-3 gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white text-[#1877F2] hover:text-[#1877F2]/90 border-gray-200"
                    onClick={() => handleShare(facebookShareUrl)}
                  >
                    <Facebook className="h-5 w-5" />
                    <span className="sr-only">Share on Facebook</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share on Facebook</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white text-[#1DA1F2] hover:text-[#1DA1F2]/90 border-gray-200"
                    onClick={() => handleShare(twitterShareUrl)}
                  >
                    <Twitter className="h-5 w-5" />
                    <span className="sr-only">Share on Twitter</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share on Twitter</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white text-[#0A66C2] hover:text-[#0A66C2]/90 border-gray-200"
                    onClick={() => handleShare(linkedinShareUrl)}
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">Share on LinkedIn</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share on LinkedIn</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white text-[#25D366] hover:text-[#25D366]/90 border-gray-200"
                    onClick={() => handleShare(whatsappShareUrl)}
                  >
                    <MessagesSquare className="h-5 w-5" />
                    <span className="sr-only">Share on WhatsApp</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share on WhatsApp</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white text-[#0088cc] hover:text-[#0088cc]/90 border-gray-200"
                    onClick={() => handleShare(telegramShareUrl)}
                  >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Share on Telegram</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share on Telegram</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white text-[#EA4335] hover:text-[#EA4335]/90 border-gray-200"
                    onClick={() => handleShare(emailShareUrl)}
                  >
                    <Mail className="h-5 w-5" />
                    <span className="sr-only">Share via Email</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share via Email</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="pt-2 mt-2 border-t border-gray-100">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full flex justify-between items-center text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-200"
              onClick={copyToClipboard}
            >
              <div className="flex items-center">
                {isCopied ? (
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                <span className="text-xs">{isCopied ? "Copied!" : "Copy Link"}</span>
              </div>
              <code className="bg-gray-100 px-1 py-0.5 text-xs rounded truncate max-w-[100px]">
                {url.substring(0, 20)}...
              </code>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}