import Queue from './queue';
import { GraphNode, NodeIdentifierType, VectorType } from './graphTypes';
import { IVector } from './math';

export default class GraphSearcher<TId extends NodeIdentifierType, TVector extends IVector<VectorType>> {
    BFS = (node: GraphNode<TVector, TId>, nodes: GraphNode<TVector, TId>[], includeOutEdges = false): GraphNode<TVector, TId>[] => {
        const queue = new Queue<GraphNode<TVector, TId>>();
        const explored = new Set<TId>();
        queue.enqueue(node);
        explored.add(node.id);
        while (!queue.isEmpty()) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const item: GraphNode<TVector, TId> = queue.dequeue()!;
            // console.log('dequeued:', item.constructor);

            item.dependsOn.filter(dnd => !explored.has(dnd.nodeId)).forEach(dnd => {
                const nodeMatch: GraphNode<TVector, TId> | undefined = nodes.find(s => s.id === dnd.nodeId);
                if (nodeMatch === undefined) {
                    console.error("Cannot find node for dnd (directional node dependency):", dnd);
                } else {
                    explored.add(nodeMatch.id);
                    queue.enqueue(nodeMatch);
                }
           });

            if (includeOutEdges === true) {
                item.dependenceFor.filter(dnd => !explored.has(dnd.nodeId)).forEach(dnd => {
                    const nodeMatch: GraphNode<TVector, TId> | undefined = nodes.find(n => n.id === dnd.nodeId);
                    if (nodeMatch === undefined) {
                        console.error("Cannot find node for dnd (Directional Node Dependency):", dnd);
                    } else {
                        explored.add(nodeMatch.id);
                        queue.enqueue(nodeMatch);
                    }
                });
           }
        }

        return nodes.filter(n => explored.has(n.id));
     }
}