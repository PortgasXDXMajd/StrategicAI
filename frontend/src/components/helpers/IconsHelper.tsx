import { TaskType } from '@/utils/types/task';
import { TreeType } from '@/utils/types/tree';

export const getTaskIconByType = (type: string) => {
  switch (type) {
    case TaskType.PROBLEM:
      return '🛑';
    case TaskType.GOAL:
      return '🎯';
    case TaskType.HYPOTHESIS:
      return '🤔';
    default:
      return '📄';
  }
};

export const getTreeIconByType = (type: string) => {
  switch (type) {
    case TreeType.WHY:
      return '🔎';
    case TreeType.HOW:
      return '🛠️';
    case TreeType.HYPOTHESIS:
      return '💭';
    default:
      return '📄';
  }
};
