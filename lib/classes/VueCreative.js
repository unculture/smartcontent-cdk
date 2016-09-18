/**
 * DO NOT EDIT: This file is part of the smartcontent-cdk
 *
 * VueCreative class
 */

import BaseCreative from './BaseCreative';
import Vue from 'vue';

export default class extends BaseCreative {
  constructor(window) {
    super(window);
    this.initVue();
  }

  initVue() {
    if (typeof this.components !== 'function') {
      throw 'Must define method [components()] when extending [VueCreative]';
    }

    this.vue = new Vue({
      el: this.window.document.body,
      components: this.components()
    });
  }
}