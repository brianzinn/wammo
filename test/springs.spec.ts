import assert from 'assert';
import { IVector, Vector2, Vector2Impl } from '../src/math';
import { PhysicsBody } from '../src/physics';
import { Spring, springForce } from '../src/forces/spring';

describe(' > Spring tests', function featureFlagTests() {

  it('Spring should move the bodies further apart', () => {
    const springForceUnderTest = springForce(0.001, 10);

    const body1atRest = new PhysicsBody<IVector<Vector2>, number>(1, new Vector2Impl(-2, 0), new Vector2Impl(), new Vector2Impl());
    const body2atRest = new PhysicsBody<IVector<Vector2>, number>(2, new Vector2Impl(2, 0), new Vector2Impl(), new Vector2Impl());

    // they are 4 apart, while the spring rests at 10.
    const spring = new Spring(body1atRest, body2atRest, 10, 0.001);

    // pre-conditions
    assert.strictEqual(body1atRest.force.vector.x, 0);
    assert.strictEqual(body1atRest.force.vector.y, 0);

    assert.strictEqual(body2atRest.force.vector.x, 0);
    assert.strictEqual(body2atRest.force.vector.y, 0);

    // act
    springForceUnderTest(spring);

    //     <--|     |-->
    //        1--+--2          - Current state
    // |---------|---------|   - Desired spring state (at rest)
    assert.strictEqual(body1atRest.force.vector.x, -0.006, 'body 1 should shift left (further apart)');
    assert.strictEqual(body1atRest.force.vector.y, 0);

    assert.strictEqual(body2atRest.force.vector.x, 0.006, 'body 2 should shift right (further apart)');
    assert.strictEqual(body2atRest.force.vector.y, 0);
  })

  it('Spring should bring the bodies closer together', () => {
    const springForceUnderTest = springForce(0.001, 10);

    const body1atRest = new PhysicsBody<IVector<Vector2>, number>(1, new Vector2Impl(-2, 0), new Vector2Impl(), new Vector2Impl());
    const body2atRest = new PhysicsBody<IVector<Vector2>, number>(2, new Vector2Impl(2, 0), new Vector2Impl(), new Vector2Impl());

    // they are 4 apart, while the spring rests at 10.
    const spring = new Spring(body1atRest, body2atRest, 2, 0.001);

    // pre-conditions
    assert.strictEqual(body1atRest.force.vector.x, 0);
    assert.strictEqual(body1atRest.force.vector.y, 0);

    assert.strictEqual(body2atRest.force.vector.x, 0);
    assert.strictEqual(body2atRest.force.vector.y, 0);

    // act
    springForceUnderTest(spring);

    //      |->    <-|
    //     1----+----2  - Current state
    //       |--|--|    - Desired spring state (at rest)
    assert.strictEqual(body1atRest.force.vector.x, 0.002, 'body 1 should shift right (closer together)');
    assert.strictEqual(body1atRest.force.vector.y, 0);

    assert.strictEqual(body2atRest.force.vector.x, -0.002, 'body 2 should shift left (closer together)');
    assert.strictEqual(body2atRest.force.vector.y, 0);
  })
})