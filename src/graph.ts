import { DirectionalNodeDependency, GraphNode, NodeIdentifierType, VectorType } from "./graphTypes";
import { IVector } from "./math";

export type CreateNode<TVector extends IVector<VectorType>, TId extends NodeIdentifierType> = {
  id: TId
  position: TVector,
  velocity: TVector
}

export type LinkNode<TId extends NodeIdentifierType> = {
  fromId: TId
  toId: TId
  /**
   * Length when equilibrium is reached.
   */
  length?: number
  /**
   * A constant factor characteristic of the spring (i.e., its stiffness).
   */
  coefficient?: number
}

export type GraphCreateOptions<TVector extends IVector<VectorType>, TId extends NodeIdentifierType> = {
  nodes?: CreateNode<TVector, TId>[]
  links?: LinkNode<TId>[]
  /**
   * Mass of the body.
   */
  defaultBodyMass?: number
  /**
   * Length when equilibrium is reached.
   */
  defaultSpringLength?: number
  /**
   * A constant factor characteristic of the spring (i.e., its stiffness)
   */
  defaultSpringCoefficient?: number
}

export class Graph<TVector extends IVector<VectorType>, TId extends NodeIdentifierType> {
  private _nodeMap: Map<TId, GraphNode<TVector, TId>> = new Map<TId, GraphNode<TVector, TId>>();
  private _nodes: GraphNode<TVector, TId>[] = [];
  private _dependencyId = 0;

  constructor(options?: GraphCreateOptions<TVector, TId>) {
    options = options || {};

    if (Array.isArray(options.nodes)) {
      for(const node of options.nodes) {
        this._addNode(node);
      }

      if (Array.isArray(options.links)) {
        for(const link of options.links) {
          this.addLink(link.fromId, link.toId, link.length);
        }
      }
    }
  }

  private _addNode(node: CreateNode<TVector, TId>) {
    if (this._nodeMap.has(node.id)) {
      throw new Error(`Node Ids must be unique: '${node.id}'.`);
    }
    const newNode: GraphNode<TVector, TId> = {
      id: node.id,
      name: '',
      dependenceFor: [],
      dependsOn: [],
      position: node.position, // init with spiral? https://en.wikipedia.org/wiki/Fermat%27s_spiral
      physicsBody: null
    }
    this._nodeMap.set(newNode.id, newNode);
    this._nodes.push(newNode);
  }

  public addNode(node: CreateNode<TVector, TId>): void {
    this._addNode(node);
  }

  addLink(fromNodeId: TId, toNodeId: TId, length?: number, coefficient?: number): void {
    const fromNode = this._nodeMap.get(fromNodeId);
    const toNode = this._nodeMap.get(toNodeId);
    
    if (fromNode === undefined) {
      throw new Error(`Cannot find "from" node ${fromNodeId}`);
    }
    if (toNode === undefined) {
      throw new Error(`Cannot find "from" node ${toNodeId}`);
    }

    const to: DirectionalNodeDependency<TVector, TId> = {
      graphNode: toNode,
      id: this._dependencyId++,
      nodeId: toNode.id,
      length
    };
    fromNode.dependsOn.push(to);

    const from: DirectionalNodeDependency<TVector, TId> = {
      graphNode: fromNode,
      id: this._dependencyId++,
      nodeId: fromNode.id,
      length,
      coefficient
    };
    toNode.dependenceFor.push(from);
  }

  public get nodes() : GraphNode<TVector, TId>[] {
    return this._nodes;
  }
}