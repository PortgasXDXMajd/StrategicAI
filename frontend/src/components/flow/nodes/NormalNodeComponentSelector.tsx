import React from 'react';
import { NodeProps } from '@xyflow/react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { TreeType } from '@/utils/types/tree';
import HypothesisNormalNode from './HypothesisNormalNode';
import NormalNode from './NormalNode';

const NodeComponentSelector = (props: NodeProps<any>) => {
  const selectedTree = useSelector(
    (state: RootState) => state.trees.selectedTree
  );

  if (selectedTree?.type === TreeType.HYPOTHESIS) {
    return <HypothesisNormalNode {...props} />;
  }

  return <NormalNode {...props} />;
};

export default NodeComponentSelector;
