const template = `
        <div class="section">
            <nav class="breadcrumb" aria-label="breadcrumbs">
              <ul>
                <li><router-link to="/books">Главная</router-link> </li>
              </ul>
            </nav>
            
            <div v-if="book">
                <h2 class="is-size-4">{{ book.name }}</h2> 

                <img :src="book.image" />
                <p v-html="book.description"> </p>
                <br/>
                <p>{{ book.isbn }}</p>
                <br/>
                <p><a :href="book.link" target="_blank">{{ book.link }}</a></p>
            </div>
            <div>
                <button class="button" v-if="!currentlyInOwnPossession && isBookAvailable" @click="checkout(book.book_id)">Взять книгу</button>
                <button class="button" v-if="currentlyInOwnPossession && !isBookAvailable" @click="checkin(book.book_id)">Вернуть книгу</button>
                <p v-if="this.holdPeriodExpired">Период хранения книги истёк, либо взявший уже вернул ее и забыл отметить или забыл вернуть</p>
            </div>
            <hr>
            <details v-if="logs.length">
                <summary class="is-size-5">История</summary>
                <table class="table">
                    <tbody>
                        <tr v-for="log in logs">
                            <td>{{new Date(log.date).toLocaleDateString()}} {{new Date(log.date).toLocaleTimeString()}}</td>
                            <td>{{processAction(log.action)}}</td>
                            <td>{{log.login}}</td>
                        </tr>
                    </tbody>
                </table>
            </details>
        </div>
    `;

const singleBook = {
    data() {
        return {
            book: {},
            query: null,
            logs: []
        }
    },
    computed: {
        // book() {
        //     const stateBooks = this.$store.state.books;
        //     if (!this.$store.state.books) {
        //         return null;
        //     }
        //     const book_id = parseInt(this.$route.params.id);
        //     const currentBook = this.$store.state.books.find(singleBook => singleBook.book_id === book_id);
        //     if (!currentBook) {

        //     }
        //     return currentBook;
        // },
        currentlyInOwnPossession() {
            return (this.book ? this.book.login : null) === this.$store.state.user && this.book.action === 'checkout';
        },
        holdPeriodExpired() {
            if (!this.book || !this.book.date) return null;
            // Период хранения превышает 30 дней
            return ((new Date().getTime() - this.book.date) / 1000 / 60 / 60 / 24) > 30;
        },
        isBookAvailable() {
            if (!this.book) return null;
            if (!this.book.action) return true;
            return this.holdPeriodExpired || this.book.action === 'checkin' ? true : false;
        }
    },
    template,
    methods: {
        checkout(bookid) {
            this.$store.dispatch('checkoutBook', bookid);
            setTimeout(this.getBookLogs, 500);
            setTimeout(this.getBook, 500);
        },
        checkin(bookid) {
            this.$store.dispatch('checkinBook', bookid);
            setTimeout(this.getBookLogs, 500);
            setTimeout(this.getBook, 500);
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
        },
        getBook() {
            this.$http
                .get(
                    `/api/get-book/${this.$route.params.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${this.$store.state.token}`
                        }
                    }
                )
                .then(
                    function(response) {
                        this.book = response.body;
                        console.log(response.body)
                    },
                    function(response) {
                    }
                );
        }
    },
    mounted() {
        this.getBookLogs();
        this.getBook();
    }
};

export default singleBook;
