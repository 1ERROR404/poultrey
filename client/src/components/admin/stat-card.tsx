import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  delta?: number;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, delta, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {delta !== undefined && (
              <div className={`flex items-center mt-1 text-xs ${delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <span className="inline-block mr-1">
                  {delta >= 0 ? '↑' : '↓'}
                </span>
                <span>
                  {Math.abs(delta)}% {delta >= 0 ? 'increase' : 'decrease'}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="bg-primary/10 p-2 rounded-full text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}