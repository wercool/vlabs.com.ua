import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';

export default class DirectionalFlow {
    constructor(initObj) {
        this.initObj = initObj;
        this.context = this.initObj.context;
        this.tubes = this.initObj.tubes;

        this.arrows = [];

        this.initialize();
    }

    initialize() {

        this.tooltipPlacer = document.createElement('div');
        this.tooltipPlacer.id = this.initObj.name + 'Tooltip';
        this.tooltipPlacer.className = 'tooltip';
        this.context.container.appendChild(this.tooltipPlacer);
        this.tooltipPlacer.style.display = 'none';

        for (var t = 0; t < this.tubes.length; t++) {
            var tube = this.tubes[t].tube;
            var cSectionVertices = this.tubes[t].cSectionVertices;

            var verticesTuples = [];

            tube.updateMatrixWorld();

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

            if (this.tubes[t].reversed) cSectionCenters.reverse();

            var waypoints = [];
            for (var c = 0; c < cSectionCenters.length; c++) {
                var waypoint = new THREE.Object3D();
                waypoint.position.copy(cSectionCenters[c]);
                tube.add(waypoint);
                waypoints.push(waypoint);
            }
            for (var w = 0; w < waypoints.length; w++) {
                if (w == 0) {
                    var arrowOrigin = this.getWorldPosition(waypoints[w]);
                    var arrowDir = this.getWorldPosition(waypoints[w]).sub(this.getWorldPosition(waypoints[w + 1])).negate().normalize();
                    var arrowLength =  this.getWorldPosition(waypoints[w]).distanceTo( this.getWorldPosition(waypoints[w + 1]));
                } else {
                    var arrowOrigin = this.getWorldPosition(waypoints[w - 1]);
                    var arrowDir = this.getWorldPosition(waypoints[w - 1]).sub(this.getWorldPosition(waypoints[w])).negate().normalize();
                    var arrowLength =  this.getWorldPosition(waypoints[w - 1]).distanceTo( this.getWorldPosition(waypoints[w]));
                }
                arrowLength = arrowLength > 0.1 ? 0.1 : arrowLength;
                var arrowHelper = new THREE.ArrowHelper(arrowDir, arrowOrigin, arrowLength, this.initObj.color ? this.initObj.color : 0xffffff, 0.3 * arrowLength, 0.01);
                arrowHelper.line.material.depthTest = false;
                arrowHelper.line.material.linewidth = 2;
                arrowHelper.cone.material.depthTest = false;
                arrowHelper.visible = false;
                this.context.vLabScene.add(arrowHelper);
                this.arrows.push(arrowHelper);
            }
            if (this.tubes[t].reference) {
                this.context.vLabScene.remove(tube);
            }
        }
    }

    start(resumed = false) {
        this.arrowIdx = 0;
        this.started = true;
        if (this.initObj.tooltip) {
            this.tooltipPlacer.style.display = 'block';
        }
        if (!resumed) this.animate();
    }

    stop() {
        this.started = false;
        for (var i = 0; i < this.arrows.length; i++) {
            this.arrows[i].visible = false;
        }
        this.tooltipPlacer.innerText = "";
        this.tooltipPlacer.style.left = '0px';
        this.tooltipPlacer.style.top = '0px';
        this.tooltipPlacer.style.display = 'none';
    }

    animate() {
        if (this.context.paused) {
            this.paused = true;
            this.stop();
            setTimeout(this.animate.bind(this), 250);
            return;
        }
        if (this.paused) {
            this.paused = false;
            this.start(true);
        }
        if (!this.started) {
            this.stop();
            return;
        }
        this.arrows[this.arrowIdx].visible = false;
        if (this.arrowIdx < this.arrows.length - 1) {
            this.arrowIdx++;
        } else {
            this.arrowIdx = 0;
        }
        this.arrows[this.arrowIdx].visible = true;

        if (this.initObj.tooltip) {
            var screenPos = this.context.toScreenPosition(this.arrows[this.arrowIdx]);
            this.tooltipPlacer.innerHTML = this.initObj.tooltip;
            this.tooltipPlacer.style.left = screenPos.x + 'px';
            this.tooltipPlacer.style.top = screenPos.y + 5 + 'px';
        }

        setTimeout(this.animate.bind(this), this.initObj.animationDelay);
    }

    getWorldPosition(obj) {
        var worldPosition = new THREE.Vector3();

        this.context.vLabScene.updateMatrixWorld();
        obj.updateMatrixWorld();
        worldPosition.setFromMatrixPosition(obj.matrixWorld);

        return worldPosition;
    }
}