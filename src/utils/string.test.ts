import { findSimilarStrings, splitStrings } from './string';

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

describe('splitStrings', () => {
  it('should split an array of strings into chunks of max length joined by a separator', () => {
    const arr = ['333', '4444', '55555', '666666'];
    const joiner = ',';
    const maxLength = 8;

    const expected = ['333,4444', '55555', '666666'];
    const result = splitStrings(arr, joiner, maxLength);

    expect(result).toEqual(expected);
  });

  it('should return an array with a single string if all items fit within the max length', () => {
    const arr = ['a', 'b', 'c'];
    const joiner = ',';
    const maxLength = 5;

    const expected = ['a,b,c'];
    const result = splitStrings(arr, joiner, maxLength);

    expect(result).toEqual(expected);
  });

  it('should return an empty array when an empty array is passed', () => {
    const arr: string[] = [];
    const joiner = ',';
    const maxLength = 10;

    const expected: string[] = [];
    const result = splitStrings(arr, joiner, maxLength);

    expect(result).toEqual(expected);
  });

  it('should return the original array if the max length is less than items in the array', () => {
    const arr = ['aaa', 'bbbb', 'cccc'];
    const joiner = ', ';
    const maxLength = 2;

    const expected = ['aaa', 'bbbb', 'cccc'];
    const result = splitStrings(arr, joiner, maxLength);

    expect(result).toEqual(expected);
  });
});
