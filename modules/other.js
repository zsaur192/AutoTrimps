MODULES["other"] = {};
MODULES["other"].enableRoboTrimpSpam = true;  //set this to false to stop Spam of "Activated Robotrimp MagnetoShriek Ability".
var prestraid = false;
var dprestraid = false;
var failpraid = false;
var dfailpraid = false;
var bwraided = false;
var dbwraided = false;
var failbwraid = false;
var dfailbwraid = false;
var perked = false;
var prestraidon = false;
var dprestraidon = false;
var mapbought = false;
var dmapbought = false;
var bwraidon = false;
var dbwraidon = false;
var presteps = null;
var minMaxMapCost;
var fMap;
var pMap;
var shouldFarmFrags = false;
var praidDone = false;

//Activate Robo Trimp (will activate on the first zone after liquification)
function autoRoboTrimp() {
    //exit if the cooldown is active, or we havent unlocked robotrimp.
    if (game.global.roboTrimpCooldown > 0 || !game.global.roboTrimpLevel) return;
    var robotrimpzone = parseInt(getPageSetting('AutoRoboTrimp'));
    //exit if we have the setting set to 0
    if (robotrimpzone == 0) return;
    //activate the button when we are above the cutoff zone, and we are out of cooldown (and the button is inactive)
    if (game.global.world >= robotrimpzone && !game.global.useShriek){
        magnetoShriek();
        if (MODULES["other"].enableRoboTrimpSpam)
            debug("Activated Robotrimp MagnetoShriek Ability @ z" + game.global.world, "graphs", '*podcast');
    }
}

function isBelowThreshold(currentValue) {
  return currentValue != game.global.world;
}

function autoGoldenUpgradesAT(setting) {
    var num = getAvailableGoldenUpgrades();
    if (num == 0) return;
    if (setting == "Void 56")
        setting = "Void";
    if (setting == "Battle")
        setting = "Battle";
    if (setting == "Void 60") {
	setting = "Void";
        var nextVoidAmt = game.goldenUpgrades.Void.nextAmt().toFixed(2);
        if (nextVoidAmt == 0.12) 
            setting = "Helium";
    }

    var success = buyGoldenUpgrade(setting);

    if (!success && setting == "Void") {
        num = getAvailableGoldenUpgrades();
        if (num == 0) return;
	setting = "Helium";
        buyGoldenUpgrade(setting);
    }

}

//auto spend nature tokens
function autoNatureTokens() {
    var changed = false;
    for (var nature in game.empowerments) {
        var empowerment = game.empowerments[nature];
        var setting = getPageSetting('Auto' + nature);
        if (!setting || setting == 'Off') continue;

        //buy/convert once per nature per loop
        if (setting == 'Empowerment') {
            var cost = getNextNatureCost(nature);
            if (empowerment.tokens < cost)
                continue;
            empowerment.tokens -= cost;
            empowerment.level++;
            changed = true;
            debug('Upgraded Empowerment of ' + nature, 'nature');
        }
        else if (setting == 'Transfer') {
            if (empowerment.retainLevel >= 80)
                continue;
            var cost = getNextNatureCost(nature, true);
            if (empowerment.tokens < cost) continue;
            empowerment.tokens -= cost;
            empowerment.retainLevel++;
            changed = true;
            debug('Upgraded ' + nature + ' transfer rate', 'nature');
        }
        else if (setting == 'Convert to Both') {
            if (empowerment.tokens < 20) continue;
            for (var targetNature in game.empowerments) {
                if (targetNature == nature) continue;
                empowerment.tokens -= 10;
                var convertRate = (game.talents.nature.purchased) ? ((game.talents.nature2.purchased) ? 8 : 6) : 5;
                game.empowerments[targetNature].tokens += convertRate;
                changed = true;
                debug('Converted ' + nature + ' tokens to ' + targetNature, 'nature');
            }
        }
        else {
            if (empowerment.tokens < 10)
                continue;
            var match = setting.match(/Convert to (\w+)/);
            var targetNature = match ? match[1] : null;
            //sanity check
            if (!targetNature || targetNature === nature || !game.empowerments[targetNature]) continue;
            empowerment.tokens -= 10;
            var convertRate = (game.talents.nature.purchased) ? ((game.talents.nature2.purchased) ? 8 : 6) : 5;
            game.empowerments[targetNature].tokens += convertRate;
            changed = true;
            debug('Converted ' + nature + ' tokens to ' + targetNature, 'nature');
        }
    }
    if (changed)
        updateNatureInfoSpans();
}

//Check if currently in a Spire past IgnoreSpiresUntil
function isActiveSpireAT() {
    return game.global.spireActive && game.global.world >= getPageSetting('IgnoreSpiresUntil');
}

//Exits the Spire after completing the specified cell.
function exitSpireCell() {
    if(isActiveSpireAT() && game.global.lastClearedCell >= getPageSetting('ExitSpireCell')-1)
        endSpire();
}

function dailyexitSpireCell() {
 	if(isActiveSpireAT() && game.global.lastClearedCell >= getPageSetting('dexitspirecell')-1)
        endSpire();
}

