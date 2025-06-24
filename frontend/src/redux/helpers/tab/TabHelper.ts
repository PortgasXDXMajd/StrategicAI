import store from '@/redux/store';
import { closeAllTabs, closeTab, openTab } from '@/redux/tab/tabSlice';
import { resetTreeAnalysis } from '@/redux/tree_analysis/treeAnalysisSlice';
import TreeHelper from '../tree/TreeHelper';
import TaskHelper from '../task/TaskHelper';
import FileHelper from '../file/FileHelper';

class TabHelper {
  static openTab(id: string, title: string, type: 'task' | 'tree' | 'file') {
    store.dispatch(
      openTab({
        id: id,
        title: title,
        type: type,
      })
    );
  }
  static closeTab(id: string) {
    const openedTabs = store.getState().tabs.openTabs;
    const selectedTree = store.getState().trees.selectedTree;
    const selectedTask = store.getState().task.selectedTask;
    const selectedFile = store.getState().file.selectedFile;

    const closedTab = openedTabs.find((tab) => tab.id === id);
    if (!closedTab) {
      return;
    }
    const ta_state = store.getState().treeAnalysis;
    if (ta_state.treeAnalysis?.tree_id === id) {
      store.dispatch(resetTreeAnalysis());
    }
    store.dispatch(closeTab(id));

    if (closedTab.type === 'tree' && closedTab.id === selectedTree?.id) {
      TreeHelper.resetSelectedTree();
    } else if (closedTab.type === 'task' && closedTab.id === selectedTask?.id) {
      TaskHelper.resetSelectedTask();
    } else if (closedTab.type === 'file' && closedTab.id === selectedFile?.id) {
      FileHelper.resetSelectedFile();
    }
    const selectedTab = store.getState().tabs.selectedTab;
    if (selectedTab?.type === 'tree') {
      TreeHelper.selectTreeById(selectedTab.id);
    } else if (selectedTab?.type === 'task') {
      TaskHelper.selectTask(selectedTab.id);
    } else if (selectedTab?.type === 'file') {
      FileHelper.seletctFileById(selectedTab.id);
    }
  }

  static closeAll() {
    store.dispatch(closeAllTabs());
    TreeHelper.resetSelectedTree();
    TaskHelper.resetSelectedTask();
    FileHelper.resetSelectedFile();
  }
}

export default TabHelper;
