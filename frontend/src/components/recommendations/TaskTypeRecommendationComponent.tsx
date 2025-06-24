import { Recommendation } from '../dialogs/TaskCreationDialog';
import ToolTipCompoent from '../general/ToolTip';

interface TaskTypeRecommendationComponentParam {
  recommendation: Recommendation;
  handleRecommendationSelection: (rec: Recommendation) => void;
}

const TaskTypeRecommendationComponent = ({
  recommendation,
  handleRecommendationSelection,
}: TaskTypeRecommendationComponentParam) => {
  return (
    <div
      key={recommendation.type}
      onClick={() => handleRecommendationSelection(recommendation)}
      className="group flex text-center items-center justify-between p-4 border rounded-md cursor-pointer 
                 transition-all hover:border-blue-400 dark:hover:border-red-400 hover:shadow-lg"
    >
      <div>
        <p className="font-bold">{recommendation.short_display_title}</p>
        <div className="flex font-thin justify-evenly mt-2">
          <p>Task type: </p>
          <p>{recommendation.type.toUpperCase()}</p>
        </div>

        <div className="flex justify-around mt-6">
          <p>Certainty</p>
          <span>{recommendation.certainty}%</span>
          <ToolTipCompoent description={recommendation.explanation} />
        </div>
      </div>
    </div>
  );
};

export default TaskTypeRecommendationComponent;
