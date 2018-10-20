import * as THREE                   from 'three';

import VlabHVACBaseAirHandler       from './vlabHVACBaseAirHandler';

let vLabHVACAirHandler = new VlabHVACBaseAirHandler({
    name: "HVACBaseAirHandler",
    natureURL: "./resources/air-handler-nature.json",
    webGLRendererClearColor: 0xb7b7b7,
});