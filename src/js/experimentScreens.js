const lab = require('lab.js/dist/lab.dev.js');

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

export function loopWithImagess(loopImages, reactionWidget = 'zbadaj reakcje') {

  const loopSequence =  new lab.flow.Sequence({
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
        content: '<div id="emotion-input" class="emotion-scale center vertical"></div>',
        messageHandlers: {
          'run': function() {
            // initialize widget
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
    experiment.datastore.download();
  });

  return experiment;
}

export function saveResults() {
//TODO
}

export function facesWidgetScreen() {
//TODO
}

export function facesArousalWidgetScreen() {
//TODO
}



///////////////////////
NodeList.prototype.forEach = function (callback) {
  Array.prototype.forEach.call(this, callback);
}

var emotionScaleDefaultConfig = {
  assetsDirectory: "assets/",
  items: [
    {
      value: "verybad",
      src: "emo1.svg",
      color: "#E4473C"
    },
    {
      value: "bad",
      src: "emo2.svg",
      color: "#E2B036"
    },
    {
      value: "neutral",
      src: "emo3.svg",
      color: "#6A6DA0"
    },
    {
      value: "good",
      src: "emo4.svg",
      color: "#4BB166"
    },
    {
      value: "verygood",
      src: "emo5.svg",
      color: "#6BB12E"
    }
  ]
};

class EmotionScale {
  constructor(config) {
    this.config = config || emotionScaleDefaultConfig;
  }

  setAssetsDirectory(directory) {
    this.config.assetsDirectory = directory;
  }

  create(root) {
    var select = $('<select name="emotion-scale"></select>');
    for (var i =0; i < 5; i++) {
      select.append($("<option>", { text: i+1 }))
    }
    root.append(select);

    var container = $("<div>", { class: "emotion-scale-container" });
    for (var j = 0; j < this.config.items.length; j++) {
      var item = this.config.items[j];
      this.appendSvgNode(container, item);
    }
    root.append(container);
  }

  appendSvgNode(container, item) {
    jQuery.get(this.config.assetsDirectory + item.src, function (data) {
      var itemDiv = $("<div>", { class: "emotion-scale-item" })
      var svg = jQuery(data).find('svg');
      svg = svg.attr('id', `emotion-${item.value}`);
      svg = svg.css('fill', item.color);
      svg = svg.removeAttr('xmlns:a');
      if (!svg.attr('viewBox') && svg.attr('height') && svg.attr('width')) {
        svg.attr('viewBox', '0 0 ' + svg.attr('height') + ' ' + svg.attr('width'))
      }
      itemDiv.append(svg);
      container.append(itemDiv);
    }, 'xml');
  }

  deactivateSelect(select) {
    if (!select.classList.contains('active')) return;
    select.classList.remove('active');
  }

  activeSelect(select, selectList) {
    if (select.classList.contains('active')) return;
    selectList.forEach((s) => this.deactivateSelect(s));
    select.classList.add('active');
  }

  updateValue(select, index) {
    var nativeWidget = select.previousElementSibling;
    var optionList = select.querySelectorAll('.emotion-scale-item');
    nativeWidget.selectedIndex = index;
    this.highlightItem(select, optionList[index]);
    
    if (this.onChangeHandle) {
      this.onChangeHandle(index+1);
    }
  };

  highlightItem(select, item) {
    var itemList = select.querySelectorAll('.emotion-scale-item');
    itemList.forEach(function (other) {
      other.classList.remove('highlight');
    });
    item.classList.add('highlight');
  };

  getIndex(select) {
    var nativeWidget = select.previousElementSibling;
    return nativeWidget.selectedIndex;
  };

  attachHandlers(element) {
    var scaleList = element.querySelectorAll(".emotion-scale-container");
    scaleList.forEach(function (scale) {
      var itemList = scale.querySelectorAll('.emotion-scale-item');

      scale.tabIndex = 0;
      scale.previousElementSibling.tabIndex = -1;

      itemList.forEach(function (item, index) {
        item.addEventListener('click', function (event) {
          this.updateValue(scale, index);
          if (this.onClickHandle) {
            this.onClickHandle(index+1);
          }
        }.bind(this));
      }.bind(this));
      scale.addEventListener('focus', function (event) {
        this.activeSelect(scale, scaleList);
      }.bind(this));
      scale.addEventListener('blur', function (event) {
        this.deactivateSelect(scale);
      }.bind(this));
    }.bind(this));
  }

  init(element) {
    var root = $(element);
    jQuery.ajaxSetup({async:false});
    this.create(root);
    jQuery.ajaxSetup({async:true});
    this.attachHandlers(element);
  }

  onChange(callback) {
    this.onChangeHandle = callback;
  }

  onClick(callback) {
    this.onClickHandle = callback;
  }

  setValue(index) {
    var scaleList = document.querySelectorAll(".emotion-scale-container");
    scaleList.forEach(function (scale) {
      this.updateValue(scale, index);
    }.bind(this));
  }
}

var buffor = [];
var maxBuffor = 10;

function movingWeightedAverage(array) {
  let nominator = 0;
  let denominator = 0;
  let length = array.length;
  for (let i = 0; i < length; i++) {
    nominator += array[i]*(length-i);
    denominator += (length-i);
  }
  return nominator/denominator;
}

function handleMotion(event, emotionScale) {
  var acceleration = event.accelerationIncludingGravity;
  var tresholds = [-10, -1, 2, 5, 7, 10];
  // TODO: different api handlers
  
  buffor.push(acceleration.z);
  if (buffor.length > maxBuffor) {
    buffor.shift();
  }
  
  var z = movingWeightedAverage(buffor);

  for (let i = 0; i < tresholds.length - 1; i++) {
    if (z > tresholds[i] &&z <= tresholds[i + 1]) {
      emotionScale.setValue(i);
    }
  }
}
