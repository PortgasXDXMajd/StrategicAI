import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openTab } from '@/redux/tab/tabSlice';
import Iconify from '../general/Iconify';
import { Tree } from '@/utils/types/tree';
import { selectTree } from '@/redux/tree/treeSlice';
import TreeHelper from '@/redux/helpers/tree/TreeHelper';
import DeleteConfirmationDialog from '../dialogs/DeleteConfirmationDialog';
import { RootState } from '@/redux/store';

interface TreeSideProps {
  tree: Tree;
  index: number;
}

const TreeSideComponent = ({ tree, index }: TreeSideProps) => {
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(false);
  const [isToDelete, setIsToDelete] = useState(false);
  const selectedTree = useSelector(
    (state: RootState) => state.trees.selectedTree
  );
  const handleTreeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(selectTree(tree));
    dispatch(
      openTab({
        id: tree.id,
        title: `${tree.title}`,
        type: 'tree',
      })
    );
  };

  const handleDeleteClick = async () => {
    await TreeHelper.deleteTree(tree);
  };

  return (
    <>
      <div
        key={tree.id}
        className={`tree-item text-[12px] flex items-center justify-between space-x-2 cursor-pointer rounded hover:bg-gray-100 hover:text-black ${
          selectedTree?.id === tree.id
            ? 'bg-primary dark:text-black text-white'
            : ''
        }`}
        onClick={handleTreeClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className="truncate">
          {index}. {tree.title}
        </span>
        {hovered && (
          <button
            onClick={() => {
              setIsToDelete(true);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <Iconify icon="mdi:delete" size={15} />
          </button>
        )}
      </div>
      {isToDelete && (
        <DeleteConfirmationDialog
          text={tree.title}
          onDelete={() => {
            handleDeleteClick();
            setIsToDelete(false);
          }}
          isDialogOpen={isToDelete}
          setIsDialogOpen={setIsToDelete}
        />
      )}
    </>
  );
};

export default TreeSideComponent;
