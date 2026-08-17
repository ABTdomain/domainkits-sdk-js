export type ExpiryStage = 'expired' | 'redemption' | 'pending_delete';
export type KeywordPosition = 'start' | 'end' | 'middle' | 'contain';
export type Composition = 'all_alpha' | 'all_number';
export type LengthRange = '<5' | '5-10' | '10-15' | '15+' | (string & {});
export type HoldStatus = 'no_hold' | 'has_hold';
export type NewWithin = '1' | '2' | '3';
export type Marketplace =
	| 'Afternic'
	| 'Atom'
	| 'BuyDomains'
	| 'Dan'
	| 'DDD'
	| 'DN.com'
	| 'Godaddy'
	| 'Hugedomains'
	| 'SawSells'
	| 'Sedo'
	| 'Venture'
	| '4.cn'
	| (string & {});

export interface CommonSearchParams {
	keyword?: string;
	tld?: string;
	position?: KeywordPosition;
	exclude?: string;
	length?: LengthRange;
	type?: Composition;
	no_hyphen?: boolean;
	no_number?: boolean;
	limit?: number;
	offset?: number;
}

export interface ExpiredSearchParams extends CommonSearchParams {
	status?: ExpiryStage;
	age_range?: string;
	auction_date?: string;
	hold?: HoldStatus;
	new?: NewWithin;
	sort?: 'age_desc' | 'age_asc' | 'length_asc' | 'length_desc';
}

export interface NrdsSearchParams extends CommonSearchParams {
	days_range?: '0-10' | '10-20' | '20+';
	reg_date?: string;
	period?: '1' | '2-5' | '6+' | '2+' | '1-5';
	has_sale?: boolean;
	sort?: string;
}

export interface NrdsLiveSearchParams extends CommonSearchParams {
	days_range?: '0-10' | '10-20' | '20+';
	sort?: 'alpha' | 'length_desc' | 'length_asc' | 'reg_date_desc' | 'reg_date_asc';
}

export interface AgedSearchParams extends CommonSearchParams {
	age_range?: string;
	has_sale?: boolean;
	sort?: string;
}

export interface ActiveSearchParams extends CommonSearchParams {
	status?: string;
	sort?: string;
}

export interface DeletedSearchParams extends CommonSearchParams {
	keyword: string;
	age_range?: string;
	hold?: HoldStatus;
	new?: NewWithin;
	sort?: string;
}

export interface MarketSearchParams extends CommonSearchParams {
	platform?: Marketplace;
	new?: NewWithin;
	sort?: string;
}

export interface ExpiredDomain {
	domain: string;
	age?: number;
	registered_date?: string;
	status?: string;
	tld_count?: number;
}

export interface NrdDomain {
	domain: string;
	registered_date?: string;
	expiry_date?: string;
	tld_count?: number;
}

export interface NrdLiveDomain {
	domain: string;
	registered_date?: string;
	expiry_date?: string;
	tld?: string;
}

export interface AgedDomain {
	domain: string;
	age?: number;
	registered_date?: string;
	tld_count?: number;
}

export interface ActiveDomain {
	domain: string;
	tld_count?: number;
}

export interface DeletedDomain {
	domain: string;
	age?: number;
	registered_date?: string;
	tld_count?: number;
}

export interface MarketDomain {
	domain: string;
	marketplace?: string;
	tld?: string;
	price?: number;
	tld_count?: number;
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

export interface NsReverseParams {
	ns: string;
	tld?: string;
	keyword?: string;
	sort?: string;
	type?: Composition;
	no_number?: boolean;
	no_hyphen?: boolean;
	pure_alpha?: boolean;
	pure_digit?: boolean;
	min_len?: number;
	max_len?: number;
	limit?: number;
	offset?: number;
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

export interface TyposquatVariant {
	domain: string;
	registered: boolean;
	type?: string;
	status?: 'registered' | 'for_sale' | 'expiring';
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
	total: number;
	domain: string;
	variants_generated: number;
	variants_registered: number;
	whois_note?: string;
}

export interface TyposquatParams {
	domain: string;
	whois?: boolean;
	type?: string;
	unregistered?: boolean;
}

export interface MonitorChangesParams {
	keyword?: string;
	tld?: string;
	reason?: string;
	length?: number;
	no_number?: boolean;
	type?: 'all_number';
	has_digit?: boolean;
	limit?: number;
	offset?: number;
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
	san_list?: string[];
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
