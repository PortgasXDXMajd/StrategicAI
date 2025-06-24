import { axios } from '@/utils/helpers/AxiosHelper';
import { NodeModel, Tree, TreeType } from '@/utils/types/tree';

class TreeService {
  static async getTreeStructure(
    treeId: string
  ): Promise<NodeModel | undefined> {
    const res = await axios.get(`/tree/${treeId}/structure`);

    if (res.status === 200) {
      const rootNode: NodeModel = res.data.body;
      return rootNode;
    }

    return undefined;
  }
  static async createTree(
    taskId: string,
    treeType: TreeType,
    nodeId?: string
  ): Promise<Tree[] | undefined> {
    const res = await axios.post(`/tree`, {
      task_id: taskId,
      type: treeType,
      node_id: nodeId,
    });
    if (res.status === 200) {
      const createdTrees: Tree[] = res.data.body;
      return createdTrees;
    }

    return undefined;
  }
  static async getTreesByRelatedNodeId(
    nodeId: string,
    type: TreeType
  ): Promise<Tree[] | undefined> {
    const res = await axios.get(`/tree?related_node_id=${nodeId}&type=${type}`);

    if (res.status === 200) {
      const trees: Tree[] = res.data.body;
      return trees;
    }

    return undefined;
  }
  static async delete(treeId: string): Promise<boolean | undefined> {
    const res = await axios.delete(`/tree/${treeId}`);

    if (res.status === 200) {
      return res.data.body;
    }

    return undefined;
  }
  static async getPotentialCandidates(
    tree_id: string
  ): Promise<any[] | undefined> {
    const res = await axios.get(`/tree/${tree_id}/potential-candidates`);

    if (res.status === 200) {
      const candidates: any[] = res.data.body;
      return candidates;
    }

    return undefined;
  }
}

export default TreeService;
