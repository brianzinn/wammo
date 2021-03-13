import assert from 'assert';
import { Graph } from '../src/graph';
import { IVector, Vector2, Vector2Impl } from '../src/math';

import { solver } from '../src/solver';
import { springForce } from '../src/forces/spring';
import { gravityForce } from '../src/forces/gravity';
import { BHQuadTree } from '../src/quadTree';

describe(' > Solver should converge with expected results', function test() {

  const equalsEpsilon = (expected: number, actual: number, epsilon = 1e-6 /* Number.EPSILON is too small! */) => {
    assert.ok(Math.abs(expected - actual) < epsilon, `${expected} (expected) and ${actual} (actual) did not differ by less than ${epsilon}.`)
  }

  it('Should push the nodes apart (spring only)', () => {
    const graph = new Graph<IVector<Vector2>, number>({
      nodes: [{
        id: 1,
        position: new Vector2Impl(-2, 0),
        velocity: new Vector2Impl()
      }, {
        id: 2,
        position: new Vector2Impl(2, 0),
        velocity: new Vector2Impl()
      }],
      links: [{
        fromId: 1,
        toId: 2
      }]
    });

    assert.notDeepStrictEqual(null, graph);

    const springFn = springForce(0.9, 10);

    const simulation = solver();
    simulation.loadGraph(graph, Vector2Impl);
    simulation.addSpringForce('spring-fn', springFn);
    
    let delta = Infinity;
    let iterations=0;

    const MAX_ITERATIONS = 5000;
    const EXPECTED_MAX_ITERATIONS = 350; // we want to lower this number!
    while( (delta >= 1e-14 && iterations < MAX_ITERATIONS)) { // i < 30 /* warm up simulation */ ||
      iterations++;
      delta = simulation.step(3/60);
    }

    assert.ok(delta < 1e-6, 'should have converged at a solution.');
    assert.ok(iterations < EXPECTED_MAX_ITERATIONS, `should not take more than ${EXPECTED_MAX_ITERATIONS} iterations to converge at a reasonable solution.  took ${iterations}`);

    const dx = graph.nodes[1].position.vector.x - graph.nodes[0].position.vector.x;
    const dy = graph.nodes[1].position.vector.y - graph.nodes[0].position.vector.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    console.log(`completed in ${iterations} iterations with distance ${distance} ~= 10.`);
    equalsEpsilon(distance, 10, 1e-3);
  })

  it('Should bring the nodes together (spring only)', () => {
    const graph = new Graph<Vector2Impl, number>({
      nodes: [{
        id: 1,
        position: new Vector2Impl(-2, 0),
        velocity: new Vector2Impl()
      }, {
        id: 2,
        position: new Vector2Impl(2, 0),
        velocity: new Vector2Impl()
      }],
      links: [{
        fromId: 1,
        toId: 2
      }]
    });

    assert.notDeepStrictEqual(null, graph);

    const springFn = springForce(0.8, 2);

    const simulation = solver();
    simulation.loadGraph(graph, Vector2Impl);
    simulation.addSpringForce('spring-fn', springFn);

    let delta = Infinity;
    let iterations=0;

    const MAX_ITERATIONS = 5000;
    const EXPECTED_MAX_ITERATIONS = 350; // we want to lower this number!
    while( (delta >= 1e-14 && iterations < MAX_ITERATIONS)) { // i < 30 /* warm up simulation */ ||
      iterations++;
      delta = simulation.step(3/60);
    }

    assert.ok(delta < 1e-6, 'should have converged at a solution.');
    assert.ok(iterations < EXPECTED_MAX_ITERATIONS, `should not take more than ${EXPECTED_MAX_ITERATIONS} iterations to converge at a reasonable solution.  took ${iterations}`);

    const dx = graph.nodes[1].position.vector.x - graph.nodes[0].position.vector.x;
    const dy = graph.nodes[1].position.vector.y - graph.nodes[0].position.vector.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    console.log(`completed in ${iterations} iterations with distance ${distance} ~= 2.`);
    equalsEpsilon(distance, 2, 1e-3);
  })

  it.skip('Should push nodes apart (negative gravity)', () => {
    const graph = new Graph<Vector2Impl, number>({
      nodes: [{
        id: 1,
        position: new Vector2Impl(-2, 0),
        velocity: new Vector2Impl()
      }, {
        id: 2,
        position: new Vector2Impl(2, 0),
        velocity: new Vector2Impl()
      }, {
        id: 3,
        position: new Vector2Impl(0, 2),
        velocity: new Vector2Impl()
      }],
      links: [{
        fromId: 1,
        toId: 2,
      }, {
        fromId: 1,
        toId: 3
      }]
    });

    assert.notDeepStrictEqual(null, graph);

    const simulation = solver();
    simulation.loadGraph(graph, Vector2Impl);

    const gravityForceFns = gravityForce<Vector2, number>(0.75, -1, (bodies) => {
      const tree = new BHQuadTree<number>(new Vector2Impl(), 10, null);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      tree.insertMulti(bodies);
      return tree;
    });
    simulation.addBodyForce('bodies-fn', gravityForceFns);

    const springFn = springForce(0.9, 2);
    simulation.addSpringForce('spring-fn', springFn);

    let delta = Infinity;
    let iterations=0;

    const MAX_ITERATIONS = 5000;
    const EXPECTED_MAX_ITERATIONS = 350; // we want to lower this number!

    const STOP_DELTA = 1e-2;

    while(iterations < 10 || (delta >= STOP_DELTA && iterations < MAX_ITERATIONS)) {
      iterations++;
      delta = simulation.step(3/60);
    }

    console.log('finished solution with delta:', delta);
    assert.ok(delta < STOP_DELTA, 'should have converged at a solution.');
    assert.ok(iterations < EXPECTED_MAX_ITERATIONS, `should not take more than ${EXPECTED_MAX_ITERATIONS} iterations to converge at a reasonable solution.  took ${iterations}`);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const node1 = graph.nodes.find(n => n.id === 1)!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const node2 = graph.nodes.find(n => n.id === 2)!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const node3 = graph.nodes.find(n => n.id === 3)!;

    assert.notStrictEqual(node1, undefined);
    assert.notStrictEqual(node2, undefined);
    assert.notStrictEqual(node3, undefined);

    const node1to2length = node1.position.distanceFrom(node2.position);
    console.log(`completed in ${iterations} iterations with 1->2 distance ${node1to2length} ~= 2.`);
    equalsEpsilon(node1to2length, 2, 1e-3);
  })
})