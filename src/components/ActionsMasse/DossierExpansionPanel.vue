<template>
  <v-expansion-panel
    v-if="itemsOriginaux && itemsResults && infosResultats.dossier"
  >
    <v-expansion-panel-header
      hide-actions
      :class="{
        'blue lighten-4': evenPanel,
        'teal lighten-5': !evenPanel
      }"
      class="py-0"
    >
      <v-row class="center d-flex align-center py-0">
        <v-col cols="9" class="py-0">
          <v-row>
            <v-col class="py-0" cols="auto">
              <v-icon>mdi-chevron-down</v-icon>
            </v-col>
            <v-col class="py-0" cols="auto">
              <span class="font-weight-bold">{{ dossier.proprietaire }}</span>
              {{ infosResultats.dossier.enqCode }}
              <template v-if="infosResultats.dossier.couple">
                <span
                  v-for="couple in infosResultats.dossier.couple"
                  :key="couple.enqCode"
                  :style="{ color: couple.etape === '2' ? 'red' : '' }"
                >
                  ({{ couple.enqCode }})
                </span>
              </template>
            </v-col>
            <v-col class="py-0">{{ infosResultats.dossier.etape }}</v-col>
            <v-col
              class="py-0"
              :class="{
                'font-weight-bold': infosResultats.dossier.type !== 'N'
              }"
            >
              {{ dossier.type }}
            </v-col>
            <v-col class="py-0">
              {{ dossier.score !== null ? dossier.score : "-" }}
            </v-col>
            <v-col class="py-0" cols="2">
              {{ infosResultats.dossier.cliCode }}
              <span>
                {{
                  interlocuteurSensible
                    ? "(interlocuteur sensible)"
                    : interlocuteurNouveau
                    ? "(nouvel interlocuteur)"
                    : ""
                }}
              </span>
            </v-col>
            <v-col class="py-0">
              {{ infosResultats.dossier.prestation }}
            </v-col>
            <v-col class="py-0">
              {{ formatDate(infosResultats.dossier.receivedAt.date) }}
            </v-col>
            <v-col class="py-0">
              {{ infosResultats.dossier.enqueteurCode }}
            </v-col>
            <v-col class="py-0" cols="2">
              {{
                infosClientInitiales.synthese.results["Civilité"]["Civilité"][
                  "Nom de famille"
                ].value
              }}
              {{
                infosClientInitiales.synthese.results["Civilité"]["Civilité"][
                  "Prénom"
                ].value
              }}
            </v-col>
            <v-col class="py-0">
              {{ formatDate(infosResultats.dossier.predictedAt.date) }}
            </v-col>
            <v-col class="py-0">
              <v-icon :color="clockColor">mdi-clock-outline</v-icon>
            </v-col>
            <v-col class="py-0">
              {{
                infosResultats.resultatGlobal !== null
                  ? infosResultats.resultatGlobal
                  : "N.C"
              }}
            </v-col>
            <v-col class="py-0" cols="auto">
              <v-chip
                v-if="interlocuteurSensible || interlocuteurNouveau"
                :color="interlocuteurSensible ? 'intSensible' : 'intNouveau'"
              >
                {{ infosResultats.dossier.prestationRealisee }}
              </v-chip>
              <span v-else class="font-weight-bold">
                {{ infosResultats.dossier.prestationRealisee }}
              </span>
            </v-col>
          </v-row>
        </v-col>
        <v-divider vertical></v-divider>
        <v-col class="py-0">
          <v-row class="d-flex justify-space-around">
            <v-btn color="primary" @click.stop="$emit('goToDossier', dossier)"
              >Accéder au dossier</v-btn
            >
            <v-btn color="primary" v-if="dossier.type === 'CE'"
              >Accéder au dossier initial</v-btn
            >
          </v-row>
        </v-col>
        <v-divider vertical></v-divider>
        <v-col cols="auto" class="px-0">
          <v-icon color="rouge" class="float-right" @click.stop="removeDossier">
            mdi-close-circle-outline
          </v-icon>
        </v-col>
      </v-row>
    </v-expansion-panel-header>
    <v-expansion-panel-content
      ref="panelContent"
      class="pb-0"
      :class="{
        'light-blue lighten-5': evenPanel,
        white: !evenPanel
      }"
    >
      <v-container fluid class="pa-0">
        <v-row class="">
          <v-col :cols="leftCol" class="py-0">
            <v-row class="pa-0 ma-0 font-weight-bold client-section">
              CLIENT
            </v-row>
            <v-row class="client-section py-0">
              <v-col class="pa-0">
                <v-slide-group center-active show-arrows>
                  <v-slide-item
                    v-for="(item, n) in itemsOriginaux"
                    :key="n"
                    v-slot="{ active, toggle }"
                  >
                    <v-card
                      class="ma-2 py-0"
                      height="auto"
                      :style="item[1].style ? item[1].style : ''"
                    >
                      <v-card-title class="mb-n4 pt-2 font-weight-bold">
                        {{ item[0] }}
                      </v-card-title>
                      <v-card-text>
                        <div v-for="(row, i) in item[1].content" :key="i">
                          {{ row }}
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-slide-item>
                </v-slide-group>
              </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row class="pa-0 ma-0 font-weight-bold resultat-section">
              RESULTATS
              <span
                class="ml-5"
                v-if="!infosResultats.synthese.rapportValid"
                style="color: red;"
              >
                Attention : des résultats ont été modifiés, vous devriez
                regénérer le rapport
              </span>
            </v-row>
            <v-row class="resultat-section">
              <v-col class="pa-0">
                <v-slide-group
                  v-model="slider"
                  center-active
                  show-arrows="always"
                  mandatory
                >
                  <v-slide-item
                    v-for="(item, n) in itemsResults"
                    :key="n"
                    v-slot="{ active, toggle }"
                  >
                    <v-card
                      class="ma-2 py-0"
                      height="auto"
                      :style="item[1].style ? item[1].style : ''"
                      @click="toggle"
                      :ripple="false"
                      width="325"
                      style="overflow-y: auto"
                    >
                      <v-card-title class="mb-n4 pt-2 font-weight-bold">
                        {{ item[0] }}
                        <v-icon
                          v-if="item[1]['modifiable']"
                          right
                          color="primary"
                          small
                          @click="openModifyModale(item[1]['modifiable'])"
                        >
                          mdi-pencil
                        </v-icon>
                        <v-icon
                          color="primary"
                          right
                          small
                          @click="openDetailModale(item[1].content)"
                        >
                          mdi-arrow-expand
                        </v-icon>
                      </v-card-title>
                      <v-card-text>
                        <template
                          v-if="item[0] === 'Réseaux' || item[0] === 'Articles'"
                        >
                          <div
                            v-for="(row, i) in item[1].content"
                            :key="i"
                            v-html="row"
                          ></div>
                        </template>
                        <template v-else>
                          <div v-for="(row, i) in item[1].content" :key="i">
                            {{ excerpt(row) }}
                          </div>
                          <div
                            v-if="
                              item[1].documents && item[1].documents.length > 0
                            "
                          >
                            <div
                              v-for="(document, index) in item[1].documents"
                              class="font-weight-bold mt-2"
                              :key="index"
                              @click="
                                () => {
                                  if (document.etat === 'RECU') {
                                    downloadFile(
                                      document.nom,
                                      document.filename
                                    );
                                  }
                                }
                              "
                            >
                              <span
                                :class="{
                                  red: document.type === 'ACTE_DE_DECES',
                                  primary: document.type === 'ACTE_DE_NAISSANCE'
                                }"
                                class="pa-1 rounded"
                              >
                                {{ document.type }} ({{ document.etat }})
                              </span>
                            </div>
                          </div>
                        </template>
                      </v-card-text>
                    </v-card>
                  </v-slide-item>
                </v-slide-group>
              </v-col>
            </v-row>
          </v-col>
          <v-col
            :cols="rightCol"
            class="py-1"
            style="display: flex; position: relative"
          >
            <v-row>
              <v-col cols="12" class="py-0">
                <v-container class="factu-component py-0 pl-0">
                  <v-row>
                    <v-col cols="11">
                      <v-btn
                        v-show="factuComponentOpen"
                        x-small
                        fab
                        @click="toggleFactu"
                        style="position: absolute; z-index: 9;"
                      >
                        <v-icon small>mdi-arrow-right</v-icon>
                      </v-btn>
                      <FacturationDossier
                        class="toggable-content"
                        :dossier="dossier"
                        :proprietaire="dossier.proprietaire"
                        :synthese="infosResultats.synthese.results"
                        fromActionMasse
                        :testRecap="factuComponentOpen"
                        :dossierFacture="
                          dossier.etape === '5' || actionEnabled === 'AJTAVR'
                        "
                        @toggle="toggleFactu"
                        @validationFactu="validationFactu"
                        :action-enabled="actionEnabled"
                      >
                      </FacturationDossier>
                      <facturation-sous-traitance-dossier
                        v-if="factuComponentOpen"
                        :dossier="dossier"
                        :proprietaire="dossier.proprietaire"
                        :dossier-facture="dossier.etape === '5'"
                        :from-action-masse="true"
                      >
                      </facturation-sous-traitance-dossier>
                    </v-col>
                  </v-row>
                </v-container>
              </v-col>
              <v-col
                cols="12"
                :class="{ 'align-self-end': !factuComponentOpen }"
                class="py-0"
              >
                <v-btn-toggle
                  color="#3598db"
                  v-model="actionUnitaire"
                  :class="{ 'flex-column': !factuComponentOpen }"
                  :background-color="evenPanel ? '#E1F5FE ' : '#FFF'"
                  v-if="
                    !['affecter', 'reaffecter', 'retraiter'].includes(
                      actionUnitaire
                    )
                  "
                >
                  <v-btn
                    style="max-height: 30px!important;"
                    tile
                    :class="{ 'mb-2': !factuComponentOpen }"
                    filled
                    :disabled="dossier.etape !== '1'"
                    value="affecter"
                    >Affectation</v-btn
                  >
                  <v-btn
                    style="max-height: 30px!important;"
                    tile
                    :class="{ 'mb-2': !factuComponentOpen }"
                    filled
                    :disabled="dossier.etape !== '2'"
                    value="affecter"
                    >Réaffectation</v-btn
                  >
                  <v-btn
                    style="max-height: 30px!important;"
                    tile
                    :class="{ 'mb-2': !factuComponentOpen }"
                    filled
                    :disabled="dossier.etape < '3'"
                    value="affecter"
                    >Retraitement</v-btn
                  >
                  <v-btn
                    style="max-height: 30px!important;"
                    tile
                    filled
                    :disabled="dossier.etape < '3'"
                    value="retour"
                    >Retour</v-btn
                  >
                  <retour-modale
                    :dossiers="[dossier]"
                    :opened="actionUnitaire === 'retour'"
                    @close="actionUnitaire === ''"
                    @retourDossierConfirme="retourDossierConfirme"
                    :defaultComments="defaultComments"
                    :loading="retourEnqueteurLoading"
                  ></retour-modale>
                </v-btn-toggle>

                <v-col
                  class="py-0"
                  :class="{ 'flex-column align-self-end': !factuComponentOpen }"
                  v-if="
                    ['affecter', 'reaffecter', 'retraiter'].includes(
                      actionUnitaire
                    )
                  "
                >
                  <affectation-select
                    :gestionnaires="
                      gests.filter(
                        g => infosResultats.dossier.enqueteurCode !== g.USERNAME
                      )
                    "
                    :dossier="infosResultats.dossier"
                    @affectationDossier="executeAffectation"
                    :loadingAffectation="false"
                    :affectations="infosResultats.dossier.affectations"
                  ></affectation-select>
                  <v-btn color="rouge" text @click="actionUnitaire = ''">
                    Annuler
                  </v-btn>
                </v-col>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row class="commentaire-section py-0 my-0">
          <v-col v-if="infosResultats.commentaires.length > 0">
            <p class="font-weight-bold">Commentaires</p>
            <v-row>
              <v-col
                v-for="commentaire in infosResultats.commentaires"
                :key="commentaire.id"
                cols="12"
                class="py-0 my-0 pointer"
              >
                <v-row class="py-0 my-0 pr-0">
                  <v-col cols="auto" class="py-0 my-0 pr-0">
                    <span class="font-weight-bold"
                      >{{ commentaire.item }} :
                    </span>
                  </v-col>
                  <v-col class="py-1 my-0 pr-0">
                    <v-textarea
                      hide-details
                      class="py-0 my-0"
                      filled
                      v-model="commentaire.content"
                      auto-grow
                      rows="1"
                      @blur="
                        $event => {
                          commentaire.content = $event.target.value;
                          modifComment(commentaire);
                        }
                      "
                    >
                    </v-textarea>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
          <v-col v-else class="font-weight-bold">
            Pas de commentaires
          </v-col>
        </v-row>
      </v-container>
    </v-expansion-panel-content>
    <v-dialog persistent max-width="500" v-model="modificationModale">
      <v-card>
        <v-card-title>Modification de champ</v-card-title>
        <v-card-text>
          <v-form>
            <v-list>
              <v-list-item
                v-for="(data, index) in dataForModification"
                :key="index"
              >
                <v-select
                  v-if="data.type === 'select'"
                  :label="data.label"
                  :items="data.choices"
                  v-model="data.value"
                ></v-select>
                <v-text-field
                  v-else-if="data.type === 'text'"
                  :label="data.label"
                  v-model="data.value"
                ></v-text-field>
                <v-textarea
                  v-if="data.type === 'textarea'"
                  :label="data.label"
                  auto-grow
                  v-model="data.value"
                ></v-textarea>
              </v-list-item>
            </v-list>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="modificationModaleLoader"
            color="primary"
            @click="modifyValue"
            >Valider</v-btn
          >
          <v-btn
            :loading="modificationModaleLoader"
            color="error"
            @click="cancelModification"
            >Annuler</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog max-width="500" v-model="detailModale">
      <v-card>
        <v-card-title>Contenu de la carte</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="(data, index) in detailModaleContent"
              :key="index"
            >
              {{ data }}
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="modificationModaleLoader"
            color="primary"
            @click="closeDetailModale"
            >Ok</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog max-width="500" v-model="trameModale">
      <v-card>
        <v-card-title>Selection de la trame</v-card-title>
        <v-card-text>
          Vous avez modifié des résultats. Veuillez selectionner une trame pour
          générer le rapport:

          <v-select
            solo
            label="Selection de la trame ..."
            :items="trames"
            item-text="NOM"
            v-model="selectedTrame"
            item-value="ID"
            hide-details
          >
          </v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn
            :loading="trameLoading"
            color="error"
            @click="() => (trameModale = false)"
          >
            Ne pas générer
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            :loading="trameLoading"
            color="primary"
            :disabled="!selectedTrame"
            @click="() => tryGenerateRapport(dossier.id, selectedTrame)"
          >
            Générer le rapport
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-expansion-panel>
</template>
<script>
import FacturationDossier from "../CommonComponents/FacturationDossier";
import resSubjectService from "../../services/resSubjectService";
import { DatesMixin } from "@/Mixins/DatesMixin";
import { UserMixin } from "@/Mixins/UserMixin";
import { FacturationMixin } from "@/Mixins/FacturationMixin";
import AffectationSelect from "../CommonComponents/AffectationSelect";
import nopmService from "../../services/nopmService";
import RetourModale from "@/components/CommonComponents/RetourModale";
import { ToolsMixin } from "@/Mixins/ToolsMixin";
import FacturationSousTraitanceDossier from "@/components/CommonComponents/FacturationSousTraitanceDossier";
import { DocumentMixin } from "@/Mixins/DocumentMixin";
import dossierService from "@/services/dossierService";
import rapportService from "@/services/rapportService";

