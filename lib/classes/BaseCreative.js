/**
 * DO NOT EDIT: This file is part of the smartcontent-cdk
 *
 * BaseCreative class
 */

import _get from 'lodash/get';
import _map from 'lodash/map';
import _each from 'lodash/each';
import _size from 'lodash/size';
import _merge from 'lodash/merge';
import _assign from 'lodash/assign';
import _filter from 'lodash/filter';
import _upperFirst from 'lodash/upperFirst';

export default class {

  /**
   * Constructor
   *
   * @param window
   */
  constructor(window) {
    this.window = window;

    this.fallback = this.elById('fallback');

    this._dataEvents = ['metaData', 'campaignData', 'data'];
    this._dataReceived = {};

    this._assetList = this.creativeAssets();
    this._assetLoadCount = 0;
  }

  /**
   *
   * @param event
   * @param data
   */
  receiveData(event, data) {

    // Attempt to call handler
    this._call(event + 'Handler', [data]);

    // Attempt to call asset collation
    this._call(`_${event}CollateAssets`, [data]);

    // Set data received for event
    this._dataReceived[event] = data;

    this._fireDataReceived();
  }

  /**
   * Fire dataReceived if all data has been received.
   */
  _fireDataReceived() {
    if (_size(this._dataReceived) < _size(this._dataEvents)) {
      return;
    }

    this._call('dataReceived', null, true);
    this._checkAssets();
  }

  /**
   * Collates all content item active assets.
   *
   * @param data
   */
  _dataReceivedCollateAssets(data) {
    let items = _map(data, this.itemFields);
    if (!items) {
      return;
    }

    let itemAssets = this.itemAssets();
    if (!itemAssets.length) {
      return;
    }

    items.forEach(item => {
      itemAssets.forEach(field => {
        let file = item[field.name];
        if (file) {
          this._assetList.push(_merge({file}, field));
        }
      });
    });
  }

  /**
   * Check if all assets have loaded.
   */
  _checkAssets() {
    this._assetList.forEach((asset) => {
      let assetHandler = '_check' + _upperFirst(asset.type);
      this[assetHandler](asset.file);
    });
  }

  /**
   * Check if image has loaded.
   *
   * @param file
   */
  _checkImage(file) {
    let img = new Image();
    img.onload = () => {
      this._assetLoadCount++;
      this._fireAssetsLoaded();
    };
    img.src = file;
  }

  /**
   * Check if video has loaded.
   *
   * @param file
   */
  _checkVideo(file) {
    let video = document.createElement('video');
    video.src = file;
    video.load();
    video.addEventListener('loadeddata', () => {
      this._assetLoadCount++;
      this._fireAssetsLoaded();
    }, false);
  }

  /**
   * Fire assetsLoaded event if all assets have been loaded
   */
  _fireAssetsLoaded() {
    if (this._assetLoadCount >= this._assetList.length) {
      this._call('assetsLoaded', false, true);
    }
  }

  /**
   * Attempt to call class method, warn if it doesn't exist.
   *
   * @param method
   * @param params
   * @param warn
   * @private
   */
  _call(method, params, warn) {
    if (!this[method]) {
      if (warn) {
        this._definitionWarning(method);
      }
      return;
    }

    params = params || [];

    // Call method
    this[method](...params);
  }

  _definitionWarning(method) {
    console.log(`Method [${method}] may need to be defined in class [Creative]`);
  }

  /**
   * Called at the moment Creative is shown
   */
  start() {
    this._definitionWarning('start');
  }

  /**
   * If verification of Creative asset loading is required,
   * return a list of assets `type` and `name`.
   * Valid types are 'image' and 'video'.
   *
   * To be overridden by Creative.
   *
   * @return []
   */
  creativeAssets() {
    this._definitionWarning('creativeAssets');
    return [];
  }

  /**
   * If verification of data item asset loading is required,
   * return a list of content item asset `type` and `name`.
   * Valid types are 'image' and 'video'.
   *
   * To be overridden by Creative.
   *
   * @return []
   */
  itemAssets() {
    this._definitionWarning('itemAssets');
    return [];
  }

  /**
   * Initialise screens
   *
   * @param screens
   */
  initScreens(screens) {
    this.screens = screens;
    this.screenData = {};
    this.screenContainers = {};
    this.screens.forEach(screen => {
      this.screenData[screen] = false;
      this.screenContainers[screen] = this.elById('screen_' + screen);
    });
  }

  /**
   * Show a screen
   *
   * @param screen
   */
  showScreen(screen) {
    this._initScreen(screen);
    this._hideScreens();
    this.elShow(this.screenContainers[screen]);
    this.elHide(this.fallback);
    console.log(`[showScreen] ${screen}`);
  }

