MODULES["breedtimer"] = {};
MODULES["breedtimer"].voidCheckPercent = 95;

function ATGA() {
	if (game.jobs.Geneticist.locked == false && getPageSetting('ATGA') == true && getPageSetting('ATGAtimer') > 0){
		var trimps = game.resources.trimps;
		var trimpsMax = trimps.realMax();
		var maxBreedable = new DecimalBreed(trimpsMax).minus(trimps.employed);
		var currentSend = game.resources.trimps.getCurrentSend();
		var potencyMod = new DecimalBreed(trimps.potency);
		var totalTime = DecimalBreed.log10(maxBreedable.div(maxBreedable.minus(currentSend))).div(DecimalBreed.log10(potencyMod)).div(10);
		var target = getPageSetting('ATGAtimer');
		var now = new Date().getTime();
		var decimalOwned = missingTrimps.add(trimps.owned);
		var timeRemaining = DecimalBreed.log10(maxBreedable.div(decimalOwned.minus(trimps.employed))).div(DecimalBreed.log10(potencyMod)).div(10);
			var thresh = new DecimalBreed(totalTime.mul(0.02));
			var compareTime;
			if (timeRemaining.cmp(1) > 0 && timeRemaining.cmp(target.add(1)) > 0){
				compareTime = new DecimalBreed(timeRemaining.add(-1));
			}
			else {
				compareTime = new DecimalBreed(totalTime);
			}
			if (!thresh.isFinite()) thresh = new Decimal(0);
			if (!compareTime.isFinite()) compareTime = new Decimal(999);
			var genDif = new DecimalBreed(Decimal.log10(target.div(compareTime)).div(Decimal.log10(1.02))).ceil();

			if (compareTime.cmp(target) < 0) {
						if (compareTime.cmp(target) < 0) {
				if (game.resources.food.owned * 0.01 < getNextGeneticistCost()) return;
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
