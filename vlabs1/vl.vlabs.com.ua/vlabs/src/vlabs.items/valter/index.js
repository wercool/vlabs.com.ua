import * as THREE           from 'three';
import * as THREEUtils      from '../../vlabs.core/utils/three.utils';
import * as dat             from 'dat.gui';
var TransformControls       = require('../../vlabs.core/three-transformcontrols/index');

export default class Valter {
/*
initObj {
    "context": VLab,
    "initPos": THREE.Vector3,
    "name": optional name
}
*/
    constructor(initObj) {
       this.initObj = initObj;
       this.context = initObj.context;
       this.pos = initObj.pos;
       if (this.initObj.name) {
        this.name = this.initObj.name;
        }

        var textureLoader = new THREE.TextureLoader();

        return new Promise((resolve, reject) => {
            Promise.all([
                textureLoader.load('../vlabs.items/valter/textures/dynamic/carbon_fibre.jpg')
            ])
            .then((result) => {
                var cableSleeveMaterialTexture = result[0];
                cableSleeveMaterialTexture.wrapS = cableSleeveMaterialTexture.wrapT = THREE.RepeatWrapping;
                cableSleeveMaterialTexture.repeat.set(4, 1);
                this.cableSleeveMaterial = new THREE.MeshLambertMaterial({
                    wireframe: false,
                    flatShading: false,
                    map: cableSleeveMaterialTexture
                });

                this.initialize();
            });
        });

    //    this.initialize();
    }

    initialize() {
        this.context.loadVLabItem("../vlabs.items/valter/valter-sim.json", "Valter").then((scene) => {
            this.model = scene.children[0];

            this.context.vLabScene.add(this.model);

            if (this.pos) {
                this.model.position.copy(this.pos);
            } else {
                console.error("Valter is not set");
            }

            this.baseFrame      = this.model.getObjectByName('baseFrame');
            this.bodyFrame      = this.model.getObjectByName('bodyFrame');
            this.torsoFrame     = this.model.getObjectByName('torsoFrame');
            this.headFrame      = this.model.getObjectByName('headFrame');

            this.headTiltLink   = this.model.getObjectByName('headTiltLink');
            this.headYawLink    = this.model.getObjectByName('headYawLink');


            if (this.initObj.manipulation) {
                this.manipulationControl = new TransformControls(this.context.defaultCamera, this.context.webGLRenderer.domElement);
                this.manipulationControl.setSize(1.0);
                this.context.vLabScene.add(this.manipulationControl);
                this.context.manipulationControl.attach(this.model);
            }

            this.initializeLinks();
            this.initializeCableSleeves();
            this.setupDatGUI()
        }).catch(error => {
            console.error(error);
        });
    }

    initializeLinks() {
        this.ValterLinks = {
            headTiltLink: {
                value: this.headTiltLink.rotation.x,
                min: 0.0,
                max: 0.95,
                step: 0.01
            },
            headYawLink: {
                value: this.headYawLink.rotation.z,
                min: -1.1,
                max: 1.1,
                step: 0.01
            },
            torsoFrame: {
                value: this.torsoFrame.rotation.x,
                min: 0.0,
                max: 0.8,
                step: 0.01
            }
        };
        console.log(this.ValterLinks);
    }

    initializeCableSleeves() {
        this.torsoFrameCableInput = new THREE.Object3D();
        this.torsoFrameCableInput.position.set(0.0, -0.101, 0.38);
        this.torsoFrame.add(this.torsoFrameCableInput);

        this.headFrameCableInput = new THREE.Object3D();
        this.headFrameCableInput.position.set(0.0, 0.1036, 0.057);
        this.headFrame.add(this.headFrameCableInput);

        this.torsoFrameToHeadFrameSleeveSegments = 16;

        this.torsoFrameToHeadFrameCableGeometry = new THREE.TubeBufferGeometry(this.getTorsoFrameToHeadFrameCableCurve(), this.torsoFrameToHeadFrameSleeveSegments, 0.01, 5);
        this.torsoFrameToHeadFrameCableMesh = new THREE.Mesh(this.torsoFrameToHeadFrameCableGeometry, this.cableSleeveMaterial);
        this.torsoFrame.add(this.torsoFrameToHeadFrameCableMesh);
    }

