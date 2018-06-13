import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';

export default class GasFlow {
    constructor(initObj) {
        this.initObj = initObj;
        this.context = this.initObj.context;

        this.initialize();
    }

    initialize() {
        console.log('GasFlow ' + this.initObj.name + ' initialized');
    }
}