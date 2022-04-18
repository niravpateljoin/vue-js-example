import { indexOf } from "leaflet/src/core/Util";

export const ToolsMixin = {
  data() {
    return {
      codePaysNonHT: [
        "FR",
        "GP",
        "GF",
        "MQ",
        "RE",
        "YT",
        "NC",
        "PF",
        "BL",
        "MF",
        "PM",
        "TF",
        "WF"
      ],
      eclairTypes: ["E", "CE", "CIE", "RDE"],
      codePaysDomTom: [
        "GP",
        "GF",
        "MQ",
        "RE",
        "YT",
        "NC",
        "PF",
        "BL",
        "MF",
        "PM",
        "TF",
        "WF"
      ]
    };
  },
  methods: {
    excerpt(text, maxLength = 150, cutOff = "...", keepWord = false) {
      if (text === null) return;
      if (text.length <= maxLength) {
        return text;
      }
      if (text.length > maxLength) {
        if (keepWord) {
          text.substring(0, text.length + 1);
          if (indexOf(text, " ")) {
            let lastSpace = indexOf(text, " ");
            text = text.substring(0, lastSpace);
            text += cutOff;
          }
        } else {
          text = text.substring(0, maxLength);
          text = text.trimEnd();
          text += cutOff;
        }
      }
      return text;
    },
    checkIfHabitationNotHT(paysCode) {
      return this.codePaysNonHT.includes(paysCode);
    },
    checkIfHabitationIsDomTom(paysCode) {
      return this.codePaysDomTom.includes(paysCode);
    },
    checkIfDossierIsEclair(type) {
      return this.eclairTypes.includes(type);
    }
  }
};
