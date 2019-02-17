MODULES["magmite"] = {};
MODULES["magmite"].algorithm = 2;

function autoMagmiteSpender() {
 try {
    var didSpend = false;
    var permanames = ["Slowburn", "Shielding", "Storage", "Hybridization", "Supervision", "Simulacrum"];
    for (var i=0; i < permanames.length; i++) {
        var item = permanames[i];
        var upgrade = game.permanentGeneratorUpgrades[item];
        if (typeof upgrade === 'undefined')
            return;
        if (upgrade.owned)
            continue;
        var cost = upgrade.cost;
        if (game.global.magmite >= cost) {
            buyPermanentGeneratorUpgrade(item);
            debug("Auto Spending " + cost + " Magmite on: " + item, "magmite");
            didSpend = true;
        }
    }
    var hasOv = game.permanentGeneratorUpgrades.Hybridization.owned && game.permanentGeneratorUpgrades.Storage.owned;
    var ovclock = game.generatorUpgrades.Overclocker;
    if (hasOv && ((getPageSetting('spendmagmitesetting')==0 || getPageSetting('spendmagmitesetting')==3) || !ovclock.upgrades) && (game.global.magmite >= ovclock.cost())) {
        debug("Auto Spending " + ovclock.cost() + " Magmite on: Overclocker" + (ovclock.upgrades ? " #" + (ovclock.upgrades + 1) : ""), "magmite");
        buyGeneratorUpgrade('Overclocker');
    }

    var repeat = (getPageSetting('spendmagmitesetting')==0 || getPageSetting('spendmagmitesetting')==1);
    while (repeat) {
        if (MODULES["magmite"].algorithm == 2) {
            var eff = game.generatorUpgrades["Efficiency"];
            var cap = game.generatorUpgrades["Capacity"];
            var sup = game.generatorUpgrades["Supply"];
            if ((typeof eff === 'undefined')||(typeof cap === 'undefined')||(typeof sup === 'undefined'))
                return;
            var EffObj = {};
                EffObj.name= "Efficiency";
                EffObj.lvl = eff.upgrades + 1;
                EffObj.cost= eff.cost();
                EffObj.benefit= EffObj.lvl*0.1;
                EffObj.effInc= (((1+EffObj.benefit)/(1+((EffObj.lvl-1)*0.1))-1)*100);
                EffObj.miCostPerPct= EffObj.cost /  EffObj.effInc;
            var CapObj = {};
                CapObj.name= "Capacity";
                CapObj.lvl = cap.upgrades + 1;
                CapObj.cost= cap.cost();
                CapObj.totalCap= 3+(0.4*CapObj.lvl);
                CapObj.benefit= Math.sqrt(CapObj.totalCap);
                CapObj.effInc= ((CapObj.benefit/Math.sqrt(3+(0.4*(CapObj.lvl-1)))-1)*100);
                CapObj.miCostPerPct= CapObj.cost / CapObj.effInc;
            var upgrade,item;
            if (EffObj.miCostPerPct <= CapObj.miCostPerPct)
                item = EffObj.name;
            else {
                const supCost = sup.cost();
                var wall = getPageSetting('SupplyWall');
                if (!wall)
                    item = (CapObj.cost <= supCost)
                        ? CapObj.name : "Supply";
                else if (wall == 1)
                    item = "Capacity";
                else if (wall < 0)
                    item = (supCost <= (CapObj.cost * -wall))
                        ? "Supply" : "Capacity";
                else
                    item = (CapObj.cost <= (supCost * wall))
                        ? "Capacity" : "Supply";
            }
            upgrade = game.generatorUpgrades[item];
            if (game.global.magmite >= upgrade.cost()) {
                debug("Auto Spending " + upgrade.cost() + " Magmite on: " + item + " #" + (game.generatorUpgrades[item].upgrades+1), "magmite");
                buyGeneratorUpgrade(item);
                didSpend = true;
            }
            else
                repeat = false;
        }
        
    }
 }
 catch (err) {
     debug("AutoSpendMagmite Error encountered: " + err.message,"magmite");
 }
 if (didSpend)
     debug("Leftover magmite: " + game.global.magmite,"magmite");
}

