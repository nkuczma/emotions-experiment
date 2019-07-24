const lab = require('lab.js/dist/lab.dev.js');
import { EmotionScale} from './response-widgets/emotion-scale.js';
import { ValenceArousal } from './response-widgets/valence-arousal.js';


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

export function loopWithValenceArousaleWidget(loopImages, store) {

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
          'run': function() { console.log('show photo');} }
      }),
      new lab.html.Screen({
        content: '<div id="valence-arousal"></div>',
        timeout: 2000,
        messageHandlers: {
          'run': function() {

            // initialize widget
            let valenceArousal = new ValenceArousal();
            let valenceValue = 0;
            let arousalValue = 0;

            valenceArousal.onChange((value) => {
              store.setResult({
                'imageUrl': this.parent.options.parameters.imageName,
                'valence': value.valence,
                'arousal': value.arousal,
              });
            });

            valenceArousal.init(window.document.getElementById('valence-arousal'));

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

export function loopWithEmotionsSimpleWidget(loopImages, store) {

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
          'run': function() { console.log('show photo');} }
      }),
      new lab.html.Screen({
        content: '<div id="emotion-input" class="emotion-scale center vertical"></div>',
        messageHandlers: {
          'run': function() {
            let emotionScale = new EmotionScale();
            emotionScale.setAssetsDirectory('../../assets/emotions-simple/');
            emotionScale.onChange((result) => {
              store.setResult({
                'imageUrl': this.parent.options.parameters.imageName,
                'emotion': result,
              });
            });
  
            emotionScale.init(window.document.getElementById('emotion-input'));
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

