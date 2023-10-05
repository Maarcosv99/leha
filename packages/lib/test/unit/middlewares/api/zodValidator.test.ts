import { describe, it, expect } from "vitest";

import { eventHandlerSetup } from "@/setup";

import { CustomProvider } from "test/fixture/provider";
import { apiEvent } from "test/fixture/api-event";

import { zodValidator } from "@/addons/middlewares";
import { z } from "zod";

describe("Zod Validator middleware api", async () => {
	it("should return success true", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const schema = z.object({
			name: z.string().min(1).max(255),
		});

		await expect(
			api([zodValidator("query", schema)], async (ctx) => {
				ctx.res.json({ success: true });
			})(apiEvent)
		).resolves.toMatchObject({
			statusCode: 200,
			body: JSON.stringify({ success: true }, null, 2),
			headers: {
				"content-type": "application/json",
			},
			isBase64Encoded: false,
		});
	});

	it("should return status 400 with error details", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const schema = z.object({
			name: z.string().min(3).max(255),
		});

		const res = await api(
			[zodValidator("query", schema, true)],
			async (ctx) => {
				ctx.res.json({ success: true });
			}
		)(apiEvent);

		const response = res as any;

		expect(response.statusCode).toBe(400);
		expect(JSON.parse(response.body)).toHaveProperty("details");
	});

	it("should return status 400 without error details", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const schema = z.object({
			name: z.string().min(3).max(255),
		});

		const res = await api([zodValidator("query", schema)], async (ctx) => {
			ctx.res.json({ success: true });
		})(apiEvent);

		const response = res as any;

		expect(response.statusCode).toBe(400);
		expect(response.body).toBeUndefined();
	});

	it("should validate json body", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const schema = z.object({
			name: z.string().min(1).max(255),
		});

		const customApiEvent = {
			...apiEvent,
			body: { name: "John Doe" },
		};

		await expect(
			api([zodValidator("json", schema)], async (ctx) => {
				const { name } = ctx.req.body as z.infer<typeof schema>;
				ctx.res.json({ success: true, name });
			})(customApiEvent)
		).resolves.toMatchObject({
			statusCode: 200,
			body: JSON.stringify({ success: true, name: "John Doe" }, null, 2),
			headers: {
				"content-type": "application/json",
			},
			isBase64Encoded: false,
		});
	});

	it("should validate json body and return status 400 with error details", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const schema = z.object({
			name: z.string().min(20).max(255),
		});

		const customApiEvent = {
			...apiEvent,
			body: { name: "John Doe" },
		};

		const res = await api(
			[zodValidator("json", schema, true)],
			async (ctx) => {
				const { name } = ctx.req.body as z.infer<typeof schema>;
				ctx.res.json({ success: true, name });
			}
		)(customApiEvent);

		const response = res as any;

		expect(response.statusCode).toBe(400);
		expect(JSON.parse(response.body)).toHaveProperty("details");
	});

	it("should validate json body and return status 400 without error details", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const schema = z.object({
			name: z.string().min(20).max(255),
		});

		const customApiEvent = {
			...apiEvent,
			body: { name: "John Doe" },
		};

		const res = await api([zodValidator("json", schema)], async (ctx) => {
			const { name } = ctx.req.body as { name: string };
			ctx.res.json({ success: true, name });
		})(customApiEvent);

		const response = res as any;

		expect(response.statusCode).toBe(400);
		expect(response.body).toBeUndefined();
	});
});
