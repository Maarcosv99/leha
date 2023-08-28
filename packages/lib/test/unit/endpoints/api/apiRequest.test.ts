import { describe, it, expect } from "vitest";

import { eventHandlerSetup } from "@/setup";

import { CustomProvider } from "test/fixture/provider";
import { apiEvent } from "test/fixture/api-event";

import { ApiRequest } from "@/context";

describe("ApiRequest", () => {
	const { api } = eventHandlerSetup({
		provider: CustomProvider,
	});

	it("should return a request object", async () => {
		await api(async (ctx) => {
			expect(ctx.req).instanceOf(ApiRequest);
		})(apiEvent);
	});

	it("should return all headers", async () => {
		await api(async (ctx) => {
			expect(ctx.req.header()).toEqual(apiEvent.headers);
		})(apiEvent);
	});

	it("should return specific header", async () => {
		await api(async (ctx) => {
			expect(ctx.req.header("Accept")).toEqual(apiEvent.headers["Accept"]);
		})(apiEvent);
	});

	it("should return undefined for non-existent header", async () => {
		await api(async (ctx) => {
			expect(ctx.req.header("Inexistent")).toStrictEqual("");
		})(apiEvent);
	});

	it("should return all query params", async () => {
		await api(async (ctx) => {
			expect(ctx.req.query()).toStrictEqual(apiEvent.query);
		})(apiEvent);
	});

	it("should return specific query param", async () => {
		await api(async (ctx) => {
			expect(ctx.req.query("name")).toStrictEqual(apiEvent.query.name);
		})(apiEvent);
	});

	it("should return undefined for non-existent query param", async () => {
		await api(async (ctx) => {
			expect(ctx.req.query("Inexistent")).toStrictEqual("");
		})(apiEvent);
	});

	it("should return path parameters", async () => {
		await api(async (ctx) => {
			expect(ctx.req.param()).toStrictEqual("");
		})(apiEvent);
	});
});
