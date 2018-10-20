import * as THREE           from 'three';
import VLab                 from '../../vlabs.core/vlab';

import BoshScrewdriver              from '../../vlabs.items/boshScrewdriver';

class HelpClipBoschScrewdriverIXOIII extends VLab {
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
        this.defaultCameraInitialPosition = new THREE.Vector3(0.0, 0.25, 0.25);

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
        this.BoshScrewdriver = new BoshScrewdriver({
            context: this,
            pos: new THREE.Vector3(0.0, 0.0, 0.0),
            name: "BoshScrewdriver",
            manipulation: false,
            interactive: false
        });
        this.BoshScrewdriver.addVLabEventListeners();
    }
}

let helpClipBoschScrewdriverIXOIII = new HelpClipBoschScrewdriverIXOIII({
    name: "HelpClipBoschScrewdriverIXOIII",
    natureURL: "./resources/nature.json",
});