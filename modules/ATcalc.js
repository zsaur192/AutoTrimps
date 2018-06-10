var trimpATK = (calculateDamageAT());

function calculateDamageAT() {
var currentCalcAT = game.global.soldierCurrentAttack;    
var fluctuation = .2; //%fluctuation
	var maxFluct = -1;
	var minFluct = -1;
		//Situational Trimp damage increases
		if (game.jobs.Amalgamator.owned > 0){
			currentCalcAT *= game.jobs.Amalgamator.getDamageMult();
		}
		if (game.challenges.Electricity.stacks > 0) { //Electricity
			currentCalcAT *= (1 - (game.challenges.Electricity.stacks * 0.1));
		}
		if (game.global.antiStacks > 0) {
			currentCalcAT *= ((game.global.antiStacks * game.portal.Anticipation.level * game.portal.Anticipation.modifier) + 1);
			updateAntiStacks();
		}
		if (!game.global.mapsActive && game.global.mapBonus > 0){
			currentCalcAT *= ((game.global.mapBonus * .2) + 1);
		}
		if (game.global.titimpLeft >= 1 && game.global.mapsActive){
			currentCalcAT *= 2;
		}
		if (game.global.achievementBonus > 0){
			currentCalcAT *= (1 + (game.global.achievementBonus / 100));
		}
		if (game.global.challengeActive == "Discipline"){
			fluctuation = .995;
		}
		else if (game.portal.Range.level > 0){
			minFluct = fluctuation - (.02 * game.portal.Range.level);
		}
		if (game.global.challengeActive == "Decay"){
			currentCalcAT *= 5;
			currentCalcAT *= Math.pow(0.995, game.challenges.Decay.stacks);
		}
		if (game.global.roboTrimpLevel > 0){
			currentCalcAT *= ((0.2 * game.global.roboTrimpLevel) + 1);
		}
		if (game.global.challengeActive == "Lead" && ((game.global.world % 2) == 1)){
			currentCalcAT *= 1.5;
		}
		if (game.goldenUpgrades.Battle.currentBonus > 0){
			currentCalcAT *= game.goldenUpgrades.Battle.currentBonus + 1;
		}
		if (game.talents.voidPower.purchased && game.global.voidBuff){
			var vpAmt = (game.talents.voidPower2.purchased) ? ((game.talents.voidPower3.purchased) ? 65 : 35) : 15;
			currentCalcAT *= ((vpAmt / 100) + 1);
		}
		if (game.global.totalSquaredReward > 0){
			currentCalcAT *= ((game.global.totalSquaredReward / 100) + 1);
		}
		if (getEmpowerment() == "Ice"){
			currentCalcAT *= 1 + (1 - game.empowerments.Ice.getCombatModifier());
		}
		if (game.talents.magmamancer.purchased){
			currentCalcAT *= game.jobs.Magmamancer.getBonusPercent();
		}
		if (game.talents.stillRowing2.purchased){
			currentCalcAT *= ((game.global.spireRows * 0.06) + 1);
		}
		if (game.talents.healthStrength.purchased && mutations.Healthy.active()){
			currentCalcAT *= ((0.15 * mutations.Healthy.cellCount()) + 1);
		}
		if (game.global.sugarRush > 0){
			currentCalcAT *= sugarRush.getAttackStrength();
		}
		if (game.global.challengeActive == "Life") {
			currentCalcAT *= game.challenges.Life.getHealthMult();
		}
		if (game.singleRunBonuses.sharpTrimps.owned){
			currentCalcAT *= 1.5;
		}
		if (game.global.challengeActive == "Daily"){
			if (typeof game.global.dailyChallenge.minDamage !== 'undefined'){
				if (minFluct == -1) minFluct = fluctuation;
				minFluct += dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength);
			}
			if (typeof game.global.dailyChallenge.maxDamage !== 'undefined'){
				if (maxFluct == -1) maxFluct = fluctuation;
				maxFluct += dailyModifiers.maxDamage.getMult(game.global.dailyChallenge.maxDamage.strength);
			}
			if (typeof game.global.dailyChallenge.weakness !== 'undefined'){
				currentCalcAT *= dailyModifiers.weakness.getMult(game.global.dailyChallenge.weakness.strength, game.global.dailyChallenge.weakness.stacks);
			}
			if (typeof game.global.dailyChallenge.oddTrimpNerf !== 'undefined' && ((game.global.world % 2) == 1)){
					currentCalcAT *= dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength);
			}
			if (typeof game.global.dailyChallenge.evenTrimpBuff !== 'undefined' && ((game.global.world % 2) == 0)){
					currentCalcAT *= dailyModifiers.evenTrimpBuff.getMult(game.global.dailyChallenge.evenTrimpBuff.strength);
			}
			if (typeof game.global.dailyChallenge.rampage !== 'undefined'){
				currentCalcAT *= dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, game.global.dailyChallenge.rampage.stacks);
			}
		}
		if (Fluffy.isActive()){
			currentCalcAT *= Fluffy.getDamageModifier();
		}
        return currentCalcAT;

  }

