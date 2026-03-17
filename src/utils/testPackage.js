/**
 * Add node: prefix to all system packages.
 */
const NODEJS_SYSTEM_PACKAGES = [
    "assert",
    "assert/strict",
    "async_hooks",
    "buffer",
    "child_process",
    "cluster",
    "console",
    "constants",
    "crypto",
    "dgram",
    "diagnostics_channel",
    "dns",
    "dns/promises",
    "domain",
    "events",
    "fs",
    "fs/promises",
    "http",
    "http2",
    "https",
    "inspector",
    "inspector/promises",
    "module",
    "net",
    "os",
    "path",
    "path/posix",
    "path/win32",
    "perf_hooks",
    "process",
    "punycode",
    "querystring",
    "readline",
    "readline/promises",
    "repl",
    "sea",
    "sqlite",
    "stream",
    "stream/consumers",
    "stream/promises",
    "stream/web",
    "string_decoder",
    "sys",
    "test",
    "test/reporters",
    "timers",
    "timers/promises",
    "tls",
    "trace_events",
    "tty",
    "url",
    "util",
    "util/types",
    "v8",
    "vm",
    "wasi",
    "worker_threads",
    "zlib"
].reduce((items, pkg) => {
    items.push(pkg);
    items.push(`node:${pkg}`);

    return items;
}, []);

export const extractDepsFromPackageJson = ({
    dependencies = {},
    devDependencies = {},
    peerDependencies = {}
}) => {
    return {
        dependencies: Object.keys(dependencies),
        devDependencies: Object.keys(devDependencies),
        peerDependencies: Object.keys(peerDependencies)
    };
};

export const extractIgnoredDepsFromConfig = (config = {}) => {
    const ignore = config.ignore || {};
    return {
        src: ignore.src || [],
        dependencies: ignore.dependencies || [],
        devDependencies: ignore.devDependencies || [],
        peerDependencies: ignore.peerDependencies || []
    };
};

export const isIgnoredDep = ({ type, dep, instance, adioRc }) => {
    if (NODEJS_SYSTEM_PACKAGES.includes(dep)) {
        return true;
    }

    let ignored;

    if (adioRc) {
        ignored = extractIgnoredDepsFromConfig(adioRc);

        if (ignored[type]) {
            if (ignored[type] === true) {
                return true;
            }

            if (Array.isArray(ignored[type]) && ignored[type].includes(dep)) {
                return true;
            }
        }
    }

    ignored = extractIgnoredDepsFromConfig(instance.config);

    if (ignored[type]) {
        if (ignored[type] === true) {
            return true;
        }

        if (Array.isArray(ignored[type]) && ignored[type].includes(dep)) {
            return true;
        }
    }

    return false;
};
