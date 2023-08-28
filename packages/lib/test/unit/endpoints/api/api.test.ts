import { describe, it, expect } from "vitest";

import { eventHandlerSetup } from "@/setup";
import { ContextApi, Middleware, Provider } from "@/types";

import { CustomProvider } from "test/fixture/provider";
import { apiEvent } from "test/fixture/api-event";

describe("Api", () => {
	it("should handle request", async () => {
		const { api } = eventHandlerSetup({ provider: CustomProvider });

		const response = await api(async (ctx) => {
			ctx.res.json({ success: true });
		})(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 200,
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ success: true }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should read query parameters", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const endpoint = api(async (ctx) => {
			const { name } = ctx.req.queryStringParameters;
			ctx.res.json({ success: true, name });
		});

		const response = await endpoint({
			...apiEvent,
			query: { name: "John" },
		});

		expect(response).toStrictEqual({
			statusCode: 200,
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ success: true, name: "John" }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should read path parameters", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const endpoint = api(async (ctx) => {
			expect(ctx.req.pathParameters).toBe("/dev/me");
			ctx.res.json({ success: true });
		});

		const response = await endpoint({
			...apiEvent,
			path: "/dev/me",
		});

		expect(response).toStrictEqual({
			statusCode: 200,
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ success: true }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should read raw", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const event = {
			...apiEvent,
			path: { name: "John" },
		};

		await api(async (ctx) => {
			expect(ctx.raw).toStrictEqual(event);
		})(event);
	});

	it("should return response when api throws error without middleware", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const endpoint = api(async (ctx) => {
			throw new Error("Something went wrong");
		});

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 500,
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ details: "Error" }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should return custom response with middleware after", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: {
				middlewares: [
					{
						after: async (ctx) => {
							return ctx.res.status(404).json({ success: false });
						},
					},
				],
			},
		});

		const endpoint = api(async (ctx) => {
			ctx.res.json({ success: true });
		});

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 404,
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ success: false }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should return custom response with middleware before", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: {
				middlewares: [
					{
						before: async ({ res }) => {
							return res.json({ success: false }).status(404);
						},
					},
				],
			},
		});

		const endpoint = api(async (ctx) => {
			ctx.res.json({ success: true });
		});

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 404,
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ success: false }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should return custom response with middleware onError", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: {
				middlewares: [
					{
						onError: async (error, ctx) => {
							return ctx.res
								.json({
									success: false,
									error: {
										message: error.message,
										name: error.name,
									},
								})
								.status(404);
						},
					},
				],
			},
		});

		const endpoint = api(async (ctx) => {
			throw new Error("Something went wrong");
		});

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 404,
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(
				{
					success: false,
					error: {
						message: "Something went wrong",
						name: "Error",
					},
				},
				null,
				2
			),
			isBase64Encoded: false,
		});
	});

	it("should return custom response with middleware after defined on endpoint", async () => {
		const customMiddleware: Middleware<ContextApi> = {
			after: async (ctx) => {
				return ctx.res.status(404).json({ success: false });
			},
		};

		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const endpoint = api([customMiddleware], async (ctx) => {
			ctx.res.json({ success: true });
		});

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 404,
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ success: false }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should return custom response with middleware after defined on endpoint and global", async () => {
		const customMiddlewareGlobal: Middleware<ContextApi> = {
			after: async (ctx) => {
				ctx.res.status(404);
			},
		};

		const customMiddlewareEndpoint: Middleware<ContextApi> = {
			after: async (ctx) => {
				ctx.res.json({ success: false });
			},
		};

		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: { middlewares: [customMiddlewareGlobal] },
		});

		const endpoint = api([customMiddlewareEndpoint], async (ctx) => {
			ctx.res.json({ success: true });
		});

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 404,
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ success: false }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should return custom response with more than one middleware after defined on endpoint", async () => {
		const customMiddleware1: Middleware<ContextApi> = {
			after: async (ctx) => {
				ctx.res.status(404);
			},
		};

		const customMiddleware2: Middleware<ContextApi> = {
			after: async (ctx) => {
				ctx.res.json({ success: false });
			},
		};

		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const endpoint = api([customMiddleware1, customMiddleware2], async (ctx) => {
			ctx.res.json({ success: true });
		});

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 404,
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ success: false }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should return custom response with more than one middleware after defined on endpoint and global", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: {
				middlewares: [
					{
						after: async (ctx) => {
							ctx.res.header("x-custom", "global");
						},
					},
					{
						after: async (ctx) => {
							ctx.res.header("x-custom2", "global2");
						},
					},
				],
			},
		});

		const endpoint = api(
			[
				{
					after: async (ctx) => {
						ctx.res.status(404);
					},
				},
				{
					after: async (ctx) => {
						ctx.res.json({ success: false });
					},
				},
			],
			async (ctx) => {
				ctx.res.json({ success: true });
			}
		);

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 404,
			headers: {
				"content-type": "application/json",
				"x-custom": "global",
				"x-custom2": "global2",
			},
			body: JSON.stringify({ success: false }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should return custom response with middleware before defined on endpoint", async () => {
		const customMiddleware: Middleware<ContextApi> = {
			before: async ({ res }) => {
				return res.json({ success: false }).status(404);
			},
		};

		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const endpoint = api([customMiddleware], async (ctx) => {
			ctx.res.json({ success: true });
		});

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 404,
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ success: false }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should return custom response with middleware before defined on endpoint and global", async () => {
		const customMiddlewareGlobal: Middleware<ContextApi> = {
			before: async ({ res }) => {
				res.json({ success: false });
			},
		};

		const customMiddlewareEndpoint: Middleware<ContextApi> = {
			before: async ({ res }) => {
				res.status(404);
			},
		};

		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: { middlewares: [customMiddlewareGlobal] },
		});

		const endpoint = api([customMiddlewareEndpoint], async (ctx) => {});

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 404,
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ success: false }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should return custom response with more than one middleware before defined on endpoint", async () => {
		const customMiddlewareEndpoint1: Middleware<ContextApi> = {
			before: async ({ res }) => {
				res.json({ success: false });
			},
		};

		const customMiddlewareEndpoint2: Middleware<ContextApi> = {
			before: async ({ res }) => {
				res.status(404);
			},
		};

		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const endpoint = api(
			[customMiddlewareEndpoint1, customMiddlewareEndpoint2],
			async () => {}
		);

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 404,
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ success: false }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should return custom response with more than one middleware before defined on endpoint and global", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: {
				middlewares: [
					{
						before: async (ctx) => {
							ctx.res.header("x-custom", "global");
						},
					},
					{
						before: async (ctx) => {
							ctx.res.header("x-custom2", "global2");
						},
					},
				],
			},
		});

		const endpoint = api(
			[
				{
					before: async ({ res }) => {
						res.json({ success: false });
					},
				},
				{
					before: async ({ res }) => {
						res.status(404);
					},
				},
			],
			async (ctx) => {}
		);

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 404,
			headers: {
				"content-type": "application/json",
				"x-custom": "global",
				"x-custom2": "global2",
			},
			body: JSON.stringify({ success: false }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should return custom response with middleware onError defined on endpoint", async () => {
		const customMiddleware: Middleware<ContextApi> = {
			onError: async (error, ctx) => {
				return ctx.res
					.json({
						success: false,
						error: {
							message: error.message,
							name: error.name,
						},
					})
					.status(404);
			},
		};

		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const endpoint = api([customMiddleware], async (ctx) => {
			throw new Error("Something went wrong");
		});

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 404,
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(
				{
					success: false,
					error: {
						message: "Something went wrong",
						name: "Error",
					},
				},
				null,
				2
			),
			isBase64Encoded: false,
		});
	});

	it("should return custom response with middleware onError defined on endpoint and global", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: {
				middlewares: [
					{
						onError: async (_, ctx) => {
							ctx.res.status(404);
						},
					},
				],
			},
		});

		const endpoint = api(
			[
				{
					onError: async (_, ctx) => {
						ctx.res.json({ success: false });
					},
				},
			],
			async () => {
				throw new Error("Something went wrong");
			}
		);

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 404,
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ success: false }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should return custom response with more than one middleware onError defined on endpoint", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const endpoint = api(
			[
				{
					onError: async (_, ctx) => {
						ctx.res.json({ success: false });
					},
				},
				{
					onError: async (_, ctx) => {
						ctx.res.status(404);
					},
				},
			],
			async () => {
				throw new Error("Something went wrong");
			}
		);

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 404,
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ success: false }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should return custom response with more than one middleware onError defined on endpoint and global", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: {
				middlewares: [
					{
						onError: async (_, ctx) => {
							ctx.res.header("x-custom", "global");
						},
					},
					{
						onError: async (_, ctx) => {
							ctx.res.header("x-custom2", "global2");
						},
					},
				],
			},
		});

		const endpoint = api(
			[
				{
					onError: async (_, ctx) => {
						ctx.res.json({ success: false });
					},
				},
				{
					onError: async (_, ctx) => {
						ctx.res.status(404);
					},
				},
			],
			async () => {
				throw new Error("Something went wrong");
			}
		);

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 404,
			headers: {
				"content-type": "application/json",
				"x-custom": "global",
				"x-custom2": "global2",
			},
			body: JSON.stringify({ success: false }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should receive error on middleware with onError", async () => {
		const errorMessage = "Something went wrong";

		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: {
				middlewares: [
					{
						onError: async (error) => {
							expect(error.message).toBe(errorMessage);
						},
					},
				],
			},
		});

		const endpoint = api(
			[
				{
					onError: async (error) => {
						expect(error.message).toBe(errorMessage);
					},
				},
			],
			async () => {
				throw new Error("Something went wrong");
			}
		);

		await endpoint(apiEvent);
	});

	it("should return custom response when api throws error on middleware after", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: {
				middlewares: [
					{
						after: async () => {
							throw new Error("Something went wrong");
						},
					},
				],
			},
		});

		const endpoint = api([], async (ctx) => {
			ctx.res.json({ success: true });
		});

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 500,
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ details: "Error" }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should return custom response when api throws error on middleware before", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: {
				middlewares: [
					{
						before: async () => {
							throw new Error("Something went wrong");
						},
					},
				],
			},
		});

		const endpoint = api([], async (ctx) => {
			ctx.res.json({ success: true });
		});

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 500,
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ details: "Error" }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should return custom response when api throws error on middleware onError", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: {
				middlewares: [
					{
						onError: async () => {
							throw new Error("Something went wrong");
						},
					},
				],
			},
		});

		const endpoint = api([], async () => {
			throw new Error("Something went wrong");
		});

		const response = await endpoint(apiEvent);

		expect(response).toStrictEqual({
			statusCode: 500,
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ details: "Error" }, null, 2),
			isBase64Encoded: false,
		});
	});

	it("should use provider from api and not from global", async () => {
		const modifiedProvider: Provider = {
			...CustomProvider,
			api: {
				...CustomProvider.api,
				handleRequest: (...args: any[]) => {
					const request = CustomProvider.api.handleRequest(...args);
					request.body = { isCustomProvider: true };
					return request;
				},
			},
		};

		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: { provider: modifiedProvider },
		});

		const endpoint = api(async (ctx) => {
			expect(ctx.req.body).toStrictEqual({ isCustomProvider: true });
			ctx.res.json({ success: true });
		});

		await endpoint(apiEvent);
	});
});
