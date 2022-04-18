<template>
  <v-dialog max-width="800px" :value="open" persistent>
    <v-card max-height="800px">
      <v-card-title>Changement de résultat en masse</v-card-title>
      <v-card-text>
        <v-container fluid>
          <template v-for="(dossierEtape, index) in dossiersParEtape">
            <v-row
              class="px-3"
              v-if="dossierEtape.length > 0 && index < 3"
              :key="index"
            >
              <v-col class="px-0">
                <v-row>
                  <v-col class="px-3 pb-0">
                    <b>{{ dossierEtape.length }}</b> dossiers ont été
                    sélectionnés en
                    <b>étape {{ index + 1 }}</b>
                  </v-col>
                </v-row>
                <v-divider></v-divider>
                <v-row
                  v-if="
                    index === 0 || (index === 1 && dossiersParEtape.length > 0)
                  "
                >
                  <v-col class="px-3 py-5">
                    Passer le résultat des enquêtes en
                  </v-col>
                  <v-col cols="auto" class="px-3">
                    <v-btn-toggle
                      color="#3598db"
                      class="ml-n2"
                      @change="
                        (val) =>
                          changeResultat(
                            dossierEtape,
                            val !== undefined ? val : null
                          )
                      "
                    >
                      <v-btn elevation="1" value="POS">POS</v-btn>
                      <v-btn elevation="1" value="NEG">NEG</v-btn>
                    </v-btn-toggle>
                  </v-col>
                </v-row>
                <v-row v-else-if="index === 2 && dossiersParEtape.length > 0">
                  <v-col class="px-3 py-5">
                    <v-row
                      v-if="
                        dossierEtape.filter(
                          (dos) => dos.resultatGlobal === 'POS'
                        ).length > 0
                      "
                    >
                      <v-col class="px-3">
                        <v-row>
                          <v-col class="px-3 py-0">
                            {{
                              dossierEtape.filter(
                                (dos) => dos.resultatGlobal === "POS"
                              ).length
                            }}
                            dossiers sont déjà en resultat d'enquête POS
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col class="px-6 py-0">
                            Passer le résultat des enquêtes en
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-col class="px-3" cols="auto">
                        <v-btn-toggle
                          color="primary"
                          class="ml-n2"
                          @change="
                            (val) =>
                              changeResultat(
                                dossierEtape,
                                val !== undefined ? val : null,
                                'POS'
                              )
                          "
                        >
                          <v-btn elevation="1" value="POS">POS</v-btn>
                          <v-btn elevation="1" value="NEG">NEG</v-btn>
                        </v-btn-toggle>
                      </v-col>
                    </v-row>
                    <v-row
                      v-if="
                        dossierEtape.filter(
                          (dos) => dos.resultatGlobal === 'NEG'
                        ).length > 0
                      "
                    >
                      <v-col class="px-3">
                        <v-row>
                          <v-col class="px-3 py-0">
                            {{
                              dossierEtape.filter(
                                (dos) => dos.resultatGlobal === "NEG"
                              ).length
                            }}
                            dossiers sont déjà en resultat d'enquête NEG
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col class="px-6 py-0">
                            Passer le résultat des enquêtes en
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-col class="px-3" cols="auto">
                        <v-btn-toggle
                          color="primary"
                          class="ml-n2"
                          @change="
                            (val) =>
                              changeResultat(
                                dossierEtape,
                                val !== undefined ? val : null,
                                'NEG'
                              )
                          "
                        >
                          <v-btn elevation="1" value="POS">POS</v-btn>
                          <v-btn elevation="1" value="NEG">NEG</v-btn>
                        </v-btn-toggle>
                      </v-col>
                    </v-row>
                    <v-row
                      v-if="
                        dossierEtape.filter(
                          (dos) => dos.resultatGlobal === null
                        ).length > 0
                      "
                    >
                      <v-col class="px-3">
                        <v-row>
                          <v-col class="px-3 py-0">
                            {{
                              dossierEtape.filter(
                                (dos) => dos.resultatGlobal === null
                              ).length
                            }}
                            dossiers n'ont pas de resultat d'enquête
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col class="px-6 py-0">
                            Passer le résultat des enquêtes en
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-col class="px-3" cols="auto">
                        <v-btn-toggle
                          color="primary"
                          class="ml-n2"
                          @change="
                            (val) =>
                              changeResultat(
                                dossierEtape,
                                val !== undefined ? val : null,
                                null
                              )
                          "
                        >
                          <v-btn elevation="1" value="POS">POS</v-btn>
                          <v-btn elevation="1" value="NEG">NEG</v-btn>
                        </v-btn-toggle>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </template>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="$emit('close')" color="red" :loading="loading" dark>
          annuler
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="dossiersResultats.length < 1"
          @click="validation"
          color="primary"
          :loading="loading"
        >
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

