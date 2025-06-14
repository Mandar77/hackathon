import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl border border-purple-200 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl",
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = "Card"

export { Card }
