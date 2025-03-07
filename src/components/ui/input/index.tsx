import * as React from "react"
import { cn } from "@/src/lib/utils"
import { inputStyles } from "./input.styles"
import { InputProps } from "./input.types"

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputStyles.base, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
