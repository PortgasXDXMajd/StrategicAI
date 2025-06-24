import { axios } from '@/utils/helpers/AxiosHelper';

interface NodeServicePayload {
  nodeId?: string;
  text?: string;
  certainty?: number;
  explanation?: string;
  parentNodeId?: string;
  treeId?: string;
  related_node_id?: string;
}

class NodeService {
  static async createNode({
    parentNodeId,
    text,
    certainty,
    explanation,
  }: NodeServicePayload): Promise<boolean> {
    try {
      const response = await axios.post('/node', {
        parent_node_id: parentNodeId,
        text,
        certainty,
        explanation,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  static async editNode({
    nodeId,
    text,
    certainty,
    explanation,
  }: NodeServicePayload): Promise<boolean> {
    try {
      const response = await axios.put('/node', {
        node_id: nodeId,
        text,
        certainty,
        explanation,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  static async deleteNode(
    nodeId: string,
    onlyChildren: boolean = false
  ): Promise<boolean> {
    try {
      const response = await axios.delete(
        `/node/${nodeId}?only_children=${onlyChildren}`
      );
      return response.status === 200;
    } catch {
      return false;
    }
  }

  static async decomposeNode({
    nodeId,
    treeId,
  }: NodeServicePayload): Promise<boolean> {
    try {
      const response = await axios.post(`/node/${nodeId}/decompose`, {
        tree_id: treeId,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
  static async verifyNode(
    nodeId: string,
    fromFiles: boolean,
    fromOnline: boolean
  ): Promise<boolean> {
    try {
      const response = await axios.post(`/node/${nodeId}/verify`, {
        from_files: fromFiles,
        from_online: fromOnline,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export default NodeService;
