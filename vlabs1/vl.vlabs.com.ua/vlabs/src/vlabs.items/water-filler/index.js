import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';

export default class WaterFiller {
    constructor(initObj) {
        this.initObj = initObj;
        this.context = this.initObj.context;
        this.initialize();
    }

    initialize() {
        this.geometry = new THREE.PlaneBufferGeometry(this.initObj.w, this.initObj.h, this.initObj.whs, this.initObj.whs);
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

    prepareVerticesTuples() {
        this.verticesTuples = [];
        for (var i = 0; i < this.geometry.attributes.position.array.length; i++) {
            this.verticesTuples.push({
                'vpi': [i++, i++, i],
                'dir': undefined
            });
        }

        // this.concentricContours = [];
        // var c = 0;
        // var n = this.initObj.whs;
        // while (true) {
        //     var angle = -Math.PI / 4;
        //     this.concentricContours.push([]);
        //     /* > */
        //     for (var i = this.initObj.whs * c + 2 * c; i < c * this.initObj.whs + n + 2 * c; i++) {
        //         this.verticesTuples[i].dir = new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize();
        //         this.concentricContours[c].push(this.verticesTuples[i]);
        //         angle -= (Math.PI / 2) / n;
        //     }
        //     /* v */
        //     for (var i = this.initObj.whs * c + this.initObj.whs; i < Math.pow(this.initObj.whs, 2) - this.initObj.whs * c + n + this.initObj.whs; i += n + 1 + c * 2) {
        //         this.verticesTuples[i].dir = new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize();
        //         this.concentricContours[c].push(this.verticesTuples[i]);
        //         angle -= (Math.PI / 2) / n;
        //     }
        //     /* < */
        //     for (var i = Math.pow(this.initObj.whs, 2) - this.initObj.whs * c + n + this.initObj.whs; i > Math.pow(this.initObj.whs, 2) - this.initObj.whs * c + n + this.initObj.whs - n; i--) {
        //         this.verticesTuples[i].dir = new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize();
        //         this.concentricContours[c].push(this.verticesTuples[i]);
        //         angle -= (Math.PI / 2) / n;
        //     }
        //     /* ^ */
        //     for (var i = Math.pow(this.initObj.whs, 2) + this.initObj.whs - this.initObj.whs * c; i > (this.initObj.whs + 2) * c; i -= this.initObj.whs + 1) {
        //         this.verticesTuples[i].dir = new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize();
        //         this.concentricContours[c].push(this.verticesTuples[i]);
        //         angle -= (Math.PI / 2) / n;
        //     }
        //     c++;
        //     n -= 2;
        //     if (n < 2) break;
        // }

        this.concentricContours = [];
        var n = this.initObj.whs + 1;
        var nc = n - 1;
        var angle = -Math.PI / 4;
        for (var c = 0; true; c++) {
            if (nc < 2) break;
            var idx = c * (n + 1);
            this.concentricContours.push([]);
            /* > */
            for (var i = 0; i < nc; i++) {
                this.verticesTuples[idx].dir = new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize();
                this.concentricContours[c].push(this.verticesTuples[idx]);
                idx++;
                angle -= (Math.PI / 2) / nc;
            }
            /* v */
            for (var i = 0; i < nc; i++) {
                this.verticesTuples[idx].dir = new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize();
                this.concentricContours[c].push(this.verticesTuples[idx]);
                idx += n;
                angle -= (Math.PI / 2) / nc;
            }
            /* < */
            for (var i = 0; i < nc; i++) {
                this.verticesTuples[idx].dir = new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize();
                this.concentricContours[c].push(this.verticesTuples[idx]);
                idx--;
                angle -= (Math.PI / 2) / nc;
            }
            /* ^ */
            for (var i = 0; i < nc; i++) {
                this.verticesTuples[idx].dir = new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize();
                this.concentricContours[c].push(this.verticesTuples[idx]);
                idx -= n;
                angle -= (Math.PI / 2) / nc;
            }
            nc -= 2;
        }
    }

    conformFillableSpace() {
        this.fillableSpaceRaycaster = new THREE.Raycaster();

        this.arrowHelpers = [];

        this.mesh.updateMatrixWorld();

        for (var c = 0; c < this.concentricContours.length; c++) {
            var contour = this.concentricContours[c];
            for (var i = 0; i < contour.length; i++) {
                var vgp = new THREE.Vector3(
                    this.geometry.attributes.position.array[contour[i].vpi[0]],
                    this.geometry.attributes.position.array[contour[i].vpi[1]],
                    this.geometry.attributes.position.array[contour[i].vpi[2]]
                ).applyMatrix4(this.mesh.matrixWorld);
    
                this.fillableSpaceRaycaster.set(vgp, contour[i].dir);
                var intersects = this.fillableSpaceRaycaster.intersectObject(this.initObj.fillableObj);
    
                if (intersects.length > 0) {
                    var bouindigVertexPos = this.mesh.worldToLocal(intersects[0].point);
                    this.geometry.attributes.position.array[contour[i].vpi[0]] = bouindigVertexPos.x * (1 - (c / this.concentricContours.length));
                    this.geometry.attributes.position.array[contour[i].vpi[1]] = bouindigVertexPos.y;
                    this.geometry.attributes.position.array[contour[i].vpi[2]] = bouindigVertexPos.z * (1 - (c / this.concentricContours.length));
    
                    // var arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3());
                    // arrowHelper.setColor(new THREE.Color(0x00ff00));
                    // this.initObj.context.vLabScene.add(arrowHelper);
                    // arrowHelper.position.copy(vgp);
                    // arrowHelper.setDirection(contour[i].dir);
                    // arrowHelper.setLength(intersects[0].distance, 0.02, 0.005);
                }
    
            }
        }

        this.geometry.attributes.position.needsUpdate = true;
    }

    start() {
        this.mesh.visible = true;
        this.prepareVerticesTuples();
        this.conformFillableSpace();

        //VLab events subscribers
        this.context.webGLContainerEventsSubcribers.renderframe["WaterFiller" + this.initObj.name + "vLabSceneRenderFrame"] = 
        {
            callback: this.onRedererFrameEvent,
            instance: this
        };
    }

    stop() {
        delete this.context.webGLContainerEventsSubcribers.renderframe["WaterFiller" + this.initObj.name + "vLabSceneRenderFrame"];
    }

    onRedererFrameEvent(event) {

    }
}