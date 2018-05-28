// ==UserScript==
// @name         AutoTrimps-Zorn192
// @version      1.0-Zorn192
// @namespace    https://Zorn192.github.io/AutoTrimps
// @updateURL    https://Zorn192.github.io/AutoTrimps/.user.js
// @description  Automate all the trimps!
// @author       zininzinin, spindrjr, Ishkaru, genBTC, Zorn192
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @connect      *Zorn192.github.io/AutoTrimps*
// @connect      *trimps.github.io*
// @connect      self
// @grant        none
// ==/UserScript==

var script = document.createElement('script');
script.id = 'AutoTrimps-Zorn192';
//This can be edited to point to your own Github Repository URL.
script.src = 'https://Zorn192.github.io/AutoTrimps/AutoTrimps2.js';
//script.setAttribute('crossorigin',"use-credentials");
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
