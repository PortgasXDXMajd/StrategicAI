import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import TreeDecisionHelper from '@/redux/helpers/tree_decision/TreeAnalysisHelper';
import { Button } from '../ui/button';
import TreeHelper from '@/redux/helpers/tree/TreeHelper';
import { TreeType } from '@/utils/types/tree';
import LoadingComponent from '../general/LoadingCompnent';
import { Decision } from '@/utils/types/tree_res';
import Markdown from '../general/Markdown';

interface DecisionDisplayDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}

const TreeDecisionDisplayDialog = ({
  isDialogOpen,
  setIsDialogOpen,
}: DecisionDisplayDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingDecision, setIsDeletingDecision] = useState(false);
  const selectedTask = useSelector(
    (state: RootState) => state.task.selectedTask
  );
  const selectedTree = useSelector(
    (state: RootState) => state.trees.selectedTree
  );
  const existingDecision = useSelector(
    (state: RootState) => state.treeDecision.treeDecisions[selectedTree?.id!]
  );

  useEffect(() => {
    if (isDialogOpen) {
      const getDecision = async () => {
        await TreeDecisionHelper.get(selectedTree!.id);
      };
      getDecision();
    }
  }, [isDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-h-[80vh] min-w-[50vw] max-w-fit overflow-hidden">
        <DialogHeader>
          <div className="flex justify-between items-center pr-10">
            <DialogTitle>
              {selectedTree?.type == TreeType.WHY
                ? `Diagnostic Issue Tree Decision`
                : `Solutions Issue Tree Decision`}
            </DialogTitle>
            {existingDecision && (
              <div className="space-x-2">
                {selectedTree?.type == TreeType.WHY && (
                  <Button
                    disabled={isLoading}
                    onClick={async () => {
                      setIsLoading(true);
                      await TreeHelper.createTree(
                        selectedTask!.id,
                        TreeType.HOW
                      );
                      setIsLoading(false);
                      setIsDialogOpen(false);
                    }}
                  >
                    Start Solution Exploration
                  </Button>
                )}
                <Button
                  variant={'outline'}
                  onClick={async () => {
                    setIsDeletingDecision(true);
                    await TreeDecisionHelper.delete(selectedTree!);
                    setIsDeletingDecision(false);
                    setIsDialogOpen(false);
                  }}
                >
                  {isDeletingDecision ? (
                    <LoadingComponent text="Deleting..." />
                  ) : (
                    'Delete Decision'
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {existingDecision ? (
          <div className="h-full max-h-[70vh] overflow-y-auto space-y-6 pr-2">
            <div>
              <div className="space-y-4">
                {(existingDecision.payload as Decision).items.map(
                  (entry, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-3 shadow"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-medium">{entry.item}</h3>
                        <div className="text-sm text-gray-600">
                          <span className="font-bold">{entry.certainty}%</span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-700">
                        <Markdown text={entry.explanation} />
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No decision available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TreeDecisionDisplayDialog;
