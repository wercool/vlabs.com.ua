import * as THREE from 'three';
import * as VLabUtils from '../../../vlab.fwk/utils/vlab.utils';
import * as THREEUtils from '../../../vlab.fwk/utils/three.utils';
/*<dev>*/
var TransformControls = require('three-transform-ctrls');
/*</dev>*/
/**
 * Valter IK class.
 * @class
 * @classdesc Valter The Robot IK methods.
 */
class ValterIK {
    /**
     * Initializtion
     * @param {*} initObj 
     */
    constructor(initObj) {
        this.Valter = initObj.Valter;

        this.vLab = this.Valter.vLab;

        this.helperDragRaycaster = new THREE.Raycaster();

        this.headYawLinkOriginObject3D = new THREE.Object3D();
        this.headYawLinkOriginObject3D.position.copy(this.Valter.headYawLink.position.clone());
        this.Valter.torsoFrame.add(this.headYawLinkOriginObject3D);

        /**
         * Head target
         */
        this.setupHeadTarget();
    }

    setupHeadTargetDirectionFromHeadYawLinkOrigin() {
        /*<dev>*/
        if (this.Valter.kinectHeadDirectionArrowHelperDirection !== undefined) {
            let geometry = new THREE.SphereBufferGeometry(0.015, 8, 8);
            let material = new THREE.MeshBasicMaterial({color: 0x00ff00});
            this.headDirectionTargetObject3D = new THREE.Object3D();
            this.headDirectionTargetObject3D.position.copy(this.Valter.kinectHeadDirectionArrowHelperDirection);
            this.Valter.kinectHead.add(this.headDirectionTargetObject3D);

            this.headDirectionTarget = new THREE.Mesh(geometry, material);
            this.headDirectionTarget.position.copy(this.headDirectionTargetObject3D.position.clone());
            this.Valter.kinectHead.add(this.headDirectionTarget);

            this.Valter.baseFrame.updateMatrixWorld();
            this.headDirectionTargetGlobalPosition = this.Valter.kinectHead.localToWorld(this.headDirectionTargetObject3D.position.clone());
            let headYawLinkHeadTargetLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.headDirectionTargetGlobalPosition.clone());
            let headYawLinkHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(headYawLinkHeadTargetLocalPos);
            this.headDirectionTargetFromHeadYawLinkArrowHelper = new THREE.ArrowHelper(headYawLinkHeadTargetLocalPos.clone().normalize(), new THREE.Vector3(0.0, 0.0, 0.0), headYawLinkHeadTargetDistance, 0xff00ff, 0.02, 0.01);
            this.headYawLinkOriginObject3D.add(this.headDirectionTargetFromHeadYawLinkArrowHelper);

            let headYawLinkOriginObject3DAxis = new TransformControls(this.vLab.SceneDispatcher.currentVLabScene.currentCamera, this.vLab.WebGLRendererCanvas);
            headYawLinkOriginObject3DAxis.setSize(1.0);
            headYawLinkOriginObject3DAxis.setSpace('local');
            headYawLinkOriginObject3DAxis.enabled = false;
            this.vLab.SceneDispatcher.currentVLabScene.add(headYawLinkOriginObject3DAxis);
            headYawLinkOriginObject3DAxis.attach(this.headYawLinkOriginObject3D);
        }
        /*</dev>*/
    }

    updateHeadTargetDirectionFromHeadYawLinkOrigin() {
        /*<dev>*/
        if (this.Valter.nature.devHelpers.showKinectHeadDirection == true) {
            this.Valter.baseFrame.updateMatrixWorld();
            this.headDirectionTargetGlobalPosition = this.Valter.kinectHead.localToWorld(this.headDirectionTargetObject3D.position.clone());

            let headYawLinkHeadTargetLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.headDirectionTargetGlobalPosition.clone());
            let headYawLinkHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(headYawLinkHeadTargetLocalPos);
            this.headYawLinkHeadTargetDirection = headYawLinkHeadTargetLocalPos.clone().normalize();
            this.headYawLinkHeadTargetDirection = new THREE.Vector3(parseFloat(this.headYawLinkHeadTargetDirection.x.toFixed(3)), parseFloat(this.headYawLinkHeadTargetDirection.y.toFixed(3)), parseFloat(this.headYawLinkHeadTargetDirection.z.toFixed(3)));
            this.headDirectionTargetFromHeadYawLinkArrowHelper.setDirection(this.headYawLinkHeadTargetDirection);
            this.headDirectionTargetFromHeadYawLinkArrowHelper.setLength(headYawLinkHeadTargetDistance, 0.02, 0.01);

            //console.log('headYaw = ' + this.Valter.ValterLinks.headYawLink.value.toFixed(3), 'headTilt = ' + this.Valter.ValterLinks.headTiltLink.value.toFixed(3), this.headYawLinkHeadTargetDirection);
        }
        /*</dev>*/
    }
    setupHeadTarget() {
        /**
         * Head target
         */
        this.Valter.baseFrame.updateMatrixWorld();
        var headTargetObjectGeometry = new THREE.SphereBufferGeometry(0.025, 16, 16);
        var headTargetObjectMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true, wireframeLinewidth: 0.0001, transparent: true, opacity: 0.5 });
        this.headTargetObject = new THREE.Mesh(headTargetObjectGeometry, headTargetObjectMaterial);
        this.headTargetObject.name = 'headTargetObject';
        this.headYawLinkOriginObject3D.add(this.headTargetObject);
        this.vLab.SceneDispatcher.currentVLabScene.addInteractable({
            name: 'headTargetObject',
            intersectable: true,
            preselectable: true,
            action: {
                context: this,
                function: this.headTargetAction,
                manipulator: true,
                activated: true,
                invfunction: this.commonInvAction,
                args: {}
            },
        }).then((headTargetObjectInteractable) => {
            this.headTargetObjectInteractable = headTargetObjectInteractable;
            this.headTargetObjectInteractable.vLabSceneObject.position.copy(new THREE.Vector3(0.0, 0.0, 1.0));

            this.headTargetObjectInteractable.DEV.menu.push(
                {
                    label: 'Get Head Yaw & Tilt IK from VLabsRESTValterHeadIKService',
                    enabled: true,
                    selected: false,
                    icon: '<i class=\"material-icons\">share</i>',
                    action: () => {
                        let headTargetObject = this.headTargetObject.position.clone().normalize();
                        let headTargetDirection = {
                            x: parseFloat(headTargetObject.x.toFixed(3)),
                            y: parseFloat(headTargetObject.y.toFixed(3)),
                            z: parseFloat(headTargetObject.z.toFixed(3))
                        };
                        console.log('getHeadFKTuple REQUEST:');
                        console.log(headTargetDirection);
                        this.vLab.VLabsRESTClientManager.ValterHeadIKService.getHeadFKTuple(headTargetDirection)
                        .then(valterHeadFKTuples => {
                            console.log('getHeadFKTuple RESULT:');
                            console.log(valterHeadFKTuples);
                            if (valterHeadFKTuples.length > 0) {
                                let minDistanceTuple = valterHeadFKTuples[0];
                                let minDistanceTupleTargetPos = new THREE.Vector3().set(
                                    minDistanceTuple.headTargetDirection.x,
                                    minDistanceTuple.headTargetDirection.y,
                                    minDistanceTuple.headTargetDirection.z
                                );
                                let minDistance = minDistanceTupleTargetPos.distanceTo(headTargetDirection);
                                valterHeadFKTuples.forEach((valterHeadFKTuple) => {
                                    let minDistanceTupleTargetPos = new THREE.Vector3().set(
                                        valterHeadFKTuple.headTargetDirection.x,
                                        valterHeadFKTuple.headTargetDirection.y,
                                        valterHeadFKTuple.headTargetDirection.z
                                    );
                                    if (minDistanceTupleTargetPos.distanceTo(headTargetDirection) < minDistance) {
                                        minDistanceTuple = valterHeadFKTuple;
                                        minDistanceTupleTargetPos = new THREE.Vector3().set(
                                            minDistanceTuple.headTargetDirection.x,
                                            minDistanceTuple.headTargetDirection.y,
                                            minDistanceTuple.headTargetDirection.z
                                        );
                                    }
                                });

                                console.log('getHeadFKTuple SELECTED:');
                                console.log(minDistanceTuple);

                                this.Valter.setHeadYawLink(minDistanceTuple.headYawLinkValue);
                                this.Valter.setHeadTiltLink(minDistanceTuple.headTiltLinkValue);
                            }
                        });
                    }
                }
            );

            if (this.Valter.nature.devHelpers.showHeadTargetDirectionFromHeadYawLinkOrigin) {
                let headYawLinkHeadTargetLocalPos = this.headTargetObject.position.clone();
                let headYawLinkHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(headYawLinkHeadTargetLocalPos);
                this.headTargetDirectionFromYawLinkOriginArrowHelper = new THREE.ArrowHelper(headYawLinkHeadTargetLocalPos.normalize(), new THREE.Vector3(0.0, 0.0, 0.0), headYawLinkHeadTargetDistance, 0xff00ff, 0.02, 0.01);
                this.headYawLinkOriginObject3D.add(this.headTargetDirectionFromYawLinkOriginArrowHelper);
            }
        });
    }
    headTargetAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);
        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLab.WebGLRendererCanvas.style.cursor = 'move';

            if (this.headTargetObjectPrevGlobalPosition != undefined) {
                var newHeadTargetObjectPos = this.headTargetObject.position.clone();
            }

            if (event.event.ctrlKey == true) {
                let shiftY = 0.005 * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1);
                var newHeadTargetObjectPos = this.headTargetObject.position.clone();
                newHeadTargetObjectPos.y += shiftY;
            } else {
                let rect = this.vLab.WebGLRendererCanvas.getBoundingClientRect();
                let x = (currentActionInitialEventCoords.x - rect.left) / rect.width;
                let y = (currentActionInitialEventCoords.y - rect.top) / rect.height;
                var pointerVector = new THREE.Vector2();
                pointerVector.set((x * 2) - 1, -(y * 2) + 1);
                this.helperDragRaycaster.setFromCamera(pointerVector, this.vLab.SceneDispatcher.currentVLabScene.currentCamera);
                let intersections = this.helperDragRaycaster.intersectObjects([this.Valter.helperDragXZPlane], true);
                if (intersections[0]) {
                    let intersectionPoint = intersections[0].point.clone();
                    if (this.headTargetObjectPrevGlobalPosition == undefined) {
                        this.headTargetObjectPrevGlobalPosition = this.headYawLinkOriginObject3D.localToWorld(this.headTargetObject.position.clone());
                        this.prevHeadTargetObjectOffest = intersectionPoint;
                        return;
                    } else {
                            intersectionPoint.sub(this.prevHeadTargetObjectOffest);
                            let dragPosition = this.headTargetObjectPrevGlobalPosition.clone();
                            intersectionPoint.multiplyScalar(0.5);
                            dragPosition.add(intersectionPoint);

                            if (dragPosition.distanceTo(this.Valter.baseFrame.position) < 3.0) {
                                let localDragPos = this.headYawLinkOriginObject3D.worldToLocal(dragPosition.clone());
                                newHeadTargetObjectPos.x = localDragPos.x;
                                newHeadTargetObjectPos.z = localDragPos.z;
                            }
                    }
                }
            }

            if (newHeadTargetObjectPos != undefined) {
                let headYawLinkHeadTargetLocalPos = newHeadTargetObjectPos.clone();
                let headYawLinkHeadTargetDir = headYawLinkHeadTargetLocalPos.clone().normalize();
    
                if (headYawLinkHeadTargetDir.clone().dot(new THREE.Vector3(0.0, 0.0, 1.0)) < 0.1) {
                    newHeadTargetObjectPos = this.headYawLinkOriginObject3D.worldToLocal(this.headTargetObjectPrevGlobalPosition.clone());
                    this.headTargetObjectPrevGlobalPosition = undefined;
                    this.vLab.WebGLRendererCanvas.style.cursor = 'default';
                    newHeadTargetObjectPos.copy(this.headTargetObjectLastSetPosition);
                } else {
                    this.headTargetObjectLastSetPosition = new THREE.Vector3().copy(newHeadTargetObjectPos.clone());
                }
    
                this.headTargetObject.position.copy(newHeadTargetObjectPos);
    
                if (this.Valter.nature.devHelpers.showHeadTargetDirectionFromHeadYawLinkOrigin) {
                    let headYawLinkHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(newHeadTargetObjectPos);
                    this.headTargetDirectionFromYawLinkOriginArrowHelper.setDirection(headYawLinkHeadTargetDir);
                    this.headTargetDirectionFromYawLinkOriginArrowHelper.setLength(headYawLinkHeadTargetDistance, 0.02, 0.01);
                }
            }
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }

    commonInvAction() {
        this.headTargetObjectPrevGlobalPosition = undefined;
        this.vLab.WebGLRendererCanvas.style.cursor = 'default';
        this.vLab.SceneDispatcher.currentVLabScene.currentControls.enable();
    }
}
export default ValterIK;