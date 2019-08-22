'use strict'
import './css/index.css';
import './css/emotion-simple.css';
import 'lab.js/dist/lab.css';
import CameraModule from './js/camera';
import ExperimentModule from './js/experiment';
import FileModule from './js/fileModule';
import { resultModule } from './js/resultModule';

const emotionsFromFaceStore = resultModule();

let fileMod = FileModule(emotionsFromFaceStore);
fileMod.setDropbox();

let camera = CameraModule(fileMod);
camera.initializeCamera();

let experiment = ExperimentModule(camera, emotionsFromFaceStore);
experiment.startExperiment();
