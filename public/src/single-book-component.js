const template = `
        <div class="book"> 

            <div class="book-image-holder">
                <img class="book-image" :src="book.image" alt="" />
            </div>
            <div class="book-info">
                <h5 class="book-name">{{ book.name }}</h5>
                <h5 class="book-author">{{ book.author }}</h5>

                <description-cutter v-if="book.action !== 'checkout'" :description="book.description"></description-cutter>
                <br v-if="myCollection"/>
                <div class="book-genre">{{ book.genre }}</div>

                <div class="book-taken" v-if="book.action === 'checkout' && !myCollection">
                    <div class="red-text">Нет на полке</div>
                    <div>Взял <a target="_blank" :href="'messages/' + book.login">@{{ book.login }}</a>, {{ new Date(book.date).toLocaleDateString() }}</div>
                </div>

                <div v-if="false && book.action === 'checkin'">последний брал <a target="_blank" :href="'messages/' + book.login">@{{ book.login }}</a></div>
                <div v-if="false">еще никто не брал</div>
        
                <button v-if="!currentlyInOwnPossession(book) && isBookAvailable(book)" @click="checkout(book.book_id)">Взять почитать</button>
                <button v-if="currentlyInOwnPossession(book) && !isBookAvailable(book)" @click="checkin(book.book_id)">Вернуть</button>
                <div v-if="book.book_id === null && book.name">
                    <br />
                    <button @click="postBook(book)">Добавить в библиотеку</button>
                </div>
            </div>

        </div>
    `;

const SingleBookComponent = {
    props: {
        book: Object,
        myCollection: Boolean
    },
    data() {
        return {
        };
    },
    computed: {
        books() {
            return this.$store.state.myCheckedOutBooks.myBooks;
        },
        count() {
            return this.$store.state.myCheckedOutBooks.myBooksCount;
        }
    },
    template,
    methods: {
        checkin(bookid) {
            if (window.confirm('Вы точно вернули книгу на место?')) {
                this.$store.dispatch('checkinBook', bookid);
                setTimeout(() => {
                    this.$store.dispatch('getMyCheckedOutBooks');
                }, 1000);
            }
        },
        checkout(bookid) {
            this.$store.dispatch('checkoutBook', bookid);
        },
        currentlyInOwnPossession(book) {
            if (!this.$store.state.user) {
                return null
            }
            return (
                (book ? book.login : null) === this.$store.state.user &&
                book.action === 'checkout'
            );
        },
        holdPeriodExpired(book) {
            if (!book || !book.date) return null;
            // Период хранения превышает 30 дней
            return (
                (new Date().getTime() - book.date) / 1000 / 60 / 60 / 24 > 30
            );
        },
        isBookAvailable(book) {
            if (!this.$store.state.user) {
                return null
            }
            if (!book) return null;
            if (!book.action) return true;
            return this.holdPeriodExpired(book) || book.action === 'checkin'
                ? true
                : false;
        },
        postBook(book) {
            this.$store.dispatch('postBooks', {
                name: book.name,
                description: book.description,
                author: book.author,
                genre: book.genre,
                link: book.link,
                isbn: book.isbn,
                image: book.image
            });
        }
    },
    mounted() {}
};

export default SingleBookComponent;
