const template = `
        <div>
            {{code}}
            <input @change="upload" type="file" id="file" capture/>
        </div>
    `;
var Quagga = window.Quagga;

const camera = {
    data() {
        return {
          code: null
        };
    },
    computed: {
        genres() {
            return this.$store.state.genres;
        }
    },
    template,
    methods: {
        decode(src, callBack) {
          Quagga.decodeSingle({
            inputStream: {
                size: 800,
                singleChannel: false
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            decoder: {
                readers: [{
                    format: "ean_reader",
                    config: {}
                }]
            },
            locate: true,
            src
        }, callBack);
          // Quagga
          //   .decoder({readers: ['ean_reader']})
          //   .locator({patchSize: 'medium'})
          //   .fromImage(src, {size: 800})
          //   .toPromise()
          //   .then(function(result) {
          //       console.log(result.codeResult.code)
          //   });
        },
        upload(event) {
            const self = this;
            event.preventDefault();
            if (event.target.files && event.target.files.length) {
                this.decode(URL.createObjectURL(event.target.files[0]), function(result) {
                  self.code = result.codeResult.code;
                });
            }
        }
    },
    mounted() {}
};

export default camera;
