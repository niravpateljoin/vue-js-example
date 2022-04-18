/**
 * Module vuex pour la gestion des dossiers à traiter en masse
 */
export const moduleActionMasse = {
    namespaced: true,
    state: {
        dossiersInitiaux: null,
        dossiersATraiter: null,
        infosFactu: null
    },
    mutations: {
        SET_DOSSIERS_INITIAUX(state, dossiersInitiaux) {
            state.dossiersInitiaux = dossiersInitiaux
        },
        SET_DOSSIERS_A_TRAITER(state, dossiersATraiter) {
            state.dossiersATraiter = dossiersATraiter
        },
        REMOVE_DOSSIER_A_TRAITER(state, dossierATraiter) {
            state.dossiersATraiter = state.dossiersATraiter.filter((d) => d.enqCode !== dossierATraiter.enqCode)
        },
        REMOVE_DOSSIER_INITIAL(state, dossierInitial) {
            state.dossiersInitiaux = state.dossiersInitiaux.filter((d) => d.enqCode !== dossierInitial.enqCode)
        },
        RESET_STATE(state) {
            state.dossiersInitiaux = null;
            state.dossiersATraiter = null;
            state.infosFactu = null;
        },
    },
    actions: {
        setDossiersInitiaux(store, dossierInitiaux) {
            return store.commit("SET_DOSSIERS_INITIAUX", dossierInitiaux);
        },
        setDossiersATraiter(store, dossiersATraiter) {
            return store.commit("SET_DOSSIERS_A_TRAITER", dossiersATraiter);
        },
        removeDossierATraiter(store, dossierATraiter) {
            return store.commit ("REMOVE_DOSSIER_A_TRAITER", dossierATraiter)
        },
        removeDossierInitial(store, dossierInitial) {
            return store.commit("REMOVE_DOSSIER_INITIAL", dossierInitial)
        },
        resetState(store) {
            store.commit("RESET_STATE");
        },
    },
    getters: {
        dossiersInitiaux: state => state.dossiersInitiaux,
        dossiersATraiter: state => state.dossiersATraiter
    },
};
