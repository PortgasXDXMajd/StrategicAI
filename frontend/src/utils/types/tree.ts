export enum TreeType {
  WHY = 'why',
  HOW = 'how',
  HYPOTHESIS = 'hypothesis',
}

export enum NodeType {
  ROOT = 'root',
  RHYPO = 'rhypo',
  NORMAL = 'normal',
  HYPO = 'hypo',
}

export interface Tree extends BaseEntity {
  title: string;
  type: TreeType;
  task_id: string;
  root_node_id: string;
  related_node_id: string | null;
}

export interface NodeModel extends BaseEntity {
  tree_id: string;
  text: string;
  explanation: string;
  certainty: number;
  type: NodeType;
  children: NodeModel[];
  parent_id?: string;
  is_related_to_diff_tree: boolean;
  related_tree_id?: string;
  is_part_decision?: boolean;
  required_data?: string[];
}
