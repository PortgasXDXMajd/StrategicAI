import { axios } from '@/utils/helpers/AxiosHelper';
import { TreeDecision } from '@/utils/types/tree_decision';
import { Decision } from '@/utils/types/tree_res';

class TreeDecisionService {
  static async get(id: string): Promise<TreeDecision | undefined> {
    const res = await axios.get(`/tree-decision/${id}`);

    if (res.status === 200) {
      const treeDecision: TreeDecision = res.data.body;
      return treeDecision;
    }
    return undefined;
  }
  static async getByTreeId(treeId: string): Promise<TreeDecision | undefined> {
    const res = await axios.get(`/tree/${treeId}/tree-decision`);

    if (res.status === 200) {
      const treeDecision: TreeDecision = res.data.body;
      return treeDecision;
    }
    return undefined;
  }

  static async deleteByTreeId(treeId: string): Promise<boolean | undefined> {
    const res = await axios.delete(`/tree-decision/tree/${treeId}`);

    if (res.status === 200) {
      const isDeleted: boolean = res.data.body;
      return isDeleted;
    }
    return undefined;
  }

  static async createTreeDecision(
    treeId: string,
    payload: Decision
  ): Promise<TreeDecision | undefined> {
    const res = await axios.post(`/tree-decision`, {
      tree_id: treeId,
      payload: payload,
    });
    if (res.status === 200) {
      const treeDecision: TreeDecision = res.data.body;
      return treeDecision;
    }

    return undefined;
  }
  static async toggleNodeAsDecision({
    nodeId,
  }: {
    nodeId: string;
  }): Promise<TreeDecision | undefined> {
    try {
      const res = await axios.post(`/tree-decision/toggle-decision`, {
        node_id: nodeId,
      });
      if (res.status === 200) {
        const treeDecision: TreeDecision = res.data.body;
        return treeDecision;
      }
    } catch {
      return undefined;
    }
  }
}

export default TreeDecisionService;
