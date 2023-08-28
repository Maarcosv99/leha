import type { Middleware } from "@/types";
import { ContextApi } from "@/types";

type Methods = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";

interface CorsOptions {
	origin?: string | string[];
	allowedMethods?: Methods[];
	allowedHeaders?: string[];
	maxAge?: number;
	credentials?: boolean;
	exposeHeaders?: string[];
}

export function cors(options?: CorsOptions): Middleware<ContextApi> {
	const defaultOptions: CorsOptions = {
		origin: "*",
		allowedMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: [],
		exposeHeaders: [],
	};

	const corsOptions = Object.assign({}, defaultOptions, options);

	const findOrigin = (origin: string) => {
		if (Array.isArray(corsOptions.origin)) {
			return corsOptions.origin.includes(origin) ? origin : undefined;
		} else if (typeof corsOptions.origin === "string") {
			return corsOptions.origin;
		} else {
			return undefined;
		}
	};

	return {
		before: async (ctx) => {
			const allowOrigin = findOrigin(ctx.req.headers.origin);
			if (allowOrigin) ctx.res.header("Access-Control-Allow-Origin", allowOrigin);

			if (corsOptions.credentials) {
				ctx.res.header("Access-Control-Allow-Credentials", "true");
			}

			if (corsOptions.exposeHeaders?.length) {
				ctx.res.header(
					"Access-Control-Expose-Headers",
					corsOptions.exposeHeaders.join(",")
				);
			}
		},
		after: async (ctx) => {
			if (ctx.req.method === "OPTIONS") {
				if (corsOptions.maxAge) {
					ctx.res.header("Access-Control-Max-Age", corsOptions.maxAge.toString());
				}

				if (corsOptions.allowedMethods?.length) {
					ctx.res.header(
						"Access-Control-Allow-Methods",
						corsOptions.allowedMethods.join(",")
					);
				}

				if (corsOptions.allowedHeaders?.length) {
					ctx.res.header(
						"Access-Control-Allow-Headers",
						corsOptions.allowedHeaders.join(",")
					);
				}

				return ctx.res.status(204);
			}
		},
	};
}
