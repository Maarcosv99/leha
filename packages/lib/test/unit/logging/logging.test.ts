import { describe, it } from "vitest";

import { eventHandlerSetup } from "@/setup";

import { CustomProvider } from "test/fixture/provider";

import { apiEvent } from "test/fixture/api-event";
import { queueEvent } from "test/fixture/queue-event";
import { busEvent } from "test/fixture/bus-event";

describe("Logging", () => {
	const { api, queue, bus } = eventHandlerSetup({
		provider: CustomProvider,
	});

	it("should log api", async () => {
		await api(async (ctx) => {
			ctx.log.info("Info logo");
		})(apiEvent);
	});

	it("should log queue", async () => {
		await queue(async (ctx) => {
			ctx.log.info("Info logo");
		})(queueEvent);
	});

	it("should log bus", async () => {
		await bus(async (ctx) => {
			ctx.log.info("Info logo");
		})(busEvent);
	});
});
