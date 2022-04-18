<template>
  <main>
    <bandeau-top :current-user="user"></bandeau-top>
    <navigation></navigation>
    <h1 class="ma-3">Page d'actions en masse</h1>
    <v-expansion-panels multiple v-model="panels" class="massPanels">
      <DossierExpansionPanel
        v-for="(dossier, index) in dossiersATraiter"
        :key="dossier.enqCode"
        :dossier="dossier"
        :gests="gestionnaires"
        :index="index"
        :defaultComments="defaultComments"
        @goToDossier="goToDossier"
      ></DossierExpansionPanel>
    </v-expansion-panels>
    <v-footer fixed class="blue-grey">
      <v-row>
        <v-col offset="1">
          <v-btn tile color="primary" @click="retourDashboard">
            Retour tableau de bord
          </v-btn>
        </v-col>
        <v-col>
          <v-btn
            v-if="facturationDroits && facturationDroits.e"
            tile
            color="primary"
            @click="modaleFactu = !modaleFactu"
            :disabled="factuDisabled"
            class="ml-4 float-right"
          >
            Facturer en masse
          </v-btn>
          <v-btn
            tile
            color="primary"
            @click="modaleNeg = !modaleNeg"
            class="ml-4 float-right"
          >
            NEG en masse
          </v-btn>
          <v-btn
            v-if="
              (validationManagerDroits && validationManagerDroits.e) ||
                (validationAssistanteDroits && validationAssistanteDroits.e)
            "
            tile
            color="primary"
            @click="modaleRetour = !modaleRetour"
            :disabled="retourDisabled"
            class="ml-4 float-right"
          >
            Retour Enquêteur en masse
          </v-btn>
          <DossierCanceller
            :dossiers="dossiersATraiter.filter(d => d.enqAnnule !== '1')"
            action="annuler"
            tile
            masse
            @execute="cancelEnMasse"
          ></DossierCanceller>
        </v-col>
      </v-row>
    </v-footer>
    <retour-modale
      :dossiers="dossiersATraiter"
      :opened="modaleRetour"
      @close="modaleRetour = false"
      @retourDossierConfirme="retourEnqEnMasse"
      :defaultComments="defaultComments"
      :loading="retourEnqueteurLoading"
    ></retour-modale>
    <neg-masse-modale
      :dossiers="dossiersATraiter"
      :opened="modaleNeg"
      @closeNeg="modaleNeg = false"
      @negDossiersConfirme="negEnMasse"
    ></neg-masse-modale>
    <factu-modale
      :dossiers="dossiersATraiter"
      :opened="modaleFactu"
      @closeFactu="modaleFactu = false"
      @factuDossierConfirme="factureEnMasse"
    ></factu-modale>
    <v-dialog v-model="actionMasseSucces" max-width="500">
      <v-card>
        <v-card-title>Action en masse</v-card-title>
        <v-card-text>
          <template>
            L'action
            <span class="font-weight-bold" v-if="actionMasse === 'ret'">
              de retour à l'enquêteur
            </span>
            <span class="font-weight-bold" v-else-if="actionMasse === 'factu'">
              de facturation
            </span>
            <span class="font-weight-bold" v-else-if="actionMasse === 'neg'">
              de neg
            </span>
            <span class="font-weight-bold" v-else-if="actionMasse === 'annul'">
              d'annulation
            </span>
            en masse s'est bien effectuée.
          </template>
          <v-spacer></v-spacer>
          <template v-if="dossiersATraiter.length === 0">
            La page ne contient plus de dossier à traiter : vous allez être
            redirigé vers le tableau de bord dans
            <span class="font-weight-bold">{{ timerCount }}</span>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="retourDashboard">OK</v-btn>
            </v-card-actions>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="alertNoDossier" max-width="500">
      <v-card>
        <v-card-title>Action en masse</v-card-title>
        <v-card-text>
          <template>
            La page ne contient plus de dossier à traiter : vous allez être
            redirigé vers le tableau de bord dans
            <span class="font-weight-bold">{{ timerCount }}</span>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="retourDashboard">OK</v-btn>
            </v-card-actions>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="actionMasseFail"
      max-width="500"
      @click:outside="actionMasseFail === false"
    >
      <v-card color="rouge" class="white--text">
        <v-card-title>Action en masse</v-card-title>
        <v-card-text class="white--text">
          <template>
            L'action de
            <span class="font-weight-bold" v-if="actionMasse === 'ret'">
              retour à l'enquêteur
            </span>
            <span class="font-weight-bold" v-else-if="actionMasse === 'factu'">
              facturation
            </span>
            <span class="font-weight-bold" v-else-if="actionMasse === 'neg'">
              "neg"
            </span>
            en masse a rencontré un problème, veuillez contacter le Digital.
            <v-spacer></v-spacer>
            Message de l'erreur : {{ errorMessage }}
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>
    <dossierLoader :dossier="dossierToGo"></dossierLoader>
  </main>
</template>

<script>
import DossierExpansionPanel from "../../components/ActionsMasse/DossierExpansionPanel";
import { UserMixin } from "@/Mixins/UserMixin";
import BandeauTop from "../../components/Header/BandeauTop";
import Navigation from "../../components/Navigation/Navigation";
import { mapGetters } from "vuex";
import dossierService from "../../services/dossierService";
import nopmService from "@/services/nopmService";
import RetourModale from "@/components/CommonComponents/RetourModale";
import NegMasseModale from "@/components/CommonComponents/NegMasseModale";
import FactuModale from "@/components/CommonComponents/factuModale";
import DossierLoader from "@/components/CommonComponents/DossierLoader";
import { FacturationMixin } from "@/Mixins/FacturationMixin";
import DossierCanceller from "@/components/CommonComponents/DossierCanceller";

