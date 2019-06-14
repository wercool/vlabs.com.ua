import * as THREE from 'three';
import * as THREEUtils from '../../utils/three.utils';
var TransformControls = require('three-transform-ctrls');
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
                label: 'Trace',
                enabled: true,
                selected: false,
                icon: '<i class=\"material-icons\">description</i>',
                action: () => {
                    console.log(this.vLabSceneInteractable);
                }
            },
            {
                label: 'Trace vLabSceneObject',
                enabled: true,
                selected: false,
                icon: '<i class=\"material-icons\">description</i>',
                action: () => {
                    console.log(this.vLabSceneInteractable.vLabSceneObject);
                }
            },
            {
                label: 'Trace Position',
                enabled: true,
                selected: false,
                icon: '<i class=\"material-icons\">description</i>',
                action: () => {
                    console.log(this.vLabSceneInteractable.vLabSceneObject.position);
                    console.log('new THREE.Vector3(' + this.vLabSceneInteractable.vLabSceneObject.position.x.toFixed(3) + ', ' + this.vLabSceneInteractable.vLabSceneObject.position.y.toFixed(3) + ', ' + this.vLabSceneInteractable.vLabSceneObject.position.z.toFixed(3) + ')');
                }
            },
            {
                label: 'Trace Rotation',
                enabled: true,
                selected: false,
                icon: '<i class=\"material-icons\">description</i>',
                action: () => {
                    console.log(this.vLabSceneInteractable.vLabSceneObject.rotation);
                    console.log('new THREE.Vector3(' + this.vLabSceneInteractable.vLabSceneObject.rotation.x.toFixed(3) + ', ' + this.vLabSceneInteractable.vLabSceneObject.rotation.y.toFixed(3) + ', ' + this.vLabSceneInteractable.vLabSceneObject.rotation.z.toFixed(3) + ')');
                }
            },
            {
                label: 'Trace Quaternion',
                enabled: true,
                selected: false,
                icon: '<i class=\"material-icons\">description</i>',
                action: () => {
                    console.log(this.vLabSceneInteractable.vLabSceneObject.quaternion);
                    console.log('new THREE.Quaternion(' + this.vLabSceneInteractable.vLabSceneObject.quaternion.x.toFixed(3) + ', ' + this.vLabSceneInteractable.vLabSceneObject.quaternion.y.toFixed(3) + ', ' + this.vLabSceneInteractable.vLabSceneObject.quaternion.z.toFixed(3) + ', ' + this.vLabSceneInteractable.vLabSceneObject.quaternion.w.toFixed(3) + ')');
                }
            },
            {
                label: 'Trace Material',
                enabled: true,
                selected: false,
                icon: '<i class=\"material-icons\">description</i>',
                action: () => {
                    console.log(this.vLabSceneInteractable.vLabSceneObject.material);
                }
            },
            {
                label: 'Use World Space',
                enabled: true,
                selected: false,
                icon: '<img src="/vlab.assets/img/dev/vlab.scene.interactable.dev/global.png" height="32px"/>',
                action: (menuItem) => {
                    if (this.manipulationControl !== undefined && this.manipulationControl !== null) {
                        this.manipulationControl.setSpace('world');
                        menuItem.selected = true;
                        this.setSelected('Use Local Space', false);
                    }
                },
                context: this
            },
            {
                label: 'Use Local Space',
                enabled: true,
                selected: false,
                icon: '<img src="/vlab.assets/img/dev/vlab.scene.interactable.dev/local.png" height="32px"/>',
                action: (menuItem) => {
                    if (this.manipulationControl !== undefined && this.manipulationControl !== null) {
                        this.manipulationControl.setSpace('local');
                        menuItem.selected = true;
                        this.setSelected('Use World Space', false);
                    }
                },
                context: this
            },
            {
                label: 'Toggle Transform Controls',
                enabled: true,
                selected: false,
                icon: '<img src="/vlab.assets/img/dev/vlab.scene.interactable.dev/axis-toggle.png" height="32px"/>',
                action: (menuItem) => {
                    if (this.manipulationControl !== undefined && this.manipulationControl !== null) {
                        this.manipulationControl.enabled = !this.manipulationControl.enabled;
                    }
                },
                context: this
            },
            {
                label: 'Move',
                enabled: true,
                selected: false,
                icon: '<img src="/vlab.assets/img/dev/vlab.scene.interactable.dev/axis.png" height="32px"/>',
                action: (menuItem) => {
                    if (!this.manipulationControl) {
                        this.manipulationControl = new TransformControls(this.vLabScene.currentCamera, this.vLab.WebGLRendererCanvas);
                        this.manipulationControl.setSize(1.0);
                        this.vLabScene.add(this.manipulationControl);
                        this.manipulationControl.attach(this.vLabSceneInteractable.vLabSceneObject);
                        menuItem.selected = true;
                    } else {
                        this.manipulationControl.detach();
                        this.manipulationControl = null;
                        menuItem.selected = false;
                    }
                },
                context: this
            },
            {
                label: 'Rotate',
                enabled: true,
                selected: false,
                icon: '<i class=\"material-icons\">settings_backup_restore</i>',
                action: (menuItem) => {
                    if (!this.manipulationControl) {
                        this.manipulationControl = new TransformControls(this.vLabScene.currentCamera, this.vLab.WebGLRendererCanvas);
                        this.manipulationControl.setMode('rotate');
                        this.manipulationControl.setSize(1.0);
                        this.vLabScene.add(this.manipulationControl);
                        this.manipulationControl.attach(this.vLabSceneInteractable.vLabSceneObject);
                        menuItem.selected = true;
                    } else {
                        this.manipulationControl.detach();
                        this.manipulationControl = null;
                        menuItem.selected = false;
                    }
                },
                context: this
            }
        ];
        this.menuContainer = undefined;
    }
    showMenu(event) {
        if (this.menu.length > 0  && !this.menuContainer) {
            /**
             * Depress current VLabControls
             */
            this.vLabScene.currentControls.suppress();

            this.menuContainer = document.createElement('div');
            this.menuContainer.id = this.vLabSceneInteractable.vLabSceneObject.name + '_MENU_DEV';
            this.menuContainer.className = 'interactableMenuDEV';
            this.menuContainer.addEventListener('contextmenu', function(event) {
                event.preventDefault();
                event.stopPropagation();
            });

            this.menu.forEach((menuItem) => {
                if ((!event.altKey && menuItem.primary) || event.altKey) {
                    let menuItemDIV = document.createElement('div');
                    menuItemDIV.className = 'interactableMenuItemDEV';
                    menuItemDIV.innerHTML = '<div class="interactableMenuIconDEV">' + (menuItem.icon ? menuItem.icon : '<i class=\"material-icons materialIconsDEV\">code</i>') + '</div>' + '<div class="interactableMenuItemLabelDEV">' + menuItem.label + '</div>';
                    if (menuItem.enabled !== undefined && !menuItem.enabled) {
                        menuItemDIV.style.opacity = 0.1;
                    } else {
                        menuItemDIV.onmousedown = menuItemDIV.ontouchstart = this.callMenuAction.bind(this, menuItem);
                    }
                    if (menuItem.selected !== undefined && menuItem.selected) {
                        menuItemDIV.classList.add('interactableMenuItemSelectedDEV');
                    }
                    menuItemDIV.addEventListener('contextmenu', function(event) {
                        event.preventDefault();
                        event.stopPropagation();
                    });
                    this.menuContainer.appendChild(menuItemDIV);
                }
            });

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

    hideMenu() {
        if (this.menuContainer) {
            this.vLab.DOMManager.WebGLContainer.removeChild(this.menuContainer);
            this.menuContainer = null;
        }
    }

    callMenuAction(menuItem) {
        if (menuItem.action !== undefined) {
            menuItem.action.call(menuItem.context, menuItem);
        }
        this.hideMenu();
    }
    setSelected(menuItemLabel, selected = false) {
        this.menu.forEach((menuItem) => {
            if (menuItem.label == menuItemLabel) {
                menuItem.selected = selected;
            }
        });
        this.showMenu();
    }
}
export default DEVVLabSceneInteractable;