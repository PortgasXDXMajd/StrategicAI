import Iconify from '../general/Iconify';

interface FileIconParams {
  fileName: string;
  className: string | undefined;
}
const FileIcon = ({ fileName, className }: FileIconParams) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return (
        <Iconify className={className ?? ''} size={16} icon="catppuccin:pdf" />
      );
    case 'doc':
    case 'docx':
      return (
        <Iconify
          className={className ?? ''}
          size={16}
          icon="vscode-icons:file-type-word"
        />
      );
    case 'xls':
    case 'xlsx':
    case 'csv':
      return (
        <Iconify
          className={className ?? ''}
          size={16}
          icon="vscode-icons:file-type-excel"
        />
      );
    case 'ppt':
    case 'pptx':
      return (
        <Iconify
          className={className ?? ''}
          size={16}
          icon="vscode-icons:file-type-powerpoint"
        />
      );
    case 'txt':
      return (
        <Iconify className={className ?? ''} size={16} icon="gala:file-text" />
      );
    default:
      return (
        <Iconify
          className={className ?? ''}
          size={16}
          icon="radix-icons:file"
        />
      );
  }
};

export default FileIcon;
