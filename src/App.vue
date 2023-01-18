<template>
  <router-view :dependencies="loaded"></router-view>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "app",
  data() {
    return {
      loaded: false
    };
  },
  mounted() {
    let check = () => {
      if (typeof window.store === 'undefined' || typeof window.store.state.info.features === 'undefined') {
        setTimeout(check, 100)
        return
      }

      this.unload()
    }

    check()

    Event.listen(EventList.CLOSE_POPUPS, this.closePopups);
  },
  methods: {
    unload() {
      this.loaded = true;
      // Remove loading animation.
      let loading = document.getElementById("loading");
      loading.classList.add("done");

      setTimeout(function() {
        loading.parentNode.removeChild(loading);
      }, 200);
    },
    closePopups() {
      $(".js-dropdown")
        .closest(".dropdown")
        .removeClass("is-active");
    }
  }
};
</script>

<!-- npm install node-sass sass-loader -->
<style lang="scss">
@import "@progress/kendo-theme-default/dist/all.css";
@import "element-ui/lib/theme-chalk/index.css";

// @import "element-ui/lib/theme-chalk/display.css";

/* @import 'noty/lib/noty.css'; */
@import "~bulma/sass/utilities/initial-variables";
@import "assets/styles/global_styles.scss";

@import "~bulma/bulma";
/*@import 'bulma/css/bulma.css';*/

@import "normalize.css/normalize.css";
@import "noty/lib/noty.css";

// $fa-font-path: "~font-awesome/fonts";
// @import "font-awesome/css/font-awesome.min.css";
$fa-font-path: "~font-awesome/fonts";
@import '~font-awesome/scss/font-awesome.scss';

html,
body {
  font-family: open-sans, sans-serif, Verdana, Arial;
  font-size: 12pt;
  margin: 0;
  padding: 0;
  height: 100%;
}

/* kendo 전체 font size */
.k-block, .k-widget {
  font-size: 13px;
}

html {
  overflow: hidden;
}

div {
  -webkit-user-select: none; /* webkit (safari, chrome) browsers */
  -moz-user-select: none; /* mozilla browsers */
  -khtml-user-select: none; /* webkit (konqueror) browsers */
  -ms-user-select: none; /* IE10+ */
  user-select: none; /* Standard syntax */
}

/* #app { height: 100%; margin: 0; padding: 0; background-color: #E6E6E6; } */
</style>
