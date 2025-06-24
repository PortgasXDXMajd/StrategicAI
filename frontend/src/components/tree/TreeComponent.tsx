import { RootState } from '@/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useCallback, useRef } from 'react';
import { setIsLoading } from '@/redux/tree/treeSlice';
import LoadingComponent from '../general/LoadingCompnent';
import TreeHelper from '@/redux/helpers/tree/TreeHelper';
import MainReactFlow, { MainReactFlowRef } from '../flow/MainFlowComponent';
import { ReactFlowProvider } from '@xyflow/react';
import TreeAnalysisHelper from '@/redux/helpers/tree_analysis/TreeAnalysisHelper';
import NodeHelper from '@/redux/helpers/node/NodeHelper';
import TaskHelper from '@/redux/helpers/task/TaskHelper';
import { setReactFlowInstance } from '@/redux/flow/flowSlice';
import { BASE_WSS } from '@/utils/environment_var';

const TreeComponent = () => {
  const dispatch = useDispatch();
  const treeState = useSelector((state: RootState) => state.trees);
  const selectedTree = treeState.selectedTree;
  const mainFlowRef = useRef<MainReactFlowRef>(null);

  useEffect(() => {
    if (mainFlowRef.current) {
      dispatch(
        setReactFlowInstance({
          fitView: mainFlowRef.current.fitView,
          centerNode: mainFlowRef.current.centerNode,
        })
      );
    } else {
      dispatch(setReactFlowInstance(null));
    }

    return () => {
      dispatch(setReactFlowInstance(null));
    };
  }, [dispatch]);

  const setupNotificationWebSocket = useCallback(() => {
    if (!selectedTree?.id) return null;

    const notificationQueue: any[] = [];
    let isProcessing = false;

    const processQueue = async () => {
      if (isProcessing || notificationQueue.length === 0) return;

      isProcessing = true;
      const notification = notificationQueue.shift();

      try {
        const uuidRegex =
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

        if (typeof notification === 'string') {
          if (uuidRegex.test(notification)) {
            NodeHelper.setNodeLoadingState(notification, true);
          } else if (notification === 'stop') {
            NodeHelper.resetNodeLoadingState();
            TreeAnalysisHelper.setAutoAssistantNotificationText('');
            TreeAnalysisHelper.setIsAutoAssistantRunning(false);
          } else if (notification === 'refresh') {
            TaskHelper.getTasks();
          } else if (notification === 'stop all') {
            NodeHelper.resetNodeLoadingState();
            TreeAnalysisHelper.setIsAutoAssistantRunning(false);
            TreeAnalysisHelper.setAutoAssistantNotificationText('');
          } else {
            TreeAnalysisHelper.setAutoAssistantNotificationText(notification);
          }
        } else {
          TreeAnalysisHelper.setIsAutoAssistantRunning(notification);
        }
      } catch (error) {
        console.error('Error processing notification:', error);
      } finally {
        isProcessing = false;
        processQueue();
      }
    };

    const ws = new WebSocket(`${BASE_WSS}/ws/${selectedTree.id}-notification`);

    ws.onopen = () => {
      console.log('Connected to Notification WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        notificationQueue.push(notification);
        processQueue();
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from Notification WebSocket');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }, [selectedTree?.id]);

  const setupTreeStructureWebSocket = useCallback(() => {
    if (!selectedTree?.id) return null;

    const ws = new WebSocket(`${BASE_WSS}/ws/${selectedTree.id}`);

    ws.onopen = () => {
      console.log('Connected to Tree Structure WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const treeStructure = JSON.parse(event.data);
        TreeHelper.real_time_reload(treeStructure, selectedTree);

        // if (mainFlowRef.current) {
        //   mainFlowRef.current.fitView();
        // }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from Tree Structure WebSocket');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }, [selectedTree?.id]);

  const fetchTreeStructure = useCallback(async () => {
    if (!selectedTree) return;

    dispatch(setIsLoading(true));
    try {
      await TreeHelper.reloadTree(selectedTree.id);
    } catch (error) {
      console.error('Error fetching tree structure:', error);
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [selectedTree, dispatch]);

  useEffect(() => {
    const treeSocket = setupTreeStructureWebSocket();
    return () => treeSocket?.close();
  }, [setupTreeStructureWebSocket]);

  useEffect(() => {
    const notificationSocket = setupNotificationWebSocket();
    return () => notificationSocket?.close();
  }, [setupNotificationWebSocket]);

  useEffect(() => {
    fetchTreeStructure();
  }, [fetchTreeStructure]);

  if (treeState.isLoading) {
    return <LoadingComponent />;
  }

  return (
    <ReactFlowProvider>
      <MainReactFlow ref={mainFlowRef} />
    </ReactFlowProvider>
  );
};

export default TreeComponent;
