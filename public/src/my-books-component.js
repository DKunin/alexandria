const template = `
        <div> 
            <h2>Сейчас читаю <span class="gray-text">{{ count }}</span></h2>
            <div class="my-books">
                <single-book-component :book="book" v-for="book in books" :myCollection="true" />
            </div>
        </div>
    `;

const myBooksComponent = {
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
    },
    mounted() {}
};

export default myBooksComponent;
