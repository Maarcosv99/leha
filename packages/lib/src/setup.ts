import {
	EventHandlerSetupOptions,
	EndpointArgs,
	ContextApi,
	ContextBus,
	ContextQueue,
} from "./types";

import { ApiHandler, QueueHandler, BusHandler } from "@/endpoints";

export function eventHandlerSetup(options: EventHandlerSetupOptions) {
	// Setup api event handler
	const api = (...endpointArgs: EndpointArgs<ContextApi>) => {
		const apiInstance = new ApiHandler(options, ...endpointArgs);
		return async (...eventArgs: any[]) =>
			await apiInstance.handleEvent(...eventArgs);
	};

	// Setup queue event handler
	const queue = (...endpointArgs: EndpointArgs<ContextQueue>) => {
		const queueInstance = new QueueHandler(options, ...endpointArgs);
		return async (...eventArgs: any[]) =>
			await queueInstance.handleEvent(...eventArgs);
	};

	// Setup bus event handler
	const bus = (...endpointArgs: EndpointArgs<ContextBus>) => {
		const busInstance = new BusHandler(options, ...endpointArgs);
		return async (...eventArgs: any[]) =>
			await busInstance.handleEvent(...eventArgs);
	};

	return { api, queue, bus };
}
