const lab = require('lab.js/dist/lab.dev.js');

function importAll(r) {
  return r.keys().map(r).map((image, i) => { 
    return {image: image, value: i, imageName: r.keys()[i]}; 
  });
}

function experimentModule() {

  const imagesList = importAll(require.context('./../assets/img', false, /\.(png|jpe?g|svg)$/));
  const images = random.shuffle(imagesList);
  const random = new lab.util.Random();
  let experiment;

  function initializeExperiment() {

    const trialLoop = new lab.flow.Sequence({
      content: [
        new lab.html.Screen({
          content: '.',
          timeout: 500,
        }),
        new lab.html.Screen({
          content: '<img class="img-fluid" src="${ parameters.image }">',
          timeout: 2000,
        }),
        new lab.html.Screen({
          content: 'ZBADAJ REAKCJE',
          timeout: 500,
        }),
      ]
    });
    
    experiment = new lab.flow.Sequence({
      content: [
        new lab.html.Screen({
          content: "Cześć!",
          timeout: 1000,
        }),
        new lab.html.Screen({
          content: 'Kliknij, by kontynuować',
          responses: {
            'click': 'A mouse click was recorded',
          }
        }),
        new lab.html.Screen({
          content: '<p>Zobaczysz teraz kilka różnych obrazków jeden po drugim.</p>' +
                   '<p>Po każdym z nich zostaniesz poproszony o określenie swojej emocji.</p>' +
                   '<br><p class="text-center">Kliknij, by kontynuować.</p>',
          responses: {
            'click': 'A mouse click was recorded',
          }
        }),
        new lab.flow.Loop({
          template: trialLoop,
          templateParameters: images
        }),
        new lab.html.Screen({
          content: 'Kliknij, by zakończyć i zapisać wyniki',
          responses: {
            'click': 'A mouse click was recorded',
          }
        }),
      ],
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