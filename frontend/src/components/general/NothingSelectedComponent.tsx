import TaskCreationDialog from '../dialogs/TaskCreationDialog';

const NothingSelectedComponent = () => {
  return (
    <div className="flex  flex-col w-full h-full justify-center items-center space-y-3">
      <img src="/logos/black_logo.svg" alt="LOGO" width={300} height={300} />
      <span className="font-thin text-[#464646]">Start by creating a Task</span>
      <TaskCreationDialog
        buttonText="Create A Task"
        buttonVarient={'secondary'}
        buttonSize={'sm'}
      />
    </div>
  );
};

export default NothingSelectedComponent;
