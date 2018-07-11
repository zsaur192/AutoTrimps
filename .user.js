// ==UserScript==
// @name         AutoTrimps-Zek-test
// @version      1.0-Zek
// @namespace    https://spikenskab.github.io/AutoTrimps
// @updateURL    https://spikenskab.github.io/AutoTrimps/.user.js
// @description  Automate all the trimps!
// @author       zininzinin, spindrjr, Ishkaru, genBTC, Zeker0
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @connect      *spikenskab.github.io/AutoTrimps*
// @connect      *trimps.github.io*
// @connect      self
// @grant        none
// ==/UserScript==

var script = document.createElement('script');
script.id = 'AutoTrimps-Zek-test';
//This can be edited to point to your own Github Repository URL.
script.src = 'https://spikenskab.github.io/AutoTrimps/AutoTrimps2.js';
//script.setAttribute('crossorigin',"use-credentials");
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