function plusPres() {
  document.getElementById("biomeAdvMapsSelect").value = "Random";
  document.getElementById('advExtraLevelSelect').value = plusMapToRun(game.global.world);
  document.getElementById('advSpecialSelect').value = "p";
  document.getElementById("lootAdvMapsRange").value = 0;
  document.getElementById("difficultyAdvMapsRange").value = 9;
  document.getElementById("sizeAdvMapsRange").value = 9;
  document.getElementById('advPerfectCheckbox').checked = false;
	document.getElementById("mapLevelInput").value = game.global.world;
  updateMapCost();
}

function plusMapToRun(zone) {
  if (zone % 10 == 9)
    return 6;
  else if (zone % 10 <5)
    return 5 - zone % 10;
  else
    return 11 - zone % 10;
}

function findLastBionic() {
  for (var i = game.global.mapsOwnedArray.length -1; i>=0; i--) {
    if (game.global.mapsOwnedArray[i].location === "Bionic") {
      return game.global.mapsOwnedArray[i];
    }
  }
}

//Praiding

function Praiding() {
  var pMap;
  if (getPageSetting('Praidingzone').length) {
    if (getPageSetting('Praidingzone').includes(game.global.world) && !prestraid && !failpraid) {
      debug('World Zone matches a Praiding Zone!');
	    prestraidon = true;

      if (getPageSetting('AutoMaps') == 1 && !prestraid && !failpraid) {
        autoTrimpSettings["AutoMaps"].value = 0;
      }
      if (!game.global.preMapsActive && !game.global.mapsActive && !prestraid && !failpraid) {
        mapsClicked();
		    if (!game.global.preMapsActive) {
          mapsClicked();
        }
		    debug("Beginning Prestige Raiding...");
      }
      if (game.options.menu.repeatUntil.enabled!=2 && !prestraid && !failpraid) {
        game.options.menu.repeatUntil.enabled = 2;
      }
      if (game.global.preMapsActive && !prestraid && !failpraid) {
        plusPres();
        if ((updateMapCost(true) <= game.resources.fragments.owned)) {
          buyMap();
          failpraid = false;
          mapbought = true;
        }
        else if ((updateMapCost(true) > game.resources.fragments.owned)) {
          if (getPageSetting('AutoMaps') == 0 && !prestraid) {
            autoTrimpSettings["AutoMaps"].value = 1;
            failpraid = true;
            prestraidon = false;
            mapbought = false;
            praidDone = true;
            debug("Failed to prestige raid. Looks like you can't afford to..");
          }
          return;
        }
	    }
	    if (mapbought == true) {
        pMap = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length-1].id;
        selectMap(pMap);
	      runMap();
      }
      if (!prestraid && !failpraid && !game.global.repeatMap) {
        repeatClicked();
      }
	    prestraid = true;
	    failpraid = false
	    // prestraidon = false;
	    mapbought = false;
    }
  }

  if (getPageSetting('AutoMaps') == 0 && game.global.preMapsActive && prestraid && !failpraid && prestraidon) {
    praidDone = true;
    prestraidon = false;
    autoTrimpSettings["AutoMaps"].value = 1;
    debug("Prestige raiding successful! - recycling Praid map");
    recycleMap(getMapIndex(pMap));
    debug("Turning AutoMaps back on");
  }
  if (getPageSetting('Praidingzone').every(isBelowThreshold)) {
    prestraid = false;
    failpraid = false;
    prestraidon = false;
    mapbought = false;
    praidDone = false;
  }
}

