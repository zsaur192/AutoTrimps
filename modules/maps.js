MODULES["maps"] = {};
MODULES["maps"].enoughDamageCutoff = 4;
MODULES["maps"].farmingCutoff = getPageSetting('DisableFarm');
MODULES["maps"].numHitsSurvived = 8;
MODULES["maps"].LeadfarmingCutoff = 10;
MODULES["maps"].NomfarmingCutoff = 10;
MODULES["maps"].NomFarmStacksCutoff = [7, 30, 100];
MODULES["maps"].MapTierZone = [72, 47, 16];
MODULES["maps"].MapTier0Sliders = [9, 9, 9, 'Mountain'];
MODULES["maps"].MapTier1Sliders = [9, 9, 9, 'Depths'];
MODULES["maps"].MapTier2Sliders = [9, 9, 9, 'Random'];
MODULES["maps"].MapTier3Sliders = [9, 9, 9, 'Random'];
MODULES["maps"].preferGardens = !getPageSetting('PreferMetal');
MODULES["maps"].maxMapBonus = 10;
MODULES["maps"].wantHealthMapBonus = 10;
MODULES["maps"].SpireFarm199Maps = true;
MODULES["maps"].watchChallengeMaps = [15, 25, 35, 50];
MODULES["maps"].shouldFarmCell = 59;
MODULES["maps"].SkipNumUnboughtPrestiges = 2;
MODULES["maps"].UnearnedPrestigesRequired = 2;
MODULES["maps"].maxMapBonusAfterZ = MODULES["maps"].maxMapBonus;
var stackingTox = false;
var doVoids = false;
var needToVoid = false;
var needPrestige = false;
var skippedPrestige = false;
var voidCheckPercent = 0;
var HDratio = 0;
var ourBaseDamage = 0;
var ourBaseDamage2 = 0;
var scryerStuck = false;
var shouldDoMaps = false;
var mapTimeEstimate = 0;
var lastMapWeWereIn = null;
var preSpireFarming = false;
var spireMapBonusFarming = false;
var spireTime = 0;
var doMaxMapBonus = false;
var vanillaMapatZone = false;
var additionalCritMulti = (getPlayerCritChance() > 2) ? 25 : 5;

