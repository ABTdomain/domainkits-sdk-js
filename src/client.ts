export type QueryParams = Record<string, unknown>;

export function toQuery(params: object): QueryParams {
	return { ...params } as QueryParams;
}

export interface RateLimit {
	limit: number | null;
	remaining: number | null;
	resetAt: Date | null;
}

export class DomainKitsError extends Error {
	readonly status: number;
	readonly rateLimit: RateLimit;

	constructor(message: string, status: number, rateLimit: RateLimit) {
		super(message);
		this.name = 'DomainKitsError';
		this.status = status;
		this.rateLimit = rateLimit;
	}
}

export class RateLimitError extends DomainKitsError {
	constructor(message: string, rateLimit: RateLimit) {
		super(message, 429, rateLimit);
		this.name = 'RateLimitError';
	}

	get retryAfterMs(): number | null {
		if (!this.rateLimit.resetAt) return null;
		return Math.max(0, this.rateLimit.resetAt.getTime() - Date.now());
	}
}

export class AuthError extends DomainKitsError {
	constructor(message: string, status: number, rateLimit: RateLimit) {
		super(message, status, rateLimit);
		this.name = 'AuthError';
	}
}

export interface ClientOptions {
	apiKey: string;
	baseUrl?: string;
	timeoutMs?: number;
	maxRetries?: number;
	fetch?: typeof globalThis.fetch;
}

interface Envelope<T> {
	success: boolean;
	error?: string;
	data?: T;
	total?: number;
}

const DEFAULT_BASE_URL = 'https://premium-api.domainkits.com/api/v1';
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_RETRIES = 2;

function readRateLimit(headers: Headers): RateLimit {
	const num = (name: string): number | null => {
		const raw = headers.get(name);
		if (raw === null) return null;
		const parsed = Number(raw);
		return Number.isFinite(parsed) ? parsed : null;
	};

	const reset = num('x-ratelimit-reset');
	return {
		limit: num('x-ratelimit-limit'),
		remaining: num('x-ratelimit-remaining'),
		resetAt: reset === null ? null : new Date(reset * 1000),
	};
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export class DomainKitsClient {
	private readonly apiKey: string;
	private readonly baseUrl: string;
	private readonly timeoutMs: number;
	private readonly maxRetries: number;
	private readonly fetchImpl: typeof globalThis.fetch;

	constructor(options: ClientOptions) {
		if (!options.apiKey) {
			throw new Error('apiKey is required. The DomainKits REST API rejects unauthenticated requests.');
		}
		this.apiKey = options.apiKey;
		this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
		this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
		this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
		this.fetchImpl = options.fetch ?? globalThis.fetch;
	}

	async requestRaw(path: string, params: Record<string, unknown> = {}): Promise<Response> {
		const url = new URL(this.baseUrl + path);
		for (const [key, value] of Object.entries(params)) {
			if (value === undefined || value === null || value === '') continue;
			url.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
		}

		let lastError: DomainKitsError | undefined;

		for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), this.timeoutMs);

			try {
				const response = await this.fetchImpl(url, {
					headers: { Authorization: `Bearer ${this.apiKey}`, Accept: 'application/json' },
					signal: controller.signal,
				});

				if (response.ok) return response;

				const rateLimit = readRateLimit(response.headers);
				const body = await response.text();
				const message = extractError(body) ?? `Request failed with status ${response.status}`;

				if (response.status === 401 || response.status === 403) {
					throw new AuthError(message, response.status, rateLimit);
				}

				if (response.status === 429) {
					const rateLimitError = new RateLimitError(message, rateLimit);
					lastError = rateLimitError;
					const waitMs = backoffFor(rateLimitError, attempt);
					if (attempt < this.maxRetries && waitMs !== null) {
						await sleep(waitMs);
						continue;
					}
					throw rateLimitError;
				}

				if (response.status >= 500 && attempt < this.maxRetries) {
					lastError = new DomainKitsError(message, response.status, rateLimit);
					await sleep(500 * 2 ** attempt);
					continue;
				}

				throw new DomainKitsError(message, response.status, rateLimit);
			} finally {
				clearTimeout(timer);
			}
		}

		throw lastError ?? new Error('Request failed after retries');
	}

	async request<T>(path: string, params: Record<string, unknown> = {}): Promise<T> {
		const response = await this.requestRaw(path, params);
		const envelope = (await response.json()) as Envelope<T>;

		if (envelope.success === false) {
			throw new DomainKitsError(
				envelope.error ?? 'DomainKits API returned an error',
				response.status,
				readRateLimit(response.headers),
			);
		}

		return (envelope.data ?? envelope) as T;
	}

	async requestList<T>(
		path: string,
		params: QueryParams = {},
	): Promise<{ data: T[]; total: number }> {
		const response = await this.requestRaw(path, params);
		const envelope = (await response.json()) as Envelope<T[]>;

		if (envelope.success === false) {
			throw new DomainKitsError(
				envelope.error ?? 'DomainKits API returned an error',
				response.status,
				readRateLimit(response.headers),
			);
		}

		const data = Array.isArray(envelope.data) ? envelope.data : [];
		return { data, total: envelope.total ?? data.length };
	}

	async requestEnvelope<T>(path: string, params: QueryParams = {}): Promise<T> {
		const response = await this.requestRaw(path, params);
		const envelope = (await response.json()) as Envelope<unknown>;

		if (envelope.success === false) {
			throw new DomainKitsError(
				envelope.error ?? 'DomainKits API returned an error',
				response.status,
				readRateLimit(response.headers),
			);
		}

		return envelope as T;
	}
}

function extractError(body: string): string | null {
	try {
		const parsed = JSON.parse(body) as { error?: string };
		return typeof parsed.error === 'string' ? parsed.error : null;
	} catch {
		return null;
	}
}

function backoffFor(error: RateLimitError, attempt: number): number | null {
	const untilReset = error.retryAfterMs;
	if (untilReset === null) return 1000 * 2 ** attempt;
	if (untilReset > 120_000) return null;
	return untilReset + 250;
}
