/**
 * DO NOT EDIT: This file should not be edited by creative developer
 *
 * VueCreative class
 */

import BaseCreative from './BaseCreative';
import Vue from 'vue';

export default class extends BaseCreative {
  constructor(window) {
    super(window);
    this.init();
  }

  init() {
    if (typeof this.components !== 'function') {
      throw 'Must define method [components()] when extending [VueCreative]';
    }

    this.vue = new Vue({
      el: this.window.document.body,
      components: this.components()
    });
  }
}