const template = `
        <div>
            {{username}}
            <form @submit="processCode" v-if="!username">
                <input type="login" v-model="login" />
                <input type="code" v-if="loginAttempt" v-model="code" />
                <button>Submit</button>
            </form>
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
        },
        username() {
            return this.$store.state.user
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
        }
    }
};

export default authView;