  /**
   * Hide all screens
   */
  _hideScreens() {
    _each(this.screenContainers, container => {
      this.elHide(container);
    });
  }

  /**
   * Initialise screen
   *
   * @param screen
   */
  _initScreen(screen) {
    this._call(screen + 'InitScreen');
  }


  // ------------
  // DATA GETTERS
  // ------------

  /**
   * Returns meta data
   *
   * @returns {*}
   */
  dataGetMeta() {
    return this._dataReceived.metaDataReceived;
  }

  /**
   * Returns campaign data
   *
   * @returns {*}
   */
  dataGetCampaign() {
    return this._dataReceived.campaignDataReceived;
  }

  /**
   * Returns content items
   *
   * @returns []
   */
  dataGetItems() {
    return this._dataReceived.dataReceived;
  }

  /**
   * Helper to return frame specification data
   *
   * @returns mixed
   */
  getFrameSpecification(key) {
    let keyPrefix = 'specification';
    key = key ? keyPrefix + '.' + key : keyPrefix;
    return _get(this.dataGetMeta(), key);
  }

  /**
   * Helper to return frame location timezone offset in minutes
   *
   * @returns mixed
   */
  getFrameUtcOffsetMinutes() {
    let offsetSeconds = _get(this.dataGetMeta(), 'meta.location.timezone_offset');
    if (offsetSeconds !== null) {
      return offsetSeconds / 60;
    }
    return null;
  }

  /**
   * Helper to return frame tags
   *
   * @returns mixed
   */
  getFrameTags(slug) {
    return _get(this.dataGetMeta(), `tags.${slug}`);
  }

  /**
   * Helper to return frame tag
   *
   * @returns mixed
   */
  getFrameTag(slug) {
    return _head(this.getFrameTags(slug));
  }


  // -------
  // HELPERS
  // -------

  /**
   *
   * @param id
   * @returns {Element}
   */
  elById(id) {
    return this.window.document.getElementById(id);
  }

  /**
   *
   * @param el
   */
  elShow(el) {
    el.style.visibility = 'visible';
  }

  /**
   *
   * @param el
   */
  elHide(el) {
    el.style.visibility = 'hidden';
  }

  /**
   *
   * @param code
   */
  showFallback(code) {
    this.elShow(this.fallback);
    // TODO: log fallback code
  }

  /**
   *
   * @param key
   * @param value
   */
  setLocalStorage(key, value) {
    localStorage.setItem(this.getLocalStorageKey(key), JSON.stringify(value));
  }

  /**
   *
   * @param key
   * @param defaultValue
   * @returns {*}
   */
  getLocalStorage(key, defaultValue) {
    let value = localStorage.getItem(this.getLocalStorageKey(key));
    if (value === null) {
      return defaultValue;
    }

    try {
      return JSON.parse(value);
    } catch (e) {
    }
    return null;
  }

  /**
   *
   * @param key
   * @returns {string}
   */
  getLocalStorageKey(key) {
    return `${btoa(this.window.location)}.${key}`;
  }

  /**
   * Uses local storage to cycle through array.
   * Returns next array value.
   *
   * @param key
   * @param array
   * @returns {*}
   */
  cycleNext(key, array) {
    return array[this.cycleToMax(key, array.length)];
  }

  /**
   * Uses local storage to cycle through from zero up to max-1.
   * Returns next numeric key.
   *
   * @param key
   * @param max
   * @returns {number}
   */
  cycleToMax(key, max) {
    let last = this.getLocalStorage(key, -1);
    let next = (last + 1) % max;
    this.setLocalStorage(key, next);
    return next;
  }

  /**
   * Flatten content item fields.
   *
   * @param item
   * @returns {*}
   */
  itemFields(item) {
    if (!item.fields) {
      return null;
    }

    let data = {};
    item.fields.forEach(field => {
      _assign(data, field);
    });

    return data;
  }

  /**
   * Filter content items by type.
   *
   * @param items
   * @param type
   */
  itemsOfType(items, type) {
    return _filter(
      items,
      (item) => {
        return item.type === type;
      }
    );
  }

  /**
   * Strip Tags and Decode Entities
   *
   * @param content
   */
  stripTagsDecodeEntities(content) {

    let element = document.createElement('div');

    if (!content || typeof content !== 'string') {
      return;
    }

    // Strip Tags
    content = content.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '')
      .replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');

    // Decode Entities
    element.innerHTML = content;
    content = element.textContent;
    element.textContent = '';

    return content;
  }
}