// Source: https://github.com/serverless/aws-event-mocks/blob/master/events/aws/sns.json

export const busEvent = {
	Records: [
		{
			EventVersion: "1.0",
			EventSubscriptionArn: "arn:aws:sns:EXAMPLE",
			EventSource: "aws:sns",
			Sns: {
				SignatureVersion: "1",
				Timestamp: "1970-01-01T00:00:00.000Z",
				Signature: "EXAMPLE",
				SigningCertUrl: "EXAMPLE",
				MessageId: "95df01b4-ee98-5cb9-9903-4c221d41eb5e",
				Message: "Hello from SNS!",
				MessageAttributes: {
					Test: {
						Type: "String",
						Value: "TestString",
					},
					TestBinary: {
						Type: "Binary",
						Value: "TestBinary",
					},
				},
				Type: "Notification",
				UnsubscribeUrl: "EXAMPLE",
				TopicArn: "arn:aws:sns:EXAMPLE",
				Subject: "TestInvoke",
			},
		},
	],
};
