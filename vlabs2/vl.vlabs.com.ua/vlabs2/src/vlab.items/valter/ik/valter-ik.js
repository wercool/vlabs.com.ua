import * as THREE from 'three';
import * as VLabUtils from '../../../vlab.fwk/utils/vlab.utils';
import * as ANNUtils from '../../../vlab.fwk/utils/ann.utils';
import * as tf from '@tensorflow/tfjs';
/**
 * Valter models
 */
import ValterHeadFKTuple from './model/valter-head-fk-tuple';

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

        this.valterHeadIKTFModel = undefined;

        if (this.Valter.nature.ANNIK.headANNIK) {
            tf.loadLayersModel('localstorage://valter-head-ik-model')
            .then((model) => {
                this.valterHeadIKTFModel = model;
            })
            .catch(error => {
                console.error(error.message);
            });
        }

        /**
         * Head target setup
         */
        this.setupHeadTarget();

        /**
         * Right palm setup
         */
        this.setupRightPalmTarget();
        /**
         * Left palm setup
         */
        this.setupLeftPalmTarget();
    }

    setupHeadTargetDirectionFromHeadYawLinkOrigin(distance = 0.4) {
        /*<dev>*/
        if (this.Valter.kinectHeadDirection !== undefined) {
            this.headDirectionTargetDistance = distance;
            this.headDirectionTargetObject3D = new THREE.Object3D();
            this.headDirectionTargetObject3D.position.copy(this.Valter.kinectHeadDirection.clone().multiplyScalar(this.headDirectionTargetDistance));
            this.Valter.kinectHead.add(this.headDirectionTargetObject3D);

            let geometry = new THREE.SphereBufferGeometry(0.015, 8, 8);
            let material = new THREE.MeshBasicMaterial({color: 0x00ff00});
            this.headDirectionTarget = new THREE.Mesh(geometry, material);
            this.headDirectionTarget.position.copy(this.headDirectionTargetObject3D.position.clone());
            this.Valter.kinectHead.add(this.headDirectionTarget);

            this.Valter.baseFrame.updateMatrixWorld();
            this.headDirectionTargetGlobalPosition = this.Valter.kinectHead.localToWorld(this.headDirectionTargetObject3D.position.clone());
            this.headYawLinkHeadTargetLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.headDirectionTargetGlobalPosition.clone());
            let headYawLinkHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(this.headYawLinkHeadTargetLocalPos);
            this.headDirectionTargetFromHeadYawLinkArrowHelper = new THREE.ArrowHelper(this.headYawLinkHeadTargetLocalPos.clone().normalize(), new THREE.Vector3(0.0, 0.0, 0.0), headYawLinkHeadTargetDistance, 0xff00ff, 0.02, 0.01);
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
            this.headDirectionTargetObject3D.position.copy(this.Valter.kinectHeadDirection.clone().multiplyScalar(this.headDirectionTargetDistance));
            this.headDirectionTarget.position.copy(this.headDirectionTargetObject3D.position.clone());

            this.Valter.kinectHeadDirectionArrowHelper.setLength(this.headDirectionTargetDistance, 0.02, 0.01);

            this.Valter.baseFrame.updateMatrixWorld();
            this.headDirectionTargetGlobalPosition = this.Valter.kinectHead.localToWorld(this.headDirectionTargetObject3D.position.clone());

            this.headYawLinkHeadTargetLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.headDirectionTargetGlobalPosition.clone());
            this.headYawLinkHeadTargetLocalPos = new THREE.Vector3(parseFloat(this.headYawLinkHeadTargetLocalPos.x.toFixed(3)), parseFloat(this.headYawLinkHeadTargetLocalPos.y.toFixed(3)), parseFloat(this.headYawLinkHeadTargetLocalPos.z.toFixed(3)));
            let headYawLinkHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(this.headYawLinkHeadTargetLocalPos);
            this.headYawLinkHeadTargetDirection = this.headYawLinkHeadTargetLocalPos.clone().normalize();
            this.headYawLinkHeadTargetDirection = new THREE.Vector3(parseFloat(this.headYawLinkHeadTargetDirection.x.toFixed(3)), parseFloat(this.headYawLinkHeadTargetDirection.y.toFixed(3)), parseFloat(this.headYawLinkHeadTargetDirection.z.toFixed(3)));
            this.headDirectionTargetFromHeadYawLinkArrowHelper.setDirection(this.headYawLinkHeadTargetDirection);
            this.headDirectionTargetFromHeadYawLinkArrowHelper.setLength(headYawLinkHeadTargetDistance, 0.02, 0.01);
        }
        /*</dev>*/
    }

    /**
     * 
     * 
     * Head FK tuples
     * 
     * 
     */
    getValterHeadFKTuples() {
        /*<dev>*/
        if (this.Valter.nature.devHelpers.showKinectHeadDirection == true) {

            this.setValterHeadYaw = this.setValterHeadYaw.bind(this);
            this.setValterHeadTilt = this.setValterHeadTilt.bind(this);
            this.setValterHeadDistance = this.setValterHeadDistance.bind(this);
            this.persistHeadTargetPosition = this.persistHeadTargetPosition.bind(this);

            this.Valter.ValterLinks.headYawLink.step = 0.1;
            this.Valter.ValterLinks.headTiltLink.step = 0.1;
            this.headDirectionTargetDistance_step = 0.25;

            this.Valter.setHeadYawLink(this.Valter.ValterLinks.headYawLink.min);
            this.Valter.setHeadTiltLink(this.Valter.ValterLinks.headTiltLink.min);

            this.setValterHeadYaw();
        } else {
            console.error('To get Valter Head FK tuples set Valter.nature.devHelpers.showKinectHeadDirection = true');
        }
        /*</dev>*/
    }
    setValterHeadYaw() {
        /*<dev>*/
        if (this.Valter.ValterLinks.headYawLink.value < this.Valter.ValterLinks.headYawLink.max + this.Valter.ValterLinks.headYawLink.step) {
            this.setValterHeadTilt();
        }
        /*</dev>*/
    }
    setValterHeadTilt() {
        /*<dev>*/
        if (this.Valter.ValterLinks.headTiltLink.value < this.Valter.ValterLinks.headTiltLink.max + this.Valter.ValterLinks.headTiltLink.step) {
            this.setValterHeadDistance();
        } else {
            this.Valter.ValterLinks.headTiltLink.value = this.Valter.ValterLinks.headTiltLink.min;

            this.Valter.ValterLinks.headYawLink.value += this.Valter.ValterLinks.headYawLink.step;
            this.setValterHeadYaw();
            this.Valter.setHeadYawLink(this.Valter.ValterLinks.headYawLink.value);
            this.updateHeadTargetDirectionFromHeadYawLinkOrigin();
        }
        /*</dev>*/
    }
    setValterHeadDistance() {
        /*<dev>*/
        if (this.headDirectionTargetDistance < 3.0) {
            this.persistHeadTargetPosition();
        } else {
            this.headDirectionTargetDistance = 0.4;
            this.Valter.ValterLinks.headTiltLink.value += this.Valter.ValterLinks.headTiltLink.step;
            this.setValterHeadTilt();
            this.Valter.setHeadTiltLink(this.Valter.ValterLinks.headTiltLink.value);
            this.updateHeadTargetDirectionFromHeadYawLinkOrigin();
        }
        /*</dev>*/
    }
    persistHeadTargetPosition() {
        /*<dev>*/
        this.updateHeadTargetDirectionFromHeadYawLinkOrigin();

        let headFKTuple = new ValterHeadFKTuple();
        headFKTuple.headTargetPosition.x = this.headYawLinkHeadTargetLocalPos.x;
        headFKTuple.headTargetPosition.y = this.headYawLinkHeadTargetLocalPos.y;
        headFKTuple.headTargetPosition.z = this.headYawLinkHeadTargetLocalPos.z;
        headFKTuple.headYawLinkValue = parseFloat(this.Valter.ValterLinks.headYawLink.value.toFixed(3));
        headFKTuple.headTiltLinkValue = parseFloat(this.Valter.ValterLinks.headTiltLink.value.toFixed(3));

        this.vLab.VLabsRESTClientManager.ValterHeadIKService.saveHeadFKTuple(headFKTuple)
        .then(result => {
            console.log('headYaw = ' + this.Valter.ValterLinks.headYawLink.value.toFixed(3), 'headTilt = ' + this.Valter.ValterLinks.headTiltLink.value.toFixed(3), this.headYawLinkHeadTargetLocalPos, this.headDirectionTargetDistance.toFixed(3));

            this.headDirectionTargetDistance += this.headDirectionTargetDistance_step;
            this.setValterHeadDistance();
        });
        /*</dev>*/
    }

    /**
     * 
     * 
     * Head target
     * 
     * 
     */
    setupHeadTarget() {
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

            /*<dev>*/
            this.headTargetObjectInteractable.DEV.menu.push(
                {
                    label: 'Get Head Yaw & Tilt IK from VLabsRESTValterHeadIKService',
                    enabled: true,
                    selected: false,
                    icon: '<i class=\"material-icons\">share</i>',
                    action: () => {
                        let headTargetObject = this.headTargetObject.position.clone();
                        console.log(headTargetObject);
                        let headTargetPosition = {
                            x: parseFloat(headTargetObject.x.toFixed(3)),
                            y: parseFloat(headTargetObject.y.toFixed(3)),
                            z: parseFloat(headTargetObject.z.toFixed(3))
                        };
                        console.log('getHeadFKTuple REQUEST:');
                        console.log(headTargetPosition);
                        this.vLab.VLabsRESTClientManager.ValterHeadIKService.getHeadFKTuple(headTargetPosition)
                        .then(valterHeadFKTuples => {
                            console.log('getHeadFKTuple RESULT:');
                            console.log(valterHeadFKTuples);
                            if (valterHeadFKTuples.length > 0) {

                                let minDistanceTuple = valterHeadFKTuples[0];
                                let curTupleTargetPos = new THREE.Vector3().set(
                                    minDistanceTuple.headTargetPosition.x,
                                    minDistanceTuple.headTargetPosition.y,
                                    minDistanceTuple.headTargetPosition.z
                                );
                                let minDistance = curTupleTargetPos.distanceToSquared(headTargetPosition);
                                valterHeadFKTuples.forEach((valterHeadFKTuple) => {
                                    curTupleTargetPos =  new THREE.Vector3().set(
                                        valterHeadFKTuple.headTargetPosition.x,
                                        valterHeadFKTuple.headTargetPosition.y,
                                        valterHeadFKTuple.headTargetPosition.z
                                    );
                                    let distance = curTupleTargetPos.distanceToSquared(headTargetPosition);
                                    if (distance < minDistance) {
                                        minDistance = distance;
                                        minDistanceTuple = valterHeadFKTuple;
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

            this.headTargetObjectInteractable.DEV.menu.push(
                {
                    label: 'Get ALL Head Yaw & Tilt FK points from VLabsRESTValterHeadIKService',
                    enabled: true,
                    selected: false,
                    icon: '<i class=\"material-icons\">grain</i>',
                    action: () => {
                        let headFKPointsMaterial = new THREE.PointsMaterial({ size: 0.01, color: 0xff00ff });
                        let headFKPointsGeometry = new THREE.Geometry();
                        this.vLab.VLabsRESTClientManager.ValterHeadIKService.getAllHeadFKTuples()
                        .then(valterHeadFKTuples => {
                            valterHeadFKTuples.forEach(valterHeadFKTuple => {
                                let point = new THREE.Vector3().set(valterHeadFKTuple.headTargetPosition.x, valterHeadFKTuple.headTargetPosition.y, valterHeadFKTuple.headTargetPosition.z);
                                headFKPointsGeometry.vertices.push(point);
                            });
                            this.headFKPoints = new THREE.Points(headFKPointsGeometry, headFKPointsMaterial);
                            this.headYawLinkOriginObject3D.add(this.headFKPoints);
                        });
                    }
                }
            );
            /*</dev>*/

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
    
                if (headYawLinkHeadTargetDir.clone().dot(new THREE.Vector3(0.0, 0.0, 1.0)) < 0.225) {
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

                if (this.Valter.nature.ANNIK.headANNIK && this.valterHeadIKTFModel !== undefined) {

                    let headNormalizationBounds = this.Valter.nature.ANNIK.headFKTuplesNormalizationBounds;

                    let nHeadTargetX = ANNUtils.normalizeNegPos(this.headTargetObject.position.x, headNormalizationBounds.headTargetPositionXMin, headNormalizationBounds.headTargetPositionXMax);
                    let nHeadTargetY = ANNUtils.normalizeNegPos(this.headTargetObject.position.y, headNormalizationBounds.headTargetPositionYMin, headNormalizationBounds.headTargetPositionYMax);
                    let nHeadTargetZ = ANNUtils.normalizeNegPos(this.headTargetObject.position.z, headNormalizationBounds.headTargetPositionZMin, headNormalizationBounds.headTargetPositionZMax);

                    const valterHeadYawTiltPreditction = this.valterHeadIKTFModel.predict(tf.tensor([nHeadTargetX, nHeadTargetY, nHeadTargetZ], [1, 3]));
                    const valterHeadYawTiltPreditctionData = valterHeadYawTiltPreditction.dataSync();
                    const valterHeadYawPreditctionValue = ANNUtils.deNormalizeNegPos(valterHeadYawTiltPreditctionData[0], headNormalizationBounds.headYawLinkValueMin, headNormalizationBounds.headYawLinkValueMax);
                    const valterHeadTiltPreditctionValue = ANNUtils.deNormalizeNegPos(valterHeadYawTiltPreditctionData[1], headNormalizationBounds.headTiltLinkValueMin, headNormalizationBounds.headTiltLinkValueMax);

                    // console.log('[' + this.headTargetObject.position.x.toFixed(3) + ', ' + this.headTargetObject.position.y.toFixed(3) + ', ' + this.headTargetObject.position.z.toFixed(3) + '] -> [' + valterHeadYawPreditctionValue.toFixed(3) +', ' + valterHeadTiltPreditctionValue.toFixed(3) + ']');

                    this.Valter.setHeadYawLink(valterHeadYawPreditctionValue);
                    this.Valter.setHeadTiltLink(valterHeadTiltPreditctionValue);
                }
            }
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }

    /**
     * 
     * 
     * Right palm target
     * 
     * 
     */
    setupRightPalmTarget() {
        this.Valter.baseFrame.updateMatrixWorld();
        var rightPalmTargetObjectGeometry = new THREE.SphereBufferGeometry(0.025, 16, 16);
        var rightPalmTargetObjectMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, wireframeLinewidth: 0.0001, transparent: true, opacity: 0.5 });
        this.rightPalmTargetObject = new THREE.Mesh(rightPalmTargetObjectGeometry, rightPalmTargetObjectMaterial);
        this.rightPalmTargetObject.name = 'rightPalmTargetObject';
        this.headYawLinkOriginObject3D.add(this.rightPalmTargetObject);

        this.rightPalmTargetGlobalPosition = this.Valter.rightPalm.localToWorld(new THREE.Vector3());
        this.headYawLinkRightPalmTargetLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.rightPalmTargetGlobalPosition.clone());
        this.rightPalmTargetObject.position.copy(this.headYawLinkRightPalmTargetLocalPos);
    }

    setupRightPalmTargetDirectionFromHeadYawLinkOrigin() {
        /*<dev>*/
        this.Valter.baseFrame.updateMatrixWorld();
        let headYawLinkRightPalmDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(this.headYawLinkRightPalmTargetLocalPos);
        this.rightPalmFromHeadYawLinkArrowHelper = new THREE.ArrowHelper(this.headYawLinkRightPalmTargetLocalPos.clone().normalize(), new THREE.Vector3(0.0, 0.0, 0.0), headYawLinkRightPalmDistance, 0x00ff00, 0.02, 0.01);
        this.headYawLinkOriginObject3D.add(this.rightPalmFromHeadYawLinkArrowHelper);
        /*</dev>*/
    }


    /**
     * 
     * 
     * Left palm target
     * 
     * 
     */
    setupLeftPalmTarget() {
        this.Valter.baseFrame.updateMatrixWorld();
        var leftPalmTargetObjectGeometry = new THREE.SphereBufferGeometry(0.025, 16, 16);
        var leftPalmTargetObjectMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true, wireframeLinewidth: 0.0001, transparent: true, opacity: 0.5 });
        this.leftPalmTargetObject = new THREE.Mesh(leftPalmTargetObjectGeometry, leftPalmTargetObjectMaterial);
        this.leftPalmTargetObject.name = 'leftPalmTargetObject';
        this.headYawLinkOriginObject3D.add(this.leftPalmTargetObject);

        this.leftPalmTargetGlobalPosition = this.Valter.leftPalm.localToWorld(new THREE.Vector3());
        this.headYawLinkLeftPalmTargetLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.leftPalmTargetGlobalPosition.clone());
        this.leftPalmTargetObject.position.copy(this.headYawLinkLeftPalmTargetLocalPos);
    }

    setupLeftPalmTargetDirectionFromHeadYawLinkOrigin() {
        /*<dev>*/
        this.Valter.baseFrame.updateMatrixWorld();
        let headYawLinkLeftPalmDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(this.headYawLinkLeftPalmTargetLocalPos);
        this.leftPalmFromHeadYawLinkArrowHelper = new THREE.ArrowHelper(this.headYawLinkLeftPalmTargetLocalPos.clone().normalize(), new THREE.Vector3(0.0, 0.0, 0.0), headYawLinkLeftPalmDistance, 0xffff00, 0.02, 0.01);
        this.headYawLinkOriginObject3D.add(this.leftPalmFromHeadYawLinkArrowHelper);
        /*</dev>*/
    }


    commonInvAction() {
        this.headTargetObjectPrevGlobalPosition = undefined;
        this.vLab.WebGLRendererCanvas.style.cursor = 'default';
        this.vLab.SceneDispatcher.currentVLabScene.currentControls.enable();
    }
}
export default ValterIK;