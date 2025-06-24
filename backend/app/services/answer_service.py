import json
from typing import List, Tuple
from app.services.file_service import FileService
from app.helpers.config_helper import Core
from app.models.db_models.node import Node
from app.models.db_models.task import Task
from app.models.db_models.tree import Tree
from app.models.db_models.company import Company
from app.helpers.string_helper import StringHelper
from app.repositories.unit_of_work import UnitOfWork
from app.helpers.connection_manager_helper import broadcast
from app.core.language_models.return_types.file.file_facts_rt import FactsRT
from app.models.db_models.node_result import AnswerTechnique, NodeAnswer, NodeResult
from app.core.language_models.return_types.analysis.hypothesis_node_rt import HypothesisNodeRT
from app.core.language_models.prompts.node.hypothesis.hypothesis_node_answering import HypothesisNodeAnsweringPrompts


class AnswerService:
    def __init__(self, company: Company = None, tree: Tree = None, task: Task = None, llm_config=None):
        self.repositories = UnitOfWork()
        self.core_engine = Core(llm_config)
        self.file_service = FileService(company=company, llm_config=llm_config)

        self.company = company
        self.tree = tree
        self.task = task
        company_info = None
        if self.task.include_company_context:
            company_info = self.company.model_dump_json(indent=2)
        
        self.SYSTEM_PROMPT = HypothesisNodeAnsweringPrompts.get_system_prompt(company_info=company_info)

    def select_best_answer(self, answers: List[NodeAnswer]) -> NodeAnswer:
        return max(answers, key=lambda answer: answer.certainty, default=None)

    async def process_node_answers(self, node: Node, results: List[NodeResult], notify: bool = True, noti_id: str = None) -> NodeResult:
        for child in node.children:
            await self.process_node_answers(child, results, notify=notify, noti_id=noti_id)

        noti_id = noti_id or self.tree.id

        is_leaf_node = len(node.children) == 0
        answers = []

        if notify and noti_id == self.tree.id:
            await broadcast(noti_id, node.id, True)

        # Closed Book Answer
        try:
            if notify:
                await broadcast(noti_id, f"Closed Book Answer: {node.text}", True)
            answers.append(await self.generate_closed_book_answer(node))
        except Exception as error:
            pass

        # User Files Answer
        try:
            if notify:
                await broadcast(noti_id, f"Files Answer: {node.text}", True)
            answers.append(await self.generate_user_files_answer(node))
        except Exception as error:
            pass

        # Open Book Answer
        # try:
        #     if notify:
        #         await broadcast(noti_id, f"Open Book Answer: {node.text}", True)
        #     answers.append(await self.generate_open_book_answer(node))
        # except Exception as error:
        #     pass

        # Aggregated Answer (for non-leaf nodes)
        if not is_leaf_node:
            try:
                if notify:
                    await broadcast(noti_id, f"Child Aggregation Answer: {node.text}", True)
                answers.append(await self.generate_aggregated_child_answer(node, results))
            except Exception as error:
                pass

        if notify:
            await broadcast(noti_id, "Selecting the best answer...", True)

        best_answer = self.select_best_answer(answers)

        if best_answer:
            node.certainty = best_answer.certainty
            node.explanation = best_answer.answer
            await self.repositories.nodes.update(node.id, node)

        updated_tree = await self.repositories.nodes.get_node_with_children(self.tree.root_node_id)

        if notify:
            await broadcast(self.tree.id, updated_tree)

        results.append(
            NodeResult(
                node_id=node.id,
                answers=answers,
                is_leaf=is_leaf_node
            )
        )

    async def safe_generate_response(self, prompt: str, max_retries: int = 5) -> Tuple[HypothesisNodeRT, float]:
        attempts = 0
        while attempts < max_retries:
            try:
                response_str, certainty = await self.core_engine.model.generate_simple_response_with_certainity(prompt, self.SYSTEM_PROMPT)
                response_json = StringHelper.extract_json_from_string(
                    response_str)
                if "answer" in response_json and "is_answer_found" in response_json:
                    return HypothesisNodeRT(
                        answer=response_json["answer"],
                        is_answer_found=response_json["is_answer_found"]
                    ), certainty
            except (json.JSONDecodeError, KeyError):
                attempts += 1

        raise ValueError(
            "Failed to generate a valid response after multiple retries.")

    async def generate_closed_book_answer(self, node: Node) -> NodeAnswer:
        query = node.text
        prompt = HypothesisNodeAnsweringPrompts.get_user_prompt(
            intro="Using general knowledge, provide a concise and logical answer:", query=query
        )
        response, certainty = await self.safe_generate_response(prompt)

        return NodeAnswer(
            answer_technique=AnswerTechnique.CB,
            question=query,
            answer=f"{response.answer} -- {AnswerTechnique.CB}",
            certainty=certainty if response.is_answer_found else 0
        )

    async def generate_user_files_answer(self, node: Node) -> NodeAnswer:
        query = node.text

        user_files = await self.repositories.files.get_by_task_id(self.task.id)

        is_available, context = self.file_service.get_context_from_files(user_files, query)

        if is_available:
            prompt = HypothesisNodeAnsweringPrompts.get_user_prompt(
                intro="Using information from user-provided files, answer the question:",
                query=query,
                context=context
            )
            response, certainty = await self.safe_generate_response(prompt)

            return NodeAnswer(
                answer_technique=AnswerTechnique.UF,
                question=query,
                answer=f"{response.answer} -- {AnswerTechnique.UF}",
                certainty=certainty if response.is_answer_found else 0
            )

        return NodeAnswer(
            answer_technique=AnswerTechnique.UF,
            question=query,
            answer="No relevant facts found in user files.",
            certainty=0
        )

    async def generate_open_book_answer(self, node: Node) -> NodeAnswer:
        query = node.text
        search_results = {}

        search_queries = [
            query
        ] + [f"{data_point}" for data_point in node.required_data]

        for search_query in search_queries:
            search_results_raw = self.core_engine.search_engine.search(
                search_query)
            urls = [result[0] for result in search_results_raw.results]
            scraped_data = self.core_engine.scraper.scrape(urls)

            extracted_facts = await self.file_service.extract_facts(scraped_data)

            if isinstance(extracted_facts, FactsRT):
                search_results[search_query] = extracted_facts

        if search_results:
            prompt = HypothesisNodeAnsweringPrompts.get_user_prompt(
                intro="Using retrieved online context, answer the question:",
                query=query,
                context=search_results
            )
            response, certainty = await self.safe_generate_response(prompt)

            return NodeAnswer(
                answer_technique=AnswerTechnique.OB,
                question=query,
                answer=f"{response.answer} -- {AnswerTechnique.OB}",
                certainty=certainty if response.is_answer_found else 0
            )

        return NodeAnswer(
            answer_technique=AnswerTechnique.OB,
            question=query,
            answer="No relevant facts found online.",
            certainty=0
        )

    async def generate_aggregated_child_answer(self, node: Node, results: List[NodeResult]) -> NodeAnswer:
        query = node.text
        aggregated_context = []

        for child in node.children:
            child_result = next(
                (res for res in results if res.node_id == child.id), None)
            if child_result:
                best_answer = self.select_best_answer(child_result.answers)
                if best_answer:
                    aggregated_context.append(
                        f"Question: {best_answer.question} -- Answer: {best_answer.answer}")

        if not aggregated_context:
            return NodeAnswer(
                answer_technique=AnswerTechnique.CA,
                question=query,
                answer="No child answers available.",
                certainty=0
            )

        prompt = HypothesisNodeAnsweringPrompts.get_user_prompt(
            intro="Using answers to related sub-questions, provide an aggregated response:",
            query=query,
            context="\n".join(aggregated_context)
        )
        response, certainty = await self.safe_generate_response(prompt)

        return NodeAnswer(
            answer_technique=AnswerTechnique.CA,
            question=query,
            answer=f"{response.answer} -- {AnswerTechnique.CA}",
            certainty=certainty if response.is_answer_found else 0
        )
