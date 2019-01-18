const template = `
        <div>
            <form @submit="searchBook">
                <input type="text" v-model="query" />
                <button>search</button>
            </form>
            <div v-for="book in books">
                <router-link :to="'book/' + book.book_id">{{ book.name }}</router-link> 
                
                <div v-if="book.action === 'checkout'">сейчас у: {{ book.login }}</div>
                <div v-if="book.action === 'checkin'">последний брал:{{ book.login }}</div>
                <div v-if="!book.action">еще никто не брал</div>
                
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
        checkin(bookid) {
            this.$store.dispatch('checkinBook', bookid);
        },
        searchBook(event) {
            event.preventDefault();
            this.$store.dispatch('searchBook', this.query);
        }
    }
};

export default booksView;
