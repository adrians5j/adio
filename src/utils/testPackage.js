const extractDepsFromPackageJson = ({
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

const extractIgnoredDepsFromConfig = (config = {}) => {
    const ignore = config.ignore || {};
    return {
        src: ignore.src || [],
        dependencies: ignore.dependencies || [],
        devDependencies: ignore.devDependencies || [],
        peerDependencies: ignore.peerDependencies || []
    };
};

const isIgnoredDep = ({ type, dep, instance, adioRc }) => {
    let ignored = extractIgnoredDepsFromConfig(adioRc);

    if (ignored[type]) {
        if (ignored[type] === true) {
            return true;
        }

        if (Array.isArray(ignored[type]) && ignored[type].includes(dep)) {
            return true;
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

module.exports = {
    extractDepsFromPackageJson,
    extractIgnoredDepsFromConfig,
    isIgnoredDep
};
