import { NodeModel } from '@/utils/types/tree';
import { Node, Edge } from '@xyflow/react';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

interface LayoutedElements {
  nodes: Node[];
  edges: Edge[];
}

export class TreeTransformer {
  static transformTree(rootNode: NodeModel): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    this.createNodesAndEdges(rootNode, nodes, edges, 0);

    const { nodes: layoutedNodes, edges: layoutedEdges } =
      this.getLayoutedNodesAndEdges(nodes, edges);

    return { nodes: layoutedNodes, edges: layoutedEdges };
  }

  private static getLayoutedNodesAndEdges = (
    nodes: Node[],
    edges: Edge[],
    direction: 'TB' | 'LR' | 'BT' | 'RL' = 'LR'
  ): LayoutedElements => {
    const nodeWidth = 650;
    const nodeHeight = 110;
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, {
        width: nodeWidth,
        height: nodeHeight,
      });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const position = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: position.x - nodeWidth / 2,
          y: position.y - nodeHeight / 2,
        },
      };
    });
    return { nodes: layoutedNodes, edges };
  };

  private static createNodesAndEdges(
    node: NodeModel,
    nodes: Node[],
    edges: Edge[],
    layer: number
  ): void {
    const nodeData: Node = {
      id: node.id,
      type: node.type,
      data: {
        node: node,
        layer: layer,
      },
      position: { x: 0, y: 0 },
    };
    nodes.push(nodeData);

    node.children.map((child) => {
      edges.push({
        id: `e${node.id}-${child.id}`,
        source: node.id,
        target: child.id,
      });
      this.createNodesAndEdges(child, nodes, edges, layer + 1);
    });
  }
}
