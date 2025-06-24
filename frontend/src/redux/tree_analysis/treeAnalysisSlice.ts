import { TreeAnalysis, TreeAnalysisHistory } from '@/utils/types/tree_analysis';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TreeAnalysisState {
  treeAnalysis: TreeAnalysis | undefined;
  isAssistantOpen: boolean;
  isLoading: boolean;
  isAutoAssistantRunning: boolean;
  isTyping: boolean;
  assistantNotificationText: string;
  autoAssistantNotificationText: string;
}

const initialState: TreeAnalysisState = {
  treeAnalysis: undefined,
  isAssistantOpen: false,
  isAutoAssistantRunning: false,
  isLoading: false,
  isTyping: false,
  assistantNotificationText: '',
  autoAssistantNotificationText: '',
};

export const treeAnalysisSlice = createSlice({
  name: 'tree_analysis',
  initialState,
  reducers: {
    logout: () => initialState,

    addMessage: (state, action: PayloadAction<TreeAnalysisHistory>) => {
      if (state.treeAnalysis) {
        state.treeAnalysis.history.push(action.payload);
      }
    },
    setAutoNotificationText: (state, action: PayloadAction<string>) => {
      state.autoAssistantNotificationText = action.payload;
    },
    setAssistantNotificationText: (state, action: PayloadAction<string>) => {
      state.assistantNotificationText = action.payload;
    },
    setIsAutoAssistantRunning: (state, action: PayloadAction<boolean>) => {
      state.isAutoAssistantRunning = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setIsAssistantOpen: (state, action: PayloadAction<boolean>) => {
      state.isAssistantOpen = action.payload;
    },
    setTreeAnalysis: (state, action: PayloadAction<TreeAnalysis>) => {
      state.treeAnalysis = action.payload;
    },
    resetTreeAnalysis: (state) => {
      state.treeAnalysis = undefined;
      state.isAssistantOpen = false;
    },
  },
});

export const {
  logout,
  setIsLoading,
  addMessage,
  setTreeAnalysis,
  setIsAssistantOpen,
  setIsAutoAssistantRunning,
  setIsTyping,
  resetTreeAnalysis,
  setAutoNotificationText,
  setAssistantNotificationText,
} = treeAnalysisSlice.actions;
export default treeAnalysisSlice.reducer;
