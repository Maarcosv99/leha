import { describe, it, expect } from "vitest";

import { eventHandlerSetup } from "@/setup";

import { CustomProvider } from "test/fixture/provider";
import { apiEvent } from "test/fixture/api-event";

import { yupValidator } from "@/addons/middlewares";
import { object, string } from "yup";

describe("Yup Validator middleware api", async () => {
	it("should return success true", async () => {
		const { api } = eventHandlerSetup({
			provider: CustomProvider,
		});

		const schema = object({
			name: string().min(1).max(255),
		});

		await expect(
			api([yupValidator("query", schema)], async (ctx) => {
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

		const schema = object({
			name: string().min(3).max(255),
		});

		const res = await api(
			[yupValidator("query", schema, true)],
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

		const schema = object({
			name: string().min(3).max(255),
		});

		const res = await api([yupValidator("query", schema)], async (ctx) => {
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

		const schema = object({
			name: string().min(1).max(255),
		});

		const customApiEvent = {
			...apiEvent,
			body: { name: "John Doe" },
		};

		await expect(
			api([yupValidator("json", schema)], async (ctx) => {
				ctx.res.json({ success: true, name: ctx.req.body.name });
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

		const schema = object({
			name: string().min(20).max(255),
		});

		const customApiEvent = {
			...apiEvent,
			body: { name: "John Doe" },
		};

		const res = await api(
			[yupValidator("json", schema, true)],
			async (ctx) => {
				ctx.res.json({ success: true, name: ctx.req.body.name });
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

		const schema = object({
			name: string().min(20).max(255),
		});

		const customApiEvent = {
			...apiEvent,
			body: { name: "John Doe" },
		};

		const res = await api([yupValidator("json", schema)], async (ctx) => {
			ctx.res.json({ success: true, name: ctx.req.body.name });
		})(customApiEvent);

		const response = res as any;

		expect(response.statusCode).toBe(400);
		expect(response.body).toBeUndefined();
	});
});
