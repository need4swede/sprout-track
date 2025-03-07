import * as React from "react"
import { cn } from "@/src/lib/utils"
import { textareaStyles } from "./textarea.styles"
import { TextareaProps } from "./textarea.types"

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaStyles.base, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
