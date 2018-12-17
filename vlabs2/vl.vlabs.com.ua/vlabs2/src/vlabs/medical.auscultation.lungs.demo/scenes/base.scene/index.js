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
            applicable: {},
            lungs: {},
            heart: {},
            stomach: {}
        };

        this.auscultationSounds = {
            lungs: {
                audio: new Audio(),
                normal: './resources/auscultationSounds/lungs/vesicular.mp3',
            },
            heart: {
                audio: new Audio(),
                normal: './resources/auscultationSounds/heart/normal.mp3',
            },
            stomach: {
                audio: new Audio(),
                normal: './resources/auscultationSounds/stomach/normal1.mp3',
            }
        };

        this.auscultationSounds.lungs.audio.src = this.auscultationSounds.lungs.normal;
        this.auscultationSounds.lungs.audio.loop = true;
        this.auscultationSounds.heart.audio.src = this.auscultationSounds.heart.normal;
        this.auscultationSounds.heart.audio.loop = true;
        this.auscultationSounds.stomach.audio.src = this.auscultationSounds.stomach.normal;
        this.auscultationSounds.stomach.audio.loop = true;
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
                VLabScene: {
                    interactableTaken:         this.onInteractableTaken
                },
                VLabItem: {
                    initialized:                this.onInitializedVLabItem,
                    interactablesInitialized:   this.onVLabItemInteractablesInitialized,
                },
                VLabInventory: {
                    putToInventory:             this.onInteractablePutToInventory
                }
            }
        });


        /*<dev>*/
            // this.mouseHelper = new THREE.Mesh(new THREE.CylinderGeometry(.004, 0, .1, 16, 1), new THREE.MeshNormalMaterial());
            // this.mouseHelper = new THREE.Mesh(new THREE.BoxBufferGeometry(0.001, 0.001, 0.1), new THREE.MeshNormalMaterial());
            // this.mouseHelper.visible = true;
        /*</dev>*/

        var textureLoader = new THREE.TextureLoader();

        Promise.all([
            VLabUTILS.loadImage('./resources/maleBodyMaps/applicable.jpg'),
            VLabUTILS.loadImage('./resources/maleBodyMaps/heart.jpg'),
            VLabUTILS.loadImage('./resources/maleBodyMaps/lungs.jpg'),
            VLabUTILS.loadImage('./resources/maleBodyMaps/stomach.jpg')
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

        Promise.all([
            textureLoader.load('./scenes/base.scene/resources/envMaps/envMap-reflection-maleBody-applied.jpeg')
        ])
        .then((result) => {
            this['maleBodyAppliedEnvMap'] = result[0];
            this['maleBodyAppliedEnvMap'].mapping = THREE.EquirectangularReflectionMapping;
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
        let xy = new THREE.Vector2(Math.round(1023 * uv.x), Math.round(1023 * uv.y));
        // console.log(uv, xy);
        // console.log(this.TLOneStethoscopeMaleBodyMaps['applicable'].getImageData(xy.x, xy.y, 1, 1).data);
        let allowedMapPixel = { 
            r: this.TLOneStethoscopeMaleBodyMaps['applicable'].getImageData(xy.x, xy.y, 1, 1).data[0],
            g: this.TLOneStethoscopeMaleBodyMaps['applicable'].getImageData(xy.x, xy.y, 1, 1).data[1],
            b: this.TLOneStethoscopeMaleBodyMaps['applicable'].getImageData(xy.x, xy.y, 1, 1).data[2]
        };
        let allowedMapPixelWeight = (allowedMapPixel.r + allowedMapPixel.g + allowedMapPixel.b) / 3;

        if (allowedMapPixelWeight > 127) {


            let lungsSoundVolumeMapPixel = { 
                r: this.TLOneStethoscopeMaleBodyMaps['lungs'].getImageData(xy.x, xy.y, 1, 1).data[0],
                g: this.TLOneStethoscopeMaleBodyMaps['lungs'].getImageData(xy.x, xy.y, 1, 1).data[1],
                b: this.TLOneStethoscopeMaleBodyMaps['lungs'].getImageData(xy.x, xy.y, 1, 1).data[2],
                a: this.TLOneStethoscopeMaleBodyMaps['lungs'].getImageData(xy.x, xy.y, 1, 1).data[3],
            };
            this.auscultationSounds.lungs.audio.volume = (lungsSoundVolumeMapPixel.r + lungsSoundVolumeMapPixel.g + lungsSoundVolumeMapPixel.b) / (3 * 255);

            let heartSoundVolumeMapPixel = { 
                r: this.TLOneStethoscopeMaleBodyMaps['heart'].getImageData(xy.x, xy.y, 1, 1).data[0],
                g: this.TLOneStethoscopeMaleBodyMaps['heart'].getImageData(xy.x, xy.y, 1, 1).data[1],
                b: this.TLOneStethoscopeMaleBodyMaps['heart'].getImageData(xy.x, xy.y, 1, 1).data[2],
                a: this.TLOneStethoscopeMaleBodyMaps['heart'].getImageData(xy.x, xy.y, 1, 1).data[3],
            };
            this.auscultationSounds.heart.audio.volume = (heartSoundVolumeMapPixel.r + heartSoundVolumeMapPixel.g + heartSoundVolumeMapPixel.b) / (3 * 255);

            let stomachSoundVolumeMapPixel = { 
                r: this.TLOneStethoscopeMaleBodyMaps['stomach'].getImageData(xy.x, xy.y, 1, 1).data[0],
                g: this.TLOneStethoscopeMaleBodyMaps['stomach'].getImageData(xy.x, xy.y, 1, 1).data[1],
                b: this.TLOneStethoscopeMaleBodyMaps['stomach'].getImageData(xy.x, xy.y, 1, 1).data[2],
                a: this.TLOneStethoscopeMaleBodyMaps['stomach'].getImageData(xy.x, xy.y, 1, 1).data[3],
            };
            this.auscultationSounds.stomach.audio.volume = (stomachSoundVolumeMapPixel.r + stomachSoundVolumeMapPixel.g + stomachSoundVolumeMapPixel.b) / (3 * 255);

            if (this.vLab.SceneDispatcher.takenInteractable == this.vLab['TLOneStethoscope'].interactables[0]) {

                this.vLab['TLOneStethoscope'].interactables[0].put({
                    parent: this,
                    position: undefined,
                    quaterninon: new THREE.Quaternion(),
                    scale: new THREE.Vector3(1.0, 1.0, 1.0),
                    materials: this.vLab['TLOneStethoscope'].vLabItemModel.userData['beforeTakenState'].materials
                });

                this.vLab['TLOneStethoscope'].setEnvMap(this['maleBodyAppliedEnvMap']);

                this.auscultationSounds.lungs.audio.play();
                this.auscultationSounds.heart.audio.play();
                this.auscultationSounds.stomach.audio.play();

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
            this.vLab['TLOneStethoscope'].interactables[0].vLabSceneObject.rotateY(Math.PI);

            /**
             * Sounds
             */

            /*<dev>*/
                // this.mouseHelper.position.copy(point);
                // this.mouseHelper.lookAt(lookAtPoint);
            /*</dev>*/
        }
    }

    onInteractableTaken(event) {
        this.muteSound();
        this.vLab['TLOneStethoscope'].onTaken();
    }

    onInteractablePutToInventory(event) {
        this.muteSound();
        this.vLab['TLOneStethoscope'].onTakenOut();
    }

    muteSound() {
        this.auscultationSounds.lungs.audio.pause();
        this.auscultationSounds.lungs.audio.currentTime = 0;
        this.auscultationSounds.heart.audio.pause();
        this.auscultationSounds.heart.audio.currentTime = 0;
        this.auscultationSounds.stomach.audio.pause();
        this.auscultationSounds.stomach.audio.currentTime = 0;
    }

}

export default BasicsOfLungSoundsScene;