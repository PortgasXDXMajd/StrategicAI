import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { selectTab } from '@/redux/tab/tabSlice';
import TabHelper from '@/redux/helpers/tab/TabHelper';
import FileHelper from '@/redux/helpers/file/FileHelper';
import TreeHelper from '@/redux/helpers/tree/TreeHelper';
import TaskHelper from '@/redux/helpers/task/TaskHelper';
import { Button } from '../ui/button';
import Iconify from '../general/Iconify';
const TabsView = () => {
  const dispatch = useDispatch();
  const openTabs = useSelector((state: RootState) => state.tabs.openTabs);
  const selectedTab = useSelector((state: RootState) => state.tabs.selectedTab);

  const handleTabClick = (tabId: string, tabType: 'task' | 'tree' | 'file') => {
    dispatch(selectTab({ id: tabId, type: tabType }));
    if (tabType === 'task') {
      TaskHelper.selectTask(tabId);
    } else if (tabType === 'tree') {
      TreeHelper.selectTreeById(tabId);
    } else if (tabType === 'file') {
      FileHelper.seletctFileById(tabId);
    }
  };

  const handleCloseTab = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    TabHelper.closeTab(tabId);
  };

  const handleCloseAllTabs = (event: React.MouseEvent) => {
    event.stopPropagation();
    TabHelper.closeAll();
  };

  return (
    <div className="flex flex-row w-full rounded-sm justify-between items-center">
      <div
        className="flex h-full w-full overflow-x-auto overflow-y-hidden space-x-1"
        style={{
          scrollbarWidth: 'none',
        }}
      >
        <style jsx>{`
          /* Hide scrollbars for Webkit-based browsers (Chrome, Safari) */
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {openTabs.map((tab) => (
          <div
            key={`${tab.id}-${tab.type}`}
            className="flex flex-col max-w-[300px] overflow-hidden"
          >
            <div
              className={`flex pl-2 pr-1 cursor-pointer items-center justify-between space-x-2 rounded-md
              ${selectedTab?.id === tab.id ? '' : 'hover:bg-blue-400 dark:hover:bg-red-400 hover:text-white transition-colors duration-100'}
            `}
              onClick={() => handleTabClick(tab.id, tab.type)}
            >
              <span className="text-[12px] truncate" title={tab.title}>
                {tab.title}
              </span>
              <button
                className="p-1 rounded hover:bg-gray-300 hover:text-black transition duration-100"
                onClick={(event) => handleCloseTab(tab.id, event)}
              >
                ✕
              </button>
            </div>
            {selectedTab?.id === tab.id ? (
              <div className="w-full h-0.5 rounded-xl bg-blue-500 dark:bg-red-400"></div>
            ) : (
              <div className="w-full h-0.5 rounded-xl"></div>
            )}
          </div>
        ))}
      </div>
      {openTabs.length > 0 && (
        <div className="flex p-2 w-fit items-center justify-end">
          <Button
            size={'sm'}
            variant={'outline'}
            onClick={(e) => handleCloseAllTabs(e)}
          >
            <Iconify icon="ic:round-close" size={15} />
            close all
          </Button>
        </div>
      )}
    </div>
  );
};

export default TabsView;
