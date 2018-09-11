MODULES["portal"] = {};
MODULES["portal"].timeout = 5000;
MODULES["portal"].bufferExceedFactor = 5;
var portalzone = getPageSetting('CustomAutoPortal');
var zonePostpone = 0;

function autoPortal() {
    if (!game.global.portalActive) return;
    switch (autoTrimpSettings.AutoPortal.selected) {
        case "Helium Per Hour":
            var OKtoPortal = false;
            if (!game.global.runningChallengeSquared) {
                var minZone = getPageSetting('HeHrDontPortalBefore');
                game.stats.bestHeliumHourThisRun.evaluate();
                var bestHeHr = game.stats.bestHeliumHourThisRun.storedValue;
                var bestHeHrZone = game.stats.bestHeliumHourThisRun.atZone;
                var myHeliumHr = game.stats.heliumHour.value();
                var heliumHrBuffer = Math.abs(getPageSetting('HeliumHrBuffer'));
                if (!aWholeNewWorld)
                    heliumHrBuffer *= MODULES["portal"].bufferExceedFactor;
                var bufferExceeded = myHeliumHr < bestHeHr * (1 - (heliumHrBuffer / 100));
                if (bufferExceeded && game.global.world >= minZone) {
                    OKtoPortal = true;
                    if (aWholeNewWorld)
                        zonePostpone = 0;
                }
                if (heliumHrBuffer == 0 && !aWholeNewWorld)
                    OKtoPortal = false;
                if (OKtoPortal && zonePostpone == 0) {
                    zonePostpone += 1;
                    debug("My HeliumHr was: " + myHeliumHr + " & the Best HeliumHr was: " + bestHeHr + " at zone: " + bestHeHrZone, "portal");
                    cancelTooltip();
                    tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'zonePostpone+=1', '<b>NOTICE: Auto-Portaling in 5 seconds....</b>', 'Delay Portal');
                    setTimeout(cancelTooltip, MODULES["portal"].timeout);
                    setTimeout(function() {
                        if (zonePostpone >= 2)
                            return;
                        if (autoTrimpSettings.HeliumHourChallenge.selected != 'None')
                            doPortal(autoTrimpSettings.HeliumHourChallenge.selected);
                        else
                            doPortal();
                    }, MODULES["portal"].timeout + 100);
                }
            }
            break;
        case "Custom":
            var portalzone = getPageSetting('CustomAutoPortal');
            if (game.global.world > portalzone) {
                if (autoTrimpSettings.HeliumHourChallenge.selected != 'None')
                    doPortal(autoTrimpSettings.HeliumHourChallenge.selected);
                else
                    doPortal();
            }
            break;
        case "Balance":
        case "Decay":
        case "Electricity":
        case "Life":
        case "Crushed":
        case "Nom":
        case "Toxicity":
            if (getPageSetting('MaxTox'))
                settingChanged("MaxTox");
        case "Watch":
        case "Lead":
        case "Corrupted":
            if (!game.global.challengeActive) {
                doPortal(autoTrimpSettings.AutoPortal.selected);
            }
            break;
        default:
            break;
    }
}

function dailyAutoPortal() {
    if (!game.global.portalActive) return;
    if (getPageSetting('AutoPortalDaily') == 1) {
        var OKtoPortal = false;
        if (!game.global.runningChallengeSquared) {
            var minZone = getPageSetting('dHeHrDontPortalBefore');
            game.stats.bestHeliumHourThisRun.evaluate();
            var bestHeHr = game.stats.bestHeliumHourThisRun.storedValue;
            var bestHeHrZone = game.stats.bestHeliumHourThisRun.atZone;
            var myHeliumHr = game.stats.heliumHour.value();
            var heliumHrBuffer = Math.abs(getPageSetting('dHeliumHrBuffer'));
            if (!aWholeNewWorld) {
                heliumHrBuffer *= MODULES["portal"].bufferExceedFactor;
                var bufferExceeded = myHeliumHr < bestHeHr * (1 - (heliumHrBuffer / 100));
                if (bufferExceeded && game.global.world >= minZone) {
                    OKtoPortal = true;
                    if (aWholeNewWorld)
                        zonePostpone = 0;
                }
                if (heliumHrBuffer == 0 && !aWholeNewWorld)
                    OKtoPortal = false;
                if (OKtoPortal && zonePostpone == 0) {
                    zonePostpone += 1;
                    debug("My HeliumHr was: " + myHeliumHr + " & the Best HeliumHr was: " + bestHeHr + " at zone: " + bestHeHrZone, "portal");
                    cancelTooltip();
                    tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'zonePostpone+=1', '<b>NOTICE: Auto-Portaling in 5 seconds....</b>', 'Delay Portal');
                    setTimeout(cancelTooltip, MODULES["portal"].timeout);
                    setTimeout(function() {
                        if (zonePostpone >= 2)
                            return;
                        if (OKtoPortal) {
                            abandonDaily();
                            document.getElementById('finishDailyBtnContainer').style.display = 'none';
                        }
                        if (autoTrimpSettings.dHeliumHourChallenge.selected != 'None')
                            doPortal(autoTrimpSettings.dHeliumHourChallenge.selected);
                        else
                            doPortal();
                    }, MODULES["portal"].timeout + 100);
                }
            }
        }
    }
    if (getPageSetting('AutoPortalDaily') == 2) {
        var portalzone = getPageSetting('dCustomAutoPortal');
        if (game.global.world > portalzone) {
            abandonDaily();
            document.getElementById('finishDailyBtnContainer').style.display = 'none';
            if (autoTrimpSettings.dHeliumHourChallenge.selected != 'None')
                doPortal(autoTrimpSettings.dHeliumHourChallenge.selected);
            else
                doPortal();
        }
    }
}

