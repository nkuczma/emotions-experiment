const lab = require('lab.js/dist/lab.dev.js');
import { resultModule } from './resultModule.js';
import { welcomeScreen, loopWithEmotionsSimpleWidget, loopWithValenceArousaleWidget } from './experimentScreens.js';


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
    const store = resultModule();
    const welcome = welcomeScreen();
    const loopSimple = loopWithEmotionsSimpleWidget(images, store);
    const loopArousal = loopWithValenceArousaleWidget(images, store);
    

    experiment = new lab.flow.Sequence({ content: [ loopSimple, loopArousal ]});
    experiment.on('end', () => {
      store.downloadResult();
    });
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