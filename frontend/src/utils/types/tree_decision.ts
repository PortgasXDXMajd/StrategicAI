import { HypothesisTreeDecision } from './hypothesis_tree_res';
import { Decision } from './tree_res';

export interface TreeDecision extends BaseEntity {
  tree_id: string;
  payload: Decision | HypothesisTreeDecision;
}
