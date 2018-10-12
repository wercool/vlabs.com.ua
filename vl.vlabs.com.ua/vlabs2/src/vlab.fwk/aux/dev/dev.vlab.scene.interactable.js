import * as THREE from 'three';
/**
 * DEVVLabSceneInteractable dev class.
 * @class
 */
class DEVVLabSceneInteractable {
    constructor(vLabSceneInteractable) {
        this.vLabSceneInteractable = vLabSceneInteractable;
        this.vLabScene = this.vLabSceneInteractable.vLabScene;
        this.vLab = this.vLabScene.vLab;

        var TransformControls = require('three-transformcontrols');
    }
    showMenu() {
        console.log('showMenu');
    }
}
export default DEVVLabSceneInteractable;