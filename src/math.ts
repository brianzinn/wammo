import { VectorType } from "./graphTypes";

export interface IVector<TVector extends VectorType> {
  readonly vector: TVector
  add(other: Readonly<IVector<TVector>>): IVector<TVector>
  distanceFrom(other: Readonly<IVector<TVector>>): number
  reset(): void
  multiplyInPlace(other: Readonly<IVector<TVector>>): IVector<TVector>
  scale(value: number): IVector<TVector>
  scaleInPlace(value: number): IVector<TVector>
  containedBy(centerPoint: Readonly<IVector<TVector>>, halfDistance: number): boolean
  clone(): IVector<TVector>
  normalizedDirectionTo(other: Readonly<IVector<TVector>>): IVector<TVector>
}

export type Vector2 = {
  x: number
  y: number
}

export type Vector3 = {
  x: number
  y: number
  z: number
}

export class Vector2Impl implements IVector<Vector2> {
  private _vector: Vector2;
  constructor(x = 0, y = 0) {
    this._vector = {
      x, y
    }
  }

  normalizedDirectionTo(other: Readonly<IVector<Vector2>>): IVector<Vector2> {
    // subtract from each other (direction) then scale by inverse of vector length
    const x = this._vector.x - other.vector.x;
    const y = this._vector.y - other.vector.y;
    const length = Math.sqrt(x * x + y * y);

    return new Vector2Impl(x, y).scale(1/length);
  }

  public get vector(): Vector2 { return this._vector }

  public add(other: Readonly<IVector<Vector2>>): IVector<Vector2> {
    this._vector.x += other.vector.x;
    this._vector.y += other.vector.y;
    return this;
  }


  public distanceFrom(other: Readonly<IVector<Vector2>>): number {
    const dx = (this._vector.x - other.vector.x);
    const dy = (this._vector.y - other.vector.y);
    return Math.sqrt((dx * dx) + (dy * dy));
  }

  public reset(): void {
    this._vector.x = 0;
    this._vector.y = 0;
  }

  public containedBy(centerPoint: Readonly<IVector<Vector2>>, halfDistance: number): boolean {
    return (
      this._vector.x >= centerPoint.vector.x - halfDistance &&
      this._vector.x <= centerPoint.vector.x + halfDistance &&
      this._vector.y >= centerPoint.vector.y - halfDistance &&
      this._vector.y <= centerPoint.vector.y + halfDistance
    );
  }

  public multiplyInPlace(other: Readonly<IVector<Vector2>>): IVector<Vector2> {
    this._vector.x *= other.vector.x;
    this._vector.y *= other.vector.y;
    return this;
  }

  public scale(value: number): IVector<Vector2> {
    return new Vector2Impl(this._vector.x * value, this._vector.y * value);
  }

  public scaleInPlace(value: number): IVector<Vector2> {
    this._vector.x *= value;
    this._vector.y *= value;
    return this;
  }

  clone(): IVector<Vector2> {
    return new Vector2Impl(this._vector.x, this._vector.y);
  }
}

/**
 * TODO: missing all the "Z" stuff (just copied Vector2Impl quickly)
 */
export class Vector3Impl implements IVector<Vector3> {
  private _vector: Vector3;
  constructor(x = 0, y = 0, z = 0) {
    this._vector = {
      x, y, z
    }
  }

  public get vector(): Vector3 { return this._vector }

  public add(other: Readonly<IVector<Vector3>>): IVector<Vector3> {
    this._vector.x += other.vector.x;
    this._vector.y += other.vector.y;
    return this;
  }

  normalizedDirectionTo(other: Readonly<IVector<Vector3>>): IVector<Vector3> {
    // subtract from each other (direction) then scale by inverse of vector length
    const x = this._vector.x - other.vector.x;
    const y = this._vector.y - other.vector.y;
    const length = Math.sqrt(x * x + y * y);

    return new Vector3Impl(x, y, 0).scale(1/length);
  }

  distanceFrom(other: Readonly<IVector<Vector3>>): number {
    const dx = (this._vector.x - other.vector.x);
    const dy = (this._vector.y - other.vector.y);
    return Math.sqrt((dx * dx) + (dy * dy));
  }

  reset(): void {
    this._vector.x = 0;
    this._vector.y = 0;
  }

  public containedBy(centerPoint: Readonly<IVector<Vector3>>, halfDistance: number): boolean {
    return (
      this._vector.x >= centerPoint.vector.x - halfDistance &&
      this._vector.x <= centerPoint.vector.x + halfDistance &&
      this._vector.y >= centerPoint.vector.y - halfDistance &&
      this._vector.y <= centerPoint.vector.y + halfDistance
    );
  }

  public multiplyInPlace(other: Readonly<IVector<Vector3>>): IVector<Vector3> {
    this._vector.x *= other.vector.x;
    this._vector.y *= other.vector.y;
    return this;
  }

  public scale(value: number): IVector<Vector3> {
    return new Vector3Impl(this._vector.x * value, this._vector.y * value);
  }

  public scaleInPlace(value: number): IVector<Vector3> {
    this._vector.x *= value;
    this._vector.y *= value;
    return this;
  }

  clone(): IVector<Vector3> {
    return new Vector3Impl(this._vector.x, this._vector.y);
  }
}