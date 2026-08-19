export type ExpiryStage = 'expired' | 'redemption' | 'pending_delete';
export type KeywordPosition = 'start' | 'end' | 'middle';

export interface CommonSearchParams {
	/** Substring of the name portion, min 2 characters. */
	query?: string;
	/** Comma-separated, up to 10 on the search endpoints; single value on nrds-live. */
	tld?: string;
	/** Requires query; omit to match anywhere. */
	position?: KeywordPosition;
	/** Negative keywords, comma-separated. */
	exclude_query?: string;
	length_min?: number;
	length_max?: number;
	has_number?: boolean;
	all_number?: boolean;
	all_alpha?: boolean;
	has_hyphen?: boolean;
	sort?: string;
	limit?: number;
	offset?: number;
}

export interface NrdsSearchParams extends CommonSearchParams {
	create_date_start?: string;
	create_date_end?: string;
	period_min?: number;
	period_max?: number;
	has_sale?: boolean;
}

export interface NrdsLiveSearchParams extends CommonSearchParams {
	create_date_start?: string;
	create_date_end?: string;
}

export interface ExpiredSearchParams extends CommonSearchParams {
	status?: ExpiryStage;
	age_min?: number;
	age_max?: number;
	found_date_start?: string;
	found_date_end?: string;
	auction_date_start?: string;
	auction_date_end?: string;
	has_hold?: boolean;
}

export interface AgedSearchParams extends CommonSearchParams {
	age_min?: number;
	age_max?: number;
	has_sale?: boolean;
}

export interface ActiveSearchParams extends CommonSearchParams {
	has_sale?: boolean;
}

export interface DeletedSearchParams extends CommonSearchParams {
	age_min?: number;
	age_max?: number;
	found_date_start?: string;
	found_date_end?: string;
	has_hold?: boolean;
}

export interface MarketSearchParams extends CommonSearchParams {
	/** Comma-separated marketplace names, case-insensitive. */
	platform?: string;
	listed_days_min?: number;
	listed_days_max?: number;
	has_sale?: boolean;
}

export interface NrdDomain {
	domain: string;
	tld: string;
	created: string;
	expires: string;
	period: number;
	length: number;
	tld_count: number;
	components: string[] | null;
	for_sale: string;
}

export interface NrdLiveDomain {
	domain: string;
	tld: string;
	/** Full timestamp; the live feed carries time of day. */
	created: string;
	expires: string;
	length: number;
	components: string[] | null;
}

export interface ExpiredDomain {
	domain: string;
	tld: string;
	created: string;
	age: number;
	status: string;
	auction_date: string;
	found_date: string;
	length: number;
	category: string;
	majestic: number | null;
	backlinks: number | null;
	hold: string;
	tld_count: number;
}

export interface AgedDomain {
	domain: string;
	tld: string;
	created: string;
	age: number;
	length: number;
	components: string[] | null;
	for_sale: string;
	tld_count: number;
}

export interface ActiveDomain {
	domain: string;
	tld: string;
	length: number;
	for_sale: string;
	tld_count: number;
}

export interface DeletedDomain {
	domain: string;
	tld: string;
	age: number;
	reg_year: string;
	exp_year: string;
	found_date: string;
	length: number;
	components: string[] | null;
	hold: string;
	tld_count: number;
}

export interface MarketDomain {
	domain: string;
	tld: string;
	length: number;
	components: string[] | null;
	for_sale: string;
	platform: string;
	listed_days: number | null;
	tld_count: number;
}

export interface SearchResult<T> {
	data: T[];
	total: number;
}

export interface EndpointUsage {
	endpoint: string;
	rate_per_minute: number | string;
	daily_limit: number | string;
	daily_used: number;
	daily_remaining: number | string;
	monthly_limit?: number | string;
	monthly_used?: number;
	monthly_remaining?: number | string;
	page_limit?: number;
}

export interface Usage {
	endpoints: EndpointUsage[];
}

export interface WhoisRecord {
	domain: string;
	registrar_name?: string;
	created?: string;
	updated?: string;
	expires?: string;
	status?: string[];
	nameservers?: string[];
	[key: string]: unknown;
}

export interface DnsRecord {
	type: string;
	host: string;
	ttl: number;
	class?: string;
	ip?: string;
	ipv6?: string;
	target?: string;
	value?: string;
	[key: string]: unknown;
}

export interface DnsRecords {
	domain: string;
	records: Record<string, DnsRecord[]>;
	process_time_seconds?: number;
}

export interface NsReverseParams extends CommonSearchParams {
	ns: string;
}

