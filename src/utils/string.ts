interface FindSimilarStringOptions {
  maxDistance?: number;
  numberOfResults?: number;
}

export function findSimilarStrings(
  inputString: string,
  arr: string[],
  opts: FindSimilarStringOptions = {}
): string[] {
  const { maxDistance = 5, numberOfResults = 5 } = opts;
  let oneDistanceStrings = 0;
  const matches: { text: string; dist: number; substr: boolean }[] = [];

  for (const string of arr) {
    const distance = levenshteinDistance(inputString, string);
    if (distance === 0) {
      return [string]; // Exact match
    }
    if (distance === 1) oneDistanceStrings++;
    if (string.indexOf(inputString) !== -1) {
      matches.push({ text: string, dist: distance, substr: true });
    } else if (distance <= maxDistance) {
      matches.push({ text: string, dist: distance, substr: false });
    }
    if (oneDistanceStrings >= numberOfResults) break;
  }
  const res = matches
    .sort((a, b) => {
      if (a.substr !== b.substr) {
        return a.substr ? -1 : 1;
      } else {
        return a.dist - b.dist;
      }
    })
    .slice(0, numberOfResults)
    .map((m) => m.text);
  return res;
}

function levenshteinDistance(str1: string, str2: string) {
  const m = str1.length;
  const n = str2.length;
  const dp = new Array(m + 1).fill(null).map(() => new Array(n + 1).fill(null));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

/**
 * Join an array of strings until the resulting string's length is less than or equal to a given maximum length.
 * @param {string[]} arr - The array of strings to join.
 * @param {string} joiner - The string to join the array with.
 * @param {number} maxLength - The maximum length of the resulting string.
 * @returns {string[]} - An array of strings that are joined by comma from the first parameter until its length is max_length.
 */
export function splitStrings(
  arr: string[],
  joiner: string,
  maxLength: number
): string[] {
  const result: string[] = [];
  let curr = '';

  for (const str of arr) {
    if (curr.length + str.length + joiner.length > maxLength) {
      if (curr !== '') result.push(curr);
      curr = str;
    } else {
      if (curr === '') {
        curr = str;
      } else {
        curr = `${curr}${joiner}${str}`;
      }
    }
  }

  if (curr !== '') {
    result.push(curr);
  }
  return result;
}
