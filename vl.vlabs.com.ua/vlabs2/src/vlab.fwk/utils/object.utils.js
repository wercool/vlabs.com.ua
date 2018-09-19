export function assign(targetObj, srcObj) {
    Object.keys(targetObj).forEach((targetObjProperty) => {
        if (srcObj.hasOwnProperty(targetObjProperty)) {
            targetObj[targetObjProperty] = srcObj[targetObjProperty];
        }
    });
    return targetObj;
}