import NodeHelper from '@/redux/helpers/node/NodeHelper';
import TreeHelper from '@/redux/helpers/tree/TreeHelper';
import NodeService from '@/services/NodeService';
import TreeDecisionService from '@/services/TreeDecisionService';
import { Tree, TreeType } from '@/utils/types/tree';
import { toast } from 'sonner';

export class NodeOptionService {
  static handleNodeDecomposeClick = async (nodeId: string, tree: Tree) => {
    NodeHelper.setNodeLoadingState(nodeId, true);

    try {
      const isDecomposed = await NodeService.decomposeNode({
        nodeId: nodeId,
        treeId: tree!.id ?? '',
      });

      if (isDecomposed) {
        await TreeHelper.reloadTree(tree.id);
      }
    } catch (e) {
      toast.error('there was an error updating the node');
    } finally {
      NodeHelper.setNodeLoadingState(nodeId, false);
    }
  };

  static handleToggleNodeDecisionClick = async (nodeId: string, tree: Tree) => {
    NodeHelper.setNodeLoadingState(nodeId, true);

    try {
      const treeDecision = await TreeDecisionService.toggleNodeAsDecision({
        nodeId: nodeId,
      });
      await TreeHelper.reloadTree(tree.id);
    } catch (e) {
      toast.error('there was an error toggling the node');
    } finally {
      NodeHelper.setNodeLoadingState(nodeId, false);
    }
  };

  static handleNodeEvaluateClick = (nodeId: string) => {
    NodeHelper.setNodeLoadingState(nodeId, true);
  };

  static handleAddChildSave = async (
    nodeId: string,
    tree: Tree,
    newLabel: string,
    certainty: number,
    explanation: string
  ) => {
    NodeHelper.setNodeLoadingState(nodeId, true);

    try {
      const isCreated = await NodeService.createNode({
        parentNodeId: nodeId,
        text: newLabel,
        certainty: certainty,
        explanation: explanation,
      });

      if (isCreated) {
        await TreeHelper.reloadTree(tree.id);
      }
    } catch (e) {
      toast.error('there was an error updating the node');
    } finally {
      NodeHelper.setNodeLoadingState(nodeId, false);
    }
  };

  static handleNodeEditSave = async (
    nodeId: string,
    tree: Tree,
    newLabel: string,
    certainty: number,
    explanation: string
  ) => {
    NodeHelper.setNodeLoadingState(nodeId, true);

    try {
      const isEdited = await NodeService.editNode({
        nodeId: nodeId,
        text: newLabel,
        certainty: certainty,
        explanation: explanation,
      });

      if (isEdited) {
        await TreeHelper.reloadTree(tree.id);
      }
    } catch (e) {
      toast.error('there was an error updating the node');
    } finally {
      NodeHelper.setNodeLoadingState(nodeId, false);
    }
  };

  static handleNodeDeleteClick = async (
    nodeId: string,
    tree: Tree,
    onlyChildren: boolean = false
  ) => {
    NodeHelper.setNodeLoadingState(nodeId, true);

    try {
      const isDeleted = await NodeService.deleteNode(nodeId, onlyChildren);

      if (isDeleted) {
        await TreeHelper.reloadTree(tree.id);
      }
    } catch (e) {
      toast.error('there was an error deleting the node');
    } finally {
      NodeHelper.setNodeLoadingState(nodeId, false);
    }
  };

  static handleCreateTreeClick = async (
    nodeId: string,
    taskId: string,
    treeType: TreeType
  ) => {
    NodeHelper.setNodeLoadingState(nodeId, true);

    try {
      await TreeHelper.createTree(taskId, treeType, nodeId);
    } catch (e) {
      toast.error('there was an error creating a how tree');
    } finally {
      NodeHelper.setNodeLoadingState(nodeId, false);
    }
  };
}
