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
            if (this.$store.state.token) {
                
                return JSON.parse(window.atob(this.$store.state.token.split('.')[1])).user.login;
            }
            return null
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
