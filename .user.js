// ==UserScript==
// @name         AutoTrimps-kfro
// @version      1.0-kfro
// @namespace    https://KFrowde.github.io/AutoTrimps
// @updateURL    https://KFrowde.github.io/AutoTrimps/.user.js
// @description  Automate all the trimps!
// @author       zininzinin, spindrjr, Ishkaru, genBTC
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @connect      *KFrowde.github.io/AutoTrimps*
// @connect      *trimps.github.io*
// @connect      self
// @grant        none
// ==/UserScript==

var script = document.createElement('script');
script.id = 'AutoTrimps-KFrowde';
//This can be edited to point to your own Github Repository URL.
script.src = 'https://kfrowde.github.io/AutoTrimps/AutoTrimps2.js';
//script.setAttribute('crossorigin',"use-credentials");
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
