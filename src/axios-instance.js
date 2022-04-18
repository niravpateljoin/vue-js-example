import axios from "axios";
import { debug } from "./main";

const $AxiosABI = axios.create({
  baseURL: process.env.VUE_APP_ABI_URL,
  headers: {
    common: {
      "X-AUTH-TOKEN": process.env.VUE_APP_ABI_API_KEY,
      "X-Requested-With": "XMLHttpRequest"
    }
  }
});

export default $AxiosABI;

export const axiosJazmin = axios.create({
  baseURL: process.env.VUE_APP_JAZMIN_URL,
  headers: {
    common: {
      "Content-Type": "application/json",
      "X-AUTH-USER": process.env.VUE_APP_JAZMIN_AUTH_USER,
      "X-AUTH-PASS": process.env.VUE_APP_JAZMIN_AUTH_PASS
    }
  }
});

axiosJazmin.interceptors.request.use(config => {
  debug && console.log(config);
  return config;
});
axiosJazmin.interceptors.response.use(config => {
  debug && console.log(config);
  return config;
});

export const axiosNOPM = axios.create({
  baseURL: process.env.VUE_APP_NOPM_URL,
  headers: {
    common: {
      "X-AUTH-TOKEN": process.env.VUE_APP_ABI_API_KEY,
      "X-Requested-With": "XMLHttpRequest"
    }
  }
});

axiosNOPM.interceptors.request.use(config => {
  debug && console.log(config);
  return config;
});
axiosNOPM.interceptors.response.use(config => {
  debug && console.log(config);
  return config;
});

export const makeGetRequestCreator = () => {
  var source;
  return url => {
    if (source) {
      source.cancel("requête annulée");
    }
    source = axios.CancelToken.source();
    return axios.get(process.env.VUE_APP_ABI_URL + url, {
      cancelToken: source.token,
      headers: {
        "X-AUTH-TOKEN": process.env.VUE_APP_ABI_API_KEY,
        "X-Requested-With": "XMLHttpRequest"
      }
    });
  };
};

export const makeApiSSRequestCreator = () => {
  var source;
  return args => {
    if (source) {
      source.cancel("requête annulée");
    }
    source = axios.CancelToken.source();
    return axios.post(process.env.VUE_APP_API_SS_URL, args, {
      cancelToken: source.token,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
  };
};
axios.interceptors.request.use(config => {
  debug && console.log(config);
  return config;
});
//debug des réponses de l'API
axios.interceptors.response.use(config => {
  debug && console.log(config);
  return config;
});
