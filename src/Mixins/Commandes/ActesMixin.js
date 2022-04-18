import { DatesMixin } from "@/Mixins/DatesMixin";
import dossierService from "@/services/dossierService";

export const ActesMixin = {
  mixins: [DatesMixin],
  methods: {
    commandeUnitaire(
      civilite,
      interlocuteur,
      enqCode,
      proprietaire,
      client,
      referenceClient,
      typeActe,
      user
    ) {
      let data = this.createCommandeData(
        civilite,
        interlocuteur,
        enqCode,
        proprietaire,
        client,
        referenceClient,
        typeActe,
        user
      );
      return dossierService.postCommandeActe(data);
    },
    commandeActesEnMasse(commandes, user) {
      let data = [];
      commandes.forEach(c => {
        data.push(
          this.createCommandeData(
            c.civilite,
            c.interlocuteur,
            c.enqCode,
            c.proprietaire,
            c.client,
            c.reference,
            c.commande,
            user
          )
        );
      });
      return dossierService.postCommandeActeEnMasse(data);
    },

    createCommandeData(
      civilite,
      interlocuteur,
      enqCode,
      proprietaire,
      client,
      referenceClient,
      typeActe,
      user
    ) {
      let key = process.env.VUE_APP_PF_KEY;
      let civ = civilite;

      let prestation = null;
      switch (proprietaire) {
        case "ARCA":
        case "TDET":
        case "ARGN":
          switch (typeActe) {
            case "naissance":
              prestation = "EC-AN";
              break;
            case "décès":
              prestation = "ACTE-DC";
              break;
            case "mariage":
              prestation = null;
              break;
          }
          break;
        case "YSA":
          switch (typeActe) {
            case "naissance":
              prestation = "ACTE-NAISS";
              break;
            case "décès":
              prestation = "DCD-AC";
              break;
            case "mariage":
              prestation = null;
              break;
          }
          break;
      }

      let dtNais = civ.naissanceDate
        ? this.formatDateTimeToDatePF(civ.naissanceDate.date)
        : null;
      let tiers = [
        {
          type: "PERSONNE PHYSIQUE",
          civilite: civ.civilite,
          nom: civ.nom,
          nom_jf: civ.nomJeuneFille,
          prenom: civ.prenom,
          dt_nais: dtNais,
          cp_nais: civ.naissanceCodePostal
            ? civ.naissanceCodePostal
            : civ.naissancePaysCodeInsee,
          ville_nais: civ.naissanceVille,
          pays_nais: civ.naissancePays ? civ.naissancePays.toUpperCase() : null,
          dt_dc: civ.decesDate
            ? this.formatDateTimeToDatePF(civ.decesDate.date)
            : null,
          cp_dc: civ.decesCodePostal,
          ville_dc: civ.decesVille,
          pays_dc: civ.decesPays ? civ.decesPays.toUpperCase() : null,
          etat_civil: [
            {
              nom_ec: civ.nom,
              prenoms_ec: this.autresPrenoms(
                civ.autresPrenoms ? civ.autresPrenoms : []
              ),
              prenom_ec: civ.prenom,
              nais_ec: dtNais,
              dt_nais: dtNais,
              cp_nais: civ.naissanceCodePostal
                ? civ.naissanceCodePostal
                : civ.naissancePaysCodeInsee,
              ville_nais: civ.naissanceVille
            }
          ]
        }
      ];
      let pfZones = [
        {
          type: "COMMUNE",
          cp: "99999",
          ville: "NO CITY",
          ville_code: "99999",
          deps: null,
          dept_code: null,
          region: null,
          region_code: null,
          spf_code: "000000",
          spfs: [
            {
              code: "000000",
              sous_lot: null
            }
          ]
        }
      ];
      return {
        key: key,
        commands: [
          {
            client: proprietaire,
            date_reception: this.getDateToday(), // date de commande à la PF de l'acte
            dt_sortie: null, // null
            dordre: client,
            reference: null,
            reference_dordre: referenceClient,
            source: "ABI",
            lot_id: null,
            interlocuteur: interlocuteur,
            prestations: [prestation],
            tiers: tiers,
            pf_zones: pfZones
          }
        ],
        dossierEnqCode: enqCode,
        dossierProprietaire: proprietaire,
        personnePhysiqueId: civ.id,
        user: user,
        source: "NOSE"
      };
    },
    autresPrenoms(autresPrenoms) {
      if (autresPrenoms.length === 0) return null;
      let string = "";
      autresPrenoms.forEach((p, i) => {
        string += p.prenom;
        if (i + 1 < autresPrenoms.length) string += ", ";
      });
      return string;
    },

    checkCommandeValide(typeActe, civilite) {
      if (!civilite) return false;
      let checkNom = civilite.nom !== null && civilite.nom !== "";
      let checkPrenom = civilite.prenom !== null && civilite.prenom !== "";
      let checkNomJf = true;
      if (civilite.civilite === "MME") {
        checkNomJf =
          civilite.nomJeuneFille !== null && civilite.nomJeuneFille !== "";
      }
      if (typeActe === "décès") {
        let checkIsDecede = civilite.isDecede !== null;
        let checkDecesDate = civilite.decesDate !== null;
        let checkDecesVille =
          civilite.decesVille !== null && civilite.decesVille !== "";
        let checkDecesCp = true;
        let checkDecesPaysCode = true;
        if (civilite.decesPaysCode === "FR") {
          checkDecesCp = civilite.decesCodePostal !== null;
        } else {
          checkDecesPaysCode =
            civilite.decesPaysCode !== null && civilite.decesPaysCode !== "";
        }

        return (
          checkIsDecede &&
          checkNom &&
          checkPrenom &&
          checkNomJf &&
          checkDecesDate &&
          checkDecesCp &&
          checkDecesPaysCode &&
          checkDecesVille
        );
      } else if (typeActe === "naissance") {
        let checkNaissDate = civilite.naissanceDate !== null;
        let checkNaissanceVille =
          civilite.naissanceVille !== null && civilite.naissanceVille !== "";
        let checkNaissCp = true;
        let checkNaissancePaysCode = true;
        if (civilite.naissancePaysCode === "FR") {
          checkNaissCp = civilite.naissanceCodePostal !== null;
        } else {
          checkNaissancePaysCode =
            civilite.naissancePaysCode !== null &&
            civilite.naissancePaysCode !== "";
        }

        return (
          checkNom &&
          checkPrenom &&
          checkNomJf &&
          checkNaissDate &&
          checkNaissCp &&
          checkNaissancePaysCode &&
          checkNaissanceVille
        );
      }
      return true;
    }
  }
};
