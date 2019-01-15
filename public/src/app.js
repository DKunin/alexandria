// Pages
import books from './books.js';

const routes = [
    { path: '/', redirect: '/books' },
    { path: '/books', component: books }
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
                    '/api/get-books',
                    {
                        headers: {
                            Authorization: `Bearer ${state.token}`
                        }
                    }
                )
                .then(
                    response => {
                        commit('setBooks', response.body);
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
        },
        setBooks(state, books) {
            state.books = books;
        }
    }
});

const template = `
    <main>
        <h2>App</h2>
        
        <authForm></authForm>

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
