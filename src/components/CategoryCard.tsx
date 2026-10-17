import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  gradient: string;
  onClick: () => void;
  className?: string;
}

export function CategoryCard({ title, icon: Icon, gradient, onClick, className }: CategoryCardProps) {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group",
        "border-2 border-white/20 backdrop-blur-sm",
        gradient,
        className
      )}
      onClick={onClick}
    >
      <div className="p-6 h-32 flex flex-col items-center justify-center text-white relative z-10">
        <Icon className="w-10 h-10 mb-3 transition-transform duration-300 group-hover:scale-110" />
        <h3 className="text-lg font-bold text-center leading-tight">{title}</h3>
      </div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </Card>
  );
}