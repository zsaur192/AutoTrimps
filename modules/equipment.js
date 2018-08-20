MODULES["equipment"] = {};
//These can be changed (in the console) if you know what you're doing:
MODULES["equipment"].numHitsSurvived = 10;   //survive X hits in D stance or not enough Health.
MODULES["equipment"].numHitsSurvivedScry = 80;
MODULES["equipment"].enoughDamageCutoff = 4; //above this the game will buy attack equipment
MODULES["equipment"].capDivisor = 10; //Your Equipment cap divided by this will give you the lower cap for liquified and overkilled zones
MODULES["equipment"].alwaysLvl2 = true; //Always buys the 2nd level of equipment. Its the most effective.
MODULES["equipment"].waitTill60 = true; // 'Skip Gear Level 58&59', 'Dont Buy Gear during level 58 and 59, wait till level 60, when cost drops down to 10%
MODULES["equipment"].equipHealthDebugMessage = false;    //this repeats a message when you don't have enough health. set to false to stop the spam.

var equipmentList = {
    'Dagger': {
        Upgrade: 'Dagadder',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Mace': {
        Upgrade: 'Megamace',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Polearm': {
        Upgrade: 'Polierarm',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Battleaxe': {
        Upgrade: 'Axeidic',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Greatsword': {
        Upgrade: 'Greatersword',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Boots': {
        Upgrade: 'Bootboost',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Helmet': {
        Upgrade: 'Hellishmet',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Pants': {
        Upgrade: 'Pantastic',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Shoulderguards': {
        Upgrade: 'Smoldershoulder',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Breastplate': {
        Upgrade: 'Bestplate',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Arbalest': {
        Upgrade: 'Harmbalest',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Gambeson': {
        Upgrade: 'GambesOP',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Shield': {
        Upgrade: 'Supershield',
        Stat: 'health',
        Resource: 'wood',
        Equip: true
    },
    'Gym': {
        Upgrade: 'Gymystic',
        Stat: 'block',
        Resource: 'wood',
        Equip: false
    }
};
var mapresourcetojob = {"food": "Farmer", "wood": "Lumberjack", "metal": "Miner", "science": "Scientist"}; 


function equipEffect(gameResource, equip) {
    if (equip.Equip) {
        return gameResource[equip.Stat + 'Calculated'];
    } else {
        //That be Gym
        var oldBlock = gameResource.increase.by * gameResource.owned;
        var Mod = game.upgrades.Gymystic.done ? (game.upgrades.Gymystic.modifier + (0.01 * (game.upgrades.Gymystic.done - 1))) : 1;
        var newBlock = gameResource.increase.by * (gameResource.owned + 1) * Mod;
        return newBlock - oldBlock;
    }
}

function equipCost(gameResource, equip) {
    var price = parseFloat(getBuildingItemPrice(gameResource, equip.Resource, equip.Equip, 1));
    if (equip.Equip)
        price = Math.ceil(price * (Math.pow(1 - game.portal.Artisanistry.modifier, game.portal.Artisanistry.level)));
    else
        price = Math.ceil(price * (Math.pow(1 - game.portal.Resourceful.modifier, game.portal.Resourceful.level)));
    return price;
}

function PrestigeValue(what) {
    var name = game.upgrades[what].prestiges;
    var equipment = game.equipment[name];
    var stat;
    if (equipment.blockNow) stat = "block";
    else stat = (typeof equipment.health !== 'undefined') ? "health" : "attack";
    var toReturn = Math.round(equipment[stat] * Math.pow(1.19, ((equipment.prestige) * game.global.prestige[stat]) + 1));
    return toReturn;
}



