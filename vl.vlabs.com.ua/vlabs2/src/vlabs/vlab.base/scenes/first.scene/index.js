import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';

class FirstScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);

    }
    onLoaded() {
        this.interactables['Sphere2'].addRespondent({
            interactable: this.interactables['Suzanne1_1'],
            callerInteractable: this.interactables['Sphere2'],
            preselectionTooltip: 'Reacts on Sphere2',
            action: {
                function: this.Sphere2_ACTION_Suzanne1_1,
                args: {},
                context: this
            }
        });
        this.interactables['Sphere2'].addRespondent({
            interactable: this.interactables['Suzanne1'],
            callerInteractable: this.interactables['Sphere2'],
            preselectionTooltip: 'Reacts on Sphere2',
            action: {
                function: this.Sphere2_ACTION_Suzanne1,
                args: {},
                context: this
            }
        });
        this.interactables['Sphere2'].addRespondent({
            interactable: this.interactables['Suzanne'],
            callerInteractable: this.interactables['Sphere2'],
            preselectionTooltip: 'Referenced with Sphere2'
        });
        this.interactables['Suzanne1'].addRespondent({
            interactable: this.interactables['Suzanne'],
            callerInteractable: this.interactables['Suzanne1'],
            preselectionTooltip: 'Referenced with Suzanne1'
        });
        this.interactables['Suzanne1'].addRespondent({
            interactable: this.interactables['Sphere2'],
            callerInteractable: this.interactables['Suzanne1'],
            preselectionTooltip: 'Referenced with Sphere2'
        });
        // this.interactables['Suzanne2'].addRespondent({
        //     interactable: this.interactables['BigSphere'],
        //     callerInteractable: this.interactables['Suzanne2'],
        //     preselectionTooltip: 'Referenced with Suzanne2',
        //     preselectionAction: {
        //         function: this.Suzanne2_PRESELECTION_ACTION_BigSphere.bind(this)
        //     },
        //     dePreselectionAction: {
        //         function: function(){ this.interactables['BigSphere'].vLabSceneObject.material.wireframe = false; },
        //         context: this
        //     },
        // });
        this.interactables['Suzanne2'].addRespondent({
            interactable: this.interactables['BigSphere'],
            callerInteractable: this.interactables['Suzanne2'],
            preselectionTooltip: 'Referenced with Suzanne2',
            preselectionAction: {
                function: function(){ 
                    this.getObjectByName('Suzanne001').visible = true;
                    this.interactables['BigSphere'].vLabSceneObject.userData['temp1'] = this.interactables['BigSphere'].vLabSceneObject.material.side;
                    this.interactables['BigSphere'].vLabSceneObject.material.side = THREE.BackSide; 
                },
                context: this
            },
            dePreselectionAction: {
                function: function(){
                    this.getObjectByName('Suzanne001').visible = false;
                    this.interactables['BigSphere'].vLabSceneObject.material.side = this.interactables['BigSphere'].vLabSceneObject.userData['temp1'];
                    delete this.interactables['BigSphere'].vLabSceneObject.userData['temp1'];
                },
                context: this
            },
        });
        // this.interactables['Suzanne2'].addRespondent({
        //     interactable: this.interactables['Suzanne'],
        //     callerInteractable: this.interactables['Suzanne2'],
        //     preselectionTooltip: 'Referenced with Suzanne',
        //     preselectionAction: {
        //         function: function(){ this.interactables['Suzanne'].vLabSceneObject.material.wireframe = true; },
        //         context: this
        //     },
        //     dePreselectionAction: {
        //         function: function(){ this.interactables['Suzanne'].vLabSceneObject.material.wireframe = false; },
        //         context: this
        //     },
        // });
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
    Suzanne2_PRESELECTION_ACTION_BigSphere() {
        this.interactables['BigSphere'].vLabSceneObject.material.wireframe = true;
    }
    Sphere2_ACTION_Suzanne1_1() {
        console.log('Sphere2_to_Suzanne1_1_ACTION', this);
    }
    Sphere2_ACTION_Suzanne1() {
        console.log('Sphere2_to_Suzanne1_ACTION', this);
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