function PraidHarder() {
//  var pMap;
//  var fMap;
  var maxPlusZones;
  var mapModifiers = ["p","fa","0"];
  var farmFragments;
  var praidBeforeFarm;
  var pRaidIndex;
  var maxPraidZSetting;
  var isBWRaidZ;

  // Determine whether to use daily or normal run settings
  if (game.global.challengeActive == "Daily") {
    praidSetting = 'dPraidingzone';
    maxPraidZSetting = 'dMaxPraidZone';
    isBWRaidZ = getPageSetting('dBWraidingz').includes(game.global.world) && getPageSetting('Dailybwraid');
    farmFragments = getPageSetting('dPraidFarmFragsZ').includes(game.global.world);
    praidBeforeFarm = getPageSetting('dPraidBeforeFarmZ').includes(game.global.world);
  }
  else {
    praidSetting = 'Praidingzone';
    maxPraidZSetting = 'MaxPraidZone';
    isBWRaidZ = getPageSetting('BWraidingz').includes(game.global.world) && getPageSetting('BWraid');
    farmFragments = getPageSetting('PraidFarmFragsZ').includes(game.global.world);
    praidBeforeFarm = getPageSetting('PraidBeforeFarmZ').includes(game.global.world);
  }

  pRaidIndex = getPageSetting(praidSetting).indexOf(game.global.world);
  if (pRaidIndex == -1 || typeof(getPageSetting(maxPraidZSetting)[pRaidIndex]) === "undefined") maxPlusZones = 10;
  else maxPlusZones = getPageSetting(maxPraidZSetting)[pRaidIndex] - game.global.world;

  // Check we have a valid number for maxPlusZones
  maxPlusZones = maxPlusZones > 10 ? 10 : (maxPlusZones < 0 ? 10 : maxPlusZones);

  // Work out the max number of +map zones it's worth farming for prestige.
  if ((game.global.world + maxPlusZones) % 10 > 5)
    maxPlusZones = Math.max(maxPlusZones + (5 - (game.global.world + maxPlusZones) % 10),0);
  else if ((game.global.world + maxPlusZones) % 10 == 0)
    maxPlusZones = Math.min(5,maxPlusZones);

  // If we have any Praiding zones defined...
  if (getPageSetting(praidSetting).length) {
    if (getPageSetting(praidSetting).includes(game.global.world) && !prestraid && !failpraid && !shouldFarmFrags) {
      debug('Beginning Praiding');
      // Initialise shouldFarmFrags to false
      shouldFarmFrags = false;
      // Mark that we are prestige raiding and turn off automaps to stop it interfering
      prestraidon = true;
      autoTrimpSettings["AutoMaps"].value = 0;
      // Get into the preMaps screen
      while (!game.global.preMapsActive) mapsClicked();
      // Set repeat for items
      game.options.menu.repeatUntil.enabled = 2;
      toggleSetting("repeatUntil", null, false, true);
      // if we can farm for fragments, work out the minimum number we need to get all available prestiges
      if (farmFragments) {
        plusPres();
        document.getElementById('advExtraLevelSelect').value = maxPlusZones;
        document.getElementById('sizeAdvMapsRange').value = 0;
        document.getElementById('difficultyAdvMapsRange').value = 0;
        document.getElementById('advSpecialSelect').value = "0";
        minMaxMapCost = updateMapCost(true);
        // If we are not Praiding before farming, and cannot afford a max plus map, set flags for farming
        if (!praidBeforeFarm && game.resources.fragments.owned < minMaxMapCost) {
          prestraid = true;
          failpraid = false;
          shouldFarmFrags = true;
        }
      }
      // Set map settings to the best map for Praiding (even if we can't afford it)
      plusPres();
      document.getElementById('advExtraLevelSelect').value = maxPlusZones;
      // Iterate down through plusMaps setting until we find one we can afford
      for (var curPlusZones = maxPlusZones; curPlusZones >= 0; curPlusZones--) {
        // If the current targeted zone has no prestiges, decrement the number of plusZones and continue
        if ((game.global.world + curPlusZones) % 10 == 0 || (game.global.world + curPlusZones) % 10 > 5) continue;
        // Otherwise check to see if we can afford a map at the current plusZones setting
        document.getElementById('advExtraLevelSelect').value = curPlusZones;
        // If we find a map we can afford, break out of the loop
        if (relaxMapReqs(mapModifiers)) break;
        // conserve fragments if going to farm after by selecting only maps with no special modifier
        else if (farmFragments) mapModifiers = ["0"];
      }
      // If the map is not at the highest level with prestiges possible, set shouldFarmFrags to true
      if (maxPlusZones > curPlusZones) shouldFarmFrags = true;

      // If we found a suitable map...
      if (curPlusZones >= 0 && (praidBeforeFarm || shouldFarmFrags == false)) {
        // ...buy it
        buyMap();
        pMap = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length-1].id;
        selectMap(pMap);
        // Set flags to avoid rerunning this step
        prestraid = true;
        // prestraidon = false;
        failpraid = false;
        // Set repeat on and run the map
        game.global.repeatMap = true;
        runMap();
        repeatClicked(true);
      }
      // If we can't afford a map, and can't farm fragments, fail and turn automaps back on
      else if (!farmFragments){
        failpraid = true;
        prestraidon = false;
        praidDone = true;
        debug("Failed to prestige raid. Looks like you can't afford to.");
        if (isBWRaidZ) {
          // resetting these out of an abundance of caution
          bwraided = false;
          failbwraid = false;
          dbwraided = false;
          dfailbwraid = false;
          // BWraiding();
        }
        else {
          debug("Turning AutoMaps back on");
          autoTrimpSettings['AutoMaps'].value = 1;
        }
        return;
      }
    }
  }
  // If we are in preMaps and should farm fragments...
  if (farmFragments && shouldFarmFrags && game.global.preMapsActive && prestraid && !fMap) {
    // Recycle any pMaps
    if (pMap) recycleMap(getMapIndex(pMap));
    pMap = null;
    // Choose a fragment farming map
    document.getElementById("biomeAdvMapsSelect").value = "Depths";
    document.getElementById('advExtraLevelSelect').value = 0;
    document.getElementById('advSpecialSelect').value = "fa";
    document.getElementById("lootAdvMapsRange").value = 9;
    document.getElementById("difficultyAdvMapsRange").value = 9;
    document.getElementById("sizeAdvMapsRange").value = 9;
    document.getElementById('advPerfectCheckbox').checked = true;
  	document.getElementById("mapLevelInput").value = game.global.world - 1;
    // Set repeat forever
    game.options.menu.repeatUntil.enabled = 0;
    toggleSetting("repeatUntil", null, false, true);
    // If we can afford a pefect sliders map...
    if (updateMapCost(true) <= game.resources.fragments.owned) {
      debug("Buying perfect sliders fragment farming map");
      // ...buy the map and run it
      buyMap();
      fMap = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length-1].id;
      selectMap(fMap);
      game.global.repeatMap = true;
      runMap();
      repeatClicked(true);
    }
    // Otherwise try to buy a map without perfect sliders
    else {
      document.getElementById('advPerfectCheckbox').checked = false;
      if (updateMapCost(true) <= game.resources.fragments.owned) {
        debug("Buying imperfect sliders fragment farming map");
        buyMap();
        fMap = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length-1].id;
        selectMap(fMap);
        game.global.repeatMap = true;
        runMap();
        repeatClicked(true);
      }
      // if we can't buy a map, wait until the next main loop iteration and try again
      else debug("Can't afford fragment farming map yet");
    }
  }

  if ((game.global.mapsActive || game.global.preMapsActive) && minMaxMapCost <= game.resources.fragments.owned && shouldFarmFrags) {
    // prestraidon = false;
    game.global.repeatMap = false;
    repeatClicked(true);
    if (game.global.preMapsActive) {
      minMaxMapCost = null;
      shouldFarmFrags = false;
      prestraid = false;
      failpraid = false;
    }
  }
  if (game.global.preMapsActive && prestraid && !failpraid && !shouldFarmFrags && prestraidon) {
    prestraidon = false;
    praidDone = true;
    debug("Prestige raiding successful! - recycling Praid map");
    if (pMap) recycleMap(getMapIndex(pMap));
    if (fMap) recycleMap(getMapIndex(fMap));
    pMap = null;
    fMap = null;
    if (isBWRaidZ) {
      // resetting these out of an abundance of caution
      bwraided = false;
      failbwraid = false;
      dbwraided = false;
      dfailbwraid = false;
      // BWraiding(); // Make sure we try to BWraid
    }
    else {
      debug("Turning AutoMaps back on");
      autoTrimpSettings['AutoMaps'].value = 1;
    }
  }

  if (!getPageSetting(praidSetting).includes(game.global.world)) {
    prestraid = false;
    failpraid = false;
    prestraidon = false;
    shouldFarmFrags = false;
    praidDone = false;
  }
}

