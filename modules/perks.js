// ==UserScript==
// @name         AutoPerks
// @namespace    http://tampermonkey.net/
// @version      1.1.1-genBTC-3-29-2018
// @description  Trimps Automatic Perk Calculator
// @author       zxv, genBTC
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @grant        none
// ==/UserScript==

//Create blank AutoPerks object
MODULES["perks"] = {};
MODULES["perks"].useSpendHelium2 = false;   //choose new spend helium algo instead.
MODULES["perks"].detailedOutput = true;   //show which individual perks are spent;
MODULES["perks"].extraDetailedOutput = false;   //show which individual perks are spent;
MODULES["perks"].spendFixedPerks = true;   //Attempt to spend stuff on fixed perks. Possibly broken.
MODULES["perks"].doDumpPerkOnAlgo2 = false; //Dont bother doing the dump perk on SpendHelium2 since its broken anyway.
var AutoPerks = {};

function consolelog(message) {
    if (MODULES["perks"].extraDetailedOutput)
        console.log(message);
}
//temporary
/*
function genBTCdebugMode(){
    MODULES["perks"].useSpendHelium2 = true;   //choose new spend helium algo instead.
    MODULES["perks"].extraDetailedOutput = true;   //show which individual perks are spent;
    MODULES["perks"].spendFixedPerks = false;   //Attempt to spend stuff on fixed perks. Possibly broken.
}
if (document.getElementById('AutoTrimps-script').src.includes('localhost'))
   genBTCdebugMode();
*/
//Import the FastPriorityQueue.js general Library (not AT specific, but needed for perk queue)
var head = document.getElementsByTagName('head')[0];
var queuescript = document.createElement('script');
queuescript.type = 'text/javascript';
//This does NOT need to be changed to your own repo. Its a 3rd party file.
queuescript.src = 'https://genbtc.github.io/AutoTrimps/FastPriorityQueue.js';
head.appendChild(queuescript);

