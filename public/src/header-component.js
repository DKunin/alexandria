const template = `
        <header>
            <div class="logo-holder">
                <a href="/"><img src="./img/logo.svg" alt="" /></a>
            </div>

            <form class="search-form" @submit="searchBook">
                <input class="search-input" type="text" v-model="query" placeholder="Автор, название книги или тема"/>
                <cameraButton :processCode="processCode"></cameraButton>
                <button>найти</button>
            </form>

            <div class="avatar-holder" v-if="user">
                <a href="#/my-books"><div class="avatar">
                    <img class="avatar-image" :src="user.avatar" alt="" />
                </div></a>
                {{ user.fullName }}
            </div>
        </header>
    `;

const headerComponent = {
    data() {
        return {
            query: null
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        }
    },
    template,
    methods: {
        searchBook(event) {
            event.preventDefault();
            this.$store.dispatch('searchBook', {
                text: this.query
            });
        },
        processCode(code) {
            this.query = parseInt(code);
            this.$store.dispatch('searchBook', {
                text: parseInt(code)
            });
        },
    },
    mounted() {}
};

export default headerComponent;
