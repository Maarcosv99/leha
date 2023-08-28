export class ApiRequest {
	constructor(
		public method: string,
		public headers: Record<string, string>,
		public body: string | Record<string, any>,
		public queryStringParameters: Record<string, string>,
		public pathParameters: string,
		public cookies: Record<string, string | boolean | number>,
		public ipAddress?: string
	) {}

	param(): string {
		return this.pathParameters || "";
	}

	query(param?: string): string | Record<string, string> {
		if (!param) return this.queryStringParameters || {};
		return this.queryStringParameters[param] || "";
	}

	header(param?: string): string | Record<string, string> {
		if (!param) return this.headers || {};
		return this.headers[param] || "";
	}
}
