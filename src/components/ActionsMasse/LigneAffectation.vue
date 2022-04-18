<template>
  <v-row>
    <v-col cols="auto" class="px-0 pt-2 pb-0">
      {{ etape === 1 ? "Affecter" : etape === 2 ? "Ré-affecter" : "Retraiter" }}
      les dossiers {{ etape > 2 ? "par" : "à" }}
    </v-col>
    <v-col cols="auto" class="pt-2 pb-0" v-if="affectationOrgaDroits && affectationOrgaDroits.r">
      <v-autocomplete
        filled
        outlined
        dense
        label="Organisation"
        :value="affect.organisation ? affect.organisation : null"
        item-value="MNEMONIQUE_ORGANISATION"
        hide-no-data
        hide-details
        return-object
        :items="organisations"
        :loading="loading"
        :disabled="loading || !affectationOrgaDroits.u"
        :item-text="formatOrganisation"
        @change="val => setOrganisation(affect, val)"
      >
        <template #append-outer>
          <v-icon small v-if="affect.organisation" @click="deleteOrganisation">
            mdi-close
          </v-icon>
        </template>
      </v-autocomplete>
    </v-col>
    <v-col cols="auto" class="pt-2 pb-0" v-if="affectationDroits && affectationDroits.r">
      <v-autocomplete
        dense
        outlined
        flat
        :items="enqueteurs"
        hide-details
        return-object
        :value="affect.enq"
        class="mb-2"
        @change="val => $emit('setEnqueteur', val)"
        :loading="loading"
        hide-selected
        :disabled="loading || !affectationDroits.e"
      >
      </v-autocomplete>
    </v-col>
    <v-col cols="auto" class="pt-2 pb-0">
      <v-row>
        <v-text-field
          type="number"
          style="max-width: 70px"
          height="32px"
          class="pa-0"
          :value="affect.nbDossiers"
          outlined
          flat
          :max="nbDossiers"
          @input="val => $emit('setNbDossier', val)"
          :rules="[nbDossierRules(nbDossiers)]"
          hide-details
        >
        </v-text-field>
      </v-row>
    </v-col>
    <v-col class="pt-2 pb-0">
      {{
        affect.nbDossiers > 0
          ? "soit " + percent(affect.nbDossiers, nbDossiers) + "%"
          : ""
      }}
    </v-col>
    <v-col cols="1" class="pt-2 pb-0 text-center">
      {{ affect.objectif ? affect.objectif + " €" : "Pas d'objectif" }}
    </v-col>
    <v-col cols="1" class="pt-2 pb-0 text-center">
      {{ realise !== 0 ? realise + " € " : "" }}
      <v-progress-circular
        v-if="loading"
        indeterminate
        size="13"
        width="2"
        color="primary"
      >
      </v-progress-circular>
      <icon-tooltip
        tooltip="Charger le réalisé"
        top
        small
        v-else-if="affect.enq"
        @click="calculeEnCours(affect)"
        color="primary"
        :loading="loading"
      >
        mdi-reload
      </icon-tooltip>
    </v-col>
    <v-col cols="1" class="pt-2 pb-0 text-center">
      {{ previsionnel !== 0 ? previsionnel + " €" : "" }}
    </v-col>
    <v-col cols="1">
      <icon-tooltip
        small
        color="error"
        @click="() => $emit('removeAffectation')"
      >
        mdi-delete
      </icon-tooltip>
    </v-col>
  </v-row>
</template>

<script>
import IconTooltip from "@/components/CommonComponents/IconTooltip";
import dossierService from "@/services/dossierService";

export default {
  name: "LigneAffectation",
  components: { IconTooltip },
  props: {
    affect: {
      type: Object
    },
    nbDossiers: {
      type: Number,
      default: 0
    },
    organisations: {
      type: Array
    },
    etape: {
      type: Number
    },
    montantTheo: {
      type: Number
    }
  },
  data() {
    return {
      enqueteurs: [],
      nbDossierRules: max => val => (val <= max ? true : "Trop de dossiers"),
      realise: 0,
      enCours: 0,
      loading: false
    };
  },
  mounted() {
    this.getGestionnairesAffectation(this.affect.organisation);
  },
  computed: {
    previsionnel() {
      console.log(
        this.realise,
        this.enCours,
        this.montantTheo,
        this.affect.nbDossiers
      );
      return (
        this.realise + this.enCours + this.montantTheo * this.affect.nbDossiers
      );
    }
  },
  methods: {
    getGestionnairesAffectation(organisation) {
      let param = organisation ? organisation : "ALL";
      this.loading = true;
      dossierService
        .getGestionnairesAffectation(param)
        .then(res => {
          this.enqueteurs = res.data.map(r => {
            return {
              value: r.USERNAME,
              text: "[" + r.USERNAME + "] " + r.LASTNAME + " " + r.FIRSTNAME,
              objectif: r.OBJECTIF,
              branch_mnemonique: r.BRANCH_MNEMONIQUE,
              type_organisation: r.TYPE_ORGANISATION
            };
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },
    formatOrganisation(item) {
      if (item && item.MNEMONIQUE_ORGANISATION) {
        return (
          item.MNEMONIQUE_ORGANISATION + " (" + item.NOM_ORGANISATION + ")"
        );
      }
    },
    calculeEnCours(affect) {
      this.loading = true;
      dossierService
        .getEnqueteurChiffreEnCours(affect.enq.value)
        .then(r => {
          this.realise = r.data.facture ? parseFloat(r.data.facture) : 0;
          this.enCours = r.data.enCours ? parseFloat(r.data.enCours) : 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    percent(nbAffect, nbTotal) {
      return Math.round(((nbAffect * 100) / nbTotal) * 100) / 100;
    },
    setOrganisation(affect, organisation) {
      this.getGestionnairesAffectation(organisation.MNEMONIQUE_ORGANISATION);
      this.$emit("setOrganisation", organisation);
    },
    deleteOrganisation() {
      this.$emit("deleteOrganisation");
      this.getGestionnairesAffectation("ALL");
    }
  }
};
</script>

<style scoped></style>
