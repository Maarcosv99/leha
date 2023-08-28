import { describe, it, expect, vi } from "vitest";

import { eventHandlerSetup } from "@/setup";
import { CustomProvider } from "test/fixture/provider";
import { queueEvent } from "test/fixture/queue-event";
import { ContextQueue, Middleware, Provider } from "@/types";

describe("Queue", () => {
	it("should handle event", async () => {
		const { queue } = eventHandlerSetup({ provider: CustomProvider });

		const response = await queue(async (ctx) => {
			ctx.res.json({ success: true });
		})(queueEvent);

		expect(response).toStrictEqual(JSON.stringify({ success: true }, null, 2));
	});

	it("should read body", async () => {
		const { queue } = eventHandlerSetup({ provider: CustomProvider });

		await queue(async (ctx) => {
			expect(ctx.event.body).toStrictEqual("Test message.");
		})(queueEvent);
	});

	it("should throw error when queue throws error without middleware", async () => {
		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
		});

		await expect(
			queue(async (_) => {
				throw new Error("Something went wrong");
			})(queueEvent)
		).rejects.toThrowError();
	});

	it("should return custom response with middleware after", async () => {
		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
			queue: {
				middlewares: [
					{
						after: async (ctx) => {
							return ctx.res.json({ success: false });
						},
					},
				],
			},
		});

		const response = await queue(async (ctx) => {
			ctx.res.json({ success: true });
		})(queueEvent);

		expect(response).toStrictEqual(JSON.stringify({ success: false }, null, 2));
	});

	it("should return custom response with middleware before", async () => {
		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
			queue: {
				middlewares: [
					{
						before: async (ctx) => {
							return ctx.res.json({ success: false });
						},
					},
				],
			},
		});

		const response = await queue(async (ctx) => {
			ctx.res.json({ success: true });
		})(queueEvent);

		expect(response).toStrictEqual(JSON.stringify({ success: false }, null, 2));
	});

	it("should return custom response with middleware onError", async () => {
		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
			queue: {
				middlewares: [
					{
						onError: async (error, ctx) => {
							return ctx.res.json({
								success: false,
								error: {
									message: error.message,
									name: error.name,
								},
							});
						},
					},
				],
			},
		});

		const response = await queue(async (ctx) => {
			throw new Error("Something went wrong");
		})(queueEvent);

		expect(response).toStrictEqual(
			JSON.stringify(
				{
					success: false,
					error: {
						message: "Something went wrong",
						name: "Error",
					},
				},
				null,
				2
			)
		);
	});

	it("should return custom response with middleware after defined on endpoint", async () => {
		const customMiddleware: Middleware<ContextQueue> = {
			after: async (ctx) => {
				return ctx.res.json({ success: false });
			},
		};

		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const response = await queue([customMiddleware], async (ctx) => {
			ctx.res.json({ success: true });
		})(queueEvent);

		expect(response).toStrictEqual(JSON.stringify({ success: false }, null, 2));
	});

	it("should run middlewares after defined on endpoint and global", async () => {
		const mockFnAfterGlobal = vi.fn();
		const mockFnAfterEndpoint = vi.fn();

		const customMiddlewareGlobal: Middleware<ContextQueue> = {
			after: async (_) => {
				mockFnAfterGlobal();
			},
		};

		const customMiddlewareEndpoint: Middleware<ContextQueue> = {
			after: async (_) => {
				mockFnAfterEndpoint();
			},
		};

		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
			queue: { middlewares: [customMiddlewareGlobal] },
		});

		await queue([customMiddlewareEndpoint], async (ctx) => {
			ctx.res.json({ success: true });
		})(queueEvent);

		expect(mockFnAfterEndpoint).toHaveBeenCalled();
		expect(mockFnAfterGlobal).toHaveBeenCalled();
	});

	it("should run which middleware after defined on endpoint, when have more than one", async () => {
		const mockFnAfter1 = vi.fn();
		const mockFnAfter2 = vi.fn();

		const customMiddleware1: Middleware<ContextQueue> = {
			after: async (_) => {
				mockFnAfter1();
			},
		};

		const customMiddleware2: Middleware<ContextQueue> = {
			after: async (_) => {
				mockFnAfter2();
			},
		};

		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
		});

		await queue([customMiddleware1, customMiddleware2], async (ctx) => {
			ctx.res.json({ success: true });
		})(queueEvent);

		expect(mockFnAfter1).toHaveBeenCalled();
		expect(mockFnAfter2).toHaveBeenCalled();
	});

	it("should run which middleware after defined on endpoint and global, when have more than one in both", async () => {
		const mockFnAfterGlobal1 = vi.fn();
		const mockFnAfterGlobal2 = vi.fn();

		const mockFnAfterEndpoint1 = vi.fn();
		const mockFnAfterEndpoint2 = vi.fn();

		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
			queue: {
				middlewares: [
					{
						after: async (ctx) => {
							mockFnAfterGlobal1();
						},
					},
					{
						after: async (ctx) => {
							mockFnAfterGlobal2();
						},
					},
				],
			},
		});

		await queue(
			[
				{
					after: async (ctx) => {
						mockFnAfterEndpoint1();
					},
				},
				{
					after: async (ctx) => {
						mockFnAfterEndpoint2();
					},
				},
			],
			async (ctx) => {
				ctx.res.json({ success: true });
			}
		)(queueEvent);

		expect(mockFnAfterGlobal1).toHaveBeenCalled();
		expect(mockFnAfterGlobal2).toHaveBeenCalled();

		expect(mockFnAfterEndpoint1).toHaveBeenCalled();
		expect(mockFnAfterEndpoint2).toHaveBeenCalled();
	});

	it("should run middleware before defined on endpoint", async () => {
		const customMiddleware: Middleware<ContextQueue> = {
			before: async ({ res }) => {
				return res.json({ success: false });
			},
		};

		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const response = await queue([customMiddleware], async (ctx) => {
			ctx.res.json({ success: true });
		})(queueEvent);

		expect(response).toStrictEqual(JSON.stringify({ success: false }, null, 2));
	});

	it("should run middlewares before defined on endpoint and global", async () => {
		const mockFnBeforeGlobal = vi.fn();
		const mockFnBeforeEndpoint = vi.fn();

		const customMiddlewareGlobal: Middleware<ContextQueue> = {
			before: async () => {
				mockFnBeforeGlobal();
			},
		};

		const customMiddlewareEndpoint: Middleware<ContextQueue> = {
			before: async () => {
				mockFnBeforeEndpoint();
			},
		};

		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
			queue: { middlewares: [customMiddlewareGlobal] },
		});

		await queue([customMiddlewareEndpoint], async (ctx) => {})(queueEvent);

		expect(mockFnBeforeGlobal).toHaveBeenCalled();
		expect(mockFnBeforeEndpoint).toHaveBeenCalled();
	});

	it("should run middlewares before defined on endpoint", async () => {
		const mockFnBefore1 = vi.fn();
		const mockFnBefore2 = vi.fn();

		const customMiddlewareEndpoint1: Middleware<ContextQueue> = {
			before: async () => {
				mockFnBefore1();
			},
		};

		const customMiddlewareEndpoint2: Middleware<ContextQueue> = {
			before: async () => {
				mockFnBefore2();
			},
		};

		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
		});

		await queue(
			[customMiddlewareEndpoint1, customMiddlewareEndpoint2],
			async () => {}
		)(queueEvent);

		expect(mockFnBefore1).toHaveBeenCalled();
		expect(mockFnBefore2).toHaveBeenCalled();
	});

	it("should run middlewares before defined on endpoint and global, when have more than one in both", async () => {
		const mockFnBeforeGlobal1 = vi.fn();
		const mockFnBeforeGlobal2 = vi.fn();

		const mockFnBeforeEndpoint1 = vi.fn();
		const mockFnBeforeEndpoint2 = vi.fn();

		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
			queue: {
				middlewares: [
					{
						before: async () => {
							mockFnBeforeGlobal1();
						},
					},
					{
						before: async () => {
							mockFnBeforeGlobal2();
						},
					},
				],
			},
		});

		await queue(
			[
				{
					before: async () => {
						mockFnBeforeEndpoint1();
					},
				},
				{
					before: async () => {
						mockFnBeforeEndpoint2();
					},
				},
			],
			async () => {}
		)(queueEvent);

		expect(mockFnBeforeGlobal1).toHaveBeenCalled();
		expect(mockFnBeforeGlobal2).toHaveBeenCalled();

		expect(mockFnBeforeEndpoint1).toHaveBeenCalled();
		expect(mockFnBeforeEndpoint2).toHaveBeenCalled();
	});

	it("should return custom response with middleware onError defined on endpoint", async () => {
		const customMiddleware: Middleware<ContextQueue> = {
			onError: async (error, ctx) => {
				return ctx.res.json({
					success: false,
					error: {
						message: error.message,
						name: error.name,
					},
				});
			},
		};

		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const response = await queue([customMiddleware], async (ctx) => {
			throw new Error("Something went wrong");
		})(queueEvent);

		expect(response).toStrictEqual(
			JSON.stringify(
				{
					success: false,
					error: {
						message: "Something went wrong",
						name: "Error",
					},
				},
				null,
				2
			)
		);
	});

	it("should return custom response with middleware onError defined on endpoint and global", async () => {
		const mockFnOnErrorGlobal = vi.fn();

		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
			queue: {
				middlewares: [
					{
						onError: async (_, ctx) => {
							mockFnOnErrorGlobal();
						},
					},
				],
			},
		});

		const response = await queue(
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
		)(queueEvent);

		expect(mockFnOnErrorGlobal).toHaveBeenCalled();
		expect(response).toStrictEqual(JSON.stringify({ success: false }, null, 2));
	});

	it("should run middlewares onError defined on endpoint", async () => {
		const mockFnOnError1 = vi.fn();
		const mockFnOnError2 = vi.fn();

		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const error = new Error("Something went wrong");

		await queue(
			[
				{
					onError: async (err) => {
						mockFnOnError1(err);
					},
				},
				{
					onError: async (err) => {
						mockFnOnError2(err);
					},
				},
			],
			async () => {
				throw error;
			}
		)(queueEvent);

		expect(mockFnOnError1).toHaveBeenCalledWith(error);
		expect(mockFnOnError2).toHaveBeenCalledWith(error);
	});

	it("should run middlewares onError defined on endpoint and global, when have more than one in both", async () => {
		const mockFnOnErrorGlobal1 = vi.fn();
		const mockFnOnErrorGlobal2 = vi.fn();

		const mockFnOnErrorEndpoint1 = vi.fn();
		const mockFnOnErrorEndpoint2 = vi.fn();

		const error = new Error("Something went wrong");

		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
			queue: {
				middlewares: [
					{
						onError: async (err) => {
							mockFnOnErrorGlobal1(err);
						},
					},
					{
						onError: async (err) => {
							mockFnOnErrorGlobal2(err);
						},
					},
				],
			},
		});

		await queue(
			[
				{
					onError: async (err) => {
						mockFnOnErrorEndpoint1(err);
					},
				},
				{
					onError: async (err) => {
						mockFnOnErrorEndpoint2(err);
					},
				},
			],
			async () => {
				throw error;
			}
		)(queueEvent);

		expect(mockFnOnErrorGlobal1).toHaveBeenCalledWith(error);
		expect(mockFnOnErrorGlobal2).toHaveBeenCalledWith(error);

		expect(mockFnOnErrorEndpoint1).toHaveBeenCalledWith(error);
		expect(mockFnOnErrorEndpoint2).toHaveBeenCalledWith(error);
	});

	it("should receive error on middleware with onError", async () => {
		const errorMessage = "Something went wrong";

		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
			queue: {
				middlewares: [
					{
						onError: async (error) => {
							expect(error.message).toBe(errorMessage);
						},
					},
				],
			},
		});

		await queue(
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
		)(queueEvent);
	});

	it("should return error when queue throws error on middleware after", async () => {
		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
			queue: {
				middlewares: [
					{
						after: async () => {
							throw new Error("Something went wrong");
						},
					},
				],
			},
		});

		await expect(
			queue([], async (ctx) => {
				ctx.res.json({ success: true });
			})(queueEvent)
		).rejects.toThrowError();
	});

	it("should return error when queue throws error on middleware before", async () => {
		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
			queue: {
				middlewares: [
					{
						before: async () => {
							throw new Error("Something went wrong");
						},
					},
				],
			},
		});

		await expect(
			queue([], async (ctx) => {
				ctx.res.json({ success: true });
			})(queueEvent)
		).rejects.toThrowError();
	});

	it("should return error when queue throws error on middleware onError", async () => {
		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
			queue: {
				middlewares: [
					{
						onError: async () => {
							throw new Error("Something went wrong");
						},
					},
				],
			},
		});

		await expect(
			queue([], async () => {
				throw new Error("Something went wrong");
			})(queueEvent)
		).rejects.toThrowError();
	});

	it("should use provider from queue and not from global", async () => {
		const modifiedProvider: Provider = {
			...CustomProvider,
			queue: {
				...CustomProvider.queue,
				handleEvent: (...args: any[]) => {
					const request = CustomProvider.queue.handleEvent(...args);
					request.body = { isCustomProvider: true };
					return request;
				},
			},
		};

		const { queue } = eventHandlerSetup({
			provider: CustomProvider,
			queue: { provider: modifiedProvider },
		});

		await queue(async (ctx) => {
			expect(ctx.event.body).toStrictEqual({ isCustomProvider: true });
		})(queueEvent);
	});
});
