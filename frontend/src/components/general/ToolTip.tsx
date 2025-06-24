import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Iconify from './Iconify';

interface ToolTipParams {
  description: string;
}

const ToolTipCompoent = ({ description }: ToolTipParams) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="group-hover:text-blue-400 dark:group-hover:text-red-400 transition-colors">
            <Iconify icon="ic:round-info" width={20} />
          </div>
        </TooltipTrigger>
        <TooltipContent className="dark:bg-white dark:text-black bg-black text-white max-w-[25vw]">
          <span>{description}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ToolTipCompoent;
