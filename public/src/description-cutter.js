const template = `
        <div class="book-desc-holder">

            <p v-if="opened"
                v-html="description" :class="generateClass()">
            </p>
            <div class="button-holder">
                <button class="button" @click="toggleMore" v-if="textAmount">
                    <span v-if="!opened">Подробнее</span>
                    <span v-if="opened">Скрыть</span>
                </button>
            </div>
        </div>
    `;

const descriptionCutter = {
    props: {
        description: String
    },
    data() {
        return {
            opened: false
        };
    },
    computed: {
        textAmount() {
            return this.description.length > 150;
        }
    },
    template,
    methods: {
        generateClass() {
            if (!this.textAmount) return null;
            return (
                'book-description ' +
                (this.opened ? 'book-description-opened' : '')
            );
        },
        toggleMore() {
            this.opened = !this.opened;
        }
    },
    mounted() {}
};

export default descriptionCutter;