//--------------------------------------
//Ratio Presets - Perk proportions:
// (in perk order): [looting,toughness,power,motivation,pheromones,artisanistry,carpentry,resilience,coordinated,resourceful,overkill,cunning,curious];
var preset_ZXV = [20, 0.5, 1, 1.5, 0.5, 1.5, 8, 1, 25, 2, 3, 1, 1];
var preset_ZXVnew = [50, 0.75, 1, 3, 0.75, 3, 10, 1.5, 60, 2, 5, 1, 1];
var preset_ZXV3 = [100, 1, 3, 3, 1, 3, 40, 2, 100, 1, 3, 1, 1];
var preset_TruthEarly = [30, 4, 4, 4, 4, 2, 24, 8, 60, 2, 3, 1, 1];
var preset_TruthLate = [120, 4, 4, 4, 4, 2, 24, 8, 60, 2, 3, 1, 1];
var preset_nsheetz = [42, 1.75, 5, 4, 1.5, 5, 29, 3.5, 100, 1, 5, 1, 1];
var preset_nsheetzNew= [160, 1.5, 5, 2.5, 1.5, 3.5, 18, 3, 100, 1, 10, 1, 1];
var preset_HiderHehr = [90, 4, 12, 10, 1, 8, 8, 1, 20, 0.1, 3, 1, 1];
var preset_HiderBalance = [75, 4, 8, 4, 1, 4, 24, 1, 75, 0.5, 3, 1, 1];
var preset_HiderMore = [20, 4, 10, 12, 1, 8, 8, 1, 40, 0.1, 0.5, 1, 1];
var preset_genBTC = [100, 8, 8, 4, 4, 5, 18, 8, 14, 1, 1, 1, 1];
var preset_genBTC2 = [96, 19, 15.4, 8, 8, 7, 14, 19, 11, 1, 1, 1, 1];
var preset_Zek450 = [300, 1, 30, 2, 4, 2, 9, 8, 17, 0.1, 1, 320, 1];
var preset_Zek4502 = [350, 1, 40, 2, 3, 2, 5, 8, 2, 0.1, 1, 300, 20];    //Will update again in few days, this seems to be more optimal for more helium for now
var preset_Zek4503 = [450, 0.9, 48, 3.35, 1, 2.8, 7.8, 1.95, 4, 0.04, 1, 120, 175];    //Final change till perky(?) integration
//gather these into an array of objects. this is one important object.
var presetList = [preset_ZXV,preset_ZXVnew,preset_ZXV3,preset_TruthEarly,preset_TruthLate,preset_nsheetz,preset_nsheetzNew,preset_HiderHehr,preset_HiderBalance,preset_HiderMore,preset_genBTC,preset_genBTC2,preset_Zek450,preset_Zek4502,preset_Zek4503];
//Specific ratios labeled above must be given the matching ID below.
//Ratio preset dropdown list
var presetListHtml = "<option id='preset_ZXV'>ZXV</option>\
<option id='preset_ZXVnew'>ZXV (new)</option>\
<option id='preset_ZXV3'>ZXV 3</option>\
<option id='preset_TruthEarly'>Truth (early)</option>\
<option id='preset_TruthLate'>Truth (late)</option>\
<option id='preset_nsheetz'>nSheetz</option>\
<option id='preset_nsheetzNew'>nSheetz(new)</option>\
<option id='preset_HiderHehr'>Hider* (He/hr)</option>\
<option id='preset_HiderBalance'>Hider (Balance)</option>\
<option id='preset_HiderMore'>Hider* (More Zones)</option>\
<option id='preset_genBTC'>genBTC</option>\
<option id='preset_genBTC2'>genBTC2</option>\
<option id='preset_Zek450'>Zeker0#1 (z450+)</option>\
<option id='preset_Zek4502'>Zeker0#2 (z450+)</option>\
<option id='preset_Zek4503'>Zeker0#3 (z450+)</option>\
<option id='customPreset'>Custom</option></select>";
//Custom Creation for all perk customRatio boxes in Trimps Perk Window
AutoPerks.createInput = function(perkname,div) {
    var perk1input = document.createElement("Input");
    perk1input.id = perkname + 'Ratio';
    var oldstyle = 'text-align: center; width: 60px;';
    if(game.options.menu.darkTheme.enabled != 2) perk1input.setAttribute("style", oldstyle + " color: black;");
    else perk1input.setAttribute('style', oldstyle);
    perk1input.setAttribute('class', 'perkRatios');
    var perk1label = document.createElement("Label");
    perk1label.id = perkname + 'Label';
    perk1label.innerHTML = perkname;
    perk1label.setAttribute('style', 'margin-right: 1vw; width: 120px; color: white;');
    //add to the div.
    div.appendChild(perk1input);
    div.appendChild(perk1label);
}
//--------------------------------------
//BEGIN AUTOPERKS GUI CODE:>>>>>>>>>>>>>>
//--------------------------------------
AutoPerks.GUI = {};
AutoPerks.removeGUI = function() {
    Object.keys(AutoPerks.GUI).forEach(function(key) {
      var $elem = AutoPerks.GUI[key];
      $elem.parentNode.removeChild($elem);
      delete AutoPerks.GUI[key];
    });
}
AutoPerks.displayGUI = function() {
    let apGUI = AutoPerks.GUI;
    //Create Allocator button and add it to Trimps Perk Window
    var $buttonbar = document.getElementById("portalBtnContainer");
    apGUI.$allocatorBtn1 = document.createElement("DIV");
    apGUI.$allocatorBtn1.id = 'allocatorBtn1';
    apGUI.$allocatorBtn1.setAttribute('class', 'btn inPortalBtn settingsBtn settingBtntrue');
    apGUI.$allocatorBtn1.setAttribute('onclick', 'AutoPerks.clickAllocate()');
    apGUI.$allocatorBtn1.textContent = 'Allocate Perks';
    $buttonbar.appendChild(apGUI.$allocatorBtn1);
    $buttonbar.setAttribute('style', 'margin-bottom: 0.8vw;');
    apGUI.$customRatios = document.createElement("DIV");
    apGUI.$customRatios.id = 'customRatios';
    //Line 1 of the UI
    apGUI.$ratiosLine1 = document.createElement("DIV");
    apGUI.$ratiosLine1.setAttribute('style', 'display: inline-block; text-align: left; width: 100%');
    var listratiosLine1 = ["Overkill","Resourceful","Coordinated","Resilience","Carpentry"];
    for (var i in listratiosLine1)
        AutoPerks.createInput(listratiosLine1[i],apGUI.$ratiosLine1);
    apGUI.$customRatios.appendChild(apGUI.$ratiosLine1);
    //Line 2 of the UI
    apGUI.$ratiosLine2 = document.createElement("DIV");
    apGUI.$ratiosLine2.setAttribute('style', 'display: inline-block; text-align: left; width: 100%');
    var listratiosLine2 = ["Artisanistry","Pheromones","Motivation","Power","Looting"];
    for (var i in listratiosLine2)
        AutoPerks.createInput(listratiosLine2[i],apGUI.$ratiosLine2);
    //Line 3 of the UI
    apGUI.$ratiosLine3 = document.createElement("DIV");
    apGUI.$ratiosLine3.setAttribute('style', 'display: inline-block; text-align: left; width: 100%');
    var listratiosLine3 = ["Cunning","Curious"];
    for (var i in listratiosLine3)
        AutoPerks.createInput(listratiosLine3[i],apGUI.$ratiosLine3);
    //Create dump perk dropdown
    apGUI.$dumpperklabel = document.createElement("Label");
    apGUI.$dumpperklabel.id = 'DumpPerk Label';
    apGUI.$dumpperklabel.innerHTML = "Dump Perk:";
    apGUI.$dumpperklabel.setAttribute('style', 'margin-right: 1vw; color: white;');
    apGUI.$dumpperk = document.createElement("select");
    apGUI.$dumpperk.id = 'dumpPerk';
    apGUI.$dumpperk.setAttribute('onchange', 'AutoPerks.saveDumpPerk()');
    var oldstyle = 'text-align: center; width: 120px;';
    if(game.options.menu.darkTheme.enabled != 2) apGUI.$dumpperk.setAttribute("style", oldstyle + " color: black;");
    else apGUI.$dumpperk.setAttribute('style', oldstyle);
    //Add the dump perk dropdown to UI Line 2
    apGUI.$ratiosLine2.appendChild(apGUI.$dumpperklabel);
    apGUI.$ratiosLine2.appendChild(apGUI.$dumpperk);
    //Create ratioPreset dropdown
    apGUI.$ratioPresetLabel = document.createElement("Label");
    apGUI.$ratioPresetLabel.id = 'Ratio Preset Label';
    apGUI.$ratioPresetLabel.innerHTML = "Ratio Preset:";
    apGUI.$ratioPresetLabel.setAttribute('style', 'margin-right: 1vw; color: white;');
    apGUI.$ratioPreset = document.createElement("select");
    apGUI.$ratioPreset.id = 'ratioPreset';
    oldstyle = 'text-align: center; width: 110px;';
    if(game.options.menu.darkTheme.enabled != 2) apGUI.$ratioPreset.setAttribute("style", oldstyle + " color: black;");
    else apGUI.$ratioPreset.setAttribute('style', oldstyle);
    //Populate ratio preset dropdown list from HTML above:
    apGUI.$ratioPreset.innerHTML = presetListHtml;
    //load the last ratio used
    var loadLastPreset = localStorage.getItem('AutoperkSelectedRatioPresetID');
    apGUI.$ratioPreset.selectedIndex = (loadLastPreset != null) ? loadLastPreset : 0; // First element is zxv (default) ratio.
    apGUI.$ratioPreset.setAttribute('onchange', 'AutoPerks.setDefaultRatios()');
    //Add the presets dropdown to UI Line 1
    apGUI.$ratiosLine1.appendChild(apGUI.$ratioPresetLabel);
    apGUI.$ratiosLine1.appendChild(apGUI.$ratioPreset);
    apGUI.$customRatios.appendChild(apGUI.$ratiosLine2);
    apGUI.$customRatios.appendChild(apGUI.$ratiosLine3);
    //Add it all to the perk/portal screen
    var $portalWrapper = document.getElementById("portalWrapper")
    $portalWrapper.appendChild(apGUI.$customRatios);
    ////////////////////////////////////////
    //Main LOGIC Loop///////////////////////
    ////////////////////////////////////////
    AutoPerks.initializePerks();// Init all the new vars
    AutoPerks.setDefaultRatios();//set ratios and import them.    
    AutoPerks.populateDumpPerkList();    
}