function relaxMapReqs(mapModifiers) {
  for (var j = 0; j < mapModifiers.length; j++) {
    document.getElementById('sizeAdvMapsRange').value = 9;
    document.getElementById('advSpecialSelect').value = mapModifiers[j];
    for (var i = 9; i >= 0; i--) {
      document.getElementById('difficultyAdvMapsRange').value = i;
      if (updateMapCost(true) <= game.resources.fragments.owned) return true;
    }
    for (i = 9; i >= 0; i--) {
      document.getElementById('sizeAdvMapsRange').value = i;
      if (updateMapCost(true) <= game.resources.fragments.owned) return true;
    }
  }
  return false;
}

function BWraiding() {
  var bwraidZ;
  var bwraidSetting;
  var bwraidMax;
  var isPraidZ;
  var ispraidon;
  var isBWRaidZ;
  var targetBW;
  var bwIndex;

//  PraidHarder(); // To make sure we try to Praid first before BWraiding

  if (game.global.challengeActive == "Daily") {
    bwraidZ = 'dBWraidingz';
    bwraidSetting = 'Dailybwraid';
    bwraidMax = 'dBWraidingmax';
    isPraidZ = getPageSetting('dPraidingzone').includes(game.global.world);
    ispraidon = dprestraidon;
  }
  else {
    bwraidZ = 'BWraidingz';
    bwraidSetting = 'BWraid';
    bwraidMax = 'BWraidingmax';
    isPraidZ = getPageSetting('Praidingzone').includes(game.global.world);
    ispraidon = prestraidon;
  }

  // Convert old BWraid settings to multivalue
  if (typeof(autoTrimpSettings['BWraidingz'].value) == "number")
    setPageSetting('BWraidingz', Array.of(autoTrimpSettings['BWraidingz'].value));
  if (typeof(autoTrimpSettings['BWraidingmax'].value) == "number")
    setPageSetting('BWraidingmax', Array.of(autoTrimpSettings['BWraidingmax'].value));
  if (typeof(autoTrimpSettings['dBWraidingz'].value) == "number")
      setPageSetting('dBWraidingz', Array.of(autoTrimpSettings['dBWraidingz'].value));
  if (typeof(autoTrimpSettings['dBWraidingmax'].value) == "number")
      setPageSetting('dBWraidingmax', Array.of(autoTrimpSettings['dBWraidingmax'].value));


  isBWRaidZ = getPageSetting(bwraidZ).includes(game.global.world);
  bwIndex = getPageSetting(bwraidZ).indexOf(game.global.world);
  if (bwIndex == -1 || typeof(getPageSetting(bwraidMax)[bwIndex]) === "undefined") targetBW = -1;
  else targetBW = getPageSetting(bwraidMax)[bwIndex];

  if ((!isPraidZ || praidDone) && !ispraidon && isBWRaidZ && !bwraided && !failbwraid && getPageSetting(bwraidSetting)) {
    if (getPageSetting('AutoMaps') == 1 && !bwraided && !failbwraid) {
      autoTrimpSettings["AutoMaps"].value = 0;
    }

//    if (!game.global.preMapsActive && !game.global.mapsActive && !bwraided && !failbwraid) {
//      mapsClicked();
//      if (!game.global.preMapsActive) {
//        mapsClicked();
//      }
//    }

    while (!game.global.preMapsActive && !bwraidon) mapsClicked();

    if (game.options.menu.repeatUntil.enabled != 2 && !bwraided && !failbwraid) {
      game.options.menu.repeatUntil.enabled = 2;
    }

    if (game.global.preMapsActive && !bwraided && !failbwraid && findLastBionic()) {
      selectMap(findLastBionic().id);
      failbwraid = false;
      debug("Beginning BW Raiding...");
    }

    else if (game.global.preMapsActive && !bwraided && !failbwraid) {
      if (getPageSetting('AutoMaps') == 0 && isBWRaidZ && !bwraided) {
        autoTrimpSettings["AutoMaps"].value = 1;
        failbwraid = true;
        debug("Failed to BW raid. Looks like you don't have a BW to raid...");
      }
    }

    if (findLastBionic().level <= targetBW && !bwraided && !failbwraid && game.global.preMapsActive) {
      runMap();
      bwraidon = true;
    }

    if (!game.global.repeatMap && !bwraided && !failbwraid && game.global.mapsActive) {
      repeatClicked();
    }

    if (findLastBionic().level > targetBW && !bwraided && !failbwraid) {
      bwraided = true;
      failbwraid = false;
      bwraidon = false;
      debug("...Successfully BW raided!");
    }

    //if (getPageSetting('AutoMaps') == 0 && game.global.preMapsActive && game.global.world == getPageSetting(bwraidZ) && bwraided && !failbwraid) {
    //  autoTrimpSettings["AutoMaps"].value = 1;
    //  debug("Turning AutoMaps back on");
    //}
  }

  if (getPageSetting('AutoMaps') == 0 && game.global.preMapsActive && bwraided && !failbwraid) {
    autoTrimpSettings["AutoMaps"].value = 1;
    debug("Turning AutoMaps back on");
  }

  if (!isBWRaidZ) {
    bwraided = false;
    failbwraid = false;
    bwraidon = false;
  }
}

