import app from './app.js';
import authForm from './auth.js';
Vue.component('authForm', authForm);
Vue.use(VueResource);
new Vue(app);
