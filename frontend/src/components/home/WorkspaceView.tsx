import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import NothingSelectedComponent from '../general/NothingSelectedComponent';
import TaskDetailComponent from '../task/TaskDetailComponent';
import TreeComponent from '../tree/TreeComponent';
import FileDetailComponent from '../files/FileComponent';

const WorkspaceView = () => {
  const selectedTab = useSelector((state: RootState) => state.tabs.selectedTab);

  return (
    <div className="flex w-full h-full justify-center items-center dark:bg-[#1f1f1f]">
      <>
        {selectedTab?.type === 'task' ? (
          <TaskDetailComponent />
        ) : selectedTab?.type === 'tree' ? (
          <TreeComponent />
        ) : selectedTab?.type === 'file' ? (
          <FileDetailComponent />
        ) : (
          <NothingSelectedComponent />
        )}
      </>
    </div>
  );
};

export default WorkspaceView;