//populate dump perk dropdown list
AutoPerks.populateDumpPerkList = function() {
    var $dumpDropdown = document.getElementById('dumpPerk');
    if ($dumpDropdown == null) return;
    var html = "";
    var dumpperks = AutoPerks.getVariablePerks();
    for(var i in dumpperks)
        html += "<option id='"+dumpperks[i].name+"Dump'>"+AutoPerks.capitaliseFirstLetter(dumpperks[i].name)+"</option>"
    html += "<option id='none'>None</option></select>";
    $dumpDropdown.innerHTML = html;
    //load the last dump preset used
    var loadLastDump = localStorage.getItem('AutoperkSelectedDumpPresetID');
    if (loadLastDump != null)
        $dumpDropdown.selectedIndex = loadLastDump;
    else
        $dumpDropdown.selectedIndex = $dumpDropdown.length - 2; // Second to last element is looting_II (or other)
}
//END AUTOPERKS GUI CODE:>>>>>>>>>>>>>>

AutoPerks.saveDumpPerk = function() {
    var dumpIndex = document.getElementById("dumpPerk").selectedIndex;
    safeSetItems('AutoperkSelectedDumpPresetID', dumpIndex);
}

AutoPerks.saveCustomRatios = function() {
    var perkRatioBoxes = document.getElementsByClassName('perkRatios');
    var customRatios = [];
    for(var i = 0; i < perkRatioBoxes.length; i++) {
        customRatios.push({'id':perkRatioBoxes[i].id,'value':parseFloat(perkRatioBoxes[i].value)});
    }
    safeSetItems('AutoPerksCustomRatios', JSON.stringify(customRatios) );
}

//sets the ratioboxes with the default ratios embedded in the script when perks are instanciated.
// (and everytime the ratio-preset dropdown-selector is changed)
//loads custom ratio selections from localstorage if applicable
AutoPerks.setDefaultRatios = function() {
    var perkRatioBoxes = document.getElementsByClassName("perkRatios");
    var ratioSet = document.getElementById("ratioPreset").selectedIndex;
    var currentPerk;
    for(var i = 0; i < perkRatioBoxes.length; i++) {
        currentPerk = AutoPerks.getPerkByName(perkRatioBoxes[i].id.substring(0, perkRatioBoxes[i].id.length - 5)); // Remove "ratio" from the id to obtain the perk name
        perkRatioBoxes[i].value = currentPerk.value[ratioSet];
    }
    //grab custom ratios if saved.
    if (ratioSet == document.getElementById("ratioPreset").length-1) {
        var tmp = JSON.parse(localStorage.getItem('AutoPerksCustomRatios'));
        if (tmp !== null)
            customRatios = tmp;
        else {
            // If "custom" is manually selected, and no file was found, start by setting all perkRatioBoxes to 0.
            for(var i = 0; i < perkRatioBoxes.length; i++) {
                perkRatioBoxes[i].value = 0;     //initialize to 0.
            }
            return; //then exit.
        }
        //if we have ratios in the storage file, load them
        for(var i = 0; i < perkRatioBoxes.length; i++) {
            //do a quick sanity check (order)
            if (customRatios[i].id != perkRatioBoxes[i].id) continue;
            currentPerk = AutoPerks.getPerkByName(perkRatioBoxes[i].id.substring(0, perkRatioBoxes[i].id.length - 5)); // Remove "ratio" from the id to obtain the perk name
            perkRatioBoxes[i].value = customRatios[i].value;
        }
    }
    //save the last ratio used
    safeSetItems('AutoperkSelectedRatioPresetID', ratioSet);
}

//updates the internal perk variables with values grabbed from the custom ratio input boxes that the user may have changed.
AutoPerks.setNewRatios = function() {
    var perkRatioBoxes = document.getElementsByClassName('perkRatios');
    var currentPerk;
    for(var i = 0; i < perkRatioBoxes.length; i++) {
        currentPerk = AutoPerks.getPerkByName(perkRatioBoxes[i].id.substring(0, perkRatioBoxes[i].id.length - 5)); // Remove "ratio" from the id to obtain the perk name
        currentPerk.updatedValue = parseFloat(perkRatioBoxes[i].value);
    }
    AutoPerks.getPerkByName("toughness").updatedValue = AutoPerks.getPerkByName("resilience").updatedValue / 2;
    // Manually update tier II perks
    var tierIIPerks = AutoPerks.getTierIIPerks();
    for(var i in tierIIPerks)
        tierIIPerks[i].updatedValue = tierIIPerks[i].parent.updatedValue / tierIIPerks[i].relativeIncrease;
}
//Calculate Price
AutoPerks.calculatePrice = function(perk, level) { // Calculate price of buying *next* level
    if(perk.fluffy) return Math.ceil(perk.base * Math.pow(10,level));
    if(perk.type == 'exponential') return Math.ceil(level/2 + perk.base * Math.pow(1.3, level));
    else if(perk.type == 'linear') return Math.ceil(perk.base + perk.increase * level);
}
//Calculate Total Price
AutoPerks.calculateTotalPrice = function(perk, finalLevel) {
    if(perk.type == 'linear' && !perk.fluffy)
        return AutoPerks.calculateTIIprice(perk, finalLevel);
    var totalPrice = 0;
    for(var i = 0; i < finalLevel; i++) {
        totalPrice += AutoPerks.calculatePrice(perk, i);
    }
    return totalPrice;
}
//Calculate Tier 2 Total Price (Shortcut)
AutoPerks.calculateTIIprice = function(perk, finalLevel) {
    //based on Trimps getAdditivePrice() @ main.js line 2056
    return Math.ceil((((finalLevel - 1) * finalLevel) / 2 * perk.increase) + (perk.base * finalLevel));
}
//Calculate the increase in stat.
AutoPerks.calculateIncrease = function(perk, level) {
    var increase = 0;
    var value; // Allows for custom perk ratios.

    if(perk.updatedValue != -1) value = perk.updatedValue;
    else value = perk.value;

    if(perk.compounding) increase = perk.baseIncrease;
    else increase = (1 + (level + 1) * perk.baseIncrease) / ( 1 + level * perk.baseIncrease) - 1;
    return increase / perk.baseIncrease * value;
}

