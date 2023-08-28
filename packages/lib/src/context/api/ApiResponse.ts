import { StatusCode } from "@/types/status-code";
import { MimeType } from "@/types/mime-type";

export class ApiResponse {
	private _statusCode: StatusCode = 200;
	private _headers: Record<string, string> = {};
	private _body: string | undefined = undefined;
	private _isBase64Encoded: boolean = false;

	constructor() {}

	get export() {
		return {
			statusCode: this._statusCode,
			headers: this._headers,
			body: this._body,
			isBase64Encoded: this._isBase64Encoded,
		};
	}

	status(statusCode: StatusCode): ApiResponse {
		this._statusCode = statusCode;
		return this;
	}

	header(key: string, value: any, override = false): ApiResponse {
		key = key.toLowerCase();

		switch (typeof value) {
			case "string":
				break;
			case "number":
				value = value.toString();
				break;
			case "boolean":
				value = value ? "true" : "false";
				break;
			default:
				value = JSON.stringify(value);
		}

		if (Object.keys(this._headers).includes(key)) {
			if (this._headers[key].includes(value)) return this;
			if (override) this._headers[key] = value;
			else this._headers[key] += ";" + value;
		} else {
			this._headers[key] = value;
		}
		return this;
	}

	type(type: MimeType | string): ApiResponse {
		this.header("content-type", type);
		return this;
	}

	json(body: Record<string, any>): ApiResponse {
		this.type(MimeType.JSON);
		this._body = JSON.stringify(body, null, 2);
		return this;
	}

	text(body: string): ApiResponse {
		this.type(MimeType.PLAIN);
		this._body = body;
		return this;
	}

	send(body: string | Record<string, any>): ApiResponse {
		if (typeof body === "string") this.text(body);
		else this.json(body);
		return this;
	}

	html(body: string): ApiResponse {
		this.type(MimeType.HTML);
		this.send(body);
		return this;
	}

	getHeader(key: string): any {
		key = key.toLowerCase();
		return this._headers[key];
	}

	getHeaders(): Record<string, any> {
		return this._headers;
	}

	hasHeader(key: string): boolean {
		key = key.toLowerCase();
		return Object.keys(this._headers).includes(key);
	}

	removeHeader(key: string): ApiResponse {
		key = key.toLowerCase();
		delete this._headers[key];
		return this;
	}

	redirect(...args: [string] | [StatusCode, string]): ApiResponse {
		if (args.length === 1) {
			this.status(302);
			this.header("location", args[0]);
		} else {
			this.status(args[0]);
			this.header("location", args[1]);
		}
		return this;
	}
}
