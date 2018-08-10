/**
 * @author mrdoob / http://mrdoob.com/
 * Source: https://github.com/mrdoob/three.js/blob/master/examples/js/controls/PointerLockControls.js
 *
 * Adopted to common js by Javier Zapata
 * Adopted to VLabs  by Alexey Maistrenko
 */
module.exports = function ( camera, scene, vlab) {

  var THREE = window.THREE || require('three');

  var scope = this;

  scope.vlab = vlab;

  var curCameraQuaternion = camera.quaternion.clone();
  var curCameraPosition = camera.position.clone();
  var curCameraDirection = camera.getWorldDirection(new THREE.Vector3());

  camera.rotation.set( 0, 0, 0 );
  camera.position.set( 0, 0, 0 );

  var pitchObject = new THREE.Object3D();
  pitchObject.name = "CameraPitchObject";
  pitchObject.add( camera );

  var yawObject = new THREE.Object3D();
  yawObject.name = "CameraYawObject";
  yawObject.add( pitchObject );
  yawObject.position.copy(curCameraPosition);

  var yaxis = new THREE.Vector3(0, 1, 0);
  var zaxis = new THREE.Vector3(0, 0, 1);
  var direction = zaxis.clone();
  // Apply the camera's quaternion onto the unit vector of one of the axes of our desired rotation plane (the z axis of the xz plane, in this case).
  direction.applyQuaternion(curCameraQuaternion);
  // Project the direction vector onto the y axis to get the y component of the direction.
  var ycomponent = yaxis.clone().multiplyScalar(direction.dot(yaxis));
  // Subtract the y component from the direction vector so that we are left with the x and z components.
  direction.sub(ycomponent);
  // Normalize the direction into a unit vector again.
  direction.normalize();
  // Set the yawObject's quaternion to the rotation required to get from the z axis to the xz component of the camera's direction.
  yawObject.quaternion.setFromUnitVectors(zaxis, direction);

  scene.add(yawObject);

// scope.defaultCameraDirectionArrow = new THREE.ArrowHelper(new THREE.Vector3(), yawObject.position, 1.0, new THREE.Color(0x00ff00));
// scene.add(scope.defaultCameraDirectionArrow);

  pitchObject.quaternion.x = curCameraQuaternion.x;

  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;

  this.active = true;

  var mouseMoved = false;
  var prevMouseX;
  var prevMouseY;

  var prevTime = performance.now();

  var velocity = new THREE.Vector3();

  var PI_2 = Math.PI / 2;

  var onMouseMove = function ( event ) {

    var pointerLocked = false;
    if (document.pointerLockElement === document.body || document.mozPointerLockElement === document.body || document.webkitPointerLockElement == document.body) {
      pointerLocked = true;
    }

    if (scope.enabled === false || !pointerLocked) return;

    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    mouseMoved = false;
    if (prevMouseX != movementX || prevMouseY != movementY)
      mouseMoved = true;

    prevMouseX = movementX;
    prevMouseY = movementY;

    yawObject.rotation.y += ((curCameraDirection.z < 0) ? -1 : 1) * movementX * 0.003;
    pitchObject.rotation.x -= movementY * 0.003;

    pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

  };

  var onKeyDown = function ( event ) {

    switch ( event.keyCode ) {

      case 38: // up
      case 87: // w
        moveForward = true;
      break;

      case 37: // left
      case 65: // a
        moveLeft = true;
      break;

      case 40: // down
      case 83: // s
        moveBackward = true;
      break;

      case 39: // right
      case 68: // d
        moveRight = true;
      break;
    }

  };

  var onKeyUp = function ( event ) {

    switch( event.keyCode ) {

        case 38: // up
        case 87: // w
          moveForward = false;
        break;

        case 37: // left
        case 65: // a
          moveLeft = false;
        break;

        case 40: // down
        case 83: // s
          moveBackward = false;
        break;

        case 39: // right
        case 68: // d
          moveRight = false;
        break;
      }

  };

  this.requestPointerLock = function () {
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if (havePointerLock) {
      var element = document.body;
      element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
      element.requestPointerLock();
    }
  }

  this.exitPointerLock  = function () {
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if (havePointerLock) {
      if (document.pointerLockElement === document.body || document.mozPointerLockElement === document.body || document.webkitPointerLockElement == document.body) {
        document.exitPointerLock = document.exitPointerLock || document.mozexitPointerLock || document.webkitexitPointerLock;
        document.exitPointerLock();
      }
    }
  }

  document.addEventListener( 'mousemove', onMouseMove, false );
  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );

  this.enabled = false;

  this.getObject = function () {

    return yawObject;

  };

  this.getDirection = function() {

    // assumes the camera itself is not rotated

    var direction = new THREE.Vector3( 0, 0, -1 );
    var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

    return function( v ) {

      rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

      v.copy( direction ).applyEuler( rotation );

      return v;

    };

  }();

  this.update = function () {

    if ( scope.enabled === false ) return;

    var pointerLocked = false;
    if (document.pointerLockElement === document.body || document.mozPointerLockElement === document.body || document.webkitPointerLockElement == document.body) {
      pointerLocked = true;
    }

    this.active = false;
    if (moveForward || moveBackward || moveLeft || moveRight || mouseMoved) {
      this.active = true;
    }
    mouseMoved = false;

    var time = performance.now();

    if (!scope.pointerLocked) {
      var delta = ( time - prevTime ) / 1000;

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      if ( moveForward ) velocity.z -= 40.0 * delta;
      if ( moveBackward ) velocity.z += 40.0 * delta;

      if ( moveLeft ) velocity.x -= 40.0 * delta;
      if ( moveRight ) velocity.x += 40.0 * delta;

      yawObject.translateX( velocity.x * delta );
      yawObject.translateZ( velocity.z * delta );
    }

    prevTime = time;
  };

  this.dispose = function() {
    this.exitPointerLock();
    document.removeEventListener( 'mousemove', onMouseMove, false );
    document.removeEventListener( 'keydown', onKeyDown, false );
    document.removeEventListener( 'keyup', onKeyUp, false );
  };

};
