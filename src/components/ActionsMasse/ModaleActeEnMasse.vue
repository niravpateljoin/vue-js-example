<template>
  <v-container fluid class="pa-0">
    <v-dialog max-width="800px" :value="open" persistent scrollable>
      <v-card max-height="800px">
        <v-card-title>
          <v-col>Commande d'actes en masse</v-col>

          <v-col
            class="pa-1"
            cols="auto"
            v-for="type in types"
            :key="type.value"
          >
            <v-btn
              dark
              elevation="1"
              color="#3598db"
              @click="setAllCommande(type.value)"
            >
              {{ type.label }}
            </v-btn>
          </v-col>
        </v-card-title>
        <v-card-text>
          <v-container fluid>
            <v-row v-if="dossiersCommandeUnavailable.length > 0">
              <v-col class="pa-1">
                <v-alert color="warning">
                  Les actes ne peuvent pas êtres commandés pour les dossiers
                  suivants car ils n'existent pas dans NOSE
                  <ul>
                    <li
                      v-for="dossier in dossiersCommandeUnavailable"
                      :key="dossier.enqCode"
                    >
                      Dossier {{ dossier.enqCode }} - {{ dossier.subject }}
                    </li>
                  </ul>
                </v-alert>
              </v-col>
            </v-row>
            <v-divider></v-divider>
            <template v-for="dossier in dossiersCommandeAvailable">
              <v-row class="px-3" :key="dossier.enqCode">
                <v-col class="pa-0">
                  <v-row>
                    <v-col class="px-3 pt-5">
                      Dossier {{ dossier.enqCode }} - {{ dossier.subject }}
                    </v-col>
                    <v-col cols="auto" class="px-3 pt-5">
                      <v-btn-toggle
                        color="#3598db"
                        class="ml-n2"
                        multiple
                        :value="
                          commande.find(
                            c =>
                              civilites[dossier.id] &&
                              c.civiliteId === civilites[dossier.id].id
                          )
                            ? commande.find(
                                c => c.civiliteId === civilites[dossier.id].id
                              ).type
                            : []
                        "
                        @change="
                          v =>
                            setTypeCommande(
                              civilites[dossier.id]
                                ? civilites[dossier.id].id
                                : null,
                              v
                            )
                        "
                      >
                        <v-btn
                          v-for="type in types"
                          elevation="1"
                          :value="type.value"
                          :key="type.value"
                          :disabled="type.disabled(civilites[dossier.id])"
                          :class="{
                            'disabled-keep-color': type.commande(
                              civilites[dossier.id]
                            )
                          }"
                          :color="
                            type.commande(civilites[dossier.id])
                              ? 'success'
                              : ''
                          "
                        >
                          <v-icon
                            v-if="type.commande(civilites[dossier.id])"
                            class="mr-2"
                            small
                            color="white"
                          >
                            mdi-check
                          </v-icon>
                          {{
                            type.commande(civilites[dossier.id])
                              ? "Commandé"
                              : type.label
                          }}
                        </v-btn>
                      </v-btn-toggle>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <template
                v-if="
                  civilites[dossier.id] && civilites[dossier.id].beneficiaires
                "
              >
                <v-row
                  v-for="benef in civilites[dossier.id].beneficiaires"
                  :key="benef.id"
                >
                  <v-col offset="1" class="px-3 pb-2 pt-0">
                    {{ benef.nom }} {{ benef.prenom }}
                    {{
                      benef.naissanceDate
                        ? formatDateTimeToDatePF(benef.naissanceDate.date)
                        : ""
                    }}
                  </v-col>
                  <v-col cols="auto" class="px-3 pb-2 pt-0">
                    <v-btn-toggle
                      color="#3598db"
                      class="ml-n2"
                      multiple
                      :value="
                        commande.find(c => c.civiliteId === benef.id)
                          ? commande.find(c => c.civiliteId === benef.id).type
                          : []
                      "
                      @change="
                        v => setTypeCommande(benef.id, v.length > 0 ? v : [])
                      "
                    >
                      <v-btn
                        v-for="type in types"
                        elevation="1"
                        :value="type.value"
                        :key="type.value"
                        :disabled="type.disabled(benef)"
                        :class="{
                          'disabled-keep-color': type.commande(benef)
                        }"
                        :color="type.commande(benef) ? 'success' : ''"
                      >
                        <v-icon
                          v-if="type.commande(benef)"
                          class="mr-2"
                          small
                          color="white"
                        >
                          mdi-check
                        </v-icon>
                        {{ type.commande(benef) ? "Commandé" : type.label }}
                      </v-btn>
                    </v-btn-toggle>
                  </v-col>
                </v-row>
              </template>
            </template>
            <v-row v-if="successMessage.length > 0">
              <v-col>
                <v-alert color="success" dark>
                  <ul>
                    <li v-for="(success, index) in successMessage" :key="index">
                      {{ success }}
                    </li>
                  </ul>
                </v-alert>
              </v-col>
            </v-row>
            <v-row v-if="errorMessage.length > 0">
              <v-col>
                <v-alert color="error" dark>
                  <ul>
                    <li v-for="(erreur, index) in errorMessage" :key="index">
                      {{ erreur }}
                    </li>
                  </ul>
                </v-alert>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn
            @click="
              () => {
                $emit('close');
                errorMessage = [];
              }
            "
            color="red"
            dark
            >Fermer</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn
            @click="validation"
            color="primary"
            :loading="loading"
            :disabled="commande.length < 1"
          >
            Valider
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import dossierService from "@/services/dossierService";
import { ActesMixin } from "@/Mixins/Commandes/ActesMixin";
import { UserMixin } from "@/Mixins/UserMixin";
import { DatesMixin } from "@/Mixins/DatesMixin";