export default {
  name: "ModaleResultatEnMasse",
  props: ["open", "dossiers"],
  mixins: [UserMixin],
  data() {
    return {
      dossiersResultats: [],
      loading: false,
    };
  },
  computed: {
    dossiersParEtape() {
      let dossiersParEtape = [];
      if (this.dossiers) {
        for (let i = 1; i < 5; i++)
          dossiersParEtape.push(
            this.dossiers.filter(
              (dos) => parseInt(dos.etape, 10) === i && dos.id !== null
            )
          );
      }
      return dossiersParEtape;
    },
  },
  watch: {
    dossiers: {
      deep: true,
      handler(val) {
        this.dossiersResultats = [];
        val.forEach((dos) => {
          if (dos.id !== null) {
            this.dossiersResultats.push({
              enqCode: dos.enqCode,
              proprietaire: dos.proprietaire,
              action: "resultat",
              etape: dos.etape,
              resultat: dos.resultatGlobal,
              resultatInitial: dos.resultatGlobal,
            });
          }
        });
      },
    },
  },
  methods: {
    changeResultat(dossierEtape, val, etapeTroisResultatInitial) {
      dossierEtape.forEach((dos) => {
        let dr;

        if (etapeTroisResultatInitial === undefined) {
          dr = this.dossiersResultats.find(
            (d) =>
              d.enqCode === dos.enqCode && d.proprietaire === dos.proprietaire
          );
        } else {
          dr = this.dossiersResultats.find(
            (d) =>
              d.enqCode === dos.enqCode &&
              d.proprietaire === dos.proprietaire &&
              etapeTroisResultatInitial === dos.resultatGlobal
          );
        }
        if (dr)
          this.$set(
            this.dossiersResultats,
            this.dossiersResultats.findIndex(
              (d) =>
                d.enqCode === dos.enqCode && d.proprietaire === dos.proprietaire
            ),
            { ...dr, resultat: val ? val : null }
          );
      });
    },
    validation() {
      let dossiersToChange = [];
      this.dossiersResultats.forEach((dos) => {
        if (dos.resultat && dos.resultat !== dos.resultatInitial) {
          dossiersToChange.push({
            action: "finir_enquete",
            enqCode: dos.enqCode,
            proprietaire: dos.proprietaire,
            gestionnaire: this.userCodeGestionnaire,
            resultat: dos.resultat,
          });
        }
      });
      this.loading = true;
      nopmService
        .actionEnMasse(dossiersToChange)
        .then((res) => {
          dossierService
            .createPrefacturationEnMasse(dossiersToChange)
            .then((res1) => {
              let dossierToPop = [];
              this.dossiersResultats.forEach((d) => {
                if (res1.data[d.enqCode]) {
                  dossierToPop.push(
                    this.dossiers.find((dos) => dos.enqCode === d.enqCode)
                  );
                }
              });
              this.$emit("pop", dossierToPop);
            });
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped></style>
