import Iconify from '../general/Iconify';
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
import LoadingComponent from '../general/LoadingCompnent';
import { useState } from 'react';

interface DeleteConfiramtionDialogParams {
  text?: string;
  isDialogOpen: boolean;
  setIsDialogOpen: (v: boolean) => void;
  onDelete: () => void;
}
const DeleteConfiramtionDialog = ({
  text,
  onDelete,
  isDialogOpen,
  setIsDialogOpen,
}: DeleteConfiramtionDialogParams) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-h-fit max-w-[50vh]">
        <DialogHeader>
          <DialogTitle>Delete</DialogTitle>
          <DialogDescription>
            <p>
              Are you sure you want to delete <strong>{text ?? ''}</strong>?
            </p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button
            onClick={async () => {
              setIsLoading(true);
              await onDelete();
              setIsLoading(false);
              setIsDialogOpen(false);
            }}
            disabled={isLoading}
          >
            {isLoading ? <LoadingComponent /> : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfiramtionDialog;
