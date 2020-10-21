
const { default: Axios } = require("axios");


class TPBAPI {
    constructor(headless){
        this.headless = headless || false

        
    }
    _config = {
        CORS_bypass: false,
        removeZeroSeedersTorrents: false,
        onlyTrusted: false,
        trackers: [
            'udp://tracker.coppersurfer.tk:6969/announce',
            'udp://9.rarbg.to:2920/announce',
            'udp://tracker.opentrackr.org:1337',
            'udp://tracker.internetwarriors.net:1337/announce',
            'udp://tracker.leechers-paradise.org:6969/announce',
            'udp://tracker.pirateparty.gr:6969/announce',
            'udp://tracker.cyberia.is:6969/announce'
        ]
    }
    xml_backup = XMLHttpRequest.bind({})

    /**
  * Enable or disable CORS Bypass.
  * 
  * @param {Boolean} bool true/false.
  * 
  */
    enableCORS_Bypass = (bool) => {
        if (!typeof bool === "boolean") return console.error('Invalid input')

        this._config.CORS_bypass = bool
        
        if (this._config.CORS_bypass == true) {
            var cors_api_host = 'cors-anywhere.herokuapp.com';
            var cors_api_url = 'https://' + cors_api_host + '/';
            var slice = [].slice;
            var origin = window.location.protocol + '//' + window.location.host;
            var open = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function () {
                var args = slice.call(arguments);
                var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
                if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
                    targetOrigin[1] !== cors_api_host) {
                    args[1] = cors_api_url + args[1];
                }
                return open.apply(this, args);
            };
        } else {
            XMLHttpRequest = this.xml_backup
        }
    }
   
    /**
      * Generate magnet link for torrent object and returns it as a string
      * 
      * @param {Object} torrent Torrent object.
      * @returns {string} Magnet Link
      */
    generateMagnetLink = (torrent) => {
        if (!typeof torrent === "object") return console.error('Invalid input')

        const trackersQueryString = `&tr=${this._config.trackers.map(encodeURIComponent).join('&tr=')}`;

        return `magnet:?xt=urn:btih:${torrent.info_hash}&dn=${encodeURIComponent(torrent.name)}${trackersQueryString}`;
    }

    /**
  * Get Top 100 Torrent by category
  * 
  * Games - 400 / PC - 401, Video - 200 / Movies - 201 / TV Shows - 205, Audio - 100 / Music - 101, Applications - 300
  * @param {number} category Category ID.
  * @param {function} onDone On torrent search  callback.
  */
    getTopTorrents = (category, onDone) => {
        if (!typeof category === "number") return console.error('Invalid input')
        
        let url = `https://apibay.org/precompiled/data_top100_${category}.json`

        Axios.get(url, { responseType: 'json' })
            .then(function (response) {
                console.log('AJDE', response)
                onDone(response.data)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .then(function () {
                // always executed
            });
    }

    /**
 * Search torrents.
 *
 * @param {string} value Search value
 * @param {string} category Games - 400 / PC - 401, Video - 200 / Movies - 201 / TV Shows - 205, Audio - 100 / Music - 101, Applications - 300
 * @param {function} onDone On torrent search done callback.
 */
    search = (value, category, onDone) => {
        let config = this._config

        console.log(value instanceof String, typeof value)
        if (!typeof value === "string" ) return console.error('Invalid value input')
        if (!typeof category === "number") return console.error('Invalid input')

        let url = `https://apibay.org/q.php?q=${value}&cat=${category}`

        Axios.get(url, { responseType: 'json' })
            .then(function (response) {
                console.log('AJDE', response)
                let data = response.data
                //Filtriranje
                if(config.removeZeroSeedersTorrents == true ) data.filter(torrent => torrent.seeders != 0)
                if(config.onlyTrusted == true ) data.filter(torrent => torrent.status != undefined && 'member')

                onDone(data)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .then(function () {
                // always executed
            });

    }



}

module.exports = TPBAPI