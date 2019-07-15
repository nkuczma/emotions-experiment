'use strict'
import './css/index.css';
import './css/emotion-simple.css';
import 'lab.js/dist/lab.css';
import CameraModule from './js/camera';
import ExperimentModule from './js/experiment';


console.log("I'm alive");

let cam = CameraModule();
// cam.initializeCamera();

let experiment = ExperimentModule();
experiment.initializeExperiment();
experiment.startExperiment();