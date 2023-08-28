import type { ContextApi, ContextBus, ContextQueue } from "./context";
import type { ApiResponse, QueueResponse } from "@/context";

export type Middleware<T> = T extends ContextApi
	? {
			before?: (context: ContextApi) => Promise<void | ApiResponse>;
			after?: (context: ContextApi) => Promise<void | ApiResponse>;
			onError?: (error: Error, context: ContextApi) => Promise<void | ApiResponse>;
	  }
	: T extends ContextQueue
	? {
			before?: (context: ContextQueue) => Promise<void | QueueResponse>;
			after?: (context: ContextQueue) => Promise<void | QueueResponse>;
			onError?: (
				error: Error,
				context: ContextQueue
			) => Promise<void | QueueResponse>;
	  }
	: T extends ContextBus
	? {
			onError?: (error: Error, context: ContextBus) => Promise<void>;
	  }
	: never;
