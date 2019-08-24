'use strict'
import './css/index.css';
import './css/emotion-simple.css';
import 'lab.js/dist/lab.css';
import CameraModule from './js/cameraModule';
import ExperimentModule from './js/experimentModule';
import FileModule from './js/fileModule';


let fileMod = FileModule();
fileMod.setDropbox();

let camera = CameraModule(fileMod);
camera.initializeCamera();

let experiment = ExperimentModule(camera, fileMod);
experiment.startExperiment();
