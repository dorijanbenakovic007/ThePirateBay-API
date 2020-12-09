const { default: Axios } = require("axios");

class TPBAPI {
    constructor() {
        this._proxy = {
            enabled: false,
            ip: null,
            port: null,
            proxies: []
        }
        this._removeZeroSeedersTorrents = false
        this._onlyTrusted = false
        this._trackers = [
            'udp://tracker.coppersurfer.tk:6969/announce',
            'udp://9.rarbg.to:2920/announce',
            'udp://tracker.opentrackr.org:1337',
            'udp://tracker.internetwarriors.net:1337/announce',
            'udp://tracker.leechers-paradise.org:6969/announce',
            'udp://tracker.pirateparty.gr:6969/announce',
            'udp://tracker.cyberia.is:6969/announce'
        ]
    }

    get proxy() {
        return this._proxy
    }
    get removeZeroSeedersTorrents() {
        return this._removeZeroSeedersTorrents
    }
    get onlyTrusted() {
        return this._onlyTrusted
    }
    get trackers() {
        return this._trackers
    }

    set setProxy(proxyobj){
        this._proxy.ip = proxyobj.ip
        this._proxy.port = proxyobj.port
    }

    set enableProxy(bool){
        this._proxy.enabled = bool
    }

    /**
  * Fetch proxies and store in _config.proxy.proxies. First fetched proxy will automatically be mounted. proxy.ip and proxy.port must be null when manually calling this function.
  * 
  * @param {function} onDone Callback when done.
  * 
  */
    getProxy = (onDone) => {
        const _this = this
        Axios.get('https://proxy11.com/api/proxy.json?key=MjAxOA.X5fqyA.OgNIfkMgQ3G_B3mx5l7iMoLBaP8', { responseType: 'json' })
            .then(function (response) {
                let filteredProxies = response.data.data.filter(proxy => proxy.country_code !== 'de' && 'gb')
                _this.proxy.proxies = filteredProxies 
                onDone(filteredProxies)
            })
            .catch(function (error) {
                // handle error
                console.error('TPBAPI: Error while fetching proxy', error);

            })
            .then(function () {
                // always executed

            });
    }

    mountProxy = (proxyobj) => {
        this.setProxy = proxyobj
    }

    enableProxy = (bool) => {
        this.enableProxy = bool
    }

    /**
      * Generate magnet link for torrent object and returns it as a string
      * 
      * @param {Object} torrent Torrent object.
      * @returns {string} Magnet Link
      */
    generateMagnetLink = (torrent) => {
        if (!typeof torrent === "object") return console.error('Invalid input')

        const trackersQueryString = `&tr=${this.trackers.map(encodeURIComponent).join('&tr=')}`;

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

        let url = `https://apibay.org/precompiled/data_top100_${category}.json`

        switch (this.proxy.enabled) {
            case true:
                this.getProxy(() => {
                    Axios.get(url, {
                        responseType: 'json', proxy: {
                            protocol: 'http',
                            host: this.proxy.ip,
                            port: this.proxy.port
                        }
                    })
                        .then(function (response) {
                            let res = response.data

                            if (this.removeZeroSeedersTorrents) res = res.filter(torrent => torrent.seeders != 0)
                            if (this.onlyTrusted) res = res.filter(torrent => torrent.status != 'member')

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
        if (!typeof value === "string") return console.error('Invalid value input')
        if (!typeof category === "number") return console.error('Invalid input')

        console.log(this.proxy)
        let url = `https://apibay.org/q.php?q=${value}&cat=${category}`

        switch (this.proxy.enabled) {
            case true:
                this.getProxy(() => {
                    Axios.get(url, {
                        responseType: 'json', proxy: {
                            protocol: 'http',
                            host: this.proxy.ip,
                            port: this.proxy.port
                        }
                    })
                        .then(function (response) {
                            let res = response.data

                            if (this.removeZeroSeedersTorrents) res = res.filter(torrent => torrent.seeders != 0)
                            if (this.onlyTrusted) res = res.filter(torrent => torrent.status != 'member')

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