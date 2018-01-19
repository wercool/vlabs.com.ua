import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';

var self = undefined;

export default class WaterStream {
    constructor(initObj) {
        self = this;
        this.initObj = initObj;
        this.clock = new THREE.Clock();

        var map = '/vlabs.items/water-stream/maps/map.png';
        var envMap = '/vlabs.items/water-stream/maps/envMap.jpg';
        var dispMap = '/vlabs.items/water-stream/maps/dispMap.jpg';
        var alphaMap = '/vlabs.items/water-stream/maps/alphaMap.jpg';

        var loader = new THREE.TextureLoader();
        loader.load(
            map,
            // onLoad callback
            function(loadedTexture) {
                self.map = loadedTexture;
                self.map.wrapS = self.map.wrapT = THREE.RepeatWrapping; 

                var envMapLoader = new THREE.TextureLoader();
                envMapLoader.load(
                    envMap,
                    function(envMap) {
                        self.envMap = envMap;

                        var dispMapLoader = new THREE.TextureLoader();
                        dispMapLoader.load(
                            dispMap,
                            function(dispMap) {
                                self.dispMap = dispMap;

                                var alphaMapLoader = new THREE.TextureLoader();
                                alphaMapLoader.load(
                                    alphaMap,
                                    function(alphaMap) {
                                        self.alphaMap = alphaMap;

                                        self.initialize();
                                    }
                                );
                            }
                        );
                    }
                );
            },
            // onError callback
            function (err) {
                console.error('An error happened.', err);
            }
        );
    }

    initialize() {
        if (this.initObj.streamPathPoints) {
            this.streamPathPoints = this.initObj.streamPathPoints;
        } else {
            console.error("WaterStream '" + this.initObj.name +"' has no streamPathPoints defined in initObj");
        }
        this.streamPath = new THREE.CatmullRomCurve3(this.streamPathPoints);
        this.streamPath.type = 'chordal';
        this.streamPath.closed = false;

        this.radialSegments = (this.initObj.radialSegments) ? this.initObj.radialSegments : 12

        this.geometry = new THREE.TubeBufferGeometry(this.streamPath,
            (this.initObj.tubularSegments) ? this.initObj.tubularSegments : 8, 
            this.initObj.radius, 
            this.radialSegments, 
            false);

        this.material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: this.map,
            envMap: this.envMap,
            bumpMap: (this.initObj.context.nature.bumpMaps) ? this.envMap : undefined,
            bumpScale: 1.0,
            refractionRatio: (this.initObj.context.nature.bumpMaps) ? 0.95 : 0.15,
            specular: 0xffffff,
            displacementMap: self.dispMap,
            displacementScale: 0.15,
            alphaMap: self.alphaMap,
            shininess: 2,
            transparent: true,
            opacity: 0.55,
            wireframe: false
        });
        this.material.envMap.mapping = THREE.EquirectangularRefractionMapping;

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(this.initObj.pos);
        this.mesh.name = this.initObj.name;

        this.mesh.scale.y = 0.001;
        this.mesh.visible = false;

        if (!this.initObj.laminar) {
            this.initObj.turbulence = (this.initObj.turbulence) ? this.initObj.turbulence : 1.0;
            this.verticesNum = this.geometry.attributes.position.array.length / 3;
            this.geometry.dynamic = true;
            this.initialDistortedGeometry = [];
            for (var i = 0; i < this.geometry.attributes.position.array.length; i++) {
                this.initialDistortedGeometry.push(this.geometry.attributes.position.array[i] + Math.random() * 0.001 * this.initObj.turbulence - 0.0005 * this.initObj.turbulence);
            }
            this.resetDistortionCnt = 0;
        }

        this.initObj.context.vLabScene.add(this.mesh);
        console.log("WaterStream '" + this.initObj.name +"' initialized");
    }

    start() {
        this.mesh.visible = true;
        new TWEEN.Tween(this.mesh.scale)
        .to({ y: 1.0 }, 150)
        .easing(TWEEN.Easing.Cubic.In)
        .onComplete(() => { 
            addEventListener("redererFrameEvent",  self.onRedererFrameEvent);
         })
        .start();
    }

    stop() {
        removeEventListener("redererFrameEvent", this.onRedererFrameEvent);
    }

    onRedererFrameEvent(event) {
        if (!self.initObj.laminar) {
            if (self.resetDistortionCnt < 10) {
                var pointCnt = 0;
                for (var i = self.radialSegments * 3 + 3; i < self.geometry.attributes.position.array.length; i++) {
                    self.geometry.attributes.position.array[i] += Math.random() * 0.001 * self.initObj.turbulence - 0.0005 * self.initObj.turbulence;
                }
                self.resetDistortionCnt++;
            } else {
                for (var i = self.radialSegments * 3 + 3; i < self.geometry.attributes.position.array.length; i++) {
                    self.geometry.attributes.position.array[i] = self.initialDistortedGeometry[i];
                }
                self.resetDistortionCnt = 0;
                self.map.offset.x = 0;
                self.map.offset.y = 0;
            }
            self.geometry.attributes.position.needsUpdate = true;
            self.map.offset.x -= 0.035;
            self.map.offset.y -= 0.001;
        }
    }
}