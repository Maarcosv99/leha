import type { Provider } from "@/types";
import {
	ApiRequest,
	ApiResponse,
	QueueEvent,
	QueueResponse,
	BusEvent,
} from "@/context";

// Based on AWS Events.

export const CustomProvider: Provider = {
	api: {
		handleRequest: (...args: any[]): ApiRequest => {
			const event = args[0];

			const parseCookies = (cookie: string): Record<string, any> => {
				return cookie.split(";").reduce((acc, curr) => {
					const [key, value] = curr.trim().split("=");
					return { ...acc, [key]: value };
				}, {});
			};

			const headers = event.headers;
			let body = event.body;
			if (
				headers["Content-Type"] &&
				headers["Content-Type"].includes("application/json")
			) {
				body = JSON.parse(body);
			}

			const method = event.method;

			const queryStringParameters = event.query;
			const pathParameters = event.path;
			const ipAddress = event.identity
				? event.requestContext.identity.sourceIp
				: event.headers["X-Forwarded-For"].split(",")[0];

			let auth = undefined;
			if (event.requestContext.identity.cognitoIdentityPoolId) {
				auth = event.requestContext.authorizer.claims;
			}

			const cookies = parseCookies(event.headers.Cookie);

			return new ApiRequest(
				method,
				headers,
				body,
				queryStringParameters,
				pathParameters,
				cookies,
				ipAddress
			);
		},
		handleResponse: (response: ApiResponse): unknown => {
			return response.export;
		},
	},
	bus: {
		handleEvent: (...args: any[]): BusEvent => {
			const event = args[0];
			const message = event.Records[0].Sns.Message;

			try {
				return new BusEvent(event.job_id, JSON.parse(message));
			} catch (err) {
				return new BusEvent(event.job_id, message);
			}
		},
	},
	queue: {
		handleEvent: (...args: any[]): QueueEvent => {
			const event = args[0];
			let body = event.Records[0].body;
			try {
				body = JSON.parse(body);
			} catch (_) {}
			return new QueueEvent(event.job_id, body);
		},
		handleResponse: (response: QueueResponse): unknown => {
			if (response instanceof Error) throw response;
			return response.export;
		},
	},
};
