const lab = require('lab.js/dist/lab.dev.js');
import './experimentScreens.js';
import { mainExperimentScreen, welcomeScreen, loopWithEmotionsSimpleWidget } from './experimentScreens.js';

function importAll(r) {
  return r.keys().map(r).map((image, i) => { 
    return {image: image, value: i, imageName: r.keys()[i]}; 
  });
}

function experimentModule() {
  
  const random = new lab.util.Random();
  const imagesList = importAll(require.context('./../assets/img', false, /\.(png|jpe?g|svg)$/));
  const images = random.shuffle(imagesList);
  
  let experiment;

  function initializeExperiment() {
    const welcome = welcomeScreen();
    const loop = loopWithEmotionsSimpleWidget(images, 'zbadaj reakcje');
    //TODO - dodaj saveResults

    experiment = new lab.flow.Sequence({ content: [ loop ]});
  }
  
  function startExperiment() {
    experiment.run();
  }

  return { 
    initializeExperiment, 
    startExperiment 
  }

}

export default experimentModule;