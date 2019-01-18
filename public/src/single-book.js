const template = `
        <div>
            <div v-if="book">
                {{ book.name }}
            </div>
            <button v-if="!currentlyInOwnPossession" @click="checkout(book.book_id)">Checkout</button>
            <button v-if="currentlyInOwnPossession" @click="checkin(book.book_id)">Checkin</button>
        </div>
    `;

const singleBook = {
    data() {
        return {
            query: null
        }
    },
    computed: {
        book() {
            const stateBooks = this.$store.state.books;
            if (!this.$store.state.books) {
                return null;
            }
            const book_id = parseInt(this.$route.params.id);
            const currentBook = this.$store.state.books.find(singleBook => singleBook.book_id === book_id);
            return currentBook;
        },
        currentlyInOwnPossession() {
            return (this.book? this.book.login : null) === this.$store.state.user;
        },
        isBookAvailable() {
            return (this.book? this.book.action ? this.book.action === 'checkin' : null : null)
        }
    },
    template,
    methods: {
        checkout(bookid) {
            this.$store.dispatch('checkoutBook', bookid);
        },
        checkin(bookid) {
            this.$store.dispatch('checkinBook', bookid);
        }
    }
};

export default singleBook;
