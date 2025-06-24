import Iconify from '../general/Iconify';
import TreeAnalysisHelper from '@/redux/helpers/tree_analysis/TreeAnalysisHelper';
import TreeDecisionDisplayDialog from '../dialogs/TreeDecisionDisplayDialog';
import DataDialog from '../dialogs/DataDialog';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useState } from 'react';
import { FloatingDock } from '../ui/floating-dock';

export default function SolutionGenerationActionToolbar() {
  const [isDecisionDisplayDialogOpen, setIsDecisionDisplayDialogOpen] =
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
    await TreeAnalysisHelper.createAutoAssistant(selectedTree!.id, text, files);
  };
  const links = [
    {
      title: 'Agent Chat',
      icon: (
        <ActionButton
          icon="mingcute:ai-line"
          onClick={() => {
            TreeAnalysisHelper.getOrCreate(selectedTree?.id!);
            TreeAnalysisHelper.setIsAssistantOpen(true);
          }}
        />
      ),
      href: '#',
    },
    {
      title: 'Auto Run',
      icon: (
        <ActionButton
          icon="ic:baseline-android"
          onClick={() => setIsDataDialogForAutoAssistantOpen(true)}
        />
      ),
      href: '#',
    },
    {
      title: 'Show Decision',
      icon: (
        <ActionButton
          icon="mingcute:eye-2-fill"
          onClick={() => setIsDecisionDisplayDialogOpen(true)}
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
      <TreeDecisionDisplayDialog
        isDialogOpen={isDecisionDisplayDialogOpen}
        setIsDialogOpen={() => setIsDecisionDisplayDialogOpen(false)}
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
  icon,
  onClick,
}: {
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-xl bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
    >
      <Iconify
        icon={icon}
        className="text-gray-700 dark:text-gray-300 text-xl"
      />
    </button>
  );
}
