import { describe, it, expect, vi } from "vitest";

import { ApiResponse } from "@/context";
import { MimeType } from "@/types";

describe("Response", () => {
	it("should create a Response object with default values", () => {
		const response = new ApiResponse();
		expect(response.export).toStrictEqual({
			statusCode: 200,
			headers: {},
			body: undefined,
			isBase64Encoded: false,
		});
	});

	it("should set the Response status successfully", () => {
		const response = new ApiResponse();
		response.status(404);
		expect(response.export.statusCode).toBe(404);
	});

	it("should set the Response headers successfully", () => {
		const response = new ApiResponse();
		response.header("Content-Type", "application/json");
		response.header("Cache-Control", "no-cache");
		expect(response.export.headers).toStrictEqual({
			"content-type": "application/json",
			"cache-control": "no-cache",
		});
	});

	it("should set the Response content type successfully", () => {
		const response = new ApiResponse();
		response.type(MimeType.JSON);
		expect(response.export.headers).toStrictEqual({
			"content-type": "application/json",
		});
	});

	it("should set the Response body as JSON successfully", () => {
		const response = new ApiResponse();
		const body = { message: "Hello, world!" };
		response.json(body);
		expect(response.export.body).toBe(JSON.stringify(body, null, 2));
	});

	it("should set the Response body as text successfully", () => {
		const response = new ApiResponse();
		const body = "Hello, world!";
		response.text(body);
		expect(response.export.body).toBe(body);
	});

	it("should retrieve the Response headers successfully", () => {
		const response = new ApiResponse();
		response.header("Content-Type", "application/json");
		response.header("Cache-Control", "no-cache");
		expect(response.getHeader("content-type")).toBe("application/json");
		expect(response.getHeader("cache-control")).toBe("no-cache");
	});

	it("should retrieve all the Response headers successfully", () => {
		const response = new ApiResponse();
		response.header("Content-Type", "application/json");
		response.header("Cache-Control", "no-cache");
		expect(response.getHeaders()).toStrictEqual({
			"content-type": "application/json",
			"cache-control": "no-cache",
		});
	});

	it("should remove the specified Response header successfully", () => {
		const response = new ApiResponse();
		response.header("Content-Type", "application/json");
		response.header("Cache-Control", "no-cache");
		response.removeHeader("content-type");
		expect(response.getHeaders()).toStrictEqual({
			"cache-control": "no-cache",
		});
	});

	it("should redirect the Response successfully", () => {
		const response = new ApiResponse();
		response.redirect("/new-location");
		expect(response.export.statusCode).toBe(302);
		expect(response.export.headers).toStrictEqual({
			location: "/new-location",
		});
	});

	it("should set the Response headers with empty value successfully", () => {
		const response = new ApiResponse();
		response.header("Cache-Control", "");
		expect(response.export.headers).toStrictEqual({
			"cache-control": "",
		});
	});

	it("should set the Response headers with non-string value successfully", () => {
		const response = new ApiResponse();
		response.header("Content-Length", 100);
		expect(response.export.headers).toStrictEqual({
			"content-length": "100",
		});
	});
});
