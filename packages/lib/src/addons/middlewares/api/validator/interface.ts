import { Middleware, ContextApi } from "@/types";

export type MiddlewareValidator<S> = (
	target: "json" | "query",
	schema: S,
	showErrors?: boolean
) => Middleware<ContextApi>;
