import * as THREE from 'three';
var TransformControls = require('three-transformcontrols');
/**
 * DEVVLabSceneInteractable dev class.
 * @class
 */
class DEVVLabSceneInteractable {
    constructor(vLabSceneInteractable) {
        this.vLabSceneInteractable = vLabSceneInteractable;
        this.vLabScene = this.vLabSceneInteractable.vLabScene;
        this.vLab = this.vLabScene.vLab;
    }
    showMenu() {
        if (!this.manipulationControl) {
            this.manipulationControl = new TransformControls(this.vLabScene.currentCamera, this.vLab.WebGLRendererCanvas);
            this.manipulationControl.setSize(1.0);
            this.vLabScene.add(this.manipulationControl);
            this.manipulationControl.attach(this.vLabSceneInteractable.vLabSceneObject);
        } else {
            this.manipulationControl.detach();
            this.manipulationControl = null;
        }
    }
}
export default DEVVLabSceneInteractable;