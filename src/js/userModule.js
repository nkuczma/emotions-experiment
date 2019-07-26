const lab = require('lab.js/dist/lab.dev.js');

export function userModule(){
  let user = {};
  let userStore = new lab.data.Store();

  function setUserData(data) {
    user = data;
    userStore.set(data);
    userStore.commit();
  }

  function getUserData() {
    console.log(user);
    return user;
  }

  function downloadUserData() {
    userStore.download();
  }

  return { setUserData, getUserData, downloadUserData };
}