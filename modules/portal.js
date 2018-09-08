MODULES["portal"] = {};
MODULES["portal"].timeout = 5000;
MODULES["portal"].bufferExceedFactor = 5;

let zonePostpone = 0;

function autoPortal() {
    if (!game.global.portalActive) return;

    let selectedAutoPortalChallenge = autoTrimpSettings.AutoPortal.selected;
    switch (selectedAutoPortalChallenge) {
        case "Helium Per Hour":
            heliumPerHourPortal();
            break;
        case "Custom":
            customZonePortal();
            break;
        case "Toxicity":
            if (getPageSetting('MaxTox'))
                settingChanged("MaxTox");
        default:
            if (!game.global.challengeActive) {
                doPortal(selectedAutoPortalChallenge);
            }
            break;
    }
}

function heliumPerHourPortal() {
    let OKtoPortal = false;
    if (!game.global.runningChallengeSquared) {
        const minZone = getPageSetting('HeHrDontPortalBefore');

        game.stats.bestHeliumHourThisRun.evaluate();
        const bestHeHr = game.stats.bestHeliumHourThisRun.storedValue;
        const bestHeHrZone = game.stats.bestHeliumHourThisRun.atZone;
        const myHeliumHr = game.stats.heliumHour.value();

        let heliumHrBuffer = Math.abs(getPageSetting('HeliumHrBuffer'));
        if (!aWholeNewWorld)
            heliumHrBuffer *= MODULES["portal"].bufferExceedFactor;
        const bufferExceeded = myHeliumHr < bestHeHr * (1 - (heliumHrBuffer / 100));
        if (bufferExceeded && game.global.world >= minZone) {
            OKtoPortal = true;
            if (aWholeNewWorld)
                zonePostpone = 0;
        }
        if (heliumHrBuffer === 0 && !aWholeNewWorld)
            OKtoPortal = false;

        if (OKtoPortal && zonePostpone === 0) {
            zonePostpone += 1;
            debug("My HeliumHr was: " + myHeliumHr + " & the Best HeliumHr was: " + bestHeHr + " at zone: " + bestHeHrZone, "portal");
            cancelTooltip();
            tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'zonePostpone+=1', '<b>NOTICE: Auto-Portaling in 5 seconds....</b>', 'Delay Portal');
            setTimeout(cancelTooltip, MODULES["portal"].timeout);
            setTimeout(function () {
                if (zonePostpone >= 2)
                    return;
                if (autoTrimpSettings.HeliumHourChallenge.selected !== 'None')
                    doPortal(autoTrimpSettings.HeliumHourChallenge.selected);
                else
                    doPortal();
            }, MODULES["portal"].timeout + 100);
        }
    }
}

function customZonePortal() {
    const portalzone = getPageSetting('CustomAutoPortal');
    if (game.global.world > portalzone) {
        if (autoTrimpSettings.HeliumHourChallenge.selected !== 'None')
            doPortal(autoTrimpSettings.HeliumHourChallenge.selected);
        else
            doPortal();
    }
}

function dautoPortal() {
    if (!game.global.portalActive) return;

    let dailyPortalHeliumPerHour = getPageSetting('AutoPortalDaily') === 1;
    if (dailyPortalHeliumPerHour) {
        let OKtoPortal = false;
        if (!game.global.runningChallengeSquared) {
            const minZone = getPageSetting('dHeHrDontPortalBefore');

            game.stats.bestHeliumHourThisRun.evaluate();
            const bestHeHr = game.stats.bestHeliumHourThisRun.storedValue;
            const bestHeHrZone = game.stats.bestHeliumHourThisRun.atZone;
            const myHeliumHr = game.stats.heliumHour.value();

            let heliumHrBuffer = Math.abs(getPageSetting('dHeliumHrBuffer'));
            if (!aWholeNewWorld) {

                heliumHrBuffer *= MODULES["portal"].bufferExceedFactor;
                const bufferExceeded = myHeliumHr < bestHeHr * (1 - (heliumHrBuffer / 100));
                if (bufferExceeded && game.global.world >= minZone) {
                    OKtoPortal = true;
                    if (aWholeNewWorld)
                        zonePostpone = 0;
                }
                if (heliumHrBuffer === 0 && !aWholeNewWorld)
                    OKtoPortal = false;

                if (OKtoPortal && zonePostpone === 0) {
                    zonePostpone += 1;
                    debug("My HeliumHr was: " + myHeliumHr + " & the Best HeliumHr was: " + bestHeHr + " at zone: " + bestHeHrZone, "portal");
                    cancelTooltip();
                    tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'zonePostpone+=1', '<b>NOTICE: Auto-Portaling in 5 seconds....</b>', 'Delay Portal');
                    setTimeout(cancelTooltip, MODULES["portal"].timeout);
                    setTimeout(function () {
                        if (zonePostpone >= 2)
                            return;
                        if (OKtoPortal) {
                            abandonDaily();
                            document.getElementById('finishDailyBtnContainer').style.display = 'none';
                        }
                        if (autoTrimpSettings.dHeliumHourChallenge.selected !== 'None')
                            doPortal(autoTrimpSettings.dHeliumHourChallenge.selected);
                        else
                            doPortal();
                    }, MODULES["portal"].timeout + 100);
                }
            }
        }
    }

    let dailyPortalCustom = getPageSetting('AutoPortalDaily') === 2;
    if (dailyPortalCustom) {
        const customPortalZone = getPageSetting('dCustomAutoPortal');
        if (game.global.world > customPortalZone) {
            abandonDaily();
            document.getElementById('finishDailyBtnContainer').style.display = 'none';
            if (autoTrimpSettings.dHeliumHourChallenge.selected !== 'None')
                doPortal(autoTrimpSettings.dHeliumHourChallenge.selected);
            else
                doPortal();
        }
    }
}

function doPortal(challenge) {
    if (!game.global.portalActive) return;

    manageMagmite();
    manageHeirlooms();

    portalClicked();
    let autoAllocateOn = getPageSetting('AutoAllocatePerks') === 1;
    if (autoAllocateOn && (typeof MODULES["perks"] !== 'undefined' || typeof AutoPerks !== 'undefined'))
        AutoPerks.clickAllocate();

    if (getPageSetting('AutoStartDaily')) {
        dailyPortal();
    } else if (challenge) {
        selectChallenge(challenge);
    }
    pushData();
    activateClicked();
    activatePortal();
    zonePostpone = 0;
}
function manageMagmite() {
    let spendMagmitePortal = getPageSetting('spendmagmite') === 1;
    if (spendMagmitePortal) autoMagmiteSpender();
}

function manageHeirlooms() {
    if (getPageSetting('AutoHeirloomsNew') === 1) autoHeirlooms();
    else if (getPageSetting('AutoHeirloomsNew') === 2) autoHeirlooms2();
    if (getPageSetting('AutoUpgradeHeirlooms') && !heirloomsShown) autoNull();
}

function dailyPortal() {
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
