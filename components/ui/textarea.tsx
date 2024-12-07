import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  disabled?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ disabled, ...props }) => {
  return (
      <textarea
          className="form-textarea mt-1 block w-full"
          disabled={disabled}
          {...props}
      />
  );
};