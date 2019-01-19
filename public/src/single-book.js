const template = `
        <div class="section">
            <nav class="breadcrumb" aria-label="breadcrumbs">
              <ul>
                <li><router-link to="/books">Главная</router-link> </li>
              </ul>
            </nav>
            
            <div v-if="book">
                <h2 class="is-size-4">{{ book.name }}</h2> 
                <p>{{ book.description }}</p>
            </div>
            <div>
                <button class="button" v-if="!currentlyInOwnPossession || isBookAvailable" @click="checkout(book.book_id)">Взять книгу</button>
                <button class="button" v-if="currentlyInOwnPossession && !isBookAvailable" @click="checkin(book.book_id)">Вернуть книгу</button>
            </div>

            <h2 v-if="logs.length">История</h2>
            <table class="table">
                <tbody>
                    <tr v-for="log in logs">
                        <td>{{new Date(log.date).toLocaleDateString()}} {{new Date(log.date).toLocaleTimeString()}}</td>
                        <td>{{processAction(log.action)}}</td>
                        <td>{{log.login}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

const singleBook = {
    data() {
        return {
            query: null,
            logs: []
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
            return (this.book ? this.book.login : null) === this.$store.state.user;
        },
        isBookAvailable() {
            return (this.book? this.book.action ? this.book.action === 'checkin' : null : null)
        }
    },
    template,
    methods: {
        checkout(bookid) {
            this.$store.dispatch('checkoutBook', bookid);
            this.getBookLogs();
        },
        checkin(bookid) {
            this.$store.dispatch('checkinBook', bookid);
            this.getBookLogs();
        },
        processAction(action) {
            if (action === 'checkin') {
                return 'вернул'
            } else {
                return 'взял'
            }
        },
        getBookLogs() {
            this.$http
                .post(
                    '/api/book-log',
                    { book_id: parseInt(this.$route.params.id) },
                    {
                        headers: {
                            Authorization: `Bearer ${this.$store.state.token}`
                        }
                    }
                )
                .then(
                    function(response) {
                        this.logs = response.body.filter(singleEntry => singleEntry.action);
                    },
                    function(response) {
                    }
                );
        }
    },
    mounted() {
        this.getBookLogs();
    }
};

export default singleBook;
