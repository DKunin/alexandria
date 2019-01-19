const template = `
        <div>
            <form @submit="postBook">
                <div><label for="">Name: <input type="text" v-model="name" /></label></div>
                <div><label for="">Description: <textarea  v-model="description" /></label></div>
                <div><label for="">Genre: <select  v-model="genre">
                    <option value="Разработка">Разработка</option>
                    <option value="Менеджмент">Менеджмент</option>
                    <option value="Маркетинг">Маркетинг</option>
                    <option value="Психология">Психология</option>
                <select></label></div>
                <div><label for="">Author: <input type="text" v-model="author" /></label></div>
                <div><label for="">Link<input type="text" v-model="link" /></label></div>
                <div><label for="">Image<input type="text" v-model="image" /></label></div>
                <button>Send</button>
            </form>
        </div>
    `;

const addBook = {
    data() {
        return {
            description: '',
            author: '',
            genre: '',
            image: '',
            name: '',
            link: ''
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
