export type LoggerLevel =
	| "trace"
	| "debug"
	| "info"
	| "warn"
	| "error"
	| "fatal";

export type LoggerMethods = {
	[key in LoggerLevel]: (...args: any[]) => void;
};

export interface BaseLogger {
	level: LoggerLevel;
	timestamp: number;
	message: any;
	source: string;
	event?: Record<string, any>;
	request?: Record<string, any>;
	response?: string | Record<string, any>;
	rawEvent: Record<string, any>;
	environment: Record<string, any>;

	log: LoggerMethods;
}