export default {
  name: "ActionsMasse",
  props: [],
  mixins: [UserMixin, FacturationMixin],
  components: {
    DossierCanceller,
    FactuModale,
    NegMasseModale,
    BandeauTop,
    DossierExpansionPanel,
    Navigation,
    RetourModale,
    DossierLoader
  },
  mounted() {
    dossierService.getGestionnairesAffectation().then(res => {
      this.gestionnaires = res.data;
    });
    // Ouverture de tous les panels par défaut
    this.dossiersATraiter.forEach((d, i) => this.panels.push(i));
    // Récuperation des commentaires de retour par défaut
    nopmService.getCommentairesRetour().then(res => {
      this.defaultComments = Object.values(res.data.content);
    });
  },
  data: () => {
    return {
      panels: [],
      gestionnaires: [],
      modaleRetour: false,
      modaleFactu: false,
      defaultComments: [],
      modaleNeg: false,
      retourEnqueteurLoading: false,
      actionMasse: null,
      actionMasseSucces: false,
      actionMasseFail: false,
      errorMessage: null,
      timerCount: 0,
      dossierToGo: null,
      alertNoDossier: false
    };
  },
  methods: {
    goToDossier(dossier) {
      this.dossierToGo = dossier;
    },
    retourDashboard() {
      this.$router
        .push({ name: "dossiers", params: { dossiers: this.dossiersInitiaux } })
        .then(() => {});
    },
    negEnMasse(data) {
      let dossiers = [];
      data.map(d =>
        dossiers.push({
          action: "finir_enquete",
          enqCode: d.enqCode,
          proprietaire: d.proprietaire,
          gestionnaire: this.userCodeGestionnaire,
          resultat: "NEG"
        })
      );
      this.executeActionEnMasse(dossiers, "neg");
    },
    factureEnMasse(data) {
      let idsToFac = [];
      data.forEach(a => idsToFac.push(a.id));
      let dossiers = this.factuData
        .filter(b => idsToFac.includes(b.id))
        .map(d => {
          return {
            ...d,
            prestations: this.formatPrestationLists(d.items),
            resultat: this.dossiersATraiter.find(doss => doss.id === d.id)
              .resultatGlobal,
            action: "facturer",
            gestionnaire: this.userCodeGestionnaire
          };
        });
      this.executeActionEnMasse(dossiers, "factu");
    },
    retourEnqEnMasse(data) {
      this.retourEnqueteurLoading = true;
      let dossiers = [];
      data.dossiers.map(d =>
        dossiers.push({
          action: "retourner",
          enqCode: d.enqCode,
          proprietaire: d.proprietaire,
          user: d.enqueteurCode,
          gestionnaire: this.userCodeGestionnaire,
          commentaireEcrit: data.commentaireEcrit,
          commentaireSelect: data.commentaireSelect
        })
      );
      this.executeActionEnMasse(dossiers, "ret");
    },
    cancelEnMasse(data) {
      let dossiers = [];
      data.dossiers.map(d =>
        dossiers.push({
          action: "annuler",
          enqCode: d.enqCode,
          proprietaire: d.proprietaire,
          user: d.enqueteurCode,
          gestionnaire: this.userCodeGestionnaire,
          motif_annulation: data.motif
        })
      );
      this.executeActionEnMasse(dossiers, "annul");
    },
    executeActionEnMasse(dossiers, action) {
      return nopmService
        .actionEnMasse(dossiers)
        .then(r => {
          if (action === "neg") {
            dossierService.createPrefacturationEnMasse(dossiers).finally(() => {
              this.actionMasseSucces = true;
              this.removeDossiersFromStores(dossiers);
            });
          } else {
            this.actionMasse = action;
            this.actionMasseSucces = true;
            this.removeDossiersFromStores(dossiers);
          }
          return r;
        })
        .catch(err => {
          this.actionMasse = action;
          this.actionMasseFail = true;
          this.errorMessage = err.message;
        })
        .finally(() => {
          this.retourEnqueteurLoading = false;
        });
    },

    removeDossiersFromStores(dossiers) {
      dossiers.forEach(d => {
        this.$store.dispatch("moduleFacturation/removeDossierData", d.id);
        this.$store.dispatch("moduleActionMasse/removeDossierATraiter", d);
        this.$store.dispatch("moduleActionMasse/removeDossierInitial", d);
      });
    }
  },
  computed: {
    ...mapGetters("moduleActionMasse", ["dossiersATraiter"]),
    ...mapGetters("moduleFacturation", ["factuData"]),
    retourDisabled() {
      return (
        this.dossiersATraiter.filter(d => parseInt(d.etape, 10) > 2).length ===
        0
      );
    },
    factuDisabled() {
      return (
        this.dossiersATraiter.filter(d => parseInt(d.etape, 10) === 4)
          .length === 0 || this.$env.VUE_APP_FACTURATION === "false"
      );
    }
  },
  watch: {
    dossiersATraiter: {
      handler(val) {
        if (!this.actionMasseSucces && val.length === 0)
          this.alertNoDossier = true;
        if (val.length === 0) {
          this.timerCount = 5;
          setTimeout(() => {
            this.retourDashboard();
          }, 5000);
        }
      }
    },
    timerCount: {
      handler(val) {
        if (val > 0) {
          setTimeout(() => {
            this.timerCount--;
          }, 1000);
        }
      }
    }
  }
};
</script>

<style scoped>
.massPanels {
  margin-bottom: 10vh;
}
</style>
