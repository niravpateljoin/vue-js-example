<template>
  <v-dialog max-width="1400px" :value="open" persistent scrollable>
    <v-card max-height="800px">
      <v-card-title>Affectation / Réaffectation / Retraitement</v-card-title>
      <v-card-text>
        <v-container fluid>
          <v-row v-if="dossierUnabletoCreate.length > 0">
            <v-col>
              <div class="font-weight-bold">Les dossiers sélectionnés suivants ne peuvent pas être créés car leur prestation n'est pas traitable dans Nose :&nbsp;</div>
              <span v-for="(d,i) in dossierUnabletoCreate" :key="i">
                {{ d.enqCode }}
                <span v-if="(i+1) < dossierUnabletoCreate.length">,&nbsp;</span>
              </span>
              <div>Vous pouvez cependant les affecter à un gestionnaire dans GEMS</div>
            </v-col>
          </v-row>
          <v-row v-for="etape in [1, 2, 3, 4]" :key="etape">
            <v-col class="py-1" v-if="countDossiersParEtape(etape) > 0">
              <v-row>
                <h3>
                  {{ countDossiersParEtape(etape) }} dossiers en étape
                  {{ etape }}
                </h3>
              </v-row>
              <v-row
                v-for="(prestation, k) in dossiersParEtapeParPrestation[etape]"
                :key="k"
              >
                <v-col class="py-1">
                  <v-row>
                    <v-col cols="auto" class="px-0 py-1">
                      <b>{{ prestation.length }} dossier {{ k }}</b>
                    </v-col>
                    <v-col class="py-0"></v-col>
                    <v-col class="py-0"></v-col>
                    <v-col class="py-1"></v-col>
                    <v-col cols="1" class="pb-1 text-center"
                      ><b>OBJECTIF</b></v-col
                    >
                    <v-col cols="1" class="pb-1 text-center"
                      ><b>REALISE</b></v-col
                    >
                    <v-col cols="1" class="pb-1 text-center"
                      ><b>PREVISIONEL</b></v-col
                    >
                    <v-col cols="1"></v-col>
                  </v-row>
                  <v-divider></v-divider>
                  <template
                    v-if="
                      affectationParEtapeParPrestation[etape] &&
                        affectationParEtapeParPrestation[etape][k]
                    "
                  >
                    <template
                      v-for="(affect, i) in affectationParEtapeParPrestation[
                        etape
                      ][k]"
                    >
                      <LigneAffectation
                        :affect="affect"
                        :nbDossiers="prestation.length"
                        :organisations="organisations"
                        :etape="etape"
                        @setEnqueteur="enq => setEnqueteur(affect, enq)"
                        @setNbDossier="
                          nbDossier => setNbDossier(affect, nbDossier)
                        "
                        @removeAffectation="() => removeAffectation(affect)"
                        @setOrganisation="
                          organisation => setOrganisation(affect, organisation)
                        "
                        @deleteOrganisation="deleteOrganisation(affect)"
                        :montant-theo="
                          parseFloat(
                            dossiersParEtapeParPrestation[etape][k][0]
                              .montantTheo
                          )
                        "
                        :key="i"
                      >
                      </LigneAffectation>
                    </template>
                  </template>
                  <v-row>
                    <v-col class="px-0 py-1">
                      <v-btn
                        v-if="
                          !affectationParEtapeParPrestation[etape] ||
                            !affectationParEtapeParPrestation[etape][k] ||
                            (affectationParEtapeParPrestation[etape] &&
                              affectationParEtapeParPrestation[etape][k] &&
                              affectationParEtapeParPrestation[etape][k]
                                .length < prestation.length)
                        "
                        x-small
                        @click="ajout(etape, k)"
                        color="primary"
                        :loading="loading"
                      >
                        Ajouter un enquêteur
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row v-if="errorMessage">
            <v-col>
              <v-alert color="error" outlined>{{ errorMessage }}</v-alert>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="$emit('close')" color="red" dark>annuler</v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="affectAll()" color="primary" :loading="loading">
          Valider
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import nopmService from "@/services/nopmService";
import { UserMixin } from "@/Mixins/UserMixin";
import dossierService from "@/services/dossierService";
import IconTooltip from "@/components/CommonComponents/IconTooltip";
import LigneAffectation from "@/components/ActionsMasse/LigneAffectation";

