import { DomainKitsClient, toQuery, type ClientOptions } from './client.js';
import type {
	ActiveDomain,
	ActiveSearchParams,
	AgedDomain,
	AgedSearchParams,
	CommonSearchParams,
	CtCertificate,
	CtCertsParams,
	CtHostname,
	CtSearchParams,
	CtSubdomainsParams,
	DeletedDomain,
	DeletedSearchParams,
	DnsRecords,
	IpLookup,
	ExpiredDomain,
	ExpiredSearchParams,
	MarketDomain,
	MarketSearchParams,
	MonitorChangesParams,
	NrdDomain,
	NrdLiveDomain,
	NrdsLiveSearchParams,
	NrdsSearchParams,
	NsReverseParams,
	SafetyReport,
	RegistrarResult,
	SearchResult,
	TldCheckParams,
	TldCheckResult,
	TrendsKeywordType,
	TrendsTldType,
	TyposquatParams,
	TyposquatResult,
	Usage,
	WhoisRecord,
} from './types.js';

export * from './types.js';
export {
	AuthError,
	DomainKitsError,
	RateLimitError,
	type ClientOptions,
	type RateLimit,
} from './client.js';

const MAX_LIMIT = 500;

class SearchResource<P extends CommonSearchParams, R> {
	constructor(
		private readonly client: DomainKitsClient,
		private readonly path: string,
	) {}

	list(params: P): Promise<SearchResult<R>> {
		return this.client.requestList<R>(this.path, toQuery(params));
	}

	async *paginate(params: P, pageSize = MAX_LIMIT): AsyncGenerator<R, void, undefined> {
		let offset = params.offset ?? 0;
		const limit = Math.min(pageSize, MAX_LIMIT);

		for (;;) {
			const { data, total } = await this.list({ ...params, limit, offset } as P);
			for (const item of data) yield item;

			offset += data.length;
			if (data.length === 0 || data.length < limit || offset >= total) return;
		}
	}

	async export(params: P): Promise<string> {
		const response = await this.client.requestRaw(this.path, {
			...(toQuery(params)),
			export: 'csv',
		});
		return response.text();
	}
}

export class DomainKits {
	private readonly client: DomainKitsClient;

	readonly expired: SearchResource<ExpiredSearchParams, ExpiredDomain>;
	readonly nrds: SearchResource<NrdsSearchParams, NrdDomain>;
	readonly nrdsLive: SearchResource<NrdsLiveSearchParams, NrdLiveDomain>;
	readonly aged: SearchResource<AgedSearchParams, AgedDomain>;
	readonly active: SearchResource<ActiveSearchParams, ActiveDomain>;
	readonly deleted: SearchResource<DeletedSearchParams, DeletedDomain>;
	readonly market: SearchResource<MarketSearchParams, MarketDomain>;

	constructor(options: ClientOptions | string) {
		this.client = new DomainKitsClient(typeof options === 'string' ? { apiKey: options } : options);

		this.expired = new SearchResource(this.client, '/search/expired');
		this.nrds = new SearchResource(this.client, '/search/nrds');
		this.nrdsLive = new SearchResource(this.client, '/search/nrds-live');
		this.aged = new SearchResource(this.client, '/search/aged');
		this.active = new SearchResource(this.client, '/search/active');
		this.deleted = new SearchResource(this.client, '/search/deleted');
		this.market = new SearchResource(this.client, '/search/market');
	}

	usage(): Promise<Usage> {
		return this.client.request<Usage>('/usage');
	}

	searchStatus(): Promise<Record<string, unknown>> {
		return this.client.request<Record<string, unknown>>('/search/status');
	}

	health(): Promise<Record<string, unknown>> {
		return this.client.request<Record<string, unknown>>('/health');
	}

	whois(domain: string): Promise<WhoisRecord> {
		return this.client.request<WhoisRecord>('/whois', { domain });
	}

	dns(domain: string): Promise<DnsRecords> {
		return this.client.request<DnsRecords>('/dns', { domain });
	}

	safety(domain: string): Promise<SafetyReport> {
		return this.client.request<SafetyReport>('/safety', { domain });
	}

	ipLookup(query: string): Promise<IpLookup> {
		return this.client.request<IpLookup>('/ip-lookup', { query });
	}

	registrar(query: string): Promise<RegistrarResult> {
		return this.client.request<RegistrarResult>('/registrar', { query });
	}

	statusGuide(query?: string): Promise<Record<string, unknown>> {
		return this.client.request<Record<string, unknown>>('/status-guide', { query });
	}

	tldCheck(params: TldCheckParams): Promise<TldCheckResult> {
		return this.client.requestEnvelope<TldCheckResult>('/tld-check', toQuery(params));
	}

	nsReverse(params: NsReverseParams): Promise<SearchResult<string>> {
		return this.client.requestList<string>('/ns-reverse', toQuery(params));
	}

	typosquat(params: TyposquatParams): Promise<TyposquatResult> {
		return this.client.requestEnvelope<TyposquatResult>('/typosquat', toQuery(params));
	}

	monitorChanges(params: MonitorChangesParams = {}): Promise<SearchResult<Record<string, unknown>>> {
		return this.client.requestList<Record<string, unknown>>(
			'/monitor/changes',
			toQuery(params),
		);
	}

	ctSubdomains(
		domain: string,
		params: Omit<CtSubdomainsParams, 'domain'> = {},
	): Promise<SearchResult<CtHostname>> {
		return this.client.requestList<CtHostname>('/ct/subdomains', {
			...toQuery(params),
			domain,
		});
	}

	ctCerts(params: CtCertsParams): Promise<SearchResult<CtCertificate>> {
		return this.client.requestList<CtCertificate>('/ct/certs', toQuery(params));
	}

	ctSearch(params: CtSearchParams): Promise<SearchResult<CtHostname>> {
		return this.client.requestList<CtHostname>('/ct/search', toQuery(params));
	}

	tldTrends(type: TrendsTldType, params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
		return this.client.request<Record<string, unknown>>(`/trends/tlds/${type}`, params);
	}

	keywordTrends(
		type: TrendsKeywordType,
		params: Record<string, unknown> = {},
	): Promise<Record<string, unknown>> {
		return this.client.request<Record<string, unknown>>(`/trends/keywords/${type}`, params);
	}

	nrdsDownload(params: Record<string, unknown> = {}): Promise<Response> {
		return this.client.requestRaw('/nrds/download', params);
	}
}

export default DomainKits;
