import React from 'react';
import { NodeProps, Handle, Position, Node } from '@xyflow/react';
import NodeOptions from './NodeOptions';
import { NodeModel } from '@/utils/types/tree';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import Iconify from '@/components/general/Iconify';

export type HypothesisNode = Node<
  {
    node: NodeModel;
    layer: number;
  },
  'normal-node'
>;

const HypothesisNormalNode = ({ id, data }: NodeProps<HypothesisNode>) => {
  const nodeLoadingState = useSelector(
    (state: RootState) => state.node.loadingStates[id] ?? false
  );

  const borderColor =
    data.node.explanation === ''
      ? '#ffffff'
      : data.node.certainty >= 70
        ? '#32a852'
        : data.node.certainty >= 50
          ? '#ebc713'
          : '#f01a1a';

  const sanitizedExplanation = data.node.explanation
    .replace(/[^a-zA-Z0-9\s:]/g, '')
    .toLowerCase()
    .trim();

  const hasTrue = sanitizedExplanation.startsWith('true');
  const renderIcon = () => {
    if (sanitizedExplanation === '') {
      return (
        <div className="flex-1">
          <Iconify
            icon={'hugeicons:bubble-chat-question'}
            size={25}
            color="#3173de"
          />
        </div>
      );
    } else if (hasTrue) {
      return (
        <div className="flex-1">
          <Iconify
            icon={'ic:baseline-check-circle'}
            size={25}
            color="#32a852"
          />
        </div>
      );
    } else {
      return (
        <div className="flex-1">
          <Iconify icon={'mdi:close-circle'} size={25} color="#f01a1a" />
        </div>
      );
    }
  };
  return (
    <NodeOptions key={id} node={data.node} layer={data.layer}>
      <div
        className={`flex flex-col items-center justify-between h-fit 
          min-w-[200px] max-w-[500px] border rounded-md p-2
          bg-[#F9F9F9]
           dark:bg-[#181818]
          ${nodeLoadingState ? 'animate-flashing-border border-2' : ''}`}
        style={{
          borderColor: borderColor,
          borderWidth: '1px',
        }}
      >
        <Handle type="target" position={Position.Left} />
        <div className="flex items-center space-x-2">
          {renderIcon()}
          <p className="text-left text-md font-normal">
            {data.node.text}{' '}
            {sanitizedExplanation !== '' ? (
              <span className="font-semibold">({data.node.certainty}%)</span>
            ) : null}
          </p>
        </div>
        <Handle type="source" position={Position.Right} />
      </div>
    </NodeOptions>
  );
};

export default HypothesisNormalNode;
