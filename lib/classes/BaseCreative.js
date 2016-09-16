/**
 * DO NOT EDIT: This file is part of the smartcontent-cdk
 *
 * BaseCreative class
 */

import _size from 'lodash/size';
import _assign from 'lodash/assign';
import _filter from 'lodash/filter';

export default class {
  constructor(window) {
    this.window = window;

    this._dataEvents = ['metaData', 'campaignData', 'data'];
    this._dataReceived = {};

    this.fallback = this.elById('fallback');

    this.assetList = [];
    this.assetLoadCount = 0;
  }

  /**
   *
   */
  firePreStartIfDataComplete() {
    if (_size(this._dataReceived) < _size(this._dataEvents)) {
      return;
    }

    this.preStart();
    this.checkAssets();
  }

  /**
   *
   * @param event
   * @param data
   */
  receiveData(event, data) {
    // Attempt to call handler

    this._call(event + 'Handler', [data]);

    // Mark data as received for handler
    this._dataReceived[event] = true;

    this.firePreStartIfDataComplete();
  }

  /**
   * Triggered when all data is received
   */
  preStart() {
    console.log(`Method [preStart] may need to be defined in class [Creative]`);
  }

  /**
   * Triggered at the moment Creative is shown
   */
  start() {
    console.log(`Method [start] may need to be defined in class [Creative]`);
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
   * Available assets. To be overriden by Creative.
   */
  availableAssets() {
    return [];
  }

  /**
   * Collates all active assets.
   *
   * @param data
   */
  collateAssets(data) {
    this.availableAssets().data.forEach((field) => {
      let file = data[field.name];
      if (file) {
        this.assetList.push(_merge({file}, field));
      }
    });
  }

  /**
   * Check if all assets have loaded.
   */
  checkAssets() {
    this.assetList.forEach((asset) => {
      let assetHandler = 'check' + _upperFirst(asset.type);
      this[assetHandler](asset.file);
    });
  }

  /**
   * Check if image has loaded.
   *
   * @param file
   */
  checkImage(file) {
    this.assetsTotal++;
    let img = new Image();
    img.onload = () => {
      this.assetLoadCount++;
      this.fireAssetsLoaded();
    };
    img.src = file;
  }

  /**
   * Check if video has loaded.
   *
   * @param file
   */
  checkVideo(file) {
    this.assetsTotal++;
    let video = document.createElement('video');
    video.src = file;
    video.load();
    video.addEventListener('loadeddata', () => {
      this.assetLoadCount++;
      this.fireAssetsLoaded();
    }, false);
  }

  /**
   * Fire assetsLoaded event if all assets have been loaded
   */
  fireAssetsLoaded() {
    if (this.assetLoadCount >= this.assetList.length) {
      this._call('assetsLoaded');
    }
  }

  /**
   * Attempt to call class method, warn if it doesn't exist.
   *
   * @param method
   * @param params
   * @private
   */
  _call(method, params) {
    if (!this[method]) {
      // Warn developer if handler is undefined
      console.log(`Method [${method}] may need to be defined in class [Creative]`);
      return;
    }

    params = params || [];

    // Call method
    this[method](...params);
  }
}