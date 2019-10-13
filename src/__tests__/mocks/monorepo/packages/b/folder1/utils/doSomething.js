import sanitizeFilename from "sanitize-filename";
import Lambda from "aws-sdk/clients/Lambda";

Lambda.something();

export default filename => sanitizeFilename(filename);
