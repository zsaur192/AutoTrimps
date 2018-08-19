// ==UserScript==
// @name         AT-Zek-GraphsOnly
// @namespace    https://github.com/Zorn192/AutoTrimps
// @version      2.6.1-Zek
// @updateURL    https://github.com/Zorn192/AutoTrimps/GraphsOnly.user.js
// @description  Graphs Module (only) from AutoTrimps
// @author       zininzinin, spindrjr, belaith, ishakaru, genBTC, Zek
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @grant        none
// ==/UserScript==
function safeSetItems(name,data) {
    try {
        localStorage.setItem(name, data);
    } catch(e) {
      if (e.code == 22) {
        // Storage full, maybe notify user or do some clean-up
        debug("Error: LocalStorage is full, or error. Attempt to delete some portals from your graph or restart browser.");
      }
    }
}
var script = document.createElement('script');
script.id = 'AutoTrimps-Graphs';
script.src = 'https://Zorn192.github.io/AutoTrimps/Graphs.js';
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
