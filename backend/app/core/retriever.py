import torch
from typing import Dict, List
from transformers import pipeline
from transformers import AutoTokenizer, AutoModel
from sklearn.metrics.pairwise import cosine_similarity


class Retriever:

    def __init__(self, retrival_mode: str = 'nli'):
        self.retrival_mode = retrival_mode
        if self.retrival_mode == 'nli':
            self.nli_pipeline = pipeline(
                "text-classification", model="roberta-large-mnli")
        else:
            self.tokenizer = AutoTokenizer.from_pretrained(
                'sentence-transformers/all-MiniLM-L6-v2')
            self.model = AutoModel.from_pretrained(
                'sentence-transformers/all-MiniLM-L6-v2')
            self.threshold = 0.85


    def embed(self, texts):
        inputs = self.tokenizer(texts, padding=True,
                                truncation=True, return_tensors="pt")
        with torch.no_grad():
            outputs = self.model(**inputs)
        embeddings = outputs.last_hidden_state[:, 0, :].cpu().numpy()
        return embeddings

    def get_by_nli(self, facts: List[str], queries: List[str]) -> List[Dict[str, List[str]]]:
        results = dict()
        for query in queries:
            inputs = [fact + " [SEP] " + query for fact in facts]

            r = self.nli_pipeline(inputs)

            results[query] = []
            for fact, result in zip(facts, r):
                if result['label'] in ["ENTAILMENT", "CONTRADICTION"]:
                    results[query].append(fact)

            if len(results[query]) == 0:
                results.pop(query)

        return results

    def get_by_cos_sim(self, facts: List[str], queries: List[str]) -> List[Dict[str, List[str]]]:
        fact_embeddings = self.embed(facts)
        query_embeddings = self.embed(queries)
        similarities = cosine_similarity(query_embeddings, fact_embeddings)

        results = []
        for query_idx, query_similarities in enumerate(similarities):
            high_sim_facts = [facts[fact_idx] for fact_idx, similarity in enumerate(
                query_similarities) if similarity >= self.threshold]
            if high_sim_facts:
                results.append({queries[query_idx]: high_sim_facts})

        return results

    def get_high_similarity_facts(self, facts: List[str], queries: List[str]) -> List[Dict[str, List[str]]]:
        if not facts or not queries:
            return []

        if self.retrival_mode == 'nli':
            return self.get_by_nli(facts, queries)
        else:
            return self.get_by_cos_sim(facts, queries)
