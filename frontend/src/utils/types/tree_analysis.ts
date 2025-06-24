import { RootCauseAgentRT } from './root_causes_agent';
import { TreeActionResponseRT } from './tree_res';

export enum UserChatInputType {
  TEXT = 'text',
  FILE = 'file',
}

export interface UserChatInput {
  text: string;
  file: string[];
  type: UserChatInputType;
}

export enum AnalysisActors {
  SYSTEM = 'system',
  USER = 'user',
}
export type AnalysisHistoryPayload =
  | UserChatInput
  | TreeActionResponseRT
  | RootCauseAgentRT;

export interface TreeAnalysisHistory {
  actor: AnalysisActors;
  payload: AnalysisHistoryPayload;
}

export interface TreeAnalysis extends BaseEntity {
  tree_id: string;
  history: TreeAnalysisHistory[];
}
