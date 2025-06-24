import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Iconify from '../general/Iconify';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../general/DataTable';

interface FileFactDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  fileName: string;
  facts: string[];
}

const columns: ColumnDef<{ fact: string }>[] = [
  {
    accessorKey: 'fact',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Facts
          <Iconify size={12} icon="pepicons-pop:down-up" />
        </Button>
      );
    },
  },
];

const FileFactDialog: React.FC<FileFactDialogProps> = ({
  isOpen,
  onOpenChange,
  fileName,
  facts,
}) => {
  const data = facts.map((fact) => ({ fact }));
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[50vw] h-fit">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center space-x-2">
              <Iconify icon={'material-symbols:fact-check-outline-rounded'} />
              <h4>Extracted Facts: {fileName}</h4>
            </div>
          </DialogTitle>
        </DialogHeader>
        <DataTable columns={columns} data={data} />
      </DialogContent>
    </Dialog>
  );
};

export default FileFactDialog;
