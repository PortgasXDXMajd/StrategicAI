export interface File extends BaseEntity {
  facts: string[];
  file_name: string;
  task_id: string;
  tree_id: string;
  node_id: string;
  company_id: string;
}
