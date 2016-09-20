export default (meta, campaign, dataItems) => {
  window.postMessage({event: "metaDataReceived", data: meta}, "*");
  window.postMessage({event: "campaignDataReceived", data: campaign}, "*");
  window.postMessage({event: "dataReceived", data: dataItems}, "*");
  window.postMessage({event: "start", data: null}, "*");
}
