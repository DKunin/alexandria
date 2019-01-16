const template = `
        <div>
            <form @submit="postBook">
                <div><label for="">Name: <input type="text" v-model="name" /></label></div>
                <div><label for="">Description: <textarea  v-model="description" /></label></div>
                <div><label for="">Link<input type="text" v-model="link" /></label></div>
                <div><label for="">Image<input type="text" v-model="image" /></label></div>
                <button>Send</button>
            </form>
        </div>
    `;

const addBook = {
    data() {
        return {
            name: '',
            description: '',
            link: '',
            image: ''
        };
    },
    computed: {},
    template,
    methods: {
        postBook(event) {
            event.preventDefault();
            event.target.reset();
            this.$store.dispatch('postBooks', {
                name: this.name,
                description: this.description,
                link: this.link,
                image: this.image
            });
        }
    },
    mounted() {}
};

export default addBook;
