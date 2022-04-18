import abi from "../axios-instance";

export default {
  getCommentairesByComponent(dossierId, component) {
    return abi.get(
      "nose/dossier/commentaire/internalComment?dossierId=" +
        dossierId +
        "&component=" +
        component
    );
  },
  deleteCommentaireLu(gestionnaire, id) {
    return abi.delete(
      "nose/dossier/commentaireLu/delete/" + id + "/" + gestionnaire
    );
  },
  putCommentaire(commentaire) {
    return abi.put("nose/dossier/commentaire/newInternalComment", commentaire);
  },
  putCommentaireLu(data) {
    return abi.put("nose/dossier/commentaireLu/create", data);
  }
};
