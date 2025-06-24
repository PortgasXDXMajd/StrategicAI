import store from '@/redux/store';
import {
  loadTreeNodesAndEdges,
  resetSelectedTree,
  selectTree,
  selectTreeById,
  setIsReloadNeeded,
} from '@/redux/tree/treeSlice';
import TreeService from '@/services/TreeService';
import { NodeModel, Tree, TreeType } from '../../../utils/types/tree';
import TaskHelper from '../task/TaskHelper';
import TabHelper from '../tab/TabHelper';

class TreeHelper {
  static async selectTree(tree: Tree) {
    store.dispatch(selectTree(tree));
  }
  static async selectTreeById(treeId: string) {
    store.dispatch(selectTreeById(treeId));
  }
  static async resetSelectedTree() {
    store.dispatch(resetSelectedTree());
  }

  static async reloadTree(treeId: string) {
    const rootNode = await TreeService.getTreeStructure(treeId);
    store.dispatch(
      loadTreeNodesAndEdges({
        treeId: treeId,
        rootNode: rootNode,
      })
    );
  }

  static async deleteTree(tree?: Tree) {
    const res = await TreeService.delete(tree!.id ?? '');
    if (res) {
      TabHelper.closeTab(tree!.id);
      TaskHelper.removeTreeFormTask(tree!);
    }
  }

  static real_time_reload(rootNode: NodeModel, tree?: Tree) {
    store.dispatch(
      loadTreeNodesAndEdges({
        treeId: tree?.id!,
        rootNode: rootNode,
      })
    );
  }

  static async createTree(taskId: string, treeType: TreeType, nodeId?: string) {
    const createdTrees = await TreeService.createTree(taskId, treeType, nodeId);

    if (createdTrees && createdTrees.length > 0) {
      createdTrees.forEach((tree) => {
        TaskHelper.addTreeToTask(taskId, tree);
      });

      const firstTree = createdTrees[0];
      TabHelper.openTab(firstTree.id, `${firstTree.title}`, 'tree');
      this.selectTree(firstTree);
    }
  }

  static async setIsReloadNeeded(treeId: string) {
    store.dispatch(
      setIsReloadNeeded({
        treeId: treeId,
      })
    );
  }

  static async selectTreeByRelatedNodeId(nodeId: string, treeType: TreeType) {
    const state = store.getState();
    const trees = state.trees.trees;

    let relatedTree = trees.find((tree) => tree.related_node_id === nodeId);

    if (!relatedTree) {
      try {
        const fetchedTrees = await TreeService.getTreesByRelatedNodeId(
          nodeId,
          treeType
        );

        if (fetchedTrees && fetchedTrees.length > 0) {
          relatedTree = fetchedTrees[0];

          this.selectTree(relatedTree);
        } else {
          throw new Error('No trees found for the given node ID');
        }
      } catch (error) {
        console.error('Error fetching trees by related node ID:', error);
        return;
      }
    }

    TabHelper.openTab(relatedTree.id, `${relatedTree.title}`, 'tree');
    await this.selectTree(relatedTree);
  }
}

export default TreeHelper;
