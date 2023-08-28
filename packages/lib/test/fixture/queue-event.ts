// Source 01: https://github.com/serverless/aws-event-mocks/blob/master/events/aws/sqs.json

export const queueEvent = {
	Records: [
		{
			messageId: "059f36b4-87a3-44ab-83d2-661975830a7d",
			receiptHandle: "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
			body: "Test message.",
			attributes: {
				ApproximateReceiveCount: "1",
				SentTimestamp: "1545082649183",
				SenderId: "594035263019",
				ApproximateFirstReceiveTimestamp: "1545082649185",
			},
			messageAttributes: {},
			md5OfBody: "e4e68fb7bd0e697a0ae8f1bb342846b3",
			eventSource: "aws:sqs",
			eventSourceARN: "arn:aws:sqs:us-east-2:123456789012:my-queue",
			awsRegion: "us-east-2",
		},
	],
};
