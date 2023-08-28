import { describe, it, expect, vi } from "vitest";

import { eventHandlerSetup } from "@/setup";
import { CustomProvider } from "test/fixture/provider";
import { busEvent } from "test/fixture/bus-event";
import { ContextBus, Middleware, Provider } from "@/types";

describe("Bus", () => {
	it("should handle event", async () => {
		const { bus } = eventHandlerSetup({ provider: CustomProvider });
		const response = await bus(async (_) => {})(busEvent);
		expect(response).toBeUndefined();
	});

	it("should read body", async () => {
		const { bus } = eventHandlerSetup({ provider: CustomProvider });

		await bus(async (ctx) => {
			expect(ctx.event.body).toStrictEqual("Hello from SNS!");
		})(busEvent);
	});

	it("should throw error when bus throws error without middleware", async () => {
		const { bus } = eventHandlerSetup({
			provider: CustomProvider,
		});

		await expect(
			bus(async (_) => {
				throw new Error("Something went wrong");
			})(busEvent)
		).rejects.toThrowError();
	});

	it("should return undefined with middleware onError", async () => {
		const error = new Error("Something went wrong");

		const { bus } = eventHandlerSetup({
			provider: CustomProvider,
			bus: {
				middlewares: [
					{
						onError: async (error) => {
							expect(error).toBe(error);
						},
					},
				],
			},
		});

		await expect(
			bus(async () => {
				throw error;
			})(busEvent)
		).resolves.toBeUndefined();
	});

	it("should receive error on middleware with onError", async () => {
		const error = new Error("Something went wrong");

		const { bus } = eventHandlerSetup({
			provider: CustomProvider,
			bus: {
				middlewares: [
					{
						onError: async (error) => {
							expect(error).toBe(error);
						},
					},
				],
			},
		});

		await bus(
			[
				{
					onError: async (error) => {
						expect(error).toBe(error);
					},
				},
			],
			async () => {
				throw error;
			}
		)(busEvent);
	});

	it("should return error when bus throws error on middleware onError", async () => {
		const { bus } = eventHandlerSetup({
			provider: CustomProvider,
			bus: {
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
			bus([], async () => {
				throw new Error("Something went wrong");
			})(busEvent)
		).rejects.toThrowError();
	});

	it("should use provider from bus and not from global", async () => {
		const modifiedProvider: Provider = {
			...CustomProvider,
			bus: {
				...CustomProvider.bus,
				handleEvent: (...args: any[]) => {
					const event = CustomProvider.bus.handleEvent(...args);
					event.body = { isCustomProvider: true };
					return event;
				},
			},
		};

		const { bus } = eventHandlerSetup({
			provider: CustomProvider,
			bus: { provider: modifiedProvider },
		});

		await bus(async (ctx) => {
			expect(ctx.event.body).toStrictEqual({ isCustomProvider: true });
		})(busEvent);
	});
});