//BEGIN AUTOPERKS SCRIPT CODE:>>>>>>>>>>>>>>
//--------------------------------------
//Main function (green "Allocate Perks" button):
AutoPerks.clickAllocate = function() {
    AutoPerks.initializePerks();// Init all the new vars
    AutoPerks.setperksByName();
    //var perks = AutoPerks.getOwnedPerks();
    //grab new ratios if any
    AutoPerks.setNewRatios();
    //save custom ratios if "custom" is selected
    if (document.getElementById("ratioPreset").selectedIndex == document.getElementById("ratioPreset").length-1)
        AutoPerks.saveCustomRatios();

    //Helium
    var preSpentHe = 0;
    var helium = AutoPerks.getHelium();

    // Get Fixed perks and calc price in advance.
    if (MODULES["perks"].spendFixedPerks) {
        var fixedPerks = AutoPerks.getFixedPerks();
        for (var i = 0; i < fixedPerks.length; i++) {
            fixedPerks[i].level = game.portal[AutoPerks.capitaliseFirstLetter(fixedPerks[i].name)].level;
            var price = AutoPerks.calculateTotalPrice(fixedPerks[i], fixedPerks[i].level);
            fixedPerks[i].spent += price;
            preSpentHe += price;
        }
        if (preSpentHe)
            debug("AutoPerks: Your existing fixed-perks reserve Helium: " + prettify(preSpentHe), "perks");
    }
    
    var remainingHelium = helium - preSpentHe;
   //Check for NaN - if one of these is NaN, bugs.
    if (Number.isNaN(remainingHelium))
        debug("There was a major error reading your Helium amount. " + remainingHelium, "perks");
    
    // determine how to spend helium = Algorithm 2 or 1. maintain existing functions in the meantime.
    var ownedperks = AutoPerks.getOwnedPerks();
    var varperks = AutoPerks.getVariablePerks();
    if (MODULES["perks"].useSpendHelium2){         
        AutoPerks.spendHelium2(preSpentHe, ownedperks);
    }
    else {        
        AutoPerks.spendHelium(remainingHelium, ownedperks);
    }

    //re-arrange perk points
    AutoPerks.applyCalculationsRespec(remainingHelium, ownedperks);
    debug("Finishing AutoPerks Auto-Allocate.","perks");
}

//NEW way: Get accurate count of helium (calcs it like the game does)
AutoPerks.getHelium = function(wantRespec) {
    //determines if we are in the portal screen or the perk screen.
    var whichscreen = game.global.viewingUpgrades;
    var respecMax = (whichscreen) ? game.global.heliumLeftover : game.global.heliumLeftover + game.resources.helium.owned;
    /*
    var can = game.global.canRespecPerks;
    var act = game.global.respecActive;
    var respec = (can && act) || wantRespec;
    if (!respec)
        return respecMax;
    */
    //iterates all the perks and gathers up their heliumSpent counts.
    for (var item in game.portal){
        if (game.portal[item].locked) continue;
        var portUpgrade = game.portal[item];
        if (typeof portUpgrade.level === 'undefined') continue;
        respecMax += portUpgrade.heliumSpent;
    }
    return respecMax;
}

AutoPerks.spendHelium = function(helium,perks) {
    debug("Beginning AutoPerks1 calculate how to spend " + helium + " Helium... This could take a while...","perks");
    if(helium < 0) {
        debug("AutoPerks: Major Error - Not enough helium to buy fixed perks.","perks");
        //document.getElementById("nextCoordinated").innerHTML = "Not enough helium to buy fixed perks.";
        return;
    }
    if (Number.isNaN(helium)) {
        debug("AutoPerks: Major Error - Helium is Not a Number!","perks");
        return;
    }

    var effQueue = new FastPriorityQueue(function(a,b) { return a.efficiency > b.efficiency } ) // Queue that keeps most efficient purchase at the top
    // Calculate base efficiency of all perks

    var mostEff;
    var price; // Price of *next* purchase.
    var inc;    
    for(var i in perks) {
        price = AutoPerks.calculatePrice(perks[i], 0);
        inc = AutoPerks.calculateIncrease(perks[i], 0);
        perks[i].efficiency = inc/price;
        if(perks[i].efficiency <= 0) {
            debug("Perk ratios must be positive values.","perks");
            return;
        }
        effQueue.add(perks[i]);
    }

    var i=0;
    for(mostEff = effQueue.poll(),
        price = AutoPerks.calculatePrice(mostEff, mostEff.level)
            ; (price < helium) ;
                mostEff = effQueue.poll(), price = AutoPerks.calculatePrice(mostEff, mostEff.level),i++ ) {
        // but first, check if the perk has reached its maximum value
        if (mostEff.level >= mostEff.max) continue;
        // Purchase the most efficient perk
        helium -= price;
        mostEff.level++;
        mostEff.spent += price;
        // Reduce its efficiency
        inc = AutoPerks.calculateIncrease(mostEff, mostEff.level);
        price = AutoPerks.calculatePrice(mostEff, mostEff.level);
        mostEff.efficiency = inc/price;
        // Add back into queue run again until out of helium
        effQueue.add(mostEff);
    }
    debug("AutoPerks: Pass one complete. Loops ran: " + i,"perks");

    //Begin selectable dump perk code
    var $selector = document.getElementById('dumpPerk');
    if ($selector != null && $selector.value != "None") {
        var heb4dump = helium;
        var index = $selector.selectedIndex;
        var dumpPerk = AutoPerks.getPerkByName($selector[index].innerHTML);
        debug(AutoPerks.capitaliseFirstLetter(dumpPerk.name) + " level pre-dump: " + dumpPerk.level,"perks");
        if(dumpPerk.level < dumpPerk.max) {
            for(price = AutoPerks.calculatePrice(dumpPerk, dumpPerk.level); price < helium; price = AutoPerks.calculatePrice(dumpPerk, dumpPerk.level)) {
                helium -= price;
                dumpPerk.spent += price;
                dumpPerk.level++;
            }
        }
        var dumpresults = heb4dump - helium;
        debug(AutoPerks.capitaliseFirstLetter(dumpPerk.name) + " level post-dump: "+ dumpPerk.level + " Helium DUMPED: " + prettify(dumpresults), "perks");        
    } //end dump perk code.
    
    var heB4round2 = helium;
    //Repeat the process for spending round 2. This spends any extra helium we have that is less than the cost of the last point of the dump-perk.
    while (effQueue.size > 1) {
        mostEff = effQueue.poll();
        if (mostEff.level >= mostEff.max) continue;
        price = AutoPerks.calculatePrice(mostEff, mostEff.level);
        // Add back into queue run again until out of helium
        // but first, check if the perk has reached its maximum value
        if (price >= helium) continue;        
        // Purchase the most efficient perk
        helium -= price;
        mostEff.level++;
        mostEff.spent += price;
        // Reduce its efficiency
        inc = AutoPerks.calculateIncrease(mostEff, mostEff.level);
        price = AutoPerks.calculatePrice(mostEff, mostEff.level);
        mostEff.efficiency = inc/price;
        effQueue.add(mostEff);
    }
    var r2results = heB4round2 - helium;
    debug("AutoPerks: Pass two complete. Round 2 cleanup spend of : " + prettify(r2results),"perks");
}

