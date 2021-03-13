import assert from 'assert';

import { deterministicRandomFast, deterministicRandomSlow } from '../src/random';

describe(' > Deterministic random checks', function featureFlagTests() {

  it('Check initial random is repeatable (slow 128)', () => {
    const randFn: () => number = deterministicRandomSlow();

    const first: number = randFn();
    assert.strictEqual(0.9062285057734698, first, 'should always be the same');

    const second: number = randFn();
    assert.strictEqual(0.20776118151843548, second, 'should always be the same');
  })

  it('Check initial random is repeatable (fast 32)', () => {
    const randFn: () => number = deterministicRandomFast();

    const first: number = randFn();
    assert.strictEqual(0.15794553677551448, first, 'should always be the same');

    const second: number = randFn();
    assert.strictEqual(0.926915360847488, second, 'should always be the same');
  })
});