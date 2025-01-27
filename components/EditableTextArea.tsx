import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface EditableTextAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onRemove?: () => void;
  showRemove?: boolean;
  placeholder?: string;
  className?: string;
  minRows?: number;
}

const EditableTextArea = ({
  value,
  onChange,
  onRemove,
  showRemove = true,
  placeholder = "",
  className = "",
  minRows = 1,
}: EditableTextAreaProps) => {
  return (
    <div className="flex gap-2 mb-2 w-full items-start">
      <Textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`min-h-[36px] h-9 py-1.5 whitespace-pre-wrap flex-1 resize-y ${className}`}
        rows={minRows}
      />
      {showRemove && onRemove && (
        <Button
          variant="outline"
          size="icon"
          onClick={onRemove}
          className="h-9 w-9 flex-shrink-0"
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default EditableTextArea;
