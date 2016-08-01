/**
 * DO NOT EDIT: This file should not be edited by creative developer
 *
 * JqueryCreative class
 */

import BaseCreative from './BaseCreative';
import jQuery from 'jquery';

export default class extends BaseCreative {
  constructor(window) {
    super(window);
  }

  $(selector) {
    return jQuery(selector, this.window.document);
  }
}