import {
  removeFileById,
  resetSelectedFile,
  selectFile,
  selectFileById,
  setFiles,
} from '@/redux/file/fileSlice';
import store from '@/redux/store';
import { addFileToTask } from '@/redux/task/taskSlice';
import FileService from '@/services/FileService';
import { File as FileModel } from '@/utils/types/file';
import TaskHelper from '../task/TaskHelper';
import TabHelper from '../tab/TabHelper';

class FileHelper {
  static seletctFile(file: FileModel) {
    store.dispatch(selectFile(file));
  }
  static seletctFileById(fileId: string) {
    store.dispatch(selectFileById(fileId));
  }
  static resetSelectedFile() {
    store.dispatch(resetSelectedFile());
  }
  static setFiles(taskId: string, files: FileModel[]) {
    store.dispatch(setFiles({ id: taskId, files }));
  }
  static async delete(taskId: string, fileId: string) {
    const res = await FileService.delete(fileId);
    if (res) {
      store.dispatch(removeFileById({ id: taskId, fileId }));
      TabHelper.closeTab(fileId);
      TaskHelper.removeFileFormTask(fileId, taskId);
    }
  }
  static async create(taskId: string, files: File[] | null) {
    const createdFiles = await FileService.createFiles(taskId, files);
    createdFiles?.forEach((file) =>
      store.dispatch(addFileToTask({ file, taskId }))
    );
  }
}

export default FileHelper;
