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

        this.concentricContours = [];
        var c = 0;
        var n = this.initObj.whs + 2;
        while (true) {
            var angle = -Math.PI / 4;
            this.concentricContours.push([]);
            n -= 2;
            for (var i = 0; i < n; i++) {
                angle -= (Math.PI / 2) / n;
                this.verticesTuples[i].dir = new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize();
                this.concentricContours[c].push(this.verticesTuples[i]);
            }
            for (var i = 0; i < n; i++) {
                angle -= (Math.PI / 2) / n;
                this.verticesTuples[(i + 1) * n + i].dir = new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize();
                this.concentricContours[c].push(this.verticesTuples[(i + 1) * n + i]);
            }
            c++;
            break;
        }
        // console.log(this.verticesTuples);
        // var i = 7;
        // this.geometry.attributes.position.array[this.verticesTuples[i].vpi[0]] += 0.0;
        // this.geometry.attributes.position.array[this.verticesTuples[i].vpi[1]] += 0.1;
        // this.geometry.attributes.position.array[this.verticesTuples[i].vpi[2]] += 0.0;
        // this.geometry.attributes.position.needsUpdate = true;
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
                    // var vconformedpos = this.mesh.worldToLocal(intersects[0].point);
                    // this.geometry.attributes.position.array[contour[i].vpi[0]] = vconformedpos.x * (1 - c / this.concentricContours.length);
                    // this.geometry.attributes.position.array[contour[i].vpi[1]] = vconformedpos.y;
                    // this.geometry.attributes.position.array[contour[i].vpi[2]] = vconformedpos.z * (1 - c / this.concentricContours.length);
    
                    var arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3());
                    arrowHelper.setColor(new THREE.Color(0x00ff00));
                    this.initObj.context.vLabScene.add(arrowHelper);
                    arrowHelper.position.copy(vgp);
                    arrowHelper.setDirection(contour[i].dir);
                    arrowHelper.setLength(intersects[0].distance, 0.02, 0.005);
                }
    
            }
        }

        this.geometry.attributes.position.needsUpdate = true;
    }

    start() {
        this.mesh.visible = true;
        this.prepareVerticesTuples();
        this.conformFillableSpace();
        addEventListener("redererFrameEvent",  self.onRedererFrameEvent);
    }

    stop() {
        removeEventListener("redererFrameEvent", this.onRedererFrameEvent);
    }
}