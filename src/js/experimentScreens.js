const lab = require('lab.js/dist/lab.dev.js');
import { EmotionScale} from './response-widgets/emotion-scale.js';

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

export function loopWithEmotionsSimpleWidget(loopImages) {

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
            // initialize widget\
            console.log('check input');
            let emotionScale = new EmotionScale();
            emotionScale.setAssetsDirectory('../../assets/emotions-simple/');
            emotionScale.onChange((result) => {
              experiment.datastore.set({
                'imageUrl': this.parent.options.parameters.imageName,
                'emotion': result,
              });
              console.log(result);
            });
  
            emotionScale.init(window.document.getElementById('emotion-input'));
          },
          'end': () => {
            console.log('end checking');
            experiment.datastore.commit();
            experiment.datastore.show();
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

  experiment.datastore = new lab.data.Store();

  experiment.on('end', () => {
    // experiment.datastore.download();
  });

  return experiment;
}

export function saveResults() {
//TODO
}



