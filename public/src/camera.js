const template = `
        <div>
            <div class="control">
                <a class="button is-primary" @click="openFile">
                    <span class="icon">
                      <i class="fas fa-camera"></i>
                    </span>
                </a>
                <input @change="upload" type="file" id="file" capture />
            </div>

            <a class="floating-camera button is-primary" @click="openFile">
                <span class="icon">
                  <i class="fas fa-camera"></i>
                </span>
            </a>
        </div>
    `;
var Quagga = window.Quagga;

const camera = {
    data() {
        return {};
    },
    template,
    methods: {
        decode(src, callBack) {
            Quagga.decodeSingle(
                {
                    inputStream: {
                        size: 800,
                        singleChannel: false
                    },
                    locator: {
                        patchSize: 'medium',
                        halfSample: true
                    },
                    decoder: {
                        readers: [
                            {
                                format: 'ean_reader',
                                config: {}
                            }
                        ]
                    },
                    locate: true,
                    src
                },
                callBack
            );
        },
        openFile() {
            document.querySelector('input[type="file"]').click();
        },
        upload(event) {
            const self = this;
            event.preventDefault();
            if (event.target.files && event.target.files.length) {
                this.decode(
                    URL.createObjectURL(event.target.files[0]),
                    function(result) {
                        self.$router.push({
                            path: `/book/${result.codeResult.code}`
                        });
                    }
                );
            }
        }
    },
    mounted() {}
};

export default camera;
