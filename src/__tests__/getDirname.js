import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const getDirname = currentFile => {
    return dirname(fileURLToPath(currentFile));
};
