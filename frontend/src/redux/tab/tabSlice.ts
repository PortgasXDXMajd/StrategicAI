import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Tab {
  id: string;
  title: string;
  type: 'task' | 'tree' | 'file';
}

interface TabsState {
  openTabs: Tab[];
  selectedTab: Tab | null;
}

const initialState: TabsState = {
  openTabs: [],
  selectedTab: null,
};

export const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    openTab: (state, action: PayloadAction<Tab>) => {
      const newTab = action.payload;
      if (
        !state.openTabs.some(
          (tab) => tab.id === newTab.id && tab.type === newTab.type
        )
      ) {
        state.openTabs.push(newTab);
      }
      state.selectedTab = newTab;
    },
    selectTab: (
      state,
      action: PayloadAction<{ id: string; type: 'task' | 'tree' | 'file' }>
    ) => {
      const { id, type } = action.payload;
      state.selectedTab =
        state.openTabs.find((tab) => tab.id === id && tab.type === type) ||
        null;
    },
    closeTab: (state, action: PayloadAction<string>) => {
      const tabId = action.payload;
      state.openTabs = state.openTabs.filter((tab) => tab.id !== tabId);
      if (state.selectedTab?.id === tabId) {
        state.selectedTab =
          state.openTabs.length > 0 ? state.openTabs[0] : null;
      }
    },
    closeAllTabs: (state) => {
      state.openTabs = [];
      state.selectedTab = null;
    },
    tabLogout: () => initialState,
  },
});

export const { openTab, selectTab, closeTab, tabLogout, closeAllTabs } =
  tabsSlice.actions;
export default tabsSlice.reducer;
