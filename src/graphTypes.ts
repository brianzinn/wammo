/**
 * Starting point: from https://github.com/brianzinn/babylonjs-directed-graph
 */
import { IVector, Vector2, Vector3 } from "./math";
import { PhysicsBody } from "./physics";
import { NodeType } from "./quadTree";

export type GraphConnections<T> = {
  id: number,
  points: T[],
  // curvePoints?: Vector3[],
  // lastTangent?: Vector3,
  // yRotation: number | undefined
}

export type NodeIdentifierType = number | string;

export type VectorType = Vector2 | Vector3;

export type GraphNode<TVector extends IVector<VectorType>, TId extends NodeIdentifierType> = {
  id: TId
  name: string
  position: TVector
  physicsBody: PhysicsBody<TVector, TId> | null
  dependsOn: DirectionalNodeDependency<TVector, TId>[]
  dependenceFor: DirectionalNodeDependency<TVector, TId>[]
}

export type DirectionalNodeDependency<TVector extends IVector<VectorType>, TId extends NodeIdentifierType> = {
  id: number
  nodeId: TId
  graphNode: GraphNode<TVector, TId>
  length?: number // | () => number
  coefficient?: number
};

/**
 * Barnes-Hut tree
 */
export interface BHTree<TVector extends IVector<VectorType>, TId extends NodeIdentifierType> {
  parent: BHTree<TVector, TId> | null
  body: null | PhysicsBody<TVector, TId>
  subnodes: BHTree<TVector, TId>[]
  nodeType: NodeType
  center: TVector
  halfDistance: number
  centerOfMass: TVector
  mass: number

  insert(newBody: PhysicsBody<TVector, TId>): void
  insertMulti(bocies: PhysicsBody<TVector, TId>[]): void
}