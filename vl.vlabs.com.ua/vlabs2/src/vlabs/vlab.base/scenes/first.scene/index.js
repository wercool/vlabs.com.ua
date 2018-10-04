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
    Sphere2TestAction(Sphere2SceneInteractable) {
        console.log('Sphere2TestAction');
        Sphere2SceneInteractable.updateMenuWithMenuItem({
            label: 'Take',
            action: this.Sphere2AltTestAction,
            context: this
        });
    }
    Sphere2AltTestAction(Sphere2SceneInteractable) {
        console.log('Sphere2AltTestAction');
        // Sphere2SceneInteractable.updateMenuWithMenuItem({
        //     label: 'Take',
        //     action: this.Sphere2TestAction,
        //     // context: this
        // });
    }
}

export default FirstScene;