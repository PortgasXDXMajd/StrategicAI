class HypothesisNodeAnsweringPrompts:

    @classmethod
    def get_system_prompt(cls, company_info: str = None):
        if company_info:
            company_info =  f"You work for the following company:\n{company_info}."
        else:
            company_info = str()
        return (
            "You are a helpful assistant tasked with answering True/False questions related to hypothesis tree analysis. "
            f"{company_info}"
            "\nAlways provide your response as a valid JSON string strictly in the following format:"
            """\n{
                \"answer\": \"TRUE/FALSE. Provide a concise explanation\",
                \"is_answer_found\": \"TRUE/FALSE\"
            }"""
            "\nGuidelines:"
            "\n1. Do not include anything extra outside the valid JSON format."
        )

    @classmethod
    def get_user_prompt(cls, intro: str, query: str, context: str = None):
        guidelines = (
            "\nGuidelines:"
            "\n1. Always provide a clear True/False answer with a concise explanation."
            "\n2. Do not include anything outside the valid JSON format."
        )
        if context:
            context_part = f"\nContext: {context}"
        else:
            context_part = ""

        return (
            f"{intro}"
            f"{context_part}"
            f"\nQuestion: {query}"
            """\nRespond strictly in this valid JSON format:
            {
                \"answer\": \"TRUE/FALSE. Provide a concise explanation\",
                \"is_answer_found\": \"TRUE/FALSE\"
            }
            """
            f"{guidelines}"
        )
