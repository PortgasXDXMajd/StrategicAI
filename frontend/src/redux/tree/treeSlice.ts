import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Edge, Node } from '@xyflow/react';
import { NodeModel, Tree } from '@/utils/types/tree';
import { TreeTransformer } from '@/utils/helpers/TreeTransformer';

interface TreeState {
  trees: Tree[];
  selectedTree: Tree | undefined;
  allNodes: { [treeId: string]: Node[] };
  allEdges: { [treeId: string]: Edge[] };
  isReloadingNeeded: { [treeId: string]: boolean };
  isLoading: boolean;
}

const initialState: TreeState = {
  trees: [],
  selectedTree: undefined,
  allNodes: {},
  allEdges: {},
  isReloadingNeeded: {},
  isLoading: false,
};

export const treeSlice = createSlice({
  name: 'tree',
  initialState,
  reducers: {
    selectTree: (state, action: PayloadAction<Tree>) => {
      const selectedTree = action.payload;
      const treeExists = state.trees.some(
        (tree) => tree.id === selectedTree.id
      );
      if (!treeExists) {
        state.trees.push(selectedTree);
      }
      state.selectedTree = selectedTree;
    },
    resetSelectedTree: (state) => {
      state.selectedTree = undefined;
    },
    selectTreeById: (state, action: PayloadAction<string>) => {
      state.selectedTree =
        state.trees.find((tree) => tree.id === action.payload) || undefined;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setNodes: (state, action: PayloadAction<{ treeId: string; n: Node[] }>) => {
      state.allNodes[action.payload.treeId] = action.payload.n;
    },
    setEdges: (state, action: PayloadAction<{ treeId: string; e: Edge[] }>) => {
      state.allEdges[action.payload.treeId] = action.payload.e;
    },
    setIsReloadNeeded: (state, action: PayloadAction<{ treeId: string }>) => {
      state.isReloadingNeeded[action.payload.treeId] = true;
    },
    loadTreeNodesAndEdges: (
      state,
      action: PayloadAction<{ treeId: string; rootNode?: NodeModel }>
    ) => {
      const { treeId, rootNode } = action.payload;
      if (rootNode) {
        const { nodes, edges } = TreeTransformer.transformTree(rootNode);

        state.allNodes[treeId] = nodes;
        state.allEdges[treeId] = edges;
      } else {
        state.allNodes[treeId] = [];
        state.allEdges[treeId] = [];
      }
      state.isReloadingNeeded[treeId] = false;
    },
    updateNodeLabel: (
      state,
      action: PayloadAction<{
        treeId: string;
        nodeId: string;
        label: string;
        certainty: number;
        explanation: string;
      }>
    ) => {
      const { treeId, nodeId, label, certainty, explanation } = action.payload;
      const nodes = state.allNodes[treeId];
      if (nodes) {
        state.allNodes[treeId] = nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  text: label,
                  certainty: certainty,
                  explanation: explanation,
                },
              }
            : node
        );
      }
      state.isReloadingNeeded[treeId] = true;
    },
    treeLogout: () => initialState,
  },
});

export const {
  selectTree,
  resetSelectedTree,
  setIsLoading,
  setNodes,
  setEdges,
  loadTreeNodesAndEdges,
  treeLogout,
  updateNodeLabel,
  setIsReloadNeeded,
  selectTreeById,
} = treeSlice.actions;

export default treeSlice.reducer;
