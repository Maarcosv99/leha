// Source 01: https://github.com/serverless/aws-event-mocks/blob/master/events/aws/apiGateway.json
// Source 02: https://www.serverless.com/framework/docs/providers/aws/events/apigateway

export const apiEvent = {
	body: JSON.stringify({
		message: "Hello, world!",
	}),
	method: "GET",
	httpMethod: "GET",
	principalId: "",
	stage: "dev",
	headers: {
		Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
		"Accept-Encoding": "gzip, deflate",
		"Accept-Language": "en-us",
		"CloudFront-Forwarded-Proto": "https",
		"CloudFront-Is-Desktop-Viewer": "true",
		"CloudFront-Is-Mobile-Viewer": "false",
		"CloudFront-Is-SmartTV-Viewer": "false",
		"CloudFront-Is-Tablet-Viewer": "false",
		"CloudFront-Viewer-Country": "US",
		Cookie:
			"__gads=ID=d51d609e5753330d:T=1443694116:S=ALNI_MbjWKzLwdEpWZ5wR5WXRI2dtjIpHw; __qca=P0-179798513-1443694132017; _ga=GA1.2.344061584.1441769647",
		Host: "xxx.execute-api.us-east-1.amazonaws.com",
		"User-Agent":
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/601.6.17 (KHTML, like Gecko) Version/9.1.1 Safari/601.6.17",
		Via: "1.1 fb7cca60f0ecd82ce07790c9c5eef16c.cloudfront.net (CloudFront)",
		"X-Amz-Cf-Id": "nBsWBOrSHMgnaROZJK1wGCZ9PcXNrlA5CeeJCAJFpSZb0r9ttRLSrg==",
		"X-Forwarded-For": "221.24.103.21, 54.242.148.216",
		"X-Forwarded-Port": "443",
		"X-Forwarded-Proto": "https",
	},
	query: {
		name: "me",
	},
	path: "/me",
	identity: {
		cognitoIdentityPoolId: "",
		accountId: "",
		cognitoIdentityId: "",
		caller: "",
		apiKey: "",
		sourceIp: "221.24.103.21",
		cognitoAuthenticationType: "",
		cognitoAuthenticationProvider: "",
		userArn: "",
		userAgent:
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/601.6.17 (KHTML, like Gecko) Version/9.1.1 Safari/601.6.17",
		user: "",
	},
	stageVariables: {},
	requestContext: {
		path: "/dev/",
		accountId: "125002137610",
		resourceId: "qdolsr1yhk",
		stage: "dev",
		requestId: "0f2431a2-6d2f-11e7-b799-5152aa497861",
		identity: {
			cognitoIdentityPoolId: null,
			accountId: null,
			cognitoIdentityId: null,
			caller: null,
			apiKey: "",
			sourceIp: "50.129.117.14",
			accessKey: null,
			cognitoAuthenticationType: null,
			cognitoAuthenticationProvider: null,
			userArn: null,
			userAgent:
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36",
			user: null,
		},
		resourcePath: "/",
		httpMethod: "POST",
		apiId: "j3azlsj0c4",
	},
};