AutoPerks.spendHelium2 = function(preSpentHE,perks) {
    var helium = AutoPerks.getHelium();
    helium -= preSpentHE;
    debug("Beginning AutoPerks2 calculate how to spend " + prettify(helium) + " Helium... This could take a while...","perks");
    if(helium < 0) {
        debug("AutoPerks: Major Error - Not enough helium to buy fixed perks.","perks");
        //document.getElementById("nextCoordinated").innerHTML = "Not enough helium to buy fixed perks.";
        return;
    }
    if (Number.isNaN(helium)) {
        debug("AutoPerks: Major Error - Helium is Not a Number!","perks");
        return;
    }
    
    // Queue that keeps most efficient purchase at the top
    var effQueue = new FastPriorityQueue(function(a,b) { return a.efficiency > b.efficiency } ) 
    var mostEff;
    var price;
    var inc;
    // Calculate base efficiency of all perks
    for(var i in perks) {
        mostEff = perks[i];
        price = AutoPerks.calculatePrice(mostEff, 0);
        inc = AutoPerks.calculateIncrease(mostEff, 0);
        mostEff.efficiency = inc/price;
        if(mostEff.efficiency <= 0) {
            debug("Perk ratios must be positive values.","perks");
            return;
        }
        //initialize the noMorePack on the T2's
        mostEff.noMorePack=!(mostEff.name.endsWith("_II"));
        effQueue.add(mostEff);
    }
    var price=0;
    var level=0;
    var count=0;
    var usePackAlgo=true;
    var spent=0;
    var canAffordOne=true,canAffordPack=false,canAffordNextPack=false;
    var tier2perk=false;
    var packmod=0;
    var oldSize=0;
    var he_left = AutoPerks.getHelium();
    var iterateQueue = function(){        
        oldSize = effQueue.size;
        mostEff = effQueue.poll();
        if (oldSize == effQueue.size) {
            consolelog("Queue size was 1, aborted iterateQueue");
            return true;
        }        
        spent = 0;
        //Tier 2's need a pack algorithm
        tier2perk = mostEff.name.endsWith("_II");
        usePackAlgo=tier2perk;
        if (usePackAlgo) {
            mostEff.pack = Math.pow(10, Math.max(0, Math.floor(Math.log(he_left) / Math.log(100) - 4.2)));
            mostEff.packExponent = Math.log10(mostEff.pack);
            packmod = mostEff.pack * mostEff.packMulti;
            level = mostEff.level + packmod;
            mostEff.packPrice = AutoPerks.calculateTotalPrice(mostEff, level) - mostEff.spent;
            inc = AutoPerks.calculateIncrease(mostEff, level);
            price = AutoPerks.calculatePrice(mostEff, level);
            mostEff.efficiency = inc/price;
            mostEff.price = price;
            mostEff.nextPackPrice = AutoPerks.calculateTotalPrice(mostEff, mostEff.level + (packmod * 10)) - mostEff.spent;
            canAffordOne = (price < he_left);
            canAffordPack = (mostEff.packPrice < he_left);//&& effQueue.peek().efficiency < inc/price;
            canAffordNextPack = (mostEff.nextPackPrice < he_left);
            consolelog(mostEff.name + "___>Using Settings Pack: " + mostEff.pack + " x" + mostEff.packMulti + " ^" + mostEff.packExponent + " $" + mostEff.packPrice);
            return false;
        } else {
            level = mostEff.level;
            canAffordPack=false;
            canAffordNextPack=false;
        }
        //Common to both.
        price = AutoPerks.calculatePrice(mostEff, level);
        inc = AutoPerks.calculateIncrease(mostEff, level);
        mostEff.price = price;
        mostEff.efficiency = inc/price;
        canAffordOne = price < he_left;
        return false;
    };
    var packMultiMod2 = function(mostEff,multiply,divide) {
        if (!tier2perk)
            return 1;
        var goingUp = mostEff.lastOp ==1;
        var goingDown = mostEff.lastOp ==-1;
        //store the highest exponent.
        var curpackExponent = Math.log10(mostEff.pack);
        mostEff.packExponent = Math.max(curpackExponent,mostEff.packExponent);
        if (tier2perk && canAffordOne && canAffordPack || multiply ) {
            if (!mostEff.perkHitBottom && canAffordNextPack) {
                mostEff.packMulti*= 10;
                mostEff.lastOp = 1;
            } else if (!canAffordNextPack) {
                if (mostEff.packMulti == 1 && curpackExponent==0) {
                    mostEff.lastOp = 0;
                    mostEff.noMorePack=true;
                } else if (mostEff.packMulti > 1 ) {
                    mostEff.packMulti/= 10;
                    mostEff.lastOp = -1;
                }
            }
            consolelog(mostEff.name + ">>>Multiply x" + mostEff.packMulti + " " + mostEff.level + (tier2perk? " -  pack: " + mostEff.pack + " ^" + mostEff.packExponent + " $" + mostEff.packPrice : ""));   
        } else if (tier2perk && canAffordOne && !canAffordPack || divide) {
            if (mostEff.packExponent >= 1) {
                mostEff.packMulti/= 10;
                mostEff.lastOp = -1;
            }
            if (mostEff.packMulti < 1) {
                mostEff.perkHitBottom = true;
                consolelog(mostEff.name + ">>>YesPack - PerkHitBottom Once.");
                mostEff.packMulti = 0;
            }
            consolelog(mostEff.name + ">>>DivideBy x" + mostEff.packMulti + " " + mostEff.level + (tier2perk? " -  pack: " + mostEff.pack + " ^" + mostEff.packExponent + " $" + mostEff.packPrice : ""));
        } else if (!canAffordOne) {
            consolelog(mostEff.name + "<<<PackMulti Staying Neutral- done?..." + mostEff.level + " " + price);
            mostEff.packMulti=0;
            mostEff.lastOp = 0;
        } else {
//            mostEff.perkHitBottom = true;
//            mostEff.packMulti = 0;
            consolelog(mostEff.name + "<<<PackMulti - Something unknown happened..." + mostEff.level + " " + price);
        }
        return mostEff.packMulti;
    };
    var i=0;
    var quitOut=false;
    for(quitOut=iterateQueue() ; !quitOut,i < 20000 ; quitOut=iterateQueue(),i++ ) {
        if (quitOut)
            break;
        if (!canAffordOne) {
            consolelog(mostEff.name + "<<<DONE. Couldnt afford next perk, give up @ " + mostEff.level + (tier2perk? " -  pack: " + mostEff.pack + " x" + mostEff.packMulti + " ^" + mostEff.packExponent + " $" + mostEff.packPrice : ""));
            if (tier2perk && mostEff.packMulti && mostEff.packExponent) {
                mostEff.packMulti = packMultiMod2(mostEff,false,true);
                if(mostEff.level < mostEff.max)
                    effQueue.add(mostEff);
            }
            //final exit point ^.
            continue;
        }
        // Purchase the most efficient perk
        // //Iterate Arithemetic perks in bulks of 10x but 1x now.
        if (usePackAlgo) {
            if (!mostEff.noMorePack && canAffordPack) {
                // Purchase perk Pack in Bulk
                spent = mostEff.packPrice;
                if (spent) {
                    he_left -= spent;
                    mostEff.spent += spent; // Price of PACK bulk purchase
                    mostEff.level = level;
                    if (canAffordNextPack)
                        mostEff.packMulti = packMultiMod2(mostEff,true,false);
                    else
                        mostEff.packMulti = packMultiMod2(mostEff,false,true);
                    price = AutoPerks.calculatePrice(mostEff, mostEff.level);
                    inc = AutoPerks.calculateIncrease(mostEff, mostEff.level);                    
                    mostEff.efficiency = inc/price;
                    consolelog(mostEff.name + "___>Spending BULK perk pack: " + mostEff.level + " " + mostEff.spent);
                    if(mostEff.level < mostEff.max) // but first, check if the perk has reached its maximum {
                        effQueue.add(mostEff);
                }
            }
                //if (curpackExponent > mostEff.packExponent)
            else if (canAffordOne) {
                if(mostEff.packMulti == 0) {
                    consolelog(mostEff.name + "<<<MULTIPLY multiplier was 0 so Exit: " + mostEff.packMulti);
                    continue;
                }
                else if(mostEff.packMulti >= 10 && mostEff.packExponent > 0) {
                    //Reached the top of multiply, start dividing.
                    consolelog(mostEff.name + ">>>Reached the TOP OF MULTIPLY, cant afford anymore, START /////// Dividing \\\\\\ @ multi: " + mostEff.packMulti);
                    mostEff.packMulti = packMultiMod2(mostEff,false,true);
                    if(mostEff.level < mostEff.max)
                        effQueue.add(mostEff);
                }
            } else {
                consolelog(mostEff.name + "<<<MULTIPLY special case-Cant Afford Anything & Exit: " + mostEff.packMulti);
                //mostEff.packMulti = packMultiMod2(mostEff);
            }
        } else if (!tier2perk || !usePackAlgo || canAffordOne) {  //dont use Pack Algo. Buy 1 by 1.
            he_left -= price;
            mostEff.level += 1;
            mostEff.spent += price;
            price = AutoPerks.calculatePrice(mostEff, level);
            inc = AutoPerks.calculateIncrease(mostEff, level);
            mostEff.efficiency = inc/price;
            if(mostEff.level < mostEff.max)
                effQueue.add(mostEff);
            consolelog(">>>Spending INDIVIDUAL perk: " + mostEff.name + " " + mostEff.level + " " + mostEff.spent);
        } else {
            consolelog(mostEff.name + "<<<END Case at bottom Unknown but do KICK Out of Loop XXXXXX");
            //mostEff.noMorePack=true;
            //continue;
        }
        
    }
    debug("AutoPerks: Pass one complete. Loops ran: " + i,"perks");
    var heB4round2 = he_left;

    //Repeat the process for spending round 2. This spends any extra helium we have that is less than the cost of the last point of the dump-perk.
    while (effQueue.size > 1) {
        mostEff = effQueue.poll();
        if (mostEff.level >= mostEff.max) continue; // but first, check if the perk has reached its maximum value
        price = AutoPerks.calculatePrice(mostEff, mostEff.level);
        if (price >= he_left) continue;
        // Purchase the most efficient perk
        he_left -= price;
        mostEff.level++;
        mostEff.spent += price;
        // Reduce its efficiency
        inc = AutoPerks.calculateIncrease(mostEff, mostEff.level);
        price = AutoPerks.calculatePrice(mostEff, mostEff.level);
        mostEff.efficiency = inc/price;
        // Add back into queue run again until out of helium
        effQueue.add(mostEff);
    }
    var r2results = heB4round2 - he_left;
    debug("AutoPerks: Pass two complete. Round 2 cleanup spend of : " + prettify(r2results),"perks");
    
    //Begin selectable dump perk code
    if (MODULES["perks"].doDumpPerkOnAlgo2) {
        var heb4dump = he_left;
        var selector = document.getElementById('dumpPerk');
        var index = selector.selectedIndex;
        if(selector.value != "None") {
            var dumpPerk = AutoPerks.getPerkByName(selector[index].innerHTML);
            var preDump = dumpPerk.level;
            debug(AutoPerks.capitaliseFirstLetter(dumpPerk.name) + " level pre-dump: " +preDump ,"perks");
            for(price = AutoPerks.calculatePrice(dumpPerk, dumpPerk.level); (price < he_left && dumpPerk.level < dumpPerk.max); price = AutoPerks.calculatePrice(dumpPerk, dumpPerk.level)) {
                he_left -= price;
                dumpPerk.spent += price;
                dumpPerk.level++;
            }
            var dumpresults = heb4dump - he_left;
            debug(AutoPerks.capitaliseFirstLetter(dumpPerk.name) + " level post-dump: "+ dumpPerk.level + " Helium DUMPED: " + prettify(dumpresults), "perks");
        } //end dump perk code.
    }    
    debug("AutoPerks CalcEnd. ", "perks");
}

