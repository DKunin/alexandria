const template = `
        <div>
            <header-component></header-component>

            <my-books-component></my-books-component>

            <h1>
                Все книги на полке <span class="gray-text">{{ totalCount }}</span>
            </h1>

            <div class="genres-list">
                Все
            </div>
            <div class="book-list">
                <single-book-component :book="book" v-for="book in books" />
                <div v-if="books.length === 0">
                    Нет результатов
                </div>

                <div v-if="searchingByIsbnAndNoResults">
                    <br />
                    <button @click="fetchByIsbn">Поиск по ISBN</button>
                </div>
            </div>
        </div>
    `;

const booksView = {
    data() {
        return {
            query: null,
            genre: null
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        },
        books() {
            return this.$store.state.books.filter(book => !((book ? book.login : null) === this.$store.state.user.displayName &&
                book.action === 'checkout'));
        },
        totalCount() {
            return this.$store.state.totalCount;
        },
        checkedOutBooks() {
            return this.$store.state.checkedOutBooks;
        },
        myCheckedOutBooks() {
            return this.$store.state.myCheckedOutBooks;
        },
        genres() {
            return this.$store.state.genres;
        },
        searchingByIsbnAndNoResults() {
            return /^\d+$/.test(this.query) && this.$store.state.books.length === 0;
        }
    },
    template,
    methods: {
        processDescription(description, id) {
            if (description.length < 150) {
                return description;
            }
            return description.slice(0, 150) + `...`;
        },
        getBook() {
            this.$store.dispatch('getBooks');
        },
        searchBook(event) {
            event.preventDefault();
            this.$store.dispatch('searchBook', {
                text: this.query
            });
        },
        ganreAndAuthor(book) {
            return [book.author, book.genre].filter(Boolean).join(',');
        },
        handleScroll() {
            if (
                window.innerHeight + window.scrollY >=
                    document.body.offsetHeight &&
                !this.query
            ) {
                this.$store.dispatch('getBooks');
            }
        },
        processCode(code) {
            this.query = parseInt(code);
            this.$store.dispatch('searchBook', {
                text: parseInt(code)
            });
        },
        fetchByIsbn() {
            this.$store.dispatch('getBookByIsbn', this.query);
        }
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
    }
};

export default booksView;
