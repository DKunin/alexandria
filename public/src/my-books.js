const template = `
        <div class="section">
            <nav class="breadcrumb" aria-label="breadcrumbs">
              <ul>
                <li><router-link to="/books">Главная</router-link> </li>
              </ul>
            </nav>
            <h2>Книги у меня:</h2>
            <form @submit="searchBook" class="container">
                <div class="field has-addons">
                  <div class="control">
                    <input type="text"  class="input" v-model="query" />
                  </div>
                </div>
            </form>
            <div class="container">
                <div class="card" v-for="book in books">
                  <div class="card-content">
                    <div class="media">
                      <div class="media-content">
                        <div class="media-content-image">
                            <img :src="book.image" alt="" />
                        </div>
                        <div>
                            <p class="title is-4"><router-link :to="'book/' + book.book_id">{{ book.name }}</router-link></p>
                            <p class="subtitle is-6">{{ ganreAndAuthor(book) }}</p>
                        </div>
                      </div>
                    </div>

                    <div class="content">
                        <description-cutter :description="book.description"></description-cutter>
                    </div>
                    
                  </div>
                    <footer class="card-footer">
                        <p class="card-footer-item">
                          <span>
                            <button class="button" @click="checkin(book.book_id)">Вернуть книгу</button>
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
        };
    },
    computed: {
        books() {
            if (!this.query) {
                return this.$store.state.myCheckedOutBooks.myBooks;
            }

            return this.$store.state.myCheckedOutBooks.myBooks.filter(
                singleBook => {
                    return singleBook.name.includes(this.query);
                }
            );
        }
    },
    template,
    methods: {
        processDescription(description) {
            if (description.length < 150) {
                return description;
            }
            return description.slice(0, 150) + `...`;
        },
        getBook() {
            this.$store.dispatch('getBooks');
        },

        ganreAndAuthor(book) {
            return [book.author, book.genre].filter(Boolean).join(',');
        },
        checkin(bookid) {
            if (window.confirm('Вы точно вернули книгу на место?')) {
                this.$store.dispatch('checkinBook', bookid);
                setTimeout(() => {
                    this.$store.dispatch('getMyCheckedOutBooks');
                }, 1000);
            }
        },
        searchBook(event) {
            event.preventDefault();
            this.$store.dispatch('searchBook', {
                text: this.query
                // ,
                // genre: this.genre
            });
        }
    }
};

export default booksView;
