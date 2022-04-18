import Vue from "vue";
import Vuex from "vuex";
import VuexPersist from "vuex-persist";

import { moduleDossier } from "./store/dossierModules/dossierModule";
import { moduleForm } from "./store/formModule";
import { moduleApi } from "./store/apiModule";
import { moduleUser } from "./store/userModule";
import { moduleDashboard } from "./store/dashboardModule";
import { moduleSubjectInfoPart } from "./store/dossierModules/subjectModule/subjectInfoPartModule";
import { moduleActionMasse } from "./store/actionsMasseModule";
import { moduleDossiers } from "@/store/dossiersStoreModules/dossiersModule";
import { moduleFacturation } from "@/store/facturationModule";
import { moduleGlobalElements } from "@/store/dossiersStoreModules/globalElementsModule";
import { moduleNotification } from "@/store/notificationModule";
import { moduleSearch } from "@/store/dossiersStoreModules/searchModule";
import { moduleError } from "@/store/errorModule";

Vue.use(Vuex);

const vuexPersist = new VuexPersist({
  key: "nose",
  storage: sessionStorage
});

export default new Vuex.Store({
  state: {
    overlayActive: false
  },
  modules: {
    moduleDossier,
    moduleForm,
    moduleApi,
    moduleUser,
    moduleDashboard,
    moduleSubjectInfoPart,
    moduleActionMasse,
    moduleFacturation,
    moduleNotification
  },
  plugins: [vuexPersist.plugin],
  mutations: {
    SET_OVERLAY(state, bool) {
      state.overlayActive = bool
    }
  },
  actions: {
    resetAllStores: ({ dispatch }) => {
      dispatch("subject/resetState");
      dispatch("resetDossier");
      dispatch("resetForm");
      dispatch("moduleFacturation/resetStore");
    },
    setOverlay(store, bool) {
      store.commit("SET_OVERLAY", bool)
    }
  },
  getters: {
    overlay: state => state.overlayActive
  }
});

export const dossiersStore = new Vuex.Store({
  modules: {
    moduleDossiers,
    moduleGlobalElements,
    moduleSearch,
    moduleError
  }
});
