const lab = require('lab.js/dist/lab.dev.js');
import { EmotionScale} from './response-widgets/emotion-scale.js';
import { ValenceArousal } from './response-widgets/valence-arousal.js';

let currentTimeOfImage;
let currentTimeOfWidget;
let index = 0;
let user = {};
let intervalForTakingPhotos = 3000;

export function getUserDataScreen(saveUserData) {
  return new lab.flow.Sequence({
    content: [
      new lab.html.Screen({
        content:
          '<div id="form" class="form-group d-flex">' +
          '  <div><label for="id">ID:</label>' +
          '  <input name="id" id="id" required /></div>' +
          '  <div><label for="sex">Płeć:</label>' +
          '  <input name="sex" id="sex" required /><div>' +
          '  <div><label for="age">Age:</label>' +
          '  <input name="age" id="age" required /><div>' +
          '  <button id="submit" form="form" class="btn btn-light m-2">Zatwierdź</button>' +
          '</div>',
          messageHandlers: {
            'run': function() {
              var button = document.getElementById('submit');
              button.addEventListener('click', ( event ) => {
                let id = document.getElementById('id').value;
                let sex = document.getElementById('sex').value;
                let age = document.getElementById('age').value;
                saveUserData({ id, sex, age});
              });
            },
          },
          responses: {
            'click button#submit': 'submit',
          }
      })
    ]
  });
}

export function welcomeScreen() {

  return new lab.flow.Sequence({
    content: [
      new lab.html.Screen({
        content: '<p>Usiądź wygodnie i pozostań w bezruchu.</p>' +
                  '<p>Kalibrujemy sensory.</p>' +
                  '<p>Rozpoczniemy po minucie.</p>',
        timeout: 1000,
      }),
      new lab.html.Screen({
        content: '<p>Witaj!<p>' +
                  '<p> W naszym badaniu będziesz oglądać obrazki i słuchać dźwięków,<p>' +
                  '<p> a następnie oceniać emocje jakie w Tobie wywołały.<p>' +
                  '<p> Zagrasz też w dwie gry.<p>' +
                  '<p> Wszystko będzie sterowane za pomocą pada.<p>' +
                  '<p> Jeżeli wszystko do tej pory jest jasne, naciśnij X na padzie.',
        responses: {
          'click': 'A mouse click was recorded',
        }
      }),
      new lab.html.Screen({
        content: '<p>Rozpoczynamy trening.</p>' + 
                  '<p>Nie zbieramy jeszcze danych. To jest czas na naukę.</p>' +
                  '<p>Naciśnij X na padzie, aby kontynuować.</p>',
        responses: {
          'click': 'A mouse click was recorded',
        }
      }),
      new lab.html.Screen({
        content: 'TRENING',
        responses: {
          'click': 'A mouse click was recorded',
        }
      })
    ]
  });
}

export function gameScreen() {
  return new lab.html.Screen({
    content: '<p>Po zakończeniu gry, kliknij aby kontynuować</p>',
    messageHandlers: {
      'run': function() {
        console.log('wlacz gre');
      },
    },
    responses: {
      'click': 'A mouse click was recorded',
    }
  });
}

export function loopWithValenceArousaleWidget(loopImages, store, user, camera) {

  const loopSequence =  new lab.flow.Sequence({
    content: [
      new lab.html.Screen({
        content: '<img class="img-fluid" src="assets/img/${ parameters.image }">',
        timeout: 6000,
        messageHandlers: {
          'before:prepare': function() {
            const sound = document.createElement('audio');
            sound.src = `assets/sounds/${this.parent.options.parameters.sound}`;
            sound.volume = 0.5;
            this.internals.sound = sound;
          },
          'run': function() { 
            currentTimeOfImage = new Date(); 
            this.internals.sound.play();
            this.internals.interval = camera.setIntervalForPhotos(intervalForTakingPhotos);
          }
        }
      }),
      new lab.html.Screen({
        content: '<div id="valence-arousal"></div>',
        timeout: 2000,
        messageHandlers: {
          'run': function() {
            currentTimeOfWidget = new Date();
            store.setResult(
              formatExperimentData(
                user, 
                index,
                this.parent.options.parameters, 
                'emoscpace', 
                currentTimeOfImage.getTime(), 
                {value: 'None', time: 'None'}
              )
            );
            let valenceArousal = new ValenceArousal();

            valenceArousal.onChange((value) => {
              store.setResult(
                formatExperimentData(
                  user, 
                  index,
                  this.parent.options.parameters, 
                  'emospace', 
                  currentTimeOfImage.getTime(), 
                  { value: [value.valence, value.arousal], time: (new Date() - currentTimeOfWidget)/1000 }
                )
              );
            });
            valenceArousal.init(window.document.getElementById('valence-arousal'));
            index++;
          },
          'end': () => {
            store.updateResult();
            console.log('koniec petli')
          }
        },
      })
    ]
  });

  const experiment = new lab.flow.Loop({
    template: loopSequence,
    templateParameters: loopImages
  });

  return experiment;
}

export function loopWithEmotionsSimpleWidget(loopImages, store, user, camera) {

  const loopSequence =  new lab.flow.Sequence({
    content: [
      new lab.html.Screen({
        content: '<img class="img-fluid" src="assets/img/${ parameters.image }">',
        timeout: 6000,
        messageHandlers: {
          'before:prepare': function() {
            const sound = document.createElement('audio');
            sound.src = `assets/sounds/${this.parent.options.parameters.sound}`;
            sound.volume = 0.5;
            this.internals.sound = sound;
          },
          'run': function() { 
            currentTimeOfImage = new Date(); 
            this.internals.sound.play();
            this.internals.interval = camera.setIntervalForPhotos(intervalForTakingPhotos);

          },
          'end': function() { 
            camera.stopIntervalForPhotos(this.internals.interval);
          }
        }
      }),
      new lab.html.Screen({
        content: '<div id="emotion-input" class="emotion-scale center vertical"></div>',
        messageHandlers: {
          'run': function() {
            currentTimeOfWidget = new Date();
            let emotionScale = new EmotionScale();
            store.setResult(
              formatExperimentData(
                user, 
                index,
                this.parent.options.parameters, 
                'emoscale1', 
                currentTimeOfImage.getTime(), 
                {value: 'None', time: 'None'}
              )
            );
            emotionScale.setAssetsDirectory('../../assets/emotions-simple/');
            
            emotionScale.onChange((result) => {
              store.setResult(
                formatExperimentData(
                  user, 
                  index,
                  this.parent.options.parameters, 
                  'emoscale', 
                  currentTimeOfImage.getTime(), 
                  { value: result, time: (new Date() - currentTimeOfWidget)/1000 }
                )
              );
            });
            emotionScale.init(window.document.getElementById('emotion-input'));
            index++;
          },
          'end': () => {
            store.updateResult();
          }
        },
        timeout: 2000,
      })
    ]
  });
  
  const experiment = new lab.flow.Loop({
    template: loopSequence,
    templateParameters: loopImages
  });

  return experiment;
}


function formatExperimentData(user, index, stimuliData, widgetName, timeOfImage, response) {
  return {
    'user_id': user.id,
    'index': index,
    'condition': stimuliData.condition,
    'condition_detail': stimuliData.condition_detail,
    'sound_id': stimuliData.sound,
    'image_id': stimuliData.image,
    'widget_name': widgetName,
    'response_value': response.value,
    'response_time': response.time,
    'show_image_timestamp': timeOfImage
  }
}