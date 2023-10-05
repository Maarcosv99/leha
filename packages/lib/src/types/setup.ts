import type { Provider } from "./provider";
import type { Middleware } from "./middleware";
import type { Context, ContextApi, ContextQueue, ContextBus } from "./context";
import type { Callback } from "./callback";

export type Endpoint<T extends Context> = T extends ContextApi
	? { provider?: Provider; middlewares?: Middleware<ContextApi>[] }
	: T extends ContextQueue
	? { provider?: Provider; middlewares?: Middleware<ContextQueue>[] }
	: T extends ContextBus
	? { provider?: Provider; middlewares?: Middleware<ContextBus>[] }
	: never;

export type EndpointType = "api" | "queue" | "bus";
export type EndpointArgs<T extends Context> = T extends ContextApi
	? [Middleware<ContextApi>[], Callback<ContextApi>] | [Callback<ContextApi>]
	: T extends ContextQueue
	?
			| [Middleware<ContextQueue>[], Callback<ContextQueue>]
			| [Callback<ContextQueue>]
	: T extends ContextBus
	? [Middleware<ContextBus>[], Callback<ContextBus>] | [Callback<ContextBus>]
	: never;

export type EventHandlerSetupOptions = {
	provider: Provider;
	api?: Endpoint<ContextApi>;
	queue?: Endpoint<ContextQueue>;
	bus?: Endpoint<ContextBus>;
	context?: Record<string, unknown>;
};
