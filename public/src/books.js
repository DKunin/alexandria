const template = `
        <div>
            <form @submit="searchBook">
                <input type="text" v-model="query" />
                <button>search</button>
            </form>
            <div v-for="book in books">
                {{ book.name }}
            </div>
        </div>
    `;

const booksView = {
    data() {
        return {
            query: null
        }
    },
    computed: {
        books() {
            return this.$store.state.books;
        }
    },
    template,
    methods: {
        getBook() {
            this.$store.dispatch('getBooks');
        },
        searchBook(event) {
            event.preventDefault();
            this.$store.dispatch('searchBook', this.query);
        }
    },
    mounted() {
        this.$store.dispatch('getBooks');
    }
};

export default booksView;
