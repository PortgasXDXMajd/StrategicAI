export enum TreeActionType {
  MESSAGE = 'message',
  DECISION = 'decision',
}

export interface DecisionItem {
  item: string;
  explanation: string;
  certainty: number;
  node_id: string;
}

export interface Decision {
  items: DecisionItem[];
}

export interface TreeMessage {
  message: string;
}

export interface TreeActionResponseRT {
  is_action_needed: boolean;
  action_type: TreeActionType;
  payload: TreeMessage | Decision;
}
