import * as THREE from 'three';
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


        this.scale = 1.0;
        this.panOffset = new THREE.Vector3();

        this.rotateStart = new THREE.Vector2();
        this.rotateEnd = new THREE.Vector2();
        this.rotateDelta = new THREE.Vector2();

        // current position in spherical coordinates
        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();
    }
    /**
     * VLabControls update abstract function implementation.
     *
     * @memberof VLabOrbitControls {@link VLabControls#update}
     */
    update() {
        var offset = new THREE.Vector3();
        // camera.up is the orbit axis
        var quat = new THREE.Quaternion().setFromUnitVectors(this.vLabScene.currentCamera.up, new THREE.Vector3(0, 1, 0));
        var quatInverse = quat.clone().inverse();
        var lastPosition = new THREE.Vector3();
        var lastQuaternion = new THREE.Quaternion();
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

        position.copy(this.target).add(offset);

        this.vLabScene.currentCamera.lookAt(this.target);

        this.sphericalDelta.set(0, 0, 0);

        this.scale = 1.0;
        this.panOffset.set(0, 0, 0);
    }
    /**
     * Sets this.state = this.STATE.NONE
     *
     * @memberof VLabOrbitControls
     */
    depress () {
        this.state = this.STATE.NONE;
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
     * mousedown event type handler, invoked from {@link VLabSceneManager#onDefaultEventListener}
     * @memberof VLabOrbitControls
     */
    mousedownHandler(event) {
        if (this.enabled) {
            switch (event.button) {
                case this.MOUSEBUTTONS.ORBIT:
                    if (this.enableRotate) {
                        this.rotateStart.set(event.clientX, event.clientY);
                        this.state = this.STATE.ROTATE;
                    }
                break;
            }
        }
    }
    /**
     * mouseup event type handler, invoked from {@link VLabSceneManager#onDefaultEventListener}
     * @memberof VLabOrbitControls
     */
    mouseupHandler(event) {
        this.state = this.STATE.NONE;
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
            }
        }
    }
    /**
     * touchend event type handler, invoked from {@link VLabSceneManager#onDefaultEventListener}
     * @memberof VLabOrbitControls
     */
    touchendHandler(event) {
        this.state = this.STATE.NONE;
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
            }
        }
    }
}
export default VLabOrbitControls;