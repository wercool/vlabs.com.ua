import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import VLabControls from './vlab.controls'

/**
 * VLab Orbit Controls.
 * @class
 * @classdesc VLab Orbit Controls class handles VLab camera orbiting, dollying (zooming), and panning.
 * Orbit - left mouse / touch: one finger move
 * Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
 * Pan - right mouse, or arrow keys / touch: three finter swipe
 */
class VLabOrbitControls extends VLabControls {
    /**
     * VLabOrbitControls constructor.
     * @constructor
     * @param {VLabScene} vLabScene                         - VLabScene instance
     */
    constructor(vLabScene) {
        super(vLabScene);
        this.STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };
        this.state = this.STATE.NONE;

        this.target = new THREE.Vector3(0.0, 0.0, 0.0);

        // Set to false to disable rotating
        this.enableRotate = true;
        this.rotateSpeed = 0.5;

        // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
        // Set to false to disable zooming
        this.enableZoom = true;
        this.zoomSpeed = 0.25;

        // Set to false to disable panning
        this.enablePan = true;
        this.keyPanSpeed = 2.0;	// pixels moved per arrow key push

        // How far you can orbit horizontally, upper and lower limits.
        // If set, must be a sub-interval of the interval [-Math.PI, Math.PI].
        this.minAzimuthAngle = -Infinity; // radians
        this.maxAzimuthAngle = Infinity; // radians

        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        this.minPolarAngle = 0.0; // radians
        this.maxPolarAngle = Math.PI; // radians

        // How far you can dolly in and out ( PerspectiveCamera only )
        this.minDistance = this.vLabScene.currentCamera.near;
        this.maxDistance = this.vLabScene.currentCamera.far;

        this.lastPosition = new THREE.Vector3();
        this.lastQuaternion = new THREE.Quaternion();

        this.dumperPosMin = 1e-15;
        this.dumperPosMax = 1.0;

