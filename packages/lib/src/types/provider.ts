import {
	QueueEvent,
	QueueResponse,
	ApiRequest,
	ApiResponse,
	BusEvent,
} from "@/context";

export interface Provider {
	api: {
		handleRequest: (...args: any[]) => ApiRequest;
		handleResponse: (response: ApiResponse) => unknown;
	};
	queue: {
		handleEvent: (...args: any[]) => QueueEvent;
		handleResponse: (response: QueueResponse) => unknown;
	};
	bus: {
		handleEvent: (...args: any[]) => BusEvent;
	};
}
