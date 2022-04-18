import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import $AxiosABI, {axiosNOPM} from "./axios-instance";
import store from "./store";
import { dossiersStore } from "./store";
import { router } from "./router/router";
import { registered_components } from "./component_register";
import * as VueGoogleMaps from "gmap-vue";
import "leaflet/dist/leaflet.css";
import "splitpanes/dist/splitpanes.css";
import VueHtmlToPaper from "vue-html-to-paper";
import VueLodash from "vue-lodash";
import lodash from "lodash";
import { loggerMixin } from "./Mixins/LoggerMixin";
import { VueReCaptcha } from "vue-recaptcha-v3";
import { DroitsMixin } from "@/Mixins/DroitsMixin";

export const debug =
  process.env.VUE_APP_ENV === "local" || process.env.VUE_APP_ENV === "dev";
Vue.config.productionTip = false;
Vue.config.silent = !debug;
Vue.config.devtools = debug;

const options = {
  name: "_blank",
  specs: ["fullscreen=yes", "titlebar=yes", "scrollbars=yes"],
  styles: [
    "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
    "https://unpkg.com/kidlat-css/css/kidlat.css",
    "css/ficheSuiveusePrint.css"
  ]
};
Vue.use(VueHtmlToPaper, options);
Vue.use(VueLodash, { name: "custom", lodash: lodash });
Vue.use(VueReCaptcha, {
  siteKey: process.env.VUE_APP_RECAPTCHA_V3_SITE_KEY,
  loaderOptions: {
    autoHideBadge: true
  }
});

/**
 * On crée une instance d'Axios pour les communications avec ABI puis on en fait une propriété de notre Vue,
 * les URL de nos requêtes Axios seront préfixées par l'URL définie dans le .env (selon l'environnement)
 * On créera d'autres instances avec d'autres URL, comme un $AxiosData, pour interroger les infos partenaires
 */

//debug des requêtes à l'API
$AxiosABI.interceptors.request.use(config => {
  debug && console.log(config);
  return config;
});
//debug des réponses de l'API
$AxiosABI.interceptors.response.use(config => {
  debug && console.log(config);
  return config;
});

Vue.prototype.$abi = $AxiosABI;
Vue.prototype.$nopm = axiosNOPM
Vue.prototype.$debug = debug;
Vue.prototype.$dossierStore = dossiersStore;
Vue.prototype.$env = process.env;

Vue.use(VueGoogleMaps, {
  installComponents: true,
  load: {
    key:
      process.env.VUE_APP_ENV === "local"
        ? process.env.VUE_APP_GMAP_MYAPI_KEY
        : process.env.VUE_APP_GMAP_API_KEY,
    libraries: "places"
  }
});

///////////////////////////// Définition de filters globaux //////////////////////////////////////////////
Vue.filter("upper", function(value) {
  if (!value) return "";
  value = value.toString();
  return value.toUpperCase();
});
Vue.filter("capitalize", function(value) {
  if (!value) return "";
  value = value.toString();
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
});
Vue.filter("splitNumber", function(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
});
///////////////////////////// Fin des filters ///////////////////////////////////////////////////////////
Vue.mixin(loggerMixin);
Vue.mixin(DroitsMixin);

// Enregistrement des composants asynchrones /
registered_components.forEach(component => {
  Vue.component(component.component_name, () =>
    import("@/components/Dossier/Items/" + component.component_path)
  );
});

new Vue({
  vuetify,
  store,
  dossiersStore,
  router,
  render: h => h(App)
}).$mount("#app");
