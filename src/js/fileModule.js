import experimentModule from './experiment';

var Dropbox = require('dropbox').Dropbox;

function fileModule(emotionsFromFaceStore) {
  let dbx;

  function setDropbox() {
    dbx = new Dropbox({ 
      accessToken: 'Jjw9dr17HzAAAAAAAAAAgUKgqqamtghp4JJNl3V9eIAonXve0VgyGbWOYiLpmPK8', 
      fetch: fetch 
    });
  }

  function pushFileToDropbox(file, filename) {
    dbx.filesUpload({path: '/' + `${filename}.jpeg`, contents: file})
    .catch(function(error) {
      console.error(error);
    });
  }


  function b64toBlob(data) {
    let block = data.split(";");
    let contentType = block[0].split(":")[1];
    let b64Data = block[1].split(",")[1];

    contentType = contentType || '';
    let sliceSize = 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  function checkEmotionFromPhoto(image, name) {
    var subscriptionKey = "02a92d3ef650497ea94000e535a32053";
    var uriBase = "https://northeurope.api.cognitive.microsoft.com/face/v1.0/detect";
  
    var params = {
        "returnFaceId": "true",
        "returnFaceLandmarks": "false",
        "returnFaceAttributes":
            "emotion"
    };
  
    fetch(image)
      .then(res => res.blob())
      .then(blobData => {
        $.post({
            url: uriBase + "?" + $.param(params),
            contentType: "application/octet-stream",
            headers: {
              'Content-Type': 'application/octet-stream',
              'Ocp-Apim-Subscription-Key': subscriptionKey
            },
            crossDomain: true,
            processData: false,
            data: blobData
          })
          .done(function(data) {
            console.log(data);
            if(data.length > 0) {
              let emotions = data[0].faceAttributes.emotion;
              emotionsFromFaceStore.setResult(
                {
                  'timestamp': name,
                  'anger': emotions.anger,
                  'contempt': emotions.contempt,
                  'disgust': emotions.disgust,
                  'fear': emotions.fear,
                  'happiness': emotions.happiness,
                  'neutral': emotions.neutral,
                  'sadness': emotions.sadness,
                  'surprise': emotions.surprise
                }
              ); 
              emotionsFromFaceStore.updateResult();
            }
            else {
              emotionsFromFaceStore.setResult(
                {
                  'timestamp': name,
                  'anger': 'None',
                  'contempt': 'None',
                  'disgust': 'None',
                  'fear': 'None',
                  'happiness': 'None',
                  'neutral': 'None',
                  'sadness': 'None',
                  'surprise': 'None'
                }
              ); 
              emotionsFromFaceStore.updateResult();
            }
          })
          .fail(function(err) {
            console.log(err);
          })
      });
  }

  return { setDropbox, pushFileToDropbox, b64toBlob, checkEmotionFromPhoto}
}

export default fileModule;