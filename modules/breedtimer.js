MODULES["breedtimer"] = {};
MODULES["breedtimer"].voidCheckPercent = 95;
var DecimalBreed = Decimal.clone({precision: 30, rounding: 4});
var missingTrimps = new DecimalBreed(0);
function ATGA2() {
	if (game.jobs.Geneticist.locked == false && getPageSetting('ATGA2') == true && getPageSetting('ATGA2timer') > 0){
		var trimps = game.resources.trimps;
		var trimpsMax = trimps.realMax();
		var maxBreedable = new DecimalBreed(trimpsMax).minus(trimps.employed);
		var potencyMod = new DecimalBreed(trimps.potency);
		if (game.upgrades.Potency.done > 0) potencyMod = potencyMod.mul(Math.pow(1.1, game.upgrades.Potency.done));
		if (game.buildings.Nursery.owned > 0) potencyMod = potencyMod.mul(Math.pow(1.01, game.buildings.Nursery.owned));
		if (game.unlocks.impCount.Venimp > 0) potencyMod = potencyMod.mul(Math.pow(1.003, game.unlocks.impCount.Venimp));
		if (game.global.brokenPlanet) potencyMod = potencyMod.div(10);
		potencyMod = potencyMod.mul(1+ (game.portal.Pheromones.level * game.portal.Pheromones.modifier));
		if (game.singleRunBonuses.quickTrimps.owned) potencyMod = potencyMod.mul(2);
		if (game.global.challengeActive == "Daily"){
			if (typeof game.global.dailyChallenge.dysfunctional !== 'undefined'){
			potencyMod = potencyMod.mul(dailyModifiers.dysfunctional.getMult(game.global.dailyChallenge.dysfunctional.strength));
			}
			if (typeof game.global.dailyChallenge.toxic !== 'undefined'){
			potencyMod = potencyMod.mul(dailyModifiers.toxic.getMult(game.global.dailyChallenge.toxic.strength, game.global.dailyChallenge.toxic.stacks));
			}
		}
		if (game.global.challengeActive == "Toxicity" && game.challenges.Toxicity.stacks > 0){
		potencyMod = potencyMod.mul(Math.pow(game.challenges.Toxicity.stackMult, game.challenges.Toxicity.stacks));
		}
		if (game.global.voidBuff == "slowBreed"){
		potencyMod = potencyMod.mul(0.2);
		} 
		potencyMod = calcHeirloomBonusDecimal("Shield", "breedSpeed", potencyMod);
		if (game.jobs.Geneticist.owned > 0) potencyMod = potencyMod.mul(Math.pow(.98, game.jobs.Geneticist.owned));
		var breeding = decimalOwned.minus(trimps.employed);
		breeding = potencyMod.mul(breeding);
		potencyMod = potencyMod.div(10).add(1);
		var decimalOwned = missingTrimps.add(trimps.owned);
    		if (breeding.cmp(2) == -1 || game.global.challengeActive == "Trapper") {
        		return;
		}
		var timeRemaining = DecimalBreed.log10(maxBreedable.div(decimalOwned.minus(trimps.employed))).div(DecimalBreed.log10(potencyMod)).div(10);
		var currentSend = game.resources.trimps.getCurrentSend();
		var totalTime = DecimalBreed.log10(maxBreedable.div(maxBreedable.minus(currentSend))).div(DecimalBreed.log10(potencyMod)).div(10);

		var target = new Decimal(getPageSetting('ATGA2timer'));

		var now = new Date().getTime();
		var thresh = new DecimalBreed(totalTime.mul(0.02));
		var compareTime;
		if (timeRemaining.cmp(1) > 0 && timeRemaining.cmp(target.add(1)) > 0) {
			compareTime = new DecimalBreed(timeRemaining.add(-1));}
		else {
			compareTime = new DecimalBreed(totalTime);}
		if (!thresh.isFinite()) thresh = new Decimal(0);
		if (!compareTime.isFinite()) compareTime = new Decimal(999);
		var genDif = new DecimalBreed(Decimal.log10(target.div(compareTime)).div(Decimal.log10(1.02))).ceil();

			if (compareTime.cmp(target) < 0) {
				if (game.resources.food.owned * 0.01 < getNextGeneticistCost()) {debug("not enough food dickhead");}
				else if (timeRemaining.cmp(1) < 0 || target.minus((now - game.global.lastSoldierSentAt) / 1000).cmp(timeRemaining) > 0){
					if (genDif.cmp(0) > 0){
						if (genDif.cmp(10) > 0) genDif = new Decimal(10);
						addGeneticist(genDif.toNumber());
					}
				}
			}
			else if (compareTime.add(thresh.mul(-1)).cmp(target) > 0  || (potencyMod.cmp(1) == 0)){
				if (!genDif.isFinite()) genDif = new Decimal(-1);
				if (genDif.cmp(0) < 0 && game.options.menu.gaFire.enabled != 2){
					if (genDif.cmp(-10) < 0) genDif = new Decimal(-10);
					removeGeneticist(genDif.abs().toNumber());
				}
			}	
	}
}

function ATGAshit() {
    var fWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
    var targetBreed = getPageSetting('ATGA2timer');
    if (!game.jobs.Geneticist.locked && game.global.breedTime <= targetBreed) {
        var doBuy = canAffordJob('Geneticist', false, 1);
        if (doBuy) {
            if (fWorkers < 1)
            safeFireJob('Farmer', 1);
            safeBuyJob('Geneticist', 1);
        }
    }
    if (!game.jobs.Geneticist.locked && game.global.breedTime > targetBreed) {
	safeFireJob('Geneticist', 1);
    }
}

