import { configureStore } from '@reduxjs/toolkit';
import companyReducer from './company/companySlice';
import taskReducer from './task/taskSlice';
import tabReducer from './tab/tabSlice';
import treeReducer from './tree/treeSlice';
import nodeReducer from './node/nodeSlice';
import fileReducer from './file/fileSlice';
import treeAnalysisReducer from './tree_analysis/treeAnalysisSlice';
import treeDecisionReducer from './tree_decision/treeDecisionSlice';
import flowReducer from './flow/flowSlice';

const store = configureStore({
  reducer: {
    company: companyReducer,
    task: taskReducer,
    tabs: tabReducer,
    trees: treeReducer,
    node: nodeReducer,
    file: fileReducer,
    treeAnalysis: treeAnalysisReducer,
    treeDecision: treeDecisionReducer,
    flow: flowReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