//AutoAllocate Looting II
function lootdump() {
if (game.global.world==getPageSetting('lootdumpz') && !perked && getPageSetting('AutoAllocatePerks')==2 && getPageSetting('lootdumpa') > 0 && getPageSetting('lootdumpz') > 0) {
	    viewPortalUpgrades();
	    game.global.lastCustomAmt = getPageSetting('lootdumpa');
	    numTab(5, true);
	    if (getPortalUpgradePrice("Looting_II")+game.resources.helium.totalSpentTemp <= game.resources.helium.respecMax) {
		buyPortalUpgrade('Looting_II');
		activateClicked();
		cancelPortal();
		debug('Bought ' + getPageSetting('lootdumpa') + ' Looting II');
	     }
	else {
	     perked = true;
	     cancelPortal();
	     debug("Done buying Looting II");
	     }
	}
else if (perked == true && game.global.world !== getPageSetting('lootdumpz')) {
         perked = false;
             }
}

function buyWeps() {
	preBuy();
	game.global.buyAmt = getPageSetting('gearamounttobuy');
        if (game.equipment.Dagger.level < getPageSetting('CapEquip2') && canAffordBuilding('Dagger', null, null, true)) {
	    buyEquipment('Dagger', true, true);
    	}
	if (game.equipment.Mace.level < getPageSetting('CapEquip2') && canAffordBuilding('Mace', null, null, true)) {
	    buyEquipment('Mace', true, true);
    	}
        if (game.equipment.Polearm.level < getPageSetting('CapEquip2') && canAffordBuilding('Polearm', null, null, true)) {
	    buyEquipment('Polearm', true, true);
    	}
        if (game.equipment.Battleaxe.level < getPageSetting('CapEquip2') && canAffordBuilding('Battleaxe', null, null, true)) {
	    buyEquipment('Battleaxe', true, true);
    	}
        if (game.equipment.Greatsword.level < getPageSetting('CapEquip2') && canAffordBuilding('Greatsword', null, null, true)) {
	    buyEquipment('Greatsword', true, true);
    	}
        if (game.equipment.Arbalest.level < getPageSetting('CapEquip2') && canAffordBuilding('Arbalest', null, null, true)) {
	    buyEquipment('Arbalest', true, true);
    	}
	postBuy();
}

function buyArms() {
	preBuy();
	game.global.buyAmt = 10;
        if (game.equipment.Shield.level < getPageSetting('CapEquip2') && canAffordBuilding('Shield', null, null, true)) {
	    buyEquipment('Shield', true, true);
    	}
	if (game.equipment.Boots.level < getPageSetting('CapEquip2') && canAffordBuilding('Boots', null, null, true)) {
	    buyEquipment('Boots', true, true);
    	}
        if (game.equipment.Helmet.level < getPageSetting('CapEquip2') && canAffordBuilding('Helmet', null, null, true)) {
	    buyEquipment('Helmet', true, true);
    	}
        if (game.equipment.Pants.level < getPageSetting('CapEquip2') && canAffordBuilding('Pants', null, null, true)) {
	    buyEquipment('Pants', true, true);
    	}
        if (game.equipment.Shoulderguards.level < getPageSetting('CapEquip2') && canAffordBuilding('Shoulderguards', null, null, true)) {
	    buyEquipment('Shoulderguards', true, true);
    	}
        if (game.equipment.Breastplate.level < getPageSetting('CapEquip2') && canAffordBuilding('Breastplate', null, null, true)) {
	    buyEquipment('Breastplate', true, true);
    	}
 	if (game.equipment.Gambeson.level < getPageSetting('CapEquip2') && canAffordBuilding('Gambeson', null, null, true)) {
	    buyEquipment('Gambeson', true, true);
    	}
	postBuy();
}

