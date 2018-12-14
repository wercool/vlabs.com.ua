import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';
import * as VLabUTILS from '../../../../vlab.fwk/utils/vlab.utils';
/**
 * VLab Items
 */
import TLOneStethoscope from '../../../../vlab.items/medical/equipment/TLOneStethoscope/index';

class BasicsOfLungSoundsScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);

        this.prevActionInitialEventCoords = undefined;

        this.TLOneStethoscopeMaleBodyMaps = {
            applicable: {}
        };
    }
    /**
     * Called once scene is loaded
     */
    onLoaded() {
        var ambientLight = new THREE.AmbientLight(0x404040, 1.0); // soft white light
        this.add(ambientLight);

        this.vLab.WebGLRenderer.gammaFactor = 2.0;

        /**
         * Event subscriptions
         */
        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                VLabItem: {
                    initialized:                this.onInitializedVLabItem,
                    interactablesInitialized:   this.onVLabItemInteractablesInitialized,
                }
            }
        });


        /*<dev>*/
            // this.mouseHelper = new THREE.Mesh(new THREE.CylinderGeometry(.004, 0, .1, 16, 1), new THREE.MeshNormalMaterial());
            // this.mouseHelper = new THREE.Mesh(new THREE.BoxBufferGeometry(0.001, 0.001, 0.1), new THREE.MeshNormalMaterial());
            // this.mouseHelper.visible = true;
        /*</dev>*/

        Promise.all([
            VLabUTILS.loadImage('./resources/maleBodyMaps/applicable.jpg')
        ])
        .then((result) => {
            result.forEach((image) => {
                let canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
                let mapImageDataName = image.src.substring(image.src.lastIndexOf('/') + 1).split('.').slice(0, -1).join('.');
                this.TLOneStethoscopeMaleBodyMaps[mapImageDataName] = canvas.getContext('2d');
            });
        });

        /**
         * Valter VLabItem
         */
        this.vLab['TLOneStethoscope'] = new TLOneStethoscope({
            vLab: this.vLab,
            natureURL: '/vlab.items/medical/equipment/TLOneStethoscope/resources/TLOneStethoscope.nature.json',
            name: 'TLOneStethoscopeVLabItem'
        });
    }

    onInitializedVLabItem(event) {
    }

    onVLabItemInteractablesInitialized(event) {
        switch(event.vLabItem.constructor.name) {
            case 'TLOneStethoscope':
                this.actualizedTLOneStethoscope(event.vLabItem);
            break;
        }
    }

    actualizedTLOneStethoscope(TLOneStethoscope) {
        TLOneStethoscope.interactables[0].addRespondent({
            interactable: this.interactables['maleBody'],
            callerInteractable: this.vLab['TLOneStethoscope'].interactables[0],
            preselectionTooltip: 'TL One Stethoscope could be applied',
            action: {
                function: this.TLOneStethoscope_ACTION_maleBody,
                args: {},
                context: this
            }
        });
    }

    TLOneStethoscope_ACTION_maleBody(params) {
        // console.log(this.interactables['maleBody'].lastTouchRaycasterIntersection);

        let point = this.interactables['maleBody'].lastTouchRaycasterIntersection.point.clone();
        let normal = this.interactables['maleBody'].lastTouchRaycasterIntersection.face.normal.clone();
        let uv = this.interactables['maleBody'].lastTouchRaycasterIntersection.uv;
        let xy = new THREE.Vector2(Math.round(1023 * uv.x), Math.round(1023 - 1023 * uv.y));

        let allowedMapPixel = this.TLOneStethoscopeMaleBodyMaps['applicable'].getImageData(xy.x, xy.y, 1, 1).data;
        console.log(allowedMapPixel);

        if (this.vLab.SceneDispatcher.takenInteractable == this.vLab['TLOneStethoscope'].interactables[0]) {
            this.vLab['TLOneStethoscope'].interactables[0].put({
                parent: this,
                position: undefined,
                quaterninon: new THREE.Quaternion(),
                scale: new THREE.Vector3(1.0, 1.0, 1.0),
                materials: this.manager.getInteractableMaterials(this.vLab['TLOneStethoscope'].interactables[0])
            });

            /*<dev>*/
                // this.add(this.mouseHelper);

                // let normalHelper = new THREE.VertexNormalsHelper(this.interactables['maleBody'].vLabSceneObject, 0.01, 0x00ff00, 1);
                // this.add(normalHelper);
            /*</dev>*/
        }

        let lookAtPoint = normal.clone();
        lookAtPoint.transformDirection(this.interactables['maleBody'].vLabSceneObject.matrixWorld);
        lookAtPoint.multiplyScalar(10);
        lookAtPoint.add(point);

        this.vLab['TLOneStethoscope'].interactables[0].vLabSceneObject.position.copy(point);
        this.vLab['TLOneStethoscope'].interactables[0].vLabSceneObject.lookAt(lookAtPoint);
        this.vLab['TLOneStethoscope'].interactables[0].vLabSceneObject.rotateX(0.5 * Math.PI);

        /*<dev>*/
            // this.mouseHelper.position.copy(point);
            // this.mouseHelper.lookAt(lookAtPoint);
        /*</dev>*/
    }

}

export default BasicsOfLungSoundsScene;