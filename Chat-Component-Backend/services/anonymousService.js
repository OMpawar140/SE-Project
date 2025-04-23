const anonymousMap = new Map();

exports.getAnonymousName = (realName) => {
    if (!anonymousMap.has(realName)) {
        console.log(realName);
        const anonymousName = `(Anonymous)`;
        anonymousMap.set(realName, anonymousName);
    }
    return anonymousMap.get(realName);
};
