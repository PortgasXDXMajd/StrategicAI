import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Iconify from '../general/Iconify';
import ReactMarkdown from 'react-markdown';

interface InformationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  info: string;
  title?: string;
}

const InformationDialog: React.FC<InformationDialogProps> = ({
  isOpen,
  onOpenChange,
  info,
  title = 'More Information',
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center space-x-2">
              <Iconify icon={'si:info-fill'} />
              <h4>{title}</h4>
            </div>
          </DialogTitle>
        </DialogHeader>
        <p className="font-normal text-left">
          <ReactMarkdown>{info}</ReactMarkdown>
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InformationDialog;
