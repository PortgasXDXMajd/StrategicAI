import { cn } from '@/lib/utils';
import Iconify from '../general/Iconify';
import { TooltipWrapper } from '../general/ToolTipWrapper';
import TreeAnalysisHelper from '@/redux/helpers/tree_analysis/TreeAnalysisHelper';
import DataDialog from '../dialogs/DataDialog';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useState } from 'react';
import HypothesisTreeDecisionDialog from '../dialogs/HypothesisTreeDecisionCreationDialog';
import { FloatingDock } from '../ui/floating-dock';

export default function HypothesisActionToolbar() {
  const [isDecisionUpsertDialogOpen, setIsDecisionUpsertDialogOpen] =
    useState(false);

  const [
    isDataDialogForAutoAssistantOpen,
    setIsDataDialogForAutoAssistantOpen,
  ] = useState(false);

  const selectedTree = useSelector(
    (state: RootState) => state.trees.selectedTree
  );

  const handleAutoAssistantRun = async (
    text: string | null,
    files: File[] | null
  ) => {
    setIsDataDialogForAutoAssistantOpen(false);
    await TreeAnalysisHelper.runHypothesisTesting(
      selectedTree!.id,
      text,
      files
    );
  };
  const links = [
    {
      title: 'Test Hypothesis',
      icon: (
        <ActionButton
          tooltip="Test Hypothesis"
          icon="ic:baseline-android"
          onClick={() => setIsDataDialogForAutoAssistantOpen(true)}
        />
      ),
      href: '#',
    },
    {
      title: 'Add/Edit Decision',
      icon: (
        <ActionButton
          tooltip="Add/Edit Decision"
          icon="ic:baseline-edit"
          onClick={() => {
            setIsDecisionUpsertDialogOpen(true);
          }}
        />
      ),
      href: '#',
    },
  ];
  return (
    <>
      <div>
        <FloatingDock items={links} />
      </div>
      <HypothesisTreeDecisionDialog
        isDialogOpen={isDecisionUpsertDialogOpen}
        setIsDialogOpen={() => setIsDecisionUpsertDialogOpen(false)}
      />
      <DataDialog
        onSave={handleAutoAssistantRun}
        onCancel={() => {}}
        isDialogOpen={isDataDialogForAutoAssistantOpen}
        setIsDialogOpen={setIsDataDialogForAutoAssistantOpen}
        title={'Additional Data (Optional)'}
        description={
          'Before you start the AUTO run, you can upload more data that might help the model.'
        }
        isTextAreaNeeded={false}
        saveButtonText="Upload"
        isSkipNeeded={true}
      />
    </>
  );
}

function ActionButton({
  tooltip,
  icon,
  onClick,
}: {
  tooltip: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <TooltipWrapper description={tooltip}>
      <button
        onClick={onClick}
        className="p-2 rounded-xl bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
      >
        <Iconify
          icon={icon}
          className="text-gray-700 dark:text-gray-300 text-xl"
        />
      </button>
    </TooltipWrapper>
  );
}

function Separator() {
  return <div className="w-px h-6 bg-gray-400 dark:bg-gray-600"></div>;
}
