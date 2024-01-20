import * as wasm from "./analyzer_bg.wasm";
import { __wbg_set_wasm } from "./analyzer_bg.js";
__wbg_set_wasm(wasm);
export * from "./analyzer_bg.js";
