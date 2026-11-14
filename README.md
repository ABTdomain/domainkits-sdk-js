# @domainkits/sdk

TypeScript client for the [DomainKits](https://domainkits.com) domain data API. It ships with types and has no runtime dependencies.

## What it does

It brings domain data into your TypeScript and JavaScript code, so your services, scheduled jobs and pipelines can search it, look it up and download it as part of their own logic:

- **Lifecycle**: [newly registered domains](https://github.com/ABTdomain/newly-registered-domains) as a search or as the daily list, [expired domains](https://github.com/ABTdomain/expired-domains) as a search or as an exported file, and deleted, aged, active and for-sale domains
- **Registration**: WHOIS data, the registrar, and what each EPP status code means
- **DNS and hosting**: DNS records, the network behind an IP, and other domains on the same nameserver
- **Certificates**: subdomains, certificates and newly seen hostnames from CT logs
- **Footprint**: the same name across TLDs, and typosquat variants around a brand
- **Trends**: keyword and TLD registration trends
- **Changes**: transfers, drops, renewals and nameserver updates on high-value domains

▶ [See how it is used](#use-it-for)

## Endpoints

Search resources, each with `list`, `paginate` and `export`:

| Resource | Endpoint |
|---|---|
| `dk.expired` | `/search/expired` |
| `dk.nrds` | `/search/nrds` |
| `dk.aged` | `/search/aged` |
| `dk.active` | `/search/active` |
| `dk.deleted` | `/search/deleted` |
| `dk.market` | `/search/market` |

Lookups and reports:

| Method | Endpoint |
|---|---|
| `dk.whois(domain)` | `/whois` |
| `dk.dns(domain)` | `/dns` |
| `dk.bulkDns(domains)` | `/bulk/dns` |
| `dk.bulkWhois(domains)` | `/bulk/whois` |
| `dk.ipLookup(query)` | `/ip-lookup` |
| `dk.registrar(query)` | `/registrar` |
| `dk.statusGuide(query)` | `/status-guide` |
| `dk.tldCheck(params)` | `/tld-check` |
| `dk.typosquat(params)` | `/typosquat` |
| `dk.nsReverse(params)` | `/ns-reverse` |
| `dk.monitorChanges(params)` | `/monitor/changes` |
| `dk.hostnameSearch(params)` | `/search/hostname` |
| `dk.ctSubdomains(domain)` | `/ct/subdomains` |
| `dk.ctCerts(params)` | `/ct/certs` |
| `dk.tldTrends(type)` | `/trends/tlds/*` |
| `dk.keywordTrends(type)` | `/trends/keywords/*` |
| `dk.nrdsDownload(params)` | `/nrds/download` |
| `dk.usage()` | `/usage` |
| `dk.searchStatus()` | `/search/status` |
| `dk.health()` | `/health` |

Parameters and result shapes are typed; the types mirror the [API reference](https://domainkits.com/dev/api-docs), where the filters, fields and limits for each endpoint are documented.

**No PII.** Responses contain no registrant personal data.

## Install

```bash
npm install @domainkits/sdk
```

Set your key and make a call:

```ts
import { DomainKits } from '@domainkits/sdk';

const dk = new DomainKits(process.env.DOMAINKITS_API_KEY!);

const { data, total } = await dk.nrds.list({ query: 'shop', tld: 'com' });
```

The same key works for the REST API, the SDKs, the MCP server and the CLI.

Sign up at [domainkits.com](https://domainkits.com/register) and create a key on your [dashboard](https://domainkits.com/dashboard). `dk.nrdsDownload()` works on a free account; the other calls need a plan that includes the API, see the [API reference](https://domainkits.com/dev/api-docs).

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

## Use it for

### [Newly registered domains](https://github.com/ABTdomain/newly-registered-domains)

```ts
await dk.nrds.list({ query: 'ai', tld: 'com' });                 // search by keyword
await dk.nrdsDownload({ tld: 'com', type: 'domains_only' });     // pull the daily list
```

<p align="center">
<a href="https://www.youtube.com/watch?v=8bXfKV5-eGw"><img src="https://img.youtube.com/vi/8bXfKV5-eGw/maxresdefault.jpg" alt="Video: How to get a newly registered domains feed with the DomainKits API" width="640"></a><br>
<a href="https://www.youtube.com/watch?v=8bXfKV5-eGw">▶ Watch on YouTube: How to Get a Newly Registered Domains Feed with an API</a>
</p>

### [Expired domains](https://github.com/ABTdomain/expired-domains)

```ts
await dk.expired.list({ query: 'shop', status: 'pending_delete', age_min: 10 });   // pending delete names with a long history
await dk.expired.export({ tld: 'app', status: 'redemption' });                     // the redemption stage of one TLD as CSV
```

## Related

- [ABTdomain/domainkits-sdk-py](https://github.com/ABTdomain/domainkits-sdk-py): Python client for the DomainKits domain data API
- [ABTdomain/domainkits-sdk-go](https://github.com/ABTdomain/domainkits-sdk-go): Go client for the DomainKits domain data API
- [ABTdomain/domainkits-cli](https://github.com/ABTdomain/domainkits-cli): command-line client for the DomainKits domain data API
- [ABTdomain/domainkits-mcp](https://github.com/ABTdomain/domainkits-mcp): hosted MCP server for domain data

## Resources

- [API reference and key management](https://domainkits.com/dev)
- [OpenAPI 3.0 spec](https://domainkits.com/dev/openapi.yaml)
- [About DomainKits and ABTdomain](https://domainkits.com/about)

## License

[MIT](LICENSE.md)
