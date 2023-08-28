import type { Provider } from "@/types";
import {
	ApiRequest,
	ApiResponse,
	QueueEvent,
	QueueResponse,
	BusEvent,
} from "@/context";

import type {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	SQSEvent,
	SNSEvent,
} from "aws-lambda";

export const Aws = (): Provider => {
	const parseToJSON = (body: string): Record<string, any> | string => {
		try {
			return JSON.parse(body);
		} catch (error) {
			return body || "";
		}
	};

	return {
		api: {
			handleRequest: (event: APIGatewayProxyEvent): ApiRequest => {
				const method = event.httpMethod;
				const headers = event.headers;
				const body = event.body ? parseToJSON(event.body) : event.body;
				const queryStringParameters = event.queryStringParameters || {};
				const pathParameters = event.path || "";
				const cookies = event.headers["Cookie"] || {};
				const ipAddress = event.requestContext.identity.sourceIp;

				return new ApiRequest(
					method,
					headers as Record<string, string>,
					body || "",
					queryStringParameters as Record<string, string>,
					pathParameters,
					cookies,
					ipAddress
				);
			},
			handleResponse: (response: ApiResponse): APIGatewayProxyResult => {
				const exportedResponse = response.export;

				return {
					statusCode: exportedResponse.statusCode,
					body: exportedResponse.body || "",
					headers: exportedResponse.headers,
					isBase64Encoded: exportedResponse.isBase64Encoded,
				};
			},
		},
		queue: {
			handleEvent: (event: SQSEvent): QueueEvent => {
				const id = event.Records[0].messageId;
				const body = parseToJSON(event.Records[0].body);
				const attributes = event.Records[0].attributes;
				const messageAttributes = event.Records[0].messageAttributes;

				return new QueueEvent(id, body, attributes, messageAttributes);
			},
			handleResponse: (response: QueueResponse): unknown => {
				return response.export;
			},
		},
		bus: {
			handleEvent: (event: SNSEvent): BusEvent => {
				const id = event.Records[0].Sns.MessageId;
				const body = parseToJSON(event.Records[0].Sns.Message);
				const attributes = event.Records[0].Sns.MessageAttributes;

				return new BusEvent(id, body, attributes);
			},
		},
	};
};
