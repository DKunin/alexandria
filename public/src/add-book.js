const template = `
        <div>
            <nav>
              <ul>
                <li><router-link to="/books">Главная</router-link> </li>
              </ul>
            </nav>
            <form @submit="postBook">
                <div class="field">
                  <label class="label">Name</label>
                  <div class="control">
                    <input type="text" v-model="name" class="input"/>
                  </div>
                </div>

                <div class="field">
                  <label class="label">Description</label>
                  <div class="control">
                    <textarea class="textarea" v-model="description" placeholder="Description"></textarea>
                  </div>
                </div>

                <div class="field">
                  <label class="label">Genre</label>
                  <div class="control">
                    <div class="select">
                      <select v-model="genre">
                        
                        <option v-for="genre in genres" :value="genre">{{genre}}</option>
                        
                      </select>
                    </div>
                  </div>
                </div>

                <div class="field">
                  <label class="label">Author</label>
                  <div class="control">
                    <input type="text" v-model="author" class="input"/>
                  </div>
                </div>

                <div class="field">
                  <label class="label">Link</label>
                  <div class="control">
                    <input type="text" v-model="link" class="input"/>
                  </div>
                </div>

                <div class="field">
                  <label class="label">Image</label>
                  <div class="control">
                    <input type="text" v-model="image" class="input"/>
                  </div>
                </div>

                <div class="field">
                  <div class="control">
                    <label class="checkbox">
                      <input type="checkbox" v-model="personal">
                      Моя личная книга (пока не обрабатывается)
                    </label>
                  </div>
                </div>

                <div class="field is-grouped">
                  <div class="control">
                    <button class="button is-link" type="submit">Отправить</button>
                  </div>
                  <div class="control">
                    <button class="button is-text" type="reset">Отмена</button>
                  </div>
                </div>

            </form>
        </div>
    `;

const addBook = {
    data() {
        return {
            personal: '',
            description: '',
            author: '',
            genre: '',
            image: '',
            name: '',
            link: ''
        };
    },
    computed: {
        genres() {
            return this.$store.state.genres;
        }
    },
    template,
    methods: {
        postBook(event) {
            event.preventDefault();
            event.target.reset();
            this.$store.dispatch('postBooks', {
                name: this.name,
                description: this.description,
                author: this.author,
                genre: this.genre,
                link: this.link,
                image: this.image
            });
        }
    },
    mounted() {}
};

export default addBook;
