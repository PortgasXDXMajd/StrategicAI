import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { TreeType } from '@/utils/types/tree';
import TreeHelper from '@/redux/helpers/tree/TreeHelper';
import LoadingComponent from '../general/LoadingCompnent';
import { getTaskIconByType } from '../helpers/IconsHelper';
import { HypothesisTreeDecision } from '@/utils/types/hypothesis_tree_res';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@radix-ui/react-dropdown-menu';

import Iconify from '../general/Iconify';
import TaskDocumentGenerator from '@/utils/helpers/TaskDocumentGenerator';
import Markdown from '../general/Markdown';
import TaskHelper from '@/redux/helpers/task/TaskHelper';
import { Decision } from '@/utils/types/tree_res';

const TaskDetailComponent = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectedTask = useSelector(
    (state: RootState) => state.task.selectedTask
  );

  if (!selectedTask) {
    return null;
  }

  useEffect(() => {
    const fetchTask = async () => {
      await TaskHelper.getTask(selectedTask.id);
    };
    fetchTask();
  }, []);

  const handleTaskCreation = async (type: TreeType) => {
    setIsLoading(true);
    try {
      await TreeHelper.createTree(selectedTask.id, type);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const renderSuggestedActions = () => {
    if (!selectedTask.trees) {
      return null;
    }

    const hasTreeOfType = (type: TreeType) =>
      selectedTask.trees.some((tree) => tree.type === type);

    switch (selectedTask.type) {
      case 'problem':
        return !hasTreeOfType(TreeType.WHY) ? (
          <Button onClick={() => handleTaskCreation(TreeType.WHY)}>
            {isLoading ? <LoadingComponent /> : `Start Problem Analysis`}
          </Button>
        ) : null;
      case 'goal':
        return !hasTreeOfType(TreeType.HOW) ? (
          <Button onClick={() => handleTaskCreation(TreeType.HOW)}>
            {isLoading ? <LoadingComponent /> : `Start Solution Exploration`}
          </Button>
        ) : null;
      case 'hypothesis':
        return !hasTreeOfType(TreeType.HYPOTHESIS) ? (
          <Button onClick={() => handleTaskCreation(TreeType.HYPOTHESIS)}>
            {isLoading ? <LoadingComponent /> : `Start Solution Validation`}
          </Button>
        ) : null;
      default:
        return null;
    }
  };

  const renderSection = (title: string, content: JSX.Element) => (
    <div className="space-y-5 mb-6">
      <h3 className="text-xl font-semibold text-[#1d4ed8] dark:text-[#60a5fa]">
        {title}
      </h3>
      <div className="text-gray-700 dark:text-gray-300">{content}</div>
      <hr className="border-gray-300 dark:border-gray-600" />
    </div>
  );

  const renderRootCauseAnalysis = () => {
    const payload = selectedTask.root_cause_analysis?.payload as Decision;
    return renderSection(
      'Root Cause Analysis',
      <>
        <div className="mt-4">
          {payload.items.map((cause, index) => (
            <p key={index} className="mt-3">
              <span className="flex">
                {index + 1}.{'  '}
                {cause.item} Certainty: {cause.certainty}%
              </span>

              <span className="text-sm text-gray-600 dark:text-gray-400">
                <Markdown text={cause.explanation} />
              </span>
            </p>
          ))}
        </div>
      </>
    );
  };

  const renderHowTreeDecisions = () => {
    if (selectedTask.how_trees_decisions) {
      return renderSection(
        'Solutions',
        <>
          {selectedTask.how_trees_decisions.map((decision, index) => {
            const payload = decision.payload as Decision;
            return (
              <div key={index} className="mb-4">
                <ul className="list-disc list-inside">
                  {payload.items.map((solution, solIndex) => {
                    return (
                      <p key={solIndex} className="mt-3">
                        <span className="flex">
                          {solIndex + 1}.{'  '}
                          {solution.item} Certainty: {solution.certainty}%
                        </span>

                        <span className="text-sm text-gray-600 dark:text-gray-400 p-3">
                          <Markdown text={solution.explanation} />
                        </span>
                      </p>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </>
      );
    }
  };

  const renderHypothesesTested = () => {
    if (selectedTask.hypotheses_tested) {
      return renderSection(
        'Hypotheses Tested',
        <>
          {selectedTask.hypotheses_tested.map((hypothesis, index) => {
            const payload = hypothesis.payload as HypothesisTreeDecision;
            return (
              <div key={index} className="mb-4">
                <h4 className="text-md font-bold text-[#b91c1c] dark:text-[#f87171]">
                  {index + 1}. {payload.question} (Certainty:{' '}
                  {payload.certainty}%)
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <Markdown text={payload.answer} />
                </p>
              </div>
            );
          })}
        </>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col p-4 bg-[#f9f9f9] dark:bg-[#1f1f1f] shadow-lg w-full h-full">
      <div className="flex flex-col flex-grow overflow-y-auto space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {`${getTaskIconByType(selectedTask.type)} ${selectedTask.title}`}
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="px-4 py-2 rounded-md">
                <Iconify icon="ph:export" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="mt-2 bg-white dark:bg-[#181818] shadow-lg rounded-md py-2 w-48"
              align="end"
            >
              <DropdownMenuItem
                className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                onClick={async () => {
                  const taskGen = new TaskDocumentGenerator(selectedTask.id);
                  await taskGen.generateWordDocument();
                }}
              >
                <Iconify icon="ph:file-doc" className="mr-2 text-blue-600" />
                Word Document
              </DropdownMenuItem>
              {/* <DropdownMenuItem
                className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={async () => {
                  const taskGen = new TaskDocumentGenerator(selectedTask.id);
                  await taskGen.generatePDFDocument();
                }}
              >
                <Iconify icon="ph:file-pdf" className="mr-2 text-red-600" />
                PDF Document
              </DropdownMenuItem> */}
              <DropdownMenuItem
                className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={async () => {
                  const taskGen = new TaskDocumentGenerator(selectedTask.id);
                  await taskGen.exportAsJSON();
                }}
              >
                <Iconify icon="tabler:json" className="mr-2 text-green-600" />
                JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 pr-5">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-[#1d4ed8] dark:text-[#60a5fa]">
              Task Context
            </h3>
            <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
              {selectedTask.user_description}
            </p>
          </div>
          {selectedTask.root_cause_analysis && renderRootCauseAnalysis()}
          {selectedTask.how_trees_decisions &&
            selectedTask.how_trees_decisions.length > 0 &&
            renderHowTreeDecisions()}
          {selectedTask.hypotheses_tested &&
            selectedTask.hypotheses_tested.length > 0 &&
            renderHypothesesTested()}
        </div>
      </div>

      <div className="flex mt-6 justify-end">{renderSuggestedActions()}</div>
    </div>
  );
};

export default TaskDetailComponent;
