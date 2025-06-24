import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FlowState {
  fitView?: () => void;
  centerNode?: (id: string) => void;
}

const initialState: FlowState = {};

const flowSlice = createSlice({
  name: 'flow',
  initialState,
  reducers: {
    setReactFlowInstance: (
      state,
      action: PayloadAction<{
        fitView: () => void;
        centerNode: (id: string) => void;
      } | null>
    ) => {
      console.log('Setting the functions');
      if (action.payload) {
        state.fitView = action.payload.fitView;
        state.centerNode = action.payload.centerNode;
      } else {
        state.fitView = undefined;
        state.centerNode = undefined;
      }
    },
  },
});

export const { setReactFlowInstance } = flowSlice.actions;
export default flowSlice.reducer;