function ATaddGeneticist(amount){
	if (game.global.challengeActive == "Corrupted") game.challenges.Corrupted.hiredGenes = true;
	var workspaces = game.workspaces;
	var owned = game.resources.trimps.owned - game.resources.trimps.employed;
	if (owned < 1) return;
	if (owned < amount)
		amount = owned;
	if (workspaces <= 0) {
		if (!game.options.menu.gaFire.enabled) return;
		//try to free up a workspace if possible
		if (!freeWorkspace(amount)){
			amount = 1;
			if (!freeWorkspace(amount))
				return;
		}
	}
	var cost = game.jobs.Geneticist.cost.food;
	var price = Math.floor((cost[0] * Math.pow(cost[1], game.jobs.Geneticist.owned)) * ((Math.pow(cost[1], amount) - 1) / (cost[1] - 1)));
	if (game.resources.food.owned < price) {
		price = getNextGeneticistCost();
		if (game.resources.food.owned < price) return;
		amount = 1;
	}
	game.resources.food.owned -= price;
	game.jobs.Geneticist.owned += amount;
}

function ATremoveGeneticist(amount){
	if (game.jobs.Geneticist.owned < amount) return;
	game.jobs.Geneticist.owned -= amount;
}

 function ATGA() {
	var doubleGA = ((getPageSetting('ATGA')/game.global.breedTime*2)*100 < 80)
	var quadGA = ((getPageSetting('ATGA')/game.global.breedTime*4)*100 < 80)
	var decGA = ((getPageSetting('ATGA')/game.global.breedTime*10)*100 < 80)
	while (game.global.breedTime < getPageSetting('ATGA') && game.resources.food.owned >= getNextGeneticistCost()) {
		ATaddGeneticist();
	}
	var toremove = 1;
	if (doubleGA)
		toremove = 2;
	if (quadGA)
		toremove = 4;
	if (decGA) 
		toremove = 10;
	while (game.global.breedTime > getPageSetting('ATGA')) {
		ATremoveGeneticist(toremove);
	}
 }

var addbreedTimerInsideText;
function addBreedingBoxTimers() {
    var breedbarContainer = document.querySelector('#trimps > div.row');
    var addbreedTimerContainer = document.createElement("DIV");
    addbreedTimerContainer.setAttribute('class', "col-xs-11");
    addbreedTimerContainer.setAttribute('style', 'padding-right: 0;');
    addbreedTimerContainer.setAttribute("onmouseover", 'tooltip("Hidden Next Group Breed Timer", "customText", event, "How long your next army has been breeding for, or how many anticipation stacks you will have if you send a new army now. This number is what BetterAutoFight #4 refers to when it says NextGroupBreedTimer.")');
    addbreedTimerContainer.setAttribute("onmouseout", 'tooltip("hide")');
    var addbreedTimerInside = document.createElement("DIV");
    addbreedTimerInside.setAttribute('style', 'display: block;');
    var addbreedTimerInsideIcon = document.createElement("SPAN");
    addbreedTimerInsideIcon.setAttribute('class', "icomoon icon-clock");
    addbreedTimerInsideText = document.createElement("SPAN");
    addbreedTimerInsideText.id = 'hiddenBreedTimer';
    addbreedTimerInside.appendChild(addbreedTimerInsideIcon);
    addbreedTimerInside.appendChild(addbreedTimerInsideText);
    addbreedTimerContainer.appendChild(addbreedTimerInside);
    breedbarContainer.appendChild(addbreedTimerContainer);
}
addBreedingBoxTimers();

function addToolTipToArmyCount(){var a=document.getElementById("trimpsFighting");"tooltipadded"!=a.className&&(a.setAttribute("onmouseover","tooltip(\"Army Count\", \"customText\", event, \"To Fight now would add: \" + prettify(getArmyTime()) + \" seconds to the breed timer.\")"),a.setAttribute("onmouseout","tooltip(\"hide\")"),a.setAttribute("class","tooltipadded"))}

function abandonVoidMap() {
    var customVars = MODULES["breedtimer"];
    if (!getPageSetting('ForceAbandon')) return;
    if (game.global.mapsActive && getCurrentMapObject().location == "Void") {
            if (game.portal.Anticipation.level) {
                var antistacklimitv = 45;
	    if (!game.talents.patience.purchased)
	            antistacklimitv = 30;
	        if (((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) >= antistacklimitv && game.global.antiStacks < antistacklimitv) {
                    mapsClicked(true);
              	}
                else if (game.global.antiStacks == antistacklimitv)
                    mapsClicked(true);
            }
            else
                mapsClicked(true);
        }
        return;
}

function forceAbandonTrimps() {
    if (!getPageSetting('ForceAbandon')) return;
    if (!game.global.mapsUnlocked) return;
    if (game.global.mapsActive && getCurrentMapObject().location == "Void") return;
    if (game.global.preMapsActive) return;
    if (isActiveSpireAT() && !game.global.mapsActive) return;
    if (getPageSetting('AutoMaps')) {
        mapsClicked();
        if (game.global.switchToMaps || game.global.switchToWorld)
            mapsClicked();
    	} 
	else if (game.global.mapsActive) {
        mapsClicked();
        if (game.global.switchToMaps)
            mapsClicked();
        runMap();
    	} 
	else {
        mapsClicked();
        if (game.global.switchToMaps)
            mapsClicked();
        mapsClicked();
    }
    
}
