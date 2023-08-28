import { describe, it, expect } from "vitest";

import { eventHandlerSetup } from "@/setup";

import { Aws } from "@/providers";

import { apiEvent } from "test/fixture/api-event";
import { queueEvent } from "test/fixture/queue-event";
import { busEvent } from "test/fixture/bus-event";

describe("Aws provider", async () => {
	it("should handle api event", async () => {
		const { api } = eventHandlerSetup({
			provider: Aws(),
		});

		await api(async (ctx) => {
			expect(ctx.req.headers).toBe(apiEvent.headers);
			expect(ctx.req.body).toBe(JSON.stringify(apiEvent.body, null, 2));
			expect(ctx.req.method).toBe(apiEvent.method);
			expect(ctx.req.pathParameters).toBe(apiEvent.path);
			expect(ctx.req.cookies).toBe(apiEvent.headers["Cookie"]);
			expect(ctx.req.ipAddress).toBe(apiEvent.requestContext.identity.sourceIp);
			expect(ctx.req.queryStringParameters).toBe(apiEvent.query);
			expect(ctx.raw).toBe(apiEvent);
		})(apiEvent);
	});

	it("should handle queue event", async () => {
		const { queue } = eventHandlerSetup({
			provider: Aws(),
		});

		const mockedEvent = queueEvent.Records[0];

		await queue(async (ctx) => {
			ctx.event.id = mockedEvent.messageId;
			ctx.event.body = mockedEvent.body;
			ctx.event.attributes = mockedEvent.attributes;
			ctx.event.messageAttributes = mockedEvent.messageAttributes;
		})(queueEvent);
	});

	it("should handle bus event", async () => {
		const { bus } = eventHandlerSetup({
			provider: Aws(),
		});

		const mockedEvent = busEvent.Records[0].Sns;

		await bus(async (ctx) => {
			ctx.event.id = mockedEvent.MessageId;
			ctx.event.body = mockedEvent.Message;
			ctx.event.attributes = mockedEvent.MessageAttributes;
		})(busEvent);
	});

	it("should handle api response", async () => {
		const { api } = eventHandlerSetup({
			provider: Aws(),
		});

		const res = await api(async (ctx) => {
			ctx.res.json({ success: true }).header("Authorization", "123");
		})(apiEvent);

		expect(res).toMatchObject({
			statusCode: 200,
			body: JSON.stringify({ success: true }, null, 2),
			headers: {
				authorization: "123",
				"content-type": "application/json",
			},
			isBase64Encoded: false,
		});
	});

	it("should handle queue response", async () => {
		const { queue } = eventHandlerSetup({
			provider: Aws(),
		});

		const res = await queue(async (ctx) => {
			ctx.res.text("Hello, world!");
		})(queueEvent);

		expect(res).toStrictEqual("Hello, world!");
	});
});
