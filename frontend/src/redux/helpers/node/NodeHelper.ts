import { resetNodeLoading, setIsNodeLoading } from '@/redux/node/nodeSlice';
import store from '@/redux/store';
import { updateNodeLabel } from '@/redux/tree/treeSlice';

class NodeHelper {
  static async editNodeLabel(
    treeId: string,
    nodeId: string,
    newLabel: string,
    newCertainity: number,
    newExplanation: string
  ) {
    store.dispatch(
      updateNodeLabel({
        treeId: treeId,
        nodeId: nodeId,
        label: newLabel,
        certainty: newCertainity,
        explanation: newExplanation,
      })
    );
  }
  static setNodeLoadingState(nodeId: string, isLoading: boolean) {
    store.dispatch(
      setIsNodeLoading({
        nodeId: nodeId,
        isLoading: isLoading,
      })
    );
  }
  static resetNodeLoadingState() {
    store.dispatch(resetNodeLoading());
  }
}

export default NodeHelper;
