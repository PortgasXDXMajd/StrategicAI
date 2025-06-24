class DecompositionProblemAgentPrompts:
    @classmethod
    def system_prompt(cls) -> str:

        examples = """
            1. User: Node to Decompose: Why Nespresso’s market share drop in the London’s coffee capsules market?
            System: {
                "text": "Less customers have the required machine",
                "explanation": "Owning a compatible coffee machine is a prerequisite for using Nespresso capsules, so a decline in machine ownership could reduce market share."
            }
            User: Continue.
            System: {
                "text": "Less customers find it in stores",
                "explanation": "Limited availability or stockouts in key retail locations could lead to lower sales and market share loss."
            }
            User: Continue.
            System: {
                "text": "Less customers get interested to buy",
                "explanation": "A decline in brand appeal, marketing effectiveness, or consumer preference could lead to reduced market penetration."
            }
            User: Continue.
            System: {
                "text": "Less interested customers pick up from shelves",
                "explanation": "Even if customers consider buying, they may choose not to purchase due to packaging, pricing, or in-store visibility issues."
            }
            User: Continue.
            System: {
                "text": "Customers are buying less",
                "explanation": "Existing customers might be reducing their consumption due to price sensitivity, alternative products, or changing habits."
            }
            User: Continue.
            System: {
                "is_done": true
            }

            2. User: Node to Decompose: Why Nespresso’s market share drop in the London’s coffee capsules market?
            System: {
                "text": "Our customers have changed",
                "explanation": "Changes in consumer demographics, preferences, or behaviors may have led to a loss of market share."
            }
            User: Continue.
            System: {
                "text": "Our competitors have changed",
                "explanation": "New market entrants, aggressive pricing strategies, or better marketing by competitors could be taking market share from Nespresso."
            }
            User: Continue.
            System: {
                "text": "We have changed",
                "explanation": "Internal changes such as product modifications, pricing strategy adjustments, or branding shifts may have negatively impacted sales."
            }
            User: Continue.
            System: {
                "is_done": true
            }

            3. User: Node to Decompose: Why Nespresso’s market share drop in the London’s coffee capsules market?
            System: {
                "text": "Our product is no longer attractive",
                "explanation": "Consumers may perceive the product as outdated, lower quality, or less innovative than competitors' offerings."
            }
            User: Continue.
            System: {
                "text": "Our price is perceived as too high",
                "explanation": "Price sensitivity could drive customers toward more affordable alternatives, leading to a decline in sales."
            }
            User: Continue.
            System: {
                "text": "New customers to this market are unaware of the product",
                "explanation": "A lack of awareness among potential new buyers could prevent Nespresso from acquiring new market share."
            }
            User: Continue.
            System: {
                "is_done": true
            }

            4. User: Node to Decompose: Why Nespresso’s market share drop in the London’s coffee capsules market?
            System: {
                "text": "Consumer/household market",
                "explanation": "Sales decline in the direct-to-consumer segment, which includes home users purchasing capsules for personal use."
            }
            User: Continue.
            System: {
                "text": "Business/corporate market",
                "explanation": "A drop in bulk purchases by offices, co-working spaces, or businesses using Nespresso machines."
            }
            User: Continue.
            System: {
                "text": "Restaurants market",
                "explanation": "Declining adoption by cafés and restaurants that previously used Nespresso machines for premium coffee services."
            }
            User: Continue.
            System: {
                "is_done": true
            }

            5. User: Node to Decompose: Why Nespresso’s market share drop in the London’s coffee capsules market?
            System: {
                "text": "Caused by internal factors",
                "explanation": "Decline driven by company decisions, such as marketing strategy, pricing, product changes, or supply chain inefficiencies."
            }
            User: Continue.
            System: {
                "text": "Caused by external factors",
                "explanation": "Market share loss due to external influences like economic downturns, new competitors, shifting consumer preferences, or regulatory changes."
            }
            User: Continue.
            System: {
                "is_done": true
            }

            6. User: Node to Decompose: Why Nespresso’s market share drop in the London’s coffee capsules market?
            System: {
                "text": "Marketing-related reasons",
                "explanation": "Issues stemming from branding, advertising, promotions, and customer engagement strategies."
            }
            User: Continue.
            System: {
                "text": "Non-marketing-related reasons",
                "explanation": "Factors outside of marketing, such as supply chain issues, pricing, product quality, or distribution problems."
            }
            User: Continue.
            System: {
                "is_done": true
            }

            7. User: Node to Decompose: Why Nespresso’s market share drop in the London’s coffee capsules market?
            System: {
                "text": "Breaks in supply",
                "explanation": "Disruptions in the supply chain, including raw material shortages, logistics issues, or production delays."
            }
            User: Continue.
            System: {
                "text": "Loss of demand",
                "explanation": "Falling consumer interest, changing preferences, or competition leading to reduced purchases."
            }
            User: Continue.
            System: {
                "is_done": true
            }
            """

        sys_prompt = f"""
            You are an expert in structured problem-solving using MECE (Mutually Exclusive, Collectively Exhaustive) Issue Trees working for a company.
            Your task is to decompose a given node in an issue tree into its most appropriate first-level sub-nodes.

            Instructions:
                - The decomposition must be mutually exclusive and collectively exhaustive (MECE).
                - Use logic consistent with real-world business analysis.
                - Decompose the node iteratively output one node at a time
                - Explanations should be coherent concise and relevant to the problem.
                - Ensure that each sub-node is a distinct and independent factor contributing to the parent node.
                - Avoid overlapping or redundant sub-nodes.
                - Focus on identifying the primary reasons or factors that contribute to the parent node.

            Example:
            {examples}

            All outputs must be a valid json string
        """

        return sys_prompt
                    
    @classmethod
    def user_prompt(cls, is_root: bool)->str:
        if is_root:
            user_prompt = """
                Root Node to Decompose:
                {node_text}

                Output Format:
                You must return responses in a valid single JSON object and wait for continue.
                All outputs must be a valid json string
            """
        else:
            user_prompt = """
                Here are inforamtion about the company you are working for and how they described what is happening.
                {tree_context}
                use this information to help you decompose the node to their needs

                Node to Decompose:
                {node_text}

                Current Issue Tree so far:
                {tree_structure}

                Output Format:
                You must return responses in a valid single JSON object and wait for continue.
                All outputs must be a valid json string
            """

        return user_prompt
    
