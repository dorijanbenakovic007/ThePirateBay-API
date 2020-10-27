let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { default: Axios } = require("axios");




class TPBAPI {
    _config = {
        CORS_bypass: false,
        proxy: {
            enabled: true,
            ip: null,
            port: null,
            proxies: []
        },
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
  * Fetch proxies and store in _config.proxy.proxies. First fetched proxy will automatically be mounted. proxy.ip and proxy.port must be null when manually calling this function.
  * 
  * @param {function} onDone Callback when done.
  * 
  */
    getProxy = (onDone) => {
        let config = this._config

        if (this._config.proxy.ip != null && this._config.proxy.port != null) {
            onDone()
        }
        else {
            Axios.get('https://proxy11.com/api/proxy.json?key=MjAxOA.X5fqyA.OgNIfkMgQ3G_B3mx5l7iMoLBaP8', { responseType: 'json' })
                .then(function (response) {
                    let filteredProxies = response.data.data.filter(proxy => proxy.country_code !== 'de' && 'gb')
                    config.proxy.proxies = filteredProxies
                    config.proxy.ip = config.proxy.proxies[0].ip
                    config.proxy.port = config.proxy.proxies[0].port
                    onDone()
                })
                .catch(function (error) {
                    // handle error
                    console.error('TPBAPI: Error while fetching proxy', error);

                })
                .then(function () {
                    // always executed

                });
        }

    }

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
  * Audio - 100 |
  * Music - 101 | Audio books - 102 | Sound clips - 103 | FLAC - 103 | Other - 199  ||
  * Video - 200 |
  * Movies - 101 | Movies DVDR - 102 | Music videos - 103 | Movie clips - 103 | TV Shows - 199 | Handheld - 222 | HD - Movies - 434 | HD - TV shows - 442 | 3D - 424 | Other - 299 ||
  * Applications - 300 |
  * Windows - 101 | Mac - 102 | UNIX - 103 | Handheld - 103 | IOS (iPad/iPhone) - 199 | Android - 525 | Other OS - 205 ||
  * Games - 400
  * PC - 401 | Mac - 402 | PSx - 403 | XBOX360 - 404 | Wii - 405 | Handheld - 406 | IOS(iPad/iPhone) - 407 | Android - 408 | Other - 499 ||
  * Other - 600
  * E-books - 601 | Comics - 602 | Pictures - 603 | Covers - 604 | Physibles - 605 | Other - 699 
  * 
  * @param {number} category ID.
  * @param {function} onDone On torrent search  callback.
  * @param {function} onError On error.
  */
    getTopTorrents = (category, onDone) => {
        if (!typeof category === "number") return console.error('Invalid input')

        let config = this._config
        let url = `https://apibay.org/precompiled/data_top100_${category}.json`

        switch (this._config.proxy.enabled) {
            case true:
                this.getProxy(() => {
                    Axios.get(url, {
                        responseType: 'json', proxy: {
                            protocol: 'http',
                            host: this._config.proxy.ip,
                            port: this._config.proxy.port
                        }
                    })
                        .then(function (response) {
                            let res = response.data

                            if (config.removeZeroSeedersTorrents) res = res.filter(torrent => torrent.seeders != 0)
                            if (config.onlyTrusted) res = res.filter(torrent => torrent.status != 'member')

                            onDone(res)
                        })
                        .catch(function (error) {
                            // handle error
                            console.error('TPBAPI: Error while fetching, apibay down or bad proxy.', error);
                        })
                        .then(function () {
                            // always executed
                        });
                })
                break;

            case false:
                Axios.get(url, { responseType: 'json' })
                    .then(function (response) {
                        onDone(response.data)
                    })
                    .catch(function (error) {
                        // handle error
                        console.error('TPBAPI: Error while fetching torrents.', error);

                    })
                    .then(function () {
                        // always executed
                    });
                break;
        }

    }

    /**
 * Search torrents.
 *
 * Audio - 100 |
 * Music - 101 | Audio books - 102 | Sound clips - 103 | FLAC - 103 | Other - 199  ||
 * Video - 200 |
 * Movies - 101 | Movies DVDR - 102 | Music videos - 103 | Movie clips - 103 | TV Shows - 199 | Handheld - 222 | HD - Movies - 434 | HD - TV shows - 442 | 3D - 424 | Other - 299 ||
 * Applications - 300 |
 * Windows - 101 | Mac - 102 | UNIX - 103 | Handheld - 103 | IOS (iPad/iPhone) - 199 | Android - 525 | Other OS - 205 ||
 * Games - 400
 * PC - 401 | Mac - 402 | PSx - 403 | XBOX360 - 404 | Wii - 405 | Handheld - 406 | IOS(iPad/iPhone) - 407 | Android - 408 | Other - 499 ||
 * Other - 600
 * E-books - 601 | Comics - 602 | Pictures - 603 | Covers - 604 | Physibles - 605 | Other - 699 
 * 
 * @param {string} value Search value
 * @param {string} category ID
 * @param {function} onDone On torrent search done callback.
 */
    search = (value, category, onDone) => {
        let config = this._config

        if (!typeof value === "string") return console.error('Invalid value input')
        if (!typeof category === "number") return console.error('Invalid input')

        let url = `https://apibay.org/q.php?q=${value}&cat=${category}`

        switch (this._config.proxy.enabled) {
            case true:
                this.getProxy(() => {
                    Axios.get(url, {
                        responseType: 'json', proxy: {
                            protocol: 'http',
                            host: this._config.proxy.ip,
                            port: this._config.proxy.port
                        }
                    })
                        .then(function (response) {
                            let res = response.data

                            if (config.removeZeroSeedersTorrents) res = res.filter(torrent => torrent.seeders != 0)
                            if (config.onlyTrusted) res = res.filter(torrent => torrent.status != 'member' )

                            onDone(res)
                        })
                        .catch(function (error) {
                            // handle error
                            console.error('TPBAPI: Error while fetching, apibay down or bad proxy.', error);
                        })
                        .then(function () {
                            // always executed
                        });
                })
                break;

            case false:
                Axios.get(url, { responseType: 'json' })
                    .then(function (response) {
                        onDone(response.data)
                    })
                    .catch(function (error) {
                        // handle error
                        console.error('TPBAPI: Error while fetching torrents.', error);
                    })
                    .then(function () {
                        // always executed
                    });
                break;
        }

    }



}

module.exports = TPBAPI