export default {
  name: "ModaleAffectationEnMasse",
  components: { LigneAffectation, IconTooltip },
  mixins: [UserMixin],
  props: {
    dossiers: {
      type: Array
    },
    open: {
      type: Boolean
    }
  },
  data() {
    return {
      affectation: [],
      organisations: [],
      enqueteurs: [],
      loading: false,
      errorMessage: null
    };
  },
  mounted() {
    this.loading = true;
    dossierService
      .getAffectationOrganisations()
      .then(res => {
        this.organisations = res.data;
      })
      .finally(() => (this.loading = false));
  },
  computed: {
    dossiersParEtapeParPrestation() {
      let dossiersParEtapeParPrestation = {};
      this.dossiers.forEach(d => {
        let etape = d.etape;
        let prestation = d.prestationRealisee
            ? d.prestationRealisee
            : d.prestation;

        if (!dossiersParEtapeParPrestation[etape]) {
          dossiersParEtapeParPrestation[d.etape] = {};
        }

        if (!dossiersParEtapeParPrestation[etape][prestation]) {
          dossiersParEtapeParPrestation[etape][prestation] = [d];
        } else {
          dossiersParEtapeParPrestation[etape][prestation].push(d);
        }
      });

      return dossiersParEtapeParPrestation;
    },
    dossierUnabletoCreate() {
      return this.dossiers.filter((d) => !d.canCreateInAbi)
    },
    affectationParEtapeParPrestation() {
      let affectations = {};
      this.affectation.forEach(a => {
        if (a.etape && !affectations[a.etape]) {
          affectations[a.etape] = {};
        }
        if (a.prestation && !affectations[a.etape][a.prestation]) {
          affectations[a.etape][a.prestation] = [];
        }
        affectations[a.etape][a.prestation].push(a);
      });
      return affectations;
    },
    dossierLength() {
      return this.dossiers.length;
    }
  },
  watch: {
    dossierLength(val) {
      if (val === 0) {
        this.$emit("close");
        this.$emit("reload");
      }
    }
  },
  methods: {
    setOrganisation(affectation, organisation) {
      this.affectation.find(a => a === affectation).enq = null;
      this.affectation.find(a => a === affectation).objectif = null;
      this.affectation.find(a => a === affectation).organisation =
        organisation.MNEMONIQUE_ORGANISATION;
      this.affectation.find(a => a === affectation).type_organisation =
        organisation.TYPE_ORGANISATION;
    },
    deleteOrganisation(affectation) {
      this.affectation.find(a => a === affectation).organisation = null;
      this.affectation.find(a => a === affectation).type_organisation = null;
      this.affectation.find(a => a === affectation).enq = null;
      this.affectation.find(a => a === affectation).objectif = null;
    },
    countDossiersParEtape(etape) {
      let count = 0;
      if (this.dossiersParEtapeParPrestation[etape]) {
        Object.values(this.dossiersParEtapeParPrestation[etape]).forEach(e => {
          count += e.length;
        });
      }
      return count;
    },
    ajout(etape, prestation) {
      if (this.enqueteurs.length === 0) {
        this.getEnqueteurs();
      }
      let organisation = this.organisations.find(
        o => o.MNEMONIQUE_ORGANISATION === this.userOrganisation
      );
      this.affectation.push({
        etape: etape,
        prestation: prestation,
        nbDossiers: 1,
        enq: null,
        organisation:
          organisation.TYPE_ORGANISATION === "INTERNE"
            ? null
            : organisation.MNEMONIQUE_ORGANISATION,
        type_organisation: organisation.TYPE_ORGANISATION
      });
    },
    setEnqueteur(affectation, enqueteur) {
      this.affectation.find(a => a === affectation).enq = enqueteur;
      this.affectation.find(a => a === affectation).objectif =
        enqueteur.objectif;
      this.affectation.find(a => a === affectation).organisation =
        enqueteur.branch_mnemonique;
      this.affectation.find(a => a === affectation).type_organisation =
        enqueteur.type_organisation;
    },
    setNbDossier(affectation, nbDossier) {
      this.affectation.find(a => a === affectation).nbDossiers = parseInt(
        nbDossier
      );
    },
    removeAffectation(affect) {
      this.affectation = this.affectation.filter(a => a !== affect);
    },
    getEnqueteurs() {
      this.loading = true;
      dossierService
        .getGestionnairesAffectation()
        .then(res => {
          this.enqueteurs = res.data.map(r => {
            return {
              value: r.USERNAME,
              text: "[" + r.USERNAME + "] " + r.LASTNAME + " " + r.FIRSTNAME,
              objectif: r.OBJECTIF
            };
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },
    affectAll() {
      this.loading = true;

      let BreakException = {};
      let masseArgs = [];
      let dossiersPicked = [];
      try {
        this.affectation.forEach(a => {
          if (!a.organisation) return;
          let picked = this.pickDossiers(
            a.etape,
            a.prestation,
            a.nbDossiers,
            dossiersPicked
          );
          dossiersPicked.push(...picked);
          if (!picked) throw BreakException;
          else {
            picked.forEach(p =>
              masseArgs.push({
                action: "affecter",
                enqCode: p.enqCode,
                proprietaire: p.proprietaire,
                organisation: a.organisation,
                organisation_type: a.type_organisation,
                nouvel_enqueteur: a.enq ? a.enq.value : null,
                prestation: a.prestation,
                gestionnaire: this.userCodeGestionnaire,
                canCreate: p.canCreateInAbi
              })
            );
          }
        });
      } catch (e) {
        this.loading = false;
        if (e !== BreakException) throw e;
        else return;
      }

      if (masseArgs.length > 0) {
        dossierService
          .bulkPatchAffectation(masseArgs.filter(ma => ma.canCreate))
          .then(res => {
            nopmService
              .actionEnMasse(masseArgs)
              .then(() => {
                this.$emit("pop", dossiersPicked);
                this.affectation = [];
              })
              .catch(e => {
                this.$debug && console.log(e.response);
                this.errorMessage =
                  "problème lors de l'appel aux actions en masse";
              })
              .finally(() => {
                this.loading = false;
              });
          })
          .catch(e => {
            this.$dossierStore.dispatch("addError", {text: e.response.data.title, type: 'error'})
            this.$debug && console.log(e.response);
            this.errorMessage = "problème lors de l'update des affectations";
            this.loading = false;
          });
      } else {
        this.loading = false;
      }
    },

    pickDossiers(etape, presta, nbDossiers, alreadyPicked) {
      let doss = this.dossiersParEtapeParPrestation[etape][presta].filter(d =>
        alreadyPicked.every(a => a.enqCode !== d.enqCode)
      );

      if (doss.length < nbDossiers || nbDossiers === 0) {
        this.errorMessage =
          "Nombre de dossiers à affecter supérieur au nombre de dossiers sélectionné.";
        return false;
      }
      return doss.slice(0, nbDossiers);
    }
  }
};
</script>

<style scoped></style>
