export class BusEvent {
	constructor(
		public id: string,
		public body: string | number | boolean | Record<string, any>,
		public attributes?: Record<string, any>
	) {}
}
