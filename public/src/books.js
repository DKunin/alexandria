const template = `
        <div>
            <button @click="getBook">update</button>
            <div v-for="book in books">
                {{ book.name }}
            </div>
        </div>
    `;

const authView = {
    computed: {
        books() {
            return this.$store.state.books;
        }
    },
    template,
    methods: {
        getBook() {
            this.$store.dispatch('getBooks');
        }
    },
    mounted() {
        this.$store.dispatch('getBooks');
    }
};

export default authView;
