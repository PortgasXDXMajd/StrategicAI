import React from 'react';
import { NodeProps, Handle, Position, Node } from '@xyflow/react';
import NodeOptions from './NodeOptions';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { NodeModel } from '@/utils/types/tree';

export type RootNode = Node<
  {
    node: NodeModel;
    layer: number;
  },
  'root-node'
>;

const RootNode = ({ id, data }: NodeProps<RootNode>) => {
  const nodeLoadingState = useSelector(
    (state: RootState) => state.node.loadingStates[id] ?? false
  );

  return (
    <NodeOptions key={id} node={data.node} layer={data.layer}>
      <div
        className={`flex flex-col items-center justify-between h-fit 
          min-w-[200px] max-w-[500px] border rounded-md p-2 bg-[#F9F9F9]
          border-[#D1D1D1] dark:bg-[#181818] dark:border-grey-200
          ${nodeLoadingState ? 'animate-flashing-border border' : ''}`}
        style={{
          borderWidth: '1px',
        }}
      >
        <p className="text-left text-md font-normal">{data.node.text}</p>
        <Handle type="source" position={Position.Right} />
      </div>
    </NodeOptions>
  );
};

export default RootNode;
