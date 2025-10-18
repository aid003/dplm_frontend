"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Input } from "./input";
import { Label } from "./label";

interface FileUploadProps {
  accept?: string;
  disabled?: boolean;
  selectedFileName?: string;
  onFileSelect: (file: File) => void;
  className?: string;
}

export function FileUpload({
  accept = ".zip",
  disabled = false,
  selectedFileName,
  onFileSelect,
  className = "",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.item(0);
    if (file) onFileSelect(file);
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (file) onFileSelect(file);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={className}>
      {selectedFileName && (
        <Label className="text-sm font-medium mb-2 block">
          Выбранный файл: {selectedFileName}
        </Label>
      )}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-dashed rounded-md p-6 transition-colors flex items-center gap-3 ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-input hover:bg-accent/40"
        } ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } border`}
      >
        <UploadCloud />
        <div className="flex-1">
          <div className="text-sm">
            Перетащите ZIP сюда или нажмите для выбора
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Допускается только .zip
          </div>
        </div>
      </div>
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleFileInputChange}
        className="sr-only"
      />
    </div>
  );
}