/*function calcMiSpent(upgrade) {
	nuloom();
	var heirloom = getSelectedHeirloom();
	var tot = 0;
	var thisMod = heirloom.mods[slot];
	var dummyHeirloom = setupDummyHeirloom(heirloom, thisMod);
	tot = countPriceOfUpgrades(dummyHeirloom, heirloom.mods[slot][3]);
	var result = Math.floor(tot) + Math.floor(game.heirlooms.values[heirloom.rarity] / 2);
	if (isNumberBad(result)) return 0;
	return result;
}

function miRatio() {

    //Find Mi Ratio
    var eff, cap, sup, oc, effspend, capspend, supspend, ocspend;

    eff = 
    cap = 
    sup = 
    oc = 

    var total = (slot1 + slot2 + slot3 + slot4 + slot5);

    slot1r = (slot1 != 0 && calcLoomNuInfinity(0)) ? (total / slot1) : 1;
    slot2r = (slot2 != 0 && calcLoomNuInfinity(1)) ? (total / slot2) : 1;
    slot3r = (slot3 != 0 && calcLoomNuInfinity(2)) ? (total / slot3) : 1;
    slot4r = (slot4 != 0 && calcLoomNuInfinity(3)) ? (total / slot4) : 1;
    slot5r = (slot5 != 0 && calcLoomNuInfinity(4)) ? (total / slot5) : 1;

    //Find Player ratio
    if (getPageSetting('autonu') == true && getPageSetting('rationu') == 0 && getPageSetting('heirloomnu') != undefined) { 
	slot1spend = (getPageSetting('slot1nu') > 0 && calcLoomNuInfinity(0)) ? getPageSetting('slot1nu') : 0;
	slot2spend = (getPageSetting('slot2nu') > 0 && calcLoomNuInfinity(1)) ? getPageSetting('slot2nu') : 0;
	slot3spend = (getPageSetting('slot3nu') > 0 && calcLoomNuInfinity(2)) ? getPageSetting('slot3nu') : 0;
	slot4spend = (getPageSetting('slot4nu') > 0 && calcLoomNuInfinity(3)) ? getPageSetting('slot4nu') : 0;
	slot5spend = (getPageSetting('slot5nu') > 0 && calcLoomNuInfinity(4)) ? getPageSetting('slot5nu') : 0;
	}
	
    if (getPageSetting('autonu') == true && getPageSetting('rationu') == 1 && getPageSetting('heirloomnu') != undefined) { 
	slot1spend = (calcLoomNuInfinity(0)) ? calcAutoNuRatio(0) : 0;
	slot2spend = (calcLoomNuInfinity(1)) ? calcAutoNuRatio(1) : 0;
	slot3spend = (calcLoomNuInfinity(2)) ? calcAutoNuRatio(2) : 0;
	slot4spend = (calcLoomNuInfinity(3)) ? calcAutoNuRatio(3) : 0;
	slot5spend = (calcLoomNuInfinity(4)) ? calcAutoNuRatio(4) : 0;
	}

    //Find Next Spend
    var slot1final = slot1spend - slot1r;
    var slot2final = slot2spend - slot2r;
    var slot3final = slot3spend - slot3r;
    var slot4final = slot4spend - slot4r;
    var slot5final = slot5spend - slot5r;

    var ratios = [];
    if (slot1final != -1)
	ratios.push(slot1final);
    if (slot2final != -1)
	ratios.push(slot2final);
    if (slot3final != -1)
	ratios.push(slot3final);
    if (slot4final != -1)
	ratios.push(slot4final);
    if (slot5final != -1)
	ratios.push(slot5final);

    ratios.sort(function(a, b){return b-a;});

    //Return Next Spend
    if (ratios[0] == slot1final)
	return 0;
    if (ratios[0] == slot2final)
	return 1;
    if (ratios[0] == slot3final)
	return 2;
    if (ratios[0] == slot4final)
	return 3;
    if (ratios[0] == slot5final)
	return 4;
}*/


function autoGenerator() {
var defaultgenstate = getPageSetting('defaultgen');
var beforefuelstate = getPageSetting('beforegen');
  if (game.global.world < 230) return;
  if (game.global.dailyChallenge.seed && getPageSetting('AutoGenDC') == 1 && game.global.generatorMode != 1)
      changeGeneratorState(1);
  if (game.global.dailyChallenge.seed && getPageSetting('AutoGenDC') == 1 && game.global.generatorMode == 1)
      return;
  if (game.global.dailyChallenge.seed && getPageSetting('AutoGenDC') == 2 && game.global.generatorMode != 2)
      changeGeneratorState(2);
  if (game.global.dailyChallenge.seed && getPageSetting('AutoGenDC') == 2 && game.global.generatorMode == 2)
      return;
  if (game.global.runningChallengeSquared && getPageSetting('AutoGenC2') == 1 && game.global.generatorMode != 1)
      changeGeneratorState(1);
  if (game.global.runningChallengeSquared && getPageSetting('AutoGenC2') == 1 && game.global.generatorMode == 1)
      return;
  if (game.global.runningChallengeSquared && getPageSetting('AutoGenC2') == 2 && game.global.generatorMode != 2)
      changeGeneratorState(2);
  if (game.global.runningChallengeSquared && getPageSetting('AutoGenC2') == 2 && game.global.generatorMode == 2)
      return;
  if (getPageSetting('fuellater') < 1 && game.global.generatorMode != beforefuelstate)   
      changeGeneratorState(beforefuelstate);
  if (getPageSetting('fuellater') < 1 && game.global.generatorMode == beforefuelstate)
      return;
  if (getPageSetting('fuellater') >= 1 && game.global.world < getPageSetting('fuellater') && game.global.generatorMode != beforefuelstate)
      changeGeneratorState(beforefuelstate);
  if (getPageSetting('fuellater') >= 1 && game.global.world < getPageSetting('fuellater') && game.global.generatorMode == beforefuelstate)
      return;
  if (getPageSetting('fuellater') >= 1 && game.global.world >= getPageSetting('fuellater') && game.global.world < getPageSetting('fuelend') && game.global.generatorMode != 1)
      changeGeneratorState(1);
  if (getPageSetting('fuellater') >= 1 && game.global.world >= getPageSetting('fuellater') && game.global.world < getPageSetting('fuelend') && game.global.generatorMode == 1)
      return;
  if (getPageSetting('fuelend') < 1 && game.global.world >= getPageSetting('fuellater') && game.global.generatorMode != 1)
      changeGeneratorState(1);
  if (getPageSetting('fuelend') < 1 && game.global.world >= getPageSetting('fuellater') && game.global.generatorMode == 1)
      return;
  if (getPageSetting('fuelend') >= 1 && game.global.world >= getPageSetting('fuelend') && game.global.generatorMode != defaultgenstate)
      changeGeneratorState(defaultgenstate);
  if (getPageSetting('fuelend') >= 1 && game.global.world >= getPageSetting('fuelend') && game.global.generatorMode == defaultgenstate)
      return;
  }
