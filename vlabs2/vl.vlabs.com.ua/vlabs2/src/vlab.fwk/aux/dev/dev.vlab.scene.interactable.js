import * as THREE from 'three';
import * as THREEUtils from '../../utils/three.utils';
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

        this.menu = [
            {
                test: "test"
            }
        ];
        this.menuContainer = undefined;
    }
    showMenu() {
        // if (!this.manipulationControl) {
        //     this.manipulationControl = new TransformControls(this.vLabScene.currentCamera, this.vLab.WebGLRendererCanvas);
        //     this.manipulationControl.setSize(1.0);
        //     this.vLabScene.add(this.manipulationControl);
        //     this.manipulationControl.attach(this.vLabSceneInteractable.vLabSceneObject);
        // } else {
        //     this.manipulationControl.detach();
        //     this.manipulationControl = null;
        // }
        if (this.menu.length > 0  && !this.menuContainer) {
            /**
             * Depress current VLabControls
             */
            this.vLabScene.currentControls.depress();

            this.menuContainer = document.createElement('div');
            this.menuContainer.id = this.vLabSceneInteractable.vLabSceneObject.name + '_MENU';
            this.menuContainer.className = 'interactableMenu';

            // this.menu.forEach((menuItem) => {
            //     let menuItemDIV = document.createElement('div');
            //     menuItemDIV.className = 'interactableMenuItem';
            //     menuItemDIV.innerHTML = '<div class="interactableMenuIcon">' + (menuItem.icon ? menuItem.icon : '<i class=\"material-icons\">code</i>') + '</div>' + menuItem.label;
            //     if (menuItem.enabled !== undefined && !menuItem.enabled) {
            //         menuItemDIV.style.opacity = 0.1;
            //     } else {
            //         menuItemDIV.onmousedown = menuItemDIV.ontouchstart = this.callMenuAction.bind(this, menuItem);
            //     }
            //     this.menuContainer.appendChild(menuItemDIV);
            // });

            this.vLab.DOMManager.WebGLContainer.appendChild(this.menuContainer);
            let menuCoords = THREEUtils.screenProjected2DCoordsOfObject(this.vLab, this.vLabSceneInteractable.centerObject3D);
            let xPosDelta = this.vLab.DOMManager.WebGLContainer.clientWidth - (menuCoords.x + this.menuContainer.clientWidth);
            let yPosDelta = this.vLab.DOMManager.WebGLContainer.clientHeight - (menuCoords.y + this.menuContainer.clientHeight);
            let xPos = menuCoords.x + (xPosDelta < 0 ? xPosDelta : 0);
            let yPos = menuCoords.y + (yPosDelta < 0 ? yPosDelta : 0);
            this.menuContainer.style.left = (xPos > 0 ? xPos : 0).toFixed(0) + 'px';
            this.menuContainer.style.top = (yPos > 0 ? yPos : 0).toFixed(0) + 'px';
        }
    }
}
export default DEVVLabSceneInteractable;