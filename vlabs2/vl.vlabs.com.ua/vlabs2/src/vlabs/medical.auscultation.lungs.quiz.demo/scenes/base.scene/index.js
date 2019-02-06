import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';
import * as VLabUTILS from '../../../../vlab.fwk/utils/vlab.utils';
/**
 * This VLab Auxilaries
 */
import VLabZoomHelper  from '../../../../vlab.fwk/aux/scene/vlab.zoom.helper';
// import VLabButtonsSelector from '../../../../vlab.fwk/aux/buttons.selector/index';
/**
 * VLab Items
 */
import TLOneStethoscope from '../../../../vlab.items/medical/equipment/TLOneStethoscope/index';
import HeadphonesGeneric from '../../../../vlab.items/headphones/index';
import AcusticStethoscope from '../../../../vlab.items/medical/equipment/AcusticStethoscope/index';
import MercuryThermometer from '../../../../vlab.items/medical/equipment/MercuryThermometer/index';

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

        this.MercuryThermometerMaleBodyMaps = {
            applicable: {},
        };

        this.lungsSounds = [
            {
                path: 'vesicular.mp3',
                shortDesc: 'Normal, vesicular breath.',
                desc: 'Vesicular breath sounds are soft and low pitched with a rustling quality during inspiration and are even softer during expiration. These are the most commonly auscultated breath sounds, normally heard over most of the lung surface.'
            },
            {
                path: 'crackles-fine.mp3',
                shortDesc: 'Crackles (rales) can be heard in both phases of respiration.',
                desc: 'Crackles, previously termed rales, can be heard in both phases of respiration. Early inspiratory and expiratory crackles are the hallmark of chronic bronchitis. Late inspiratory crackles may mean pneumonia, CHF, or atelectasis.'
            },
            {
                path: 'crackles-coarse.mp3',
                shortDesc: 'Coarse crackles are discontinuous, brief, popping lung sounds.',
                desc: 'Coarse crackles are discontinuous, brief, popping lung sounds. Compared to fine crackles they are louder, lower in pitch and last longer. Late inspiratory crackles may mean pneumonia, CHF, or atelectasis.'
            },
            {
                path: 'wheeze.mp3',
                shortDesc: 'Wheezes are adventitious lung sounds that are continuous with a musical quality. Wheezes can be high or low pitched.',
                desc: 'Expiratory wheezes are heard over most of the chest wall. This may indicate widespread airflow obstruction, for example in patients with asthma.'
            },
            {
                path: 'rhonchi.mp3',
                shortDesc: 'Rhonchi occur in the bronchi.',
                desc: 'Low pitched wheezes (rhonchi) are continuous, both inspiratory and expiratory, low pitched adventitious lung sounds that are similar to wheezes. They often have a snoring, gurgling or rattle-like quality.'
            },
            {
                path: 'bronchial.mp3',
                shortDesc: 'Bronchial breath sounds',
                desc: 'Bronchial breath sounds are considered abnormal if heard over the peripheral lung fields. Bronchial breath sounds other than close to the trachea may indicate pneumonia, atelectasis, pleural effusions.'
            },
            {
                path: 'pleural-rubs.mp3',
                shortDesc: 'Pleural rubs are discontinuous or continuous, creaking or grating sounds.',
                desc: 'They are produced because two inflamed surfaces are sliding by one another, such as in pleurisy.'
            },
            {
                path: 'bronchovesicular.mp3',
                shortDesc: 'Bronchovesicular breath sounds',
                desc: 'These are abnormal in the lung periphery and may indicate an early infiltrate or partial atelectasis'
            }
        ];
        this.lungsSoundsID = Math.floor(Math.random() * 8);

        console.log(this.lungsSoundsID, this.lungsSounds[this.lungsSoundsID].shortDesc);

        this.heartSounds = [
            {
                path: 'normal.mp3',
                desc: ''
            }
        ];
        this.heartSoundsID = 0;

        this.stomachSounds = [
            {
                path: 'normal1.mp3',
                desc: ''
            }
        ];
        this.stomachSoundsID = 0;

        this.auscultationSounds = {
            lungs: {
                audio: new Audio(),
                volume: 0.0,
                sndURL: './resources/auscultationSounds/lungs/' + this.lungsSounds[this.lungsSoundsID]['path'],
            },
            heart: {
                audio: new Audio(),
                volume: 0.0,
                sndURL: './resources/auscultationSounds/heart/' + this.heartSounds[this.heartSoundsID]['path'],
            },
            stomach: {
                audio: new Audio(),
                volume: 0.0,
                sndURL: './resources/auscultationSounds/stomach/' + this.stomachSounds[this.stomachSoundsID]['path'],
            }
        };

        this.auscultationSounds.lungs.audio.src = this.auscultationSounds.lungs.sndURL;
        this.auscultationSounds.lungs.audio.loop = true;
        this.auscultationSounds.heart.audio.src = this.auscultationSounds.heart.sndURL;
        this.auscultationSounds.heart.audio.loop = true;
        this.auscultationSounds.stomach.audio.src = this.auscultationSounds.stomach.sndURL;
        this.auscultationSounds.stomach.audio.loop = true;

        // this.vLabButtonsSelector = new VLabButtonsSelector({
        //     vLab: this.vLab,
        //     buttons: [
        //         {
        //             label: 'Vesicular',
        //             desc: 'Normal breath',
        //             onclick: this.vLabButtonsSelectorOnClick.bind(this)
        //         },
        //         {
        //             label: 'Crackles fine',
        //             desc: 'Chronic bronchitis',
        //             onclick: this.vLabButtonsSelectorOnClick.bind(this)
        //         },
        //         {
        //             label: 'Crackles coarse',
        //             desc: 'Pneumonia, CHF, atelectasis',
        //             onclick: this.vLabButtonsSelectorOnClick.bind(this)
        //         },
        //         {
        //             label: 'Wheezes',
        //             desc: 'Asthma',
        //             onclick: this.vLabButtonsSelectorOnClick.bind(this)
        //         },
        //         {
        //             label: 'Rhonchi',
        //             desc: 'Continuous low pitched wheezes, both inspiratory and expiratory',
        //             onclick: this.vLabButtonsSelectorOnClick.bind(this)
        //         },
        //         {
        //             label: 'Bronchial',
        //             desc: 'Pneumonia, atelectasis, pleural effusions',
        //             onclick: this.vLabButtonsSelectorOnClick.bind(this)
        //         },
        //         {
        //             label: 'Pleural rubs',
        //             desc: 'Pleurisy',
        //             onclick: this.vLabButtonsSelectorOnClick.bind(this)
        //         },
        //         {
        //             label: 'Bronchovesicular',
        //             desc: 'Early infiltrate, partial atelectasis',
        //             onclick: this.vLabButtonsSelectorOnClick.bind(this)
        //         }
        //     ]
        // });
    }
    /**
     * Called once scene is loaded
     */
    onLoaded() {
        var ambientLight = new THREE.AmbientLight(0x404040, 0.5); // soft white light
        this.add(ambientLight);

        this.vLab.WebGLRenderer.gammaFactor = 2.0;

        this.currentControls.minDistance = 0.4;
        this.currentControls.maxDistance = 0.85;
        this.currentControls.minPolarAngle = THREE.Math.degToRad(50.0);
        this.currentControls.maxPolarAngle = THREE.Math.degToRad(120.0);

        /**
         * Event subscriptions
         */
        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                VLabScene: {
                    interactableTaken:         this.onInteractableTaken,
                    interactablePut:           this.onInteractablePut,
                    zoomHelperActivated:       this.onZoomHelperActivated,
                    zoomHelperDeActivated:     this.onZoomHelperDeActivated,
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
            VLabUTILS.loadImage('./resources/maleBodyMaps/stomach.jpg'),
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
            VLabUTILS.loadImage('./resources/maleBodyMaps/mercutyThermometer-applicable.jpg'),
        ])
        .then((results) => {
                let applicableMapImage = results[0];
                let canvas = document.createElement('canvas');
                canvas.width = applicableMapImage.width;
                canvas.height = applicableMapImage.height;
                canvas.getContext('2d').drawImage(applicableMapImage, 0, 0, applicableMapImage.width, applicableMapImage.height);
                this.MercuryThermometerMaleBodyMaps['applicable'] = canvas.getContext('2d');
        });

        Promise.all([
            textureLoader.load('./scenes/base.scene/resources/envMaps/envMap-reflection-maleBody-applied.jpeg')
        ])
        .then((result) => {
            this['maleBodyAppliedEnvMap'] = result[0];
            this['maleBodyAppliedEnvMap'].mapping = THREE.EquirectangularReflectionMapping;
        });

        /**
         * TLOneStethoscope VLabItem
         */
        this.vLab['TLOneStethoscope'] = new TLOneStethoscope({
            vLab: this.vLab,
            natureURL: '/vlab.items/medical/equipment/TLOneStethoscope/resources/TLOneStethoscope.nature.json',
            name: 'TLOneStethoscopeVLabItem'
        });

        /**
         * AcusticStethoscope VLabItem
         */
        this.vLab['AcusticStethoscope'] = new AcusticStethoscope({
            vLab: this.vLab,
            natureURL: '/vlab.items/medical/equipment/AcusticStethoscope/resources/acusticStethoscope.nature.json',
            name: 'AcusticStethoscopeVLabItem'
        });

        /**
         * MercuryThermometer VLabItem
         */
        this.vLab['MercuryThermometer'] = new MercuryThermometer({
            vLab: this.vLab,
            natureURL: '/vlab.items/medical/equipment/MercuryThermometer/resources/mercuryThermometer.nature.json',
            name: 'MercuryThermometerVLabItem'
        });

        // /**
        //  * Add Quiz
        //  */
        this.vLab.addQuiz(this);

        /**
         * VLab buttons selector
         */
        // this.vLabButtonsSelector.initialize().then(() => {
        //     this.vLabButtonsSelector.panel.style.display = 'block';
        //     this.vLabButtonsSelector.setSelected({ buttonInnerText: this.vLabButtonsSelector.buttons[this.lungsSoundsID].innerText });
        // });
    }

    onInitializedVLabItem(event) {
    }

    onVLabItemInteractablesInitialized(event) {
        switch(event.vLabItem.constructor.name) {
            case 'TLOneStethoscope':
                this.actualizedTLOneStethoscope(event.vLabItem);
            break;
            case 'HeadphonesGeneric':
                this.actualizeHeadphonesGeneric(event.vLabItem);
            break;
            case 'AcusticStethoscope':
                this.actualizeAcusticStethoscope(event.vLabItem);
            break;
            case 'MercuryThermometer':
                this.actualizeMercuryThermometer(event.vLabItem);
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
        /**
         * HeadphonesGeneric VLabItem
         */
        this.vLab['HeadphonesGeneric'] = new HeadphonesGeneric({
            vLab: this.vLab,
            natureURL: '/vlab.items/headphones/resources/headphones.nature.json',
            name: 'HeadphonesGenericVLabItem'
        });
    }

    actualizeHeadphonesGeneric(HeadphonesGeneric) {
        HeadphonesGeneric.interactables[0].addRespondent({
            interactable: this.vLab['TLOneStethoscope'].interactables[0],
            callerInteractable: this.vLab['HeadphonesGeneric'].interactables[0],
            preselectionTooltip: 'Generic Headphones could be applied',
            action: {
                function: this.HeadphonesGeneric_ACTION_TLOneStethoscope,
                args: {},
                context: this
            }
        });
    }

    actualizeAcusticStethoscope(AcusticStethoscope) {
        AcusticStethoscope.interactables[0].addRespondent({
            interactable: this.interactables['maleBody'],
            callerInteractable: this.vLab['AcusticStethoscope'].interactables[0],
            preselectionTooltip: 'Acustic Stethoscope could be applied',
            action: {
                function: this.AcusticStethoscope_ACTION_maleBody,
                args: {},
                context: this
            }
        });
        AcusticStethoscope.interactables[1].addRespondent({
            interactable: this.interactables['maleBody'],
            callerInteractable: this.vLab['AcusticStethoscope'].interactables[1],
            preselectionTooltip: 'Acustic Stethoscope could be applied',
            action: {
                function: this.AcusticStethoscope_ACTION_maleBody,
                args: {},
                context: this
            }
        });
    }

    actualizeMercuryThermometer(MercuryThermometer) {
        MercuryThermometer.interactables[0].addRespondent({
            interactable: this.interactables['maleBody'],
            callerInteractable: this.vLab['MercuryThermometer'].interactables[0],
            preselectionTooltip: 'Mercury Thermometer could be applied',
            action: {
                function: this.MercuryThermometer_ACTION_maleBody,
                args: {},
                context: this
            }
        });
        this.MercuryThermometerVLabZoomHelper = new VLabZoomHelper({
            vLabScene: this,
            position: new THREE.Vector3(0.0, 0.0, 0.0),
            target: this.vLab['MercuryThermometer'].interactables[0].vLabSceneObject.position,
            tooltip: 'Zoom to<br/>Mercury Thermometer',
            scaleFactor: 0.1,
            visibility: false,
            name: 'MercuryThermometerVLabZoomHelper'
        });
        this.MercuryThermometerVLabZoomHelper.conditionalDeactivationVisibility = true;
    }

    HeadphonesGeneric_ACTION_TLOneStethoscope(params) {
        let self = this;
        this.vLab['TLOneStethoscope'].headphonesApplied = true;
        this.vLab['TLOneStethoscope'].cableJack.visible = true;
        if (this.vLab.SceneDispatcher.currentVLabScene.constructor.name == 'VLabInventory') {
            this.vLab['TLOneStethoscope'].interactables[0].vLabSceneObject.getObjectByName('TLOneStethoscope_headphones').visible = true;
            this.vLab['TLOneStethoscope'].interactables[0].initObj.interactable.inventory.thumbnail = "/vlab.items/medical/equipment/TLOneStethoscope/resources/assets/headphones_attached_thumbnail.png";
            this.vLab['TLOneStethoscope'].interactables[0].initObj.interactable.inventory.viewBias = "new THREE.Vector3(0.15, 0.25, 0.15)";

            if (this.vLab.Inventory) {
                this.vLab.Inventory.updateThumbnailSrc(this.vLab['TLOneStethoscope'].interactables[0], this.vLab['TLOneStethoscope'].interactables[0].initObj.interactable.inventory.thumbnail);
            }

            setTimeout(() => {
                self.vLab.Inventory.resetView();
            }, 100)
        } else {
            this.vLab['HeadphonesGeneric'].onApplied();
            this.vLab['TLOneStethoscope'].updateCable();
        }
        this.vLab.SceneDispatcher.putTakenInteractable({
            parent: this,
            visibility: false
        });
        this.vLab.Inventory.updateTakeButtonState();
        this.vLab['TLOneStethoscope'].interactables[0].deSelect();
        if (this.vLab.SceneDispatcher.currentVLabScene.constructor.name != 'VLabInventory') {
            this.playSounds();

            this.vLab.SceneDispatcher.currentVLabScene.currentControls.setAzimutalRestrictionsFromCurrentTheta(0.5, -0.5);
        }
    }

    TLOneStethoscope_ACTION_maleBody(params) {
        // console.log(this.interactables['maleBody'].lastTouchRaycasterIntersection);
        if (this.interactables['maleBody'].lastTouchRaycasterIntersection == undefined) {
            return;
        }

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

        if (allowedMapPixelWeight > 127 && !this.vLab['AcusticStethoscope'].applied) {

            let lungsSoundVolumeMapPixel = { 
                r: this.TLOneStethoscopeMaleBodyMaps['lungs'].getImageData(xy.x, xy.y, 1, 1).data[0],
                g: this.TLOneStethoscopeMaleBodyMaps['lungs'].getImageData(xy.x, xy.y, 1, 1).data[1],
                b: this.TLOneStethoscopeMaleBodyMaps['lungs'].getImageData(xy.x, xy.y, 1, 1).data[2],
                a: this.TLOneStethoscopeMaleBodyMaps['lungs'].getImageData(xy.x, xy.y, 1, 1).data[3],
            };
            this.auscultationSounds.lungs.volume = (lungsSoundVolumeMapPixel.r + lungsSoundVolumeMapPixel.g + lungsSoundVolumeMapPixel.b) / (3 * 255);

            let heartSoundVolumeMapPixel = { 
                r: this.TLOneStethoscopeMaleBodyMaps['heart'].getImageData(xy.x, xy.y, 1, 1).data[0],
                g: this.TLOneStethoscopeMaleBodyMaps['heart'].getImageData(xy.x, xy.y, 1, 1).data[1],
                b: this.TLOneStethoscopeMaleBodyMaps['heart'].getImageData(xy.x, xy.y, 1, 1).data[2],
                a: this.TLOneStethoscopeMaleBodyMaps['heart'].getImageData(xy.x, xy.y, 1, 1).data[3],
            };
            this.auscultationSounds.heart.volume = (heartSoundVolumeMapPixel.r + heartSoundVolumeMapPixel.g + heartSoundVolumeMapPixel.b) / (3 * 255);

            let stomachSoundVolumeMapPixel = { 
                r: this.TLOneStethoscopeMaleBodyMaps['stomach'].getImageData(xy.x, xy.y, 1, 1).data[0],
                g: this.TLOneStethoscopeMaleBodyMaps['stomach'].getImageData(xy.x, xy.y, 1, 1).data[1],
                b: this.TLOneStethoscopeMaleBodyMaps['stomach'].getImageData(xy.x, xy.y, 1, 1).data[2],
                a: this.TLOneStethoscopeMaleBodyMaps['stomach'].getImageData(xy.x, xy.y, 1, 1).data[3],
            };
            this.auscultationSounds.stomach.volume = (stomachSoundVolumeMapPixel.r + stomachSoundVolumeMapPixel.g + stomachSoundVolumeMapPixel.b) / (3 * 255);

            if (this.vLab.SceneDispatcher.takenInteractable == this.vLab['TLOneStethoscope'].interactables[0]) {

                this.vLab['TLOneStethoscope'].interactables[0].put({
                    parent: this,
                    position: undefined,
                    quaternion: new THREE.Quaternion(),
                    scale: new THREE.Vector3(1.0, 1.0, 1.0),
                    materials: this.vLab['TLOneStethoscope'].vLabItemModel.userData['beforeTakenState'].materials
                });

                this.vLab['TLOneStethoscope'].setEnvMap(this['maleBodyAppliedEnvMap']);

                /*<dev>*/
                    // this.add(this.mouseHelper);
    
                    // let normalHelper = new THREE.VertexNormalsHelper(this.interactables['maleBody'].vLabSceneObject, 0.01, 0x00ff00, 1);
                    // this.add(normalHelper);
                /*</dev>*/
            }

            this.playSounds();

            let lookAtPoint = normal.clone();
            lookAtPoint.transformDirection(this.interactables['maleBody'].vLabSceneObject.matrixWorld);
            lookAtPoint.multiplyScalar(10);
            lookAtPoint.add(point);

            this.vLab['TLOneStethoscope'].interactables[0].vLabSceneObject.position.copy(point);
            this.vLab['TLOneStethoscope'].interactables[0].vLabSceneObject.lookAt(lookAtPoint);
            this.vLab['TLOneStethoscope'].interactables[0].vLabSceneObject.rotateX(0.5 * Math.PI);
            this.vLab['TLOneStethoscope'].interactables[0].vLabSceneObject.rotateY(0.5 * Math.PI);

            this.soudsVolumeAdjust();

            if (!this.vLab['TLOneStethoscope'].cableJack.visible) {
                this.muteSound();
            } else {
                this.vLab['TLOneStethoscope'].updateCable();
            }

            if (this.vLab['HeadphonesGeneric'].isVisible()) {
                this.vLab.SceneDispatcher.currentVLabScene.currentControls.setAzimutalRestrictionsFromCurrentTheta(0.5, -0.5);
            } else {
                this.vLab.SceneDispatcher.currentVLabScene.currentControls.resetAzimutalRestrictions();
            }

            this.vLab['TLOneStethoscope'].cableMesh.material = this.vLab['TLOneStethoscope'].cableMaterial;
            this.vLab['TLOneStethoscope'].cableMesh.material.needsUpdate = true;

            /*<dev>*/
                // this.mouseHelper.position.copy(point);
                // this.mouseHelper.lookAt(lookAtPoint);
            /*</dev>*/
        }
        this.vLab['AcusticStethoscope'].interactables[0].canBeTakenFromInventory = false;
    }

    AcusticStethoscope_ACTION_maleBody(params) {
        if (this.interactables['maleBody'].lastTouchRaycasterIntersection == undefined
        && (this.vLab['AcusticStethoscope'].interactables[0].selected || this.vLab['AcusticStethoscope'].interactables[1].selected)) {
            return;
        }

        let self = this;
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
            this.auscultationSounds.lungs.volume = (lungsSoundVolumeMapPixel.r + lungsSoundVolumeMapPixel.g + lungsSoundVolumeMapPixel.b) / (3 * 255);

            let heartSoundVolumeMapPixel = { 
                r: this.TLOneStethoscopeMaleBodyMaps['heart'].getImageData(xy.x, xy.y, 1, 1).data[0],
                g: this.TLOneStethoscopeMaleBodyMaps['heart'].getImageData(xy.x, xy.y, 1, 1).data[1],
                b: this.TLOneStethoscopeMaleBodyMaps['heart'].getImageData(xy.x, xy.y, 1, 1).data[2],
                a: this.TLOneStethoscopeMaleBodyMaps['heart'].getImageData(xy.x, xy.y, 1, 1).data[3],
            };
            this.auscultationSounds.heart.volume = (heartSoundVolumeMapPixel.r + heartSoundVolumeMapPixel.g + heartSoundVolumeMapPixel.b) / (3 * 255);

            let stomachSoundVolumeMapPixel = { 
                r: this.TLOneStethoscopeMaleBodyMaps['stomach'].getImageData(xy.x, xy.y, 1, 1).data[0],
                g: this.TLOneStethoscopeMaleBodyMaps['stomach'].getImageData(xy.x, xy.y, 1, 1).data[1],
                b: this.TLOneStethoscopeMaleBodyMaps['stomach'].getImageData(xy.x, xy.y, 1, 1).data[2],
                a: this.TLOneStethoscopeMaleBodyMaps['stomach'].getImageData(xy.x, xy.y, 1, 1).data[3],
            };
            this.auscultationSounds.stomach.volume = (stomachSoundVolumeMapPixel.r + stomachSoundVolumeMapPixel.g + stomachSoundVolumeMapPixel.b) / (3 * 255);

            this.auscultationSounds.lungs.volume *= 0.2;
            this.auscultationSounds.heart.volume *= 0.2;
            this.auscultationSounds.stomach.volume *= 0.2;

            this.auscultationSounds.lungs.audio.volume = this.auscultationSounds.lungs.volume;
            this.auscultationSounds.heart.audio.volume = this.auscultationSounds.heart.volume;
            this.auscultationSounds.stomach.audio.volume = this.auscultationSounds.stomach.volume;

            if (!this.vLab['AcusticStethoscope'].applied) {
                this.vLab.SceneDispatcher.putTakenInteractable({
                    parent: this,
                    position: undefined,
                    quaternion: new THREE.Quaternion(),
                    scale: new THREE.Vector3(1.0, 1.0, 1.0),
                    materials: this.vLab['AcusticStethoscope'].vLabItemModel.userData['beforeTakenState'].materials
                });

                this.vLab['AcusticStethoscope'].interactables[0].vLabSceneObject.visible = false;
            }

            let lookAtPoint = normal.clone();
            lookAtPoint.transformDirection(this.interactables['maleBody'].vLabSceneObject.matrixWorld);
            lookAtPoint.multiplyScalar(10);
            lookAtPoint.add(point);

            if (!this.vLab['AcusticStethoscope'].applied) {
                this.AcusticStethoscopeSensor = this.vLab['AcusticStethoscope'].interactables[1].vLabSceneObject;
                this.vLab['AcusticStethoscope'].interactables[0].vLabSceneObject.remove(this.AcusticStethoscopeSensor);
                this.vLab.SceneDispatcher.currentVLabScene.add(this.AcusticStethoscopeSensor);
                this.AcusticStethoscopeSensor.visible = true;
            }

            this.vLab['AcusticStethoscope'].interactables[1].vLabSceneObject.position.copy(point);
            this.vLab['AcusticStethoscope'].interactables[1].vLabSceneObject.lookAt(lookAtPoint);
            this.vLab['AcusticStethoscope'].interactables[1].vLabSceneObject.rotateX(0.5 * Math.PI);
            this.vLab['AcusticStethoscope'].interactables[1].vLabSceneObject.rotateY(0.5 * Math.PI);

            this.vLab['AcusticStethoscope'].interactables[1].vLabSceneObject.visible = true;

            this.vLab['AcusticStethoscope'].onApplied();
        }
        self.vLab['AcusticStethoscope'].updateTube();

        this.vLab.SceneDispatcher.currentVLabScene.currentControls.setAzimutalRestrictionsFromCurrentTheta(0.5, -0.5);

        this.playSounds();

        this.vLab['TLOneStethoscope'].interactables[0].canBeTakenFromInventory = false;

        // if (this.AcusticStethoscopeSoundDescription == undefined) {
        //     this.AcusticStethoscopeSoundDescription = document.createElement('div');
        //     this.AcusticStethoscopeSoundDescription.style.border = 'solid 2px #dfff6c';
        //     this.AcusticStethoscopeSoundDescription.style.borderRadius = '10px';
        //     this.AcusticStethoscopeSoundDescription.style.backgroundColor = '#fdff84c7';
        //     this.AcusticStethoscopeSoundDescription.style.width = '98%';
        //     this.AcusticStethoscopeSoundDescription.style.height = '96%';
        //     this.AcusticStethoscopeSoundDescription.style.margin = '1%';
        //     this.AcusticStethoscopeSoundDescription.style.maxWidth = '800px';
        //     this.AcusticStethoscopeSoundDescription.style.backgroundImage = 'url("./resources/lungs.png")';
        //     this.AcusticStethoscopeSoundDescription.style.backgroundRepeat = 'no-repeat';
        //     this.AcusticStethoscopeSoundDescription.style.color = '#202020';

        //     this.vLab.DOMManager.vLabPanel.VLabPanelLeftContainer.appendChild(this.AcusticStethoscopeSoundDescription);
        //     this.vLab.DOMManager.vLabPanel.VLabPanelContainer.style.zIndex = '50';
        // } else {
        //     this.AcusticStethoscopeSoundDescription.style.display = 'block';
        // }
        // this.AcusticStethoscopeSoundDescription.innerHTML = '<div style="width: 90%; padding-left: 58px; padding-top: 10px; font-size: 22px; font-weight: bold;">' + this.lungsSounds[this.lungsSoundsID].shortDesc + '</div>';
        // this.AcusticStethoscopeSoundDescription.innerHTML += '<div style="width: 90%; padding-top: 10px; margin-left: 8%; font-size: 18px;">' + this.lungsSounds[this.lungsSoundsID].desc + '<div>';
    }

    onInteractableTaken(event) {
        if (event.interactable.vLabItem == this.vLab['TLOneStethoscope']) {
            this.muteSound();
            this.vLab['TLOneStethoscope'].onTaken();
            this.vLab['AcusticStethoscope'].interactables[0].canBeTakenFromInventory = true;
        }
        if (event.interactable.vLabItem == this.vLab['AcusticStethoscope']) {
            this.muteSound();
            this.vLab['AcusticStethoscope'].onTakenOut();
            this.vLab['TLOneStethoscope'].interactables[0].canBeTakenFromInventory = true;
            // if (this.AcusticStethoscopeSoundDescription != undefined) {
            //     this.AcusticStethoscopeSoundDescription.style.display = 'none';
            // }
        }
        if (event.interactable.vLabItem == this.vLab['MercuryThermometer']) {
            this.vLab['MercuryThermometer'].onTakenOut();
            this.vLab['MercuryThermometer'].hideMenu();
            this.MercuryThermometerVLabZoomHelper.conditionalDeactivationVisibility = false;
            this.MercuryThermometerVLabZoomHelper.setVisibility(false);
            this.MercuryThermometerVLabZoomHelper.deactivate(false, true);
        }
    }

    onInteractablePutToInventory(event) {
        if (event.interactable.vLabItem) {
            if (event.interactable.vLabItem == this.vLab['TLOneStethoscope']) {
                this.muteSound();
                this.vLab['TLOneStethoscope'].onTakenOut();
                this.vLab['AcusticStethoscope'].interactables[0].canBeTakenFromInventory = true;
            }
            if (event.interactable.vLabItem == this.vLab['AcusticStethoscope']) {
                this.muteSound();
                this.vLab['AcusticStethoscope'].onTakenOut();
                this.vLab['TLOneStethoscope'].interactables[0].canBeTakenFromInventory = true;
                // if (this.AcusticStethoscopeSoundDescription != undefined) {
                //     this.AcusticStethoscopeSoundDescription.style.display = 'none';
                // }
            }
            if (event.interactable.vLabItem == this.vLab['MercuryThermometer']) {
                this.vLab['MercuryThermometer'].onTakenOut();
                this.vLab['MercuryThermometer'].hideMenu();
                this.MercuryThermometerVLabZoomHelper.conditionalDeactivationVisibility = false;
                this.MercuryThermometerVLabZoomHelper.setVisibility(false);
                this.MercuryThermometerVLabZoomHelper.deactivate(false, true);
            }
        }
    }

    onInteractablePut(event) {
        if (this.interactables['maleBody'].lastTouchRaycasterIntersection != undefined &&
            this.vLab.SceneDispatcher.currentVLabScene.constructor.name != 'VLabInventory' &&
            this.vLab['TLOneStethoscope'].headphonesApplied) {
            this.playSounds();
        }
    }

    playSounds() {
        this.auscultationSounds.lungs['audioPlayPromise'] = this.auscultationSounds.lungs.audio.play();
        this.auscultationSounds.lungs['audioPlayPromise'].catch(error => {});
        this.auscultationSounds.heart['audioPlayPromise'] = this.auscultationSounds.heart.audio.play();
        this.auscultationSounds.heart['audioPlayPromise'].catch(error => {});
        this.auscultationSounds.stomach['audioPlayPromise'] = this.auscultationSounds.stomach.audio.play();
        this.auscultationSounds.stomach['audioPlayPromise'].catch(error => {});
    }

    muteSound() {
        this.auscultationSounds.lungs.audio.pause();
        this.auscultationSounds.lungs.audio.currentTime = 0;
        this.auscultationSounds.heart.audio.pause();
        this.auscultationSounds.heart.audio.currentTime = 0;
        this.auscultationSounds.stomach.audio.pause();
        this.auscultationSounds.stomach.audio.currentTime = 0;
    }

    soudsVolumeAdjust() {
        this.auscultationSounds.lungs.audio.volume = this.auscultationSounds.lungs.volume * this.vLab['TLOneStethoscope'].volume;
        this.auscultationSounds.heart.audio.volume = this.auscultationSounds.heart.volume * this.vLab['TLOneStethoscope'].volume;
        this.auscultationSounds.stomach.audio.volume = this.auscultationSounds.stomach.volume * this.vLab['TLOneStethoscope'].volume;
    }

    MercuryThermometer_ACTION_maleBody(params) {
        if (!this.vLab['MercuryThermometer'].applied) {
            let point = this.interactables['maleBody'].lastTouchRaycasterIntersection.point.clone();
            let normal = this.interactables['maleBody'].lastTouchRaycasterIntersection.face.normal.clone();
            let uv = this.interactables['maleBody'].lastTouchRaycasterIntersection.uv;
            let xy = new THREE.Vector2(Math.round(1023 * uv.x), Math.round(1023 * uv.y));
            // console.log(uv, xy);
            // console.log(this.TLOneStethoscopeMaleBodyMaps['applicable'].getImageData(xy.x, xy.y, 1, 1).data);
            let allowedMapPixel = { 
                r: this.MercuryThermometerMaleBodyMaps['applicable'].getImageData(xy.x, xy.y, 1, 1).data[0],
                g: this.MercuryThermometerMaleBodyMaps['applicable'].getImageData(xy.x, xy.y, 1, 1).data[1],
                b: this.MercuryThermometerMaleBodyMaps['applicable'].getImageData(xy.x, xy.y, 1, 1).data[2]
            };
            let allowedMapPixelWeight = (allowedMapPixel.r + allowedMapPixel.g + allowedMapPixel.b) / 3;
            if (allowedMapPixelWeight > 127) {
                let putPosition = new THREE.Vector3();
                let lookAtPos = new THREE.Vector3();
                let zoomHelperPosition = new THREE.Vector3();
                let zoomHelperViewPosition = new THREE.Vector3();
                let zoomHelperTarget = new THREE.Vector3();
                /** Right Armpit */
                if (xy.x > 500) {
                    putPosition = new THREE.Vector3(0.153, 1.389, -0.051);
                    lookAtPos = putPosition.clone().add(new THREE.Vector3(0.008, 0.002, 0.02));

                    zoomHelperPosition = putPosition.clone().sub(new THREE.Vector3(-0.06, -0.02, -0.1));
                    zoomHelperViewPosition = putPosition.clone().sub(new THREE.Vector3(-0.01, -0.1, 0.0));
                    zoomHelperTarget = putPosition.clone().add(new THREE.Vector3(0.02, -0.1, -0.08));
                }
                /** Left Armpit */
                else {
                    putPosition = new THREE.Vector3(-0.153, 1.384, -0.042);
                    lookAtPos = putPosition.clone().add(new THREE.Vector3(-0.008, 0.002, 0.02));

                    zoomHelperPosition = putPosition.clone().sub(new THREE.Vector3(0.06, -0.02, -0.1));
                    zoomHelperViewPosition = putPosition.clone().sub(new THREE.Vector3(-0.01, -0.1, 0.0));
                    zoomHelperTarget = putPosition.clone().add(new THREE.Vector3(0.02, -0.1, -0.08));
                }
                
                this.vLab['MercuryThermometer'].interactables[0].put({
                    parent: this,
                    position: putPosition.clone(),
                    quaternion: new THREE.Quaternion(),
                    scale: new THREE.Vector3(1.0, 1.0, 1.0),
                    materials: this.vLab['MercuryThermometer'].vLabItemModel.userData['beforeTakenState'].materials
                });

                this.vLab['MercuryThermometer'].vLabItemModel.lookAt(lookAtPos);
                this.vLab['MercuryThermometer'].setEnvMap(this['maleBodyAppliedEnvMap']);

                this.vLab['MercuryThermometer'].setTemperature(36.6);

                this.vLab['MercuryThermometer'].onApplied();


                this.MercuryThermometerVLabZoomHelper.setTarget(zoomHelperTarget);
                this.MercuryThermometerVLabZoomHelper.setPosition(zoomHelperPosition);
                this.MercuryThermometerVLabZoomHelper.setViewPosition(zoomHelperViewPosition);
                this.MercuryThermometerVLabZoomHelper.setVisibility(true);
                this.MercuryThermometerVLabZoomHelper.conditionalDeactivationVisibility = true;
            }
        }
    }
    /**
     * onZoomHelperActivated
     */
    onZoomHelperActivated(extParams) {
        // if(this.MercuryThermometerVLabZoomHelper == extParams.args.zoomHelper) {
        //     this.vLab['MercuryThermometer'].disableMenu();
        // }
    }
    /**
     * onZoomHelperDeActivated
     */
    onZoomHelperDeActivated(extParams) {
        // if(this.MercuryThermometerVLabZoomHelper == extParams.args.zoomHelper) {
        //     this.vLab['MercuryThermometer'].enableMenu();
        // }
    }
    /**
     * vLabButtonsSelectorOnClick
     */
    // vLabButtonsSelectorOnClick(event) {
    //     let clickedSelectorButton = event.srcElement;
    //     this.vLabButtonsSelector.setSelected({ button: clickedSelectorButton});
    //     this.lungsSoundsID = parseInt(clickedSelectorButton.getAttribute('selectorID'));

    //     // this.vLab.vLabQuiz.quizData.questions[0].correct = this.lungsSoundsID;

    //     this.auscultationSounds.lungs.sndURL = './resources/auscultationSounds/lungs/' + this.lungsSounds[this.lungsSoundsID]['path'];

    //     let wasPlaying = this.auscultationSounds.lungs.audio.currentTime !== 0;

    //     this.auscultationSounds.lungs.audio.pause();
    //     this.auscultationSounds.lungs.audio.currentTime = 0;

    //     this.auscultationSounds.lungs.audio = new Audio();
    //     this.auscultationSounds.lungs.audio.loop = true;
    //     this.auscultationSounds.lungs.audio.src = this.auscultationSounds.lungs.sndURL;
    //     this.auscultationSounds.lungs.audio.volume = this.auscultationSounds.lungs.volume;

    //     if (wasPlaying) {
    //         this.auscultationSounds.lungs['audioPlayPromise'] = this.auscultationSounds.lungs.audio.play();
    //         this.auscultationSounds.lungs['audioPlayPromise'].catch(error => {});
    //     }

    //     if (this.AcusticStethoscopeSoundDescription) {
    //         this.AcusticStethoscopeSoundDescription.innerHTML = '<div style="width: 90%; padding-left: 58px; padding-top: 10px; font-size: 22px; font-weight: bold;">' + this.lungsSounds[this.lungsSoundsID].shortDesc + '</div>';
    //         this.AcusticStethoscopeSoundDescription.innerHTML += '<div style="width: 90%; padding-top: 10px; margin-left: 8%; font-size: 18px;">' + this.lungsSounds[this.lungsSoundsID].desc + '<div>';
    //     }
    // }
}

export default BasicsOfLungSoundsScene;