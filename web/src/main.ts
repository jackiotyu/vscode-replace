import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { hotReload } from './utils/common';

createApp(App).use(store).use(router).mount('#app');

if (module.hot) {
    module.hot.accept(['./App.vue', './router', './store'], hotReload);
}
