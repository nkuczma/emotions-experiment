function cameraModule(fileModule) {

  let videoElement = document.querySelector('video');
  let videoSelect = document.querySelector('#videoSource');

  function initializeCamera() {

    navigator.mediaDevices.enumerateDevices()
      .then(gotDevices).then(getStream).catch(handleError);

    videoSelect.onchange = getStream;

    function gotDevices(deviceInfos) {
      for (let i = 0; i !== deviceInfos.length; ++i) {
        let deviceInfo = deviceInfos[i];
        let option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'videoinput') {
          option.text = deviceInfo.label || 'camera ' +
            (videoSelect.length + 1);
          videoSelect.appendChild(option);
        } else {
          console.log('Found one other kind of source/device: ', deviceInfo);
        }
      }
    }

    function getStream() {
      if (window.stream) {
        window.stream.getTracks().forEach(function(track) {
          track.stop();
        });
      }

      let constraints = {
        video: { deviceId: {exact: videoSelect.value} }
      };

      navigator.mediaDevices.getUserMedia(constraints).
        then(gotStream).catch(handleError);
    }

    function gotStream(stream) {
      window.stream = stream; 
      videoElement.srcObject = stream;
    }

    function handleError(error) {
      console.log('Error: ', error);
    }
  }

  function takePhoto(emotionsFromFaceStore, index){
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d').drawImage(videoElement, 0, 0);
    var img = canvas.toDataURL('image/jpeg');
    let imageFile = fileModule.b64toBlob(img);
    let imageName = `${(new Date()).getTime()}.jpeg`;
    fileModule.pushFileToZip(imageFile, imageName, true);
    // fileModule.checkEmotionFromPhoto(img, imageName, emotionsFromFaceStore, index);
    index++;
  }

  function setIntervalForPhotos(time, emotionsFromFaceStore) {
    let index = 0;
    let interval = setInterval(function(){ 
      takePhoto(emotionsFromFaceStore, index);
    }, time);

    return interval;
  }

  function stopIntervalForPhotos(interval){
    clearInterval(interval);
  }

  return {
    initializeCamera,
    setIntervalForPhotos,
    stopIntervalForPhotos
  }
}
export default cameraModule;
