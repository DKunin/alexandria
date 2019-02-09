const template = `
        <div class="dialog-holder" v-if="opened">
            <div class="dialog-bg" ></div>
            <dialog :open="opened" class="auth-dialog">
                <h2>Вход в библиотеку</h2>
                <form @submit="processCode" v-if="!username">
                    <h3 for="">Логин в Slack</h3>
                    <div class="flex">
                        <input v-if="!loginAttempt" class="input" type="text" v-model="login" placeholder="username"/>
                        <input v-if="loginAttempt" class="input" type="text" v-model="code" placeholder="Код"/>
                        <button>
                            <span v-if="!loginAttempt">Отправить ссылку</span>
                            <span v-if="loginAttempt">Подтвердить</span>
                        </button>
                    </div>
                    <p class="flex center">
                        <a v-if="loginAttempt" @click="resetAttempt">
                            Начать заново
                        </a>
                    </p>
                </form>
                <p class="gray-text">
                    После нажатия кнопки вам прийдет персональная ссылка от SlackBot, перейдя по которой вы зайдете в свою учетку.
                </p>
                <div @click="closeAuth" class="close-button">⨯</div>
            </dialog>
        </div>
    `;

const authView = {
    data() {
        return {
            login: '',
            code: '',
            opened: true
        };
    },
    computed: {
        loginAttempt() {
            return this.$store.state.loginAttempt;
        },
        username() {
            return this.$store.state.user;
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
        },
        closeAuth() {
            this.opened = false;
            document.body.style.overflow = 'visible';
        }
    },
    mounted() {
        if (this.$route.query.code) {
            this.$store.dispatch('validateCode', {
                login: this.loginAttempt,
                code: parseInt(this.$route.query.code)
            });
        }
        if (!this.username) {
            document.body.style.overflow = 'hidden';
        }
    },
    beforeDestroy() {
        document.body.style.overflow = 'visible';
    }
};

export default authView;
