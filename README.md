# @domainkits/sdk

TypeScript client for the [DomainKits](https://domainkits.com) REST API.

This is the official TypeScript SDK for the DomainKits API, published and maintained by the DomainKits team. DomainKits is built and operated by [ABTdomain, a domain intelligence platform](https://abtdomain.com), which also owns the GitHub organisation hosting this repository. The relationship is stated on [domainkits.com/about](https://domainkits.com/about).

DomainKits is one API with a shared key across every endpoint. This SDK covers all of them (six domain search types, WHOIS, DNS, reverse nameserver, Certificate Transparency, safety, trends and bulk download) with typed parameters and responses, automatic paging, and structured quota errors.

## Requirements

The REST API is for Premium and Platinum accounts; unauthenticated requests are rejected with 401. Keys start with `dk_` and come from [domainkits.com](https://domainkits.com/pricing).

If you want a no-key way to explore the same data from an AI client, use [@domainkits/mcp](https://domainkits.com/mcp) instead, which has a guest tier.

## Install

```bash
npm install @domainkits/sdk
```

## Usage

```ts
import { DomainKits } from '@domainkits/sdk';

const dk = new DomainKits(process.env.DOMAINKITS_API_KEY!);

const { data, total } = await dk.nrds.list({
  keyword: 'shop',
  tld: 'com',
  reg_date: '2026-07-10',
  no_number: true,
  no_hyphen: true,
});

console.log(`${total} matches`);
for (const d of data) {
  console.log(d.domain, d.registered_date, d.expiry_date);
}
```

### Paging

A single request returns at most 500 results. `paginate` walks the whole result set for you:

```ts
for await (const domain of dk.nrds.paginate({ keyword: 'shop', tld: 'com' })) {
  console.log(domain.domain);
}
```

It stops when the result set is exhausted. Break out of the loop whenever you have enough, no further requests are made.

### Export

`export` pulls up to 50,000 rows as CSV in one request:

```ts
const csv = await dk.expired.export({ tld: 'com', status: 'pending_delete' });
```

This runs on a separate, much smaller quota: 10 per day and 100 per month on Premium, 3 and 9 during the trial. It is for occasional bulk pulls, not for a scheduled job. The export also returns fewer columns than paged mode: `registered_date` is the year only, and `age` is omitted.

50,000 is a cap, not a promise of completeness. Browsing `.com` matched 4,847,613 expiring domains on 27 July 2026, so an unfiltered export returns the first 50,000. Narrow the query if you need the result set to fit.

## Search types

| Method | What it searches |
|---|---|
| `dk.expired` | Domains in the deletion cycle: expired, redemption, pending delete |
| `dk.nrds` | Newly registered domains, last 60 days |
| `dk.aged` | Domains with 5 to 20+ years of registration history |
| `dk.active` | Currently registered domains |
| `dk.deleted` | Dropped domains (requires `keyword`) |
| `dk.market` | Domains listed for sale on marketplaces |

Each has `list`, `paginate` and `export`, and its own parameter and result types: an expired result carries `status`, an NRD result carries `expiry_date`, a market result carries `marketplace`.

### Filter notes

`length` and `age_range` accept a preset band (`5-10`), an exact value (`10`), or a range (`8-12`, inclusive of both ends). `age_range` also takes a comma-separated list (`0-5,20+`).

`new` takes `1`, `2` or `3` and restricts results to the last N observed days: on `expired` the domains that entered the expired pool (expired stage only), on `deleted` the domains that dropped, on `market` the listings that first appeared on a marketplace.

`reg_date` on `nrds` accepts a day (`2026-07-10`), a month (`2026-07`), a year (`2026`), or a `from:to` range where either side may be omitted.

`position` defaults to `contain` everywhere except `market`, which defaults to `start`; pass `contain` there to match anywhere in the name.

## Other endpoints

```ts
await dk.whois('example.com');
await dk.dns('example.com');
await dk.safety('example.com');
await dk.nsReverse({ ns: 'ns1.example.com', tld: 'com' });
await dk.tldCheck({ prefix: 'yourbrand' });
await dk.typosquat({ domain: 'example.com' });
await dk.ipLookup('8.8.8.8');
await dk.registrar('godaddy');
await dk.statusGuide('clientHold');
await dk.monitorChanges({ tld: 'com', reason: 'transfer' });
await dk.ctSubdomains('example.com');
await dk.ctCerts({ domain: 'example.com' });
await dk.ctSearch({ keyword: 'example' });
await dk.tldTrends('newly', { tld: 'com' });
await dk.keywordTrends('hot');
await dk.usage();
await dk.searchStatus();
```

## Coverage

**gTLDs only** for the domain search endpoints. The index covers generic TLDs: `.com`, `.net`, `.org`, `.info`, `.biz`, `.xyz`, `.online`, `.site`, `.top`, `.club`, `.live`, `.app`, `.dev` and others. Country-code TLDs are not indexed: a query for `.de`, `.io`, `.co` or `.us` returns an empty result set, not an error.

`whois`, `dns`, `safety`, `ipLookup` and the Certificate Transparency endpoints work on any domain, ccTLDs included.

**No PII.** Responses contain no personal data. WHOIS results are limited to registrar, dates, status codes and nameservers; registrant names, emails, addresses and phone numbers are not returned.

## Errors

```ts
import { RateLimitError, AuthError, DomainKitsError } from '@domainkits/sdk';

try {
  await dk.expired.export({ tld: 'com' });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Quota exhausted. Retry in ${error.retryAfterMs}ms`);
    console.log(error.rateLimit);
  } else if (error instanceof AuthError) {
    console.log('Key rejected, check your plan tier');
  } else if (error instanceof DomainKitsError) {
    console.log(error.status, error.message);
  }
}
```

Every error carries the `x-ratelimit-limit`, `x-ratelimit-remaining` and `x-ratelimit-reset` values as a parsed `rateLimit` object. `RateLimitError.retryAfterMs` tells you how long until the window resets.

429 and 5xx responses are retried automatically, twice by default, waiting until the rate-limit window resets when that is under two minutes. Set `maxRetries: 0` to handle it yourself.

## Options

```ts
const dk = new DomainKits({
  apiKey: process.env.DOMAINKITS_API_KEY!,
  timeoutMs: 60_000,
  maxRetries: 2,
  baseUrl: 'https://premium-api.domainkits.com/api/v1',
});
```

## Quotas

Call `usage()` for the live picture on your account: every endpoint reports its own per-minute, daily and monthly allowance alongside what you have already spent.

Daily quotas reset at 00:00 UTC, monthly quotas on the 1st. Current limits: [domainkits.com/dev/api-docs](https://domainkits.com/dev/api-docs).

## Resources

- [DomainKits API reference](https://domainkits.com/dev/api-docs)
- [@domainkits/mcp](https://domainkits.com/mcp), same API for MCP clients
- [n8n-nodes-domainkits](https://www.npmjs.com/package/n8n-nodes-domainkits), same API for n8n
- [About DomainKits and ABTdomain](https://domainkits.com/about)
- [ABTdomain](https://abtdomain.com)

## License

[MIT](LICENSE.md)
