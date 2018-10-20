import * as THREE           from 'three';
import VLab                 from '../../vlabs.core/vlab';

import DigitalMultimeterFluke17B    from '../../vlabs.items/digitalMultimeterFluke17B';

class HelpClipFluke17B extends VLab {
    constructor(initObj = {}) {
        super(initObj);

        addEventListener(this.name + "SceneCompleteEvent", this.onSceneCompleteEvent.bind(this), false);
        addEventListener(this.name + "ActivatedEvent", this.onActivatedEvent.bind(this), false);
        // addEventListener(this.name + "RedererFrameEvent",  this.onRedererFrameEvent.bind(this), false);

        super.preInitialize().then(() => {
            super.initialize().then((success) => {
                if (success) {

                    var textureLoader = new THREE.TextureLoader();
                    Promise.all([
                        textureLoader.load('../vlabs.assets/envmaps/hdriEnvMap2.jpg'),
                    ])
                    .then((result) => {
                        this.envMap = result[0];
                        this.envMap.mapping = THREE.EquirectangularReflectionMapping;

                        this.initialize(initObj);
                    })
                    .catch(error => {
                        console.error(error);
                    });

                }
            });
        }).catch(error => {
            console.error(error.error);
            this.showErrorMessage(error);
        });
        
    }

    initialize(initObj) {
        console.log(initObj.name + ' initialization...');

        super.setProgressBar();

        this.scene = new THREE.Scene();

        // Lights
        var ambient = new THREE.AmbientLight(0xffffff, 0.65);
        this.scene.add(ambient);
        var spotLight1 = new THREE.PointLight(0xffffff, 0.75);
        spotLight1.position.set(0.0, 1.0, 2.0);
        this.scene.add(spotLight1);

        //Cameras
        this.defaultCamera = new THREE.PerspectiveCamera(60, this.webGLContainer.clientWidth / this.webGLContainer.clientHeight, 0.01, 1000.0);
        this.defaultCameraInitialPosition = new THREE.Vector3(0.0, 0.25, 0.0);

        // EnvSphere
        var envSphereGeometry = new THREE.SphereBufferGeometry(2.0, 60, 40);
        // invert the geometry on the x-axis so that all of the faces point inward
        envSphereGeometry.scale(-1, 1, 1);

        var envSpehreMaterial = new THREE.MeshBasicMaterial( {
            map: this.envMap
        } );

        this.envSpehreMesh = new THREE.Mesh(envSphereGeometry, envSpehreMaterial);
        this.envSpehreMesh.name = "envSpehreMesh";
        this.scene.add(this.envSpehreMesh);

        this.setVLabScene(this.scene);
    }

    onSceneCompleteEvent(event) {
        super.activate();
        super.switchCameraControls(this.nature.cameraControls);
    }

    onActivatedEvent() {
        new DigitalMultimeterFluke17B({
            context: this,
            pos: new THREE.Vector3(0.0, 0.0, 0.1),
            standAloneMode: true
        }).then((instance) => {
            this.digitalMultimeterFluke17B = instance;
            // this.digitalMultimeterFluke17B.addResponsiveObject({
            //     mesh: this.vLabScene.getObjectByName('controlBoard'),
            //     testPoints: [
            //         {
            //             name: 'relayT9AV5022ContactCOM',
            //             target: new THREE.Vector3(0.0352108, 0.02511, 0.0296565),
            //             orientation: new THREE.Vector3(THREE.Math.degToRad(70.0), 0.0, THREE.Math.degToRad(30.0)),
            //             spritePosDeltas: new THREE.Vector3(-0.03, 0.05, 0.05),
            //             spriteScale: 0.05,
            //             spriteRotation: 0.0
            //         },
            //         {
            //             name: 'relayT9AV5022ContactNC',
            //             target: new THREE.Vector3(0.0550126, 0.0309874, 0.0296565),
            //             orientation: new THREE.Vector3(THREE.Math.degToRad(70.0), 0.0, THREE.Math.degToRad(-60.0)),
            //             spritePosDeltas: new THREE.Vector3(0.05, -0.05, 0.05),
            //             spriteScale: 0.05,
            //             spriteRotation: THREE.Math.degToRad(270.0)
            //         },
            //         {
            //             name: 'relayT9AV5022ContactNO',
            //             target: new THREE.Vector3(0.055229, 0.0400362, 0.0296565),
            //             orientation: new THREE.Vector3(THREE.Math.degToRad(70.0), 0.0, 0.0),
            //             spritePosDeltas: new THREE.Vector3(0.05, 0.05, 0.05),
            //             spriteScale: 0.05,
            //             spriteRotation: THREE.Math.degToRad(300.0)
            //         },
            //     ]
            // });
        });
    }
}

let helpClipFluke17B = new HelpClipFluke17B({
    name: "HelpClipFluke17B",
    natureURL: "./resources/nature.json",
});