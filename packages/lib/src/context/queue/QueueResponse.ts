export class QueueResponse {
	private _body: string | undefined = undefined;

	constructor() {}

	get export() {
		return this._body;
	}

	json(body: Record<string, any>): QueueResponse {
		this._body = JSON.stringify(body, null, 2);
		return this;
	}

	text(body: string): QueueResponse {
		this._body = body;
		return this;
	}

	send(body: string | Record<string, any>): QueueResponse {
		if (typeof body === "string") this.text(body);
		else this.json(body);
		return this;
	}

	html(body: string): QueueResponse {
		this.send(body);
		return this;
	}
}
