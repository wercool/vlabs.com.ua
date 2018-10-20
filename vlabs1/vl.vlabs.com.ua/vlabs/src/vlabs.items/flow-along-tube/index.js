import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';

export default class FlowAlongTube {
    constructor(initObj) {
        this.initObj = initObj;
        this.context = this.initObj.context;
        this.tube = this.initObj.tube;

        this.sprites = [];

        this.chainTo = undefined;

        this.speed = this.initObj.speed ? 100 / this.initObj.speed : 100;

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

        this.initObj.spritesNum = this.initObj.spritesNum !== undefined ? this.initObj.spritesNum : 1;
        for (var i = 0; i < this.initObj.spritesNum; i++) {
            var sprite = new THREE.Sprite(this.spriteMaterial);
            sprite.name = "flowAlongTube_" + this.tube.name + "Sprite" + i;
            sprite.scale.copy(this.initObj.scale ? this.initObj.scale : new THREE.Vector3(0.1, 0.1, 0.1));
            sprite.position.x = 0.0;
            sprite.position.y = 0.0;
            sprite.position.z = 0.0;
            sprite.visible = false;
            this.tube.add(sprite);

            sprite.userData['curCSectionCenterId'] = 0;
            this.sprites.push(sprite);
        }

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

        this.setPosition(this.cSectionCenters[0]);
        this.setVisibility(false);
    }

    setPosition(position, idx) {
        if (idx !== undefined) {
            this.sprites[idx].position.copy(position);
        } else {
            for (var i = 0; i < this.sprites.length; i++) {
                this.sprites[i].position.copy(position);
            }
        }
    }

    setVisibility(visibility, idx) {
        if (idx !== undefined) {
            this.sprites[idx].visible = visibility;
        } else {
            for (var i = 0; i < this.sprites.length; i++) {
                this.sprites[i].visible = visibility;
            }
        }
    }

    start() {
        if (this.started) return;
        for (var i = 0; i < this.sprites.length; i++) {
            setTimeout((i) => {
                this.setVisibility(true, i);
                this.animate(i);
            }, this.speed * i, i);
        }
        this.started = true;
    }

    stop() {
        for (var i = 0; i < this.sprites.length; i++) {
            if (this.sprites[i].userData['animationTween']) {
                this.sprites[i].userData['animationTween'].stop();
            }
        }
        this.setVisibility(false);
        this.started = false;
    }

    animate(idx) {
        var sprite = this.sprites[idx];
        if (!sprite.visible) return;
        if (sprite.userData['curCSectionCenterId'] >= this.cSectionsNum - 2) {
            sprite.userData['curCSectionCenterId'] = 0;
            this.setPosition(this.cSectionCenters[0], idx);
            if (this.chainTo && idx == 0) {
                this.chainTo.start();
            }
        }
        sprite.userData['curCSectionCenterId']++;
        sprite.userData['animationTween'] = new TWEEN.Tween(sprite.position)
        .to({ x: this.cSectionCenters[sprite.userData['curCSectionCenterId']].x, 
              y: this.cSectionCenters[sprite.userData['curCSectionCenterId']].y, 
              z: this.cSectionCenters[sprite.userData['curCSectionCenterId']].z }, this.speed)
        .easing(TWEEN.Easing.Linear.None)
        .onComplete(() => {
            this.animate(idx);
        })
        .start();
    }

}