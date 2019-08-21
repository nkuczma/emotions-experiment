export function setDropbox(img) {
  var Dropbox = require('dropbox').Dropbox;
  var dbx = new Dropbox({ accessToken: 'Jjw9dr17HzAAAAAAAAAAgUKgqqamtghp4JJNl3V9eIAonXve0VgyGbWOYiLpmPK8', fetch: fetch });

  let block = img.split(";");
  let contentType = block[0].split(":")[1];
  let realData = block[1].split(",")[1];
  let blob = b64toBlob(realData, contentType);

  let filename = (new Date()).getTime();

  dbx.filesUpload({path: '/' + `${filename}.jpeg`, contents: blob})
  .then(function(response) {
    var results = document.getElementById('results');
    results.appendChild(document.createTextNode('File uploaded!'));
    console.log(response);
  })
  .catch(function(error) {
    console.error(error);
  });
}


function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

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