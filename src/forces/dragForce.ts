import { NodeIdentifierType, VectorType } from "../graphTypes";
import { IVector } from "../math";
import { PhysicsBody } from "../physics";
import { BodyForceApi } from "../solver";

/**
 * Slows down solution with a drag effect (ie: air resistance).
 *
 * @param dragCoefficient drag coefficient to apply
 * @returns API that will apply drag force to a physics body (reduce forces applied to velocity).
 */
export const dragForce = <TVector extends IVector<VectorType>, TId extends NodeIdentifierType>(dragCoefficient = 0.1): BodyForceApi<TVector, TId> => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    prepare: (): void => { },
    applyBodyForce: (body: PhysicsBody<TVector, TId>): void => {
      // TODO: Scale by drag coefficient (or 1 - dragCoefficient??)
      body.force.vector.x -= dragCoefficient * body.velocity.vector.x;
      body.force.vector.y -= dragCoefficient * body.velocity.vector.y;
    }
  }
}