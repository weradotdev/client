import { FetchRequestInit, fetch } from "expo/fetch";

import { FormApi } from "@tanstack/react-form";
import { useAuthStore } from "@/stores/auth";

const VERSION = process.env.EXPO_PUBLIC_API_BASE_VERSION || "v1";

export class ApiClient {
	private baseURL: string;

	constructor(defaultBaseURL: string = "https://api.wera.dev/" + VERSION) {
		const { baseUrl } = useAuthStore.getState();
		this.baseURL = !!baseUrl ? `${baseUrl}/${VERSION}` : defaultBaseURL;
	}

	private async request<T>(
		endpoint: string,
		options: FetchRequestInit = {},
	): Promise<T> {
		const { token } = useAuthStore.getState();

		const url = `${this.baseURL}/${endpoint}`;
		const config: FetchRequestInit = {
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				...(token && { Authorization: `Bearer ${token}` }),
				...options.headers,
			},
			...options,
		};

		console.info({ url, ...config });

		const response = await fetch(url, config);

		if (response.ok) {

			const res=  response.json();

			console.info("API RES", endpoint, res);

			return res;

			// return response.json();
		}

		const errorData = await response.json().catch(e => {
			console.error("Failed to parse error response:", e);
		});

		// Handle 401 Unauthorized - logout user
		// if (response.status === 401) {
		// 	useAuthStore.getState().logout();
		// }

		// Handle 422 Validation Errors from Laravel
		if (response.status === 422) {
			const error = new Error(
				errorData?.message || "Validation failed",
			) as Error & { status?: number; errors?: any };

			error.status = response.status;
			error.errors = errorData.errors;

			return Promise.reject(error);
		}

		const error = new Error(
			errorData?.message || `API Error: ${response.status}`,
		) as Error & { status?: number; errors?: any };

		error.status = response.status;
		error.errors = errorData.errors;

		return Promise.reject(error);
	}

	private async uploadRequest<T>(
		endpoint: string,
		formData: FormData,
		options: FetchRequestInit = {},
	): Promise<T> {
		const token = useAuthStore.getState().token;

		const url = `${this.baseURL}${endpoint}`;
		const config: FetchRequestInit = {
			method: "POST",
			headers: {
				...(token && { Authorization: `Bearer ${token}` }),
				...options.headers,
			},
			body: formData,
			...options,
		};

		try {
			const response = await fetch(url, config);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));

				// Handle 401 Unauthorized - logout user
				if (response.status === 401) {
					await useAuthStore.getState().logout();
				}

				const error = new Error(
					errorData.message || `API Error: ${response.status}`,
				) as Error & { status?: number; errors?: any };
				error.status = response.status;
				error.errors = errorData.errors;
				throw error;
			}

			const res=  response.json();

			console.info("Upload response:", res);

			return res;

			// return response.json();
		} catch (error) {
			console.error("API Upload failed:", error);
			throw error;
		}
	}

	public get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
		if (params) {
			const queryString = new URLSearchParams(params).toString();

			endpoint += `?${queryString}`;
		}

		return this.request<T>(endpoint, { method: "GET" });
	}

	public post<T>(
		endpoint: string,
		body?: any,
		params?: Record<string, any>,
	): Promise<T> {
		if (!!params) {
			const queryString = new URLSearchParams(params).toString();

			endpoint += `?${queryString}`;
		}

		return this.request<T>(endpoint, {
			method: "POST",
			...(!!body && { body: JSON.stringify(body) }),
		});
	}

	public put<T>(endpoint: string, body: any): Promise<T> {
		return this.request<T>(endpoint, {
			method: "PUT",
			body: JSON.stringify(body),
		});
	}

	public delete<T>(
		endpoint: string,
		params?: Record<string, any>,
	): Promise<T> {
		if (params) {
			const queryString = new URLSearchParams(params).toString();

			endpoint += `?${queryString}`;
		}

		return this.request<T>(endpoint, { method: "DELETE" });
	}

	public upload<T>(endpoint: string, formData: FormData): Promise<T> {
		return this.uploadRequest<T>(endpoint, formData);
	}
}

export type ScopeTuple = [
	name: string,
	params?: Record<string, unknown> | unknown[],
];

export type Paginated<T> = {
	data: T[];
	meta: {
		current_page: number;
		last_page: number;
		per_page: number;
	};
	total: number;
};

export type ApiMethods<M = Record<string, unknown>> = {
	get<N>(path: string, limit?: number, page?: number): Promise<N>;
	index(limit?: number, page?: number): Promise<Paginated<M>>;
	search(
		query?: string,
		scope?: ScopeTuple,
		limit?: number,
		page?: number,
	): Promise<Paginated<M>>;
	find(key: string | number): Promise<M>;
	post<N>(path: string, payload: Record<string, unknown>): Promise<N>;
	store(payload: Record<string, unknown>): Promise<M>;
	update(key: string | number, payload: Record<string, unknown>): Promise<M>;
	destroy(key: string | number, force?: boolean): Promise<M>;
};

/**
 * Get typed API for a resource by name.
 * @example api('tasks').search('upgrade', ['forUser', { userId: 1 }])
 */
export function api<K>(resourceName?: string): ApiMethods<K> {
	const basePath = resourceName;

	return {
		get: async <N>(path: string, limit = 15, page = 1) =>
			await new ApiClient().get<N>(path, {
				limit,
				page,
			}),
		index: async (limit = 15, page = 1) =>
			await new ApiClient().get<Paginated<K>>(String(basePath), {
				limit,
				page,
			}),
		search: async (
			query?: string,
			scope?: ScopeTuple,
			limit = 15,
			page = 1,
		) =>
			await new ApiClient().post<Paginated<K>>(
				`${String(basePath)}/search`,
				{
					scope,
					search: { value: query ?? "" },
					filters: [],
					sort: [],
				},
				{ limit, page },
			),
		find: async (key: string | number) =>
			await new ApiClient().get<K>(`${String(basePath)}/${key}`),
		post: async <N>(path: string, payload: Record<string, unknown>) =>
			await new ApiClient().post<N>(path, payload),
		store: async (payload: Record<string, unknown>) =>
			await new ApiClient().post<K>(String(basePath), payload),
		update: async (
			key: string | number,
			payload: Record<string, unknown>,
		) =>
			await new ApiClient().put<K>(`${String(basePath)}/${key}`, payload),
		destroy: async (key: string | number, force = false) =>
			await new ApiClient().delete<K>(`${String(basePath)}/${key}`, {
				force,
			}),
	};
}

/**
 * Utility function to handle Laravel validation errors in Tanstack forms
 * Supports both standard Laravel format and custom error formats
 */
export function handleValidationErrors<T>(
	error: any,
	formApi: FormApi<T, any, any, any, any, any, any, any, any, any, any, any>,
) {
	if (!error.errors) return;

	if (typeof error.errors === "object" && !Array.isArray(error.errors)) {
		Object.entries(error.errors).forEach(([field, messages]) => {
			if (Array.isArray(messages) && messages.length > 0) {
				formApi.setFieldMeta(field, meta => ({
					...meta,
					errorMap: { onServer: { message: [messages[0]] } },
				}));
			}
		});
	} else {
		error.errors.forEach((errorItem: any) => {
			formApi.setFieldMeta(errorItem.field, meta => ({
				...meta,
				errorMap: { onServer: { message: errorItem.message } },
			}));
		});
	}

	formApi.setErrorMap({
		onSubmit: {
			fields: {},
		},
	});
}
