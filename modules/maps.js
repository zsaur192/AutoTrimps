MODULES.maps={},MODULES.maps.numHitsSurvived=8,MODULES.maps.LeadfarmingCutoff=10,MODULES.maps.NomfarmingCutoff=10,MODULES.maps.NomFarmStacksCutoff=[7,30,100],MODULES.maps.MapTierZone=[72,47,16],MODULES.maps.MapTier0Sliders=[9,9,9,"Mountain"],MODULES.maps.MapTier1Sliders=[9,9,9,"Depths"],MODULES.maps.MapTier2Sliders=[9,9,9,"Random"],MODULES.maps.MapTier3Sliders=[9,9,9,"Random"],MODULES.maps.preferGardens=!getPageSetting("PreferMetal"),MODULES.maps.SpireFarm199Maps=!0,MODULES.maps.shouldFarmCell=59,MODULES.maps.SkipNumUnboughtPrestiges=2,MODULES.maps.UnearnedPrestigesRequired=2;
var doVoids=!1,prestigeRaiding=!1,dprestigeRaiding=!1,praidHard=!1,BWRaiding=!1,needToVoid=!1,needPrestige=!1,skippedPrestige=!1,scryerStuck=!1,shouldDoMaps=!1,mapTimeEstimate=0,lastMapWeWereIn=null,preSpireFarming=!1,spireMapBonusFarming=!1,spireTime=0,doMaxMapBonus=!1,vanillaMapatZone=!1,additionalCritMulti=2<getPlayerCritChance()?25:5;
var prestraid=!1,dprestraid=!1,failpraid=!1,dfailpraid=!1,bwraided=!1,dbwraided=!1,failbwraid=!1,dfailbwraid=!1,prestraidon=!1,dprestraidon=!1,mapbought=!1,dmapbought=!1,bwraidon=!1,dbwraidon=!1,presteps=null,minMaxMapCost,fMap,pMap,shouldFarmFrags=!1,praidDone=!1;

