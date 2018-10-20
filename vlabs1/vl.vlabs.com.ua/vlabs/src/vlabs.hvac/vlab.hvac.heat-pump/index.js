import * as THREE                   from 'three';

import VlabHVACBaseHeatPump         from './vlabHVACBaseHeatPump';

let vLabHVACHeatPump = new VlabHVACBaseHeatPump({
    name: "HVACBaseHeatPump",
    natureURL: "./resources/heat-pump-nature.json",
    webGLRendererClearColor: 0xb7b7b7,
});
