/**
 * DO NOT EDIT: This file is part of the smartcontent-cdk
 *
 * Browser entry point
 */
import Creative from './Creative.js';

/**
 * Initialise Creative and Listen for events.
 * DOMContentLoaded must have fired for
 * Creative constructor to initialise.
 */
document.addEventListener('DOMContentLoaded', () => {

  let creative = new Creative(window);

  window.addEventListener('message', (event) => {
    switch (event.data.event) {
      case 'metaDataReceived':
      case 'dataReceived':
      case 'campaignDataReceived':
        creative.receiveData(event.data.event, event.data.data);
        break;
      case 'start':
        creative.start();
    }
  }, false);

  window.parent.postMessage({'event': 'ready'}, '*');
});
