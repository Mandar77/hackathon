import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "transform hover:scale-105 active:scale-95",
          {
            "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-pink-600": variant === "default",
            "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-pink-600": variant === "destructive",
            "border-2 border-purple-300 bg-white/80 backdrop-blur-sm hover:bg-purple-50 hover:border-purple-400 text-purple-700": variant === "outline",
            "bg-purple-100 text-purple-900 hover:bg-purple-200": variant === "secondary",
            "hover:bg-purple-100 hover:text-purple-900": variant === "ghost",
            "text-purple-600 underline-offset-4 hover:underline": variant === "link",
          },
          {
            "h-12 px-6 py-3": size === "default",
            "h-10 rounded-xl px-4 text-xs": size === "sm",
            "h-14 rounded-2xl px-8 text-base": size === "lg",
            "h-12 w-12": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }
