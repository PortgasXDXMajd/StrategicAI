import React from 'react';
import { Button } from '../ui/button';
import Iconify from '../general/Iconify';
import FileIcon from './FileIcon';

const FileList: React.FC<{
  selectedFiles: File[];
  onRemoveFile: (files: File[]) => void;
}> = ({ selectedFiles, onRemoveFile }) =>
  selectedFiles.length > 0 && (
    <div className="p-1 text-white">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">
          Selected Files ({selectedFiles.length}):
        </p>
        <Button size="sm" variant="ghost" onClick={() => onRemoveFile([])}>
          <Iconify icon="ic:round-delete" size={16} color="#eb4034" />
        </Button>
      </div>
      <ul className="flex overflow-x-auto space-x-2 py-2">
        {selectedFiles.map((file, index) => (
          <li
            key={index}
            className="flex items-center space-x-2 min-w-fit p-1 bg-gray-700 rounded-lg"
          >
            <FileIcon fileName={file.name} className={undefined} />
            <span className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[150px]">
              {file.name}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                onRemoveFile(selectedFiles.filter((_, i) => i !== index))
              }
            >
              <Iconify icon="mingcute:close-line" size={16} />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );

export default FileList;
