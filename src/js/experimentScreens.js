const lab = require('lab.js/dist/lab.dev.js');
import { EmotionScale} from './response-widgets/emotion-scale.js';
import { ValenceArousal } from './response-widgets/valence-arousal.js';

let currentTimeOfImage;
let currentTimeOfWidget;
let index = 0;
let user = {};

export function getUserDataScreen(saveUserData) {
  return new lab.flow.Sequence({
    content: [
      new lab.html.Screen({
        content:
          '<div id="form" class="form-group d-flex">' +
          '  <div><label for="id">ID:</label>' +
          '  <input name="id" id="id" required /></div>' +
          '  <div><label for="sex">Sex:</label>' +
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

export function loopWithValenceArousaleWidget(loopImages, store, user) {

  const loopSequence =  new lab.flow.Sequence({
    content: [
      new lab.html.Screen({
        content: '.',
        timeout: 500,
      }),
      new lab.html.Screen({
        content: '<img class="img-fluid" src="assets/img/${ parameters.image }">',
        timeout: 2000,
        messageHandlers: {
          'run': function() { currentTimeOfImage = new Date(); } }
      }),
      new lab.html.Screen({
        content: '<div id="valence-arousal"></div>',
        timeout: 2000,
        messageHandlers: {
          'run': function() {
            currentTimeOfWidget = new Date();
            store.setResult({
              'user_id': user.id,
              'index': index,
              'condition': this.parent.options.parameters.condition,
              'condition_detail': this.parent.options.parameters.condition_detail,
              'sound_id': this.parent.options.parameters.sound,
              'image_id': this.parent.options.parameters.image,
              'widget_name': 'emoscale1',
              'response_value': 'None',
              'response_time': 'None',
              'show_image_timestamp': currentTimeOfImage.getTime()
            });
            // initialize widget
            let valenceArousal = new ValenceArousal();
            let valenceValue = 0;
            let arousalValue = 0;

            valenceArousal.onChange((value) => {
              store.setResult({
                'user_id': user.id,
                'index': index,
                'condition': this.parent.options.parameters.condition,
                'condition_detail': this.parent.options.parameters.condition_detail,
                'sound_id': this.parent.options.parameters.sound,
                'image_id': this.parent.options.parameters.image,
                'widget_name': 'emospace1',
                'response_value': [value.valence, value.arousal],
                'response_time': (new Date() - currentTimeOfWidget)/1000,
                'show_image_timestamp': currentTimeOfImage.getTime()
              });
            });
            valenceArousal.init(window.document.getElementById('valence-arousal'));
            index++;
          },
          'end': () => {
            store.updateResult();
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

export function loopWithEmotionsSimpleWidget(loopImages, store, user) {

  const loopSequence =  new lab.flow.Sequence({
    content: [
      new lab.html.Screen({
        content: '.',
        timeout: 500,
      }),
      new lab.html.Screen({
        content: '<img class="img-fluid" src="assets/img/${ parameters.image }">',
        timeout: 2000,
        messageHandlers: {
          'run': function() { currentTimeOfImage = new Date(); } }
      }),
      new lab.html.Screen({
        content: '<div id="emotion-input" class="emotion-scale center vertical"></div>',
        messageHandlers: {
          'run': function() {
            console.log('user');
            console.log(user);
            currentTimeOfWidget = new Date();
            let emotionScale = new EmotionScale();
            store.setResult({
              'user_id': user.id,
              'index': index,
              'condition': this.parent.options.parameters.condition,
              'condition_detail': this.parent.options.parameters.condition_detail,
              'sound_id': this.parent.options.parameters.sound,
              'image_id': this.parent.options.parameters.image,
              'widget_name': 'emoscale1',
              'response_value': 'None',
              'response_time': 'None',
              'show_image_timestamp': currentTimeOfImage.getTime()
            });
            emotionScale.setAssetsDirectory('../../assets/emotions-simple/');
            
            emotionScale.onChange((result) => {
              store.setResult({
                'user_id': user.id,
                'index': index,
                'condition': this.parent.options.parameters.condition,
                'condition_detail': this.parent.options.parameters.condition_detail,
                'sound_id': this.parent.options.parameters.sound,
                'image_id': this.parent.options.parameters.image,
                'widget_name': 'emoscale1',
                'response_value': result,
                'response_time': (new Date() - currentTimeOfWidget)/1000,
                'show_image_timestamp': currentTimeOfImage.getTime()
              });
            });
            emotionScale.init(window.document.getElementById('emotion-input'));
            index++;
          },
          'end': () => {
            store.updateResult();
          }
        },
        timeout: 2000,
        responses: {
          'click button#submit': 'submit',
        }
      })
    ]
  });
  
  const experiment = new lab.flow.Loop({
    template: loopSequence,
    templateParameters: loopImages
  });

  return experiment;
}

