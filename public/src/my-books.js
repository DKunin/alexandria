const template = `
        <div>
            <header-component></header-component>

            <div class="book-list">
                <single-book-component :book="book" v-for="book in books" :myCollection="true" />

                <div v-if="books.length === 0">
                    Нет результатов
                </div>
            </div>
            <button @click="logout">Выйти</button>
        </div>
    `;

const booksView = {
    data() {
        return {
            query: null
        };
    },
    computed: {
        books() {
            if (!this.query) {
                return this.$store.state.myCheckedOutBooks.myBooks;
            }

            return this.$store.state.myCheckedOutBooks.myBooks.filter(
                singleBook => {
                    return singleBook.name.includes(this.query);
                }
            );
        }
    },
    template,
    methods: {
        searchBook(event) {
            event.preventDefault();
            this.$store.dispatch('searchBook', {
                text: this.query
            });
        },
        logout() {
            this.$store.commit('logout');
        },
    }
};

export default booksView;
