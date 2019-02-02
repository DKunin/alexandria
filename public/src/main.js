import app from './app.js';
import authForm from './auth.js';
import cameraButton from './camera.js';
import descriptionCutter from './description-cutter.js';
Vue.component('cameraButton', cameraButton);
Vue.component('descriptionCutter', descriptionCutter);
Vue.component('authForm', authForm);
Vue.use(VueResource);
new Vue(app);
