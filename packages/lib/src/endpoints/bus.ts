import {
	EndpointArgs,
	EventHandlerSetupOptions,
	Middleware,
	Callback,
	Provider,
	ContextBus,
	MiddlewareCycle,
} from "@/types";

import { Logging } from "@/logging";

export class BusHandler {
	private options: EventHandlerSetupOptions;
	private provider: Provider;
	private middlewares: Middleware<ContextBus>[];
	private callback: Callback<ContextBus>;
	private logging: Logging;
	private context?: ContextBus;

	constructor(
		options: EventHandlerSetupOptions,
		...args: EndpointArgs<ContextBus>
	) {
		this.options = options;
		this.provider = this.getProvider(options);
		this.logging = this.getLogging(options);
		this.callback = this.getCallback(...args);
		this.middlewares = this.getMiddlewares(options, ...args);
	}

	// Define the provider bus
	private getProvider(options: EventHandlerSetupOptions): Provider {
		return options.bus?.provider || options.provider;
	}

	// Initialize the logging
	private getLogging(options: EventHandlerSetupOptions) {
		const logging = new Logging();
		const provider = this.provider || this.getProvider(options);
		logging.environment = provider.loggingAdditionalInfo();
		return logging;
	}

	// Initialize the callback
	private getCallback(
		...args: EndpointArgs<ContextBus>
	): Callback<ContextBus> {
		return (
			Array.isArray(args[0]) ? args[1] : args[0]
		) as Callback<ContextBus>;
	}

	// Initialize the middlewares
	private getMiddlewares(
		options: EventHandlerSetupOptions,
		...args: EndpointArgs<ContextBus>
	): Middleware<ContextBus>[] {
		const argMiddlewares = Array.isArray(args[0]) ? args[0] : [];
		const optionMiddlewares = options.bus?.middlewares || [];
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
		if (this.context) this.logging.setContextBus(this.context);
	}

	// Create the context for event
	private createContext(...args: any[]): ContextBus {
		return {
			log: this.logging.log,
			raw: args, // Pure raw event
			event: this.provider.bus.handleEvent(...args),
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

			if (result) return result;
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
			const errorResult = await this.executeSafely(() =>
				this.executeMiddlewares(
					MiddlewareCycle.ON_ERROR,
					error as Error
				)
			);
			if (errorResult) return errorResult;

			return this.handleError(error as Error);
		}
	}

	// Handle the main event
	public async handleEvent(...args: any[]) {
		this.context = this.createContext(...args);
		this.setupLogging();

		// Handle middleware "before"
		const beforeResult = await this.executeSafely(() =>
			this.executeMiddlewares(MiddlewareCycle.BEFORE)
		);
		if (beforeResult) return beforeResult;

		// Try execute main callback and handle errors
		const callbackResult = await this.tryExecuteCallback();
		if (callbackResult) return callbackResult;
	}
}
