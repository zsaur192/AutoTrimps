MODULES["magmite"] = {};
//These can be changed (in the console) if you know what you're doing:
MODULES["magmite"].algorithm = 2;   //2 is advanced cost/benefit calculation between capacity/efficiency. 1 is buy-cheapest-upgrade.

//Auto Magmite spender before portal
function autoMagmiteSpender() {
 try {
    var didSpend = false;
//Part #1:
    //list of available permanent one-and-done upgrades
    var permanames = ["Slowburn", "Shielding", "Storage", "Hybridization", "Supervision", "Simulacrum"];
    //cycle through:
    for (var i=0; i < permanames.length; i++) {
        var item = permanames[i];
        var upgrade = game.permanentGeneratorUpgrades[item];
        if (typeof upgrade === 'undefined')
            return; //error-resistant
        //skip owned perma-upgrades
        if (upgrade.owned)
            continue;
        var cost = upgrade.cost;
        //if we can afford anything, buy it:
        if (game.global.magmite >= cost) {
            buyPermanentGeneratorUpgrade(item);
            debug("Auto Spending " + cost + " Magmite on: " + item, "magmite");
            didSpend = true;
        }
    }
    // then consider overclocker if we can afford it
    var hasOv = game.permanentGeneratorUpgrades.Hybridization.owned && game.permanentGeneratorUpgrades.Storage.owned;
    var ovclock = game.generatorUpgrades.Overclocker;
    if (hasOv && ((getPageSetting('spendmagmitesetting')==0 || getPageSetting('spendmagmitesetting')==3) || !ovclock.upgrades) && (game.global.magmite >= ovclock.cost())) {
        debug("Auto Spending " + ovclock.cost() + " Magmite on: Overclocker" + (ovclock.upgrades ? " #" + (ovclock.upgrades + 1) : ""), "magmite");
        buyGeneratorUpgrade('Overclocker');
    }

//Part #2
    var repeat = (getPageSetting('spendmagmitesetting')==0 || getPageSetting('spendmagmitesetting')==1);
    while (repeat) {
        if (MODULES["magmite"].algorithm == 2) {
            //Method 2:
            //calculate cost-efficiency of "Efficiency"&"Capacity"
            var eff = game.generatorUpgrades["Efficiency"];
            var cap = game.generatorUpgrades["Capacity"];
            var sup = game.generatorUpgrades["Supply"];
            if ((typeof eff === 'undefined')||(typeof cap === 'undefined')||(typeof sup === 'undefined'))
                return; //error-resistant
            var EffObj = {};
                EffObj.name= "Efficiency";
                EffObj.lvl = eff.upgrades + 1;  //Calc for next level
                EffObj.cost= eff.cost();    //EffObj.lvl*8;    //cost= 8mi/lvl
                EffObj.benefit= EffObj.lvl*0.1;   //benefit= +10%/lvl
                EffObj.effInc= (((1+EffObj.benefit)/(1+((EffObj.lvl-1)*0.1))-1)*100); //eff. % inc.
                EffObj.miCostPerPct= EffObj.cost /  EffObj.effInc;
            var CapObj = {};
                CapObj.name= "Capacity";
                CapObj.lvl = cap.upgrades + 1;  //Calc for next level
                CapObj.cost= cap.cost();    //CapObj.lvl*32;    //cost= 32mi/lvl
                CapObj.totalCap= 3+(0.4*CapObj.lvl);
                CapObj.benefit= Math.sqrt(CapObj.totalCap);
                CapObj.effInc= ((CapObj.benefit/Math.sqrt(3+(0.4*(CapObj.lvl-1)))-1)*100); //eff. % inc.
                CapObj.miCostPerPct= CapObj.cost / CapObj.effInc;
            var upgrade,item;
            //(try to) Buy Efficiency if its cheaper than Capacity in terms of Magmite cost per percent.
            if (EffObj.miCostPerPct <= CapObj.miCostPerPct)
                item = EffObj.name;
            //if not, (try to) Buy Capacity if its cheaper than the cost of Supply.
            else {
                const supCost = sup.cost();
                var wall = getPageSetting('SupplyWall');
                // If no wall, try to buy Capacity if it's cheaper.
                if (!wall)
                    item = (CapObj.cost <= supCost)
                        ? CapObj.name : "Supply";
                // If 1, disable Supply
                else if (wall == 1)
                    item = "Capacity";
                // If negative, prioritize Supply after applying cap.
                else if (wall < 0)
                    item = (supCost <= (CapObj.cost * -wall))
                        ? "Supply" : "Capacity";
                // If positive, throttle Supply after applying cap.
                else
                    item = (CapObj.cost <= (supCost * wall))
                        ? "Capacity" : "Supply";
            }
            upgrade = game.generatorUpgrades[item];
            //IF we can afford anything, buy it:
            if (game.global.magmite >= upgrade.cost()) {
                debug("Auto Spending " + upgrade.cost() + " Magmite on: " + item + " #" + (game.generatorUpgrades[item].upgrades+1), "magmite");
                buyGeneratorUpgrade(item);
                didSpend = true;
            }
            //if we can't, exit the loop
            else
                repeat = false;
        }
        else if (MODULES["magmite"].algorithm == 1) {
            //Method 1(old):
            //list of available multi upgrades
            var names = ["Efficiency","Capacity","Supply"];
            var lowest = [null,null];   //keep track of cheapest one
            //cycle through:
            for (var i=0; i < names.length; i++) {
                var item = names[i];
                var upgrade = game.generatorUpgrades[item];
                if (typeof upgrade === 'undefined')
                    return; //error-resistant
                var cost = upgrade.cost();
                //store the first upgrade once
                if (lowest[1] == null)
                    lowest = [item,cost];
                //always load cheapest one in.
                else if (cost < lowest[1])
                    lowest = [item,cost];
            }
            //if we can afford anything, buy it:
            if (game.global.magmite >= lowest[1]) {
                buyGeneratorUpgrade(lowest[0]);
                debug("Auto Spending " + lowest[1] + " Magmite on: " + lowest[0] + " #" + game.generatorUpgrades[lowest[0]].upgrades, "magmite");
                didSpend = true;
            }
            //if we can't, exit the loop
            else
                repeat = false;
        }
    }
 }
 //dont get trapped in a while loop cause something stupid happened.
 catch (err) {
     debug("AutoSpendMagmite Error encountered: " + err.message,"magmite");
 }
 //print the result
 if (didSpend)
     debug("Leftover magmite: " + game.global.magmite,"magmite");
}