export interface NsReverseDomain {
	domain: string;
	tld: string;
	length: number;
}

export interface NsReverseResult {
	data: NsReverseDomain[];
	/** Matches after filters. */
	total: number;
	/** Domains on this nameserver before filters. */
	ns_total: number;
	ns: string;
}

export interface SafetyReport {
	domain: string;
	safe?: {
		domain: string;
		is_safe: boolean;
		matches_count: number;
		scan_date?: string;
	};
	index?: {
		domain: string;
		indexed: boolean;
		index_count: number;
		checked_at?: string;
	};
}

export interface IpLookup {
	ip: string;
	connection?: { asn?: number; isp?: string; org?: string };
	location?: {
		city?: string;
		country?: string;
		country_code?: string;
		continent?: string;
		continent_code?: string;
		latitude?: number;
		longitude?: number;
	};
	attribution?: string;
}

export interface RegistrarEntry {
	id: string;
	name: string;
	status?: string;
	country?: string;
	rdap_url?: string;
	contact?: string;
}

export interface RegistrarResult {
	query: string;
	results: RegistrarEntry[];
}

export type TldAvailability = 'registered' | 'available' | string;

export interface TldCheckResult {
	data: Record<string, TldAvailability> | string[] | null;
	total: number;
	prefix: string;
}

export interface TldCheckParams {
	prefix: string;
	mode?: string;
	tlds?: string | string[];
}

export type TyposquatType =
	| 'omission'
	| 'transposition'
	| 'replacement'
	| 'insertion'
	| 'repetition'
	| 'hyphenation'
	| 'vowel-swap'
	| 'homoglyph'
	| 'plural'
	| 'exact-tld'
	| 'tld-swap'
	| 'combosquatting'
	| 'idn-homograph';

export interface TyposquatVariant {
	domain: string;
	tld: string;
	type: TyposquatType;
	registered: boolean;
	/** Marketplace listing code; empty string when not listed. */
	for_sale: string;
	expiring: boolean;
	tld_count: number;
	latest_whois?: {
		created?: string;
		updated?: string;
		expires?: string;
		registrar_name?: string;
		status?: string[];
		nameservers?: string[];
	};
}

export interface TyposquatResult {
	data: TyposquatVariant[];
	/** Matches after the types and registered filters. */
	total: number;
	domain: string;
	/** Unique variants generated, before filters. */
	generated: number;
	/** Variants observed as registered, before filters. */
	registered_total: number;
	limit: number;
	offset: number;
	whois_note?: string;
}

export interface TyposquatParams {
	domain: string;
	/** Comma-separated variant classes; omit for all 13. */
	types?: string;
	/** true keeps registered variants, false the unregistered ones; omit for both. */
	registered?: boolean;
	whois?: boolean;
	limit?: number;
	offset?: number;
}

export type ChangeReason =
	| 'new_registration'
	| 'domain_transfer'
	| 'domain_expired'
	| 'nameserver_change';

export interface MonitorChangesParams extends CommonSearchParams {
	reason?: ChangeReason;
	found_date_start?: string;
	found_date_end?: string;
}

export interface DomainChange {
	domain: string;
	tld: string;
	found_date: string;
	reason: ChangeReason;
	details_old: string;
	details_new: string;
	length: number;
	tld_count: number;
	components: string[] | null;
}

export interface CtHostname {
	d: string;
	ls: string;
}

export interface CtCertificate {
	domain: string;
	reg_domain?: string;
	fingerprint: string;
	issuer?: string;
	cert_type?: string;
	issue_time?: string;
	log_time?: string;
	not_after?: string;
	san_list?: string;
	source?: string;
	idx?: number;
}

export type CtScope = 'valid' | 'all';
export type CtField = 'domain' | 'reg' | 'sld';
export type CtSort = 'newest' | 'latest';
export type CtCertType = 'DV' | 'EV' | 'OV';

export interface CtCommonParams {
	after?: string;
	before?: string;
	scope?: CtScope;
	sort?: CtSort;
	issuer?: string;
	cert_type?: CtCertType;
	limit?: number;
}

export interface CtCertsParams extends CtCommonParams {
	domain?: string;
	fingerprint?: string;
}

export interface CtSearchParams extends CtCommonParams {
	keyword: string;
	field?: CtField;
	tld?: string;
}

export interface CtSubdomainsParams extends CtCommonParams {
	domain: string;
}

export type TrendsTldType = 'active' | 'newly';
export type TrendsKeywordType = 'hot' | 'emerging' | 'prefix';