//Pushes the respec button, then the Clear All button, then assigns perk points based on what was calculated.
AutoPerks.applyCalculationsRespec = function (remainingHelium,perks) {
    var preBuyAmt = game.global.buyAmt;
    if (game.global.canRespecPerks) {
        respecPerks();
    }
    if (MODULES["perks"].detailedOutput) {
        var exportPerks = {};
        for (var item in game.portal){
            el = game.portal[item];
            //For smaller strings and backwards compatibility, perks not added to the object will be treated as if the perk is supposed to be level 0.
            if (el.locked || el.level <= 0) continue;
            //Add the perk to the object with the desired level
            exportPerks[item] = el.level + el.levelTemp;
        }
        console.log(exportPerks);
    }    
    if (game.global.respecActive) {
        clearPerks();
        for(var i in perks) {
            var capitalized = AutoPerks.capitaliseFirstLetter(perks[i].name);
            game.global.buyAmt = perks[i].level;
            if (getPortalUpgradePrice(capitalized) <= remainingHelium) {
                if (MODULES["perks"].detailedOutput)
                    debug("AutoPerks-Buying: " + perks[i].name + " " + perks[i].level, "perks");
                buyPortalUpgrade(capitalized);
            } else
                if (MODULES["perks"].detailedOutput)
                    debug("AutoPerks Error-Couldn't Afford Asked Perk: " + perks[i].name + " " + perks[i].level, "perks");
        }
    }
    game.global.buyAmt = preBuyAmt;
    numTab(1, true); //selects the 1st number of the buy-amount tab-bar (Always 1)
    cancelTooltip(); //displays the last perk we bought's tooltip without this. idk why.
}

