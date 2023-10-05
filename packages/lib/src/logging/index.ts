import type {
	BaseLogger,
	LoggerMethods,
	LoggerLevel,
	ContextApi,
	ContextQueue,
	ContextBus,
} from "@/types";

export class Logging implements BaseLogger {
	level: LoggerLevel = "info";
	timestamp: number = Date.now();
	message: string = "";
	source: string = "";
	event?: Record<string, any>;
	request?: Record<string, any>;
	response?: string | Record<string, any>;
	rawEvent: Record<string, any> = {};
	environment: Record<string, any> = {};

	log: LoggerMethods = {
		info: this.customizeLog.bind(this, "info"),
		trace: this.customizeLog.bind(this, "trace"),
		debug: this.customizeLog.bind(this, "debug"),
		warn: this.customizeLog.bind(this, "warn"),
		error: this.customizeLog.bind(this, "error"),
		fatal: this.customizeLog.bind(this, "fatal"),
	};

	setContextApi(context: ContextApi) {
		const { req, raw, res } = context;

		this.rawEvent = raw;

		this.request = {
			method: req.method,
			headers: req.headers,
			body: req.body,
			queryStringParameters: req.queryStringParameters,
			pathParameters: req.pathParameters,
			cookies: req.cookies,
			ipAddress: req.ipAddress,
		};

		this.response = res ? res.export : undefined;
	}

	setContextQueue(context: ContextQueue) {
		const { event, raw, res } = context;

		this.rawEvent = raw;

		this.event = {
			id: event.id,
			body: event.body,
			attributes: event.attributes,
			messageAttributes: event.messageAttributes,
		};

		this.response = res ? res.export : undefined;
	}

	setContextBus(context: ContextBus) {
		const { event, raw } = context;

		this.rawEvent = raw;

		this.event = {
			id: event.id,
			body: event.body,
			attributes: event.attributes,
		};
	}

	customizeLog(level: LoggerLevel, ...args: any[]) {
		this.level = level;

		let logMethod: any;

		switch (level) {
			case "info":
				logMethod = console.info;
				break;
			case "trace":
				logMethod = console.trace;
				break;
			case "debug":
				logMethod = console.debug;
				break;
			case "warn":
				logMethod = console.warn;
				break;
			case "error":
				logMethod = console.error;
				break;
			case "fatal":
				logMethod = console.error;
				break;
			default:
				logMethod = console.log;
				break;
		}

		logMethod({
			level: this.level,
			timestamp: this.timestamp,
			source: this.source,
			event: this.event,
			request: this.request,
			response: this.response,
			rawEvent: this.rawEvent,
			environment: this.environment,
			message: args,
		});
	}
}
