import getPackageName from "require-package-name";

export default source => {
    const regexes = [
        /import[ ]+['"](.*)['"]/g,
        /from[ ]+['"](.*)['"]/g,
        /require\(['"](.*)['"]/g
    ];

    const results = {};
    regexes.forEach(regex => {
        let m;
        while ((m = regex.exec(source)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            const statement = m[1];
            if (statement.startsWith(".") || statement.startsWith("/")) {
                continue;
            }

            const name = getPackageName(m[1]);
            if (results[name]) {
                continue;
            }
            results[name] = true;
        }
    });

    return Object.keys(results);
};
