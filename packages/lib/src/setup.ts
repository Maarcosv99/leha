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
		return async (...eventArgs: any[]) => {
			const apiInstance = new ApiHandler(options, ...endpointArgs);
			return await apiInstance.handleEvent(...eventArgs);
		};
	};

	// Setup queue event handler
	const queue = (...endpointArgs: EndpointArgs<ContextQueue>) => {
		return async (...eventArgs: any[]) => {
			const queueInstance = new QueueHandler(options, ...endpointArgs);
			return await queueInstance.handleEvent(...eventArgs);
		};
	};

	// Setup bus event handler
	const bus = (...endpointArgs: EndpointArgs<ContextBus>) => {
		return async (...eventArgs: any[]) => {
			const busInstance = new BusHandler(options, ...endpointArgs);
			return await busInstance.handleEvent(...eventArgs);
		};
	};

	return { api, queue, bus };
}
