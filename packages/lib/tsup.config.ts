import { defineConfig } from "tsup";
import { getFilesSync } from "files-folder";

export default defineConfig({
	entry: getFilesSync("src"),
	splitting: false,
	clean: true,
	dts: true,
	format: ["esm", "cjs"],
	legacyOutput: false,
	platform: "node",
	target: "node12",
});
