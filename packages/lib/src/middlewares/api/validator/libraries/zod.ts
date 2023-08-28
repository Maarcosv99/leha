import type { MiddlewareValidator } from "../interface";

import type { ZodSchema } from "zod";

export const zodValidator: MiddlewareValidator<ZodSchema> = (
	target: "json" | "query",
	schema: ZodSchema,
	showErrors: boolean = false
) => {
	return {
		before: async (ctx) => {
			let input = ctx.req.body;
			if (target === "query") input = ctx.req.queryStringParameters;

			const parsed = await schema.safeParseAsync(input);
			if (!parsed.success) {
				if (showErrors) {
					return ctx.res.status(400).json({
						details: parsed.error.issues,
					});
				}
				return ctx.res.status(400);
			}
		},
	};
};
