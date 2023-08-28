import type { AWS } from "@serverless/typescript";

const serverless: AWS = {
	service: "aws-serverless-framework",
	frameworkVersion: "3",
	plugins: ["serverless-esbuild"],
	provider: {
		name: "aws",
		runtime: "nodejs16.x",
		deploymentMethod: "direct",
		region: "us-east-1",
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true,
		},
	},
	package: {
		individually: true,
		excludeDevDependencies: true,
	},
	functions: {
		createUser: {
			handler: "application.createUser",
			events: [
				{
					http: {
						method: "post",
						path: "user",
					},
				},
			],
		},
		readUser: {
			handler: "application.readUser",
			events: [
				{
					http: {
						method: "get",
						path: "user",
					},
				},
			],
		},
	},
	custom: {
		esbuild: {
			bundle: true,
			minify: true,
			sourcemap: false,
			exclude: ["*"],
			target: "node16",
			define: { "require.resolve": undefined },
			platform: "node",
			concurrency: 10,
		},
	},
};

module.exports = serverless;
