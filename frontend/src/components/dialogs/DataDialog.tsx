import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { FormField, FormItem, FormMessage } from '../ui/form';
import { FormControl } from '@mui/material';
import { Textarea } from '../ui/textarea';
import LoadingComponent from '../general/LoadingCompnent';
import Iconify from '../general/Iconify';

const schema = z.object({
  text: z.string(),
});

const defaultValues = {
  text: '',
};

interface DataDialogParams {
  onSave: (text: string | null, files: File[] | null) => void;
  onCancel: () => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (v: boolean) => void;
  title: string;
  description: string;
  isTextAreaNeeded?: boolean;
  saveButtonText?: string;
  isSkipNeeded?: boolean;
}

const DataDialog = ({
  onSave,
  onCancel,
  isDialogOpen,
  setIsDialogOpen,
  title,
  description,
  isTextAreaNeeded = true,
  saveButtonText = 'Save',
  isSkipNeeded = false,
}: DataDialogParams) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm({
    mode: 'onSubmit',
    defaultValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsLoading(true);

    try {
      await onSave(data.text, selectedFiles);
    } catch (error) {
      console.error('An error occurred: ', error);
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setSelectedFiles(selectedFiles.filter((file) => file.name !== fileName));
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files) {
      setSelectedFiles((prevFiles) => [
        ...prevFiles,
        ...Array.from(event.dataTransfer.files),
      ]);
    }
  };

  const handleSkip = () => {
    setIsLoading(true);
    onSave(form.getValues('text'), null);
    setIsLoading(false);
    setIsDialogOpen(false);
  };

  useEffect(() => {
    if (!isDialogOpen) {
      form.reset(defaultValues);
      setSelectedFiles([]);
    }
  }, [isDialogOpen, form]);

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={() => {
        setIsDialogOpen(false);
        onCancel();
      }}
    >
      <DialogContent className="max-h-fit min-w-[40vw] max-w-fit">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isTextAreaNeeded && (
              <FormField
                control={form.control}
                name={'text'}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormControl>
                      <Textarea
                        className="mt-2 resize-none h-[20vh]"
                        placeholder="Anything..."
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div
              className="file-upload mt-4 p-4 border-2 border-dashed rounded-lg text-center cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() =>
                document.getElementById('file-upload-input')?.click()
              }
            >
              <label htmlFor="file-upload-input" className="block font-medium">
                Upload Files
              </label>
              <input
                id="file-upload-input"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />
              <span className="text-gray-500">
                Click to upload or drag & drop your files here
              </span>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-red-100 text-blue-800 dark:text-red-800 text-sm border border-blue-300 dark:border-red-300"
                  >
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.name)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Iconify
                        icon="material-symbols:close-rounded"
                        size={16}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              {!isLoading && (
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Close
                  </Button>
                </DialogClose>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <LoadingComponent /> : saveButtonText}
              </Button>
              {isSkipNeeded && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSkip}
                  disabled={isLoading}
                >
                  Skip
                </Button>
              )}
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default DataDialog;
