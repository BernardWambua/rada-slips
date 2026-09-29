import {
  buildTargetUrl,
  InvalidTargetUrlError,
  TargetUrlBookmaker,
} from './target-url.util';

const betika: TargetUrlBookmaker = {
  websiteUrl: 'https://www.betika.com/en-ke/',
  urlTemplate: 'https://www.betika.com/en-ke/share/{code}',
  affiliateParam: 'btag',
  affiliateId: 'rada-123',
  subIdParam: 'subid',
};

describe('buildTargetUrl', () => {
  it('adds the affiliate ID and slip slug as sub-ID', () => {
    const url = new URL(buildTargetUrl(betika, 'ABC12', 'kamau-1a2b'));

    expect(url.pathname).toBe('/en-ke/share/ABC12');
    expect(url.searchParams.get('btag')).toBe('rada-123');
    expect(url.searchParams.get('subid')).toBe('kamau-1a2b');
    expect(url.searchParams.get('slip')).toBe('kamau-1a2b');
  });

  it('leaves affiliate params out when the bookmaker has none', () => {
    const url = new URL(
      buildTargetUrl(
        {
          ...betika,
          affiliateParam: null,
          affiliateId: null,
          subIdParam: null,
        },
        'ABC12',
        'slug',
      ),
    );

    expect(url.searchParams.has('btag')).toBe(false);
    expect(url.searchParams.has('subid')).toBe(false);
    expect(url.searchParams.get('ref')).toBe('radaslips');
  });

  it('overrides an affiliate tag already in an explicit target URL', () => {
    const url = new URL(
      buildTargetUrl(
        betika,
        'ABC12',
        'slug',
        'https://betika.com/en-ke/share/ABC12?btag=someone-else',
      ),
    );

    expect(url.searchParams.getAll('btag')).toEqual(['rada-123']);
  });

  it.each([
    'https://evil.example/betika.com',
    'https://notbetika.com/x',
    'http://www.betika.com/en-ke/',
  ])('rejects explicit target URL %s', (targetUrl) => {
    expect(() => buildTargetUrl(betika, 'ABC12', 'slug', targetUrl)).toThrow(
      InvalidTargetUrlError,
    );
  });
});
