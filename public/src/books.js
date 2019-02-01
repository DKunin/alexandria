const template = `
        <div class="section">
            <form @submit="searchBook" class="container">
                <div class="select" v-if="false">
                    <select v-model="genre">
                        <option v-for="genre in genres" :value="genre">{{genre}}</option>
                    </select>
                </div>
                <div class="field has-addons">
                  <div class="control">
                    <input type="text"  class="input" v-model="query" />
                  </div>
                  <div class="control">
                    <button class="button is-primary">поиск</button>
                  </div>
                  <cameraButton></cameraButton>
                </div>
            </form>
            <div class="level">
                <p class="container">
                    <span v-if="!query">Всего книг: </span><span v-if="query">Найдено книг: </span>{{ totalCount }}
                    <span> Книг читают: {{checkedOutBooks}} </span>
                </p>
            </div>
            <div class="container">
                <div class="card" v-for="book in books">
                  <div class="card-content">
                    <div class="media">
                      <div class="media-content">
                        <img :src="book.image" alt="" />
                        <p class="title is-4"><router-link :to="'book/' + book.book_id">{{ book.name }}</router-link></p>
                        <p class="subtitle is-6">{{ ganreAndAuthor(book) }}</p>
                      </div>
                    </div>

                    <div class="content">
                      {{ processDescription(book.description, book.book_id) }}

                    </div>
                    
                  </div>
                    <footer class="card-footer">
                        <p class="card-footer-item">
                          <span>
                            <div v-if="book.action === 'checkout'">сейчас у <a target="_blank" :href="'messages/' + book.login">@{{ book.login }}</a></div>
                            <div v-if="book.action === 'checkin'">последний брал <a target="_blank" :href="'messages/' + book.login">@{{ book.login }}</a></div>
                            <div v-if="!book.action">еще никто не брал</div>
                          </span>
                        </p>
                      </footer>
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
        }
    },
    computed: {
        books() {
            return this.$store.state.books;
        },
        totalCount() {
            return this.$store.state.totalCount;
        },
        checkedOutBooks() {
            return this.$store.state.checkedOutBooks;
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
            if((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !this.query) {
                this.$store.dispatch('getBooks');
            }
        }
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll)
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll)
  }
};

export default booksView;
