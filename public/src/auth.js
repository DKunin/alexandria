const template = `
        <nav class="navbar" role="navigation" aria-label="main navigation">
            <div class="navbar-end">
              <div class="navbar-item">
                {{username}}
                <div class="buttons">
                    <form @submit="processCode" v-if="!username">
                        <div class="field is-horizontal">
                          <div class="field-label">
                            <input v-if="!loginAttempt" class="input" type="text" v-model="login" placeholder="Логин в Slack"/>
                            <input v-if="loginAttempt" class="input" type="text" v-model="code" placeholder="Код подтверждения"/>
                          </div>
                          <div class="field-body">
                            <button class="button is-light">
                                <span v-if="!loginAttempt">Получить ссылку в Slack</span>
                                <span v-if="loginAttempt">Подтвердить код</span>
                            </button>
                            <button v-if="loginAttempt" @click="resetAttempt" class="button is-light">
                                Начать заново
                            </button>
                          </div>
                        </div>
                        
                    </form>
                </div>
              </div>
            </div>
        </nav>
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
                    login: this.loginAttempt || this.login,
                    code: parseInt(this.code)
                });
            }
        },
        resetAttempt() {
            this.$store.commit('resetAttempt');
        }
    },
    mounted() {
        if(this.$route.query.code) {
            this.$store.dispatch('validateCode', {
                login: this.loginAttempt,
                code: parseInt(this.$route.query.code)
            });
        }
    }
};

export default authView;
