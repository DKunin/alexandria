const template = `
        <div>
            <form @submit="searchBook">
                <input type="text" v-model="query" />
                <button>search</button>
            </form>
            <div v-for="book in books">
                {{ book.book_id}} : {{ book.name }} ({{ book.login }})
                <button @click="checkout(book.book_id)">Checkout</button>
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
        checkout(bookid) {
            console.log(bookid)
            this.$store.dispatch('checkoutBook', bookid);
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
