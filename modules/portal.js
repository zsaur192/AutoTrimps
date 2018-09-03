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

function dautoPortal() {
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
        if (game.global.world > portalzone)
            if (autoTrimpSettings.dHeliumHourChallenge.selected != 'None')
                doPortal(autoTrimpSettings.dHeliumHourChallenge.selected);
            else
                doPortal();
    }
}

function doPortal(challenge) {
    if (!game.global.portalActive) return;
    if (getPageSetting('AutoPortalDaily') > 0 && game.global.challengeActive == "Daily" && game.global.world > getPageSetting('Dailyportal')) {
        abandonDaily();
        document.getElementById('finishDailyBtnContainer').style.display = 'none';
    }
    if (getPageSetting('spendmagmite') == 1) autoMagmiteSpender();
    if (getPageSetting('AutoHeirloomsNew') == 0);
    else if (getPageSetting('AutoHeirloomsNew') == 1) autoHeirlooms();
    else if (getPageSetting('AutoHeirloomsNew') == 2) autoHeirlooms2();
    if (getPageSetting('AutoUpgradeHeirlooms') && !heirloomsShown) autoNull();
    portalClicked();
    if (getPageSetting('AutoAllocatePerks') == 1 && (typeof MODULES["perks"] !== 'undefined' || typeof AutoPerks !== 'undefined'))
        AutoPerks.clickAllocate();
    if (getPageSetting('AutoStartDaily')) {
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
    } else if (challenge) {
        selectChallenge(challenge);
    }
    pushData();
    activateClicked();
    activatePortal();
    lastHeliumZone = 0;
    zonePostpone = 0;
}

function finishChallengeSquared(){var a=getPageSetting("FinishC2");game.global.world>=a&&(abandonChallenge(),debug("Finished challenge2 because we are on zone "+game.global.world,"other","oil"))}
function findOutCurrentPortalLevel(){var a=-1,b=!1,d=getPageSetting("AutoPortal");switch(d){case"Off":break;case"Custom":"Daily"!=game.global.challengeActive&&(a=getPageSetting("CustomAutoPortal")+1),"Daily"==game.global.challengeActive&&(a=getPageSetting("Dailyportal")+1),b=!("Lead"!=getPageSetting("HeliumHourChallenge"));break;default:var e={Balance:41,Decay:56,Electricity:82,Crushed:126,Nom:146,Toxicity:166,Lead:181,Watch:181,Corrupted:191}[d];e&&(a=e);}return{level:a,lead:b}}

//TODO:
var c2list = {
    
    Size: {
        number: 1,
        percent: getIndividualSquaredReward("Size")+'%',
        zone: game.c2.Size,
        percentzone: (game.c2.Size/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    },
    Slow: {
        number: 2,
        percent: getIndividualSquaredReward("Slow")+'%',
        zone: game.c2.Slow,
        percentzone: (game.c2.Slow/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    },
    Watch: {
        number: 3,
        percent: getIndividualSquaredReward("Watch")+'%',
        zone: game.c2.Watch,
        percentzone: (game.c2.Watch/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    },
    Discipline: {
        number: 4,
        percent: getIndividualSquaredReward("Discipline")+'%',
        zone: game.c2.Discipline,
        percentzone: (game.c2.Discipline/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    },
    Balance: {
        number: 5,
        percent: getIndividualSquaredReward("Balance")+'%',
        zone: game.c2.Balance,
        percentzone: (game.c2.Balance/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    },
    Meditate: {
        number: 6,
        percent: getIndividualSquaredReward("Meditate")+'%',
        zone: game.c2.Meditate,
        percentzone: (game.c2.Meditate/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    },
    Metal: {
        number: 7,
        percent: getIndividualSquaredReward("Metal")+'%',
        zone: game.c2.Metal,
        percentzone: (game.c2.Metal/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    },
    Lead: {
        number: 8,
        percent: getIndividualSquaredReward("Lead")+'%',
        zone: game.c2.Lead,
        percentzone: (game.c2.Lead/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    },
    Nom: {
        number: 9,
        percent: getIndividualSquaredReward("Nom")+'%',
        zone: game.c2.Nom,
        percentzone: (game.c2.Nom/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    },
    Electricity: {
        number: 10,
        percent: getIndividualSquaredReward("Electricity")+'%',
        zone: game.c2.Electricity,
        percentzone: (game.c2.Electricity/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    },
    Toxicity: {
        number: 11,
        percent: getIndividualSquaredReward("Toxicity")+'%',
        zone: game.c2.Toxicity,
        percentzone: (game.c2.Toxicity/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    },
    Coordinate: {
        number: 12,
        percent: getIndividualSquaredReward("Coordinate")+'%',
        zone: game.c2.Coordinate,
        percentzone: (game.c2.Coordinate/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    },
    Trimp: {
        number: 13,
        percent: getIndividualSquaredReward("Trimp")+'%',
        zone: game.c2.Trimp,
        percentzone: (game.c2.Trimp/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    },
    Obliterated: {
        number: 14,
        percent: getIndividualSquaredReward("Obliterated")+'%',
        zone: game.c2.Obliterated,
        percentzone: (game.c2.Obliterated/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    },
    Mapology: {
        number: 15,
        percent: getIndividualSquaredReward("Mapology")+'%',
        zone: game.c2.Mapology,
        percentzone: (game.c2.Mapology/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    },
    Trapper: {
        number: 16,
        percent: getIndividualSquaredReward("Trapper")+'%',
        zone: game.c2.Trapper,
        percentzone: (game.c2.Trapper/game.global.highestLevelCleared*100).toFixed(2)+'%',
        color: 0
    }
    
};

function c2listcolor3() {
    function execute(what, n1, n2) {
        var num = ((game.c2[what]/game.global.highestLevelCleared)*100);
        if (num >= n1) c2list[what].color = "green";
        else if (num < n1 && num >= n2) c2list[what].color = "yellow";
        else if (num < n2) c2list[what].color = "red";
        else c2list[what].color = "blue";

    }
    Object.keys(c2list).forEach(function(what) {
        if(game.c2[what] == null)
            return;
        switch(what) {
            case "Coordinate":
                execute(what, 50, 42);
                break;
            case "Trimp":
                execute(what, 45, 35);
                break;
            case "Obliterated":
                execute(what, 25, 20);
                break;
            case "Mapology":
                execute(what, 90, 80);
                break;
            case "Trapper":
                execute(what, 85, 75);
                break;
            default:
                execute(what, 95, 85);
        }
    });
}
