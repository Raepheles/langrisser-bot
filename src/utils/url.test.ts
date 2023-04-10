import {
  getHeroWikiUrl,
  getHeroThumbnailUrl,
  getSkillThumbnailUrl,
  getHeroImageUrl,
} from './url';

describe('getHeroWikiUrl', () => {
  it('returns correct URL', () => {
    expect(getHeroWikiUrl('lana')).toBe(
      'https://wikigrisser-next.com/heroes/lana'
    );
    expect(getHeroWikiUrl('saintess of the ark')).toBe(
      'https://wikigrisser-next.com/heroes/saintess%20of%20the%20ark'
    );
  });
});

describe('getHeroThumbnailUrl', () => {
  it('returns correct URL', () => {
    expect(getHeroThumbnailUrl('Lana')).toBe(
      'https://wikigrisser-next.com/hero%20cards/Lana.png'
    );
    expect(getHeroThumbnailUrl('Saintess of the Ark')).toBe(
      'https://wikigrisser-next.com/hero%20cards/Saintess%20of%20the%20Ark.png'
    );
  });
});

describe('getSkillThumbnailUrl', () => {
  it('returns correct URL', () => {
    expect(getSkillThumbnailUrl('Dark Reaper')).toBe(
      'https://wikigrisser-next.com/skills/Dark%20Reaper.png'
    );
    expect(getSkillThumbnailUrl('Black Hole')).toBe(
      'https://wikigrisser-next.com/skills/Black%20Hole.png'
    );
  });
});

describe('getHeroImageUrl', () => {
  it('returns correct URL without imageName', () => {
    expect(getHeroImageUrl('Lana')).toBe(
      'https://wikigrisser-next.com/heroes/Lana/Lana.png'
    );
    expect(getHeroImageUrl('Saintess of the Ark')).toBe(
      'https://wikigrisser-next.com/heroes/Saintess%20of%20the%20Ark/Saintess%20of%20the%20Ark.png'
    );
  });

  it('returns correct URL with imageName', () => {
    expect(getHeroImageUrl('Lana', 'SP')).toBe(
      'https://wikigrisser-next.com/heroes/Lana/Lana%20SP.png'
    );
    expect(getHeroImageUrl('Lana', 'Skin 2')).toBe(
      'https://wikigrisser-next.com/heroes/Lana/Lana%20Skin%202.png'
    );
  });
});
