import RootNode from './RootNode';
import NormalNode from './NormalNode';
import HypothesisNormalNode from './HypothesisNormalNode';
import HypothesisRootNode from './HypothesisRootNode';

export const nodeTypes = {
  root: RootNode,
  normal: NormalNode,
  hypo: HypothesisNormalNode,
  rhypo: HypothesisRootNode,
};
