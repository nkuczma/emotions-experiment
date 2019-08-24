const lab = require('lab.js/dist/lab.dev.js');
import { resultModule } from './resultModule.js';
import { userModule } from './userModule.js';
import { welcomeScreen, goodbyeScreen, loopWithEmotionsSimpleWidget, loopWithValenceArousaleWidget, gameScreen, getUserDataScreen } from './experimentScreens.js';
let pairs = require('./pairs/pairs.json');


function experimentModule(camera, fileModule) {
  
  const random = new lab.util.Random();
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
    const emotionsFromFaceStore = resultModule();

    const pairs = getPairs();

    const welcome = welcomeScreen();
    const goodbye = goodbyeScreen();

    const loopSimple = loopWithEmotionsSimpleWidget(pairs.firstPart, store, emotionsFromFaceStore, user.getUserData(), camera);
    const loopArousal = loopWithValenceArousaleWidget(pairs.secondPart, store, emotionsFromFaceStore, user.getUserData(), camera);
    const widgetOrder = random.shuffle([loopSimple, loopArousal]);

    const gameSpace = gameScreen("space-shooter-affective://space-shooter-host", camera, emotionsFromFaceStore);
    const gameFreud = gameScreen("freud-me-out-affective://freud-me-out-host", camera, emotionsFromFaceStore);

    //glowny eksperyment
    experiment = new lab.flow.Sequence({ content:  [ welcome, widgetOrder[0], gameSpace, widgetOrder[1], gameFreud, goodbye ]});
    experiment.on('end', () => {
      // store.downloadResult();
      // emotionsFromFaceStore.downloadResult();
      // user.downloadUserData();
      let userId = user.getUserData().id;
      fileModule.pushFileToDropbox(store.exportCsv(), `${userId}_experiment-result.csv`);
      fileModule.pushFileToDropbox(emotionsFromFaceStore.exportCsv(), `${userId}_emotions-result.csv`);
      fileModule.pushFileToDropbox(user.exportCsv(), `${userId}_user-data.csv`);
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