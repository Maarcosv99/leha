import { describe, it, expect } from "vitest";

import { eventHandlerSetup } from "@/setup";

import { CustomProvider } from "test/fixture/provider";
import { apiEvent } from "test/fixture/api-event";

import { cors } from "@/addons/middlewares/api/cors";

describe("Cors middleware api", async () => {
	it("should set default cors headers", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: { middlewares: [cors()] },
		});

		await api(async (ctx) => {
			expect(ctx.res.getHeader("access-control-allow-origin")).toEqual(
				"*"
			);
		})(apiEvent);
	});

	it("should set cors headers with multiple origns", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: {
				middlewares: [
					cors({
						origin: ["https://example.com", "https://example2.com"],
					}),
				],
			},
		});

		await api(async (ctx) => {
			expect(ctx.res.getHeader("access-control-allow-origin")).toEqual(
				"https://example.com,https://example2.com"
			);
		})(apiEvent);
	});

	it("should return 204 and cors headers on OPTIONS request", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
			api: {
				middlewares: [
					cors({
						origin: "https://example.com",
					}),
				],
			},
		});

		const customEvent = { ...apiEvent, method: "OPTIONS" };

		await api(async (ctx) => {
			expect(ctx.res.getHeaders()).toStrictEqual({
				"access-control-allow-origin": "https://example.com",
				"access-control-allow-methods":
					"GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS",
			});
		})(customEvent);
	});
});
