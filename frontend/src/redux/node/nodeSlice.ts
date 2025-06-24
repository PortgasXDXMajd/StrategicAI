import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NodeState {
  loadingStates: { [nodeId: string]: boolean };
}

const initialState: NodeState = {
  loadingStates: {},
};

export const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    resetNodeLoading: (state, action: PayloadAction) => {
      for (const id in state.loadingStates) {
        state.loadingStates[id] = false;
      }
    },
    setIsNodeLoading: (
      state,
      action: PayloadAction<{ nodeId: string; isLoading: boolean }>
    ) => {
      const { nodeId, isLoading } = action.payload;

      if (isLoading) {
        for (const id in state.loadingStates) {
          state.loadingStates[id] = false;
        }
      }

      state.loadingStates[nodeId] = isLoading;
    },

    nodeLogout: () => initialState,
  },
});

export const { setIsNodeLoading, resetNodeLoading, nodeLogout } =
  nodeSlice.actions;

export default nodeSlice.reducer;