AutoPerks.capitaliseFirstLetter = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
AutoPerks.lowercaseFirst = function(str) {
    return str.substr(0, 1).toLowerCase() + str.substr(1);
}
AutoPerks.getPercent = function(spentHelium, totalHelium) {
    var frac = spentHelium / totalHelium;
    frac = (frac* 100).toPrecision(2);
    return frac + "%";
}

AutoPerks.FixedPerk = function(name, base, level, max, fluffy) {
    this.id = -1;
    this.name = name;
    this.base = base;
    this.type = "exponential";
    this.fixed = true;
    this.level = level || 0;
    this.spent = 0;
    this.max = max || Number.MAX_VALUE;
    if (fluffy == "fluffy") {
    //This affects cost calculation on "Capable" fixed perk (during line 273)
       this.fluffy = true;
       this.type = "linear";
       this.increase = 10;
   }
   this.recalc = function(targetLevel) {};
}

AutoPerks.VariablePerk = function(name, base, compounding, value, baseIncrease, max, level) {
    this.id = -1;
    this.name = name;
    this.base = base;
    this.type  = "exponential";
    this.exprate = 1.3; //cost is almost always the default 1.3x
    this.fixed = false;
    this.compounding = compounding;
    this.updatedValue = -1; // If a custom ratio is supplied, this will be modified to hold the new value.
    this.baseIncrease = baseIncrease; // The raw stat increase that the perk gives.
    this.efficiency = -1; // Efficiency is defined as % increase * value / He cost
    this.max = max || Number.MAX_VALUE;
    this.level = level || 0; // How many levels have been invested into a perk
    this.spent = 0; // Total helium spent on each perk.
    function getRatiosFromPresets() {
        var valueArray = [];
        for (var i=0; i<presetList.length; i++) {
            valueArray.push(presetList[i][value]);
        }
        return valueArray;
    }
    this.value = getRatiosFromPresets();
    this.recalc = function(targetLevel) {};
}

