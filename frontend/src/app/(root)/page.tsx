'use client';

import TabsView from '@/components/home/TabsView';
import WorkspaceView from '@/components/home/WorkspaceView';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { useSessionContext } from '@/context/SessionContext';
import TasksTree from '@/components/home/TasksTree';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import AssistantSheet from '@/components/tree_analysis/AssistantSheet';
import TreeAnalysisHelper from '@/redux/helpers/tree_analysis/TreeAnalysisHelper';

const Home = () => {
  const treeAnalysisState = useSelector(
    (state: RootState) => state.treeAnalysis
  );

  const { session } = useSessionContext();
  if (!session) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <ResizablePanelGroup
        direction="horizontal"
        className="rounded-lg border border-[#1f1f1f] h-full"
      >
        {!treeAnalysisState.isAssistantOpen && (
          <>
            <ResizablePanel className="flex p-2" defaultSize={18}>
              <TasksTree />
            </ResizablePanel>
            <ResizableHandle />
          </>
        )}

        <ResizablePanel>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel className="flex p-1" defaultSize={4}>
              <TabsView />
            </ResizablePanel>
            <ResizablePanel className="flex">
              <WorkspaceView />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        {treeAnalysisState.isAssistantOpen && (
          <>
            <ResizableHandle />
            <ResizablePanel className="flex p-2" defaultSize={25}>
              <AssistantSheet
                isOpen={treeAnalysisState.isAssistantOpen}
                onOpenChange={TreeAnalysisHelper.setIsAssistantOpen}
                treeId={treeAnalysisState.treeAnalysis?.tree_id!}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default Home;
