import torch
import cohere
import numpy as np

class CohereRetriever:
    def __init__(self, threshold = 0.5):
        self.co = cohere.Client(api_key="LAF1SbBmNyi3jHF41TumsWTqo55kx5vawJrMNt3W")
        self.threshold = threshold
        self.model = "embed-english-v3.0"

    def embed(self, texts, input_type):

        return self.co.embed(
            texts=texts,
            model=self.model,
            input_type=input_type,
            embedding_types=["float"],
        ).embeddings.float
    
    def retrieve(self, queries, docs):
        # Better suited for docs and queries sim
        if isinstance(queries, str):
            queries = [queries]
        
        queries_emb = self.embed(queries, "search_query")
        docs_emb = self.embed(docs, "search_document")

        scores_tensor = torch.tensor(np.dot(queries_emb, np.transpose(docs_emb)))
        
        retrieved_docs = {}

        for query_idx, query in enumerate(queries):
            query_scores = scores_tensor[query_idx]
            valid_indices = torch.where(query_scores > self.threshold)[0]

            retrieved = [
                docs[idx] for idx in valid_indices
            ]

            retrieved_sorted = sorted(retrieved, key=lambda x: x[1], reverse=True)

            retrieved_docs[query] = retrieved_sorted

        return retrieved_docs
    
    def rerank(self, query, docs, top_n = 10):
        # Better for actual query and answering docs, better suited for online searchs
        results = self.co.rerank(model="rerank-v3.5", query=query, documents=docs, top_n=min(top_n, len(docs)))
        ranked_docs = []
        for res in results.results:
            ranked_docs.append(docs[res.index])

        return ranked_docs

        