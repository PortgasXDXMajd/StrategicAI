import store from '@/redux/store';
import TaskHelper from '../task/TaskHelper';
import {
  addMessage,
  logout,
  setIsAssistantOpen,
  setIsLoading,
  setIsTyping,
  setTreeAnalysis,
  setIsAutoAssistantRunning,
  setAutoNotificationText,
  setAssistantNotificationText,
} from '@/redux/tree_analysis/treeAnalysisSlice';
import {
  AnalysisActors,
  TreeAnalysis,
  TreeAnalysisHistory,
  UserChatInput,
  UserChatInputType,
} from '@/utils/types/tree_analysis';
import TreeAnalysisService from '@/services/TreeAnalysisService';
import TreeHelper from '../tree/TreeHelper';

class TreeAnalysisHelper {
  static async setIsAssistantOpen(isOpen: boolean) {
    store.dispatch(setIsAssistantOpen(isOpen));
  }

  static async setIsAutoAssistantRunning(isRunning: boolean) {
    store.dispatch(setIsAutoAssistantRunning(isRunning));
  }

  static async setAutoAssistantNotificationText(notiText: string) {
    store.dispatch(setAutoNotificationText(notiText));
  }

  static async setAssistantNotificationText(notiText: string) {
    store.dispatch(setAssistantNotificationText(notiText));
  }

  static async getOrCreate(treeId: string) {
    store.dispatch(setIsLoading(true));
    const treeAnalysis: TreeAnalysis | undefined =
      await TreeAnalysisService.createTreeAnalysis(treeId);

    if (treeAnalysis != undefined) {
      store.dispatch(setTreeAnalysis(treeAnalysis));
    }
    store.dispatch(setIsLoading(false));
  }

  static async createAutoAssistant(
    treeId: string,
    text: string | null,
    files: File[] | null
  ) {
    await TreeAnalysisService.createAutoTreeAnalysis(treeId, text, files);
    await TreeHelper.reloadTree(treeId);
  }

  static async add_message(
    tree_analysis_message: TreeAnalysisHistory | TreeAnalysisHistory[]
  ) {
    if (tree_analysis_message !== undefined) {
      if (Array.isArray(tree_analysis_message)) {
        tree_analysis_message.forEach((message) => {
          store.dispatch(addMessage(message));
        });
      } else {
        store.dispatch(addMessage(tree_analysis_message));
      }
    }
  }

  static async sendMessage(
    treeId: string,
    text: string | null,
    files: File[] | null
  ) {
    if (text !== null && text != '') {
      const userChatInput: UserChatInput = {
        type: UserChatInputType.TEXT,
        text: text,
        file: [],
      };

      const userMsg: TreeAnalysisHistory = {
        actor: AnalysisActors.USER,
        payload: userChatInput,
      };

      store.dispatch(addMessage(userMsg));
    }

    if (files !== null && files.length > 0) {
      files.forEach((file) => {
        const userChatInput: UserChatInput = {
          type: UserChatInputType.FILE,
          text: file.name,
          file: [],
        };
        const userFile: TreeAnalysisHistory = {
          actor: AnalysisActors.USER,
          payload: userChatInput,
        };
        store.dispatch(addMessage(userFile));
      });
    }

    store.dispatch(setIsTyping(true));

    const message: TreeAnalysisHistory | undefined =
      await TreeAnalysisService.sendMessage(treeId, text, files);

    if (message != null) {
      store.dispatch(addMessage(message));
    }

    store.dispatch(setIsTyping(false));
    if (files !== null && files.length > 0) {
      TaskHelper.getTasks();
    }
  }

  static async reset() {
    store.dispatch(logout());
  }

  static async runHypothesisTesting(
    treeId: string,
    text: string | null,
    files: File[] | null,
    nodeId?: string | null
  ) {
    await TreeAnalysisService.runHypothesisTesting(treeId, text, files, nodeId);
  }
}

export default TreeAnalysisHelper;
