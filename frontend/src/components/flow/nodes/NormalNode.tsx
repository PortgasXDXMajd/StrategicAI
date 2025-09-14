import React from 'react';
import { NodeProps, Handle, Position, Node } from '@xyflow/react';
import NodeOptions from './NodeOptions';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { NodeModel, TreeType } from '@/utils/types/tree';
import TreeHelper from '@/redux/helpers/tree/TreeHelper';

export type NormalNode = Node<
  {
    node: NodeModel;
    layer: number;
  },
  'normal-node'
>;

const NormalNode = ({ id, data }: NodeProps<NormalNode>) => {
  const nodeLoadingState = useSelector(
    (state: RootState) => state.node.loadingStates[id] ?? false
  );

  const openHypothesisTree = async (nodeId: string) => {
    await TreeHelper.selectTreeByRelatedNodeId(nodeId, TreeType.HYPOTHESIS);
  };
  const openHowTree = async (nodeId: string) => {
    await TreeHelper.selectTreeByRelatedNodeId(nodeId, TreeType.HOW);
  };

  const selectedTree = useSelector(
    (state: RootState) => state.trees.selectedTree
  );

  const borderColor =
    data.node.certainty >= 80
      ? '#32a852'
      : data.node.certainty >= 60
        ? '#ebc713'
        : '#f01a1a';

  return (
    <NodeOptions key={id} node={data.node} layer={data.layer}>
      <div
        className={`flex flex-col items-center justify-between h-fit 
          min-w-[200px] max-w-[500px] border rounded-md p-2
          bg-[#F9F9F9] dark:bg-[#181818]
          ${nodeLoadingState ? 'animate-flashing-border border-1' : ''}
          ${data.node.is_part_decision ? 'shadow-[0_4px_20px_rgba(37,100,235,0.6)] dark:shadow-[0_4px_20px_rgba(255,74,74,0.6)]' : ''}`}
        style={{
          borderColor: borderColor,
          borderWidth: '1px',
        }}
      >
        <Handle type="target" position={Position.Left} />
        <div className="flex flex-col">
          <p className="text-left text-md font-bold">
            {data.node.text}
            {' '}
            <span className="font-semibold">({data.node.certainty}%)</span>
          </p>
          <div className="pt-2 pb-2">
            <hr />
          </div>
          <p className="text-left text-[8px] text-gray-600 font-extralight">
            {`${data.node.explanation.split(' ').slice(0, 12).join(' ')}...`}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {data.node.is_related_to_diff_tree &&
              selectedTree!.type === TreeType.HOW && (
                <a
                  href="#"
                  onClick={() => openHypothesisTree(data.node.id)}
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-600 font-semibold"
                >
                  [Hypothesis Tree]
                </a>
              )}
            {data.node.is_related_to_diff_tree &&
              selectedTree!.type === TreeType.WHY && (
                <a
                  href="#"
                  onClick={() => openHowTree(data.node.id)}
                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-600 font-semibold"
                >
                  [How Tree]
                </a>
              )}
          </p>
        </div>
        <Handle type="source" position={Position.Right} />
      </div>
    </NodeOptions>
  );
};

export default NormalNode;
