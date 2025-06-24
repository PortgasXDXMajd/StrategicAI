import store from '@/redux/store';
import { logout } from '@/redux/tree_analysis/treeAnalysisSlice';
import { setTreeDecision } from '@/redux/tree_decision/treeDecisionSlice';
import TreeDecisionService from '@/services/TreeDecisionService';
import TreeHelper from '../tree/TreeHelper';
import { Tree } from '@/utils/types/tree';

class TreeDecisionHelper {
  static async upsert(treeId: string, payload: any) {
    const createdDecision = await TreeDecisionService.createTreeDecision(
      treeId,
      payload
    );
    if (createdDecision) {
      store.dispatch(
        setTreeDecision({
          treeId: treeId,
          treeDecision: createdDecision,
        })
      );
    }
  }

  static async get(treeId: string) {
    const res = await TreeDecisionService.getByTreeId(treeId);
    store.dispatch(
      setTreeDecision({
        treeId: treeId,
        treeDecision: res,
      })
    );
    return undefined;
  }

  static async delete(tree: Tree) {
    const res = await TreeDecisionService.deleteByTreeId(tree.id);
    await TreeHelper.reloadTree(tree.id);
    if (res) {
      store.dispatch(
        setTreeDecision({
          treeId: tree.id,
          treeDecision: undefined,
        })
      );
      return res;
    }
    return undefined;
  }

  static reset() {
    store.dispatch(logout());
  }
}

export default TreeDecisionHelper;
