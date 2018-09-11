import VLab from '../../vlab.fwk/core/vlab';

class BaseVLab extends VLab {
    constructor(initObj = {}) {
        super(initObj);
        super.initialize().then((success) => { this.initialize(); }, (error) => { console.error(error); });
    }

    initialize() {
        console.log(this);
    }
}

new BaseVLab({
    name: 'Base VLab2',
    natureURL: './resources/vlab.base.nature.json'
});