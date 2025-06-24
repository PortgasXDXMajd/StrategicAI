import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useState, useEffect } from 'react';
import { Switch } from '../ui/switch';
import NodeService from '@/services/NodeService';

interface TaskCreationParams {
  isDialogOpen: boolean;
  setIsDialogOpen: (v: boolean) => void;
  nodeId: string;
}

const NodeVerificationDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  nodeId,
}: TaskCreationParams) => {
  const [fromFiles, setFromFiles] = useState(false);
  const [fromOnline, setFromOnline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFromFiles(false);
    setFromOnline(false);
    setError(null);
  };

  const onSubmit = async () => {
    // Manual validation
    if (!fromFiles && !fromOnline) {
      setError(
        'At least one verification source (Files or Online) must be selected.'
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      setIsDialogOpen(false);
      await NodeService.verifyNode(nodeId, fromFiles, fromOnline);
      resetForm();
    } catch (error) {
      console.error('Error verifying node:', error);
      setError('Failed to verify node. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isDialogOpen) {
      resetForm(); // Reset when dialog closes
    }
  }, [isDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="min-h-[50vh] max-h-fit min-w-[40vw] max-w-fit">
        <DialogHeader>
          <DialogTitle>Node Verification</DialogTitle>
          <DialogDescription>
            Verify and update the selected node and its subtree using data from
            user-uploaded files, online sources, or both.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full flex flex-col justify-between">
          <div>
            <h3 className="mb-4 text-lg font-medium">Verification Sources</h3>
            <div className="space-y-4">
              <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-1">
                  <label className="text-sm font-medium">From User Files</label>
                  <p className="text-sm text-muted-foreground">
                    Analyze user-uploaded files to update the explanations of
                    this node and its children with relevant data.
                  </p>
                </div>
                <Switch
                  checked={fromFiles}
                  onCheckedChange={setFromFiles}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    From Online Sources
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Search online sources to update the explanations of this
                    node and its children with relevant data.
                  </p>
                </div>
                <Switch
                  checked={fromOnline}
                  onCheckedChange={setFromOnline}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Verify Node'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NodeVerificationDialog;
