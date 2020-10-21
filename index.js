const TPBAPI = require('./apibay');

module.exports = new TPBAPI();

let tpb = new TPBAPI()

tpb._config.onlyTrusted = true

// tpb.search('avengers',200, (torrents) => {
//     console.log(torrents)
// })
