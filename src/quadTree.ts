import { BHTree, NodeIdentifierType, VectorType } from './graphTypes';
import { IVector, Vector2, Vector2Impl } from './math';
import { PhysicsBody } from './physics';
import Queue from './queue';

export const treeFactory = <TVector extends IVector<VectorType>, TId extends NodeIdentifierType>(type: { new(): BHTree<TVector, TId>}): BHTree<TVector, TId> => {
  return new type();
}

// /**
//  * Axis-aligned bounding box with half dimension and center
//  */
// export class AABB<TVector extends VectorType> {
//   constructor(public center: TVector, public halfWidth: number /*, public halfHeight: number switched to squares */) {
//   }

//   contains(point: IVector<Vector2>): boolean {
//     return (
//       point.x >= this.center.x - this.halfWidth &&
//       point.x <= this.center.x + this.halfWidth &&
//       point.y >= this.center.y - this.halfWidth &&
//       point.y <= this.center.y + this.halfWidth
//     );
//   }

//   // Can be used for collision detection (passing in an AABB to the QuadTree)
//   // TODO: make an AABB 3D impl and change this to an interface.
//   intersects(other: AABB<TVector>): boolean {
//     return !(
//       other.center.x - other.halfWidth > this.center.x + this.halfWidth ||
//       other.center.x + other.halfWidth < this.center.x - this.halfWidth ||
//       other.center.y - other.halfWidth > this.center.y + this.halfWidth ||
//       other.center.y + other.halfWidth < this.center.y - this.halfWidth
//     )
//   }
// }

export enum NodeType {
  Empty = 'Empty',
  Body = 'Body',
  Node = 'Node'
}

/**
 * https://en.wikipedia.org/wiki/Quadtree
 * Copied from this youtube video.  Not optimised (quadtree needs to be rebuild on every frame render).
 * https://www.youtube.com/watch?v=OJxEcs0w_kE
 * 
 * TODO: if entire "range" in included can add all points
 * TODO: subdividing should move the points to the subtree?
 */
export class BHQuadTree<TId extends NodeIdentifierType> implements BHTree<IVector<Vector2>, TId> {
  public body: PhysicsBody<IVector<Vector2>, TId> | null = null;
  public subnodes: BHTree<IVector<Vector2>, TId>[] = [];
  public nodeType: NodeType = NodeType.Empty;
  // public boundary: AABB<Vector2>;
  public centerOfMass: IVector<Vector2> = new Vector2Impl();
  public mass = 0;

  /**
   * Creates a new BH Tree with specified center point and directions out.
   *
   * @param center center of bounding box
   * @param boundaryWidth distance out from center that contains the bounding box (squares only)
   */
  constructor(public center: IVector<Vector2>, public halfDistance: number, public parent: BHQuadTree<TId> | null) {
    // this.boundary = new AABB(center, boundaryWidth);
  }

  private subdivide() {
    const { x: cx, y: cy } = this.center.vector;

    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        const subnode = new BHQuadTree<TId>(
          new Vector2Impl(
            cx + 0.5 * x * this.halfDistance,
            cy + 0.5 * y * this.halfDistance
          ),
          this.halfDistance / 2,
          this);
        this.subnodes.push(subnode);
      }
    }
  }

  // TODO: make this STATIC. it will create a new tree using min/max bounds of all bodies.
  public insertMulti(bodies: PhysicsBody<IVector<Vector2>, TId>[]): void {
    for (const body of bodies) {
      this.insert(body);
    }
  }

  public insert(newBody: PhysicsBody<IVector<Vector2>, TId>): void {
    if (this.nodeType === NodeType.Empty) {
      this.nodeType = NodeType.Body;
      this.body = newBody;
    } else if (this.nodeType === NodeType.Body) {
      if (this.body === null) {
        throw new Error('body cannot be null');
      }

      this.nodeType = NodeType.Node;
      this.subdivide();
      for (const subnode of this.subnodes) {
        if (subnode.center.containedBy(this.body.position, subnode.halfDistance)) {
          subnode.insert(this.body);
        }
      }
      this.body = null;
    }

    // each node maintains it's center of mass
    // The center of mass of a group of bodies is the average position of a body in that group, weighted by mass. 
    this.centerOfMass.scaleInPlace(this.mass);
    const mass = newBody.mass;
    this.centerOfMass.add(newBody.position.scale(mass));
    this.mass += mass;
    this.centerOfMass.scaleInPlace(1 / this.mass);

    if (this.nodeType === NodeType.Node) {
      for (const subnode of this.subnodes) {
        if (subnode.center.containedBy(newBody.position, subnode.halfDistance)) {
          subnode.insert(newBody);
        }
      }
    }
  }
}

export default class BHTreeVisitor {
  /**
   * Assumes that the "input" is part of the tree.  It would always be close to itself (within θ) and ignored.
   */
  VisitForcesForBody = <TVector extends VectorType, TId extends NodeIdentifierType>(
    root: BHTree<IVector<TVector>, TId>,
    input: PhysicsBody<IVector<TVector>, TId>,
    theta: number,
    visit: (mass: number, direction: IVector<VectorType>, distance: number) => void
    ): void => {
    const queue = new Queue<BHTree<IVector<TVector>, TId>>();

    if (root.parent !== null) {
      throw new Error('can only visit from root');
    }

    if (root.nodeType === NodeType.Empty) {
      return;
    } else if (root.nodeType === NodeType.Body) {
      // only a single node in the tree?
      if (root.body === null) {
        throw new Error('cannot have "Body" node type with no body');
      }
      if (root.body.id !== input.id) {
        const distance: number = input.position.distanceFrom(root.body.position);
        const direction: IVector<VectorType> = input.position.normalizedDirectionTo(root.body.position);
        visit(root.body.mass, direction, distance);
      }
      return;
    }

    // for (const node of root.subnodes) {
    //   queue.enqueue(node);
    // }

    let node: BHTree<IVector<TVector>, TId> | undefined = root;
    do {
      switch (node.nodeType) {
        case NodeType.Empty:
          break;
        case NodeType.Body:
          if (node.body === null) {
            throw new Error('Body node type cannot have "Null" body');
          }

          if (node.body.id !== input.id) {
            // ignoring velocity - it is instantanteous force
            const bodyDistance = node.body.position.distanceFrom(input.position);
            const bodyDirection = input.position.normalizedDirectionTo(node.body.position);

            visit(node.mass, bodyDirection, bodyDistance);
          }
          break;
        case NodeType.Node:
          const d = input.position.distanceFrom(node.centerOfMass);
          // The node is sufficiently far away when this ratio (s/d) is smaller than a threshold value θ
          if ((node.halfDistance * 2 / d) < theta) {
            const centerOfMassDistance = node.centerOfMass.distanceFrom(input.position);
            const centerOfMassDirection = input.position.normalizedDirectionTo(node.centerOfMass);
            visit(node.mass, centerOfMassDirection, centerOfMassDistance);
          } else {
            for (const subnode of node.subnodes) {
              queue.enqueue(subnode);
            }
          }
          break;
      }

      node = queue.dequeue();
    } while (node !== undefined)
  } 
}