export default {
  name: "ModaleActeEnMasse",
  props: {
    dossiers: Array,
    open: Boolean
  },
  mixins: [ActesMixin, UserMixin, DatesMixin],
  data() {
    return {
      commande: [],
      types: [
        {
          value: "décès",
          label: "de décès",
          disabled: civ => {
            return !this.checkCommandeValide("décès", civ);
          },
          commande: civ =>
            civ && civ.actes.some(a => a.documentAdminType === "ACTE_DE_DECES")
        },
        {
          value: "naissance",
          label: "de naissance",
          disabled: civ => {
            return !this.checkCommandeValide("naissance", civ);
          },
          commande: civ =>
            civ &&
            civ.actes.some(a => a.documentAdminType === "ACTE_DE_NAISSANCE")
        }
      ],
      /**
       * [123456789: {civilite, actes ..., beneficiaires: [{civilite, actes}]}, 188456798: {civilite, actes...}]
       */
      civilites: {},
      loading: false,
      errorMessage: [],
      successMessage: []
    };
  },

  computed: {
    dossiersCommandeAvailable() {
      return this.dossiers.filter(d => d.id !== null);
    },
    dossiersCommandeUnavailable() {
      return this.dossiers.filter(d => d.id === null);
    }
  },

  watch: {
    open(val) {
      this.errorMessage = [];
      this.successMessage = [];
      if (val) {
        this.loading = true;
        dossierService
          .getCiviliteByDossier(this.dossiersCommandeAvailable.map(d => d.id))
          .then(res => {
            this.civilites = res.data;
          })
          .finally(() => {
            this.loading = false;
          });
      }
    }
  },

  methods: {
    /**
     *
     * @param civiliteId Int
     * @param type Array
     */
    setTypeCommande(civiliteId, type) {
      if (!this.commande.some(d => d.civiliteId === civiliteId)) {
        this.commande.push({ civiliteId: civiliteId, type: type });
      } else if (type.length < 1) {
        this.commande = this.commande.filter(d => d.civiliteId !== civiliteId);
      } else {
        this.commande.find(d => d.civiliteId === civiliteId).type = type;
      }
    },

    setAllCommande(type) {
      Object.values(this.civilites).forEach(c => {
        /* Pour les débiteurs */
        if (
          !this.types.find(t => t.value === type).disabled(c) &&
          !this.types.find(t => t.value === type).commande(c)
        ) {
          let types = this.commande.find(com => c.id === com.civiliteId)
            ? this.commande.find(com => c.id === com.civiliteId).type
            : [];
          if (!types.includes(type)) {
            this.setTypeCommande(c.id, [...types, type]);
          }
        }
        /* Pour les bénéficiaires */
        c.beneficiaires.forEach(benef => {
          if (
            !this.types.find(t => t.value === type).disabled(benef) &&
            !this.types.find(t => t.value === type).commande(benef)
          ) {
            let types = this.commande.find(com => benef.id === com.civiliteId)
              ? this.commande.find(com => benef.id === com.civiliteId).type
              : [];
            if (!types.includes(type)) {
              this.setTypeCommande(benef.id, [...types, type]);
            }
          }
        });
      });
    },
    validation() {
      if (this.commande.length < 1) return;
      this.errorMessage = [];
      this.successMessage = [];
      let args = [];
      let infos = this.getCivilitesInfos();
      infos.forEach(i => {
        if (i.commande) {
          i.commande.type.forEach(t => {
            args.push({
              enqCode: i.dossier.enqCode,
              proprietaire: i.dossier.proprietaire,
              client: i.dossier.cliCode,
              subject: i.dossier.subject,
              reference: i.dossier.reference,
              commande: t,
              interlocuteur: {
                nom_interlocuteur: i.dossier.interlocuteur,
                email_interlocuteur: i.dossier.intMail1,
                tel_interlocuteur: i.dossier.intTel1
              },
              civilite: i.civilite
            });
          });
        }
      });
      this.loading = true;
      this.commandeActesEnMasse(args, this.userCodeGestionnaire)
        .then(res => {
          if (Object.entries(res.data).length > 0) {
            let dossierToPop = [];
            Object.entries(res.data).forEach(([enqCode, type]) => {
              Object.entries(type).forEach(([type, d]) => {
                if (d.erreur) {
                  this.errorMessage.push(d.erreur);
                } else {
                  this.successMessage.push(
                    "Un acte a été créé dans la PF, référence: " +
                      d.pf_doc.REFERENCE
                  );
                  if (!dossierToPop.some(dos => dos.enqCode === enqCode)) {
                    dossierToPop.push(
                      this.dossiers.find(dos => dos.enqCode === enqCode)
                    );
                  }
                }
              });
            });
            this.$emit("pop", dossierToPop);
            this.commande = [];
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    /**
     *
     * @returns {[dossier: {}, civilite: {}, commande: []]}
     */
    getCivilitesInfos() {
      let civilities = [];
      Object.entries(this.civilites).forEach(([dossierId, civ]) => {
        civilities.push({
          dossier: this.dossiers.find(
            d => parseInt(d.id) === parseInt(dossierId)
          ),
          civilite: civ,
          commande: this.commande.find(c => c.civiliteId === civ.id)
        });
        if (civ.beneficiaires)
          civ.beneficiaires.forEach(b => {
            civilities.push({
              dossier: this.dossiers.find(
                d => parseInt(d.id) === parseInt(dossierId)
              ),
              civilite: b,
              commande: this.commande.find(c => c.civiliteId === b.id)
                ? this.commande.find(c => c.civiliteId === b.id)
                : null
            });
          });
      });

      return civilities;
    }
  }
};
</script>

<style scoped>
.disabled-keep-color {
  pointer-events: none;
}
</style>
