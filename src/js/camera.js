function cameraModule() {

  let videoElement = document.querySelector('video');
  let videoSelect = document.querySelector('#videoSource');
  let takePhotoTimer;

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

  return {
    initializeCamera
  }
}
export default cameraModule;
