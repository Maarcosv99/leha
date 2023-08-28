import {
	eventHandlerSetup,
	Aws,
	zodValidator as validator,
	cors,
} from "eha-serverless";
import { z } from "zod";

const { api } = eventHandlerSetup({
	provider: Aws(),
	api: {
		middlewares: [
			cors({
				allowedMethods: ["GET", "POST"],
				credentials: false,
				origin: "*",
			}),
		],
	},
});

const createUserSchema = z.object({
	name: z.string(),
	email: z.string().email(),
});

const readUserSchema = z.object({
	email: z.string().email(),
});

const createUser = api([validator("json", createUserSchema, true)], async (ctx) => {
	const { name, email } = ctx.req.body as z.infer<typeof createUserSchema>;
	ctx.res.status(200).json({ name, email });
});

const readUser = api([validator("query", readUserSchema, true)], async (ctx) => {
	const { email } = ctx.req.queryStringParameters as z.infer<typeof readUserSchema>;
	ctx.res.status(200).json({ email });
});

export { createUser, readUser };
