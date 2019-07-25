const lab = require('lab.js/dist/lab.dev.js');
import { EmotionScale} from './response-widgets/emotion-scale.js';
import { ValenceArousal } from './response-widgets/valence-arousal.js';

let currentTimeOfImage;
let currentTimeOfWidget;
let index = 0;
let user = {};

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
        content: '<img class="img-fluid" src="${ parameters.image }">',
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
              'condition': 'inc',
              'condition_detail': 'p-s+',
              'sound_id': '213',
              'image_id': this.parent.options.parameters.imageName,
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
                'condition': 'inc',
                'condition_detail': 'p-s+',
                'sound_id': '213',
                'image_id': this.parent.options.parameters.imageName,
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
        content: '<img class="img-fluid" src="${ parameters.image }">',
        timeout: 2000,
        messageHandlers: {
          'run': function() { currentTimeOfImage = new Date(); } }
      }),
      new lab.html.Screen({
        content: '<div id="emotion-input" class="emotion-scale center vertical"></div>',
        messageHandlers: {
          'run': function() {
            currentTimeOfWidget = new Date();
            let emotionScale = new EmotionScale();
            store.setResult({
              'user_id': user.id,
              'index': index,
              'condition': 'inc',
              'condition_detail': 'p-s+',
              'sound_id': '213',
              'image_id': this.parent.options.parameters.imageName,
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
                'condition': 'inc',
                'condition_detail': 'p-s+',
                'sound_id': '213',
                'image_id': this.parent.options.parameters.imageName,
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

