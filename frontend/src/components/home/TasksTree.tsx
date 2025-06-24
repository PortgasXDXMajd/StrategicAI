import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { selectTask, deleteTask } from '@/redux/task/taskSlice';
import { Folder, Tree, CollapseButton } from '../ui/file-tree';
import { axios } from '@/utils/helpers/AxiosHelper';
import EmptyComponent from '../general/EmptyComponent';
import TaskCreationDialog from '../dialogs/TaskCreationDialog';
import DeleteConfirmationDialog from '../dialogs/DeleteConfirmationDialog';
import Iconify from '../general/Iconify';
import { Task, TaskType } from '@/utils/types/task';
import { Tree as TreeModel, TreeType } from '@/utils/types/tree';
import { File as FileModel } from '@/utils/types/file';
import TreeSideComponent from '../side_tree/TreeSideComponent';
import TabHelper from '@/redux/helpers/tab/TabHelper';
import FileSideComponent from '../side_tree/FileSideComponent';
import TaskHelper from '@/redux/helpers/task/TaskHelper';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ui/context-menu';
import DataDialog from '../dialogs/DataDialog';
import FileHelper from '@/redux/helpers/file/FileHelper';
import TreeHelper from '@/redux/helpers/tree/TreeHelper';

const TasksTree = () => {
  const dispatch = useDispatch();
  const [isDataDialogOpen, setIsDataDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const tasks = useSelector((state: RootState) => state.task.tasks);
  const selectedTask = useSelector(
    (state: RootState) => state.task.selectedTask
  );

  const [hoveredOverTask, setHoveredOverTask] = useState<any | null>(null);

  useEffect(() => {
    TaskHelper.getTasks();
  }, [dispatch]);

  useEffect(() => {}, [selectTask]);

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await axios.delete(`/task/${taskId}`);
      if (response.status === 200) {
        dispatch(deleteTask(taskId));
        TabHelper.closeTab(taskId);
      } else {
        console.error('Error deleting task:', response.data.message);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleElementClick = (id: string, title: string, isTree: boolean) => {
    if (!isTree) {
      TaskHelper.selectTask(id);
      TabHelper.openTab(id, title, 'task');
    } else {
      TabHelper.openTab(id, title, 'tree');
    }
  };

  const categorizeTreesByType = (trees: TreeModel[]) => ({
    why: trees.filter((tree) => tree.type === TreeType.WHY),
    how: trees.filter((tree) => tree.type === TreeType.HOW),
    hypothesis: trees.filter((tree) => tree.type === TreeType.HYPOTHESIS),
  });

  const transformToTreeElements = (tasks: Task[]): any[] =>
    tasks.map((task) => ({
      id: task.id,
      name: task.title,
      type: task.type,
      categorizedTrees: categorizeTreesByType(task.trees),
      files: task.files,
    }));

  const treeElements = transformToTreeElements(tasks);

  const getIconByType = (type: string) => {
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

  const getTreeIconByType = (type: string) => {
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

  return (
    <>
      <div className="flex flex-col h-full w-full">
        <div className="flex justify-between items-center">
          <span className="p-2 font-semibold text-lg">Tasks</span>
          <TaskCreationDialog buttonSize={'icon'} buttonVarient={'secondary'} />
        </div>
        {treeElements.length === 0 ? (
          <EmptyComponent />
        ) : (
          <Tree
            className="overflow-hidden mt-8"
            initialSelectedId={selectedTask?.id || undefined}
            elements={treeElements}
            closeIcon={
              <>
                <Iconify icon="material-symbols:keyboard-arrow-down-rounded" />
              </>
            }
            openIcon={
              <>
                <Iconify icon="material-symbols:keyboard-arrow-up-rounded" />
              </>
            }
          >
            <CollapseButton elements={treeElements}>
              <Iconify size={20} icon={'mdi:arrow-collapse-vertical'} />
            </CollapseButton>
            {treeElements.map((task) => (
              <ContextMenu>
                <ContextMenuTrigger>
                  <div
                    key={task.id}
                    className={`${selectedTask?.id === task.id && selectedTask ? 'mb-3 mt-3 rounded-md' : ''}`}
                  >
                    <div className="truncate overflow-hidden whitespace-nowrap flex items-start justify-between">
                      <Folder
                        className={`${selectedTask?.id === task.id ? 'bg-primary dark:text-black text-white font-bold' : ''}`}
                        value={task.id}
                        element={`${getIconByType(task.type)} ${task.name}`}
                        onClick={() => {
                          handleElementClick(task.id, `${task.name}`, false);
                        }}
                      >
                        {task.categorizedTrees.why.length > 0 && (
                          <Folder
                            value={`${task.id}-why`}
                            element={`${getTreeIconByType(TreeType.WHY)} Problem Analysis`}
                            className="font-semibold text-[#fa896c]"
                          >
                            {task.categorizedTrees.why.map(
                              (tree: TreeModel, index: number) => (
                                <TreeSideComponent
                                  key={tree.id}
                                  tree={tree}
                                  index={index + 1}
                                />
                              )
                            )}
                          </Folder>
                        )}
                        {task.categorizedTrees.how.length > 0 && (
                          <Folder
                            value={`${task.id}-how`}
                            element={`${getTreeIconByType(TreeType.HOW)} Solution Exploration`}
                            className="font-semibold text-[#a4ea7f]"
                          >
                            {task.categorizedTrees.how.map(
                              (tree: TreeModel, index: number) => (
                                <TreeSideComponent
                                  key={tree.id}
                                  tree={tree}
                                  index={index + 1}
                                />
                              )
                            )}
                          </Folder>
                        )}
                        {task.categorizedTrees.hypothesis.length > 0 && (
                          <Folder
                            value={`${task.id}-hypothesis`}
                            element={`${getTreeIconByType(TreeType.HYPOTHESIS)} Solution Validation`}
                            className="font-semibold text-[#e2d58c]"
                          >
                            {task.categorizedTrees.hypothesis.map(
                              (tree: TreeModel, index: number) => (
                                <TreeSideComponent
                                  key={tree.id}
                                  tree={tree}
                                  index={index + 1}
                                />
                              )
                            )}
                          </Folder>
                        )}
                        {task.files.length > 0 && (
                          <Folder
                            value={`${task.id}-files`}
                            element={`🗂️ Files`}
                            className="font-semibold text-[#bd8b8b]"
                          >
                            {task.files.map(
                              (file: FileModel, index: number) => (
                                <FileSideComponent
                                  key={file.id}
                                  file={file}
                                  index={index + 1}
                                />
                              )
                            )}
                          </Folder>
                        )}
                      </Folder>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="mt-2 bg-[#F9F9F9] dark:bg-[#181818] shadow-lg rounded-md py-2 w-30">
                  <ContextMenuItem
                    className="space-x-3"
                    inset
                    onClick={() => {
                      setHoveredOverTask({ id: task.id, name: task.title });
                      setIsDataDialogOpen(true);
                    }}
                  >
                    <Iconify icon={'tabler:upload'} />
                    <div>Upload Files</div>
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="space-x-3"
                    inset
                    onClick={() => {
                      setHoveredOverTask({ id: task.id, name: task.name });
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Iconify icon={'ic:round-delete'} />
                    <div>Delete Task</div>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </Tree>
        )}
        {hoveredOverTask && (
          <DeleteConfirmationDialog
            text={hoveredOverTask.name}
            onDelete={() => {
              handleDeleteTask(hoveredOverTask.id);
              setHoveredOverTask(null);
            }}
            isDialogOpen={isDeleteDialogOpen}
            setIsDialogOpen={setIsDeleteDialogOpen}
          />
        )}
        {hoveredOverTask && (
          <DataDialog
            onSave={async (text: string | null, files: File[] | null) => {
              await FileHelper.create(hoveredOverTask.id, files);
              setIsDataDialogOpen(false);
              setHoveredOverTask(null);
            }}
            onCancel={() => setHoveredOverTask(null)}
            isDialogOpen={isDataDialogOpen}
            setIsDialogOpen={setIsDataDialogOpen}
            title={'Upload Task Files'}
            description={
              'These files will be used through out the processing to help in making decision'
            }
            isTextAreaNeeded={false}
            saveButtonText="Upload"
          />
        )}
      </div>
    </>
  );
};

export default TasksTree;