function doPortal(challenge) {
    if (!game.global.portalActive) return;
    if (getPageSetting('spendmagmite') == 1) autoMagmiteSpender();
    if (getPageSetting('AutoHeirloomsNew') == 0);
    else if (getPageSetting('AutoHeirloomsNew') == 1) autoHeirlooms();
    else if (getPageSetting('AutoHeirloomsNew') == 2) autoHeirlooms2();
    if (getPageSetting('AutoUpgradeHeirlooms') && !heirloomsShown) autoNull();
    portalClicked();
    if (getPageSetting('AutoAllocatePerks') == 1 && (typeof MODULES["perks"] !== 'undefined' || typeof AutoPerks !== 'undefined'))
        AutoPerks.clickAllocate();
    if (getPageSetting('AutoStartDaily')) {
<<<<<<< HEAD
        runDaily(challenge);
=======
        selectChallenge('Daily');
        checkCompleteDailies();

        var lastUndone = -7;
        while (++lastUndone <= 0) {
            var done = (game.global.recentDailies.indexOf(getDailyTimeString(lastUndone)) != -1);
            if (!done)
                break;
        }

        if (lastUndone == 1) {
            debug("All available Dailies already completed.", "portal");
            selectChallenge(challenge || 0);
        } else {
            getDailyChallenge(lastUndone);
            debug("Portaling into Daily for: " + getDailyTimeString(lastUndone, true) + " now!", "portal");
        }
>>>>>>> parent of 8963ba1... Refactored portal.js
    } else if (challenge) {
        selectChallenge(challenge);
    }
    pushData();
    activateClicked();
    activatePortal();
    lastHeliumZone = 0;
    zonePostpone = 0;
}

<<<<<<< HEAD
function manageHeirlooms() {
    if (getPageSetting('AutoHeirloomsNew') === 1) autoHeirlooms();
    else if (getPageSetting('AutoHeirloomsNew') === 2) autoHeirlooms2();
    if (getPageSetting('AutoUpgradeHeirlooms') && !heirloomsShown) autoNull();
}

function runDaily(challenge) {
    selectChallenge('Daily');
    checkCompleteDailies();
    let lastUnattemptedDaily = selectDaily();

    let noAvailableDailies = lastUnattemptedDaily === 1;
    if (noAvailableDailies) {
        debug("All available Dailies already completed.", "portal");
        selectChallenge(challenge || 0);
    } else {
        getDailyChallenge(lastUnattemptedDaily);
        debug("Portaling into Daily for: " + getDailyTimeString(lastUnattemptedDaily, true) + " now!", "portal");
    }
}

function selectDaily() {
    let lastUndone = -7;
    while (++lastUndone <= 0) {
        let done = (game.global.recentDailies.indexOf(getDailyTimeString(lastUndone)) !== -1);
        if (!done)
            break;
    }
    return lastUndone;
}

function finishChallengeSquared() {
    const finishC2Zone = getPageSetting("FinishC2");

    if (game.global.world >= finishC2Zone){
        abandonChallenge();
        debug("Finished challenge2 because we are on zone " + game.global.world, "other", "oil");
    }
}

function findOutCurrentPortalLevel() {
    const autoPortalSetting = getPageSetting("AutoPortal");

    let zoneToPortalAt = -1;
    switch (autoPortalSetting) {
        case "Off":
            break;
        case "Custom":
            if (game.global.challengeActive === "Daily"){
                zoneToPortalAt = getPageSetting("Dailyportal") + 1;
            }
            else{
                zoneToPortalAt = getPageSetting("CustomAutoPortal") + 1;
            }
            break;
        default:
            const challengeEndZone = {
                Balance: 41,
                Decay: 56,
                Electricity: 82,
                Crushed: 126,
                Nom: 146,
                Toxicity: 166,
                Lead: 181,
                Watch: 181,
                Corrupted: 191
            }[autoPortalSetting];
            challengeEndZone && (zoneToPortalAt = challengeEndZone);
    }
    return zoneToPortalAt;
}
=======
function finishChallengeSquared(){var a=getPageSetting("FinishC2");game.global.world>=a&&(abandonChallenge(),debug("Finished challenge2 because we are on zone "+game.global.world,"other","oil"))}
function findOutCurrentPortalLevel(){var a=-1,b=!1,d=getPageSetting("AutoPortal");switch(d){case"Off":break;case"Custom":"Daily"!=game.global.challengeActive&&(a=getPageSetting("CustomAutoPortal")+1),"Daily"==game.global.challengeActive&&(a=getPageSetting("Dailyportal")+1),b=!("Lead"!=getPageSetting("HeliumHourChallenge"));break;default:var e={Balance:41,Decay:56,Electricity:82,Crushed:126,Nom:146,Toxicity:166,Lead:181,Watch:181,Corrupted:191}[d];e&&(a=e);}return{level:a,lead:b}}
>>>>>>> parent of 8963ba1... Refactored portal.js
