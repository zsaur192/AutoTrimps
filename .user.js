// ==UserScript==
// @name         AutoTrimps-ZekBeta
// @version      1.0-ZekBeta
// @namespace    https://Zsaur192.github.io/AutoTrimps
// @updateURL    https://Zsaur192.github.io/AutoTrimps/.user.js
// @description  Automate all the trimps!
// @author       zininzinin, spindrjr, Ishkaru, genBTC, Zeker0
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @connect      *Zsaur192.github.io/AutoTrimps*
// @connect      *trimps.github.io*
// @connect      self
// @grant        GM_xmlhttpRequest 
// ==/UserScript==

var script = document.createElement('script');
script.id = 'AutoTrimps-ZekBeta';
//This can be edited to point to your own Github Repository URL.
script.src = 'https://Zsaur192.github.io/AutoTrimps/AutoTrimps2.js';
//script.setAttribute('crossorigin',"use-credentials");
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
