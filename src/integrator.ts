import { NodeIdentifierType, VectorType } from "./graphTypes";
import { IVector } from "./math";
import { PhysicsBody } from "./physics";

/**
 * Uses timeStep with Euler method as solver @see http://en.wikipedia.org/wiki/Euler_method
 *
 * @returns {Number} squared distance of total position updates.
 */
export const integrator = <TVector extends IVector<VectorType>, TId extends NodeIdentifierType>(bodies: PhysicsBody<TVector, TId>[], timeStep: number): number => {
  let dx = 0, tx = 0;
  let dy = 0, ty = 0;

  for (const body of bodies) {
    const coeff = timeStep / body.mass;
    // console.log(`velocity before {${body.force.x},${body.force.y}}. mass: ${body.mass}`)
    body.velocity.vector.x += coeff * body.force.vector.x;
    body.velocity.vector.y += coeff * body.force.vector.y;

    const vx = body.velocity.vector.x;
    const vy = body.velocity.vector.y;
    // console.log(`velocity after {${body.force.x},${body.force.y}}. mass: ${body.mass}`)

    const v = Math.sqrt(vx * vx + vy * vy);
    // (vector.length() > 1)
    if (v > 1) {
      // Slow down solution by normalizing the vector.
      // vector.normalize();
      body.velocity.vector.x = vx / v;
      body.velocity.vector.y = vy / v;
    }

    dx = timeStep * body.velocity.vector.x;
    dy = timeStep * body.velocity.vector.y

    // console.log('delta x', dx);
    // move body
    body.position.vector.x += dx;
    body.position.vector.y += dy;

    // accumulate total movement (to detect graph stability)
    tx += Math.abs(dx);
    ty += Math.abs(dy);
  }

  return (tx * tx + ty * ty) / bodies.length;
}