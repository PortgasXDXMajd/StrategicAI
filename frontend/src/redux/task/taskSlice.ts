import { Task } from '@/utils/types/task';
import { Tree } from '@/utils/types/tree';
import { File } from '@/utils/types/file';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TaskState {
  tasks: Task[];
  selectedTask: Task | undefined;
  continuationToken: string | null;
}

const initialState: TaskState = {
  tasks: [],
  selectedTask: undefined,
  continuationToken: null,
};

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setTasks: (
      state,
      action: PayloadAction<{
        tasks: Task[];
        continuationToken: string | null;
      }>
    ) => {
      state.tasks = action.payload.tasks;
      state.continuationToken = action.payload.continuationToken;
    },
    resetSelectedTask: (state) => {
      state.selectedTask = undefined;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (
      state,
      action: PayloadAction<{
        taskId: string;
        updatedTask: Task;
      }>
    ) => {
      const { taskId, updatedTask } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex] = updatedTask;
      }
    },
    addTreeToTask: (
      state,
      action: PayloadAction<{
        tree: Tree;
        taskId: string;
      }>
    ) => {
      const { tree, taskId } = action.payload;
      const task = state.tasks.find((task) => task.id === taskId);

      if (task) {
        if (!task.trees) {
          task.trees = [];
        }
        const treeExists = task.trees.some((t) => t.id === tree.id);
        if (!treeExists) {
          task.trees.push(tree);
        }
      }
    },
    addFileToTask: (
      state,
      action: PayloadAction<{
        file: File;
        taskId: string;
      }>
    ) => {
      const { file, taskId } = action.payload;
      const task = state.tasks.find((task) => task.id === taskId);

      if (task) {
        if (!task.files) {
          task.files = [];
        }
        const fileExists = task.files.some((t) => t.id === file.id);
        if (!fileExists) {
          task.files.push(file);
        }
      }
    },
    removeTreeFromTask: (
      state,
      action: PayloadAction<{
        treeId: string;
        taskId: string;
      }>
    ) => {
      const { treeId, taskId } = action.payload;
      const task = state.tasks.find((task) => task.id === taskId);

      if (task && task.trees) {
        task.trees = task.trees.filter((tree) => tree.id !== treeId);
      }
    },
    removeFileFromTask: (
      state,
      action: PayloadAction<{
        fileId: string;
        taskId: string;
      }>
    ) => {
      const { fileId, taskId } = action.payload;
      const task = state.tasks.find((task) => task.id === taskId);

      if (task && task.files) {
        task.files = task.files.filter((f) => f.id !== fileId);
      }
    },
    selectTask: (state, action: PayloadAction<string>) => {
      const selectedId = action.payload;
      const foundTask = state.tasks.find((task) => task.id === selectedId);
      state.selectedTask = foundTask;
    },
    unselectAllTasks: (state) => {
      state.selectedTask = undefined;
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      const taskId = action.payload;
      state.tasks = state.tasks.filter((task) => task.id !== taskId);
      if (state.selectedTask?.id === taskId) {
        state.selectedTask = undefined;
      }
    },
    taskLogout: () => initialState,
  },
});

export const {
  setTasks,
  addTask,
  selectTask,
  resetSelectedTask,
  addTreeToTask,
  removeTreeFromTask,
  addFileToTask,
  removeFileFromTask,
  deleteTask,
  taskLogout,
  unselectAllTasks,
  updateTask,
} = taskSlice.actions;

export default taskSlice.reducer;
