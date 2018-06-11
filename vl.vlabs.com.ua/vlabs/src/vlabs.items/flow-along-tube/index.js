import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';

export default class FlowAlongTube {
    constructor(initObj) {
        this.initObj = initObj;
        this.context = this.initObj.context;
        this.tube = this.initObj.tube;

        this.speed = this.initObj.speed ? 100 / this.initObj.speed : 100;
        this.curCSectionCenterId = 0;

        var textureLoader = new THREE.TextureLoader();

        Promise.all([
            textureLoader.load('../vlabs.items/flow-along-tube/sprites/star.png'),
        ])
        .then((result) => {
            this.spriteTexture = result[0];

            this.initialize();
        });
    }

    initialize() {
        this.spriteMaterial = new THREE.SpriteMaterial({
            map: this.spriteTexture,
            color: this.initObj.color ? this.initObj.color : this.tube.material.color,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 1.0,
            rotation: 0.0,
            depthTest: false,
            depthWrite: false
        });

        this.sprite = new THREE.Sprite(this.spriteMaterial);
        this.sprite.name = "flowAlongTube_" + this.tube.name;
        this.sprite.scale.copy(this.initObj.scale ? this.initObj.scale : new THREE.Vector3(0.1, 0.1, 0.1));
        this.sprite.position.x = 0.0;
        this.sprite.position.y = 0.0;
        this.sprite.position.z = 0.0;
        this.sprite.visible = true;
        this.tube.add(this.sprite);

        this.verticesTuples = [];
        this.tube.updateMatrixWorld();

        for (var i = 0; i < this.tube.geometry.attributes.position.array.length; i++) {
            this.verticesTuples.push({ 
                v: new THREE.Vector3(this.tube.geometry.attributes.position.array[i++], this.tube.geometry.attributes.position.array[i++], this.tube.geometry.attributes.position.array[i]),
                vid: i - 2
            });
        }
        this.cSectionsNum = Math.trunc(this.verticesTuples.length / this.initObj.cSectionVertices);
        var cSections = [];
        this.cSectionCenters = [];

        for (var cSid = 0; cSid < this.cSectionsNum; cSid++) {
            var vi = 0;
            this.verticesTuples.forEach((vt) => {
                vt.distance = this.verticesTuples[0].v.distanceTo(vt.v);
            });
            this.verticesTuples.sort((a, b) => {
                return (a.distance - b.distance) + (a.vid - b.vid);
            });

            cSections[cSid] = this.verticesTuples.slice(0, this.initObj.cSectionVertices);
            var verticesTuplesLeft = [];
            for (var i = this.initObj.cSectionVertices; i < this.verticesTuples.length; i++) {
                verticesTuplesLeft.push(this.verticesTuples[i]);
            }
            this.verticesTuples = verticesTuplesLeft;
            var sx = 0.0;
            var sy = 0.0;
            var sz = 0.0;
            for (var i = 0; i < this.initObj.cSectionVertices; i++) {
                sx += cSections[cSid][i].v.x;
                sy += cSections[cSid][i].v.y;
                sz += cSections[cSid][i].v.z;
            }
            this.cSectionCenters[cSid] = new THREE.Vector3(sx / this.initObj.cSectionVertices, sy / this.initObj.cSectionVertices, sz / this.initObj.cSectionVertices);
        }

        if (this.initObj.reversed) this.cSectionCenters.reverse();

        // var material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2.0 });
        // var geometry = new THREE.Geometry();
        // for (var i = 0; i < this.cSectionCenters.length; i++) {
        //     geometry.vertices.push(this.cSectionCenters[i]);
        // }
        // var line = new THREE.Line(geometry, material);
        // this.tube.add(line);
        // this.tube.material.wireframe = true;

        this.sprite.position.copy(this.cSectionCenters[0]);
        this.sprite.visible = false;
    }

    start() {
        this.sprite.visible = true;
        this.animate();
    }

    stop() {
        this.animationTween.stop();
        this.sprite.visible = false;
    }

    animate() {
        if (!this.sprite.visible) return;
        if (this.curCSectionCenterId >= this.cSectionsNum - 2) {
            this.curCSectionCenterId = 0;
            this.sprite.position.copy(this.cSectionCenters[0]);
        }
        this.curCSectionCenterId++;
        this.animationTween = new TWEEN.Tween(this.sprite.position)
        .to({ x: this.cSectionCenters[this.curCSectionCenterId].x, 
              y: this.cSectionCenters[this.curCSectionCenterId].y, 
              z: this.cSectionCenters[this.curCSectionCenterId].z }, this.speed)
        .easing(TWEEN.Easing.Linear.None)
        .onComplete(() => {
            if (this.initObj.prestartDelay && this.curCSectionCenterId === 1) {
                this.sprite.visible = false;
                setTimeout(() => {
                    this.sprite.visible = true;
                    this.animate();
                }, this.initObj.prestartDelay);
            } else {
                this.animate();
            }
        })
        .start();
    }

}