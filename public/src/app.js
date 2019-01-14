// Pages
import auth from './auth.js';

const routes = [
    { path: '/', redirect: '/auth' },
    { path: '/auth', component: auth }
];

const router = new VueRouter({ routes });

const jwtPersist = store => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setJwtToken') {
            localStorage.setItem('token', JSON.stringify(state.token));
        }
    });
};

const store = new Vuex.Store({
    plugins: [jwtPersist],
    state: {
        books: [],
        token: JSON.parse(localStorage.getItem('token')) || null,
        loginAttempt: false
    },
    actions: {
        getCode: function({ commit }, username) {
            Vue.http
                .post('/api/generate-code', {
                    username
                })
                .then(
                    response => {
                        if (response.status === 200) {
                            commit('inProgressOfAuth');
                        }
                    },
                    response => {
                        // error callback
                    }
                );
        },
        validateCode: function({ commit }, pair) {
            Vue.http
                .post('/api/validate-code', {
                    login: pair.login,
                    code: pair.code
                })
                .then(
                    response => {
                        if (response.status === 200) {
                            console.log(response);
                            commit('setJwtToken', response.body.token);
                        }
                    },
                    response => {
                        // error callback
                    }
                );
        },
        getBooks: function({ commit, state }, pair) {
            console.log(state.token);
            Vue.http
                .get(
                    '/api/get-book',
                    {
                        headers: {
                            Authorization: `Bearer ${state.token}`
                        }
                    }
                )
                .then(
                    response => {
                        console.log(response)
                    },
                    response => {
                        console.log(response)
                    }
                );
        }
    },
    mutations: {
        inProgressOfAuth(state, newState) {
            state.loginAttempt = true;
        },
        setJwtToken(state, newJwt) {
            state.token = newJwt;
        }
    }
});

const template = `
    <main>
        <h2>App</h2>
        <router-view />
    </main>
`;

const app = {
    router,
    el: '#app',
    template,
    store,
    name: 'app',
    data() {
        return {};
    }
};

export default app;
