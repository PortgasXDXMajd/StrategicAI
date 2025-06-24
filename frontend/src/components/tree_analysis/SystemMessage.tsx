import Iconify from '../general/Iconify';
import { Avatar, AvatarFallback } from '../ui/avatar';
import Markdown from '../general/Markdown';
import { TreeActionType, TreeMessage } from '@/utils/types/tree_res';
import { MessageParam, MethodName } from '@/utils/types/root_causes_agent';
import { AnalysisHistoryPayload } from '@/utils/types/tree_analysis';

const SystemMessage: React.FC<{
  sys_msg: AnalysisHistoryPayload;
}> = ({ sys_msg }) => {
  let content = '';

  if ('method_name' in sys_msg) {
    const { method_name, params } = sys_msg;
    switch (method_name) {
      case MethodName.OUTPUT:
        let mg = params as MessageParam;
        content = mg.message;
        break;
      default:
        break;
    }
  } else if ('action_type' in sys_msg) {
    const { action_type, payload } = sys_msg;
    switch (action_type) {
      case TreeActionType.MESSAGE:
        let mg = payload as TreeMessage;
        content = mg.message;
        break;
      default:
        break;
    }
  }

  return (
    <div className="flex justify-start space-x-2">
      <Avatar className="h-6 w-6 mt-3">
        <AvatarFallback>
          <Iconify size={12} icon="mingcute:ai-line" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-gray-800 w-fit max-w-[80%] p-2 rounded-sm my-2 text-white break-words">
        <Markdown text={content} />
      </div>
    </div>
  );
};

export default SystemMessage;
