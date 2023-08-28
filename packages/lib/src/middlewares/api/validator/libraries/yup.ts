import type { MiddlewareValidator } from "../interface";

import type { Schema, ValidationError } from "yup";

export const yupValidator: MiddlewareValidator<Schema> = (
	target: "json" | "query",
	schema: Schema,
	showErrors: boolean = false
) => {
	return {
		before: async (ctx) => {
			let input = ctx.req.body;
			if (target === "query") input = ctx.req.queryStringParameters;

			if (showErrors) {
				try {
					await schema.validate(input);
				} catch (err) {
					const error = err as ValidationError;
					return ctx.res.status(400).json({
						details: error.errors,
					});
				}
			} else {
				const parsed = await schema.isValid(input);
				if (!parsed) {
					return ctx.res.status(400);
				}
			}
		},
	};
};