function evaluateEquipmentEfficiency(equipName) {
    var equip = equipmentList[equipName];
    var gameResource = equip.Equip ? game.equipment[equipName] : game.buildings[equipName];
    if (equipName == 'Shield') {
        if (gameResource.blockNow) {
            equip.Stat = 'block';
        } else {
            equip.Stat = 'health';
        }
    }
    var Effect = equipEffect(gameResource, equip);
    var Cost = equipCost(gameResource, equip);
    var Factor = Effect / Cost;
    var StatusBorder = 'white';
    var Wall = false;

    var BuyWeaponUpgrades = ((getPageSetting('BuyWeaponsNew')==1) || (getPageSetting('BuyWeaponsNew')==2));
    var BuyArmorUpgrades  =  ((getPageSetting('BuyArmorNew')==1)  ||  (getPageSetting('BuyArmorNew')==2));
    if (!game.upgrades[equip.Upgrade].locked) {
        //Evaluating upgrade!
        var CanAfford = canAffordTwoLevel(game.upgrades[equip.Upgrade]);
        if (equip.Equip) {
            var NextEffect = PrestigeValue(equip.Upgrade);
            if ((game.global.challengeActive == "Scientist" && getScientistLevel() > 2) || (!BuyWeaponUpgrades && !BuyArmorUpgrades))
                var NextCost = Infinity;
            else
                var NextCost = Math.ceil(getNextPrestigeCost(equip.Upgrade) * Math.pow(1 - game.portal.Artisanistry.modifier, game.portal.Artisanistry.level));
            Wall = (NextEffect / NextCost > Factor);
        }


        if (!CanAfford) {
            StatusBorder = 'yellow';
        } else {
            if (!equip.Equip) {
                
                StatusBorder = 'red';
            } else {
                var CurrEffect = gameResource.level * Effect;
                var NeedLevel = Math.ceil(CurrEffect / NextEffect);
                var Ratio = gameResource.cost[equip.Resource][1];
                var NeedResource = NextCost * (Math.pow(Ratio, NeedLevel) - 1) / (Ratio - 1);
                if (game.resources[equip.Resource].owned > NeedResource) {
                    StatusBorder = 'red';
                } else {
                    StatusBorder = 'orange';
                }
            }
        }
    }
    if (game.jobs[mapresourcetojob[equip.Resource]].locked && (game.global.challengeActive != 'Metal')){

        Factor = 0;
        Wall = true;
    }

    var isLiquified = (game.options.menu.liquification.enabled && game.talents.liquification.purchased && !game.global.mapsActive && game.global.gridArray && game.global.gridArray[0] && game.global.gridArray[0].name == "Liquimp");
    var time = mapTimeEstimater();
    var isQuick = (time!=0) && (time < 25000);
    var cap = 100;
        if(equipmentList[equipName].Stat == 'health') cap = getPageSetting('CapEquiparm');
        if(equipmentList[equipName].Stat == 'attack') cap = getPageSetting('CapEquip2');
        }
    if ((isLiquified || isQuick) && cap > 0 && gameResource.level >= (cap / MODULES["equipment"].capDivisor)) {
        Factor = 0;
        Wall = true;
    }
    //CapEquip2
    else if (cap > 0 && gameResource.level >= cap) {
        Factor = 0;
        Wall = true;
    }
    //WaitTill60 (skip58&59 + wait for breaking the planet reduction) (now default)
    if (equipName != 'Gym' && game.global.world < 60 && game.global.world >= 58 && MODULES["equipment"].waitTill60){
        Wall = true;
    }
    //AlwaysLvl2 - Was AlwaysArmorLvl2 (now default)
    if (gameResource.level < 2 && MODULES["equipment"].alwaysLvl2) {
        Factor = 999 - gameResource.prestige;
    }
    //skip buying shields (w/ shieldblock) if we need gymystics
    if (equipName == 'Shield' && gameResource.blockNow &&
        game.upgrades['Gymystic'].allowed - game.upgrades['Gymystic'].done > 0)
        {
            needGymystic = true;
            Factor = 0;
            Wall = true;
            StatusBorder = 'orange';
        }
    return {
        Stat: equip.Stat,
        Factor: Factor,
        StatusBorder: StatusBorder,
        Wall: Wall,
        Cost: Cost
    };
}

