import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import axios from 'axios';
import { auth } from './modules/auth';
import { territory } from './modules/territory';
import { territories } from './modules/territories';

Vue.use(Vuex);

axios.defaults.baseURL = process.env.VUE_APP_ROOT_API;
axios.defaults.method = 'post';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/json';

export const store = new Store({
  modules: {
    auth,
    territory,
    territories
  }
});
