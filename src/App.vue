<template>
  <v-app>
    <v-overlay :value="overlayActive"></v-overlay>
    <router-view></router-view>
    <error-alert></error-alert>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
import ErrorAlert from "@/components/CommonComponents/Errors/errorAlert";

export default {
  name: "app",
  components: {ErrorAlert},
  mounted() {
    this.$abi.interceptors.request.use(config => {
      let data = {
        user: this.$store.getters.user.username,
        source: "NOSE"
      }
      const switch_username = this.$store.getters.user.switch_username
      if (switch_username) data.switch_username = switch_username
      config.headers = {
        ...config.headers,
        "x-user-info": JSON.stringify(data)
      };
      return config;
    });
    this.$nopm.interceptors.request.use(config => {
      let data = {
        user: this.$store.getters.user.username,
        source: "NOSE"
      }
      const switch_username = this.$store.getters.user.switch_username
      if (switch_username) data.switch_username = switch_username
      config.headers = {
        ...config.headers,
        "x-user-info": JSON.stringify(data)
      };
      return config;
    });
  },
  computed: {
    ...mapGetters(["overlay"]),
    overlayActive() {
      return this.overlay
    }
  },
  beforeDestroy() {
    this.$store.dispatch("moduleNotification/resetNotification");
  }
};
</script>

<style lang="scss">
/*@import "assets/css/style_arca_forms.css";*/
/*@import "assets/css/style_arca_outilprod.css";*/
@import url(https://cdn.jsdelivr.net/npm/animate.css@3.5.1);

/* custom css rules */
@import "assets/css/custom_css.css";
@import "assets/css/colors.css";
@import "assets/css/elements.css";

$body-font-family: "PT Sans Narrow", sans-serif;

$icons-font: "Material Icons";

$appBackgroundColor: "#f5f6fa";
/*
  #app {
    background: $appBackgroundColor;
  }*/

// button {
//   border-radius: unset !important;
// }

.v-select__selections {
  padding-top: 10px !important;
}
.v-text-field input {
  padding: 0 0 8px 0 !important;
}

.theme--light.v-application {
  font-family: $body-font-family !important;
  line-height: 1.5;
  background: #f5f6fa !important;
  color: #39434d;
  overflow-x: hidden;
  font-size: 16px;
  height: 100%;
  -webkit-text-size-adjust: none;
}

* {
  margin: 0;
  box-sizing: border-box; /* For IE and modern versions of Chrome */
  -moz-box-sizing: border-box; /* For Firefox                          */
  -webkit-box-sizing: border-box;
}

a {
  text-decoration: none;
}
.popover {
  z-index: 100 !important;
  -webkit-box-shadow: 0px 2px 1px -1px rgb(0 0 0 / 20%),
    0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%) !important;
  box-shadow: 0px 2px 1px -1px rgb(0 0 0 / 20%),
    0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%) !important;
  border-radius: 10px;
  background: white;
}

.theme--light.v-text-field--filled > .v-input__control > .v-input__slot {
  background: #ffffff !important;
}

section#content input:not(input[readonly="readonly"]) {
  font-family: "PT Sans Narrow", sans-serif;
  font-size: 14px;
  //border: 1px solid #9ca7b3;
  background-color: #ffffff;
}

div.item-content input[type="radio"],
div.item-content input[type="checkbox"] {
  display: none;
}

div.item-content .v-input input,
div.item-content select {
  max-height: 44px !important;
  height: 20px !important;
  min-height: 20px !important;
}

div.item-content .v-text-field .v-label {
  top: 10px;
  left: -5px !important;
}

.v-text-field--filled > .v-input__control > .v-input__slot,
.v-text-field--full-width > .v-input__control > .v-input__slot,
.v-text-field--outlined > .v-input__control > .v-input__slot {
  min-height: 20px !important;
}

.theme--light.v-text-field > .v-input__control > .v-input__slot:before {
  border-color: #c0cddb !important;
}

/*----------- date en 3 inputs --------*/

div.item-content .field.date input[type="text"].date-mm ~ label {
  left: 50px;
}
div.item-content .field.date input[type="text"].date-yyyy ~ label {
  left: 95px;
}

.v-btn-toggle button {
  border-radius: 5px !important;
  background-color: #fff !important;
  border: 0 solid !important;
  margin-left: 10px;
  height: 40px !important;
  &.v-item--active {
    background-color: #009bff !important;
    color: #ffffff !important;
  }
}
.v-btn-toggle button::before:hover {
  background-color: #fff;
}

.multiSelectClassNoScroll {
  overflow-y: hidden !important;
  overflow-x: hidden !important;
  & div[role="option"].v-list-item {
    min-height: 28px;
    height: 28px;
  }
}
.multiSelectClassScrollable {
  & div[role="option"].v-list-item {
    min-height: 28px;
    height: 28px;
  }
}

.v-input
  .v-input__control
  .v-input__slot
  .v-text-field__slot
  input::-webkit-outer-spin-button,
.v-input
  .v-input__control
  .v-input__slot
  .v-text-field__slot
  input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  display: none;
  padding: 8px;
}
.v-text-field input[type="number"] {
  padding: 0px 12px 8px 0 !important;
}
</style>
