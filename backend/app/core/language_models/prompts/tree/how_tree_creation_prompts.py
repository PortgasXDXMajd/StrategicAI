class HowTreeCreationPrompts:
    @classmethod
    def get(cls, tree_context: str, is_cause_realted: bool = False):
        return cls.get_system_prompt(), cls.get_user_prompt(tree_context, is_cause_realted)

    @classmethod
    def get_system_prompt(cls):
        return """
        You are an expert management consultant specializing in decision tree creation for corporate problem-solving and strategic development.

        Your task is to generate a How Tree for solution exploration, ensuring they are structured and actionable.

        1. Identify the core objective based on the task goal and root causes (if provided).
        2. Generate a structured JSON schema following this format:
            - Objective: Formulate the root node as a 'How' question to achieve the goal or address root causes.
            - If root causes are given, incorporate them into the tree logically, combining related causes when beneficial.

        Use concise, precise language to create nodes that facilitate further breakdown into actionable solutions.
        """

    @classmethod
    def get_user_prompt(cls, tree_context: str, is_cause_realted: bool = False):
        if is_cause_realted:
            instructions = (
                "1. Create a How Tree for the root cause mentioned in the context to explore potential solutions to sovle it.\n"
                "2. The tree must have a title directly related to the root cause at hand.\n"
                "3. Frame the root node text as a 'How' question aimed at solving the root cause.\n"
            )
        else:
            instructions = (
                "1. Create a How Tree for the goal mentioned in the task description to explore potential solutions to achieve it\n"
                "2. The tree must have a title directly related to the tak goal.\n"
                "3. Frame the root node text as a 'How' question aimed at achieving the task goal.\n"
            )

        return f"""
        Your task is to create a How Tree based on the provided context following the instructions.

        Context:
        {tree_context}

        Instructions:
        {instructions}
        """