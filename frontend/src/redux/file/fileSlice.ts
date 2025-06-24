import { File } from '@/utils/types/file';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FileState {
  selectedFile: File | undefined;
  filesMapping: Record<string, File[]>;
}

const initialState: FileState = {
  selectedFile: undefined,
  filesMapping: {},
};

export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    selectFile: (state, action: PayloadAction<File>) => {
      const file = action.payload;
      state.selectedFile = file;
    },
    resetSelectedFile: (state) => {
      state.selectedFile = undefined;
    },
    fileLogout: () => initialState,

    setFiles: (state, action: PayloadAction<{ id: string; files: File[] }>) => {
      const { id, files } = action.payload;
      state.filesMapping[id] = files;
    },

    addFile: (state, action: PayloadAction<{ id: string; file: File }>) => {
      const { id, file } = action.payload;
      if (!state.filesMapping[id]) {
        state.filesMapping[id] = [];
      }
      state.filesMapping[id].push(file);
    },

    removeFile: (state, action: PayloadAction<{ id: string; file: File }>) => {
      const { id, file } = action.payload;
      const fileList = state.filesMapping[id];
      if (fileList) {
        state.filesMapping[id] = fileList.filter((f) => f.id !== file.id);
      }
    },
    removeFileById: (
      state,
      action: PayloadAction<{ id: string; fileId: string }>
    ) => {
      const { id, fileId } = action.payload;
      const fileList = state.filesMapping[id];
      if (fileList) {
        state.filesMapping[id] = fileList.filter((f) => f.id !== fileId);
      }
    },
    selectFileById: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      for (const fileList of Object.values(state.filesMapping)) {
        const file = fileList.find((f) => f.id === fileId);
        if (file) {
          state.selectedFile = file;
          return;
        }
      }
    },
    selectFileByTaskId: (
      state,
      action: PayloadAction<{ id: string; fileId: string }>
    ) => {
      const { id, fileId } = action.payload;
      const fileList = state.filesMapping[id];
      if (fileList) {
        const file = fileList.find((f) => f.id === fileId);
        state.selectedFile = file;
      } else {
        state.selectedFile = undefined;
      }
    },
  },
});

export const {
  selectFile,
  resetSelectedFile,
  fileLogout,
  setFiles,
  addFile,
  removeFileById,
  removeFile,
  selectFileById,
  selectFileByTaskId,
} = fileSlice.actions;

export default fileSlice.reducer;