function autoGenerator() {
  const MI = 0, FUEL = 1, HYBRID = 2;
  const defaultgenstate = (getPageSetting('defaultgen') == 0) || getPageSetting('defaultgen') == 1) || getPageSetting('defaultgen') == 2);
  /*if (getPageSetting('defaultgen') == 0)
      defaultgenstate = 0;
  if (getPageSetting('defaultgen') == 1)
      defaultgenstate = 1;
  if (getPageSetting('defaultgen') == 2)
      defaultgenstate = 2;*/
  /*if (game.global.dailyChallenge.seed && getPageSetting('AutoGenDC') == 0 && game.global.generatorMode != defaultgen)
      changeGeneratorState(defaultgen);
  if (game.global.dailyChallenge.seed && getPageSetting('AutoGenDC') == 0 && game.global.generatorMode == defaultgen)
      return;*/
  if (game.global.dailyChallenge.seed && getPageSetting('AutoGenDC') == 1 && game.global.generatorMode != 1)
      changeGeneratorState(1);
  if (game.global.dailyChallenge.seed && getPageSetting('AutoGenDC') == 1 && game.global.generatorMode == 1)
      return;
  if (game.global.dailyChallenge.seed && getPageSetting('AutoGenDC') == 2 && game.global.generatorMode != 2)
      changeGeneratorState(2);
  if (game.global.dailyChallenge.seed && getPageSetting('AutoGenDC') == 2 && game.global.generatorMode == 2)
      return;
  /*if (game.global.runningChallengeSquared && getPageSetting('AutoGenC2') == 0 && game.global.generatorMode != defaultgen)
      changeGeneratorState(defaultgen);
  if (game.global.runningChallengeSquared && getPageSetting('AutoGenC2') == 0 && game.global.generatorMode == defaultgen)
      return;*/
  if (game.global.runningChallengeSquared && getPageSetting('AutoGenC2') == 0 && game.global.generatorMode != 1)
      changeGeneratorState(1);
  if (game.global.runningChallengeSquared && getPageSetting('AutoGenC2') == 0 && game.global.generatorMode == 1)
      return;
  if (game.global.runningChallengeSquared && getPageSetting('AutoGenC2') == 0 && game.global.generatorMode != 2)
      changeGeneratorState(2);
  if (game.global.runningChallengeSquared && getPageSetting('AutoGenC2') == 0 && game.global.generatorMode == 2)
      return;
  if (getPageSetting('fuellater') < 1 && (game.global.world >= 230)   
      changeGeneratorState(defaultgenstate);
  if (getPageSetting('fuellater') >= 1 && game.global.world < getPageSetting('fuellater') && game.global.generatorMode > 0)
      changeGeneratorState(0);
  if (getPageSetting('fuellater') >= 1 && game.global.world < getPageSetting('fuellater') && game.global.generatorMode == 0)
      return;
  if (getPageSetting('fuelend') >= 1 && game.global.world >= getPageSetting('fuelend') && game.global.generatorMode != defaultgenstate)
      changeGeneratorState(defaultgenstate);
  if (getPageSetting('fuelend') >= 1 && game.global.world >= getPageSetting('fuelend') && game.global.generatorMode == defaultgenstate)
      return;
  }

/*function autoGenOverrides() {
  const overriden = (game.global.runningChallengeSquared && getPageSetting('AutoGenC2')) || (game.global.dailyChallenge.seed && getPageSetting('AutoGenDC'));
  if (overriden && (game.global.generatorMode != overriden))
    changeGeneratorState(overriden);
  return overriden;
}*/
