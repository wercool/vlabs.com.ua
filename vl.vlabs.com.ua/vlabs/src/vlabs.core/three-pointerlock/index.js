/**
 * @author mrdoob / http://mrdoob.com/
 * Source: https://github.com/mrdoob/three.js/blob/master/examples/js/controls/PointerLockControls.js
 *
 * Adopted to common js by Javier Zapata
 */

module.exports = function ( camera ) {

  var THREE = window.THREE || require('three');

  var scope = this;

  var curCameraQuaternion = camera.quaternion.clone();
  camera.rotation.set( 0, 0, 0 );

  this.lockCamera = false;

  var pitchObject = new THREE.Object3D();
  pitchObject.name = "CameraPitchObject";
  pitchObject.add( camera );

  var yawObject = new THREE.Object3D();
  yawObject.name = "CameraYawObject";
  yawObject.add( pitchObject );
  yawObject.position.copy(camera.position.clone());
  camera.position.set( 0, 0, 0 );

  yawObject.quaternion.y = curCameraQuaternion.y;
  pitchObject.quaternion.x = curCameraQuaternion.x;

  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;

  var prevTime = performance.now();

  var velocity = new THREE.Vector3();

  var PI_2 = Math.PI / 2;

  var onMouseMove = function ( event ) {

    if ( scope.enabled === false || scope.lockCamera ) return;

    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    yawObject.rotation.y -= movementX * 0.003;
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

      case 32: // whitespace
        var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
        if (havePointerLock) {
          var element = document.body;
          element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
          element.requestPointerLock();
        }
        break;

      case 17: // left ctrl
        scope.lockCamera = true;
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

      case 17: // left ctrl
        scope.lockCamera = false;
        break;
    }

  };

  var onMouseDown = function ( event ) {
    if (event.buttons == 1) {
      exitPointerLock();
    }
  }

  var exitPointerLock  = function (){
    if (document.pointerLockElement === document.body || document.mozPointerLockElement === document.body || document.webkitPointerLockElement == document.body) {
      var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
      if (havePointerLock) {
        document.exitPointerLock = document.exitPointerLock || document.mozexitPointerLock || document.webkitexitPointerLock;
        document.exitPointerLock();
      }
    }
  }

  document.addEventListener( 'mousemove', onMouseMove, false );
  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );
  document.addEventListener( 'mousedown', onMouseDown, false );

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

    var time = performance.now();

    if (!scope.lockCamera) {
      var delta = ( time - prevTime ) / 1000;

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      if ( moveForward ) velocity.z -= 50.0 * delta;
      if ( moveBackward ) velocity.z += 50.0 * delta;

      if ( moveLeft ) velocity.x -= 50.0 * delta;
      if ( moveRight ) velocity.x += 50.0 * delta;

      yawObject.translateX( velocity.x * delta );
      yawObject.translateY( velocity.y * delta );
      yawObject.translateZ( velocity.z * delta );
    }

    prevTime = time;
  };

  this.dispose = function() {
    exitPointerLock();
    document.removeEventListener( 'mousemove', onMouseMove, false );
    document.removeEventListener( 'keydown', onKeyDown, false );
    document.removeEventListener( 'keyup', onKeyUp, false );
    document.removeEventListener( 'mousedown', onMouseDown, false );
  }
};
