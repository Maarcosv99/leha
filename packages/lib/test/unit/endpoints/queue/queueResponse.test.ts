import { describe, it, expect } from "vitest";

import { QueueResponse } from "@/context";

describe("Response", () => {
	it("should create a Response object with default values", () => {
		const response = new QueueResponse();
		expect(response.export).toStrictEqual(undefined);
	});

	it("should set the Response body as JSON successfully", () => {
		const response = new QueueResponse();
		const body = { message: "Hello, world!" };
		response.json(body);
		expect(response.export).toBe(JSON.stringify(body, null, 2));
	});

	it("should set the Response body as text successfully", () => {
		const response = new QueueResponse();
		const body = "Hello, world!";
		response.text(body);
		expect(response.export).toBe(body);
	});
});
