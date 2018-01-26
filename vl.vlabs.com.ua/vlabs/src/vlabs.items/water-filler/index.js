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
        this.geometry = new THREE.PlaneBufferGeometry(this.initObj.w, this.initObj.h, this.initObj.ws, this.initObj.hs);
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
    }

    exctractOuterInnerPointsIdx() {
        var outerPointsIdx = [];
        this.innerPointsIdx = [];
        for (var hi = 0; hi < this.initObj.hs + 1; hi++)
        {
            if (hi == 0) { // top corner
                for (var wi = 0; wi < this.initObj.ws * 3 + 3;) {
                    var ppa = [];
                    ppa.push(wi + 0);
                    ppa.push(wi + 1);
                    ppa.push(wi + 2);
                    outerPointsIdx.push(ppa);
                    wi += 3;
                }
            } else if (hi == this.initObj.hs) { // bottom corner
                for (var wi = 0; wi < this.initObj.ws * 3 + 3;) {
                    var ppa = [];
                    ppa.push((this.initObj.ws + 1) * 3 * hi + wi + 0);
                    ppa.push((this.initObj.ws + 1) * 3 * hi + wi + 1);
                    ppa.push((this.initObj.ws + 1) * 3 * hi + wi + 2);
                    outerPointsIdx.push(ppa);
                    wi += 3;
                }
            } else { // sides outer
                var ppa = [];
                ppa.push((this.initObj.ws + 1) * 3 * hi + 0);
                ppa.push((this.initObj.ws + 1) * 3 * hi + 1);
                ppa.push((this.initObj.ws + 1) * 3 * hi + 2);
                outerPointsIdx.push(ppa);

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
                outerPointsIdx.push(ppa);
            }
        }
        this.outerPoints = [];
        //rearrange outerPointsIdx
        /* T */
        var angle = -Math.PI / 4;
        for (var i = 0; i <= this.initObj.ws; i++) {
            this.outerPoints.push({
                'vpi': outerPointsIdx[i],
                'dir': new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize()
            });
            angle -= (Math.PI / 2) / this.initObj.ws;
        }
        /* R */
        var r = 0;
        for (var i = this.initObj.ws + 1; i < this.initObj.ws + this.initObj.hs * 2; i++) {
            if (r++ == 1) {
                this.outerPoints.push({
                    'vpi': outerPointsIdx[i],
                    'dir': new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize()
                });
                angle -= (Math.PI / 2) / this.initObj.hs;
                r = 0;
            }
        }
        /* B */
        for (var i = outerPointsIdx.length - 1; i > outerPointsIdx.length - 2 - this.initObj.ws; i--) {
            this.outerPoints.push({
                'vpi': outerPointsIdx[i],
                'dir': new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize()
            });
            angle -= (Math.PI / 2) / this.initObj.ws;
        }
        /* L */
        r = 0;
        var swp = [];
        for (var i = this.initObj.ws + 1; i < this.initObj.ws + this.initObj.hs * 2 - 1; i++) {
            if (r++ == 0) {
                swp.push(i);
            } else r = 0;
        }
        for (var ri = swp.length - 1; ri >= 0; ri--) {
            this.outerPoints.push({
                'vpi': outerPointsIdx[swp[ri]],
                'dir': new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize()
            });
            angle -= (Math.PI / 2) / this.initObj.hs;
        }
    }

    conformFillableSpace() {
        this.fillableSpaceRaycaster = new THREE.Raycaster();

        this.arrowHelpers = [];

        this.mesh.updateMatrixWorld();

        for (var i = 0; i < this.innerPointsIdx.length; i++) {
            this.geometry.attributes.position.array[this.innerPointsIdx[i][0]] *= 1.5;
            this.geometry.attributes.position.array[this.innerPointsIdx[i][1]] += 0.01;
            this.geometry.attributes.position.array[this.innerPointsIdx[i][2]] *= 1.5;
        }

        for (var i = 0; i < this.outerPoints.length; i++) {
            var vgp = new THREE.Vector3(
                this.geometry.attributes.position.array[this.outerPoints[i].vpi[0]],
                this.geometry.attributes.position.array[this.outerPoints[i].vpi[1]],
                this.geometry.attributes.position.array[this.outerPoints[i].vpi[2]]
            ).applyMatrix4(this.mesh.matrixWorld);

            this.fillableSpaceRaycaster.set(vgp, this.outerPoints[i].dir);
            var intersects = this.fillableSpaceRaycaster.intersectObject(this.initObj.fillableObj);

            if (intersects.length > 0) {
                var vconformedpos = this.mesh.worldToLocal(intersects[0].point);
                this.geometry.attributes.position.array[this.outerPoints[i].vpi[0]] = vconformedpos.x;
                this.geometry.attributes.position.array[this.outerPoints[i].vpi[1]] = vconformedpos.y;
                this.geometry.attributes.position.array[this.outerPoints[i].vpi[2]] = vconformedpos.z;

                // var arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3());
                // arrowHelper.setColor(new THREE.Color(0x00ff00));
                // this.initObj.context.vLabScene.add(arrowHelper);
                // arrowHelper.position.copy(vgp);
                // arrowHelper.setDirection(this.outerPoints[i].dir);
                // arrowHelper.setLength(intersects[0].distance, 0.02, 0.005);
            }

        }
        this.geometry.attributes.position.needsUpdate = true;
    }

    start() {
        this.mesh.visible = true;
        this.exctractOuterInnerPointsIdx();
        this.conformFillableSpace();
        addEventListener("redererFrameEvent",  self.onRedererFrameEvent);
    }

    stop() {
        removeEventListener("redererFrameEvent", this.onRedererFrameEvent);
    }
}