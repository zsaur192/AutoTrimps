//AB

function getCurrentAB(effect) {
    if (effect == false) {
      return autoBattle.enemyLevel;
    }
    else {
        var poison = autoBattle.enemy.poisonResist;
        var bleed = autoBattle.enemy.bleedResist;
        var shock = autoBattle.enemy.shockResist;

        var lowestResist = Math.min(poison,bleed,shock);

        var outEffect = "";
        if (poison == lowestResist) {
            outEffect += "p";
        }
        if (bleed == lowestResist) {
            outEffect += "b";
        }
        if (shock == lowestResist) {
            outEffect += "s";
        }

        return outEffect;
    }
};

function checkPreset(presetSlot) {
    for (var item in autoBattle.items) {
        if (autoBattle.items[item].equipped && autoBattle.presets["p" + presetSlot].indexOf(item) == -1) {
            return false;
        }
    }
    return true;
}

function ABcheck() {
    var winning = autoBattle.sessionEnemiesKilled >= autoBattle.sessionTrimpsKilled;

    if (winning) return 0;

    if (getCurrentAB(true) == "pbs" && (checkPreset(1) || checkPreset(2) || checkPreset(3))) {
        if (checkPreset(1)) return 2;
        else if (checkPreset(2)) return 3;
        else if (checkPreset(3)) return 1;
    }
    else if (getCurrentAB(true) == "pb" && (checkPreset(1) || checkPreset(2))) {
        if (checkPreset(1)) return 2;
        else if (checkPreset(2)) return 1;
    }
    else if (getCurrentAB(true) == "ps" && (checkPreset(1) || checkPreset(3))) {
        if (checkPreset(1)) return 3;
        else if (checkPreset(3)) return 1;
    }
    else if (getCurrentAB(true) == "bs" && (checkPreset(2) || checkPreset(3))) {
        if (checkPreset(2)) return 3;
        else if (checkPreset(3)) return 2;
    }
}

function ABswtich() {
    if (ABcheck() > 0) {
        if (ABcheck() == 1) autoBattle.loadPreset('p1');
        else if (ABcheck() == 2) autoBattle.loadPreset('p2');
        else if (ABcheck() == 3) autoBattle.loadPreset('p3');
    }
}
