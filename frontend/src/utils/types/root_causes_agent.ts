// Define the enum for method names.
export enum MethodName {
  ADD_NODE = 'add_node',
  EDIT_NODE = 'edit_node',
  DEL_NODE = 'delete_node',
  OUTPUT = 'communicate_with_user',
  SEARCH_ONLINE = 'search_online',
  STOP_EXECUTION = 'stop_execution',
}

export const EXECUTION_NEEDED: MethodName[] = [
  MethodName.ADD_NODE,
  MethodName.EDIT_NODE,
  MethodName.DEL_NODE,
  MethodName.SEARCH_ONLINE,
  MethodName.STOP_EXECUTION,
];

export interface NodeIdParam {
  node_id: string;
}

export interface NodeParam {
  text: string;
  explanation: string;
}

export interface AdditionParam extends NodeParam {
  parent_node_id: string;
}

export interface EditParam extends NodeIdParam, NodeParam {}

export interface MessageParam {
  message: string;
}

export interface OnlineSearchParam {
  query: string;
}

export type RootCauseAgentParams =
  | AdditionParam
  | EditParam
  | NodeIdParam
  | MessageParam
  | OnlineSearchParam
  | null;

export interface RootCauseAgentRT {
  method_name: MethodName;
  params: RootCauseAgentParams;
}
