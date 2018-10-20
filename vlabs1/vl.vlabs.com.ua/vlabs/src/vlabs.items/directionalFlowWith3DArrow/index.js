import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';


export default class DirectionalFlowWith3DArrow {

    constructor(initObj) {
       this.initObj = initObj;
       this.context = this.initObj.context;
       this.name = this.initObj.name;
       this.refPath = this.initObj.refPath;
       this.speed = this.initObj.speed;

       if (this.context.FirstDirectionalFlowWith3DArrowIsLoading === undefined) {
           this.initialize();
       } else {
           this.preInitialize();
       }
    }

    preInitialize() {
        this.existingModel = this.context.vLabScene.getObjectByName('directionalFlowWith3DArrow');
        if (this.existingModel === undefined && this.context.FirstDirectionalFlowWith3DArrowIsLoading) {
            setTimeout(() => { this.preInitialize(); }, 250);
        } else if (this.existingModel !== undefined) {
            this.postInitialize(true);
        }
    }

    initialize() {
        this.refPath.visible = false;
        this.context.FirstDirectionalFlowWith3DArrowIsLoading = true;

        this.context.loadVLabItem("../vlabs.items/directionalFlowWith3DArrow/directionalFlowWith3DArrow.json", "DirectionalFlowWith3DArrow").then((scene) => {
            this.model = scene.children[0];
            this.context.FirstDirectionalFlowWith3DArrowIsLoading = false;

            this.postInitialize();
        }).catch(error => {
            console.error(error);
        });
    }

    postInitialize(clone) {

        if (clone === true) {
            // console.log(this.existingModel);
            this.model = this.existingModel.clone();
        }

        this.model.visible = false;
        this.context.vLabScene.add(this.model);

        if (this.initObj.scale) {
            this.model.scale.set(this.initObj.scale, this.initObj.scale, this.initObj.scale);
        }

        this.material = this.refPath.material.clone();
        this.material.map = this.refPath.material.map.clone();
        this.material.map.needsUpdate = true;

        this.material.side = THREE.BackSide;
        this.material.depthTest = false;
        this.material.depthWrite = false;
        this.material.color = new THREE.Color(2.0, 1.0, 2.0);
        this.material.transparent = true;
        this.material.alphaTest = 0.1;
        this.material.needsUpdate = true;
        this.model.material = this.material;

        if (this.context[this.name + '_Waypoints'] !== undefined) {
            this.waypoints = this.context[this.name + '_Waypoints'];
            return;
        }

        var tube = this.refPath;
        var cSectionVertices = this.initObj.cSectionVertices;

        tube.updateMatrixWorld();

        var verticesTuples = [];
        for (var i = 0; i < tube.geometry.attributes.position.array.length; i++) {
            verticesTuples.push({ 
                v: new THREE.Vector3(tube.geometry.attributes.position.array[i++], tube.geometry.attributes.position.array[i++], tube.geometry.attributes.position.array[i]),
                vid: i - 2
            });
        }
        var cSectionsNum = Math.trunc(verticesTuples.length / cSectionVertices);
        var cSections = [];
        var cSectionCenters = [];

        for (var cSid = 0; cSid < cSectionsNum; cSid++) {
            var vi = 0;
            verticesTuples.forEach((vt) => {
                vt.distance = verticesTuples[0].v.distanceTo(vt.v);
            });
            verticesTuples.sort((a, b) => {
                return (a.distance - b.distance) + (a.vid - b.vid);
            });

            cSections[cSid] = verticesTuples.slice(0, cSectionVertices);
            var verticesTuplesLeft = [];
            for (var i = cSectionVertices; i < verticesTuples.length; i++) {
                verticesTuplesLeft.push(verticesTuples[i]);
            }
            verticesTuples = verticesTuplesLeft;
            var sx = 0.0;
            var sy = 0.0;
            var sz = 0.0;
            for (var i = 0; i < cSectionVertices; i++) {
                sx += cSections[cSid][i].v.x;
                sy += cSections[cSid][i].v.y;
                sz += cSections[cSid][i].v.z;
            }
            cSectionCenters[cSid] = new THREE.Vector3(sx / cSectionVertices, sy / cSectionVertices, sz / cSectionVertices);
        }

        if (this.initObj.reversed) cSectionCenters.reverse();

// var geometry = new THREE.SphereBufferGeometry(0.01, 4, 4);
// var material = new THREE.MeshLambertMaterial({
//     color: 0x0000ff
// });

        this.waypoints = [];
        for (var c = 0; c < cSectionCenters.length; c++) {
// var waypoint = new THREE.Mesh(geometry, material);
            var waypoint = new THREE.Object3D();
            waypoint.position.copy(cSectionCenters[c]);
            tube.add(waypoint);
            this.waypoints.push(this.getWorldPosition(waypoint));
        }

        this.context[this.name + '_Waypoints'] = this.waypoints;
    }

    start(prestartDelay) {
        if (prestartDelay !== undefined) {
            this.prestartDelay = setTimeout(() => {
                this.start();
            }, prestartDelay);
            return;
        }

        this.model.position.copy(this.waypoints[0]);
        this.model.lookAt(this.waypoints[1]);
        this.model.visible = true;
        this.curWPIdx = 0;
        this.material.map.offset.x = 0;
        this.animate();
    }

    stop() {
        if (this.prestartDelay) clearTimeout(this.prestartDelay);

        if (this.model) this.model.visible = false;
        if (this.animation) this.animation.stop();
    }

    animate() {
        this.animation = new TWEEN.Tween(this.model.position)
        .to({ x: this.waypoints[this.curWPIdx + 1].x, 
              y: this.waypoints[this.curWPIdx + 1].y, 
              z: this.waypoints[this.curWPIdx + 1].z }, this.speed)
        .easing(TWEEN.Easing.Linear.None)
        .onComplete(() => {
            if (this.curWPIdx < this.waypoints.length - 2) {
                this.curWPIdx++;
                var curModelQuaternion = new THREE.Quaternion().copy(this.model.quaternion);
                this.model.lookAt(this.waypoints[this.curWPIdx + 1]);
                var newModelQuaternion = new THREE.Quaternion().copy(this.model.quaternion);
                this.model.quaternion.copy(curModelQuaternion);

                new TWEEN.Tween(this.model.quaternion)
                .to({ x: newModelQuaternion.x, y: newModelQuaternion.y, z: newModelQuaternion.z, w: newModelQuaternion.w }, this.speed * 0.85)
                .easing(TWEEN.Easing.Linear.None)
                .start();

                var passedPathPercent = this.curWPIdx / (this.waypoints.length - 2);

                var xOffset = passedPathPercent;

                if (this.initObj.addXOffset) {
                    if (passedPathPercent > this.initObj.addXOffset.offestPath) {
                        xOffset += this.initObj.addXOffset.offsetPos;
                    }
                }

                new TWEEN.Tween(this.material.map.offset)
                .to({ x: xOffset }, this.speed)
                .easing(TWEEN.Easing.Linear.None)
                .start();

                if (this.model.visible) this.animate();
            } else {
                if (this.model.visible) this.start();
            }
        })
        .start();
    }

    getWorldPosition(obj) {
        var worldPosition = new THREE.Vector3();

        this.context.vLabScene.updateMatrixWorld();
        obj.updateMatrixWorld();
        worldPosition.setFromMatrixPosition(obj.matrixWorld);

        return worldPosition;
    }
}