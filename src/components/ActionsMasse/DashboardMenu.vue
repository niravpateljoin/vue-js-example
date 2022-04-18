<template>
  <v-container>
    <v-menu :offset-y="true">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          max-width="25px"
          class="px-0"
          dark
          text
          v-bind="attrs"
          v-on="on"
        >
          <v-icon>mdi-menu</v-icon>
          <v-icon>mdi-menu-down</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in items"
          :key="index"
          :disabled="selected.length === 0 || disabledByRights(item)"
        >
          <v-list-item-title @click="action(item.action)" class="pointer">{{
            item.title
          }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <modale-resultat-en-masse
      :open="modaleResultatEnMasse"
      :dossiers="selected"
      @close="modaleResultatEnMasse = false"
      @pop="(v) => $emit('popDossiers', v)"
    ></modale-resultat-en-masse>
    <modale-affectation-en-masse
      v-if="modaleAffectationEnMasse"
      :open="modaleAffectationEnMasse"
      :dossiers="selected"
      @close="modaleAffectationEnMasse = false"
      @reload="$emit('reload')"
      @pop="(v) => $emit('popDossiers', v)"
    >
    </modale-affectation-en-masse>
    <modale-acte-en-masse
      :dossiers="selected"
      :open="modaleActeEnMasse"
      @close="() => (modaleActeEnMasse = false)"
      @pop="(v) => $emit('popDossiers', v)"
    ></modale-acte-en-masse>
    <v-dialog width="500" scrollable v-model="warningModale">
      <v-card max-height="500">
        <v-card-title>Attention</v-card-title>
        <v-card-text>
          Les dossiers suivants ne peuvent pas être traités dans la page
          d'actions en masse car ils ne sont pas présents / créés dans NOSE :
          <ul>
            <li v-for="(dossier, index) in dossiersGems" :key="index">
              {{ dossier.proprietaire }}/{{ dossier.enqCode }} -
              {{ dossier.subject }}
            </li>
          </ul>
          Souhaitez-vous continuer sans ces dossiers ?
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="error"
            @click="
              () => {
                this.warningModale = false;
              }
            "
          >
            Non
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="() => redirectActionMasse()">
            Oui
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import ModaleResultatEnMasse from "@/components/ActionsMasse/ModaleResultatEnMasse";
import ModaleAffectationEnMasse from "@/components/ActionsMasse/ModaleAffectationEnMasse";
import ModaleActeEnMasse from "@/components/ActionsMasse/ModaleActeEnMasse";
export default {
  name: "DashboardMenu",
  components: {
    ModaleActeEnMasse,
    ModaleAffectationEnMasse,
    ModaleResultatEnMasse,
  },
  props: ["selected", "dashboardDossiers"],
  data: function () {
    return {
      items: [
        {
          title: "Commande d'actes",
          action: "actes",
          disabled: false,
        },
        {
          title: "Changement de résultats",
          action: "results",
          disabled: false,
        },
        {
          title: "Affectation/Réaffectation/Retraitement",
          action: "affect",
          disabled: !this.affectationDroits || !this.affectationOrgaDroits,
        },
        {
          title: "Page d’actions avec contrôle",
          action: "masse",
          disabled: false,
        },
      ],
      modaleResultatEnMasse: false,
      modaleAffectationEnMasse: false,
      modaleActeEnMasse: false,
      warningModale: false,
    };
  },
  computed: {
    dossiersGems() {
      return this.selected ? this.selected.filter((d) => d.id === null) : [];
    },
    dossiersNose() {
      return this.selected ? this.selected.filter((d) => d.id !== null) : [];
    },
  },
  methods: {
    ...mapActions("moduleActionMasse", [
      "setDossiersInitiaux",
      "setDossiersATraiter",
    ]),
    action(action) {
      switch (action) {
        case "results":
          this.modaleResultatEnMasse = true;
          break;
        case "affect":
          this.modaleAffectationEnMasse = true;
          break;
        case "actes":
          this.modaleActeEnMasse = true;
          break;
        case "masse":
          if (this.dossiersGems.length > 0) {
            this.warningModale = true;
          } else {
            this.redirectActionMasse();
          }
          break;
      }
    },
    redirectActionMasse() {
      this.$router.push({
        name: "actionsMasse",
      });
    },
    disabledByRights(item) {
      let canAccessModal = false
      switch (item.action) {
        case "results":
          canAccessModal = true
          break;
        case "affect":
          canAccessModal = !(!this.affectationDroits && !this.affectationOrgaDroits);
          break;
        case "actes":
          canAccessModal = !(!this.acteNaissDroits && !this.acteDecesDroits);
          break;
        case "masse":
          canAccessModal = true
      }
      return !canAccessModal
    }
  },
};
</script>

<style scoped></style>