export default {
  name: "DossierExpansionPanel",
  props: ["dossier", "index", "gests", "defaultComments"],
  components: {
    FacturationSousTraitanceDossier,
    RetourModale,
    FacturationDossier,
    AffectationSelect
  },
  mixins: [DatesMixin, UserMixin, FacturationMixin, ToolsMixin, DocumentMixin],
  data: () => {
    return {
      fab: false,
      width: {
        container: 0,
        window: 576
      },
      facturationData: null,
      dossierData: null,
      panelOpen: false,
      actionUnitaire: "",
      retourEnqueteurLoading: false,
      factuComponentOpen: false,
      infosClientInitiales: {
        dossier: null,
        synthese: null
      },
      infosResultats: {
        dossier: null,
        synthese: null,
        resultatGlobal: null,
        commentaires: []
      },
      commentToModify: {},
      newComment: "",
      itemsOriginaux: [],
      itemsResults: [],
      leftCol: 9,
      rightCol: 3,
      slider: null,
      initialData: {},
      dataForModification: {},
      modificationModale: false,
      modificationModaleLoader: false,
      detailModaleContent: {},
      detailModale: false,
      invalidReportMessage: false,
      infosFacturation: [],
      actionEnabled: null,

      trames: [],
      selectedTrame: null,
      trameModale: false,
      trameLoading: false
    };
  },
  mounted() {
    this.getInfosResultats();
    this.getInfosFacturation();
  },
  computed: {
    interlocuteurSensible() {
      return this.dossier.intQualif === "INT_SENSIBLE";
    },
    interlocuteurNouveau() {
      return this.dossier.intQualif === "INT_NOUV";
    },
    evenPanel() {
      return this.index % 2 === 0;
    },
    clockColor() {
      switch (this.dossier.puce) {
        case "orangy":
          return "#ED7D31";
        case "greeny":
          return "#00B050";
        case "redybold":
          return "#FF0000";
        case "redy":
          return "#203864";
        case "bluey":
          return "#00b0f0";
        case "greyy":
          return "#7f7f7f";
        default:
          return "#000";
      }
    }
  },
  methods: {
    openDetailModale(content) {
      this.detailModaleContent = content;
      this.detailModale = true;
    },
    closeDetailModale() {
      this.detailModaleContent = {};
      this.detailModale = false;
    },
    getInfosFacturation() {
      return dossierService
        .getInfosFacturation(this.dossier.proprietaire, this.dossier.enqCode)
        .then(res => {
          this.infosFacturation = res.data.infos;
          this.actionEnabled = res.data.action;
        });
    },
    getInfosResultats() {
      return resSubjectService
        .getSyntheseInformations(this.dossier.id, this.dossier.debCode)
        .then(res => {
          this.infosResultats.dossier = res.data.dossier;
          this.infosResultats.synthese = res.data.synthese;
          this.infosClientInitiales.synthese = res.data.syntheseOriginal;
          this.infosResultats.resultatGlobal = res.data.resultatGlobal;
          this.itemsOriginaux = Object.entries(res.data.originalCards).filter(
            i => i[1] !== null
          );
          this.itemsResults = Object.entries(res.data.resultsCards).filter(
            j => j[1] !== null
          );
          this.infosResultats.commentaires = res.data.commentaires;
        });
    },
    modifyValue() {
      // Déclenchement du loader empêchant de valider plusieurs fois
      this.modificationModaleLoader = true;
      resSubjectService
        .updateFields(
          this.dataForModification,
          this.initialData,
          this.dossier.etape,
          this.dossier.id
        )
        .then(() => {
          this.tryGenerateRapport(this.dossier.id);
          this.getInfosResultats()
            .then(() => {
              this.dataForModification = {};
              this.initialData = {};
            })
            .finally(() => {
              this.modificationModale = false;
              this.modificationModaleLoader = false;
            });
        });
    },
    tryGenerateRapport(dossierId, trameId = null) {
      this.trameLoading = true;
      return rapportService.tryGenerateRapport(dossierId, trameId).then(res => {
        this.trameModale = false;
        this.trameLoading = false;
        let status = res.data.status;
        switch (status) {
          case "MANY_TRAMES":
            this.handleManyTrames(res.data.trames);
            return res;
          case "OK":
            return res;
          case "NO_TRAMES":
            return res;
        }
      });
    },
    handleManyTrames(trames) {
      this.trames = trames;
      this.trameModale = true;
      this.selectedTrame = null;
      this.trameLoading = false;
    },
    openModifyModale(data) {
      this.initialData = data.map(d => {
        return { ...d };
      });
      this.dataForModification = data.map(d => {
        return { ...d };
      });
      this.modificationModale = true;
    },
    cancelModification() {
      this.dataForModification = {};
      this.initialData = {};
      this.modificationModale = false;
    },
    removeDossier() {
      this.$store.dispatch(
        "moduleActionMasse/removeDossierATraiter",
        this.infosResultats.dossier
      );
      this.$store.dispatch(
        "moduleActionMasse/removeDossierInitial",
        this.infosResultats.dossier
      );
    },
    validationFactu(factu) {
      let form = this.buildFacturationFormData(
        this.userCodeGestionnaire,
        this.dossier.enqCode,
        this.dossier.proprietaire,
        factu.couple,
        factu.ecModifie,
        this.infosResultats.resultatGlobal,
        factu.factuItems
      );

      nopmService
        .actionFacturation(form)
        .then(res => {
          if (res.data.result) {
            this.removeDossierFromStores();
          } else {
            // this.errorMessage = res.data.message;
            // this.error = true;
            // this.isBilling = false;
          }
        })
        .catch(err => {
          // this.errorTitle =
          //   this.dossier.proprietaire + " - " + this.dossier.enqCode;
          //
          // this.errorMessage = err.response.data;
          // this.error = true;
          // this.isBilling = false;
        })
        .finally(() => {
          this.getInfosFacturation();
        });
    },
    executeAffectation(enq) {
      // Appel à NOPM pour l'action, puis sortir le dossier des sélectionnés
      nopmService
        .actionAffectation(
          this.dossier.enqCode,
          this.dossier.proprietaire,
          enq.gesCode,
          this.userCodeGestionnaire,
          enq.organisation,
          enq.organisation_type,
          this.actionUnitaire
        )
        .then(res => {
          this.removeDossierFromStores();
        });
    },
    modifComment(commentaire) {
      if (commentaire.content !== null && commentaire.content !== "") {
        this.$abi
          .patch("nose/synthese/updateNoseEntityField", {
            entity: commentaire.entity,
            field: commentaire.field,
            id: commentaire.id,
            value: commentaire.content,
            initialValue: null,
            dossierEtape: this.dossier.etape
          })
          .then(res => this.$debug && console.log(res));
      }
    },
    toggleFactu() {
      // On ne permet pas l'accès au tableau de facturation si le dossier n'est pas au moins à l'étape de validation assistante
      if (
        this.infosResultats.dossier &&
        this.infosResultats.dossier.etape > 3
      ) {
        this.factuComponentOpen = !this.factuComponentOpen;
      }
    },
    retourDossierConfirme(data) {
      this.retourEnqueteurLoading = true;
      let commentaireEcrit = data.commentaireEcrit;
      let commentaireSelect = data.commentaireSelect;
      nopmService
        .actionRetour({
          enqCode: this.dossier.enqCode,
          proprietaire: this.dossier.proprietaire,
          user: this.dossier.enqueteurCode,
          commentaireRetourEcrit: commentaireEcrit,
          commentaireRetourSelect: commentaireSelect,
          gestionnaire: this.userCodeGestionnaire
        })
        .then(res => {
          this.removeDossierFromStores();
          this.actionUnitaire = "";
        })
        .catch(e => {
          this.$debug && console.log(e);
          this.actionUnitaire = "";
        })
        .finally(() => {
          this.retourEnqueteurLoading = false;
        });
    },
    openPanel() {
      if (!this.panelOpen) {
        this.panelOpen = true;
      }
    },
    action(e) {
      this.$debug && console.log(e);
    },
    removeDossierFromStores() {
      this.$store.dispatch(
        "moduleFacturation/removeDossierData",
        this.dossier.id
      );
      this.$store.dispatch(
        "moduleActionMasse/removeDossierATraiter",
        this.dossier
      );
      this.$store.dispatch(
        "moduleActionMasse/removeDossierInitial",
        this.dossier
      );
    }
  },
  watch: {
    factuComponentOpen(val) {
      if (val) {
        this.leftCol = 6;
        this.rightCol = 6;
      } else {
        this.leftCol = 9;
        this.rightCol = 3;
      }
    }
  }
};
</script>

<style lang="scss">
div.massPanels div.vhl-list {
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
  overflow-x: hidden !important;
}
.factu-component {
  &.open {
    background-color: #73bac1;
    border-radius: 4px 4px 4px;
    & .toggable-content {
      padding: 1rem;
      width: 890px;
      opacity: 1;
    }
  }
  &.close {
    width: 270px;
    height: 30px;
    & .toggable-content {
      width: 0;
      opacity: 1;
    }
  }
}
p.vertical-text {
  width: 1px;
  word-wrap: break-word;
  white-space: pre-wrap;
  margin-right: 1em;
}
.client-section {
  color: blue;
}
.resultat-section {
  color: orange;
}
.v-expansion-panel-content__wrap {
  padding-bottom: 0 !important;
}
</style>
