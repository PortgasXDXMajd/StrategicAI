import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useState } from 'react';
import TreeService from '@/services/TreeService';
import Iconify from '../general/Iconify';
import { Button } from '../ui/button';
import { TreeType } from '@/utils/types/tree';
import { NodeOptionService } from './nodes/services/NodeOptionService';
import NodeVerificationDialog from '../dialogs/NodeVerificationDialog';

export default function PotentialCandidates() {
  const [potentialCandidates, setPotentialCandidates] = useState<
    any[] | undefined
  >(undefined);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedTree = useSelector(
    (state: RootState) => state.trees.selectedTree
  );

  const get_potential_candidates = async () => {
    setIsRefreshing(true);
    const candidates = await TreeService.getPotentialCandidates(
      selectedTree!.id
    );
    setPotentialCandidates(candidates);
    setIsCollapsed(false);
    setIsRefreshing(false);
  };

  return (
    <div className="p-2 rounded-xl bg-[#eeeeee] dark:bg-[#181818] shadow-md min-w-md max-w-md">
      {!potentialCandidates ? (
        <Button
          variant={'secondary'}
          onClick={get_potential_candidates}
          disabled={isRefreshing}
        >
          <Iconify icon={'material-symbols:account-tree-rounded'} size={15} />
          {isRefreshing ? 'Loading...' : 'Get Potential Candidates'}
        </Button>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-row items-center gap-1">
              <Iconify
                icon={'material-symbols:account-tree-rounded'}
                size={18}
              />
              <h2 className="text-md font-semibold text-gray-800 dark:text-gray-200">
                Potential Candidates
              </h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant={'ghost'}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <Iconify
                  icon={isCollapsed ? 'mdi:chevron-down' : 'mdi:chevron-up'}
                />
              </Button>
              <Button
                variant={'ghost'}
                onClick={get_potential_candidates}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  'Refreshing...'
                ) : (
                  <Iconify icon="mdi:refresh" />
                )}
              </Button>
            </div>
          </div>
          {!isCollapsed && (
            <div className="max-h-[40rem] overflow-y-auto p-2 rounded-lg space-y-3">
              {potentialCandidates.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  No candidates available.
                </p>
              ) : (
                potentialCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    setPotentialCandidates={setPotentialCandidates}
                    get_potential_candidates={get_potential_candidates}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SecButton({
  text,
  icon,
  onClick,
  isLoading,
}: {
  text?: string;
  icon?: string;
  onClick: () => void;
  isLoading: boolean;
}) {
  return (
    <Button
      size={'sm'}
      variant={'secondary'}
      onClick={onClick}
      disabled={isLoading}
      className="gap-1 p-2 font-extralight"
    >
      {isLoading ? (
        'Processing...'
      ) : (
        <>
          {icon && <Iconify icon={icon} size={10} />}
          {text && <p className="font-extralight">{text}</p>}
        </>
      )}
    </Button>
  );
}

function WhyOptions({
  candidate,
  setPotentialCandidates,
}: {
  candidate: any;
  setPotentialCandidates: any;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] =
    useState(false);

  const selectedTree = useSelector(
    (state: RootState) => state.trees.selectedTree
  );

  const toggleRootCause = async () => {
    setIsLoading(true);
    await NodeOptionService.handleToggleNodeDecisionClick(
      candidate.id,
      selectedTree!
    );
    setPotentialCandidates((prev: any[]) =>
      prev.map((c) =>
        c.id === candidate.id
          ? { ...c, is_part_decision: !c.is_part_decision }
          : c
      )
    );
    setIsLoading(false);
  };

  const verifyCandidate = () => {
    setIsVerificationDialogOpen(true); // Open the dialog
  };

  return (
    <>
      <div className="flex gap-2 items-end justify-end">
        <SecButton
          text={
            candidate.is_part_decision
              ? `Remove from Root Causes`
              : `Mark as Root Cause`
          }
          icon={
            candidate.is_part_decision
              ? `material-symbols:remove-rounded`
              : `material-symbols:add-2-rounded`
          }
          onClick={toggleRootCause}
          isLoading={isLoading}
        />
        <SecButton
          text={'Verify'}
          icon={'material-symbols:find-in-page-rounded'}
          onClick={verifyCandidate}
          isLoading={isLoading} // Reuse isLoading to disable button during dialog interaction
        />
      </div>
      <NodeVerificationDialog
        isDialogOpen={isVerificationDialogOpen}
        setIsDialogOpen={setIsVerificationDialogOpen}
        nodeId={candidate.id} // Pass the full candidate object as the node
      />
    </>
  );
}

function HowOptions({
  candidate,
  setPotentialCandidates,
}: {
  candidate: any;
  setPotentialCandidates: any;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] =
    useState(false);

  const selectedTree = useSelector(
    (state: RootState) => state.trees.selectedTree
  );

  const toggleSolution = async () => {
    setIsLoading(true);
    await NodeOptionService.handleToggleNodeDecisionClick(
      candidate.id,
      selectedTree!
    );
    setPotentialCandidates((prev: any[]) =>
      prev.map((c) =>
        c.id === candidate.id
          ? { ...c, is_part_decision: !c.is_part_decision }
          : c
      )
    );
    setIsLoading(false);
  };

  const verifyCandidate = () => {
    setIsVerificationDialogOpen(true); // Open the dialog
  };

  return (
    <>
      <div className="flex gap-2 items-end justify-end">
        <SecButton
          text={
            candidate.is_part_decision
              ? `Remove from Solutions`
              : `Mark as Solution`
          }
          icon={
            candidate.is_part_decision
              ? `material-symbols:remove-rounded`
              : `material-symbols:add-2-rounded`
          }
          onClick={toggleSolution}
          isLoading={isLoading}
        />
        <SecButton
          text={'Verify'}
          icon={'material-symbols:find-in-page-rounded'}
          onClick={verifyCandidate}
          isLoading={isLoading} // Reuse isLoading to disable button during dialog interaction
        />
      </div>
      <NodeVerificationDialog
        isDialogOpen={isVerificationDialogOpen}
        setIsDialogOpen={setIsVerificationDialogOpen}
        nodeId={candidate.id} // Pass the full candidate object as the node
      />
    </>
  );
}

function CandidateCard({
  candidate,
  setPotentialCandidates,
  get_potential_candidates,
}: {
  candidate: any;
  setPotentialCandidates: any;
  get_potential_candidates: any;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shortText = candidate.explanation.slice(0, 100);
  const isLong = candidate.explanation.length > 100;
  const selectedTree = useSelector(
    (state: RootState) => state.trees.selectedTree
  );

  return (
    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm flex flex-col gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
      <h3 className="font-medium text-gray-800 dark:text-gray-200">
        {candidate.text}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {isExpanded ? candidate.explanation : `${shortText}...`}
        {isLong && (
          <button
            className="text-blue-500 dark:text-blue-400 ml-1 hover:underline"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </p>
      {selectedTree!.type === TreeType.WHY ? (
        <WhyOptions
          candidate={candidate}
          setPotentialCandidates={setPotentialCandidates}
        />
      ) : (
        <HowOptions
          candidate={candidate}
          setPotentialCandidates={setPotentialCandidates}
        />
      )}
    </div>
  );
}
