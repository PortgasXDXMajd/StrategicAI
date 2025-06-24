import datetime

from app.core.language_models.return_types.tree.hypotheis_tree_creation_rt import HypothesisTreeRT

import datetime

class HypothesisTreeCreationPrompts:
    
    @classmethod
    def system_prompt(cls):
        """System-level instructions for hypothesis tree generation."""
        return """
            You are a senior strategy consultant specializing in hypothesis-driven problem-solving.
            Your role is to assist in constructing hypothesis trees that systematically test a given hypothesis within the user’s provided context.
        """

    @classmethod
    def user_prompt(cls, tree_context: str, is_solution_related: bool = False, is_problem_related: bool = False):
        """Generates a structured user prompt for creating the hypothesis tree root node."""
        
        if is_solution_related and is_problem_related:
            instruction = (
                "1. The hypothesis should evaluate whether the proposed solution in the context effectively addresses the identified problem within the given business scenario.\n"
                "2. The root node must be a clear yes/no question addressing whether the proposed solution will successfully solve the problem."
            )
        elif is_solution_related:
            instruction = (
                "1. The hypothesis should assess whether the proposed solution in the context will effectively achieve the specified goal.\n"
                "2. The root node must be a clear yes/no question addressing whether the proposed solution will achieve the goal described in the task."
            )
        else:
            instruction = (
                "1. Derive the hypothesis from the task context and formulate a structured hypothesis tree to test it."
            )

        # Construct the full prompt
        prompt = f"""
            Your task is to generate a **Hypothesis Tree Root Node** based on the provided context.

            Context & Objective
            - Current Date (UTC): {datetime.datetime.now(datetime.timezone.utc)}
            - Provided Context:  
            {tree_context}

            Instructions for Root Node Generation
            {instruction}

            The `required_data` should be data points where having them would allow us to answer the question

            Output Format (JSON)
            Respond with a valid JSON object in the following format:

            ```json
            {{
                "title": "Concise title summarizing the tree",
                "root_node": "Clear yes/no question defining the hypothesis",
                "required_data": [
                    "data point 1",
                    "data point 2",
                    "data point 3"
                ]
            }}
        ```

        Additional Notes
        - The `required_data` should be data points where having them would allow us to answer the question
        """

        return prompt



    @classmethod
    def get(cls, main_hypo:str, tree_context: str, is_solution_related: bool = False, is_problem_related: bool = False):
        return cls.get_system_prompt(), cls.get_user_prompt(main_hypo, tree_context, is_solution_related, is_problem_related)

    @classmethod
    def get_system_prompt(cls) -> str:
        return f"""
            You are a strategy consultant tasked with creating a hypothesis tree to evaluate a given hypothesis.
            Follow these steps to ensure the tree is comprehensive, accurate, and adheres to all structural requirements:

            2. Decompose the Hypothesis:
            - Break the root question into multiple sub-questions that collectively address all critical dimensions.
            - Sub-questions should explore high-level aspects such as market conditions, internal capabilities, competitor analysis, etc.

            3. Ensure Mutually Comprehensive and Mutually Exclusive (MCME) Questions:
            - Questions in the same level must collectively cover all relevant aspects of the parent question.
            - There should be no overlap between the sub-questions to avoid redundancy.

            4. Validate the Hierarchical Relationships:
            - Sub-questions must logically depend on the parent question.
            - Nodes in the same level cannot be children of each other.

            5. Identify and Design Atomic Leaf Nodes:
            - Leaf nodes must be atomic, meaning they can be directly answered by the user using:
                a. Uploading a file.
                b. Online search.

            6. Attach Required Data to All Nodes:
            - Every node, including non-atomic (parent) nodes, must have a list of required data associated with it.
            - Required data must be in the form of a clear, actionable search query and should include:
                a. Context for internal company data (if applicable), specifying the company name and relevant details.
                b. Context for external company data (if applicable), specifying the external company name and relevant details.
                c. Generic data, which does not require any company context.

            7. Structure the Tree:
            - Each parent node should have multiple child nodes or be marked as atomic.
            - All leaf nodes are atomic with no children.
            - Provide the required data for all nodes.

            8. *Review and Refine:
            - Validate that the tree adheres to the following rules:
                - Each level is MCME.
                - All questions are in yes/no format.
                - Nodes are not children of their siblings.
            - Refine the tree to address gaps, redundancies, or ambiguities.

            - Start directly with the children of the main hypothesis and do not add the main hypothesis to your output.
            - List of branches are the children of the main hypothesis(Root Node) no need to output the root node again

        
            Output Format:
            Respond in json format only without any explanation:
            
            {{
                "branches": [
                    {{
                        "question":"",
                        "required_data":["data_1", "data_2",..],
                        "children":[
                            {{
                                "question":"The yes/no question text for the node.",
                                "required_data":["data_1", "data_2",..],
                                "children":[]
                            }},
                            {{
                                "question":"",
                                "required_data":["data_1", "data_2",..],
                                "children":[]
                            }},
                        ]
                    }},
                    {{
                        "question":"",
                        "required_data":["data_1", "data_2",..],
                        "children":[
                            {{
                                "question":"The yes/no question text for the node.",
                                "required_data":["data_1", "data_2",..],
                                "children":[]
                            }},
                            {{
                                "question":"",
                                "required_data":["data_1", "data_2",..],
                                "children":[]
                            }},
                        ]
                    }}
                ]
            }}

            JSON Schema:
            {HypothesisTreeRT.model_json_schema()}

            Definitions:
            - `question`: The yes/no question text for the node.
            - `required_data`: List of search queries needed to answer the question, ensuring context is specified only when required for internal or external company data.
            - `children`: List of child nodes (empty for atomic nodes).
        """

    @classmethod
    def get_user_prompt(cls, main_hypo:str, tree_context: str, is_solution_related: bool = False, is_problem_related: bool = False):
        if is_solution_related and is_problem_related:
            # Task Type is Problem
            instruction = (
                "1. The hypothesis must be to evaluate is whether the proposed solution in the context effectively addresses the problem mentioned in the context tailored to the company inforamtion.\n"
                "2. The root node of the tree must address whether the proposed solution will solve the problem in the context to successfully.\n"
            )
        elif is_solution_related:
            # Task Type is Goal
            instruction = (
                "1. The hypothesis must be to evaluate is whether the proposed solution in the context effectively addresses the task goal, tailored to the company inforamtion.\n"
                "2. The root node of the tree must address whether the proposed solution will achieve the goal described in the task context.\n"
            )
        else:
            # Task Type is Hypothesis
            instruction = (
                "1. The hypothesis to evaluate is derived from the task context and involves creating a hypothesis tree to answer the hypothesis described in the task."
            )
        
        return f"""
        Your task is to create a Hypothesis Tree for the root node based on the provided context and following the instructions.

        World Context:
        Current Date (UTC): {datetime.datetime.now(datetime.timezone.utc)}

        Context:
        {tree_context}

        Instruction:
        {instruction}

        Main Hypothesis:
        {main_hypo}

        Additional Notes:
        - Ensure the hypothesis tree adheres to the structural rules provided in the system prompt.
        - Include a `required_data` field for every node, not just the leaf nodes, and ensure it takes the form of a search query.
        - The search query must:
            - Include the company name and relevant context for internal company data.
            - Include the external company name and relevant context for external company data.
            - Be sufficient for generic data without requiring context.
        - Return the tree as a valid JSON object, following the specified format.
        - Start directly with the children of the main hypothesis and do not add the main hypothesis to your output.
        - List of branches are the children of the main hypothesis(Root Node) no need to output the root node again

        Respond in json format only without explanations:

        {HypothesisTreeRT.model_json_schema()}
        """