function autoMap() {
    var customVars = MODULES["maps"];
    var prestige = autoTrimpSettings.Prestige.selected;
    if (prestige != "Off" && game.options.menu.mapLoot.enabled != 1) toggleSetting('mapLoot');
    if (game.options.menu.repeatUntil.enabled == 2) toggleSetting('repeatUntil');
    if (game.options.menu.exitTo.enabled != 0) toggleSetting('exitTo');
    if (game.options.menu.repeatVoids.enabled != 0) toggleSetting('repeatVoids');
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
    var challSQ = game.global.runningChallengeSquared;
    var extraMapLevels = getPageSetting('AdvMapSpecialModifier') ? getExtraMapLevels() : 0;
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
    needToVoid = voidMapLevelSetting > 0 && game.global.totalVoidMaps > 0 && game.global.lastClearedCell + 1 >= voidMapLevelSettingMap && (game.global.world == voidMapLevelSettingZone || (game.global.world >= voidMapLevelSettingZone && getPageSetting('RunNewVoidsUntilNew') != 0 && (getPageSetting('RunNewVoidsUntilNew') == -1 || game.global.world <= (getPageSetting('RunNewVoidsUntilNew') + voidMapLevelSettingZone))));
    if (game.global.totalVoidMaps == 0 || !needToVoid)
        doVoids = false;

    if ((getPageSetting('ForcePresZ') >= 0) && ((game.global.world + extraMapLevels) >= getPageSetting('ForcePresZ'))) {
        const prestigeList = ['Supershield', 'Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest', 'Bootboost', 'Hellishmet', 'Pantastic', 'Smoldershoulder', 'Bestplate', 'GambesOP'];
        needPrestige = prestigeList.some(prestige >= game.mapUnlocks[prestige].last <= (game.global.world + extraMapLevels) - 5);
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
        const numLeft = prestigeList.filter(prestige >= game.mapUnlocks[prestige].last <= (game.global.world + extraMapLevels) - 5);
        const shouldSkip = numLeft <= customVars.UnearnedPrestigesRequired;
        if (shouldSkip != skippedPrestige) {
            needPrestige = !needPrestige;
            skippedPrestige = !skippedPrestige;
        }
    }
    var AutoStance = getPageSetting('AutoStance');
    ourBaseDamage = calcOurDmg("avg", false, true);
    if (game.global.mapsActive && getEmpowerment() == "Ice") {
        ourBaseDamage /= 1 + (1 - game.empowerments.Ice.getCombatModifier());
    }
    var mapbonusmulti = 1 + (0.20 * game.global.mapBonus);
    if (game.global.mapsActive) {
        ourBaseDamage2 = ourBaseDamage;
        ourBaseDamage *= mapbonusmulti;
    } else {
        ourBaseDamage2 = ourBaseDamage;
        ourBaseDamage2 /= mapbonusmulti;
    }
    var enemyDamage;
    var enemyHealth;
    if (AutoStance <= 1) {
        enemyDamage = getEnemyMaxAttack(game.global.world + 1, 50, 'Snimp', 1.2);
        enemyDamage = calcDailyAttackMod(enemyDamage);
    } else {
        enemyDamage = calcBadGuyDmg(null, getEnemyMaxAttack(game.global.world + 1, 50, 'Snimp', 1.0), true, true);
    }
    enemyHealth = getEnemyMaxHealth(game.global.world + 1, 50);
    if (game.global.challengeActive == "Toxicity") {
        enemyHealth *= 2;
    }
    var corrupt = game.global.world >= mutations.Corruption.start(true);
    if (getPageSetting('CorruptionCalc') && corrupt) {
        var cptnum = getCorruptedCellsNum();
        var cpthlth = getCorruptScale("health");
        var cptpct = cptnum / 100;
        var hlthprop = cptpct * cpthlth;
        if (hlthprop >= 1)
            enemyHealth *= hlthprop;
        var cptatk = getCorruptScale("attack");
        var atkprop = cptpct * cptatk;
        if (atkprop >= 1)
            enemyDamage *= atkprop;
    }
    if (getPageSetting('DisableFarm') >= 1) {
        shouldFarm = enemyHealth > (ourBaseDamage * getPageSetting('DisableFarm'));
        if (game.options.menu.repeatUntil.enabled == 1) toggleSetting('repeatUntil'); //turn repeat forever on if farming is on.
    }
    if ((game.global.challengeActive == 'Lead' && !challSQ)) {
        ourBaseDamage /= mapbonusmulti;
        if (AutoStance <= 1)
            enemyDamage *= (1 + (game.challenges.Lead.stacks * 0.04));
        enemyHealth *= (1 + (game.challenges.Lead.stacks * 0.04));
        if (game.global.world % 2 == 1 && game.global.world != 179) {
            if (AutoStance <= 1) {
                enemyDamage = getEnemyMaxAttack(game.global.world + 1, 99, 'Snimp', 1.2);
                enemyDamage = calcDailyAttackMod(enemyDamage);
            } else {
                enemyDamage = calcBadGuyDmg(null, getEnemyMaxAttack(game.global.world + 1, 99, 'Snimp', 1.0), true, true);
            }
            enemyDamage *= (1 + (100 * 0.04));
            ourBaseDamage /= 1.5;
        }
        if (game.global.world == 179) {
            ourBaseDamage *= mapbonusmulti;
        }
        if (getPageSetting('DisableFarm') >= 1) {
            shouldFarm = enemyHealth > (ourBaseDamage * customVars.LeadfarmingCutoff);
        }
    }
    var pierceMod = (game.global.brokenPlanet && !game.global.mapsActive) ? getPierceAmt() : 0;
    const FORMATION_MOD_1 = game.upgrades.Dominance.done ? 2 : 1;
    enoughHealth = (baseHealth / FORMATION_MOD_1 > customVars.numHitsSurvived * (enemyDamage - baseBlock / FORMATION_MOD_1 > 0 ? enemyDamage - baseBlock / FORMATION_MOD_1 : enemyDamage * pierceMod));
    enoughDamage = (ourBaseDamage * customVars.enoughDamageCutoff > enemyHealth);
    HDratio = enemyHealth / ourBaseDamage;
    updateAutoMapsStatus();
    var selectedMap = "world";
    var shouldFarmLowerZone = false;
    shouldDoMaps = false;
    if (ourBaseDamage > 0) {
        shouldDoMaps = !enoughDamage || shouldFarm || scryerStuck;
    }
    mapTimeEstimate = mapTimeEstimater();

    var shouldDoHealthMaps = false;
    if (game.global.mapBonus >= customVars.maxMapBonus && !shouldFarm)
        shouldDoMaps = false;
    else if (game.global.mapBonus >= customVars.maxMapBonus && shouldFarm)
        shouldFarmLowerZone = getPageSetting('LowerFarmingZone');
    else if (game.global.mapBonus < customVars.wantHealthMapBonus && !enoughHealth && !shouldDoMaps && !needPrestige) {
        shouldDoMaps = true;
        shouldDoHealthMaps = true;
    }
    var restartVoidMap = false;
    if (game.global.challengeActive == 'Nom' && getPageSetting('FarmWhenNomStacks7')) {
        if (game.global.gridArray[99].nomStacks > customVars.NomFarmStacksCutoff[0]) {
            if (game.global.mapBonus != customVars.maxMapBonus)
                shouldDoMaps = true;
        }
        if (game.global.gridArray[99].nomStacks == customVars.NomFarmStacksCutoff[1]) {
            shouldFarm = (HDratio > customVars.NomfarmingCutoff);
            shouldDoMaps = true;
        }
        if (!game.global.mapsActive && game.global.gridArray[game.global.lastClearedCell + 1].nomStacks >= customVars.NomFarmStacksCutoff[2]) {
            shouldFarm = (HDratio > customVars.NomfarmingCutoff);
            shouldDoMaps = true;
        }
        if (game.global.mapsActive && game.global.mapGridArray[game.global.lastClearedMapCell + 1].nomStacks >= customVars.NomFarmStacksCutoff[2]) {
            shouldFarm = (HDratio > customVars.NomfarmingCutoff);
            shouldDoMaps = true;
            restartVoidMap = true;
        }
    }
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
            if (game.global.mapBonus >= customVars.maxMapBonus && !shouldFarm)
                shouldDoMaps = false;
        }
    }
    if (game.global.challengeActive == 'Toxicity' && game.global.lastClearedCell > 93 && game.challenges.Toxicity.stacks < 1500 && ((getPageSetting('MaxTox') && game.global.world > 59) || needToVoid)) {
        shouldDoMaps = true;
        stackingTox = !(needToVoid && game.challenges.Toxicity.stacks > 1415);
        if (!game.global.mapsActive && !game.global.preMapsActive) {
            mapsClicked();
            mapsClicked();
        }
    } else stackingTox = false;
    var watchmaps = customVars.watchChallengeMaps;
    var shouldDoWatchMaps = false;
    if (game.global.challengeActive == 'Watch' && watchmaps.indexOf(game.global.world) > -1 && game.global.mapBonus < 1) {
        shouldDoMaps = true;
        shouldDoWatchMaps = true;
    }
    var shouldDoSpireMaps = false;
    preSpireFarming = (isActiveSpireAT()) && (spireTime = (new Date().getTime() - game.global.zoneStarted) / 1000 / 60) < getPageSetting('MinutestoFarmBeforeSpire');
    spireMapBonusFarming = getPageSetting('MaxStacksForSpire') && isActiveSpireAT() && game.global.mapBonus < customVars.maxMapBonus;
    if (preSpireFarming || spireMapBonusFarming) {
        shouldDoMaps = true;
        shouldDoSpireMaps = true;
    }
    var maxMapBonusZ = getPageSetting('MaxMapBonusAfterZone');
    doMaxMapBonus = (maxMapBonusZ >= 0 && game.global.mapBonus < customVars.maxMapBonusAfterZ && game.global.world >= maxMapBonusZ);
    if (doMaxMapBonus)
        shouldDoMaps = true;
    vanillaMapatZone = (game.options.menu.mapAtZone.enabled && game.global.canMapAtZone && !isActiveSpireAT());
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
            if (game.upgrades.Dominance.done && !getPageSetting('ScryerUseinMaps2'))
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
                var dont = game.global.runningChallengeSquared;
                if (theMap.name == 'The Block' && !game.upgrades.Shieldblock.allowed && ((game.global.challengeActive == "Scientist" || game.global.challengeActive == "Trimp") && !dont || getPageSetting('BuyShieldblock'))) {
                    var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                    if (game.global.world < 11 + theMapDifficulty) continue;
                    selectedMap = theMap.id;
                    break;
                }
                var treasure = getPageSetting('TrimpleZ');
                if (theMap.name == 'Trimple Of Doom' && (!dont && (game.global.challengeActive == "Meditate" || game.global.challengeActive == "Trapper") && game.mapUnlocks.AncientTreasure.canRunOnce && game.global.world >= treasure)) {
                    var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                    if ((game.global.world < 33 + theMapDifficulty) || treasure > -33 && treasure < 33) continue;
                    selectedMap = theMap.id;
                    if (treasure < 0)
                        setPageSetting('TrimpleZ', 0);
                    break;
                }
                if (!dont) {
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
                if (getPageSetting('RunBionicBeforeSpire') && (game.global.world == 200) && theMap.name.includes('Bionic Wonderland')) {
                    var bionicnumber = 1 + ((theMap.level - 125) / 15);
                    if (bionicnumber == game.global.bionicOwned && bionicnumber < 6) {
                        selectedMap = theMap.id;
                        break;
                    }
                    if (shouldDoSpireMaps && theMap.name == 'Bionic Wonderland VI') {
                        selectedMap = theMap.id;
                        break;
                    }
                }
            }
        }
    }
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
        var voidArraySorted = voidArray.sort(function(a, b) {
            return a.sortByDiff - b.sortByDiff;
        });
        for (var map in voidArraySorted) {
            var theMap = voidArraySorted[map];
            if (game.global.challengeActive == 'Toxicity' && game.challenges.Toxicity.stacks < (1500 - theMap.size)) break;
            doVoids = true;
            var eAttack = getEnemyMaxAttack(game.global.world, theMap.size, 'Voidsnimp', theMap.difficulty);
            if (game.global.world >= 181 || (game.global.challengeActive == "Corrupted" && game.global.world >= 60))
                eAttack *= (getCorruptScale("attack") / 2).toFixed(1);
            var ourHealth = baseHealth;
            if (game.global.challengeActive == 'Balance') {
                var stacks = game.challenges.Balance.balanceStacks ? (game.challenges.Balance.balanceStacks > theMap.size) ? theMap.size : game.challenges.Balance.balanceStacks : false;
                eAttack *= 2;
                if (stacks) {
                    for (i = 0; i < stacks; i++) {
                        ourHealth *= 1.01;
                    }
                }
            }
            if (game.global.challengeActive == 'Toxicity') eAttack *= 5;
            var diff = parseInt(getPageSetting('VoidCheck')) > 0 ? parseInt(getPageSetting('VoidCheck')) : 2;
            var ourBlock = getBattleStats("block", true);
            if (ourHealth / diff < eAttack - ourBlock) {
                shouldFarm = true;
                voidCheckPercent = Math.round((ourHealth / diff) / (eAttack - ourBlock) * 100);
                abandonVoidMap();
                break;
            } else {
                voidCheckPercent = 0;
                if (getPageSetting('DisableFarm') < 1)
                    shouldFarm = shouldFarm || false;
            }
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
    if (shouldDoMaps || doVoids || needPrestige) {
        if (selectedMap == "world") {
            if (preSpireFarming) {
                var spiremaplvl = (game.talents.mapLoot.purchased && MODULES["maps"].SpireFarm199Maps) ? game.global.world - 1 : game.global.world;
                selectedMap = "create";
                for (var i = 0; i < keysSorted.length; i++) {
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
        var repeatBionics = getPageSetting('RunBionicBeforeSpire') && game.global.bionicOwned >= 6;
        var doDefaultMapBonus = game.global.mapBonus < customVars.maxMapBonus - 1;
        if (selectedMap == game.global.currentMapId && (!getCurrentMapObject().noRecycle && (doDefaultMapBonus || vanillaMapatZone || doMaxMapBonus || shouldFarm || stackingTox || needPrestige || shouldDoSpireMaps) || repeatBionics)) {
            var targetPrestige = autoTrimpSettings.Prestige.selected;
            if (!game.global.repeatMap) {
                repeatClicked();
            }
            if (!shouldDoMaps && (game.global.mapGridArray[game.global.mapGridArray.length - 1].special == targetPrestige && game.mapUnlocks[targetPrestige].last >= (game.global.world + extraMapLevels - 9))) {
                repeatClicked();
            }
            if (stackingTox && (game.challenges.Toxicity.stacks + game.global.mapGridArray.length - (game.global.lastClearedMapCell + 1) >= 1500)) {
                repeatClicked();
            }
            if (shouldDoWatchMaps)
                repeatClicked();
            if (shouldDoHealthMaps && game.global.mapBonus >= customVars.wantHealthMapBonus - 1) {
                repeatClicked();
                shouldDoHealthMaps = false;
            }
            if (doMaxMapBonus && game.global.mapBonus >= customVars.maxMapBonusAfterZ - 1) {
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
            if ((!getPageSetting('PowerSaving') || (getPageSetting('PowerSaving') == 2) && doVoids) && game.global.switchToMaps && !shouldDoWatchMaps &&
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
        if (shouldDoWatchMaps) {
            mapsClicked();
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

//update the UI with stuff from automaps.
function updateAutoMapsStatus(get) {
    //automaps status
    var status;
    var minSp = getPageSetting('MinutestoFarmBeforeSpire');
    if (getPageSetting('AutoMaps') == 0) status = 'Off';
    else if (game.global.challengeActive == "Mapology" && game.challenges.Mapology.credits < 1) status = 'Out of Map Credits';
    else if (preSpireFarming) {
        var secs = Math.floor(60 - (spireTime * 60) % 60).toFixed(0)
        var mins = Math.floor(minSp - spireTime).toFixed(0);
        var hours = minSp - (spireTime / 60).toFixed(2);
        var spiretimeStr = (spireTime >= 60) ?
            (hours + 'h') : (mins + 'm:' + (secs >= 10 ? secs : ('0' + secs)) + 's');
        status = 'Farming for Spire ' + spiretimeStr + ' left';
    } else if (spireMapBonusFarming) status = 'Getting Spire Map Bonus';
    else if (doMaxMapBonus) status = 'Max Map Bonus After Zone';
    else if (!game.global.mapsUnlocked) status = '&nbsp;';
    else if (needPrestige && !doVoids) status = 'Prestige';
    else if (doVoids && voidCheckPercent == 0) status = 'Void Maps: ' + game.global.totalVoidMaps + ' remaining';
    else if (stackingTox) status = 'Getting Tox Stacks';
    else if (needToVoid && !doVoids && game.global.totalVoidMaps > 0) status = 'Prepping for Voids';
    else if (doVoids && voidCheckPercent > 0) status = 'Farming to do Voids: ' + voidCheckPercent + '%';
    else if (shouldFarm && !doVoids) status = 'Farming: ' + HDratio.toFixed(4) + 'x';
    else if (scryerStuck) status = 'Scryer Got Stuck, Farming';
    else if (!enoughHealth && !enoughDamage) status = 'Want Health & Damage';
    else if (!enoughDamage) status = 'Want ' + HDratio.toFixed(4) + 'x &nbspmore damage';
    else if (!enoughHealth) status = 'Want more health';
    else if (enoughHealth && enoughDamage) status = 'Advancing';

    if (skippedPrestige) // Show skipping prestiges
        status += '<br><b style="font-size:.8em;color:pink;margin-top:0.2vw">Prestige Skipped</b>';

    //hider he/hr% status
    var getPercent = (game.stats.heliumHour.value() / (game.global.totalHeliumEarned - (game.global.heliumLeftover + game.resources.helium.owned))) * 100;
    var lifetime = (game.resources.helium.owned / (game.global.totalHeliumEarned - game.resources.helium.owned)) * 100;
    var hiderStatus = 'He/hr: ' + getPercent.toFixed(3) + '%<br>&nbsp;&nbsp;&nbsp;He: ' + lifetime.toFixed(3) + '%';

    if (get) {
        return [status, getPercent, lifetime];
    } else {
        document.getElementById('autoMapStatus').innerHTML = status;
        document.getElementById('hiderStatus').innerHTML = hiderStatus;
    }
}


//New Code for Map Special Mods dropdown. (only the first dropdown for now)
//
//PLAN:
//1. lmc when you can afford it, or cycle down the list sequentially until one can be afforded.
//2. prestigious when you need prestiges,
//NEW IDEA:
//+lmc when you need more lvls in your eq
//+perfect sliders when you can afford it
//  another valid idea is burn out all your frags on perfect nearthe end i guess
//Automaps: Map Special Modifier Selector Decider Magical Action Taker
//TODO: a priority list? Which is more important, perfect slide, LMC or the +x value?

MODULES["maps"].advSpecialMapMod_numZones = 3; //The default amount of +x zones you try to skip and work backwards from there. (if its too hard you will fail the map there is no dmg check only cost yet)
var advExtraMapLevels = 0;

function testMapSpecialModController() {
    //var mapSpecialMods = ["Fast Attacks", "Large Cache", "Small Savory Cache", "Small Wooden Cache", "Small Metal Cache", "Prestigious", "Huge Cache", "Large Savory Cache", "Large Wooden Cache", "Large Metal Cache"];
    var mapSpecialMods = [];
    Object.keys(mapSpecialModifierConfig).forEach(function(key) {
        var elem = mapSpecialModifierConfig[key];
        if ((game.global.highestLevelCleared + 1) >= elem.unlocksAt)
            mapSpecialMods.push(elem.name);
    });
    if (mapSpecialMods.length < 1)
        return; //nothing to do.
    //try to use the highest one we have.
    var maxIndex = mapSpecialMods.length;
    var $advSpecialMod = document.getElementById('advSpecialSelect');
    if (!$advSpecialMod)
        return;
    if (game.global.highestLevelCleared >= 59) {
        if (needPrestige)
            maxIndex = 6;
        //Set the special mod to some max.
        $advSpecialMod.selectedIndex = maxIndex;
        if ($advSpecialMod.selectedIndex == 0)
            return;
        //Check Hyperspeed 2 or Fast Attacks
        if (!needPrestige && game.talents.hyperspeed2.purchased && (game.global.world > Math.floor((game.global.highestLevelCleared + 1) * 0.5)))
            $advSpecialMod.selectedIndex = 1;
        else if (needPrestige)
            $advSpecialMod.selectedIndex = 0;
        if (game.global.mapExtraBonus != "fa" && $advSpecialMod.selectedIndex == 1);
        //map frag cost is stored in: document.getElementById("mapCostFragmentCost").innerHTML
        var mc = updateMapCost(true);
        var my = game.resources.fragments.owned;
        var pct = mc / my * 100;
        while ($advSpecialMod.selectedIndex > 0 && mc > my) {
            $advSpecialMod.selectedIndex -= 1;
        }
        var mc = updateMapCost(true);
        var my = game.resources.fragments.owned;
        var pct = mc / my * 100;
        if ($advSpecialMod.value != "0") //if its 0 it fails {
            console.log("Set the map special modifier to: " + mapSpecialModifierConfig[$advSpecialMod.value].name + ". Cost: " + pct.toFixed(2) + "% of your fragments.");
    }
    //TODO:
    var specialMod = getSpecialModifierSetting(); //either 0 or the abbreviation/property of mapSpecialModifierConfig
    var perfectAllowed = (game.global.highestLevelCleared >= 109); //levels are 109 and 209 for Perfect sliders and Extra Levels
    var perfectChecked = checkPerfectChecked(); //Perfect Checkboxes
    var $advPerfect = document.getElementById('advPerfectCheckbox');
    var extraMapLevels = getPageSetting('AdvMapSpecialModifier') ? getExtraMapLevels() : 0; //Extra Levels

    //Set the extra level to max ( 3 )
    var extraAllowed = (game.global.highestLevelCleared >= 209);
    if (extraAllowed) {
        var $advExtraLevel = document.getElementById('advExtraMapLevelselect');
        if (!$advExtraLevel)
            return;
        var maplvlpicked = document.getElementById("mapLevelInput").value;
        if (maplvlpicked == game.global.world) //then the +x zones dropdown is open.
            $advExtraLevel.selectedIndex = MODULES["maps"].advSpecialMapMod_numZones;
        else
            $advExtraLevel.selectedIndex = 0;
        while ($advExtraLevel.selectedIndex > 0 && (updateMapCost(true) > game.resources.fragments.owned)) {
            $advExtraLevel.selectedIndex -= 1;
        }
    }
}

function mapTimeEstimater() {
    //Check our graph history and - Estimate = The zone should take around this long in milliseconds.
    var thiszone = lookUpZoneData(game.global.world);
    var lastzone = lookUpZoneData(game.global.world - 1);
    if (thiszone && lastzone)
        mapTimeEstimate = thiszone.currentTime - lastzone.currentTime;
    else
        mapTimeEstimate = 0;
    return mapTimeEstimate;
}

function HDratioy() {
    return HDratio;
}

