import { Tree } from './tree';
import { File } from './file';
import { TreeDecision } from './tree_decision';

export enum TaskType {
  PROBLEM = 'problem',
  GOAL = 'goal',
  HYPOTHESIS = 'hypothesis',
}

export interface Task extends BaseEntity {
  title: string;
  user_description: string;
  type: TaskType;
  company_id: string;
  trees: Tree[];
  files: File[];
  root_cause_analysis: TreeDecision | null;
  hypotheses_tested: TreeDecision[] | null;
  how_trees_decisions: TreeDecision[] | null;
}
