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
