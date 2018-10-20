export function assign(targetObj, srcObj) {
    Object.keys(targetObj).forEach((targetObjProperty) => {
        if (srcObj.hasOwnProperty(targetObjProperty)) {
            targetObj[targetObjProperty] = srcObj[targetObjProperty];
        }
    });
    return targetObj;
}
export function merge(targetObj, srcObj) {
    let mObj = {};
    for (var attrname in targetObj) {
        mObj[attrname] = targetObj[attrname];
    }
    for (var attrname in srcObj) {
        mObj[attrname] = srcObj[attrname];
    }
    return mObj;
}