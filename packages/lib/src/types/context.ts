import type {
	ApiRequest,
	ApiResponse,
	QueueEvent,
	QueueResponse,
	BusEvent,
} from "@/context";
import type { LoggerMethods } from "./logging";

export type BaseContext = {
	raw: any;
	log: LoggerMethods;
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
