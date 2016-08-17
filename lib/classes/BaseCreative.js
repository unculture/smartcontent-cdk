/**
 * DO NOT EDIT: This file is part of the smartcontent-cdk
 *
 * BaseCreative class
 */

import _size from 'lodash/size';

export default class {
  constructor(window) {
    this.window = window;
    this.initEvents();
    this.initFallback();
  }

  /**
   *
   */
  initEvents() {
    this._dataEvents = ['metaData', 'campaignData', 'data'];
    this._dataReceived = {};
  }

  /**
   *
   */
  firePreStartIfDataComplete() {
    if (_size(this._dataReceived) < _size(this._dataEvents)) {
      return;
    }

    this.preStart();
  }

  /**
   *
   * @param event
   * @param data
   */
  receiveData(event, data) {
    // Define handler
    let handler = event + 'Handler';

    // Check handler exists
    if (!this[handler]) {
      // Warn developer if handler is undefined
      console.log(`Method [${handler}] may need to be defined in class [Creative]`);
    } else {
      // Call handler
      this[handler](data);
    }

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

  // FALLBACK
  // --------

  /**
   *
   */
  initFallback() {
    this.fallback = this.elById('fallback');
    this.errorSquares = [];
    [1, 2, 3, 4].forEach((i) => {
      this.errorSquares.push(this.elById('error_square' + i));
    });
  }

  /**
   *
   * @param a
   * @param b
   * @param c
   * @param d
   */
  showFallback(a, b, c, d) {
    this.elShow(this.fallback);

    let colorArray = ["#000", "#FF0000", "#00FF00", "#0000FF", "#FFFFFF"];
    let errorState = [a, b, c, d];
    for (let i in errorState) {
      this.errorSquares[i].style.backgroundColor = colorArray[errorState[i]];
    }
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
}