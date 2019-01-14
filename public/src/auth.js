const template = `
        <div>
            <form @submit="processCode">
                <input type="login" v-model="login" />
                <input type="code" v-if="loginAttempt" v-model="code" />
                <button>Submit</button>
            </form>
            <button @click="getBook"></button>
        </div>
    `;

const authView = {
    data() {
        return {
            login: '',
            code: ''
        };
    },
    computed: {
        loginAttempt() {
            return this.$store.state.loginAttempt;
        }
    },
    template,
    methods: {
        processCode(event) {
            event.preventDefault();
            if (!this.code) {
                this.$store.dispatch('getCode', this.login);
            } else {
                this.$store.dispatch('validateCode', {
                    login: this.login,
                    code: parseInt(this.code)
                });
            }
        },
        getBook() {
            this.$store.dispatch('getBooks');
        }
    },
    mounted() {
        this.$store.dispatch('getBooks');
    }
};

export default authView;
