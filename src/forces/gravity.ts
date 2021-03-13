
import { BHTree, NodeIdentifierType, VectorType } from "../graphTypes";
import { IVector } from "../math";
import { PhysicsBody } from "../physics";
import BHTreeVisitor from "../quadTree";
import { BodyForceApi } from "../solver";

/**
 * Uses universal law of gravitation.
 * https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation
 * 
 * the attractive force (F) between two point-like bodies is directly proportional to the product of their masses (m1 and m2) and inversely proportional
 * to the square of the distance, r, between them
 * 
 * @param theta Applies gravity forces.  quad/octree outside of theta distance will apply their Center of Mass
 * @param gravity Negative gravity pushes nodes apart (ie: -1)
 * @param createTree Method to create a BH tree based on the Vector Type requested.
 * @returns API that can be used in simulations (tree must be re-created on every iteration!)
 */
export const gravityForce = <TVector extends VectorType, TId extends NodeIdentifierType>(
  theta: number,
  gravity: number,
  createTree: (bodies: PhysicsBody<IVector<TVector>, TId>[]
  ) => BHTree<IVector<TVector>, TId>): BodyForceApi<IVector<TVector>, TId> => {

  let tree: BHTree<IVector<TVector>, TId>;
  return {
    prepare: (bodies: PhysicsBody<IVector<TVector>, TId>[]): void => {
      tree = createTree(bodies);
    },
    applyBodyForce: (body: PhysicsBody<IVector<TVector>, TId>): void => {
      //  the attractive force (F) between two point-like bodies is directly proportional to the product of their masses (m1 and m2) and inversely proportional to the square of the distance, r, between them:
      const applyGravityForce = (mass: number, direction: IVector<TVector>, distance: number) => {
        const F = gravity * (body.mass * mass) / (distance * distance);
        body.force.add(direction.scale(F));
      };
      new BHTreeVisitor().VisitForcesForBody<TVector, TId>(tree, body, theta, applyGravityForce);
    }
  }
}