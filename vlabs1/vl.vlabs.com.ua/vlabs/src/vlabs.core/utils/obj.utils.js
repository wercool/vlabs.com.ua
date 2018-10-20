export function mergeObjects(obj1, obj2) {
    let mObj = {};
    console.log('mergeObjects obj1:', obj1);
    console.log('mergeObjects obj2:', obj1);
    for (var attrname in obj1) {
        mObj[attrname] = obj1[attrname];
        console.log(attrname);
    }
    for (var attrname in obj2) {
        mObj[attrname] = obj2[attrname];
    }
    return mObj;
}