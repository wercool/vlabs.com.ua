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

        /**
        * @todo
        */
        this.interactables['Sphere2'].respondents.push(this.interactables['Suzanne1']);
        this.interactables['Sphere2'].respondents.push(this.interactables['Suzanne1_1']);
        this.interactables['Sphere2'].respondents.push(this.interactables['Suzanne2']);

        this.interactables['Suzanne1_1']['Sphere2_RESP_TOOLTIP'] = 'applicable';
    }
    // Sphere2EventHandler(event) {
    //     console.log(this);
    // }
    Sphere2TestAction(actionParams) {
        console.log('Sphere2TestAction');
        console.log('actionParams' , actionParams);
        console.log('this', this);
        actionParams.interactable.updateMenuWithMenuItem({
            label: 'Sphere2TestAction',
            action: this.Sphere2AltTestAction,
            context: this
        });
    }
    Sphere2AltTestAction(actionParams) {
        console.log('Sphere2AltTestAction');
        console.log('actionParams' , actionParams);
        console.log('this', this);
        actionParams.interactable.updateMenuWithMenuItem({
            label: 'Sphere2TestAction',
            action: this.Sphere2TestAction,
            context: this,
            args: { test: 'test...'}
        });
    }
}

export default FirstScene;