import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../general/DataTable';
import Iconify from '../general/Iconify';
import { Button } from '../ui/button';

const columns: ColumnDef<{ fact: string }>[] = [
  {
    accessorKey: 'fact',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Facts
          <Iconify size={12} icon="pepicons-pop:down-up" />
        </Button>
      );
    },
  },
];

const FileDetailComponent = () => {
  const selectedFile = useSelector(
    (state: RootState) => state.file.selectedFile
  );

  if (!selectedFile) {
    return null;
  }

  const data = selectedFile.facts.map((fact: string) => ({ fact }));

  return (
    <div className="w-full h-full bg-red p-5 px-10">
      <div className="flex items-center space-x-2 mb-4">
        <Iconify icon="material-symbols:fact-check-outline-rounded" />
        <h4>Extracted Facts: {selectedFile.file_name}</h4>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default FileDetailComponent;
