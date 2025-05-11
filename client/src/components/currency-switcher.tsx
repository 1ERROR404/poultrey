import * as React from "react";
import { useCurrency, CURRENCIES } from "@/contexts/currency-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FlagIcon, FlagIconCode } from "react-flag-kit";
import { DollarSign } from "lucide-react";

interface CurrencySwitcherProps {
  onCurrencyChange?: () => void;
}

export function CurrencySwitcher({ onCurrencyChange }: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-2">
          {currency.countryCode ? (
            <FlagIcon code={currency.countryCode} size={18} className="mr-1" />
          ) : (
            <DollarSign className="h-4 w-4 mr-1" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.values(CURRENCIES).map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            className={currency.code === curr.code ? "bg-accent/50" : ""}
            onClick={() => {
              setCurrency(curr);
              if (onCurrencyChange) {
                onCurrencyChange();
              }
            }}
          >
            <div className="flex items-center">
              {curr.countryCode && (
                <FlagIcon code={curr.countryCode} size={16} className="mr-2" />
              )}
              <span className="mr-2">{curr.symbol}</span>
              <span className={currency.code === curr.code ? "font-bold" : ""}>
                {curr.name}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}