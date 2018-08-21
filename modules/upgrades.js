//MODULES["upgrades"] = {};
var upgradeList = ['Miners', 'Scientists', 'Coordination', 'Speedminer', 'Speedlumber', 'Speedfarming', 'Speedscience', 'Speedexplorer', 'Megaminer', 'Megalumber', 'Megafarming', 'Megascience', 'Efficiency', 'TrainTacular', 'Trainers', 'Explorers', 'Blockmaster', 'Battle', 'Bloodlust', 'Bounty', 'Egg', 'Anger', 'Formations', 'Dominance', 'Barrier', 'UberHut', 'UberHouse', 'UberMansion', 'UberHotel', 'UberResort', 'Trapstorm', 'Gigastation', 'Shieldblock', 'Potency', 'Magmamancers'];

//Buys all available non-equip upgrades listed in var upgradeList
function buyUpgrades() {
    for (var upgrade in upgradeList) {
        upgrade = upgradeList[upgrade];
        var gameUpgrade = game.upgrades[upgrade];
        var available = (gameUpgrade.allowed > gameUpgrade.done && canAffordTwoLevel(gameUpgrade));
        if (upgrade == 'Coordination' && (!canAffordCoordinationTrimps() || (getPageSetting('ultwind') >= 1 && game.global.world >= getPageSetting('ultwind') && HDratioy() < getPageSetting('ultwindcut')))) continue;
        if (upgrade == 'Coordination' && (getPageSetting('BuyUpgradesNew') == 2 || !canAffordCoordinationTrimps() || (getPageSetting('amalcoord')==true && game.global.world < getPageSetting('fuelend') && HDratioy() < getPageSetting('amalcoordhd')))) continue;
        if (upgrade == 'Coordination' && getEmpowerment() == "Wind" && HDratioy() <= getPageSetting('windcutoff') && getPageSetting('hardcorewind') >= 1 && game.global.world >= getPageSetting('hardcorewind') && (game.global.world < getPageSetting('hardcorewindmax') || getPageSetting('hardcorewindmax')<=0) && game.global.challengeActive != "Daily") continue;
        if (upgrade == 'Coordination' && getEmpowerment() == "Wind" && HDratioy() <= getPageSetting('dwindcutoff') && getPageSetting('dhardcorewind') >= 1 && game.global.world >= getPageSetting('dhardcorewind') && (game.global.world < getPageSetting('dhardcorewindmax') || getPageSetting('dhardcorewindmax')<=0) && game.global.challengeActive == "Daily") continue;
        if (upgrade == 'Shieldblock' && !getPageSetting('BuyShieldblock')) continue;
        if (upgrade == 'Gigastation' && (game.global.lastWarp ? game.buildings.Warpstation.owned < (Math.floor(game.upgrades.Gigastation.done * getPageSetting('DeltaGigastation')) + getPageSetting('FirstGigastation')) : game.buildings.Warpstation.owned < getPageSetting('FirstGigastation'))) continue;
        //skip bloodlust during scientist challenges and while we have autofight enabled.
        if (upgrade == 'Bloodlust' && game.global.challengeActive == 'Scientist' && getPageSetting('BetterAutoFight')) continue;

        //Main logics:
        if (!available) continue;
        if (game.upgrades.Scientists.done < game.upgrades.Scientists.allowed && upgrade != 'Scientists') continue;
        buyUpgrade(upgrade, true, true);
        debug('Upgraded ' + upgrade, "upgrades", "*upload2");
    //loop again.
    }
}
