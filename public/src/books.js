const template = `
        <div>
            <header>
                <div class="logo-holder">
                    <img src="./img/logo.svg" alt="" />
                </div>
                <form class="search-form" @submit="searchBook">
                    <input class="search-input" type="text" v-model="query" placeholder="Автор, название книги или тема"/>
                    <button>найти</button>
                    <cameraButton v-if="false"></cameraButton>
                </form>
                <div class="avatar-holder" v-if="user">
                    <div class="avatar" ></div>
                    {{ user }}
                    <div class="exit-link" @click="logout" v-if="user">
                        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g fill-rule="nonzero" fill="none"><path d="M11 7h5.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H11v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v6zm0 0H5.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5H11V7z" fill="#C2C2C2"/><path stroke="#C2C2C2" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" d="M14 11l3-3-3-3"/></g></svg>
                    </div>
                </div>
            </header>
            <h1>
                Все книги на полке <span class="gray-text">{{ totalCount }}</span>
            </h1>
            <div class="genres-list">
                Все
            </div>
            <div class="book-list">
                <div class="book" v-for="book in books">
                    <div class="book-image-holder">
                        <img class="book-image" :src="book.image" alt="" />
                    </div>
                    <div class="book-info">
                        <h5 class="book-name">{{ book.name }}</h5>
                        <h5 class="book-author">{{ book.author }}</h5>
                        <description-cutter :description="book.description"></description-cutter>

                        <div class="book-genre">{{ book.genre }}</div>

                        <div class="book-taken" v-if="book.action === 'checkout'">
                            <div class="red-text">Нет на полке</div>
                            <div>Взял <a target="_blank" :href="'messages/' + book.login">@{{ book.login }}</a>, {{ new Date(book.date).toLocaleDateString() }}</div>
                        </div>
                        <div v-if="false && book.action === 'checkin'">последний брал <a target="_blank" :href="'messages/' + book.login">@{{ book.login }}</a></div>
                        <div v-if="false">еще никто не брал</div>

                        <button v-if="!currentlyInOwnPossession(book) && isBookAvailable(book)" @click="checkout(book.book_id)">Взять почитать</button>
                        <button v-if="currentlyInOwnPossession(book) && !isBookAvailable(book)" @click="checkin(book.book_id)">Вернуть</button>
                    </div>

                </div>

                <div v-if="books.length === 0">
                    Нет результатов
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
            return this.$store.state.books;
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
        checkin(bookid) {
            this.$store.dispatch('checkinBook', bookid);
        },
        checkout(bookid) {
            this.$store.dispatch('checkoutBook', bookid);
        },
        searchBook(event) {
            event.preventDefault();
            this.$store.dispatch('searchBook', {
                text: this.query
                // ,
                // genre: this.genre
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
        logout() {
            this.$store.commit('logout');
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
