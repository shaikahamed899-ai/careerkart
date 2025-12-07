"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload,
  Add as AddIcon,
  InsertDriveFile,
  PictureAsPdf,
  Close,
} from "@mui/icons-material";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useUIStore } from "@/store/uiStore";

interface UploadedFile {
  name: string;
  size: number;
  uploadedAt: Date;
}

export function ResumeUploadModal() {
  const { isResumeUploadOpen, closeResumeUpload } = useUIStore();
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const progress = step === 1 ? 60 : 100;
  const progressText =
    step === 1 ? "We Are Almost Done" : "Bravo! we are set to go.";

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = (file: File) => {
    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF, DOC, or DOCX file");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    setUploadedFile({
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
    });
    setStep(2);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setStep(1);
  };

  const handleContinue = () => {
    // Handle continue action
    console.log("Continue with:", { uploadedFile, linkedinUrl });
    closeResumeUpload();
  };

  const formatFileSize = (bytes: number) => {
    return `${Math.round(bytes / 1024)}KB`;
  };

  return (
    <Dialog
      open={isResumeUploadOpen}
      onClose={closeResumeUpload}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "rounded-2xl",
      }}
    >
      <DialogContent className="p-8 relative">
        <IconButton
          onClick={closeResumeUpload}
          className="absolute top-4 right-4 text-grey-500"
        >
          <CloseIcon />
        </IconButton>

        {/* Progress Section */}
        <div className="bg-grey-50 dark:bg-grey-800 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <Typography variant="subtitle1" className="font-semibold">
              Complete Your Profile
            </Typography>
            <Typography variant="subtitle1" className="font-semibold">
              {progress}%
            </Typography>
          </div>
          <div className="flex gap-2 mb-2">
            <div className="flex-1 h-2 rounded-full bg-success-500" />
            <div
              className={`flex-1 h-2 rounded-full ${
                step >= 2 ? "bg-success-500" : "bg-grey-300 dark:bg-grey-600"
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full ${
                step >= 3 ? "bg-success-500" : "bg-grey-300 dark:bg-grey-600"
              }`}
            />
          </div>
          <Typography
            variant="body2"
            className="text-grey-600 dark:text-grey-400"
          >
            {progressText}
          </Typography>
        </div>

        {/* Upload Section */}
        <Typography variant="h6" className="font-semibold mb-4">
          Upload your Resume
        </Typography>

        {!uploadedFile ? (
          /* Upload Dropzone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : "border-grey-300 dark:border-grey-700 bg-primary-50/50 dark:bg-primary-900/10"
            }`}
          >
            <CloudUpload className="text-grey-400 text-4xl mb-4" />
            <Typography
              variant="body1"
              className="text-grey-600 dark:text-grey-400 mb-4"
            >
              Browse and choose the files you want to upload from your computer
            </Typography>
            <label htmlFor="resume-upload">
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <IconButton
                component="span"
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <AddIcon />
              </IconButton>
            </label>
          </div>
        ) : (
          /* Uploaded File Display */
          <div className="border border-grey-200 dark:border-grey-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Typography
                variant="body2"
                className="text-grey-600 dark:text-grey-400"
              >
                File Uploaded
              </Typography>
              <Typography
                variant="body2"
                className="text-grey-600 dark:text-grey-400"
              >
                {formatFileSize(uploadedFile.size)}
              </Typography>
            </div>
            <div className="flex items-center gap-3 p-3 bg-grey-50 dark:bg-grey-800 rounded-lg">
              <div className="w-12 h-12 bg-error-100 dark:bg-error-900/30 rounded-lg flex items-center justify-center">
                <PictureAsPdf className="text-error-500" />
              </div>
              <div className="flex-1">
                <Typography variant="subtitle2" className="font-medium">
                  {uploadedFile.name}
                </Typography>
                <Typography
                  variant="caption"
                  className="text-grey-500"
                >
                  {formatFileSize(uploadedFile.size)} • Uploaded on{" "}
                  {uploadedFile.uploadedAt.toLocaleDateString()}
                </Typography>
              </div>
              <IconButton
                size="small"
                onClick={handleRemoveFile}
                className="text-grey-500 hover:text-error-500"
              >
                <Close fontSize="small" />
              </IconButton>
            </div>
          </div>
        )}

        <Typography
          variant="caption"
          className="text-grey-500 mt-2 block"
        >
          DOC, DOCX, PDF (2 MB)
        </Typography>

        {/* LinkedIn Section */}
        <Typography variant="h6" className="font-semibold mt-6 mb-2">
          LinkedIn Profile Link(optional)
        </Typography>
        <TextField
          placeholder="https://www.linkedin.com/in/user-untiteled/"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          fullWidth
        />

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            className="flex-1"
            onClick={closeResumeUpload}
          >
            I Don&apos;t have Resume
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleContinue}
            disabled={!uploadedFile}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
