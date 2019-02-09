const template = `
        <div class="book-description-holder">
            <div v-html="description"></div>
            <a href="" @click="toggleMore" v-if="textAmount">
                <span v-if="!opened">Ещё</span>
                <span v-if="opened">скрыть</span>
            </a>
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
