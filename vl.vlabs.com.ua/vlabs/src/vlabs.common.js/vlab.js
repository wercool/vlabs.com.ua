import { Scene } from 'three';

export default class VLab {

    constructor() {
        var scene = new Scene();
        console.log(scene);
    }

    getVesrion() {
        return "0.0.1";
    }
}