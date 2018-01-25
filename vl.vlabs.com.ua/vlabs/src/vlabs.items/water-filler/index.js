import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';

var self = undefined;

export default class WaterFiller {
    constructor(initObj) {
        self = this;
        this.initObj = initObj;
        this.initialize();
    }

    initialize() {
        this.geometry = new THREE.PlaneBufferGeometry(0.2, 0.2, this.initObj.ws, this.initObj.hs);
        this.geometry.lookAt(new THREE.Vector3(0.0, 1.0, 0.0));
        this.geometry.dynamic = true;
        this.material = new THREE.MeshBasicMaterial({
            color: 0xffff00, 
            side: THREE.FrontSide,
            wireframe: true
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(this.initObj.pos);

        this.initObj.context.vLabScene.add(this.mesh);
        // this.mesh.visible = false;
        this.exctractOuterInnerPointsIdx();


        // for (var i = 0; i < this.outerPointsIdx.length; i++) {
        //     this.geometry.attributes.position.array[this.outerPointsIdx[i][1]] += 0.1
        // }
        // for (var i = 0; i < this.innerPointsIdx.length; i++) {
        //     this.geometry.attributes.position.array[this.innerPointsIdx[i][1]] += 0.1
        // }
    }

    exctractOuterInnerPointsIdx() {
        this.outerPointsIdx = [];
        this.innerPointsIdx = [];
        for (var hi = 0; hi < this.initObj.hs + 1; hi++)
        {
            if (hi == 0) { // top outer
                for (var wi = 0; wi < this.initObj.ws * 3 + 3;) {
                    var ppa = [];
                    ppa.push(wi + 0);
                    ppa.push(wi + 1);
                    ppa.push(wi + 2);
                    this.outerPointsIdx.push(ppa);
                    wi += 3;
                }
            } else if (hi == this.initObj.hs) { // bottom outer
                for (var wi = 0; wi < this.initObj.ws * 3 + 3;) {
                    var ppa = [];
                    ppa.push((this.initObj.ws + 1) * 3 * hi + wi + 0);
                    ppa.push((this.initObj.ws + 1) * 3 * hi + wi + 1);
                    ppa.push((this.initObj.ws + 1) * 3 * hi + wi + 2);
                    this.outerPointsIdx.push(ppa);
                    wi += 3;
                }
            } else { // sides outer
                var ppa = [];
                ppa.push((this.initObj.ws + 1) * 3 * hi + 0);
                ppa.push((this.initObj.ws + 1) * 3 * hi + 1);
                ppa.push((this.initObj.ws + 1) * 3 * hi + 2);
                this.outerPointsIdx.push(ppa);

                // inner
                var innerLineStartIndex = (this.initObj.ws + 1) * 3 * hi + 2;
                for (var li = 0; li < this.initObj.ws * 3 - 3;) {
                    var ppa = [];
                    for (var ipi = innerLineStartIndex + 1 + li; ipi <= innerLineStartIndex + li + 3; ipi++) {
                        ppa.push(ipi);
                    }
                    li += 3;
                    this.innerPointsIdx.push(ppa);
                }

                var ppa = [];
                ppa.push((this.initObj.ws + 1) * 3 * hi + this.initObj.ws * 3 + 0);
                ppa.push((this.initObj.ws + 1) * 3 * hi + this.initObj.ws * 3 + 1);
                ppa.push((this.initObj.ws + 1) * 3 * hi + this.initObj.ws * 3 + 2);
                this.outerPointsIdx.push(ppa);
            }
        }
        // console.log(this.outerPointsIdx);
        // console.log(this.innerPointsIdx);
    }

    start() {
        this.mesh.visible = true;
        addEventListener("redererFrameEvent",  self.onRedererFrameEvent);
    }

    stop() {
        removeEventListener("redererFrameEvent", this.onRedererFrameEvent);
    }
}