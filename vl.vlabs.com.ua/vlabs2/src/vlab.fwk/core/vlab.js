export default class VLab {

    constructor(initObj) {
        this.initObj = initObj;
    }

    verifyInitObj() {
        let abnormals = [];
        if (this.initObj.name == undefined) abnormals.push('this.initObj.name is not set');

        return abnormals.length > 0 ? abnormals : true;
    }

    initialize() {
        return new Promise(function(resolve, reject) {
            let verifyInitObjResult = this.verifyInitObj();
            if (verifyInitObjResult === true) {
                resolve();
            } else {
                console.error('VLab incorrectly initialized!');
                for (let verifyInitObjResultAbnormal of verifyInitObjResult) {
                    console.error(verifyInitObjResultAbnormal);
                }
                reject();
            }
        });
    }

}