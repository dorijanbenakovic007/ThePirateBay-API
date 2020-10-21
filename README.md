![alt text](tpb.jpg)

# ThePirateBay API
TPBAPI is torrent search engine for ThePirateBay.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install.

```bash
npm install tpbapi
```
## Usage


```javascript
const TPBAPI = require('tpbapi')

let tpbapi = new TPBAPI()
```

### Config
<b>CORS_bypass</b> if you get errors while fetching torrents
 <br />
<b>removeZeroSeedersTorrents</b> removes all torrents with 0 seeders <br />
<b>onlyTrusted</b> removes all torrents for which uploader is not verified <br />
<b>trackers</b> current trackers are taken from thepiratebay.org <br />

```javascript
tpbapi._config = {
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
```

### Functions
Search
```js
//Games - 400 / PC - 401, Video - 200 / Movies - 201 / TV Shows - 205, Audio - 100 / Music - 101, Applications - 300....

tpbapi.search('avengers', 200 , (torrents) => {
  console.log(torrents)
})
```

Get Top 100 torrents by category
```js
//Get top 100 PC Games
tpbapi.getTopTorrents( 401 , (torrents) => {
  console.log(torrents)
})
```

Generate magnet link
```js
//Example
tpbapi.getTopTorrents( 401 , (torrents) => {
  torrents.forEach(torrent => {
      torrent.magnetUrl = tpbapi.generateMagnetLink(torrent)
  })
})
const magnet = tpbapi.generateMagnetLink(torrent)
```

In case you have problems with CORS, enable CORS Bypass
```js
tpbapi.enableCORS_Bypass = true
```

Headless usage is not available at the moment.


# License
MIT © 2020 [drkeey](https://github.com/drkeey)