function trimpcide() {
if (game.portal.Anticipation.level >= 1) {
	var antistacklimit = 45;
	if (!game.talents.patience.purchased) {
	    antistacklimit = 30;
	    }
	if (((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) >= antistacklimit && game.global.antiStacks < antistacklimit && !game.global.spireActive) {
              forceAbandonTrimps();
              }
	if (((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) >= antistacklimit && game.global.antiStacks < antistacklimit && game.global.mapsActive) {
	      if (getCurrentMapObject().location == "Void") {
		  abandonVoidMap();
	          }
	      }
	}
}

function ATspirebreed() {
    // Get current geneticist setting
    var currStep = game.global.GeneticistassistSteps.indexOf(game.global.GeneticistassistSetting);
    // Check we are in a valid spire, have a valid timer setting, have not already made a copy of the old settings and set a new timer etc.
    if (getPageSetting('SpireBreedTimer') >= 1 && getPageSetting('IgnoreSpiresUntil') <= game.global.world && game.global.spireActive && !presteps && currStep > 0) {
        // Make a copy by value of the old gene assist timers
        presteps = game.global.GeneticistassistSteps.slice();
        // Set the current timer to the spire breed timer
        game.global.GeneticistassistSteps[currStep] = getPageSetting('SpireBreedTimer');
        game.global.GeneticistassistSetting = getPageSetting('SpireBreedTimer');
        // Update gene assistant settings
        toggleGeneticistassist(true);
    }
    // If we are not in a spire and have saved geneticist assistant timers...
    else if (!game.global.spireActive && presteps) {
        //  Set the gene timers back to the saved array of old values and update the current timer setting
        game.global.GeneticistassistSteps = presteps;
        game.global.GeneticistassistSetting = presteps[currStep];
        // Update geneticist assistant settings
        toggleGeneticistassist(true);
        // Null the saved reference to the timer array so that we do not execute this branch again and are ready for the next spire
        presteps = null;
    }
}

function helptrimpsnotdie () {
	if (!game.global.fighting && !game.global.preMapsActive) {
        buyArms();
	}
}

//Daily stuff couldnt be bothered to add it to original

function dailyPraiding() {
    var dpMap;
    if (getPageSetting('dPraidingzone').length) {
   	if (getPageSetting('dPraidingzone').includes(game.global.world) && !dprestraid && !dfailpraid) {
            debug('World Zone matches a Daily Praiding Zone!');
	    dprestraidon = true;

            if (getPageSetting('AutoMaps') == 1 && !dprestraid && !dfailpraid) {
                autoTrimpSettings["AutoMaps"].value = 0;
            }
            if (!game.global.preMapsActive && !game.global.mapsActive && !dprestraid && !dfailpraid) {
                mapsClicked();
		if (!game.global.preMapsActive) {
                    mapsClicked();
                }
		debug("Beginning Daily Prestige Raiding...");
            }
            if (game.options.menu.repeatUntil.enabled!=2 && !dprestraid && !dfailpraid) {
                game.options.menu.repeatUntil.enabled = 2;
            }
            if (game.global.preMapsActive && !dprestraid && !dfailpraid) {
                plusPres();
                if ((updateMapCost(true) <= game.resources.fragments.owned)) {
                    buyMap();
                    dfailpraid = false;
		    dmapbought = true;
                }
                else if ((updateMapCost(true) > game.resources.fragments.owned)) {
                    if (getPageSetting('AutoMaps') == 0 && !dprestraid) {
                        autoTrimpSettings["AutoMaps"].value = 1;
                        dfailpraid = true;
			                  dprestraidon = false;
			                  dmapbought = false;
                        praidDone = true;
                        debug("Failed to Daily Prestige Raid. Looks like you can't afford to..");
                    }
                    return;

                }
	    }
	    if (dmapbought == true) {
		dpMap = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length-1].id;
                selectMap(dpMap);
		runMap();
            }
            if (!dprestraid && !dfailpraid && !game.global.repeatMap) {
                repeatClicked();

            }
	    dprestraid = true;
	    dfailpraid = false;
	    // dprestraidon = false;
	    dmapbought = false;
	}
    }

    if (getPageSetting('AutoMaps') == 0 && game.global.preMapsActive && dprestraid && !dfailpraid && dprestraidon) {
        praidDone = true;
        dprestraidon = false;
        autoTrimpSettings["AutoMaps"].value = 1;
	      debug("Daily Prestige Raiding successful! - recycling Praid map");
	      recycleMap(getMapIndex(dpMap));
	      debug("Turning AutoMaps back on");
    }
    if (getPageSetting('dPraidingzone').every(isBelowThreshold)) {
        dprestraid = false;
        dfailpraid = false
        dprestraidon = false;
        dmapbought = false;
        praidDone = false;
    }
}

function dailyBWraiding() {

	 if (!dprestraidon && game.global.world == getPageSetting('dBWraidingz') && !dbwraided && !dfailbwraid && getPageSetting('Dailybwraid')) {

	     if (getPageSetting('AutoMaps') == 1 && !dbwraided && !dfailbwraid) {
                 autoTrimpSettings["AutoMaps"].value = 0;
                 }

             if (!game.global.preMapsActive && !game.global.mapsActive && !dbwraided && !dfailbwraid) {
                 mapsClicked();

		 if (!game.global.preMapsActive) {
                     mapsClicked();
                     }
                 }

	     if (game.options.menu.repeatUntil.enabled != 2 && !dbwraided && !dfailbwraid) {
            	 game.options.menu.repeatUntil.enabled = 2;
                 }

	     if (game.global.preMapsActive && !dbwraided && !dfailbwraid) {
		 selectMap(findLastBionic().id);
		 dfailbwraid = false;
		 debug("Beginning Daily BW Raiding...");
                 }

	     else if (game.global.preMapsActive && !dbwraided && !dfailbwraid) {
                      if (getPageSetting('AutoMaps') == 0 && game.global.world == getPageSetting('dBWraidingz') && !dbwraided) {
                          autoTrimpSettings["AutoMaps"].value = 1;
                          dfailbwraid = true;
                          debug("Failed to Daily BW raid. Looks like you don't have a BW to raid...");
                          }

                      }

	     if (findLastBionic().level <= getPageSetting('dBWraidingmax') && !dbwraided && !dfailbwraid && game.global.preMapsActive) {
		 runMap();
		 dbwraidon = true;
		 }

	     if (!game.global.repeatMap && !dbwraided && !dfailbwraid && game.global.mapsActive) {
		 repeatClicked();
		 }

	     if (findLastBionic().level > getPageSetting('dBWraidingmax') && !dbwraided && !dfailbwraid) {
                 dbwraided = true;
            	 dfailbwraid = false;
		 dbwraidon = false;
           	 debug("...Successfully Daily BW raided!");
		 }

	     if (getPageSetting('AutoMaps') == 0 && game.global.preMapsActive && game.global.world == getPageSetting('dBWraidingz') && dbwraided && !dfailbwraid) {
                 autoTrimpSettings["AutoMaps"].value = 1;
		 debug("Turning AutoMaps back on");
                 }

	    }

	if (getPageSetting('AutoMaps') == 0 && game.global.preMapsActive && dbwraided && !dfailbwraid) {
            autoTrimpSettings["AutoMaps"].value = 1;
	    debug("Turning AutoMaps back on");
	    }

	if (dbwraided && !dfailbwraid && game.global.world !== getPageSetting('dBWraidingz')) {
            dbwraided = false;
	    dfailbwraid = false;
	    dbwraidon = false;
            }

}

function heliumydaily() {

	if (game.global.challengeActive == "Daily" && getPageSetting('buyheliumy') >= 1 && getDailyHeliumValue(countDailyWeight()) >= getPageSetting('buyheliumy') && game.global.b >= 100 && !game.singleRunBonuses.heliumy.owned) {

		purchaseSingleRunBonus('heliumy');

	}
}

function fightalways() {
	if (game.global.gridArray.length === 0 || game.global.preMapsActive || !game.upgrades.Battle.done || game.global.fighting || (game.global.spireActive && game.global.world >= getPageSetting('IgnoreSpiresUntil')))
	    return;
	if (!game.global.fighting)
	    fightManual();
}


function usedaily3() {
  if (getPageSetting('use3daily') == true && game.global.challengeActive == "Daily" && !daily3) {
    daily3 = true;
  }
  if (getPageSetting('use3daily') == false && game.global.challengeActive != "Daily" && daily3) {
    daily3 = false;
  }
  if (getPageSetting('use3daily') == true && game.global.challengeActive != "Daily" && daily3) {
    daily3 = false;
  }
}

function cutoffwind() {
	if (getPageSetting('windcutoff') < 1 && MODULES["equipment"].enoughDamageCutoff != 4 && MODULES["maps"].enoughDamageCutoff != 4 && game.global.world != getPageSetting('WindStackingMin')) {
	MODULES["equipment"].enoughDamageCutoff = 4;
	MODULES["maps"].enoughDamageCutoff = 4;
	}
	if (getPageSetting('windcutoff') >= 1 && MODULES["equipment"].enoughDamageCutoff != 4 && MODULES["maps"].enoughDamageCutoff != 4 && game.global.world < getPageSetting('WindStackingMin')) {
	MODULES["equipment"].enoughDamageCutoff = 4;
	MODULES["maps"].enoughDamageCutoff = 4;
	}
	if (getPageSetting('windcutoff') >= 1 && getEmpowerment() == "Wind" && MODULES["equipment"].enoughDamageCutoff != getPageSetting('windcutoff') && MODULES["maps"].enoughDamageCutoff != getPageSetting('windcutoff') && game.global.world >= getPageSetting('WindStackingMin')) {
	MODULES["equipment"].enoughDamageCutoff = getPageSetting('windcutoff');
	MODULES["maps"].enoughDamageCutoff = getPageSetting('windcutoff');
	}
}

function dcutoffwind() {
	if (getPageSetting('dwindcutoff') < 1 && MODULES["equipment"].enoughDamageCutoff != 4 && MODULES["maps"].enoughDamageCutoff != 4 && game.global.world != getPageSetting('dWindStackingMin')) {
	MODULES["equipment"].enoughDamageCutoff = 4;
	MODULES["maps"].enoughDamageCutoff = 4;
	}
	if (getPageSetting('dwindcutoff') >= 1 && MODULES["equipment"].enoughDamageCutoff != 4 && MODULES["maps"].enoughDamageCutoff != 4 && game.global.world < getPageSetting('dWindStackingMin')) {
	MODULES["equipment"].enoughDamageCutoff = 4;
	MODULES["maps"].enoughDamageCutoff = 4;
	}
	if (getPageSetting('dwindcutoff') >= 1 && getEmpowerment() == "Wind" && MODULES["equipment"].enoughDamageCutoff != getPageSetting('dwindcutoff') && MODULES["maps"].enoughDamageCutoff != getPageSetting('dwindcutoff') && game.global.world >= getPageSetting('dWindStackingMin')) {
	MODULES["equipment"].enoughDamageCutoff = getPageSetting('dwindcutoff');
	MODULES["maps"].enoughDamageCutoff = getPageSetting('dwindcutoff');
	}
}

function buyshitspire() {
	if (getPageSetting('spireshitbuy') == true && game.global.spireActive && game.global.world >= getPageSetting('IgnoreSpiresUntil')) {
	buyWeps();
	buyArms();
	}
}

function orangewindstack() {
	if (getEmpowerment() == "Wind" && HDratioy() <= getPageSetting('windcutoff') && getPageSetting('hardcorewind') >= 1 && game.global.world >= getPageSetting('hardcorewind')) {
            if (game.equipment.Dagger.level > 9 && game.upgrades.Dagadder.locked == 0)
	    	buyUpgrade('Dagadder', true, true);
	    if (game.equipment.Mace.level > 9 && game.upgrades.Megamace.locked == 0)
	    	buyUpgrade('Megamace', true, true);
	    if (game.equipment.Polearm.level > 9 && game.upgrades.Polierarm.locked == 0)
	    	buyUpgrade('Polierarm', true, true);
	    if (game.equipment.Battleaxe.level > 9 && game.upgrades.Axeidic.locked == 0)
	    	buyUpgrade('Axeidic', true, true);
	    if (game.equipment.Greatsword.level > 9 && game.upgrades.Greatersword.locked == 0)
	    	buyUpgrade('Greatersword', true, true);
	    if (game.equipment.Arbalest.level > 9 && game.upgrades.Harmbalest.locked == 0)
	   	buyUpgrade('Harmbalest', true, true);
	    if (game.upgrades.Bootboost.locked == 0)
		buyUpgrade('Bootboost', true, true);
	    if (game.upgrades.Hellishmet.locked == 0)
		buyUpgrade('Hellishmet', true, true);
	    if (game.upgrades.Pantastic.locked == 0)
		buyUpgrade('Pantastic', true, true);
	    if (game.upgrades.Smoldershoulder.locked == 0)
		buyUpgrade('Smoldershoulder', true, true);
	    if (game.upgrades.Bestplate.locked == 0)
		buyUpgrade('Bestplate', true, true);
	    if (game.upgrades.GambesOP.locked == 0)
		buyUpgrade('GambesOP', true, true);
	    if (game.upgrades.Supershield.locked == 0)
		buyUpgrade('Supershield', true, true);
        }
}

function dorangewindstack() {
	if (getEmpowerment() == "Wind" && HDratioy() <= getPageSetting('dwindcutoff') && getPageSetting('dhardcorewind') >= 1 && game.global.world >= getPageSetting('dhardcorewind')) {
            if (game.equipment.Dagger.level > 9 && game.upgrades.Dagadder.locked == 0)
	    	buyUpgrade('Dagadder', true, true);
	    if (game.equipment.Mace.level > 9 && game.upgrades.Megamace.locked == 0)
	    	buyUpgrade('Megamace', true, true);
	    if (game.equipment.Polearm.level > 9 && game.upgrades.Polierarm.locked == 0)
	    	buyUpgrade('Polierarm', true, true);
	    if (game.equipment.Battleaxe.level > 9 && game.upgrades.Axeidic.locked == 0)
	    	buyUpgrade('Axeidic', true, true);
	    if (game.equipment.Greatsword.level > 9 && game.upgrades.Greatersword.locked == 0)
	    	buyUpgrade('Greatersword', true, true);
	    if (game.equipment.Arbalest.level > 9 && game.upgrades.Harmbalest.locked == 0)
	   	buyUpgrade('Harmbalest', true, true);
	    if (game.upgrades.Bootboost.locked == 0)
		buyUpgrade('Bootboost', true, true);
	    if (game.upgrades.Hellishmet.locked == 0)
		buyUpgrade('Hellishmet', true, true);
	    if (game.upgrades.Pantastic.locked == 0)
		buyUpgrade('Pantastic', true, true);
	    if (game.upgrades.Smoldershoulder.locked == 0)
		buyUpgrade('Smoldershoulder', true, true);
	    if (game.upgrades.Bestplate.locked == 0)
		buyUpgrade('Bestplate', true, true);
	    if (game.upgrades.GambesOP.locked == 0)
		buyUpgrade('GambesOP', true, true);
	    if (game.upgrades.Supershield.locked == 0)
		buyUpgrade('Supershield', true, true);
        }
}

function amalwatch() {
	var amalcount = game.jobs.Amalgamator.owned
	if (amalcount != game.jobs.Amalgamator.owned)
	    manualFight();
}

function armormagic() {
	var armormagicworld =  Math.floor((game.global.highestLevelCleared + 1) * 0.8);
	if (((getPageSetting('carmormagic') == 1 || getPageSetting('darmormagic') == 1) && game.global.world >= armormagicworld && (game.global.soldierHealth <= game.global.soldierHealthMax*0.25)) || ((getPageSetting('carmormagic') == 2 || getPageSetting('darmormagic') == 2) && HDratioy() >= getPageSetting('mapcutoff') && (game.global.soldierHealth <= game.global.soldierHealthMax*0.25)) || ((getPageSetting('carmormagic') == 3 || getPageSetting('darmormagic') == 3) && (game.global.soldierHealth <= game.global.soldierHealthMax*0.25)))
	 buyArms();
}
