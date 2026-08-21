# @domainkits/sdk

TypeScript client for the [DomainKits](https://domainkits.com) REST API.

This is the official TypeScript SDK for the DomainKits API, published and maintained by the DomainKits team. DomainKits is built and operated by Lyalpha GmbH, with domain data and infrastructure provided by [ABTdomain](https://abtdomain.com), our domain intelligence and data aggregation platform. This repository is hosted under the ABTdomain GitHub organisation. Learn more about the relationship at [domainkits.com/about](https://domainkits.com/about).

Every parameter, response field and current limit is documented in the [API reference](https://domainkits.com/dev/api-docs) and the [OpenAPI spec](https://domainkits.com/dev/openapi.yaml). This README only lists what the SDK covers.

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

const { data, total } = await dk.nrds.list({ query: 'shop', tld: 'com' });
```

## Endpoints

Search resources, each with `list`, `paginate` and `export`:

| Resource | Endpoint |
|---|---|
| `dk.expired` | `/search/expired` |
| `dk.nrds` | `/search/nrds` |
| `dk.nrdsLive` | `/search/nrds-live` |
| `dk.aged` | `/search/aged` |
| `dk.active` | `/search/active` |
| `dk.deleted` | `/search/deleted` |
| `dk.market` | `/search/market` |

Lookups and reports:

| Method | Endpoint |
|---|---|
| `dk.whois(domain)` | `/whois` |
| `dk.dns(domain)` | `/dns` |
| `dk.safety(domain)` | `/safety` |
| `dk.ipLookup(query)` | `/ip-lookup` |
| `dk.registrar(query)` | `/registrar` |
| `dk.statusGuide(query)` | `/status-guide` |
| `dk.tldCheck(params)` | `/tld-check` |
| `dk.typosquat(params)` | `/typosquat` |
| `dk.nsReverse(params)` | `/ns-reverse` |
| `dk.monitorChanges(params)` | `/monitor/changes` |
| `dk.ctSubdomains(domain)` | `/ct/subdomains` |
| `dk.ctCerts(params)` | `/ct/certs` |
| `dk.ctSearch(params)` | `/ct/search` |
| `dk.tldTrends(type)` | `/trends/tlds/*` |
| `dk.keywordTrends(type)` | `/trends/keywords/*` |
| `dk.nrdsDownload(params)` | `/nrds/download` |
| `dk.usage()` | `/usage` |
| `dk.searchStatus()` | `/search/status` |
| `dk.health()` | `/health` |

Parameters and result shapes are typed; the types mirror the [API reference](https://domainkits.com/dev/api-docs), which is the authority on every filter, field and limit.

**No PII.** Responses contain no registrant personal data.

## Errors

```ts
import { RateLimitError, AuthError, DomainKitsError } from '@domainkits/sdk';

try {
  await dk.whois('example.com');
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log('retry after', err.retryAfterMs, 'ms');
  } else if (err instanceof AuthError) {
    console.log('key rejected:', err.message);
  } else if (err instanceof DomainKitsError) {
    console.log(err.status, err.message);
  }
}
```

`RateLimitError` (429) carries the rate-limit headers and a `retryAfterMs`; the client retries 429 and 5xx responses on its own up to `maxRetries` before throwing.

## Options

```ts
const dk = new DomainKits({
  apiKey: 'dk_...',
  baseUrl: 'https://premium-api.domainkits.com/api/v1',
  timeoutMs: 60000,
  maxRetries: 2,
});
```

## Resources

- [API reference and key management](https://domainkits.com/dev)
- [OpenAPI 3.0 spec](https://domainkits.com/dev/openapi.yaml)
- [About DomainKits and ABTdomain](https://domainkits.com/about)

## License

[MIT](LICENSE.md)
