import { NodeIdentifierType, VectorType } from "./graphTypes";
import { IVector } from "./math";

export class PhysicsBody<TVector extends IVector<VectorType>, TId extends NodeIdentifierType> {
  public mass = 1;

  constructor(public id: TId, public position: TVector, public force: TVector, public velocity: TVector) {
    this.velocity = velocity;
    this.force = force;
  }

  reset(): void {
    this.force.reset();
  }
}
