export class QueueEvent {
	constructor(
		public id: string,
		public body: string | Record<string, any>,
		public attributes?: Record<string, any>,
		public messageAttributes?: Record<string, any>
	) {}
}
