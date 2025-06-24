import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { TreeType } from '@/utils/types/tree';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import LoadingComponent from '../general/LoadingCompnent';

interface NodeDialogProps {
  type: 'edit' | 'add';
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  text?: string;
  certainty?: number;
  explanation?: string;
  onSave: (text: string, c: number, ex: string) => void;
  isLoading: boolean;
}

const NodeDialog: React.FC<NodeDialogProps> = ({
  type,
  isOpen,
  onOpenChange,
  text: initialText = '',
  certainty: initialCertainty = 0,
  explanation: initialExplanation = '',
  onSave,
  isLoading,
}) => {
  const selectedTree = useSelector(
    (state: RootState) => state.trees.selectedTree
  );
  const [textToEdit, setTextToEdit] = useState(initialText);
  const [certaintyToEdit, setCertaintyToEdit] = useState(initialCertainty);
  const [explanationToEdit, setExplanationToEdit] =
    useState(initialExplanation);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTextToEdit(initialText);
    setCertaintyToEdit(initialCertainty);
    setExplanationToEdit(initialExplanation);
  };

  const handleSave = () => {
    onSave(textToEdit, certaintyToEdit, explanationToEdit);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-h-[50vh] max-h-fit min-w-[40vw] max-w-fit">
        <DialogHeader>
          <DialogTitle>
            {type === 'edit' ? `Edit Node` : `Add Child Node`}
          </DialogTitle>
        </DialogHeader>
        <Textarea
          value={textToEdit}
          onChange={(e) => setTextToEdit(e.target.value)}
          className="mt-4"
          placeholder="Enter Node Label"
        />
        {selectedTree!.type !== TreeType.HYPOTHESIS && (
          <>
            <div className="mt-4 space-y-5">
              <label className="block text-sm font-medium">
                Certainty ({certaintyToEdit}%)
              </label>
              <Slider
                value={[certaintyToEdit]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value: any) => setCertaintyToEdit(value[0])}
              />
            </div>
            <Textarea
              value={explanationToEdit}
              onChange={(e) => setExplanationToEdit(e.target.value)}
              className="mt-4 resize-none h-[30vh]"
              placeholder="Enter Node Explanation"
            />
          </>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isLoading ? <LoadingComponent /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NodeDialog;
