// ==UserScript==
// @name         AutoTrimps-ZekBeta
// @version      1.0-ZekBeta
// @namespace    https://raw.githubusercontent.com/Zorn192/AutoTrimps/5.4
// @updateURL    raw.githubusercontent.com/Zorn192/AutoTrimps/5.4/.user.js
// @description  Automate all the trimps!
// @author       zininzinin, spindrjr, Ishkaru, genBTC, Zeker0
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @include      *trimps.github.io*
// @connect      *raw.githubusercontent.com/Zorn192/AutoTrimps/5.4*
// @connect      *trimpstest54.netlify.app*
// @connect      self
// @grant        GM_xmlhttpRequest 
// ==/UserScript==

var script = document.createElement('script');
script.id = 'AutoTrimps-ZekBeta';
//This can be edited to point to your own Github Repository URL.
script.src = 'https://raw.githubusercontent.com/Zorn192/AutoTrimps/5.4/AutoTrimps2.js';
//script.setAttribute('crossorigin',"use-credentials");
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
