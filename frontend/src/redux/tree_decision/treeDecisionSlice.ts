import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TreeDecision } from '@/utils/types/tree_decision';

interface TreeDecisionState {
  treeDecisions: Record<string, TreeDecision | undefined>;
}

const initialState: TreeDecisionState = {
  treeDecisions: {},
};

export const treeAnalysisSlice = createSlice({
  name: 'tree_decision',
  initialState,
  reducers: {
    logout: () => initialState,

    setTreeDecision: (
      state,
      action: PayloadAction<{ treeId: string; treeDecision?: TreeDecision }>
    ) => {
      const { treeId, treeDecision } = action.payload;
      state.treeDecisions[treeId] = treeDecision;
    },

    removeTreeDecision: (state, action: PayloadAction<{ treeId: string }>) => {
      const { treeId } = action.payload;
      delete state.treeDecisions[treeId];
    },
  },
});

export const { logout, setTreeDecision, removeTreeDecision } =
  treeAnalysisSlice.actions;

export default treeAnalysisSlice.reducer;
