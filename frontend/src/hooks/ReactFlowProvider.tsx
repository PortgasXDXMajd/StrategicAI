import React, { createContext, useContext, useRef } from 'react';
import { ReactFlowInstance, useReactFlow } from '@xyflow/react';

interface ReactFlowContextProps {
  centerNode: (nodeId: string) => void;
}

const ReactFlowContext = createContext<ReactFlowContextProps | null>(null);

export const ReactFlowProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const reactFlowInstance = useReactFlow();

  const centerNode = (nodeId: string) => {
    if (!reactFlowInstance) return;

    const node = reactFlowInstance.getNode(nodeId);
    if (node) {
      reactFlowInstance.setCenter(node.position.x, node.position.y, {
        zoom: 1.5,
      });
    }
  };

  return (
    <ReactFlowContext.Provider value={{ centerNode }}>
      {children}
    </ReactFlowContext.Provider>
  );
};

export const useReactFlowContext = () => {
  const context = useContext(ReactFlowContext);
  if (!context) {
    throw new Error(
      'useReactFlowContext must be used within a ReactFlowProvider'
    );
  }
  return context;
};
