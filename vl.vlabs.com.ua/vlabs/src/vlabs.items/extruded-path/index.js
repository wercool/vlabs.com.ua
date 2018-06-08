import * as THREE           from 'three';

var TransformControls       = require('../../vlabs.core/three-transformcontrols/index');

export default class ExtrudedPath {
    constructor(initObj) {
        this.initObj = initObj;
        this.context = this.initObj.context;
        this.name = this.initObj.name;

        this.parent = this.initObj.addToObject ? this.initObj.addToObject : this.context.vLabScene;

        this.material = new THREE.MeshLambertMaterial({
            color: (this.initObj.color !== undefined) ? this.initObj.color : 0xffffff,
            depthTest: (this.initObj.depthTest !== undefined) ? this.initObj.depthTest : true
        });
    }

    setPath(pathObj) {
        this.path = new THREE.CatmullRomCurve3(pathObj.path);
        this.geometry = new THREE.TubeGeometry(this.path, 30, 0.0018, 6, false);

        if (this.mesh === undefined) {
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.name = this.name + 'Mesh';
            this.parent.add(this.mesh);
        } else {
            this.mesh.geometry = this.geometry;
            this.mesh.geometry.verticesNeedUpdate = true;
        }
    }

    devPath(devPathObj){
        var self = this;
        this.waypoints = [];

        var geometry = new THREE.SphereBufferGeometry(0.004, 10, 10);
        var material = new THREE.MeshLambertMaterial({
            color: 0x0000ff
        });

        //start pos
        var waypoint = new THREE.Mesh(geometry, material);
        waypoint.position.copy(devPathObj.startPos);
        this.waypoints.push(waypoint);
        this.parent.add(waypoint);

        var wpPos = devPathObj.startPos.clone();
        for (var i = 0; i < devPathObj.waypointsNum; i++) {
            var waypoint = new THREE.Mesh(geometry, material);
            wpPos.y += 0.05;
            waypoint.position.copy(wpPos);
            this.waypoints.push(waypoint);
        }

        //end pos
        waypoint = new THREE.Mesh(geometry, material);
        waypoint.position.copy(devPathObj.endPos);
        this.waypoints.push(waypoint);
        this.parent.add(waypoint);

        for (var i = 1; i < this.waypoints.length - 1; i++) {
            this.parent.add(this.waypoints[i]);
            var manipulationControl = new TransformControls(this.context.defaultCamera, this.context.webGLRenderer.domElement);
            manipulationControl.setSize(0.5);
            manipulationControl.attach(this.waypoints[i]);
            this.parent.add(manipulationControl);
            manipulationControl.addEventListener("change", function(){
                var pathFromWP = [];
                for (var i = 0; i < self.waypoints.length; i++) {
                    pathFromWP.push(self.waypoints[i].position.clone());
                }
                self.setPath({path: pathFromWP});
            });
        }

        var pathFromWP = [];
        for (var i = 0; i < this.waypoints.length; i++) {
            pathFromWP.push(this.waypoints[i].position.clone());
        }
        this.setPath({path: pathFromWP});

        document.addEventListener("keydown", (event)=>{
            switch (event.keyCode) {
                case 13: // Enter
                    console.log(this.name + ' path: ');
                    var pathLength = 0.0;
                    var pathStringified = '';
                    for (var i = 0; i < this.waypoints.length; i++) {
                        pathStringified += 'new THREE.Vector3(' + this.waypoints[i].position.x.toFixed(3) + ', ' +  this.waypoints[i].position.y.toFixed(3) + ', ' +  this.waypoints[i].position.z.toFixed(3) + '),\n';
                        if (i > 0) {
                            pathLength += this.waypoints[i - 1].position.distanceTo(this.waypoints[i].position);
                        }
                    }
                    console.log('Length: ' + pathLength.toFixed(3));
                    console.log(pathStringified);
                break;
            }
        }, false);
    }
}