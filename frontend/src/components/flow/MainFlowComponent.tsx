import { forwardRef, useCallback, useImperativeHandle } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  Connection,
  EdgeChange,
  NodeChange,
  BackgroundVariant,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTheme } from '@/context/ThemeProvider';
import { nodeTypes } from './nodes/node_types';
import { RootState } from '@/redux/store';
import { setNodes, setEdges } from '@/redux/tree/treeSlice';
import { TreeType } from '@/utils/types/tree';
import SolutionGenerationActionToolbar from './SolutionGenerationActionToolBar';
import RootCauseActionToolbar from './RootCauseActionToolBar';
import HypothesisActionToolbar from './HypothesisActionToolBar';
import NotificationBanner from '../general/notification_banner';
import PotentialCandidates from './PotentialCandidates';

export interface MainReactFlowRef {
  fitView: () => void;
  centerNode: (id: string) => void;
}

const MainReactFlow = forwardRef<MainReactFlowRef>((props, ref) => {
  const reactFlowInstance = useReactFlow();

  useImperativeHandle(ref, () => ({
    fitView() {
      reactFlowInstance.fitView({ padding: 0.1 });
    },
    centerNode(id: string) {
      const node = reactFlowInstance.getNode(id);
      if (node) {
        reactFlowInstance.setCenter(node.position.x, node.position.y, {
          zoom: 1.5,
        });
      }
    },
  }));

  const dispatch = useDispatch();
  const treeAnalysisState = useSelector(
    (state: RootState) => state.treeAnalysis
  );
  const selectedTree = useSelector(
    (state: RootState) => state.trees.selectedTree
  );
  const selectedTreeId = selectedTree ? selectedTree.id : '';

  const currentNodes = useSelector(
    (state: RootState) => state.trees.allNodes[selectedTreeId],
    shallowEqual
  );
  const currentEdges = useSelector(
    (state: RootState) => state.trees.allEdges[selectedTreeId],
    shallowEqual
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, currentNodes);
      dispatch(setNodes({ treeId: selectedTreeId, n: updatedNodes }));
    },
    [dispatch, currentNodes, selectedTreeId]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, currentEdges);
      dispatch(setEdges({ treeId: selectedTreeId, e: updatedEdges }));
    },
    [dispatch, currentEdges, selectedTreeId]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const updatedEdges = addEdge(connection, currentEdges);
      dispatch(setEdges({ treeId: selectedTreeId, e: updatedEdges }));
    },
    [dispatch, currentEdges, selectedTreeId]
  );

  const { mode } = useTheme();

  return (
    <>
      <ReactFlow
        nodes={currentNodes}
        edges={currentEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        colorMode={mode === 'dark' ? 'dark' : 'light'}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls />
        {treeAnalysisState.isAutoAssistantRunning && (
          <Panel className="w-[65%]" position="top-left">
            <NotificationBanner
              text={treeAnalysisState.autoAssistantNotificationText}
            />
          </Panel>
        )}
        <Panel position="top-right">
          {(selectedTree?.type == TreeType.WHY ||
            selectedTree?.type == TreeType.HOW) && <PotentialCandidates />}
        </Panel>
        <Panel position="bottom-right">
          {selectedTree?.type == TreeType.WHY && <RootCauseActionToolbar />}
          {selectedTree?.type == TreeType.HOW && (
            <SolutionGenerationActionToolbar />
          )}
          {selectedTree?.type == TreeType.HYPOTHESIS && (
            <HypothesisActionToolbar />
          )}
        </Panel>
      </ReactFlow>
    </>
  );
});

export default MainReactFlow;
