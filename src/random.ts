/**
 * License: Public domain. https://github.com/bryc/code/blob/master/jshash/PRNGs.md
 */

export type RandomFunction = () => number;

/**
 * MurmurHash3 mixing function
 * @param str input
 */
export const xmur3 = (str: string): () => number => {
  let h: number;
  for (let i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
      h = h << 13 | h >>> 19;

  return () => {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}

/**
 * Mulberry32 is minimalistic generator utilizing a 32-bit state, originally intended for embedded applications.
 * It appears to be very good; the author states it passes all tests of gjrand, and this JavaScript implementation is very fast.
 * But since the state is 32-bit like Xorshift, it's period (how long the random sequence lasts before repeating) is significantly
 * less than those with 128-bit states, but it's still quite large, at around 4 billion.
 * @param seed initial state for deterministic randomness
 */
const mulberry32 = (seed: number) => {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

/**
 * Yet another chaotic PRNG, the sfc stands for "Small Fast Counter".
 * It is part of the PracRand PRNG test suite.
 * It passes PractRand, as well as Crush/BigCrush (TestU01). Also one of the fastest.
 *
 * @param a seed1
 * @param b seed2
 * @param c seed3
 * @param d seed4
 */
export const sfc32 = (a: number, b: number, c: number, d: number): () => number => {
  return () => {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

export const random = (hash = 'apples'): () => number => {
  const seed = xmur3(hash);
  // use xmur for rand seed
  const rand = mulberry32(seed());
  return rand;
}

export const deterministicRandomSlow = (): () => number => {
  const seed = 1337 ^ 0xDEADBEEF; // 32-bit seed with optional XOR value
  // Pad seed with Phi, Pi and E.
  // https://en.wikipedia.org/wiki/Nothing-up-my-sleeve_number
  const rand = sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, seed);

  // advance the generator a few times (12-20 iterations) to mix the initial state thoroughly.
  for (let i = 0; i < 15; i++) {
    rand();
  }

  return rand;
}

export const deterministicRandomFast = (): () => number => {
  const seed = 1337 ^ 0xDEADBEEF; // 32-bit seed with optional XOR value
  
  const rand = mulberry32(seed);

  // advance the generator a few times (12-20 iterations) to mix the initial state thoroughly.
  for (let i = 0; i < 15; i++) {
    rand();
  }

  return rand;
}