        this.reset();
    }
    /**
     * VLabControls enable abstract function implementation.
     *
     * @memberof VLabOrbitControls {@link VLabControls#update}
     */
    enable() {
        this.enabled = true;
    }
    /**
     * VLabControls disable abstract function implementation.
     *
     * @memberof VLabOrbitControls {@link VLabControls#update}
     */
    disable() {
        this.enabled = false;
     }
    /**
     * VLabControls setTarget abstract function implementation.
     * @memberof VLabOrbitControls {@link VLabControls#update}
     */
    setTarget(target, duration = 1000) {
        new TWEEN.Tween(this.target)
        .to({x: target.x, y: target.y, z: target.z}, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            this.update();
        })
        .onComplete(() => {
            this.update();
        })
        .start();
    }
    /**
     * VLabControls update abstract function implementation.
     *
     * @memberof VLabOrbitControls {@link VLabControls#update}
     */
    update() {
        /**
         * Update dumper (do not update if this.clock.getDelta() is too small, touch interface glitch)
         */
        let delta = this.clock.getDelta();
        if (delta < 0.01) return;

        this.active = true;

        var offset = new THREE.Vector3();
        // camera.up is the orbit axis
        var quat = new THREE.Quaternion().setFromUnitVectors(this.vLabScene.currentCamera.up, new THREE.Vector3(0, 1, 0));
        var quatInverse = quat.clone().inverse();
        var position = this.vLabScene.currentCamera.position;
        offset.copy(position).sub(this.target);

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat);
        // angle from z-axis around y-axis
        this.spherical.setFromVector3(offset);

        this.spherical.theta += this.sphericalDelta.theta;
        this.spherical.phi += this.sphericalDelta.phi;

        // restrict theta to be between desired limits
        this.spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.spherical.theta));

        // restrict phi to be between desired limits
        this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));

        this.spherical.makeSafe();

        this.spherical.radius *= this.scale;

        // restrict radius to be between desired limits
        this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));

        // move target to panned location
        this.target.add(this.panOffset);

        offset.setFromSpherical(this.spherical);

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse);

        let newPos = new THREE.Vector3().copy(position).copy(this.target).add(offset);
        let posDelta = this.lastPosition.distanceToSquared(newPos);
        if (posDelta > this.dumperPosMin && posDelta < this.dumperPosMax || this.lastPosition.equals(new THREE.Vector3())) {
            position.copy(newPos);
            this.vLabScene.currentCamera.lookAt(this.target);
        }

        this.sphericalDelta.set(0, 0, 0);

        this.scale = 1.0;
        this.panOffset.set(0, 0, 0);

        this.lastPosition.copy(this.vLabScene.currentCamera.position);
        this.lastQuaternion.copy(this.vLabScene.currentCamera.quaternion);
    }
    /**
     * Sets this.state = this.STATE.NONE
     *
     * @memberof VLabOrbitControls
     */
    suppress () {
        this.state = this.STATE.NONE;
        this.active = false;
    }
    /**
     * Resets controls
     */
    reset() {
        this.scale = 1.0;
        this.panOffset = new THREE.Vector3();

        this.rotateStart = new THREE.Vector2();
        this.rotateEnd = new THREE.Vector2();
        this.rotateDelta = new THREE.Vector2();

        this.dollyStart = new THREE.Vector2();
        this.dollyEnd = new THREE.Vector2();
        this.dollyDelta = new THREE.Vector2();

        this.panStart = new THREE.Vector2();
        this.panEnd = new THREE.Vector2();
        this.panDelta = new THREE.Vector2();

        // current position in spherical coordinates
        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();

        this.lastPosition = new THREE.Vector3();
        this.lastQuaternion = new THREE.Quaternion();
    }
    /** 
     * rotating across whole screen goes 360 degrees around
     * @memberof VLabOrbitControls
     */
    rotateLeft(angle) {
        this.sphericalDelta.theta -= angle;
    }
    /**
     * rotating up and down along whole screen attempts to go 360, but limited to 180
     * @memberof VLabOrbitControls
     */
    rotateUp(angle) {
        this.sphericalDelta.phi -= angle;
    }
    /**
     * Dolly camera In
     */
    dollyIn() {
        this.scale *= Math.pow(0.95, this.zoomSpeed);
    }
    /**
     * Dolly camera Out
     */
    dollyOut() {
        this.scale /= Math.pow(0.95, this.zoomSpeed);
    }
    /**
     * Pan camera horizontal
     */
    panLeft(distance, cameraMatrix) {
        let v = new THREE.Vector3();
        v.setFromMatrixColumn(cameraMatrix, 0); // get X column of objectMatrix
        v.multiplyScalar(-distance);
        this.panOffset.add(v);
    }
    /**
     * Pan camera vertical
     */
    panUp(distance, cameraMatrix) {
        let v = new THREE.Vector3();
        v.setFromMatrixColumn(cameraMatrix, 1); // get X column of objectMatrix
        v.multiplyScalar(distance);
        this.panOffset.add(v);
    }
    /**
     * mousedown event type handler, invoked from {@link VLabSceneManager#onDefaultEventListener}
     * @memberof VLabOrbitControls
     */
    mousedownHandler(event) {
        this.dumperPosMax = Infinity;
        if (!event.ctrlKey) {
            if (this.enabled) {
                switch (event.button) {
                    case this.MOUSEBUTTONS.ORBIT:
                        if (this.enableRotate) {
                            this.rotateStart.set(event.clientX, event.clientY);
                            this.state = this.STATE.ROTATE;
                        }
                    break;
                    case this.MOUSEBUTTONS.ZOOM:
                        if (this.enableZoom) {
                            this.dollyStart.set(event.clientX, event.clientY);
                            this.state = this.STATE.DOLLY;
                        }
                    break;
                    case this.MOUSEBUTTONS.PAN:
                        if (this.enablePan) {
                            this.panStart.set(event.clientX, event.clientY);
                            this.state = this.STATE.PAN;
                        }
                    break;
                }
            }
        }
    }
    /**
     * mouseup event type handler, invoked from {@link VLabSceneManager#onDefaultEventListener}
     * @memberof VLabOrbitControls
     */
    mouseupHandler(event) {
        this.state = this.STATE.NONE;
        this.active = false;
    }
    /**
     * mousemove event type handler, invoked from {@link VLabSceneManager#onDefaultEventListener}
     * @memberof VLabOrbitControls
     */
    mousemoveHandler(event) {
        if (this.enabled) {
            switch (this.state) {
                case this.STATE.ROTATE:
                    if (this.enableRotate) {
                        this.rotateEnd.set(event.clientX, event.clientY);
                        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
                        this.rotateLeft(2 * Math.PI * this.rotateDelta.x / event.target.clientWidth * this.rotateSpeed);
                        this.rotateUp(2 * Math.PI * this.rotateDelta.y / event.target.clientHeight * this.rotateSpeed);
                        this.rotateStart.copy(this.rotateEnd);
                        this.update();
                    }
                break;
                case this.STATE.DOLLY:
                    if (this.enableZoom) {
                        this.dollyEnd.set(event.clientX, event.clientY);
                        this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);
                        if (this.dollyDelta.y > 0) {
                            this.dollyOut();
                        } else if (this.dollyDelta.y < 0) {
                            this.dollyIn();
                        }
                        this.dollyStart.copy(this.dollyEnd);
                        this.update();
                    }
                break;
                case this.STATE.PAN:
                    if (this.enablePan) {
                        this.panEnd.set(event.clientX, event.clientY);
                        this.panDelta.subVectors(this.panEnd, this.panStart);

                        let offset = new THREE.Vector3();
                        let position = this.vLabScene.currentCamera.position;
                        offset.copy(position).sub(this.target);
                        let targetDistance = offset.length();
                        // half of the fov is center to top of screen
                        targetDistance *= Math.tan((this.vLabScene.currentCamera.fov / 2) * Math.PI / 180.0);
                        this.panLeft(2 * this.panDelta.x * targetDistance / this.vLabScene.vLab.WebGLRendererCanvas.clientWidth, this.vLabScene.currentCamera.matrix);
                        this.panUp(2 * this.panDelta.y * targetDistance / this.vLabScene.vLab.WebGLRendererCanvas.clientHeight, this.vLabScene.currentCamera.matrix );
                        this.panStart.copy(this.panEnd);
                        this.update();
                    }
                break;
            }
        }
    }
    /**
     * touchstart event type handler, invoked from {@link VLabSceneManager#onDefaultEventListener}
     * @memberof VLabOrbitControls
     */
    touchstartHandler(event) {
        if (this.enabled) {
            switch (event.touches.length) {
                // one-fingered touch: rotate
                case 1:
                    if (this.enableRotate) {
                        this.rotateStart.set(event.touches[0].clientX, event.touches[0].clientY);
                        this.state = this.STATE.TOUCH_ROTATE;
                    }
                break;
                // two-fingered touch: dolly
                case 2:
                    if (this.enableZoom) {
                        let dx = event.touches[0].clientX - event.touches[1].clientX;
                        let dy = event.touches[0].clientY - event.touches[1].clientY;
                        let distance = Math.sqrt(dx * dx + dy * dy);
                        this.dollyStart.set(0, distance);
                        this.state = this.STATE.TOUCH_DOLLY;
                    }
                break;
            }
        }
    }
    /**
     * touchend event type handler, invoked from {@link VLabSceneManager#onDefaultEventListener}
     * @memberof VLabOrbitControls
     */
    touchendHandler(event) {
        this.state = this.STATE.NONE;
        this.active = false;
    }
    /**
     * touchmove event type handler, invoked from {@link VLabSceneManager#onDefaultEventListener}
     * @memberof VLabOrbitControls
     */
    touchmoveHandler(event) {
        if (this.enabled) {
            switch (event.touches.length) {
                // one-fingered touch: rotate
                case 1:
                    if (this.enableRotate && this.STATE.TOUCH_ROTATE) {
                        this.rotateEnd.set(event.touches[0].clientX, event.touches[0].clientY);
                        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
                        this.rotateLeft(2 * Math.PI * this.rotateDelta.x / event.target.clientWidth * this.rotateSpeed);
                        this.rotateUp(2 * Math.PI * this.rotateDelta.y / event.target.clientHeight * this.rotateSpeed);
                        this.rotateStart.copy(this.rotateEnd);
                        this.update();
                    }
                break;
                // // two-fingered touch: dolly
                case 2:
                    if (this.enableZoom && this.STATE.TOUCH_DOLLY) {
                        let dx = event.touches[0].clientX - event.touches[1].clientX;
                        let dy = event.touches[0].clientY - event.touches[1].clientY;
                        let distance = Math.sqrt(dx * dx + dy * dy);
                        this.dollyEnd.set(0, distance);
                        this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);
                        if (this.dollyDelta.y > 0) {
                            this.dollyIn();
                        } else if (this.dollyDelta.y < 0) {
                            this.dollyOut();
                        }
                        this.dollyStart.copy(this.dollyEnd);
                        this.update();
                    }
                break;
            }
        }
    }
}
export default VLabOrbitControls;