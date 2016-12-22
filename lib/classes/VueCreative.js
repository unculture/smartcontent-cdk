/**
 * DO NOT EDIT: This file is part of the smartcontent-cdk
 *
 * VueCreative class
 */

import BaseCreative from './BaseCreative';
import Vue from 'vue';
import _merge from 'lodash/merge';

export default class extends BaseCreative {

  /**
   * Constructor
   *
   * @param window
   */
  constructor(window, curtain) {
    super(window, curtain);
    this.initVue();
  }

  /**
   * Initialise Vue
   */
  initVue() {
    if (typeof this.components !== 'function') {
      throw 'Must define method [components()] when extending [VueCreative]';
    }

    this.vue = new Vue({
      el: this.window.document.body,
      components: _merge(this._components(), this.components())
    });
  }

  /**
   * CDK Components
   *
   * @returns {*}
   * @private
   */
  _components() {
    return {};
  }
}