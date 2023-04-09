import { findSimilarStrings } from '../string';

describe('findSimilarStrings', () => {
  it('returns an exact match when one is found', () => {
    const result = findSimilarStrings('cat', ['dog', 'fish', 'cat']);
    expect(result).toEqual(['cat']);
  });

  it('returns startsWith string despite maxDistance', () => {
    const result = findSimilarStrings('abc', ['ab', 'abcdef', 'abcd', 'xyz'], {
      maxDistance: 2,
    });
    expect(result).toEqual(['abcd', 'abcdef', 'ab']);
  });

  it('returns a limited number of matches', () => {
    const result = findSimilarStrings(
      'foo',
      ['foobar', 'food', 'foot', 'fool', 'foofoo'],
      { numberOfResults: 2 }
    );
    expect(result).toEqual(['food', 'foot']);
  });
});
