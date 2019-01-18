// Pages
import books from './books.js';
import addBook from './add-book.js';
import singleBook from './single-book.js';

const routes = [
    { path: '/', redirect: '/books' },
    { path: '/books', component: books },
    { path: '/add', component: addBook },
    { path: '/book/:id', component: singleBook }
];

const router = new VueRouter({ routes });

const jwtPersist = store => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setJwtToken') {
            localStorage.setItem('token', JSON.stringify(state.token));
        }
    });
};

const getUserName = (token) => {
    if (token) {
        return JSON.parse(window.atob(token.split('.')[1])).user.login;
    }
    return null;
}
const storedToken = JSON.parse(localStorage.getItem('token')) || null;

const store = new Vuex.Store({
    plugins: [jwtPersist],
    state: {
        books: [],
        token: storedToken,
        loginAttempt: false,
        user: getUserName(storedToken)
    },
    actions: {
        getCode({ commit }, username) {
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
        validateCode({ commit }, pair) {
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
        getBooks({ commit, state }, pair) {
            Vue.http
                .get('/api/get-books', {
                    headers: {
                        Authorization: `Bearer ${state.token}`
                    }
                })
                .then(
                    response => {
                        commit('setBooks', response.body);
                    },
                    response => {
                        if (response.status === 401) {
                            commit('resetAuth');
                        }
                    }
                );
        },
        postBooks({ dispatch, commit, state }, book) {
            Vue.http
                .post('/api/post-book', book, {
                    headers: {
                        Authorization: `Bearer ${state.token}`
                    }
                })
                .then(
                    response => {
                        dispatch('getBooks');
                    },
                    response => {
                        if (response.status === 401) {
                            commit('resetAuth');
                        }
                    }
                );
        },
        searchBook({ commit, state }, query) {
            Vue.http
                .post(
                    '/api/find-book',
                    { query },
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
                        if (response.status === 401) {
                            commit('resetAuth');
                        }
                    }
                );
        },
        checkoutBook({ commit, state, dispatch }, book_id) {
            let login;
            if (state.token) {
                login = getUserName(state.token);
            }
            if (!login) {
                return null;
            }
            Vue.http
                .post(
                    '/api/checkout-book',
                    {
                        login,
                        book_id
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${state.token}`
                        }
                    }
                )
                .then(
                    response => {
                        dispatch('getBooks');
                    },
                    response => {
                        if (response.status === 401) {
                            commit('resetAuth');
                        }
                    }
                );
        },
        checkinBook({ commit, state, dispatch }, book_id) {
            let login;
            if (state.token) {
                login = getUserName(state.token);
            }
            if (!login) {
                return null;
            }
            Vue.http
                .post(
                    '/api/checkin-book',
                    {
                        login,
                        book_id
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${state.token}`
                        }
                    }
                )
                .then(
                    response => {
                        dispatch('getBooks');
                    },
                    response => {
                        if (response.status === 401) {
                            commit('resetAuth');
                        }
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
        resetAuth(state, newJwt) {
            state.token = null;
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
    mounted() {
        this.$store.dispatch('getBooks');
    }
};

export default app;
