import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: "mdi"
  },
  theme: {
    themes: {
      light: {
        primary: '#3598db',
        rouge: '#FF0000',
        vert: '#0CDB0C',
        intSensible: '#FF7F00',
        intNouveau: '#1FBC13',
        warning: "#FFC300",
        globalGrey: '#f5f6fa'
      }
    }
  }
});
