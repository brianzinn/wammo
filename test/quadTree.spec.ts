import assert from 'assert';
import { IVector, Vector2, Vector2Impl } from '../src/math';
import { PhysicsBody } from '../src/physics';
import QuadTreeVisitor, { BHQuadTree, NodeType } from '../src/quadTree';

describe(' > Quadtree should maintain nodes and center of mass', function test() {

  const assertEqualsEpsilon = (expected: number, actual: number, epsilon = 1e-6 /* Number.EPSILON is too small! */) => {
    assert.ok(Math.abs(expected - actual) < epsilon, `${expected} (expected) and ${actual} (actual) did not differ by less than ${epsilon}.`)
  }

  it('Should create an empty tree', () => {
    const tree = new BHQuadTree(new Vector2Impl(), 240, null);

    assert.notStrictEqual(null, tree);
    assert.strictEqual(tree.nodeType, NodeType.Empty);
    assert.strictEqual(tree.body, null)
  })

  it('should create a tree with node containing a single body', () => {
    const tree = new BHQuadTree<number>(new Vector2Impl(), 200, null);
    tree.insert(new PhysicsBody<IVector<Vector2>, number>(1, new Vector2Impl(150, 150), new Vector2Impl(), new Vector2Impl()));

    assert.notDeepStrictEqual(null, tree);
    assert.strictEqual(tree.nodeType, NodeType.Body);
    assert.notStrictEqual(null, tree.body);
    assert.strictEqual(0, tree.subnodes.length);
  })

  it('should create a tree with an internal node containing more nodes!', () => {
    const tree = new BHQuadTree<number>(new Vector2Impl(), 200, null);
    const body1 = new PhysicsBody<IVector<Vector2>, number>(1, new Vector2Impl(180, 180), new Vector2Impl(), new Vector2Impl());
    const body2 = new PhysicsBody<IVector<Vector2>, number>(2, new Vector2Impl(185, 185), new Vector2Impl(), new Vector2Impl());
    tree.insert(body1);
    tree.insert(body2);

    assert.notDeepStrictEqual(null, tree);
    assert.strictEqual(tree.nodeType, NodeType.Node);
    assert.strictEqual(null, tree.body);

    type CollectedForce = {
      mass: number
      direction: {x: number, y: number}
      distance: number
    }

    let forces: CollectedForce[] = [];
    const collectForces = (mass: number, direction: IVector<Vector2>, distance: number) => forces.push({mass, direction: {x: direction.vector.x, y: direction.vector.y}, distance});

    new QuadTreeVisitor().VisitForcesForBody(tree, body1, 0.5, collectForces);

    assert.strictEqual(1, forces.length, 'body1 expecting a single force (the other body)');
    assertEqualsEpsilon(forces[0].direction.x, -Math.sqrt(0.5), 1e-5);
    assertEqualsEpsilon(forces[0].direction.y, -Math.sqrt(0.5), 1e-5);
    assert.deepStrictEqual([{
      mass: 1,
      direction: {
        x: forces[0].direction.x,
        y: forces[0].direction.y
      },
      distance: Math.sqrt(5*5 + 5*5)
    }], forces, 'body1 should have had a force from 5x5 away');

    forces = [];
    new QuadTreeVisitor().VisitForcesForBody(tree, body2, 0.5, collectForces);

    assert.strictEqual(1, forces.length, 'body2 expecting a single force (the other body)');
    assertEqualsEpsilon(forces[0].direction.x, Math.sqrt(0.5), 1e-5);
    assert.deepStrictEqual([{
      mass: 1,
      direction: {
        x: 0.7071067811865475,
        y: 0.7071067811865475
      },
      distance: Math.sqrt(5*5 + 5*5)
    }], forces, 'should have had a force from 5x5 away');
  })
})
