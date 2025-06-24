import React, { useState } from 'react';
import FileIcon from '@/components/chat/FileIcon';
import { Avatar, AvatarFallback } from '../ui/avatar';
import FileFactDialog from '../dialogs/FileFactDialog';
import { UserChatInput } from '@/utils/types/tree_analysis';

const UserMessage: React.FC<{
  data: UserChatInput;
  companyName: string;
}> = ({ data, companyName }) => {
  const { text, file, type } = data;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFileClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-end space-x-2">
        <div
          className={`bg-gray-600 p-2 w-fit max-w-[80%] rounded-md my-2 text-white break-words ${
            type === 'file'
              ? 'flex items-center space-x-2 cursor-pointer hover:underline'
              : ''
          }`}
          onClick={type === 'file' ? handleFileClick : undefined}
          style={type === 'file' ? { position: 'relative' } : {}}
        >
          {type === 'file' ? (
            <div className="flex items-center space-x-2 group">
              <FileIcon
                fileName={text}
                className="group-hover:translate-y-[-2px] transition-transform"
              />
              <span className="underline group-hover:text-blue-500">
                {text}
              </span>
            </div>
          ) : (
            text
          )}
        </div>
        <Avatar className="h-6 w-86 mt-3">
          <AvatarFallback>
            {companyName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {type === 'file' && (
        <FileFactDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          fileName={text}
          facts={file}
        />
      )}
    </>
  );
};

export default UserMessage;
