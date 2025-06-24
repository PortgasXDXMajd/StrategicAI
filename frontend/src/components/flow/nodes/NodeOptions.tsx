import React, { ReactElement, useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import NodeDialog from '@/components/dialogs/NodeEditDialog';
import Iconify from '@/components/general/Iconify';
import InformationDialog from '@/components/dialogs/InformationDialog';
import { NodeOptionService } from './services/NodeOptionService';
import { NodeModel, NodeType, TreeType } from '@/utils/types/tree';
import StringListDialog from '@/components/dialogs/StringListDialog';
import TreeAnalysisHelper from '@/redux/helpers/tree_analysis/TreeAnalysisHelper';
import DataDialog from '@/components/dialogs/DataDialog';
import NodeService from '@/services/NodeService';
import NodeVerificationDialog from '@/components/dialogs/NodeVerificationDialog';

interface NodeOptionsParams {
  node: NodeModel;
  layer: number;
  children: ReactElement;
}

const NodeOptions = ({ node, layer, children }: NodeOptionsParams) => {
  const selectedTree = useSelector(
    (state: RootState) => state.trees.selectedTree
  );
  const treeType = selectedTree?.type;
  const nodeLoadingState = useSelector(
    (state: RootState) => state.node.loadingStates[node.id] ?? false
  );

  const [isEditingDialogOpen, setIsEditingDialogOpen] = useState(false);
  const [isVerificationNodeOpen, setIsVerificationNodeOpen] = useState(false);
  const [isAddingDialogOpen, setIsAddingDialogOpen] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isRequiredDataDialogOpen, setIsRequiredDataDialogOpen] =
    useState(false);

  const [
    isDataDialogForHypothesisTestingRunOpen,
    setIsDataDialogForHypothesisTestingRunOpen,
  ] = useState(false);

  const handleHypothesisTestingRun = async (
    text: string | null,
    files: File[] | null
  ) => {
    setIsDataDialogForHypothesisTestingRunOpen(false);
    await TreeAnalysisHelper.runHypothesisTesting(
      selectedTree!.id,
      text,
      files,
      node.id
    );
  };

  const renderHowTreeOptions = () => (
    <>
      {node.type === 'normal' && layer == 1 && (
        <ContextMenuItem
          className="space-x-3"
          inset
          onClick={async () =>
            await NodeOptionService.handleCreateTreeClick(
              node.id,
              selectedTree!.task_id,
              TreeType.HYPOTHESIS
            )
          }
        >
          <Iconify icon={'academicons:ideas-repec'} />
          <div>Validate Solution</div>
        </ContextMenuItem>
      )}
      {node.type === 'normal' && layer == 1 && (
        <ContextMenuItem
          className="space-x-3"
          inset
          onClick={async () =>
            await NodeOptionService.handleToggleNodeDecisionClick(
              node.id,
              selectedTree!
            )
          }
        >
          <Iconify
            icon={
              node.is_part_decision
                ? 'material-symbols:remove-from-queue-rounded'
                : 'material-symbols:add-to-queue-rounded'
            }
          />
          <div>
            {node.is_part_decision
              ? `Remove from Solutions`
              : `Mark as Solution`}
          </div>
        </ContextMenuItem>
      )}
    </>
  );
  const renderWhyTreeOptions = () => (
    <>
      {node.type === 'normal' && (
        <ContextMenuItem
          className="space-x-3"
          inset
          onClick={async () =>
            await NodeOptionService.handleCreateTreeClick(
              node.id,
              selectedTree!.task_id,
              TreeType.HOW
            )
          }
        >
          <Iconify icon={'academicons:ideas-repec'} />
          <div>Explore Solutions</div>
        </ContextMenuItem>
      )}
      {node.type === 'normal' && (
        <ContextMenuItem
          className="space-x-3"
          inset
          onClick={async () =>
            await NodeOptionService.handleToggleNodeDecisionClick(
              node.id,
              selectedTree!
            )
          }
        >
          <Iconify
            icon={
              node.is_part_decision
                ? 'material-symbols:remove-from-queue-rounded'
                : 'material-symbols:add-to-queue-rounded'
            }
          />
          <div>
            {node.is_part_decision
              ? `Remove from Root Causes`
              : `Mark as Root Cause`}
          </div>
        </ContextMenuItem>
      )}
    </>
  );

  const renderVerifyOption = () => (
    <>
      <ContextMenuItem
        className="space-x-3"
        inset
        onClick={() => setIsVerificationNodeOpen(true)}
      >
        <Iconify icon={'material-symbols:find-in-page-rounded'} />
        <div>Verify</div>
      </ContextMenuItem>
    </>
  );

  const renderHypothesisTreeOptions = () => (
    <>
      {
        <>
          <ContextMenuItem
            className="space-x-3"
            inset
            onClick={() => setIsInfoDialogOpen(true)}
          >
            <Iconify icon={'si:info-fill'} />
            <div>Show Answer</div>
          </ContextMenuItem>
          <ContextMenuItem
            className="space-x-3"
            inset
            onClick={() => {
              setIsRequiredDataDialogOpen(true);
            }}
          >
            <Iconify icon={'ic:round-format-list-numbered'} />
            <div>Show Required Data</div>
          </ContextMenuItem>
          <ContextMenuItem
            className="space-x-3"
            inset
            onClick={async () => {
              setIsDataDialogForHypothesisTestingRunOpen(true);
            }}
          >
            <Iconify icon="ic:baseline-android" />
            <div>Run Hypothesis Test</div>
          </ContextMenuItem>
        </>
      }
    </>
  );

  const renderExplanationOption = () => (
    <>
      <ContextMenuItem
        className="space-x-3"
        inset
        onClick={() => setIsInfoDialogOpen(true)}
      >
        <Iconify icon={'material-symbols-light:info'} />
        <div>Show Explanation</div>
      </ContextMenuItem>
    </>
  );
  const renderDecomposeOption = () => (
    <>
      <ContextMenuItem
        className="space-x-3"
        inset
        onClick={async () =>
          await NodeOptionService.handleNodeDecomposeClick(
            node.id,
            selectedTree!
          )
        }
      >
        <Iconify icon={'vaadin:split'} />
        <div>Decompose Node</div>
      </ContextMenuItem>
    </>
  );

  const renderBasicOptions = () => (
    <ContextMenuSub>
      <ContextMenuSubTrigger inset>
        <div className="flex space-x-3">
          <Iconify icon={'bi:tools'} />
          <div>Basic</div>
        </div>
      </ContextMenuSubTrigger>
      <ContextMenuSubContent className="w-48">
        <ContextMenuItem
          className="space-x-3"
          inset
          onClick={() => setIsAddingDialogOpen(true)}
        >
          <Iconify icon={'basil:add-outline'} />
          <div>Insert Child</div>
        </ContextMenuItem>
        <ContextMenuItem
          className="space-x-3"
          inset
          onClick={() => setIsEditingDialogOpen(true)}
        >
          <Iconify icon={'basil:edit-outline'} />
          <div>Edit</div>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="space-x-3"
          inset
          onClick={async () =>
            await NodeOptionService.handleNodeDeleteClick(
              node.id,
              selectedTree!,
              true
            )
          }
        >
          <Iconify icon={'material-symbols:delete-sweep-rounded'} />
          <div>Delete Children</div>
        </ContextMenuItem>
        <ContextMenuItem
          className="space-x-3"
          inset
          onClick={async () =>
            await NodeOptionService.handleNodeDeleteClick(
              node.id,
              selectedTree!,
              false
            )
          }
        >
          <Iconify icon={'ic:round-delete'} />
          <div>Delete</div>
        </ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  );

  return (
    <div>
      <ContextMenu modal={false}>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          {node.type == NodeType.NORMAL && renderExplanationOption()}
          {treeType !== TreeType.HYPOTHESIS && renderDecomposeOption()}
          {treeType !== TreeType.HYPOTHESIS && renderVerifyOption()}
          {treeType === TreeType.WHY && renderWhyTreeOptions()}
          {treeType === TreeType.HOW && renderHowTreeOptions()}
          {treeType === TreeType.HYPOTHESIS && renderHypothesisTreeOptions()}
          <ContextMenuSeparator />
          {renderBasicOptions()}
        </ContextMenuContent>
      </ContextMenu>

      <NodeDialog
        type="edit"
        isOpen={isEditingDialogOpen}
        isLoading={nodeLoadingState}
        onOpenChange={setIsEditingDialogOpen}
        onSave={async (
          newLabel: string,
          certainty: number,
          explanation: string
        ) => {
          await NodeOptionService.handleNodeEditSave(
            node.id,
            selectedTree!,
            newLabel,
            certainty,
            explanation
          );
        }}
        text={node.text}
        explanation={node.explanation}
        certainty={node.certainty}
      />
      <NodeDialog
        type="add"
        isOpen={isAddingDialogOpen}
        isLoading={nodeLoadingState}
        onOpenChange={setIsAddingDialogOpen}
        onSave={async (
          newLabel: string,
          certainty: number,
          explanation: string
        ) => {
          await NodeOptionService.handleAddChildSave(
            node.id,
            selectedTree!,
            newLabel,
            certainty,
            explanation
          );
        }}
      />
      <InformationDialog
        isOpen={isInfoDialogOpen}
        onOpenChange={setIsInfoDialogOpen}
        info={node.explanation}
        title={
          selectedTree?.type == TreeType.HYPOTHESIS
            ? 'Node Answer'
            : 'Explanation'
        }
      />
      <StringListDialog
        isOpen={isRequiredDataDialogOpen}
        onOpenChange={setIsRequiredDataDialogOpen}
        title={'Required Data'}
        listString={node.required_data ?? []}
      />
      <DataDialog
        onSave={handleHypothesisTestingRun}
        isDialogOpen={isDataDialogForHypothesisTestingRunOpen}
        setIsDialogOpen={setIsDataDialogForHypothesisTestingRunOpen}
        title={'Additional Data (Optional)'}
        description={
          'Before you start hypothesis testing, you can upload more data that might help the model.'
        }
        isTextAreaNeeded={false}
        saveButtonText="Upload"
        isSkipNeeded={true}
        onCancel={() => {}}
      />
      <NodeVerificationDialog
        isDialogOpen={isVerificationNodeOpen}
        setIsDialogOpen={setIsVerificationNodeOpen}
        nodeId={node.id}
      />
    </div>
  );
};

export default NodeOptions;
