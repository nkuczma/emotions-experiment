const lab = require('lab.js/dist/lab.dev.js');
import { resultModule } from './resultModule.js';
import { userModule } from './userModule.js';
import { welcomeScreen, loopWithEmotionsSimpleWidget, loopWithValenceArousaleWidget, getUserDataScreen } from './experimentScreens.js';
let pairs = require('./pairs/pairs.json');

// function importAll(r) {
//   return r.keys().map(r).map((image, i) => { 
//     return {image: image, value: i, imageName: r.keys()[i]}; 
//   });
// }

function experimentModule() {
  
  const random = new lab.util.Random();
  // const imagesList = importAll(require.context('./../assets/img', false, /\.(png|jpe?g|svg)$/));
  // const images = random.shuffle(imagesList);
  
  let experiment;

  function startExperiment() {
    const user = userModule();
    //najpierw pobranie danych uzytkownika, aby mozna bylo zapisywac jego id w wynikach
    const getUser = new lab.flow.Sequence({ content: [getUserDataScreen(user.setUserData)] });
    getUser.run();
    getUser.on('end', () => {
      runExperiment(user)
    });
  }
  
  function runExperiment(user) {
    const store = resultModule();

    const pairs = getPairs();
    console.log(pairs);

    const welcome = welcomeScreen();
    const loopSimple = loopWithEmotionsSimpleWidget(pairs.firstPart, store, user.getUserData());
    const loopArousal = loopWithValenceArousaleWidget(pairs.secondPart, store, user.getUserData());
    const widgetOrder = random.shuffle([loopSimple, loopArousal]);

    experiment = new lab.flow.Sequence({ content:  widgetOrder });
    experiment.on('end', () => {
      store.downloadResult();
      user.downloadUserData();
    });

    experiment.run();
    getPairs();
  }
  

  function getPairs() {
    let pairsShuffled = random.shuffle(pairs);
    let half = Math.floor(pairsShuffled.length / 2)
    let firstPart = pairsShuffled.slice(0, half);
    let secondPart = pairsShuffled.slice(half, pairsShuffled.length);
    return { firstPart, secondPart };
  }

  return { 
    startExperiment 
  }

}

export default experimentModule;