import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function NewsletterSignup() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // This would typically be an API call to your backend
    setTimeout(() => {
      toast({
        title: "Success!",
        description: "You've been added to our newsletter.",
      });
      setEmail("");
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="py-16 bg-primary-600 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated with Poultry News
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join our newsletter to receive updates, tips, special offers, and industry insights.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <Input
              type="email"
              placeholder="Your email address"
              className="flex-grow bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-primary-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              className="bg-white text-primary-600 hover:bg-primary-50 hover:text-primary-700"
              disabled={loading}
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          
          <p className="mt-4 text-sm text-primary-200">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}