var resourcesNeeded;
var Best;
function autoLevelEquipment() {
    if (!(baseDamage > 0)) return;
    
    resourcesNeeded = {"food": 0, "wood": 0, "metal": 0, "science": 0, "gems": 0};  
    Best = {};
    var keys = ['healthwood', 'healthmetal', 'attackmetal', 'blockwood'];
    for (var i = 0; i < keys.length; i++) {
        Best[keys[i]] = {
            Factor: 0,
            Name: '',
            Wall: false,
            StatusBorder: 'white',
            Cost: 0
        };
    }
//EQUIPMENT HAS ITS OWN DAMAGE CALC SECTION:
    var enemyDamage = getEnemyMaxAttack(game.global.world + 1, 50, 'Snimp', 1.2);
    enemyDamage = calcDailyAttackMod(enemyDamage);
    var enemyHealth = getEnemyMaxHealth(game.global.world + 1);
    var spirecheck = isActiveSpireAT();
    if (spirecheck) {
        var exitcell = getPageSetting('ExitSpireCell');
        var cell = (!game.global.mapsActive && !game.global.preMapsActive) ? game.global.lastClearedCell : 50;
        if (exitcell > 1)
            cell = exitcell;
        enemyDamage = getSpireStats(cell, "Snimp", "attack");
        enemyDamage = calcDailyAttackMod(enemyDamage); 
        enemyHealth = getSpireStats(cell, "Snimp", "health");
    }

    if(game.global.challengeActive == "Toxicity") {

        if(game.global.world < 61)
            enemyDamage *= 2;
        enemyHealth *= 2;
    }
    if(game.global.challengeActive == 'Lead') {
        enemyDamage *= 2.5;
        enemyHealth *= 7;
    }
    var pierceMod = (game.global.brokenPlanet && !game.global.mapsActive) ? getPierceAmt() : 0;
    var enoughHealthE,enoughDamageE;
    const FORMATION_MOD_1 = game.upgrades.Dominance.done ? 2 : 1;
    var numHits = MODULES["equipment"].numHitsSurvived;
    var numHitsScry = MODULES["equipment"].numHitsSurvivedScry;
    var min_zone = getPageSetting('ScryerMinZone');
    var max_zone = getPageSetting('ScryerMaxZone');
    var valid_min = game.global.world >= min_zone;
    var valid_max = max_zone <= 0 || game.global.world < max_zone;
    enoughHealthE = !(doVoids && voidCheckPercent > 0) &&
        (baseHealth/FORMATION_MOD_1 > numHits * (enemyDamage - baseBlock/FORMATION_MOD_1 > 0 ? enemyDamage - baseBlock/FORMATION_MOD_1 : enemyDamage * pierceMod)) &&
        (!(valid_min && valid_max) || (baseHealth/2 > numHitsScry * (enemyDamage - baseBlock/2 > 0 ? enemyDamage - baseBlock/2 : enemyDamage * pierceMod)));
    enoughDamageE = (baseDamage * MODULES["equipment"].enoughDamageCutoff > enemyHealth);
    if (!enoughHealthE && MODULES["equipment"].equipHealthDebugMessage)
        debug("Equipment module thought there was not enough health","equips");

//PRESTIGE and UPGRADE SECTION:
    for (var equipName in equipmentList) {
        var equip = equipmentList[equipName];
        var gameResource = equip.Equip ? game.equipment[equipName] : game.buildings[equipName];
        if (!gameResource.locked) {
            var $equipName = document.getElementById(equipName);
            $equipName.style.color = 'white';   //reset
            var evaluation = evaluateEquipmentEfficiency(equipName);
            var BKey = equip.Stat + equip.Resource;

            if (Best[BKey].Factor === 0 || Best[BKey].Factor < evaluation.Factor) {
                Best[BKey].Factor = evaluation.Factor;
                Best[BKey].Name = equipName;
                Best[BKey].Wall = evaluation.Wall;
                Best[BKey].StatusBorder = evaluation.StatusBorder;
            }
            Best[BKey].Cost = evaluation.Cost;
            resourcesNeeded[equip.Resource] += Best[BKey].Cost;
            
            if (evaluation.Wall)
                $equipName.style.color = 'yellow';
            $equipName.style.border = '1px solid ' + evaluation.StatusBorder;

            var $equipUpgrade = document.getElementById(equip.Upgrade);
            if (evaluation.StatusBorder != 'white' && evaluation.StatusBorder != 'yellow' && $equipUpgrade)
                $equipUpgrade.style.color = evaluation.StatusBorder;
            if (evaluation.StatusBorder == 'yellow' && $equipUpgrade) 
                $equipUpgrade.style.color = 'white';
            if (equipName == 'Gym' && needGymystic) {
                $equipName.style.color = 'white';
                $equipName.style.border = '1px solid white';
                if ($equipUpgrade) {
                    $equipUpgrade.style.color = 'red';
                    $equipUpgrade.style.border = '2px solid red';
                }
            }



            if (evaluation.StatusBorder == 'red' && !(game.global.world < 60 && game.global.world >= 58 && MODULES["equipment"].waitTill60)) {
                var BuyWeaponUpgrades = ((getPageSetting('BuyWeaponsNew')==1) || (getPageSetting('BuyWeaponsNew')==2));
                var BuyArmorUpgrades = ((getPageSetting('BuyArmorNew')==1) || (getPageSetting('BuyArmorNew')==2));
                var DelayArmorWhenNeeded = getPageSetting('DelayArmorWhenNeeded');
                if
                (
                    ( BuyWeaponUpgrades && equipmentList[equipName].Stat == 'attack' )
                        ||
                    ( BuyWeaponUpgrades && equipmentList[equipName].Stat == 'block' )
                        ||
                    ( BuyArmorUpgrades && equipmentList[equipName].Stat == 'health' &&

                        (
                            ( DelayArmorWhenNeeded && !shouldFarm)  // not during "Farming" mode
                                ||                                                       //     or
                            ( DelayArmorWhenNeeded && enoughDamageE) //  has enough damage (not in "Wants more Damage" mode)
                                ||                                                       //     or
                            ( DelayArmorWhenNeeded && !enoughDamageE && !enoughHealthE) // if neither enough dmg or health, then tis ok to buy.
                                ||
                            ( DelayArmorWhenNeeded && equipmentList[equipName].Resource == 'wood')
                                ||
                            ( !DelayArmorWhenNeeded) //or when its off.
                        )
                    )
                )
                {
                    var upgrade = equipmentList[equipName].Upgrade;
                    if (getPageSetting('ultwind') >= 1 && game.global.world >= getPageSetting('ultwind') && HDratioy() < getPageSetting('ultwindcut')) return;
                    if (getEmpowerment() == "Wind" && HDratioy() <= getPageSetting('windcutoff') && getPageSetting('hardcorewind') >= 1 && game.global.world >= getPageSetting('hardcorewind') && (game.global.world < getPageSetting('hardcorewindmax') || getPageSetting('hardcorewindmax')<=0) && game.global.challengeActive != "Daily") return;
                    if (getEmpowerment() == "Wind" && HDratioy() <= getPageSetting('dwindcutoff') && getPageSetting('dhardcorewind') >= 1 && game.global.world >= getPageSetting('dhardcorewind') && (game.global.world < getPageSetting('dhardcorewindmax') || getPageSetting('dhardcorewindmax')<=0) && game.global.challengeActive == "Daily") return;
                    if (upgrade != "Gymystic")
                        debug('Upgrading ' + upgrade + " - Prestige " + game.equipment[equipName].prestige, "equips", '*upload');
                    else
                        debug('Upgrading ' + upgrade + " # " + game.upgrades[upgrade].allowed, "equips", '*upload');
                    buyUpgrade(upgrade, true, true);
                }
                else {
                    $equipName.style.color = 'orange';
                    $equipName.style.border = '2px solid orange';
                }
            }
        }
    }

//LEVELING EQUIPMENT SECTION:
    preBuy();
    game.global.buyAmt = 1
    var BuyWeaponLevels = ((getPageSetting('BuyWeaponsNew')==1) || (getPageSetting('BuyWeaponsNew')==3));
    var BuyArmorLevels = ((getPageSetting('BuyArmorNew')==1) || (getPageSetting('BuyArmorNew')==3));
    for (var stat in Best) {
        var eqName = Best[stat].Name;
        var $eqName = document.getElementById(eqName);
        if (eqName !== '') {
            var DaThing = equipmentList[eqName];
            if (eqName == 'Gym' && needGymystic) {
                $eqName.style.color = 'white';
                $eqName.style.border = '1px solid white';
                continue;
            } else {
                $eqName.style.color = Best[stat].Wall ? 'orange' : 'red';
                $eqName.style.border = '2px solid red';
            }
            //If we are doing the MaxMapBonusAfterZone stuff, equipment should be upgraded to its cap.
            var maxmap = getPageSetting('MaxMapBonusAfterZone') && doMaxMapBonus;
            //If we're considering an attack item, we want to buy weapons if we don't have enough damage, or if we don't need health (so we default to buying some damage)
            if (BuyWeaponLevels && DaThing.Stat == 'attack' && (!enoughDamageE || enoughHealthE || maxmap || spirecheck)) {
                                    if (getPageSetting('ultwind') >= 1 && game.global.world >= getPageSetting('ultwind') && HDratioy() < getPageSetting('ultwindcut')) return;
                if (getEmpowerment() == "Wind" && HDratioy() <= getPageSetting('windcutoff') && getPageSetting('hardcorewind') >= 1 && game.global.world >= getPageSetting('hardcorewind') && (game.global.world < getPageSetting('hardcorewindmax') || getPageSetting('hardcorewindmax')<=0) && game.global.challengeActive != "Daily") return;
                if (getEmpowerment() == "Wind" && HDratioy() <= getPageSetting('dwindcutoff') && getPageSetting('dhardcorewind') >= 1 && game.global.world >= getPageSetting('dhardcorewind') && (game.global.world < getPageSetting('dhardcorewindmax') || getPageSetting('dhardcorewindmax')<=0) && game.global.challengeActive == "Daily") return;
                if (DaThing.Equip && !Best[stat].Wall && canAffordBuilding(eqName, null, null, true)) {
                    debug('Leveling equipment ' + eqName, "equips", '*upload3');
                    game.global.buyAmt = getPageSetting('gearamounttobuy');
                    buyEquipment(eqName, null, true);
                }
            }
            if (BuyArmorLevels && (DaThing.Stat == 'health' || DaThing.Stat == 'block') && (!enoughHealthE || maxmap || spirecheck)) {
                if (DaThing.Equip && !Best[stat].Wall && canAffordBuilding(eqName, null, null, true)) {
                    debug('Leveling equipment ' + eqName, "equips", '*upload3');
                    game.global.buyAmt = getPageSetting('gearamounttobuy');
                    buyEquipment(eqName, null, true);
                }
            }
            //Always LVL 2:
            var aalvl2 = MODULES["equipment"].alwaysLvl2; //was getPageSetting('AlwaysArmorLvl2');
            if (BuyArmorLevels && (DaThing.Stat == 'health') && aalvl2 && game.equipment[eqName].level < 2){
                if (DaThing.Equip && !Best[stat].Wall && canAffordBuilding(eqName, null, null, true)) {
                    game.global.buyAmt = 1
                    debug('Leveling equipment ' + eqName + " (AlwaysLvl2)", "equips", '*upload3');
                    buyEquipment(eqName, null, true);
                }
            }
        }
    }
    postBuy();
}

//check if we have cap to 10 equip on, and we are capped for all attack weapons
function areWeAttackLevelCapped() {
    var attack = [];
    for (var equipName in equipmentList) {
        var equip = equipmentList[equipName];
        var gameResource = equip.Equip ? game.equipment[equipName] : game.buildings[equipName];
        if (!gameResource.locked) {
            var evaluation = evaluateEquipmentEfficiency(equipName);
            if (evaluation.Stat == "attack")
                attack.push(evaluation);
        }
    }
    return attack.every(evaluation => (evaluation.Factor == 0 && evaluation.Wall == true));
}
