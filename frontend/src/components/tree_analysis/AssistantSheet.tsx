import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import Iconify from '../general/Iconify';
import LoadingComponent from '../general/LoadingCompnent';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import TreeAnalysisHelper from '@/redux/helpers/tree_analysis/TreeAnalysisHelper';
import FileList from '@/components/chat/FileList';
import {
  AnalysisActors,
  TreeAnalysisHistory,
  UserChatInput,
} from '@/utils/types/tree_analysis';
import UserMessage from './UserMessage';
import SystemMessage from './SystemMessage';
import { TreeActionResponseRT, TreeActionType } from '@/utils/types/tree_res';
import {
  EXECUTION_NEEDED,
  RootCauseAgentRT,
} from '@/utils/types/root_causes_agent';
import { TreeType } from '@/utils/types/tree';
import { BASE_WSS } from '@/utils/environment_var';

interface AssistantProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  treeId: string;
}

const AssistantSheet: React.FC<AssistantProps> = ({
  isOpen,
  onOpenChange,
  treeId,
}) => {
  const company = useSelector((state: RootState) => state.company);
  const selectedTree = useSelector(
    (state: RootState) => state.trees.selectedTree
  );
  const treeAnalysisState = useSelector(
    (state: RootState) => state.treeAnalysis
  );
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const setupWebSocket = useCallback(() => {
    if (!selectedTree?.id) return null;

    const ws = new WebSocket(
      `${BASE_WSS}/ws/${treeAnalysisState.treeAnalysis!.id}`
    );

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        TreeAnalysisHelper.add_message(msg);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }, [treeAnalysisState.treeAnalysis?.id]);

  const setupNotificationWebSocket = useCallback(() => {
    if (!selectedTree?.id) return null;

    const notificationQueue: any[] = [];
    let isProcessing = false;

    const processQueue = async () => {
      if (isProcessing || notificationQueue.length === 0) return;

      isProcessing = true;
      const notification = notificationQueue.shift();

      try {
        if (typeof notification === 'string') {
          TreeAnalysisHelper.setAssistantNotificationText(notification);
        }
      } catch (error) {
        console.error('Error processing notification:', error);
      } finally {
        isProcessing = false;
        processQueue();
      }
    };

    const ws = new WebSocket(
      `${BASE_WSS}/ws/${treeAnalysisState.treeAnalysis?.id}-notification`
    );

    ws.onopen = () => {
      console.log('Connected to Notification WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        notificationQueue.push(notification);
        processQueue();
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from Notification WebSocket');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }, [treeAnalysisState.treeAnalysis?.id]);

  const filterTreeAnalysisHistory = (
    history: TreeAnalysisHistory[]
  ): TreeAnalysisHistory[] => {
    return history.filter((item) => {
      if (item.actor === AnalysisActors.USER) {
        return true;
      }

      if (item.actor === AnalysisActors.SYSTEM) {
        if ('action_type' in item.payload) {
          const payload = item.payload as TreeActionResponseRT;

          if (
            payload?.action_type === TreeActionType.MESSAGE ||
            payload?.action_type === TreeActionType.DECISION
          ) {
            return true;
          }
        } else if ('method_name' in item.payload) {
          const agentPayload = item.payload as RootCauseAgentRT;
          if (!EXECUTION_NEEDED.includes(agentPayload.method_name)) {
            return true;
          }
        }
      }

      return false;
    });
  };

  useEffect(() => {
    if (treeAnalysisState.treeAnalysis) {
      const newSocket = setupWebSocket();
      if (newSocket) {
        return () => newSocket.close();
      }
    }
  }, [setupWebSocket, treeAnalysisState.treeAnalysis]);

  useEffect(() => {
    if (treeAnalysisState.treeAnalysis) {
      const newSocket = setupNotificationWebSocket();
      if (newSocket) {
        return () => newSocket.close();
      }
    }
  }, [setupNotificationWebSocket, treeAnalysisState.treeAnalysis]);

  const handleSheetClosing = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  useEffect(() => {
    if (treeAnalysisState.treeAnalysis?.history?.length && isOpen) {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [treeAnalysisState.treeAnalysis?.history, isOpen]);

  const handleSendMessage = async () => {
    setSelectedFiles([]);
    setInputMessage('');
    await TreeAnalysisHelper.sendMessage(
      selectedTree!.id,
      inputMessage,
      selectedFiles
    );

    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: TreeAnalysisHistory, index: number) => {
    const { actor, payload } = message;
    const isSystem = actor === AnalysisActors.SYSTEM;

    return isSystem ? (
      <SystemMessage key={index} sys_msg={payload} />
    ) : (
      <UserMessage
        key={index}
        data={payload as UserChatInput}
        companyName={company?.profile?.company_name ?? ''}
      />
    );
  };

  return (
    <div className="flex flex-col p-1 h-full font-mono text-xs w-full">
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-lg">
          {selectedTree?.type == TreeType.WHY
            ? `Root Cause Agent`
            : `Solutions Agent`}
        </h1>
        <Button
          variant={'ghost'}
          onClick={() => {
            handleSheetClosing(false);
          }}
        >
          <Iconify icon={'ic:round-close'} />
        </Button>
      </div>

      {treeAnalysisState.isLoading ? (
        <LoadingComponent />
      ) : (
        <div
          className="flex-1 overflow-y-auto p-2 relative"
          ref={scrollContainerRef}
        >
          {treeAnalysisState.treeAnalysis?.history?.length ? (
            filterTreeAnalysisHistory(
              treeAnalysisState.treeAnalysis.history
            ).map(renderMessage)
          ) : (
            <div className="text-center text-gray-500">The chat is empty</div>
          )}

          {treeAnalysisState.isTyping && (
            <div className="flex items-center space-x-2 mt-2 animate-pulse">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Iconify size={16} icon="mingcute:ai-line" />
                </AvatarFallback>
              </Avatar>
              <span className="p-2 rounded-lg">
                {treeAnalysisState.assistantNotificationText}
              </span>
            </div>
          )}
        </div>
      )}

      <FileList selectedFiles={selectedFiles} onRemoveFile={setSelectedFiles} />

      <div className="flex w-full items-center space-x-2">
        <Textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message here..."
          className="w-full"
          rows={3}
          onKeyDown={handleKeyDown}
        />
        <input
          type="file"
          onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
          className="hidden"
          id="file-upload"
          multiple
        />
        <div className="flex flex-col">
          <Button
            className="p-0.5"
            onClick={() => document.getElementById('file-upload')?.click()}
            variant="ghost"
          >
            <Iconify icon="hugeicons:file-add" />
          </Button>
          <Button className="p-0.5" variant="ghost" onClick={handleSendMessage}>
            <Iconify icon="mingcute:send-line" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssistantSheet;
