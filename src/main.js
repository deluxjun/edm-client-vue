import Vue from "vue";

// Redefine console.log method with a custom function
if (process.env.NODE_ENV === "production") {
  window._consolelog = console.log;
  console.log = function() {};
}
window.console = console;

// load first
import i18n from "./i18n";
window["i18n"] = i18n;

// load second

import "@progress/kendo-ui";
// import 'font-awesome/css/font-awesome.css';

import { LayoutInstaller } from "@progress/kendo-layout-vue-wrapper";
import { DropdownsInstaller } from "@progress/kendo-dropdowns-vue-wrapper";
// import { WindowInstaller } from '@progress/kendo-window-vue-wrapper'

// kendo
Vue.use(LayoutInstaller);
Vue.use(DropdownsInstaller);
// Vue.use(WindowInstaller)

import ElementUI from "element-ui";
import locale from "element-ui/lib/locale/lang/en";
// import DlgDraggable from "vue-element-dialog-draggable"

// Vue.use(DlgDraggable);
Vue.use(ElementUI, { locale });

import Utils from "./utils/utils";
import Event from "./utils/event";

import "expose-loader?$!expose-loader?jQuery!jquery";

import Constants from "./Constants";

window.constants = Constants;
Vue.prototype.$Constants = Constants;

window.Utils = Utils;
window.$ = kendo.jQuery;
import store from "./store";
window.store = store;

import VueMq from "vue-mq";

Vue.use(VueMq, {
  breakpoints: {
    // default breakpoints - customize this
    sm: 450,
    md: 1024,
    lg: Infinity
  }
});

// () => import('./bootstrap')
