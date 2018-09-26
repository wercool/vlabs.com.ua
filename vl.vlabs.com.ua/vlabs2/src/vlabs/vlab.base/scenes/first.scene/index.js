import VLabScene from '../../../../vlab.fwk/core/vlab.scene';

class FirstScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);
    }
    // onActivated() {
    //     console.log(this.name + ' activated');
    //     console.log(this);

    //     // this.subscribe({
    //     //     events: {
    //     //         WebGLRendererCanvas: {
    //     //             wheel:  this.onDefaultEventListener,
    //     //         }
    //     //     }
    //     // });
    // }
}

export default FirstScene;