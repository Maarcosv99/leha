import type { Context } from "./context";

export type Callback<T extends Context> = (context: T) => Promise<void>;
