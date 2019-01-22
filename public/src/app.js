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

const usernamePersist = store => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'inProgressOfAuth') {
            localStorage.setItem('loginAttempt', state.loginAttempt);
        }
    });
};

const getUserName = token => {
    if (token) {
        return JSON.parse(window.atob(token.split('.')[1])).user.login;
    }
    return null;
};

const getLoginAttempt = () => {
    return localStorage.getItem('loginAttempt') || false;
};

const storedToken = JSON.parse(localStorage.getItem('token')) || null;

const generateHeaders = token => {
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const store = new Vuex.Store({
    plugins: [jwtPersist, usernamePersist],
    state: {
        books: [],
        page: 0,
        token: storedToken,
        loginAttempt: getLoginAttempt(),
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
                            commit('inProgressOfAuth', { username });
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
                            window.location.reload();
                        }
                    },
                    response => {
                        // error callback
                    }
                );
        },
        getBooks({ commit, state }) {
            Vue.http.get(`/api/get-books?page=${state.page}`, generateHeaders(state.token)).then(
                response => {
                    if (state.page !== 0) {
                        commit('setBooks', state.books.concat(response.body));
                    } else {
                        commit('setBooks', response.body);
                    }
                    commit('setPage', state.page + 1);
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
                .post('/api/post-book', book, generateHeaders(state.token))
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
                .post('/api/find-book', { query }, generateHeaders(state.token))
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
        getBookLogs({ commit, state }, bookid) {
            Vue.http
                .post(
                    '/api/book-log',
                    { book_id: bookid },
                    generateHeaders(state.token)
                )
                .then(
                    response => {
                        console.log(response.body);
                        // commit('setBooks', response.body);
                    },
                    response => {
                        // if (response.status === 401) {
                        //     commit('resetAuth');
                        // }
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
                    generateHeaders(state.token)
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
                    generateHeaders(state.token)
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
            state.loginAttempt = newState.username;
        },
        setJwtToken(state, newJwt) {
            state.token = newJwt;
        },
        resetAuth(state, newJwt) {
            state.token = null;
        },
        setBooks(state, books) {
            state.books = books;
        },
        setPage(state, page) {
            state.page = page;
        }
    }
});

const template = `
    <main>        
        <authForm></authForm>
        <router-view v-if="username"/>
    </main>
`;

const app = {
    router,
    el: '#app',
    template,
    store,
    computed: {
        username() {
            return this.$store.state.user;
        }
    },
    name: 'app',
    mounted() {
        this.$store.dispatch('getBooks');
    }
};

export default app;
