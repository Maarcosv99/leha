import {
	ApiRequest,
	ApiResponse,
	QueueEvent,
	QueueResponse,
	BusEvent,
} from "@/context";

export type BaseContext = {
	raw: any;
};

export type ContextApi = BaseContext & {
	res: ApiResponse;
	req: ApiRequest;
};

export type ContextQueue = BaseContext & {
	res: QueueResponse;
	event: QueueEvent;
};

export type ContextBus = BaseContext & {
	event: BusEvent;
};

export type Context = ContextApi | ContextQueue | ContextBus;