class DecompositionSolutionAgentPrompts:
    @classmethod
    def system_prompt(cls) -> str:
        examples = """
            1. User: Root Node to Decompose: How can Nespresso increase its market share in London’s coffee capsules market?
            System: {
                "text": "Enhance product offerings",
                "explanation": "Introducing new flavors or limited edition capsules can attract a broader customer base."
            }
            User: Continue.
            System: {
                "text": "Expand distribution channels",
                "explanation": "Partnering with more retailers or setting up additional boutiques can improve product availability."
            }
            User: Continue.
            System: {
                "text": "Increase marketing efforts",
                "explanation": "Investing in targeted advertising campaigns can raise brand awareness and attract new customers."
            }
            User: Continue.
            System: {
                "text": "Adjust pricing strategy",
                "explanation": "Offering discounts or creating loyalty programs can incentivize purchases and retain customers."
            }
            User: Continue.
            System: {
                "text": "Improve customer experience",
                "explanation": "Enhancing customer service and loyalty programs can increase customer retention and satisfaction."
            }
            User: Continue.
            System: {
                "is_done": true
            }

            2. User: Node to Decompose: How to implement a delivery service to reverse declining profits and customer numbers?
            System: {
                "text": "Partner with third-party delivery platforms",
                "explanation": "Collaborating with established delivery services like Uber Eats or DoorDash can quickly expand delivery capabilities without significant upfront investment."
            },
            User: Continue.
            System: {
                "text": "Invest in an in-house delivery team",
                "explanation": "Building an internal delivery team allows for greater control over the delivery process and can ensure consistent service quality."
            },
            User: Continue.
            System: {
                "is_done": true
            }

            3. User: Node to Decompose: Invest in an in-house delivery team
            System: {
                "text": "Implement a delivery management system",
                "explanation": "Using technology to manage orders, track deliveries, and optimize routes can improve efficiency and customer experience."
            },
            User: Continue.
            System: {
                "text": "Develop a delivery menu optimized for transport",
                "explanation": "Creating a menu that ensures food quality and freshness during delivery can enhance customer satisfaction and reduce complaints."
            },
            User: Continue.
            System: {
                "is_done": true
            }
        """

        sys_prompt = f"""
            You are an expert in structured problem-solving using MECE (Mutually Exclusive, Collectively Exhaustive) Issue Trees working for a company.
            Your task is to decompose a given node in an issue tree into its most appropriate first-level sub-nodes, focusing on direct, standalone solutions that do not depend on other solutions not yet implemented.

            Instructions:
                - If decomposing the root node, ensure each sub-node is a direct, standalone solution that fully addresses the problem stated in the root question.
                - The solutions for the root node must be mutually exclusive and collectively exhaustive (MECE), ensuring that each sub-node can independently solve the problem.
                - Limit the decomposition of the root node to a maximum of five MECE solutions.
                - For non-root nodes, determine the most suitable solution-oriented decomposition structure that maintains MECE principles.
                - Ensure that each sub-node represents a direct action or solution relevant to the parent node.
                - Avoid proposing sub-solutions that assume the existence of other solutions not currently in place.
                - The response should only include the first-level sub-nodes, ensuring that each sub-node provides a meaningful breakdown of potential solutions.
                - Use logic consistent with real-world business analysis.
                - Decompose the node iteratively, outputting one node at a time.

            Ensure that each decomposition is relevant to the given problem and focuses on actionable, standalone solutions.

            Example:
            {examples}
            
            All outputs must be a valid json string
        """

        return sys_prompt

    @classmethod
    def user_prompt(cls, is_root: bool) -> str:
        if is_root:
            user_prompt = """
                Root Node to Decompose:
                {node_text}

                Output Format:
                You must return responses in a valid single JSON object and wait for continue.
            """
        else:
            user_prompt = """
                Here is information about the company you are working for and how they described their objectives.
                {tree_context}
                Use this information to help you decompose the node to their needs.

                Node to Decompose:
                {node_text}

                Current Issue Tree so far:
                {tree_structure}

                Output Format:
                You must return a response in a valid single JSON object and wait to continue.
                All outputs must be a valid json string
            """

        return user_prompt
