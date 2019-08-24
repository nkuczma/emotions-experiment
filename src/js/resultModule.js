const lab = require('lab.js/dist/lab.dev.js');

export function resultModule() {
  let store = new lab.data.Store();

  function setResult(data) {
    store.set(data);
  }

  function updateResult() {
    store.commit();
  }

  function downloadResult() {
    store.download();
  }

  function exportCsv() {
    return store.exportCsv('; ');
  }

  return { setResult, updateResult, downloadResult, exportCsv }
}