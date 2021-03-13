import { NodeIdentifierType, VectorType } from "../graphTypes";
import { IVector } from "../math";
import { PhysicsBody } from "../physics";
import { SpringForceFn } from "../solver";

/**
 * Represents a physical spring. Spring connects two bodies, has equilibrium length and coefficient (ie: stiffness)
 */
export class Spring<TVector extends IVector<VectorType>, TId extends NodeIdentifierType> {
  constructor(public from: PhysicsBody<TVector, TId>, public to: PhysicsBody<TVector, TId>, public length?: number, public coefficient?: number) {
  }
}

/**
 * Simulates a spring force using Hooke's Law @see https://en.wikipedia.org/wiki/Hooke's_law
 *
 * @param defaultSpringCoefficient coefficient where a higher number is a more solid spring
 * @param defaultSpringLength length where equilibrium is reached in the spring
 */
export const springForce = <TVector extends IVector<VectorType>, TId extends NodeIdentifierType>(defaultSpringCoefficient: number, defaultSpringLength: number): SpringForceFn<TVector, TId> => {

  return (spring: Spring<TVector, TId>) => {
    const sourceBody = spring.from;
    const targetBody = spring.to;
    const equilibriumLength = (spring.length !== undefined && spring.length > 0) ? spring.length : defaultSpringLength;

    // target - source (distance apart with velocity accounted for)
    // TODO: this is ONLY 2D (need to do via IVector interface these calculations)
    const dx = (targetBody.position.vector.x + targetBody.velocity.vector.x) - (sourceBody.position.vector.x + sourceBody.velocity.vector.x);
    const dy = (targetBody.position.vector.y + targetBody.velocity.vector.y) - (sourceBody.position.vector.y + sourceBody.velocity.vector.y);;

    const distanceWithVelocity = Math.sqrt(dx * dx + dy * dy);
    // console.log('distance at speed:', distanceWithVelocity);
    const deltaDistance = (distanceWithVelocity - equilibriumLength) / distanceWithVelocity;

    const coefficient = ((spring.coefficient !== undefined && spring.coefficient > 0) ? spring.coefficient : defaultSpringCoefficient) * deltaDistance;

    sourceBody.force.vector.x += coefficient * dx;
    sourceBody.force.vector.y += coefficient * dy;

    // console.log('force delta along X body 1:', coefficient, dx)

    targetBody.force.vector.x -= coefficient * dx;
    targetBody.force.vector.y -= coefficient * dy;
  }
}