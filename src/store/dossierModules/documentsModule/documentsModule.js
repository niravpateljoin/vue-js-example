export const moduleDocuments = {
  namespaced: true,
  state: {
    documents: []
  },
  mutations: {
    SET_DOCUMENTS(state, documents) {
      state.documents = documents
    },
    ADD_DOCUMENT(state, document) {
      state.documents.push(document)
    },
    REMOVE_DOCUMENT(state, documentId) {
      state.documents = state.documents.filter((d) => d.id !== documentId)
    },
    RESET_STATE(state) {
      Object.assign(state, {
        documents: []
      })
    }
  },
  actions: {
    /**
     *
     * @param store
     * @param documents
     */
    init(store, documents) {
      if (documents)
        store.commit("SET_DOCUMENTS", documents)
    },
    /**
     *
     * @param store
     * @param document
     */
    addDocument(store, document) {
      store.commit("ADD_DOCUMENT", document)
    },
    /**
     *
     * @param store
     * @param documentId
     */
    removeDocument(store, documentId) {
      store.commit("REMOVE_DOCUMENT", documentId)
    },
    resetDocuments(store) {
      store.commit("RESET_STATE")
    }
  },
  getters: {
    documents: state => state.documents,
    documentsByType: state => type => {
      if (type === 'A_COMMUNIQUER') {
        return state.documents.filter(
          d => d.type !== 'INTERNE' && d.type !== 'PJ_CLIENT'
        )
      }
      return state.documents.filter(
        d => d.type === type
      );
    }
  }
}