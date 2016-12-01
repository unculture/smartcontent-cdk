import {versionEvent} from './version';

export default (meta, campaign, dataItems, rulesets) => {
  window.postMessage({event: versionEvent('metaDataReceived'), data: meta}, "*");
  window.postMessage({event: versionEvent('campaignDataReceived'), data: campaign}, "*");
  window.postMessage({event: versionEvent('dataReceived'), data: dataItems}, "*");
  window.postMessage({event: versionEvent('rulesetsDataReceived'), data: rulesets}, "*");
  window.postMessage({event: 'start', data: null}, "*");
}