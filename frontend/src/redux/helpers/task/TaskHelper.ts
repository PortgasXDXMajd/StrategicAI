import store from '@/redux/store';
import {
  addTreeToTask,
  removeFileFromTask,
  removeTreeFromTask,
  resetSelectedTask,
  selectTask,
  setTasks,
  updateTask,
} from '@/redux/task/taskSlice';
import TaskService from '@/services/TaskService';
import { Task } from '@/utils/types/task';
import { Tree } from '@/utils/types/tree';
import FileHelper from '../file/FileHelper';

class TaskHelper {
  static setTasks(tasks: Task[]) {
    store.dispatch(
      setTasks({
        tasks: tasks,
        continuationToken: null,
      })
    );
    tasks.forEach((t) => {
      FileHelper.setFiles(t.id, t.files);
    });
  }

  static selectTask(taskId: string) {
    store.dispatch(selectTask(taskId));
  }

  static addTreeToTask(taskId: string, tree: Tree) {
    store.dispatch(
      addTreeToTask({
        tree: tree,
        taskId: taskId,
      })
    );
  }
  static async resetSelectedTask() {
    store.dispatch(resetSelectedTask());
  }
  static removeTreeFormTask(tree: Tree) {
    store.dispatch(
      removeTreeFromTask({ treeId: tree.id, taskId: tree.task_id })
    );
  }
  static removeFileFormTask(fileId: string, taskId: string) {
    store.dispatch(removeFileFromTask({ fileId, taskId }));
  }

  static async getTasks() {
    const tasks = await TaskService.getTasks();
    if (tasks) {
      this.setTasks(tasks);
    }
  }
  static async getTask(taskId: string) {
    const task = await TaskService.getTaskById(taskId);
    if (task) {
      store.dispatch(
        updateTask({
          updatedTask: task,
          taskId: taskId,
        })
      );
      this.selectTask(task.id);
    }
  }
}

export default TaskHelper;
