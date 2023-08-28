import { QueueResponse, ApiResponse } from "./context";
import {
	EventHandlerSetupOptions,
	Middleware,
	Callback,
	EndpointArgs,
	ContextApi,
	ContextBus,
	ContextQueue,
} from "./types";

export function eventHandlerSetup(options: EventHandlerSetupOptions) {
	const api = (...args: EndpointArgs<ContextApi>) => {
		const provider = options.api?.provider || options.provider;
		// @ts-ignore
		const middlewares: Middleware<ContextApi>[] = [
			...(Array.isArray(args[0]) ? args[0] : []),
			...(options.api?.middlewares || []),
		];

		const callback = (
			Array.isArray(args[0]) ? args[1] : args[0]
		) as Callback<ContextApi>;

		return async (...args: any[]) => {
			let response = new ApiResponse();
			let context: ContextApi = {
				raw: args,
				res: response,
				req: provider.api.handleRequest(...args),
				...options.context,
			};

			try {
				for (const middleware of middlewares) {
					if (middleware.before) {
						const result = await middleware.before(context);
						if (result) return provider.api.handleResponse(result);
					}
				}

				try {
					await callback(context);
				} catch (error) {
					const onErrorMiddlewares = middlewares.filter((m) => m.onError);
					for (const middleware of onErrorMiddlewares) {
						if (middleware.onError) {
							const result = await middleware.onError(error as Error, context);
							if (result) return provider.api.handleResponse(result);
						}
					}

					if (onErrorMiddlewares.length === 0) {
						return provider.api.handleResponse(
							new ApiResponse().status(500).json({ details: "Error" })
						);
					}
				}

				for (const middleware of middlewares) {
					if (middleware.after) {
						const result = await middleware.after(context);
						if (result) return provider.api.handleResponse(result);
					}
				}
			} catch (error) {
				return provider.api.handleResponse(
					new ApiResponse().status(500).json({ details: "Error" })
				);
			}

			return provider.api.handleResponse(response);
		};
	};

	const queue = (...args: EndpointArgs<ContextQueue>) => {
		const provider = options.queue?.provider || options.provider;
		const middlewares: Middleware<ContextQueue>[] = [
			...(Array.isArray(args[0]) ? args[0] : []),
			...(options.queue?.middlewares || []),
		];

		const callback = (
			Array.isArray(args[0]) ? args[1] : args[0]
		) as Callback<ContextQueue>;

		return async (...args: any[]): Promise<unknown> => {
			let response = new QueueResponse();

			let context: ContextQueue = {
				raw: args,
				res: response,
				event: provider.queue.handleEvent(...args),
				...options.context,
			};

			for (const middleware of middlewares) {
				if (middleware.before) {
					const result = await middleware.before(context);
					if (result) return provider.queue.handleResponse(result);
				}
			}

			try {
				await callback(context);
			} catch (error) {
				const onErrorMiddlewares = middlewares.filter((m) => m.onError);
				for (const middleware of onErrorMiddlewares) {
					if (middleware.onError) {
						const result = await middleware.onError(error as Error, context);
						if (result) return provider.queue.handleResponse(result);
					}
				}
				if (onErrorMiddlewares.length === 0) {
					throw error;
				}
			}

			for (const middleware of middlewares) {
				if (middleware.after) {
					const result = await middleware.after(context);
					if (result) return provider.queue.handleResponse(result);
				}
			}

			return provider.queue.handleResponse(response);
		};
	};

	const bus = (...args: EndpointArgs<ContextBus>) => {
		let provider = options.bus?.provider || options.provider;
		let middlewares: Middleware<ContextBus>[] = [
			...(Array.isArray(args[0]) ? args[0] : []),
			...(options.bus?.middlewares || []),
		];

		const callback = (
			Array.isArray(args[0]) ? args[1] : args[0]
		) as Callback<ContextBus>;

		return async (...args: any[]): Promise<void> => {
			const context: ContextBus = {
				raw: args,
				event: provider.bus.handleEvent(...args),
				...options.context,
			};

			try {
				await callback(context);
			} catch (error) {
				const onErrorMiddlewares = middlewares.filter((m) => m.onError);
				for (const middleware of onErrorMiddlewares) {
					if (middleware.onError) {
						await middleware.onError(error as Error, context);
					}
				}
				if (onErrorMiddlewares.length === 0) {
					throw error;
				}
			}
		};
	};

	return { api, queue, bus };
}
