import VLabScene from '../../../../vlab.fwk/core/vlab.scene';

class FirstScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);
    }
    onActivated() {
        // console.log(this.name + ' activated');
        // console.log(this);

        // this.interactables['Sphere2'].onDefaultEventHandler = this.Sphere2EventHandler.bind(this);

        // this.subscribe({
        //     events: {
        //         WebGLRendererCanvas: {
        //             wheel:  this.onDefaultEventListener,
        //         }
        //     }
        // });
    }
    // Sphere2EventHandler(event) {
    //     console.log(this);
    // }
}

export default FirstScene;