AutoPerks.ArithmeticPerk = function(name, base, increase, baseIncrease, parent, max, level) { // Calculate a way to obtain parent automatically.
    this.id = -1;
    this.name = name;
    this.base = base;
    this.increase = increase;
    this.type = "linear";
    this.fixed = false;
    this.compounding = false;
    this.baseIncrease = baseIncrease;
    this.parent = parent;
    this.relativeIncrease = parent.baseIncrease / baseIncrease; // The ratio of base increase of tier II to tier I, e.g. for Toughness (5%) vs Toughness II (1%), this will be 5.
    this.value = parent.value.map(function(me) { return me * this.relativeIncrease; });
    this.updatedValue = -1;
    this.efficiency = -1;
    this.max = max || Number.MAX_VALUE;
    this.level = level || 0;
    this.spent = 0;
    this.pack = 1;
    this.packMulti = 1;
    this.noMorePack = false;    
    this.packHitBottom = false;
    this.packEfficiency = 0;
    this.price = 0;
    this.packPrice = 0;    
    this.nextPackPrice = 0;
    this.inc = 0;
    this.packinc = 0;
    this.lastOp = 0; //-1 dividing, 0 staying, 1 multiplying
    this.packExponent = Math.log10(this.pack);
    this.EFFY = {inc: this.inc, price: this.price, packPrice: this.packPrice, eff: this.efficiency};
    this.PACKEFFY = {inc: this.packinc, eff: this.packEfficiency};
    //not used right now
    this.recalc = function(targetLevel) {
        if (!targetLevel)
            targetLevel = this.level;
        this.EFFY.inc = AutoPerks.calculateIncrease(this, targetLevel);
        this.EFFY.price = AutoPerks.calculatePrice(this, targetLevel);   //for this loop
        this.EFFY.packPrice = AutoPerks.calculateTotalPrice(this, targetLevel) - this.spent;   //for this next pack
        this.EFFY.eff = this.EFFY.inc/this.EFFY.price;
        return this.EFFY;
    };
  
}
AutoPerks.initializePerks = function () {
    //From here on these magic numbers are not configurable. They represent internal trimps game initial values.
    //DO NOT EDIT UNTIL NEW PERKS GET INVENTED.
    //Fixed perks:
    //AutoPerks.FixedPerk = function(name, base, level, max, fluffy) {
    var siphonology = new AutoPerks.FixedPerk("siphonology", 100000, 3, 3);
    var anticipation = new AutoPerks.FixedPerk("anticipation", 1000, 10, 10);
    var meditation = new AutoPerks.FixedPerk("meditation", 75, 7, 7);
    var relentlessness = new AutoPerks.FixedPerk("relentlessness", 75, 10, 10);
    var range = new AutoPerks.FixedPerk("range", 1, 10, 10);
    var agility = new AutoPerks.FixedPerk("agility", 4, 20, 20);
    var bait = new AutoPerks.FixedPerk("bait", 4, 30);
    var trumps = new AutoPerks.FixedPerk("trumps", 3, 30);
    var packrat = new AutoPerks.FixedPerk("packrat", 3, 30);
    //Variable perks:
    //AutoPerks.VariablePerk = function(name, base, compounding, value, baseIncrease, max, level) {
    var looting = new AutoPerks.VariablePerk("looting", 1, false,             0, 0.05);
    var toughness = new AutoPerks.VariablePerk("toughness", 1, false,         1, 0.05);
    var power = new AutoPerks.VariablePerk("power", 1, false,                 2, 0.05);
    var motivation = new AutoPerks.VariablePerk("motivation", 2, false,       3, 0.05);
    var pheromones = new AutoPerks.VariablePerk("pheromones", 3, false,       4, 0.1);
    var artisanistry = new AutoPerks.VariablePerk("artisanistry", 15, true,   5, 0.1);
    var carpentry = new AutoPerks.VariablePerk("carpentry", 25, true,         6, 0.1);
    var resilience = new AutoPerks.VariablePerk("resilience", 100, true,      7, 0.1);
    var coordinated = new AutoPerks.VariablePerk("coordinated", 150000, true, 8, 0.1);
    var resourceful = new AutoPerks.VariablePerk("resourceful", 50000, true,  9, 0.05);
    var overkill = new AutoPerks.VariablePerk("overkill", 1000000, true,      10, 0.005, 30);
    //Fluffy perks: a new pseudo-category had to be created for "capable" - its a fixed,Linear, (not exponential) perk.
    //TODO: Cost benefit analysis the inter-relationship of buying these.
    var capable = new AutoPerks.FixedPerk("capable", 100000000, 0, 10, "fluffy");
    var cunning = new AutoPerks.VariablePerk("cunning", 100000000000, false,      11, 0.05);
    var curious = new AutoPerks.VariablePerk("curious", 100000000000000, false,   12, 0.05);
    //Tier2 perks
    var toughness_II = new AutoPerks.ArithmeticPerk("toughness_II", 20000, 500, 0.01, toughness);
    var power_II = new AutoPerks.ArithmeticPerk("power_II", 20000, 500, 0.01, power);
    var motivation_II = new AutoPerks.ArithmeticPerk("motivation_II", 50000, 1000, 0.01, motivation);
    var carpentry_II = new AutoPerks.ArithmeticPerk("carpentry_II", 100000, 10000, 0.0025, carpentry);
    var looting_II = new AutoPerks.ArithmeticPerk("looting_II", 100000, 10000, 0.0025, looting);

    //gather these into an array of objects
    AutoPerks.perkHolder = [siphonology, anticipation, meditation, relentlessness, range, agility, bait, trumps, packrat, looting, toughness, power, motivation, pheromones, artisanistry, carpentry, resilience, coordinated, resourceful, overkill, capable, cunning, curious, toughness_II, power_II, motivation_II, carpentry_II, looting_II];
    //initialize basics on all.
    for(var i in AutoPerks.perkHolder) {
        perk = AutoPerks.perkHolder[i];
        perk.packMulti = 1;
        perk.level = 0; //errors out here if a new perk is added to the game.
        perk.spent = 0;
        perk.updatedValue = AutoPerks.perkHolder[i].value;
        perk.recalc();
    }
    //more startup stuff.
    AutoPerks.setperksByName(); //fill it.
    AutoPerks.setDefaultRatios();// Populate ratio textboxes       
}

//Selector functions, essentially like queries but just another layer of abstraction.
//select where all valid and fixed
AutoPerks.getFixedPerks = function() {
    return AutoPerks.getSomePerks(true);
}
//select where all valid and not fixed(therefore variable)
AutoPerks.getVariablePerks = function() {
    return AutoPerks.getSomePerks(null,true);
}
//select where all valid and linear (therefore tier2) but not fluffy
AutoPerks.getTierIIPerks = function() {
    return AutoPerks.getSomePerks(null,null,true);
}
//select where all valid.
AutoPerks.getAllPerks = function() {
    return AutoPerks.getSomePerks(null,null,null,true);
}
//Universal function for accessing a perk object. Returns a bunch of perk types.
AutoPerks.getSomePerks = function(fixed,variable,tier2,allperks) {
    var perks = [];
    for(var i in AutoPerks.perkHolder) {
        var name = AutoPerks.capitaliseFirstLetter(AutoPerks.perkHolder[i].name);
        var perk = game.portal[name];
        if(perk.locked || (typeof perk.level === 'undefined')) continue;
        if(fixed && AutoPerks.perkHolder[i].fixed) {
            perks.push(AutoPerks.perkHolder[i]);
        }
        else if(variable && !AutoPerks.perkHolder[i].fixed) {
            perks.push(AutoPerks.perkHolder[i]);
        }
        else if(tier2 && AutoPerks.perkHolder[i].type == "linear" && !AutoPerks.perkHolder[i].fluffy) {
            perks.push(AutoPerks.perkHolder[i]);
        }
        else if(allperks) {
            perks.push(AutoPerks.perkHolder[i]);
        }
    }
    return perks;
}

//These are in order executionally sequentially:
//create a 2nd array (perksByName) of the contents of perkHolder, indexed by name (easy access w/ getPerkByName)
AutoPerks.perksByName = {};
AutoPerks.getPerkByName = function(name) {
    return AutoPerks.perksByName[AutoPerks.lowercaseFirst(name)];
}
AutoPerks.setperksByName = function() {
    for(var i in AutoPerks.perkHolder)
        AutoPerks.perksByName[AutoPerks.perkHolder[i].name] = AutoPerks.perkHolder[i];
}
// Get owned perks (from save-game)
AutoPerks.getOwnedPerks = function() {
    var perks = [];
    for (var name in game.portal){
        perk = game.portal[name];
        if(perk.locked || (typeof perk.level === 'undefined')) continue;
        perks.push(AutoPerks.getPerkByName(name));
    }
    return perks;
}

//Run the GUI:
AutoPerks.displayGUI();