function autoMap() {

    //Failsafes
    if (!game.global.mapsUnlocked || baseDamage <= 0) {
        enoughDamage = true;
        enoughHealth = true;
        shouldFarm = false;
        updateAutoMapsStatus();
        return;
    }
    if (game.global.challengeActive == "Mapology" && game.challenges.Mapology.credits < 1) {
        updateAutoMapsStatus();
        return;
    }

    //WS
    var mapenoughdamagecutoff = getPageSetting("mapcuntoff");
    if (getEmpowerment() == 'Wind' && game.global.challengeActive != "Daily" && !game.global.runningChallengeSquared && getPageSetting("AutoStance") == 3 && getPageSetting("WindStackingMin") > 0 && game.global.world >= getPageSetting("WindStackingMin") && getPageSetting("windcutoffmap") > 0)
        mapenoughdamagecutoff = getPageSetting("windcutoffmap");
    if (getEmpowerment() == 'Wind' && game.global.challengeActive == "Daily" && !game.global.runningChallengeSquared && (getPageSetting("AutoStance") == 3 || getPageSetting("use3daily") == true) && getPageSetting("dWindStackingMin") > 0 && game.global.world >= getPageSetting("dWindStackingMin") && getPageSetting("dwindcutoffmap") > 0)
        mapenoughdamagecutoff = getPageSetting("dwindcutoffmap");
    if (getPageSetting("mapc2hd") > 0 && game.global.challengeActive == "Mapology")
        mapenoughdamagecutoff = getPageSetting("mapc2hd");

    //Vars
    var customVars = MODULES["maps"];
    var prestige = autoTrimpSettings.Prestige.selected;
    if (prestige != "Off" && game.options.menu.mapLoot.enabled != 1) toggleSetting('mapLoot');
    if (game.options.menu.repeatUntil.enabled == 2) toggleSetting('repeatUntil');
    if (game.options.menu.exitTo.enabled != 0) toggleSetting('exitTo');
    if (game.options.menu.repeatVoids.enabled != 0) toggleSetting('repeatVoids');
    var challSQ = game.global.runningChallengeSquared;
    var extraMapLevels = getPageSetting('AdvMapSpecialModifier') ? getExtraMapLevels() : 0;

    //Void Vars
    var voidMapLevelSetting = 0;
    if (game.global.challengeActive != "Daily") {
        voidMapLevelSetting = getPageSetting('VoidMaps');
    }
    var dailyVoidMod = getPageSetting('DailyVoidMod');
    if ((game.global.challengeActive == "Daily") && (getPageSetting('DailyVoidMod') >= 1)) {
        (voidMapLevelSetting = dailyVoidMod);
    }
    var voidMapLevelSettingZone = (voidMapLevelSetting + "").split(".")[0];
    var voidMapLevelSettingMap = (voidMapLevelSetting + "").split(".")[1];
    if (voidMapLevelSettingMap === undefined || (game.global.challengeActive == 'Lead' && !challSQ))
        voidMapLevelSettingMap = 90;
    if (voidMapLevelSettingMap.length == 1) voidMapLevelSettingMap += "0";
    needToVoid = (voidMapLevelSetting > 0 && game.global.totalVoidMaps > 0 && game.global.lastClearedCell + 1 >= voidMapLevelSettingMap &&
        (game.global.world == voidMapLevelSettingZone || (game.global.world >= voidMapLevelSettingZone && getPageSetting('RunNewVoidsUntilNew') != 0 &&
            (getPageSetting('RunNewVoidsUntilNew') == -1 || game.global.world <= (Number(getPageSetting('RunNewVoidsUntilNew')) + Number(voidMapLevelSettingZone))))));
    var voidArrayDone = [];
    if (game.global.challengeActive != "Daily" && getPageSetting('onlystackedvoids') == true) {
        for (var mapz in game.global.mapsOwnedArray) {
            var theMapz = game.global.mapsOwnedArray[mapz];
            if (theMapz.location == 'Void' && theMapz.stacked > 0) {
                voidArrayDone.push(theMapz);
            }
        }
    }
    if ((game.global.totalVoidMaps == 0) || (!needToVoid) || (game.global.challengeActive != "Daily" && game.global.totalVoidMaps > 0 && getPageSetting('onlystackedvoids') == true && voidArrayDone.length < 1))
        doVoids = false;

    //Prestige
    if ((getPageSetting('ForcePresZ') >= 0) && ((game.global.world + extraMapLevels) >= getPageSetting('ForcePresZ'))) {
        const prestigeList = ['Supershield', 'Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest', 'Bootboost', 'Hellishmet', 'Pantastic', 'Smoldershoulder', 'Bestplate', 'GambesOP'];
        needPrestige = prestigeList.some(prestige => game.mapUnlocks[prestige].last <= (game.global.world + extraMapLevels) - 5);
    } else
        needPrestige = prestige != "Off" && game.mapUnlocks[prestige] && game.mapUnlocks[prestige].last <= (game.global.world + extraMapLevels) - 5 && game.global.challengeActive != "Frugal";

    skippedPrestige = false;
    if (needPrestige && (getPageSetting('PrestigeSkip1_2') == 1 || getPageSetting('PrestigeSkip1_2') == 2)) {
        var prestigeList = ['Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest', 'Bootboost', 'Hellishmet', 'Pantastic', 'Smoldershoulder', 'Bestplate', 'GambesOP'];
        var numUnbought = 0;
        for (var i in prestigeList) {
            var p = prestigeList[i];
            if (game.upgrades[p].allowed - game.upgrades[p].done > 0)
                numUnbought++;
        }
        if (numUnbought >= customVars.SkipNumUnboughtPrestiges) {
            needPrestige = false;
            skippedPrestige = true;
        }
    }

    if ((needPrestige || skippedPrestige) && (getPageSetting('PrestigeSkip1_2') == 1 || getPageSetting('PrestigeSkip1_2') == 3)) {
        const prestigeList = ['Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest'];
        const numLeft = prestigeList.filter(prestige => game.mapUnlocks[prestige].last <= (game.global.world + extraMapLevels) - 5);
        const shouldSkip = numLeft <= customVars.UnearnedPrestigesRequired;
        if (shouldSkip != skippedPrestige) {
            needPrestige = !needPrestige;
            skippedPrestige = !skippedPrestige;
        }
    }

    //Calc
    var ourBaseDamage = calcOurDmg("avg", false, true);
    var enemyDamage = calcBadGuyDmg(null, getEnemyMaxAttack(game.global.world + 1, 50, 'Snimp', 1.0), true, true);
    var enemyHealth = calcEnemyHealth();

    if (getPageSetting('DisableFarm') >= 1) {
        shouldFarm = (calcHDratio() >= getPageSetting('DisableFarm'));
        if (game.options.menu.repeatUntil.enabled == 1 && shouldFarm)
            toggleSetting('repeatUntil');
    }
    if (game.global.spireActive) {
        enemyDamage = calcSpire(99, game.global.gridArray[99].name, 'attack');
    }
    highDamageShield();
    if (getPageSetting('loomswap') > 0 && game.global.challengeActive != "Daily" && game.global.ShieldEquipped.name != getPageSetting('highdmg'))
        ourBaseDamage *= trimpAA;
    if (getPageSetting('dloomswap') > 0 && game.global.challengeActive == "Daily" && game.global.ShieldEquipped.name != getPageSetting('dhighdmg'))
        ourBaseDamage *= trimpAA;
    var mapbonusmulti = 1 + (0.20 * game.global.mapBonus);
    var ourBaseDamage2 = ourBaseDamage;
    ourBaseDamage2 /= mapbonusmulti;
    var pierceMod = (game.global.brokenPlanet) ? getPierceAmt() : 0;
    const FORMATION_MOD_1 = game.upgrades.Dominance.done ? 2 : 1;
    enoughHealth = (calcOurHealth() / FORMATION_MOD_1 > customVars.numHitsSurvived * (enemyDamage - calcOurBlock() / FORMATION_MOD_1 > 0 ? enemyDamage - calcOurBlock() / FORMATION_MOD_1 : enemyDamage * pierceMod));
    enoughDamage = (ourBaseDamage * mapenoughdamagecutoff > enemyHealth);
    updateAutoMapsStatus();

    //Farming
    var selectedMap = "world";
    var shouldFarmLowerZone = false;
    shouldDoMaps = false;
    if (ourBaseDamage > 0) {
        shouldDoMaps = (!enoughDamage || shouldFarm || scryerStuck);
    }
    var shouldDoHealthMaps = false;
    if (game.global.mapBonus >= getPageSetting('MaxMapBonuslimit') && !shouldFarm)
        shouldDoMaps = false;
    else if (game.global.mapBonus >= getPageSetting('MaxMapBonuslimit') && shouldFarm)
        shouldFarmLowerZone = getPageSetting('LowerFarmingZone');
    else if (game.global.mapBonus < getPageSetting('MaxMapBonushealth') && !enoughHealth && !shouldDoMaps && !needPrestige) {
        shouldDoMaps = true;
        shouldDoHealthMaps = true;
    }
    var restartVoidMap = false;
    if (game.global.challengeActive == 'Nom' && getPageSetting('FarmWhenNomStacks7')) {
        if (game.global.gridArray[99].nomStacks > customVars.NomFarmStacksCutoff[0]) {
            if (game.global.mapBonus != getPageSetting('MaxMapBonuslimit'))
                shouldDoMaps = true;
        }
        if (game.global.gridArray[99].nomStacks == customVars.NomFarmStacksCutoff[1]) {
            shouldFarm = (calcHDratio() > customVars.NomfarmingCutoff);
            shouldDoMaps = true;
        }
        if (!game.global.mapsActive && game.global.gridArray[game.global.lastClearedCell + 1].nomStacks >= customVars.NomFarmStacksCutoff[2]) {
            shouldFarm = (calcHDratio() > customVars.NomfarmingCutoff);
            shouldDoMaps = true;
        }
        if (game.global.mapsActive && game.global.mapGridArray[game.global.lastClearedMapCell + 1].nomStacks >= customVars.NomFarmStacksCutoff[2]) {
            shouldFarm = (calcHDratio() > customVars.NomfarmingCutoff);
            shouldDoMaps = true;
            restartVoidMap = true;
        }
    }

    //Prestige
    if (shouldFarm && !needPrestige) {
        var capped = areWeAttackLevelCapped();
        var prestigeitemsleft;
        if (game.global.mapsActive) {
            prestigeitemsleft = addSpecials(true, true, getCurrentMapObject());
        } else if (lastMapWeWereIn) {
            prestigeitemsleft = addSpecials(true, true, lastMapWeWereIn);
        }
        const prestigeList = ['Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest'];
        var numUnbought = 0;
        for (var i = 0, len = prestigeList.length; i < len; i++) {
            var p = prestigeList[i];
            if (game.upgrades[p].allowed - game.upgrades[p].done > 0)
                numUnbought++;
        }
        if (capped && prestigeitemsleft == 0 && numUnbought == 0) {
            shouldFarm = false;
            if (game.global.mapBonus >= getPageSetting('MaxMapBonuslimit') && !shouldFarm)
                shouldDoMaps = false;
        }
    }

    //Spire
    var shouldDoSpireMaps = false;
    preSpireFarming = (isActiveSpireAT() || disActiveSpireAT()) && (spireTime = (new Date().getTime() - game.global.zoneStarted) / 1000 / 60) < getPageSetting('MinutestoFarmBeforeSpire');
    spireMapBonusFarming = getPageSetting('MaxStacksForSpire') && (isActiveSpireAT() || disActiveSpireAT()) && game.global.mapBonus < 10;
    if (preSpireFarming || spireMapBonusFarming) {
        shouldDoMaps = true;
        shouldDoSpireMaps = true;
    }

    //Raiding
    prestigeRaiding = false;
    dprestigeRaiding = false;
    praidHard = false;
    BWRaiding = false;
    if ((getPageSetting('PraidHarder') == true && getPageSetting('Praidingzone').length > 0 && game.global.challengeActive != "Daily") || (getPageSetting('dPraidHarder') == true && getPageSetting('dPraidingzone').length > 0 && game.global.challengeActive == "Daily"))
        praidHard = true;
    if (!praidHard && getPageSetting('Praidingzone').length && game.global.challengeActive != "Daily")
        prestigeRaiding = true;
    if (!praidhard && getPageSetting('dPraidingzone').length && game.global.challengeActive == "Daily")
        dprestigeRaiding = true;
    if ((getPageSetting('BWraid') == true && game.global.challengeActive != "Daily") || (getPageSetting('Dailybwraid') == true && game.global.challengeActive == "Daily"))
        BWRaiding = true;

    //Map Bonus
    var maxMapBonusZ = getPageSetting('MaxMapBonusAfterZone');
    doMaxMapBonus = (maxMapBonusZ >= 0 && game.global.mapBonus < getPageSetting("MaxMapBonuslimit") && game.global.world >= maxMapBonusZ);
    if (doMaxMapBonus)
        shouldDoMaps = true;

    //Maps
    vanillaMapatZone = (game.options.menu.mapAtZone.enabled && game.global.canMapAtZone && !isActiveSpireAT() && !disActiveSpireAT());
    if (vanillaMapatZone)
        for (var x = 0; x < game.options.menu.mapAtZone.setZone.length; x++) {
            if (game.global.world == game.options.menu.mapAtZone.setZone[x])
                shouldDoMaps = true;
        }
    var siphlvl = shouldFarmLowerZone ? game.global.world - 10 : game.global.world - game.portal.Siphonology.level;
    var maxlvl = game.talents.mapLoot.purchased ? game.global.world - 1 : game.global.world;
    maxlvl += extraMapLevels;
    if (getPageSetting('DynamicSiphonology') || shouldFarmLowerZone) {
        for (siphlvl; siphlvl < maxlvl; siphlvl++) {
            var maphp = getEnemyMaxHealth(siphlvl) * 1.1;
            var cpthlth = getCorruptScale("health") / 2;
            if (mutations.Magma.active())
                maphp *= cpthlth;
            var mapdmg = ourBaseDamage2;
            if (game.upgrades.Dominance.done)
                mapdmg *= 4;
            if (mapdmg < maphp) {
                break;
            }
        }
    }
    var obj = {};
    var siphonMap = -1;
    for (var map in game.global.mapsOwnedArray) {
        if (!game.global.mapsOwnedArray[map].noRecycle) {
            obj[map] = game.global.mapsOwnedArray[map].level;
            if (game.global.mapsOwnedArray[map].level == siphlvl)
                siphonMap = map;
        }
    }
    var keysSorted = Object.keys(obj).sort(function(a, b) {
        return obj[b] - obj[a];
    });
    var highestMap;
    var lowestMap;
    if (keysSorted[0]) {
        highestMap = keysSorted[0];
        lowestMap = keysSorted[keysSorted.length - 1];
    } else
        selectedMap = "create";

    //Uniques
    var runUniques = (getPageSetting('AutoMaps') == 1);
    if (runUniques) {
        for (var map in game.global.mapsOwnedArray) {
            var theMap = game.global.mapsOwnedArray[map];
            if (theMap.noRecycle) {
                if (theMap.name == 'The Wall' && game.upgrades.Bounty.allowed == 0 && !game.talents.bounty.purchased) {
                    var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                    if (game.global.world < 15 + theMapDifficulty) continue;
                    selectedMap = theMap.id;
                    break;
                }
                if (theMap.name == 'Dimension of Anger' && document.getElementById("portalBtn").style.display == "none" && !game.talents.portal.purchased) {
                    var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                    if (game.global.world < 20 + theMapDifficulty) continue;
                    selectedMap = theMap.id;
                    break;
                }
                var runningC2 = game.global.runningChallengeSquared;
                if (theMap.name == 'The Block' && !game.upgrades.Shieldblock.allowed && ((game.global.challengeActive == "Scientist" || game.global.challengeActive == "Trimp") && !runningC2 || getPageSetting('BuyShieldblock'))) {
                    var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                    if (game.global.world < 11 + theMapDifficulty) continue;
                    selectedMap = theMap.id;
                    break;
                }
                var treasure = getPageSetting('TrimpleZ');
                if (theMap.name == 'Trimple Of Doom' && (!runningC2 && game.mapUnlocks.AncientTreasure.canRunOnce && game.global.world >= treasure)) {
                    var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                    if ((game.global.world < 33 + theMapDifficulty) || treasure > -33 && treasure < 33) continue;
                    selectedMap = theMap.id;
                    if (treasure < 0)
                        setPageSetting('TrimpleZ', 0);
                    break;
                }
                if (!runningC2) {
                    if (theMap.name == 'The Prison' && (game.global.challengeActive == "Electricity" || game.global.challengeActive == "Mapocalypse")) {
                        var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                        if (game.global.world < 80 + theMapDifficulty) continue;
                        selectedMap = theMap.id;
                        break;
                    }
                    if (theMap.name == 'Bionic Wonderland' && game.global.challengeActive == "Crushed") {
                        var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                        if (game.global.world < 125 + theMapDifficulty) continue;
                        selectedMap = theMap.id;
                        break;
                    }
                }
            }
        }
    }

    //Voids
    if (needToVoid) {
        var voidArray = [];
        var prefixlist = {
            'Deadly': 10,
            'Heinous': 11,
            'Poisonous': 20,
            'Destructive': 30
        };
        var prefixkeys = Object.keys(prefixlist);
        var suffixlist = {
            'Descent': 7.077,
            'Void': 8.822,
            'Nightmare': 9.436,
            'Pit': 10.6
        };
        var suffixkeys = Object.keys(suffixlist);

        if (game.global.challengeActive != "Daily" && getPageSetting('onlystackedvoids') == true) {
            for (var map in game.global.mapsOwnedArray) {
                var theMap = game.global.mapsOwnedArray[map];
                if (theMap.location == 'Void' && theMap.stacked > 0) {
                    for (var pre in prefixkeys) {
                        if (theMap.name.includes(prefixkeys[pre]))
                            theMap.sortByDiff = 1 * prefixlist[prefixkeys[pre]];
                    }
                    for (var suf in suffixkeys) {
                        if (theMap.name.includes(suffixkeys[suf]))
                            theMap.sortByDiff += 1 * suffixlist[suffixkeys[suf]];
                    }
                    voidArray.push(theMap);
                }
            }
        } else {
            for (var map in game.global.mapsOwnedArray) {
                var theMap = game.global.mapsOwnedArray[map];
                if (theMap.location == 'Void') {
                    for (var pre in prefixkeys) {
                        if (theMap.name.includes(prefixkeys[pre]))
                            theMap.sortByDiff = 1 * prefixlist[prefixkeys[pre]];
                    }
                    for (var suf in suffixkeys) {
                        if (theMap.name.includes(suffixkeys[suf]))
                            theMap.sortByDiff += 1 * suffixlist[suffixkeys[suf]];
                    }
                    voidArray.push(theMap);
                }
            }
        }

        var voidArraySorted = voidArray.sort(function(a, b) {
            return a.sortByDiff - b.sortByDiff;
        });
        for (var map in voidArraySorted) {
            var theMap = voidArraySorted[map];
            doVoids = true;
            var eAttack = getEnemyMaxAttack(game.global.world, theMap.size, 'Voidsnimp', theMap.difficulty);
            if (game.global.world >= 181 || (game.global.challengeActive == "Corrupted" && game.global.world >= 60))
                eAttack *= (getCorruptScale("attack") / 2).toFixed(1);
            if (game.global.challengeActive == 'Balance') {
                eAttack *= 2;
            }
            if (game.global.challengeActive == 'Toxicity') {
                eAttack *= 5;
            }
            if (getPageSetting('DisableFarm') <= 0)
                shouldFarm = shouldFarm || false;
            if (!restartVoidMap)
                selectedMap = theMap.id;
            if (game.global.mapsActive && getCurrentMapObject().location == "Void" && game.global.challengeActive == "Nom" && getPageSetting('FarmWhenNomStacks7')) {
                if (game.global.mapGridArray[theMap.size - 1].nomStacks >= customVars.NomFarmStacksCutoff[2]) {
                    mapsClicked(true);
                }
            }
            break;
        }
    }

    //AutoMaps
    if (praidHard) {
        var pMap;
        var maxPlusZones;
        var mapModifiers = ["p", "fa", "0"];
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
        } else {
            praidSetting = 'Praidingzone';
            maxPraidZSetting = 'MaxPraidZone';
            isBWRaidZ = getPageSetting('BWraidingz').includes(game.global.world) && getPageSetting('BWraid');
            farmFragments = getPageSetting('PraidFarmFragsZ').includes(game.global.world);
            praidBeforeFarm = getPageSetting('PraidBeforeFarmZ').includes(game.global.world);
        }

        pRaidIndex = getPageSetting(praidSetting).indexOf(game.global.world);
        if (pRaidIndex == -1 || typeof(getPageSetting(maxPraidZSetting)[pRaidIndex]) === "undefined") maxPlusZones = plusMapToRun(game.global.world);
        else maxPlusZones = getPageSetting(maxPraidZSetting)[pRaidIndex] - game.global.world;

        // Check we have a valid number for maxPlusZones
        maxPlusZones = maxPlusZones > 10 ? 10 : (maxPlusZones < 0 ? 10 : maxPlusZones);

        // Work out the max number of +map zones it's worth farming for prestige.
        if ((game.global.world + maxPlusZones) % 10 > 5)
            maxPlusZones = Math.max(maxPlusZones + (5 - (game.global.world + maxPlusZones) % 10), 0);
        else if ((game.global.world + maxPlusZones) % 10 == 0)
            maxPlusZones = Math.min(5, maxPlusZones);

        // If we have any Praiding zones defined...
        if (getPageSetting(praidSetting).length) {
            if (getPageSetting(praidSetting).includes(game.global.world) && !prestraid && !failpraid && !shouldFarmFrags) {
                debug('Beginning Praiding');
                // Initialise shouldFarmFrags to false
                shouldFarmFrags = false;
                // Mark that we are prestige raiding
                prestraidon = true;
                // Get into the preMaps screen
                if (!game.global.preMapsActive && !game.global.mapsActive) {
                    mapsClicked();
                    if (!game.global.preMapsActive) {
                        mapsClicked();
                    }
                }
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
                    pMap = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
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
                // If we can't afford a map, and can't farm fragments, fail
                else if (!farmFragments) {
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
                    return;
                }
            }
        }
        if (farmFragments && shouldFarmFrags && game.global.preMapsActive && prestraid && !fMap) {
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
            game.options.menu.repeatUntil.enabled = 0;
            toggleSetting("repeatUntil", null, false, true);
            if (updateMapCost(true) <= game.resources.fragments.owned) {
                debug("Buying perfect sliders fragment farming map");
                buyMap();
                fMap = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
                selectMap(fMap);
                game.global.repeatMap = true;
                runMap();
                repeatClicked(true);
            } else {
                document.getElementById('advPerfectCheckbox').checked = false;
                if (updateMapCost(true) <= game.resources.fragments.owned) {
                    debug("Buying imperfect sliders fragment farming map");
                    buyMap();
                    fMap = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
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
                bwraided = false;
                failbwraid = false;
                dbwraided = false;
                dfailbwraid = false;
            }
        }

        if (!getPageSetting(praidSetting).includes(game.global.world)) {
            prestraid = false;
            failpraid = false;
            prestraidon = false;
            shouldFarmFrags = false;
            praidDone = false;
        }
    } else if ((prestigeRaiding || dprestigeRaiding) && !failpraid && !prestraid) {
        var pMap;
        var praidZone;
        if (game.global.challengeActive == "Daily") {
            praidZone = getPageSetting('dPraidingzone');
        } else {
            praidZone = getPageSetting('Praidingzone');
        }
        if (praidZone.length) {
            if (praidZone.includes(game.global.world)) {
                debug('World Zone matches a Praiding Zone!');

                if (!game.global.preMapsActive && !game.global.mapsActive) {
                    mapsClicked();
                    if (!game.global.preMapsActive) {
                        mapsClicked();
                    }
                    debug("Beginning Prestige Raiding...");
                }
                if (game.options.menu.repeatUntil.enabled != 2) {
                    game.options.menu.repeatUntil.enabled = 2;
                }
                if (game.global.preMapsActive) {
                    plusPres();
                    if ((updateMapCost(true) <= game.resources.fragments.owned)) {
                        buyMap();
                        failpraid = false;
                        mapbought = true;
                    } else if ((updateMapCost(true) > game.resources.fragments.owned)) {
                        if (!prestraid) {
                            failpraid = true;
                            prestigeRaiding = false;
                            mapbought = false;
                            praidDone = true;
                            debug("Failed to prestige raid. Looks like you can't afford to..");
                        }
                        return;
                    }
                }
                if (mapbought == true) {
                    pMap = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
                    selectMap(pMap);
                    runMap();
                }
                if (!prestraid && !failpraid && !game.global.repeatMap) {
                    repeatClicked();
                }
                prestraid = true;
                failpraid = false;
                mapbought = false;
            }
        }

        if (game.global.preMapsActive && prestraid && !failpraid && prestraidon) {
            praidDone = true;
            prestraidon = false;
            debug("Prestige raiding successful! - recycling Praid map");
            recycleMap(getMapIndex(pMap));
        }
        if (praidZone.every(isBelowThreshold)) {
            prestraid = false;
            failpraid = false;
            prestraidon = false;
            mapbought = false;
            praidDone = false;
        }
    } else if (BWRaiding && !bwraided && !failbwraid && getPageSetting(bwraidSetting) == true) {
        var bwraidZ;
        var bwraidSetting;
        var bwraidMax;
        var isPraidZ;
        var ispraidon;
        var isBWRaidZ;
        var targetBW;
        var bwIndex;

        if (game.global.challengeActive == "Daily") {
            bwraidZ = 'dBWraidingz';
            bwraidSetting = 'Dailybwraid';
            bwraidMax = 'dBWraidingmax';
            isPraidZ = getPageSetting('dPraidingzone').includes(game.global.world);
            ispraidon = dprestraidon;
        } else {
            bwraidZ = 'BWraidingz';
            bwraidSetting = 'BWraid';
            bwraidMax = 'BWraidingmax';
            isPraidZ = getPageSetting('Praidingzone').includes(game.global.world);
            ispraidon = prestraidon;
        }

        isBWRaidZ = getPageSetting(bwraidZ).includes(game.global.world);
        bwIndex = getPageSetting(bwraidZ).indexOf(game.global.world);
        if (bwIndex == -1 || typeof(getPageSetting(bwraidMax)[bwIndex]) === "undefined") targetBW = -1;
        else targetBW = getPageSetting(bwraidMax)[bwIndex];

        if (isBWRaidZ) {

            while (!game.global.preMapsActive && !bwraidon) mapsClicked();

            if (game.options.menu.repeatUntil.enabled != 2 && !bwraided && !failbwraid) {
                game.options.menu.repeatUntil.enabled = 2;
            }

            if (game.global.preMapsActive && !bwraided && !failbwraid && findLastBionic()) {
                selectMap(findLastBionic().id);
                failbwraid = false;
                debug("Beginning BW Raiding...");
            } else if (game.global.preMapsActive && !bwraided && !failbwraid) {
                if (isBWRaidZ && !bwraided) {
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
        }

        if (!isBWRaidZ) {
            bwraided = false;
            failbwraid = false;
            bwraidon = false;
        }
    } else if (shouldDoMaps || doVoids || needPrestige) {
        if (selectedMap == "world") {
            if (preSpireFarming) {
                var spiremaplvl = (game.talents.mapLoot.purchased && MODULES["maps"].SpireFarm199Maps) ? game.global.world - 1 : game.global.world;
                selectedMap = "create";
                for (i = 0; i < keysSorted.length; i++) {
                    if (game.global.mapsOwnedArray[keysSorted[i]].level >= spiremaplvl &&
                        game.global.mapsOwnedArray[keysSorted[i]].location == ((customVars.preferGardens && game.global.decayDone) ? 'Plentiful' : 'Mountain')) {
                        selectedMap = game.global.mapsOwnedArray[keysSorted[i]].id;
                        break;
                    }
                }
            } else if (needPrestige || (extraMapLevels > 0)) {
                if ((game.global.world + extraMapLevels) <= game.global.mapsOwnedArray[highestMap].level)
                    selectedMap = game.global.mapsOwnedArray[highestMap].id;
                else
                    selectedMap = "create";
            } else if (siphonMap != -1)
                selectedMap = game.global.mapsOwnedArray[siphonMap].id;
            else
                selectedMap = "create";
        }
    }
    if ((game.global.challengeActive == 'Lead' && !challSQ) && !doVoids && (game.global.world % 2 == 0 || game.global.lastClearedCell < customVars.shouldFarmCell)) {
        if (game.global.preMapsActive)
            mapsClicked();
        return;
    }
    if (!game.global.preMapsActive && game.global.mapsActive) {
        var doDefaultMapBonus = game.global.mapBonus < getPageSetting('MaxMapBonuslimit') - 1;
        if (selectedMap == game.global.currentMapId && (!getCurrentMapObject().noRecycle && (doDefaultMapBonus || vanillaMapatZone || doMaxMapBonus || shouldFarm || needPrestige || shouldDoSpireMaps))) {
            var targetPrestige = autoTrimpSettings.Prestige.selected;
            if (!game.global.repeatMap) {
                repeatClicked();
            }
            if (!shouldDoMaps && (game.global.mapGridArray[game.global.mapGridArray.length - 1].special == targetPrestige && game.mapUnlocks[targetPrestige].last >= (game.global.world + extraMapLevels - 9))) {
                repeatClicked();
            }
            if (shouldDoHealthMaps && game.global.mapBonus >= getPageSetting('MaxMapBonushealth') - 1) {
                repeatClicked();
                shouldDoHealthMaps = false;
            }
            if (doMaxMapBonus && game.global.mapBonus >= getPageSetting('MaxMapBonuslimit') - 1) {
                repeatClicked();
                doMaxMapBonus = false;
            }
        } else {
            if (game.global.repeatMap) {
                repeatClicked();
            }
            if (restartVoidMap) {
                mapsClicked(true);
            }
        }
    } else if (!game.global.preMapsActive && !game.global.mapsActive) {
        if (selectedMap != "world") {
            if (!game.global.switchToMaps) {
                mapsClicked();
            }
            if ((!getPageSetting('PowerSaving') || (getPageSetting('PowerSaving') == 2) && doVoids) && game.global.switchToMaps &&
                (needPrestige || doVoids ||
                    ((game.global.challengeActive == 'Lead' && !challSQ) && game.global.world % 2 == 1) ||
                    (!enoughDamage && enoughHealth && game.global.lastClearedCell < 9) ||
                    (shouldFarm && game.global.lastClearedCell >= customVars.shouldFarmCell) ||
                    (scryerStuck)) &&
                (
                    (game.resources.trimps.realMax() <= game.resources.trimps.owned + 1) ||
                    ((game.global.challengeActive == 'Lead' && !challSQ) && game.global.lastClearedCell > 93) ||
                    (doVoids && game.global.lastClearedCell > 93)
                )
            ) {
                if (scryerStuck) {
                    debug("Got perma-stuck on cell " + (game.global.lastClearedCell + 2) + " during scryer stance. Are your scryer settings correct? Entering map to farm to fix it.");
                }
                mapsClicked();
            }
        }
    } else if (game.global.preMapsActive) {
        if (selectedMap == "world") {
            mapsClicked();
        } else if (selectedMap == "create") {
            var $mapLevelInput = document.getElementById("mapLevelInput");
            $mapLevelInput.value = needPrestige ? game.global.world : siphlvl;
            if (preSpireFarming && MODULES["maps"].SpireFarm199Maps)
                $mapLevelInput.value = game.talents.mapLoot.purchased ? game.global.world - 1 : game.global.world;
            var decrement;
            var tier;
            var useGardens = (customVars.preferGardens && game.global.decayDone);
            if (game.global.world >= customVars.MapTierZone[0]) {
                tier = customVars.MapTier0Sliders;
                decrement = [];
            } else if (game.global.world >= customVars.MapTierZone[1]) {
                tier = customVars.MapTier1Sliders;
                decrement = ['loot'];
            } else if (game.global.world >= customVars.MapTierZone[2]) {
                tier = customVars.MapTier2Sliders;
                decrement = ['loot'];
            } else {
                tier = customVars.MapTier3Sliders;
                decrement = ['diff', 'loot'];
            }
            sizeAdvMapsRange.value = tier[0];
            adjustMap('size', tier[0]);
            difficultyAdvMapsRange.value = tier[1];
            adjustMap('difficulty', tier[1]);
            lootAdvMapsRange.value = tier[2];
            adjustMap('loot', tier[2]);
            biomeAdvMapsSelect.value = useGardens ? "Plentiful" : tier[3];
            updateMapCost();
            if (shouldFarm || !enoughDamage || !enoughHealth || game.global.challengeActive == 'Metal') {
                biomeAdvMapsSelect.value = useGardens ? "Plentiful" : "Mountain";
                updateMapCost();
            }
            if (updateMapCost(true) > game.resources.fragments.owned) {
                if (needPrestige && !enoughDamage) decrement.push('diff');
                if (shouldFarm) decrement.push('size');
            }
            while (decrement.indexOf('loot') > -1 && lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                lootAdvMapsRange.value -= 1;
            }
            while (decrement.indexOf('diff') > -1 && difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                difficultyAdvMapsRange.value -= 1;
            }
            while (decrement.indexOf('size') > -1 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                sizeAdvMapsRange.value -= 1;
            }
            while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                lootAdvMapsRange.value -= 1;
            }
            while (difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                difficultyAdvMapsRange.value -= 1;
            }
            while (sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                sizeAdvMapsRange.value -= 1;
            }
            if (getPageSetting('AdvMapSpecialModifier'))
                testMapSpecialModController();
            var maplvlpicked = parseInt($mapLevelInput.value) + (getPageSetting('AdvMapSpecialModifier') ? getExtraMapLevels() : 0);
            if (updateMapCost(true) > game.resources.fragments.owned) {
                selectMap(game.global.mapsOwnedArray[highestMap].id);
                debug("Can't afford the map we designed, #" + maplvlpicked, "maps", '*crying2');
                debug("...selected our highest map instead # " + game.global.mapsOwnedArray[highestMap].id + " Level: " + game.global.mapsOwnedArray[highestMap].level, "maps", '*happy2');
                runMap();
                lastMapWeWereIn = getCurrentMapObject();
            } else {
                debug("Buying a Map, level: #" + maplvlpicked, "maps", 'th-large');
                var result = buyMap();
                if (result == -2) {
                    debug("Too many maps, recycling now: ", "maps", 'th-large');
                    recycleBelow(true);
                    debug("Retrying, Buying a Map, level: #" + maplvlpicked, "maps", 'th-large');
                    result = buyMap();
                    if (result == -2) {
                        recycleMap(lowestMap);
                        result = buyMap();
                        if (result == -2)
                            debug("AutoMaps unable to recycle to buy map!");
                        else
                            debug("Retrying map buy after recycling lowest level map");
                    }
                }
            }
        } else {
            selectMap(selectedMap);
            var themapobj = game.global.mapsOwnedArray[getMapIndex(selectedMap)];
            var levelText = " Level: " + themapobj.level;
            var voidorLevelText = themapobj.location == "Void" ? " Void: " : levelText;
            debug("Running selected " + selectedMap + voidorLevelText + " Name: " + themapobj.name, "maps", 'th-large');
            runMap();
            lastMapWeWereIn = getCurrentMapObject();
        }
    }
}

function updateAutoMapsStatus(a){var b,c=getPageSetting('MinutestoFarmBeforeSpire');if(0==getPageSetting('AutoMaps'))b='Off';else if('Mapology'==game.global.challengeActive&&1>game.challenges.Mapology.credits)b='Out of Map Credits';else if(preSpireFarming){var d=Math.floor(60-60*spireTime%60).toFixed(0),e=Math.floor(c-spireTime).toFixed(0),f=c-(spireTime/60).toFixed(2),g=60<=spireTime?f+'h':e+'m:'+(10<=d?d:'0'+d)+'s';b='Farming for Spire '+g+' left'}else spireMapBonusFarming?b='Getting Spire Map Bonus':doMaxMapBonus?b='Max Map Bonus After Zone':game.global.mapsUnlocked?needPrestige&&!doVoids?b='Prestige':doVoids?b='Void Maps: '+game.global.totalVoidMaps+' remaining':needToVoid&&!doVoids&&0<game.global.totalVoidMaps?b='Farming: '+calcHDratio().toFixed(4)+'x':scryerStuck?b='Scryer Got Stuck, Farming':enoughHealth||enoughDamage?enoughDamage?enoughHealth?enoughHealth&&enoughDamage&&(b='Advancing'):b='Want more health':b='Want '+calcHDratio().toFixed(4)+'x &nbspmore damage':b='Want Health & Damage':b='&nbsp;';skippedPrestige&&(b+='<br><b style="font-size:.8em;color:pink;margin-top:0.2vw">Prestige Skipped</b>');var h=100*(game.stats.heliumHour.value()/(game.global.totalHeliumEarned-(game.global.heliumLeftover+game.resources.helium.owned))),i=100*(game.resources.helium.owned/(game.global.totalHeliumEarned-game.resources.helium.owned)),j='He/hr: '+h.toFixed(3)+'%<br>&nbsp;&nbsp;&nbsp;He: '+i.toFixed(3)+'%';return a?[b,h,i]:void(document.getElementById('autoMapStatus').innerHTML=b,document.getElementById('hiderStatus').innerHTML=j)}

MODULES["maps"].advSpecialMapMod_numZones = 3;
var advExtraMapLevels = 0;
function testMapSpecialModController() {
	var a = [];
	if (Object.keys(mapSpecialModifierConfig).forEach(function (o) {
			var p = mapSpecialModifierConfig[o];
			game.global.highestLevelCleared + 1 >= p.unlocksAt && a.push(p.abv.toLowerCase());
		}), !(1 > a.length)) {
		var c = document.getElementById("advSpecialSelect");
		if (c) {
			if (59 <= game.global.highestLevelCleared) {
				if (needPrestige && a.includes("p")) { // Prestiging, so use Prestigious
					c.value = "p";
				}
				else if (shouldFarm || !enoughHealth || preSpireFarming) { // Need better equipment, pick the best modifier for metals (in descdending order: "Large Metal Cache", "Huge Cache", "Small Metal Cache", "Large Cache")
					c.value = a.includes("lmc") ? "lmc" : a.includes("hc") ? "hc" : a.includes("smc") ? "smc" : "lc";
				}
				else c.value = "fa"; // Just farming for map stacks, so use Fast Attacks
				// Only use a modifier we can actually afford
				for (var d = updateMapCost(!0), e = game.resources.fragments.owned, f = 100 * (d / e); 0 < c.selectedIndex && d > e; )
				{
					c.selectedIndex -= 1;
					"0" != c.value && console.log("Could not afford " + mapSpecialModifierConfig[c.value].name);
				}
				var d = updateMapCost(!0),
				e = game.resources.fragments.owned;
				"0" != c.value && debug("Set the map special modifier to: " + mapSpecialModifierConfig[c.value].name + ". Cost: " + (100 * (d / e)).toFixed(2) + "% of your fragments.");
			}
			var g = getSpecialModifierSetting(),
			h = 109 <= game.global.highestLevelCleared,
			i = checkPerfectChecked(),
			j = document.getElementById("advPerfectCheckbox"),
			k = getPageSetting("AdvMapSpecialModifier") ? getExtraMapLevels() : 0,
			l = 209 <= game.global.highestLevelCleared;
			if (l) {
				var m = document.getElementById("advExtraMapLevelselect");
				if (!m)
					return;
				var n = document.getElementById("mapLevelInput").value;
				for (m.selectedIndex = n == game.global.world ? MODULES.maps.advSpecialMapMod_numZones : 0; 0 < m.selectedIndex && updateMapCost(!0) > game.resources.fragments.owned; )
					m.selectedIndex -= 1;
			}
		}
	}
}
function mapTimeEstimater(){var a=lookUpZoneData(game.global.world),b=lookUpZoneData(game.global.world-1);return mapTimeEstimate=a&&b?a.currentTime-b.currentTime:0,mapTimeEstimate}
