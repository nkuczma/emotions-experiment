const lab = require('lab.js/dist/lab.dev.js');
import { resultModule } from './resultModule.js';
import { userModule } from './userModule.js';
import { welcomeScreen, loopWithEmotionsSimpleWidget, loopWithValenceArousaleWidget } from './experimentScreens.js';
let pairs = require('./pairs/pairs.json');

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
    const user = userModule();
    let pairs = getPairs();
    user.setUserData({ id: 0, age: 21, sex: 'F' });
    const welcome = welcomeScreen();
    const loopSimple = loopWithEmotionsSimpleWidget(images, store, user.getUserData());
    const loopArousal = loopWithValenceArousaleWidget(images, store, user.getUserData());
    getPairs();

    experiment = new lab.flow.Sequence({ content: [ loopArousal ]});
    experiment.on('end', () => {
      store.downloadResult();
    });
  }
  
  function startExperiment() {
    experiment.run();
  }

  function getPairs() {
    console.log(pairs);

  }

  return { 
    initializeExperiment, 
    startExperiment 
  }

}

export default experimentModule;