const template = `
        <div class="section">
            <form @submit="searchBook" class="container">
                <div class="field has-addons">
                  <div class="control">
                    <input type="text"  class="input" v-model="query" />
                  </div>
                  <div class="control">
                    <button class="button is-primary">поиск</button>
                  </div>
                </div>
            </form>
            <div class="container">
                <div class="card" v-for="book in books">
                  <div class="card-content">
                    <div class="media">
                      <div class="media-content">
                        <p class="title is-4"><router-link :to="'book/' + book.book_id">{{ book.name }}</router-link></p>
                        <p class="subtitle is-6">{{ book.author }}, {{ book.genre }}</p>
                      </div>
                    </div>

                    <div class="content">
                      {{ processDescription(book.description, book.book_id) }}

                    </div>
                    
                  </div>
                    <footer class="card-footer">
                        <p class="card-footer-item">
                          <span>
                            <div v-if="book.action === 'checkout'">сейчас у <a target="_blank" :href="'messages/@' + book.login">@{{ book.login }}</a></div>
                            <div v-if="book.action === 'checkin'">последний брал @{{ book.login }}</div>
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
            this.$store.dispatch('searchBook', this.query);
        }
    }
};

export default booksView;
