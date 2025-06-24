from fastapi import APIRouter
from app.repositories.unit_of_work import UnitOfWork
from app.helpers.response_helper import ResponseHelper
from app.core.language_models.prompts.node.needed_models import AssistantNode, EvalNode

router = APIRouter(prefix="/eval")

# @router.get("/{task_id}")
# async def get_eval(task_id: str):
#     repos = UnitOfWork()
    
#     task = await repos.tasks.get_by_id(task_id)

#     root_causes = task.root_cause_analysis.payload.root_causes
#     solutions_data = task.how_trees_decisions

#     problems = [
#         {
#             "problem": cause.root_cause,
#             "explanation": cause.explanation,
#             "certainty": cause.certainty
#         }
#         for cause in root_causes
#     ]
    
#     solutions = [
#         {
#             "solution": solution.solution,
#             "explanation": solution.explanation,
#             "certainty": solution.certainty
#         }
#         for decision in solutions_data
#         for solution in decision.payload.solutions
#     ]
    
#     transformed_data = {
#         "problems": problems,
#         "solutions": solutions
#     }

#     return ResponseHelper.success(transformed_data)


@router.get("/{task_id}/{tree_type}")
async def get_eval(task_id: str, tree_type:str):
    repos = UnitOfWork()
    
    task = await repos.tasks.get_by_id(task_id)
    if not task:
        return ResponseHelper.error(status=404, msg="Task was not found")

    trees = await repos.trees.get_tree_by_task_id_tree_type(task_id=task.id, tree_type=tree_type)

    results = []

    for tree in trees:
        root_node = await repos.nodes.get_node_with_children(tree.root_node_id)
        results.append(EvalNode(root_node))


    return ResponseHelper.success(results)