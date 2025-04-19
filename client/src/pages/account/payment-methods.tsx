import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CreditCard, Plus } from "lucide-react";

export default function PaymentMethodsPage() {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  // Payment methods - this will be fetched from the API in a real implementation
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("payment_methods")}</h2>
        <p className="text-muted-foreground">
          {t("manage_your_payment_methods")}
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("add_payment_method")}
          </Button>
        </div>
        
        {paymentMethods.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-muted p-3 mb-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-center mb-2">
                {t("no_payment_methods_yet")}
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                {t("add_your_first_payment_method_message")}
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("add_your_first_payment_method")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>
                      {method.cardBrand} **** {method.last4}
                    </CardTitle>
                    {method.isDefault && (
                      <span className="text-xs bg-primary/20 text-primary py-1 px-2 rounded-full">
                        {t("default")}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">
                      {method.cardholderName}
                    </p>
                    <p>
                      {t("expires")}: {method.expiryMonth}/{method.expiryYear}
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="text-destructive">
                      {t("delete")}
                    </Button>
                    {!method.isDefault && (
                      <Button variant="outline" size="sm">
                        {t("set_as_default")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}