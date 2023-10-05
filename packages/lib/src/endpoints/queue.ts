import {
	EndpointArgs,
	EventHandlerSetupOptions,
	Middleware,
	Callback,
	Provider,
	ContextQueue,
	MiddlewareCycle,
} from "@/types";
import { QueueResponse } from "@/context";

import { matchObjects } from "@/utils/matchObjects";
import { Logging } from "@/logging";

export class QueueHandler {
	private response: QueueResponse;
	private options: EventHandlerSetupOptions;
	private provider: Provider;
	private middlewares: Middleware<ContextQueue>[];
	private callback: Callback<ContextQueue>;
	private logging: Logging;
	private context?: ContextQueue;

	constructor(
		options: EventHandlerSetupOptions,
		...args: EndpointArgs<ContextQueue>
	) {
		this.response = new QueueResponse();
		this.options = options;
		this.provider = this.getProvider(options);
		this.logging = this.getLogging(options);
		this.callback = this.getCallback(...args);
		this.middlewares = this.getMiddlewares(options, ...args);
	}

	// Define the provider queue
	private getProvider(options: EventHandlerSetupOptions): Provider {
		return options.queue?.provider || options.provider;
	}

	// Initialize the logging
	private getLogging(options: EventHandlerSetupOptions) {
		const logging = new Logging();
		const provider = this.provider || this.getProvider(options);
		logging.environment = provider.loggingAdditionalInfo() || {};
		return logging;
	}

	// Initialize the callback
	private getCallback(
		...args: EndpointArgs<ContextQueue>
	): Callback<ContextQueue> {
		return (
			Array.isArray(args[0]) ? args[1] : args[0]
		) as Callback<ContextQueue>;
	}

	// Initialize the middlewares
	private getMiddlewares(
		options: EventHandlerSetupOptions,
		...args: EndpointArgs<ContextQueue>
	): Middleware<ContextQueue>[] {
		const argMiddlewares = Array.isArray(args[0]) ? args[0] : [];
		const optionMiddlewares = options.queue?.middlewares || [];
		return [...argMiddlewares, ...optionMiddlewares];
	}

	// Handle errors and register them
	private handleError(error?: Error): unknown {
		if (error) this.logging.log.error(error);
		throw error;
	}

	// Execute the function and capture errors
	private async executeSafely(
		fn: () => Promise<void | unknown>
	): Promise<void | unknown> {
		try {
			return await fn();
		} catch (error) {
			return this.handleError(error as Error);
		}
	}

	// Set context on logging
	private setupLogging() {
		if (this.context) this.logging.setContextQueue(this.context);
	}

	// Create the context for event
	private createContext(...args: any[]): ContextQueue {
		return {
			log: this.logging.log,
			raw: args, // Pure raw event
			event: this.provider.queue.handleEvent(...args),
			res: this.response,
			...this.options.context,
		};
	}

	// Execute middlewares for a specific cycle
	protected async executeMiddlewares(
		cycle: MiddlewareCycle,
		error?: any
	): Promise<void | unknown> {
		this.logging.source = `middleware.${cycle}`;
		if (!this.context) throw new Error("Context is not defined");

		const relevanteMiddlewares = this.middlewares.filter(
			(middleware) => cycle in middleware
		);
		for (const middleware of relevanteMiddlewares) {
			const result =
				cycle === MiddlewareCycle.ON_ERROR
					? await middleware.onError!(error, this.context)
					: await middleware[cycle]!(this.context);

			if (result) return this.provider.queue.handleResponse(result);
		}
	}

	// Execute the main callback
	protected async executeCallback(): Promise<void> {
		this.logging.source = "function";
		if (!this.context) throw new Error("Context is not defined");
		await this.callback(this.context);
	}

	// Try execute the main callback and handle errors
	private async tryExecuteCallback(): Promise<unknown | null> {
		try {
			await this.executeCallback();
			return null;
		} catch (error) {
			const prevResponse = this.context?.res.export;

			const errorResult = await this.executeSafely(() =>
				this.executeMiddlewares(
					MiddlewareCycle.ON_ERROR,
					error as Error
				)
			);
			if (errorResult) return errorResult;

			if (
				!matchObjects(
					prevResponse || {},
					this.context?.res.export || {}
				)
			) {
				return this.provider.queue.handleResponse(this.context!.res);
			}

			return this.handleError(error as Error);
		}
	}

	// Handle the main event
	public async handleEvent(...args: any[]) {
		this.context = this.createContext(...args);
		this.setupLogging();

		// Handle middleware "before" and return if response is defined
		const beforeResult = await this.executeSafely(() =>
			this.executeMiddlewares(MiddlewareCycle.BEFORE)
		);
		if (beforeResult) return beforeResult;

		// Try execute main callback and handle errors
		const callbackResult = await this.tryExecuteCallback();
		if (callbackResult) return callbackResult;

		// Handle middlewares "after"
		const afterResult = await this.executeSafely(() =>
			this.executeMiddlewares(MiddlewareCycle.AFTER)
		);
		if (afterResult) return afterResult;

		// Return the response
		return this.provider.queue.handleResponse(this.context.res);
	}
}
