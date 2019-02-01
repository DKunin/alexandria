import app from './app.js';
import authForm from './auth.js';
import cameraButton from './camera.js';
Vue.component('cameraButton', cameraButton);
Vue.component('authForm', authForm);
Vue.use(VueResource);
new Vue(app);