    setupDatGUI() {
        this.datGUI = new dat.GUI();
        this.datGUI.add(this.ValterLinks.headTiltLink, 'value', this.ValterLinks.headTiltLink.min, this.ValterLinks.headTiltLink.max, this.ValterLinks.headTiltLink.step).name('Head Tilt Link').step(0.01).onChange(this.setHeadTiltLink.bind(this));
        this.datGUI.add(this.ValterLinks.headYawLink, 'value', this.ValterLinks.headYawLink.min, this.ValterLinks.headYawLink.max, this.ValterLinks.headYawLink.step).name('Head Yaw Link').step(0.01).onChange(this.setHeadYawLink.bind(this));
        this.datGUI.add(this.ValterLinks.torsoFrame, 'value', this.ValterLinks.torsoFrame.min, this.ValterLinks.torsoFrame.max, this.ValterLinks.torsoFrame.step).name('Torso Tilt').step(0.01).onChange(this.setTorsoFrame.bind(this));
    }

    setHeadTiltLink(value) {
        this.ValterLinks.headTiltLink.value = value;
        this.headTiltLink.rotation.x = this.ValterLinks.headTiltLink.value * -1;
        this.torsoFrameToHeadFrameCableGeometry.copy(new THREE.TubeBufferGeometry(this.getTorsoFrameToHeadFrameCableCurve(), this.torsoFrameToHeadFrameSleeveSegments, 0.01, 5));
    }

    setHeadYawLink(value) {
        this.ValterLinks.headYawLink.value = value;
        this.headYawLink.rotation.z = this.ValterLinks.headYawLink.value;
        this.torsoFrameToHeadFrameCableGeometry.copy(new THREE.TubeBufferGeometry(this.getTorsoFrameToHeadFrameCableCurve(), this.torsoFrameToHeadFrameSleeveSegments, 0.01, 5));
    }

    getTorsoFrameToHeadFrameCableCurve() {
        this.model.updateMatrixWorld();
        return new THREE.CatmullRomCurve3([
            this.torsoFrame.worldToLocal(THREEUtils.getWorldPosition(this.torsoFrameCableInput)).add(new THREE.Vector3(0.0, 0.01, -0.01)),
            this.torsoFrame.worldToLocal(THREEUtils.getWorldPosition(this.torsoFrameCableInput)).add(new THREE.Vector3(0.0, -0.018, 0.025)),
            this.torsoFrame.worldToLocal(THREEUtils.getWorldPosition(this.torsoFrameCableInput)).add(new THREE.Vector3(this.ValterLinks.headYawLink.value / 30, -0.075 + this.ValterLinks.headTiltLink.value / 7 + Math.abs(this.ValterLinks.headYawLink.value / 60), 0.15 + this.ValterLinks.headTiltLink.value / 15)),
            this.torsoFrame.worldToLocal(THREEUtils.getWorldPosition(this.headFrameCableInput)).add(new THREE.Vector3(this.ValterLinks.headYawLink.value / 50, -0.02, -0.002 + this.ValterLinks.headTiltLink.value / 50 + Math.abs(this.ValterLinks.headYawLink.value / 50) * this.ValterLinks.headTiltLink.value)),
            this.torsoFrame.worldToLocal(THREEUtils.getWorldPosition(this.headFrameCableInput)).add(new THREE.Vector3(-this.ValterLinks.headYawLink.value / 40, 0.02, -0.002 - this.ValterLinks.headTiltLink.value / 50 - Math.abs(this.ValterLinks.headYawLink.value / 30) * this.ValterLinks.headTiltLink.value ))
        ]);
    }

    setTorsoFrame(value) {
        this.ValterLinks.torsoFrame.value = value;
        this.torsoFrame.rotation.x = this.ValterLinks.torsoFrame.value * -1;
    }
}