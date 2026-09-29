export interface TargetUrlBookmaker {
  websiteUrl: string;
  urlTemplate: string | null;
  affiliateParam: string | null;
  affiliateId: string | null;
  subIdParam: string | null;
}

export class InvalidTargetUrlError extends Error {}

/**
 * Builds the bookmaker URL a slip redirects to. Our affiliate ID always wins
 * over any tag already in the URL, and the slip slug goes in the sub-ID so the
 * bookmaker's affiliate report can be matched back to the tipster.
 */
export function buildTargetUrl(
  bookmaker: TargetUrlBookmaker,
  bookingCode: string,
  slug: string,
  explicitTargetUrl?: string,
): string {
  let baseUrl: string;

  if (explicitTargetUrl) {
    assertBookmakerHost(explicitTargetUrl, bookmaker.websiteUrl);
    baseUrl = explicitTargetUrl;
  } else if (bookmaker.urlTemplate) {
    baseUrl = bookmaker.urlTemplate.replace(
      '{code}',
      encodeURIComponent(bookingCode),
    );
  } else {
    baseUrl = bookmaker.websiteUrl;
  }

  const url = new URL(baseUrl);

  if (bookmaker.affiliateParam && bookmaker.affiliateId) {
    url.searchParams.set(bookmaker.affiliateParam, bookmaker.affiliateId);
  }
  if (bookmaker.subIdParam) {
    url.searchParams.set(bookmaker.subIdParam, slug);
  }

  url.searchParams.set('ref', 'radaslips');
  url.searchParams.set('slip', slug);
  return url.toString();
}

/** Rejects URLs outside the bookmaker's domain (or its subdomains). */
function assertBookmakerHost(targetUrl: string, websiteUrl: string) {
  const target = new URL(targetUrl);
  const allowedHost = new URL(websiteUrl).hostname.replace(/^www\./, '');
  const host = target.hostname;

  const hostMatches = host === allowedHost || host.endsWith(`.${allowedHost}`);
  if (target.protocol !== 'https:' || !hostMatches) {
    throw new InvalidTargetUrlError(
      `targetUrl must be an https link on ${allowedHost}`,
    );
  }
}
