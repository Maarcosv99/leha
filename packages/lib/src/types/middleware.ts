import type { Context } from "./context";

/*
	If key is "onError", the middleware function will receive an error as the first argument.
*/
export type Middleware<C extends Context, R = any> = {
	[key in MiddlewareCycle]?: key extends MiddlewareCycle.ON_ERROR
		? (error: Error, context: C) => Promise<void | R>
		: (context: C) => Promise<void | R>;
};

export enum MiddlewareCycle {
	BEFORE = "before",
	AFTER = "after",
	ON_ERROR = "onError",
}
