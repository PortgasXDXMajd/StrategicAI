import { axios } from '@/utils/helpers/AxiosHelper';
import { TreeAnalysis, TreeAnalysisHistory } from '@/utils/types/tree_analysis';

class TreeAnalysisService {
  static async getTreeAnalysis(id: string): Promise<TreeAnalysis | undefined> {
    const res = await axios.get(`/tree-analysis/${id}`);

    if (res.status === 200) {
      const treeAnalysis: TreeAnalysis = res.data.body;
      return treeAnalysis;
    }
    return undefined;
  }

  static async getTreeAnalysisByTreeId(
    treeId: string
  ): Promise<TreeAnalysis | undefined> {
    const res = await axios.get(`/tree/${treeId}/tree-analysis`);

    if (res.status === 200) {
      const treeAnalysis: TreeAnalysis = res.data.body;
      return treeAnalysis;
    }
    return undefined;
  }

  static async createTreeAnalysis(
    treeId: string
  ): Promise<TreeAnalysis | undefined> {
    const res = await axios.post(`/tree-analysis`, {
      tree_id: treeId,
    });
    if (res.status === 200) {
      const treeAnalysis: TreeAnalysis = res.data.body;
      return treeAnalysis;
    }

    return undefined;
  }

  static async createAutoTreeAnalysis(
    treeId: string,
    text: string | null,
    files: File[] | null
  ): Promise<boolean | undefined> {
    const formData = new FormData();
    formData.append('tree_id', treeId);

    if (text) {
      formData.append('text', text);
    }

    if (files) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const res = await axios.post(`/tree-analysis/auto`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (res.status === 200) {
      return res.data.body;
    }

    return undefined;
  }

  static async sendMessage(
    treeId: string,
    text: string | null,
    files: File[] | null
  ): Promise<TreeAnalysisHistory | undefined> {
    const formData = new FormData();

    if (text) {
      formData.append('text', text);
    }

    if (files) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await axios.post(
      `/tree-analysis/${treeId}/send`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.status === 200) {
      const res = response.data.body;
      return res;
    }
    return undefined;
  }

  static async runHypothesisTesting(
    treeId: string,
    text: string | null,
    files: File[] | null,
    nodeId?: string | null
  ): Promise<boolean | undefined> {
    const formData = new FormData();
    formData.append('tree_id', treeId);

    if (text) {
      formData.append('text', text);
    }

    if (files) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    if (nodeId) {
      formData.append('node_id', nodeId);
    }

    const res = await axios.post(
      `/tree-analysis/hypothesis-testing`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    if (res.status === 200) {
      return res.data.body;
    }

    return undefined;
  }
}

export default TreeAnalysisService;
