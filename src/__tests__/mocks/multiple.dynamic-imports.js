export default `
    const a = await import("react");
    const b = import("lodash").then(m => m.default);
    import("./relative-file");
    const c = import("@scope/package");
`;
