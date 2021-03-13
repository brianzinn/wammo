import { Graph } from "./graph";
import { NodeIdentifierType, VectorType } from "./graphTypes";
import { integrator } from "./integrator";
import { PhysicsBody } from "./physics";
import { Spring } from "./forces/spring";
import { IVector } from "./math";

export type BodyForceApi<TVector extends IVector<VectorType>, TId extends NodeIdentifierType> = {
  prepare: (bodies: PhysicsBody<TVector, TId>[]) => void
  applyBodyForce: (body: PhysicsBody<TVector, TId>) => void
}

export type SolverApi<TVector extends IVector<VectorType>, TId extends NodeIdentifierType> = {
  addBody: (body: PhysicsBody<TVector, TId>) => void
  addBodyForce: (forceName: string, bodyForceApi: BodyForceApi<TVector, TId>) => void
  addSpring: (fromId: TId, toId: TId, length?: number, coefficient?: number) => void
  addSpringForce: (forceName: string, forceFunction: (spring: Spring<TVector, TId>) => void) => void
  loadGraph: (graph: Graph<TVector, TId>, createVector: new() => TVector) => void
  step: (deltaTime: number) => number
}

export type SpringForceFn<TVector extends IVector<VectorType>, TId extends NodeIdentifierType> = (spring: Spring<TVector, TId>) => void;

export const solver = <TVector extends IVector<VectorType>, TId extends NodeIdentifierType>(): SolverApi<TVector, TId> => {
  let bodies: PhysicsBody<TVector, TId>[] = []; // Bodies in this simulation.
  let bodiesMap = new Map<TId, PhysicsBody<TVector, TId>>();

  let springs: Spring<TVector, TId>[] = []; // Springs in this simulation.

  const bodyForcesMap = new Map<string, BodyForceApi<TVector, TId>>();
  const bodyForces: BodyForceApi<TVector, TId>[] = [];

  const springForcesMap = new Map<string, SpringForceFn<TVector, TId>>();
  const springForces: ((spring: Spring<TVector, TId>) => void)[] = [];

  const loadGraph = (graph: Graph<TVector, TId>, createVector: new() => TVector) => {
    bodies = [];
    springs = [];
    bodiesMap = new Map<TId, PhysicsBody<TVector, TId>>();
    for(const node of graph.nodes) {
      const physicsBody = new PhysicsBody<TVector, TId>(node.id, node.position, new createVector(), new createVector()); // init to node position
      console.log('adding body:', physicsBody);
      bodies.push(physicsBody);
      bodiesMap.set(node.id, physicsBody);
    }

    for(const node of graph.nodes) {
      for(const dep of node.dependenceFor) {
        const from = bodiesMap.get(node.id);
        const to = bodiesMap.get(dep.nodeId);
        if (from === undefined) {
          throw new Error(`cannot find ${node.id}`);
        }
        if (to === undefined) {
          throw new Error(`cannot find linked dep to ${dep.nodeId}`);
        }
        console.log('adding spring:', from.id, to.id, dep.length);
        springs.push(new Spring(from, to, undefined, dep.length));
      }
    }
  }

  const addSpringForce = (forceName: string, forceFunction: (spring: Spring<TVector, TId>) => void): void => {
    if (springForcesMap.has(forceName)) {
      throw new Error('Force ' + forceName + ' is already added');
    }

    springForcesMap.set(forceName, forceFunction);
    springForces.push(forceFunction);
  }

  const addBodyForce = (forceName: string, forceFunction: BodyForceApi<TVector, TId>): void => {
    if (bodyForcesMap.has(forceName)) {
      throw new Error('Force ' + forceName + ' is already added');
    }

    bodyForcesMap.set(forceName, forceFunction);
    bodyForces.push(forceFunction);
  }

  const addBody = (body: PhysicsBody<TVector, TId>): void => {
    console.log('adding body:', body);
    bodies.push(body);
    bodiesMap.set(body.id, body);
  }

  const addSpring = (fromId: TId, toId: TId, length?: number, coefficient?: number): void => {
    const from = bodiesMap.get(fromId);
    const to = bodiesMap.get(toId);
    if (from === undefined) {
      throw new Error(`cannot find ${fromId}`);
    }
    if (to === undefined) {
      throw new Error(`cannot find linked dep to ${toId}`);
    }
    console.log('adding spring:', from.id, to.id, length);
    springs.push(new Spring(from, to, length, coefficient));
  }

  return {
    addBody,
    addBodyForce,
    addSpring,
    addSpringForce,
    loadGraph,
    step: (deltaTime: number): number => {
      for(const body of bodies) {
        body.reset();
      }

      for (const bodyForce of bodyForces) {
        bodyForce.prepare(bodies);

        for(const body of bodies) {
          bodyForce.applyBodyForce(body);
        }
      }

      for (const springForce of springForces) {
        for(const spring of springs) {
          springForce(spring);
        }
      }

      // console.log(bodies.map(b => `${b.pos.x},${b.pos.y}`).join(','));

      const distanceSquared = integrator<TVector, TId>(bodies, deltaTime);
      // console.log('distance step', distanceSquared);
      return distanceSquared;
    }
  }
}