export function userModule(){
  let user = {};

  function setUserData(data) {
    user = data;
  }

  function getUserData() {
    return user;
  }

  return { setUserData, getUserData};
}