import React, { useEffect, useRef, ChangeEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
}

const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  value,
  onChange,
  placeholder = "Type your message here...",
  minHeight = "80px",
  maxHeight = "600px",
  className,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextarea = (): void => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";

      // Get the computed max height value
      const computedMaxHeight = parseInt(maxHeight);

      // Calculate new height
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, parseInt(minHeight)),
        computedMaxHeight
      );

      // Set the new height
      textarea.style.height = `${newHeight}px`;

      // Enable scrolling if content exceeds maxHeight
      textarea.style.overflowY =
        textarea.scrollHeight > computedMaxHeight ? "auto" : "hidden";
    }
  };

  // Resize on value change
  useEffect(() => {
    resizeTextarea();
  }, [value]);

  // Resize on window resize
  useEffect(() => {
    const handleResize = (): void => {
      resizeTextarea();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn("resize-none transition-height duration-200", className)}
      style={{
        minHeight,
        maxHeight,
      }}
      {...props}
    />
  );
};

export default AutoResizeTextarea;
