MODULES.gather={},MODULES.gather.minTraps=100,MODULES.gather.minScienceAmount=100,MODULES.gather.minScienceSeconds=60;
function manualLabor2() {
    if (getPageSetting('ManualGather2')==0) return;
    var breedingTrimps = game.resources.trimps.owned - game.resources.trimps.employed;
    var lowOnTraps = game.buildings.Trap.owned < MODULES["gather"].minTraps;
    var notFullPop = game.resources.trimps.owned < game.resources.trimps.realMax();
    var trapTrimpsOK = getPageSetting('TrapTrimps');
    var targetBreed = getPageSetting('GeneticistTimer');
    var trapperTrapUntilFull = game.global.challengeActive == "Trapper" && notFullPop;
    var watchJumpstartTraps  = game.global.challengeActive == "Watch"  && notFullPop;
    var hasTurkimp = game.talents.turkimp4.purchased || game.global.turkimpTimer > 0;

    if (game.global.world <=3 && game.global.totalHeliumEarned<=5000) {
        if (game.global.buildingsQueue.length == 0 && (game.global.playerGathering != 'trimps' || game.buildings.Trap.owned == 0)){
            if (!game.triggers.wood.done || game.resources.food.owned < 10 || Math.floor(game.resources.food.owned) < Math.floor(game.resources.wood.owned))
                setGather('food');
            else
                setGather('wood');
        }
    }

    if(watchJumpstartTraps || trapTrimpsOK && (breedingTrimps < 5 || trapperTrapUntilFull) && game.buildings.Trap.owned == 0 && canAffordBuilding('Trap')) {
        if(!safeBuyBuilding('Trap'))
            setGather('buildings');
    }
    else if (watchJumpstartTraps || trapTrimpsOK && (breedingTrimps < 5 || trapperTrapUntilFull) && game.buildings.Trap.owned > 0) {
        setGather('trimps');
        if (trapperTrapUntilFull && (game.global.buildingsQueue.length == 0 || game.buildings.Trap.owned == 1) && !game.global.trapBuildAllowed  && canAffordBuilding('Trap'))
            safeBuyBuilding('Trap');
    }
    else if (getPageSetting('ManualGather2') != 3 && game.resources.science.owned < MODULES["gather"].minScienceAmount && document.getElementById('scienceCollectBtn').style.display != 'none' && document.getElementById('science').style.visibility != 'hidden')
        setGather('science');
    else if (!game.talents.foreman.purchased && (game.global.buildingsQueue.length ? (game.global.buildingsQueue.length > 1 || game.global.autoCraftModifier == 0 || (getPlayerModifier() > 1000 && game.global.buildingsQueue[0] != 'Trap.1')) : false)) {
        setGather('buildings');
    }
    else if (!game.global.trapBuildToggled && (game.global.buildingsQueue[0] == 'Barn.1' || game.global.buildingsQueue[0] == 'Shed.1' || game.global.buildingsQueue[0] == 'Forge.1')){
        setGather('buildings');
    }
    else if (game.resources.science.owned < scienceNeeded && document.getElementById('scienceCollectBtn').style.display != 'none' && document.getElementById('science').style.visibility != 'hidden') {
        if ((getPlayerModifier() < getPerSecBeforeManual('Scientist') && hasTurkimp)||getPageSetting('ManualGather2') == 3){
            setGather('metal');
        }
        else if (getPageSetting('ManualGather2') != 3){
            setGather('science');
        }
    }
    else if (trapTrimpsOK && targetBreed < getBreedTime(true)){
        if (game.buildings.Trap.owned < 100 && canAffordBuilding('Trap')) {
            safeBuyBuilding('Trap');
            setGather('buildings');
        }
        else if (game.buildings.Trap.owned > 0)
            setGather('trimps');
    }
    else {
        var manualResourceList = {
            'food': 'Farmer',
            'wood': 'Lumberjack',
            'metal': 'Miner',
        };
        var lowestResource = 'food';
        var lowestResourceRate = -1;
        var haveWorkers = true;
        for (var resource in manualResourceList) {
            var job = manualResourceList[resource];
            var currentRate = game.jobs[job].owned * game.jobs[job].modifier;
            if (document.getElementById(resource).style.visibility != 'hidden') {
                if (currentRate === 0) {
                    currentRate = game.resources[resource].owned;
                    if ((haveWorkers) || (currentRate < lowestResourceRate)) {
                        haveWorkers = false;
                        lowestResource = resource;
                        lowestResourceRate = currentRate;
                    }
                }
                if ((currentRate < lowestResourceRate || lowestResourceRate == -1) && haveWorkers) {
                    lowestResource = resource;
                    lowestResourceRate = currentRate;
                }
            }
        }
        if (game.global.playerGathering != lowestResource && !haveWorkers && !breedFire) {
            if (hasTurkimp)
                setGather('metal');
            else
                setGather(lowestResource);
      } else if (getPageSetting('ManualGather2') != 3 && document.getElementById('scienceCollectBtn').style.display != 'none' && document.getElementById('science').style.visibility != 'hidden') {
            if (game.resources.science.owned < getPsString('science', true) * MODULES["gather"].minScienceSeconds && game.global.turkimpTimer < 1 && haveWorkers)
                setGather('science');
            else if (hasTurkimp)
                setGather('metal');
            else
                setGather(lowestResource);
        }
        else if(trapTrimpsOK && game.global.trapBuildToggled == true && lowOnTraps)
            setGather('buildings');
        else
            setGather(lowestResource);
    }
}

function autogather3() {
if (game.global.buildingsQueue.length <= 1) setGather('metal');
else setGather('buildings')
}
