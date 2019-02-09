const template = `
        <div class="book-description-holder">
            <div v-html="changedDescription"></div>
            <a class="toggle-more" href="" @click="toggleMore" v-if="textAmount">
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
        },
        changedDescription() {
            if (!this.description) return null;
            if (this.opened) return this.description;
            return this.description.slice(0, 300) + '...';
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
        toggleMore(event) {
            event.preventDefault();
            this.opened = !this.opened;
        }
    },
    mounted() {}
};

export default descriptionCutter;
