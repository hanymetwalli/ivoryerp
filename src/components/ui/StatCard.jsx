import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp, 
  color = "primary",
  className 
}) {
  const colorClasses = {
    primary: "bg-gradient-to-br from-[#7c3238] to-[#5a252a] text-white",
    accent: "bg-gradient-to-br from-[#c9a86c] to-[#b8956a] text-white",
    blue: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
    green: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",
    purple: "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
    orange: "bg-gradient-to-br from-orange-500 to-orange-600 text-white",
  };

  return (
    <div className={cn(
      "rounded-xl p-5 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
      colorClasses[color],
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm",
              trendUp ? "text-green-200" : "text-red-200"
            )}>
              <span>{trend}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-white/20 rounded-xl">
            <Icon className="w-7 h-7" />
          </div>
        )}
      </div>
    </div>
  );
}