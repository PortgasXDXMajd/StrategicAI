import { axios } from '@/utils/helpers/AxiosHelper';
import { Task } from '@/utils/types/task';

class TaskService {
  static async getTasks(): Promise<Task[] | undefined> {
    const response = await axios.get('/task');
    if (response.data.result === 200) {
      const tasks: Task[] = response.data.body;
      return tasks;
    }
    return undefined;
  }
  static async getTaskById(taskId: string): Promise<Task | undefined> {
    const response = await axios.get(`/task/${taskId}`);
    if (response.data.result === 200) {
      const task: Task = response.data.body;
      return task;
    }
    return undefined;
  }
}
export default TaskService;
