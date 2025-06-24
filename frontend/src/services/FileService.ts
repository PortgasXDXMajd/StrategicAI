import { axios } from '@/utils/helpers/AxiosHelper';
import { File as FileModel } from '@/utils/types/file';

class FileService {
  static async getFileById(fileId: string): Promise<FileModel | undefined> {
    const res = await axios.get(`/file/${fileId}`);

    if (res.status === 200) {
      const file: FileModel = res.data.body;
      return file;
    }

    return undefined;
  }

  static async createFiles(
    taskId: string,
    files: File[] | null
  ): Promise<FileModel[] | undefined> {
    const formData = new FormData();
    formData.append('task_id', taskId);

    if (files) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    const res = await axios.post(`/file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (res.status === 200) {
      return res.data.body;
    }

    return undefined;
  }

  static async delete(fileId: string): Promise<boolean | undefined> {
    const res = await axios.delete(`/file/${fileId}`);

    if (res.status === 200) {
      return res.data.body;
    }

    return undefined;
  }
}

export default FileService;
