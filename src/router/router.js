import Vue from "vue";
import VueRouter from "vue-router";
// import Dossiers from "@/views/Dashboard/Dossiers";
import Dossier from "@/views/Dossier/Dossier";
import Stats from "@/views/Stats/Stats";
// import Authentication from "@/views/Authentication/Authentication";
// import AuthenticationFromGems from "@/views/Authentication/AuthenticationFromGems";
// import ActionsMasse from "@/views/ActionsMasse/ActionsMasse";
// import DossierInitializer from "@/views/Dossier/DossierInitializer";

Vue.use(VueRouter);

const ifAuthenticated = (to, from, next) => {
  sessionStorage.getItem("user")
    ? next()
    : next({ path: "/authentication", query: { redirect: to.path } });
};

const routes = [
  {
    path: "/",
    name: "default",
    component: () => import(/* webpackPrefetch: true */ '@/views/Dashboard/Dossiers'),
    props: true,
    beforeEnter: ifAuthenticated
  },
  {
    path: "/authentication",
    name: "authentication",
    component: () => import('@/views/Authentication/Authentication'),
    props: route => ({
      redirect: route.query.redirect
    })
  },
  {
    path: "/authentication/reset/:token",
    name: "reset",
    component: () => import('@/views/Authentication/ResetPassword'),
    props: true
  },
  {
    path: "/authentication/initialize/:token",
    name: "initialize",
    component: () => import("@/views/Authentication/InitializePassword"),
    props: true
  },
  {
    path: "/profil/:user",
    name: "profil",
    component: () => import('@/views/User/Profil'),
    props: true,
    beforeEnter: ifAuthenticated
  },
  {
    path: "/extLogin",
    component: () => import('@/views/Authentication/AuthenticationFromGems'),
    props: route => ({
      cryptedPass: route.query.p,
      username: route.query.u,
      enqCode: route.query.e,
      proprietaire: route.query.prop,
      ficheSuiveuse: route.query.fs
    })
  },
  {
    path: "/authentication/switch",
    component: () => import('@/views/Authentication/AuthenticationFromJazmin'),
    props: route => ({
      token: route.query.token,
      username: route.query.username,
      switchUsername: route.query.switch_username
    })
  },
  {
    path: "/dossiers",
    name: "dossiers",
    props: true,
    component: () => import(/* webpackPrefetch: true */ '@/views/Dashboard/Dossiers'),
    beforeEnter: ifAuthenticated
  },
  {
    path: "/dossiers/dossier/:id",
    name: "dossier",
    component: Dossier,
    props: true,
    beforeEnter: ifAuthenticated
  },
  {
    path: "/initDossier/:proprietaire/:enqCode",
    name: "initDossier",
    component: () => import('@/views/Dossier/DossierInitializer'),
    props: true,
    beforeEnter: ifAuthenticated
  },
  {
    path: "/stats",
    name: "stats",
    component: Stats,
    beforeEnter: ifAuthenticated
  },
  {
    path: "/actionsMasse",
    name: "actionsMasse",
    component: () => import(/* webpackPrefetch: true */ '@/views/ActionsMasse/ActionsMasse'),
    props: true,
    beforeEnter: ifAuthenticated
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes: routes
});

export { router };
