var Dropbox = require('dropbox').Dropbox;
const fs = require('fs');
var JSZip = require("jszip");



var ClientID  = '328629123133-ncbr8aa6v180pgmig78ojtheubjh7aeg.apps.googleusercontent.com';
var ClientSecret = 'xvAYQ9oKNhwl1o27TmTqY1M7';

function fileModule() {
  let dbx;
  let sendList =[];
  var zip = new JSZip();

  function setDropbox() {
    dbx = new Dropbox({ 
      accessToken: 'Jjw9dr17HzAAAAAAAAAAgUKgqqamtghp4JJNl3V9eIAonXve0VgyGbWOYiLpmPK8', 
      fetch: fetch 
    });
  }

  function pushFileToZip(file, filename, isImage) {
    zip.file(filename, file, {base64: isImage});
  }
  
  function saveZipToDropbox(zipName) {
    let resultInfo = document.getElementById('files-ready');
    zip.generateAsync({type:"blob"}).then(function(content) {
      console.log('spakowane');
      dbx.filesUpload({path: '/' + zipName, contents: content})
        .then( function () {
          resultInfo.innerHTML = 'Pliki zostały zapisane';
        })
        .catch(function(error) {
          console.error(error);
          resultInfo.innerHTML = 'Problem z zapisaniem plików';
        });
    });
  }


  function checkEmotionFromPhoto(image, name, emotionsFromFaceStore) {
    if (index%4===0) {
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
  
  return { setDropbox, pushFileToZip, saveZipToDropbox, b64toBlob, checkEmotionFromPhoto }
}

export default fileModule;