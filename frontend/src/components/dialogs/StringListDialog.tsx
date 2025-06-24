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

interface RequiredDataDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  listString: string[];
}

const StringListDialog: React.FC<RequiredDataDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  listString,
}) => {
  const columns: ColumnDef<{ data: string }>[] = [
    {
      accessorKey: 'data',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {title}
          <Iconify size={12} icon="pepicons-pop:down-up" />
        </Button>
      ),
    },
  ];

  const data = listString.map((d) => ({ data: d }));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[50vw] h-fit">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center space-x-2">
              <Iconify icon="material-symbols:fact-check-outline-rounded" />
              <h4>{title}</h4>
            </div>
          </DialogTitle>
        </DialogHeader>
        {listString.length > 0 ? (
          <DataTable columns={columns} data={data} />
        ) : (
          <p className="text-center">No data available</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StringListDialog;
