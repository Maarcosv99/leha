import isEqual from "lodash.isequal";

export function matchObjects(obj1: Object, obj2: Object): boolean {
	return isEqual(obj1, obj2);
}
