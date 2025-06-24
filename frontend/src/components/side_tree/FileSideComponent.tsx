import React, { useState } from 'react';
import { File as FileModel } from '@/utils/types/file';
import FileIcon from '../chat/FileIcon';
import FileHelper from '@/redux/helpers/file/FileHelper';
import TabHelper from '@/redux/helpers/tab/TabHelper';
import { RootState } from '@/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import Iconify from '../general/Iconify';
import DeleteConfirmationDialog from '../dialogs/DeleteConfirmationDialog';

interface FileSideProps {
  file: FileModel;
  index: number;
}

const FileSideComponent = ({ file, index }: FileSideProps) => {
  const selectedFile = useSelector(
    (state: RootState) => state.file.selectedFile
  );
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(false);
  const [isToDelete, setIsToDelete] = useState(false);

  const handleFileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    FileHelper.seletctFile(file);
    TabHelper.openTab(file.id, file.file_name, 'file');
  };
  const handleDeleteClick = async () => {
    await FileHelper.delete(file.task_id, file.id);
  };

  return (
    <>
      <div
        key={file.id}
        className={`tree-item text-[12px] flex items-center justify-between space-x-2 cursor-pointer rounded hover:bg-gray-100 hover:text-black ${
          selectedFile?.id === file.id
            ? 'bg-primary dark:text-black text-white'
            : ''
        }`}
        onClick={(e) => handleFileClick(e)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className="flex truncate space-x-2">
          {index}. <FileIcon fileName={file.file_name} className={undefined} />
          <span className="truncate">{file.file_name}</span>
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
          text={file.file_name}
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

export default FileSideComponent;
