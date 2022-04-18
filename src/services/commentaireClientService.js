import abi from "../axios-instance";

export default {
  getCommentaires(dossierId) {
    return abi.get("nose/dossier/commentaireClient/getAll/" + dossierId);
  },
  getPremadeComments() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              comment:
                "Commentaire pré-composé n°1, on ne présentera que les XXX premiers caractères et on peut le supprimer avec ce bouton à droite",
            },
            {
              comment:
                "Commentaire pré-composé n°2, on ne présentera que les XXX premiers caractères et on peut le supprimer avec ce bouton à droite",
            },
            {
              comment:
                "Commentaire pré-composé n°3,  on peut le supprimer avec ce bouton à droite",
            },
          ],
        });
      }, 300);
    });
  },
  updateCommentaire(comId, content) {
    return abi.patch("nose/dossier/commentaireClient/update", {
      commentaireId: comId,
      content: content,
    });
  },
  putCommentaire(dossierId, item, content) {
    return abi.put("nose/dossier/commentaireClient/create", {
      dossierId: dossierId,
      item: item,
      content: content,
    });
  },
};
