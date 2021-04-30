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
    if (getCurrentAB(true) == "pbs" && (checkPreset(1) || checkPreset(2) || checkPreset(3))) {
        if (autoBattle.sessionEnemiesKilled >= autoBattle.sessionTrimpsKilled) return false;
        else if (autoBattle.sessionEnemiesKilled < autoBattle.sessionTrimpsKilled && checkPreset(1)) return 2;
        else if (autoBattle.sessionEnemiesKilled < autoBattle.sessionTrimpsKilled && checkPreset(2)) return 3;
        else if (autoBattle.sessionEnemiesKilled < autoBattle.sessionTrimpsKilled && checkPreset(3)) return 1;
    }
    else if (getCurrentAB(true) == "pb" && (checkPreset(1) || checkPreset(2))) {
        if (autoBattle.sessionEnemiesKilled >= autoBattle.sessionTrimpsKilled) return false;
        else if (autoBattle.sessionEnemiesKilled < autoBattle.sessionTrimpsKilled && checkPreset(1)) return 2;
        else if (autoBattle.sessionEnemiesKilled < autoBattle.sessionTrimpsKilled && checkPreset(2)) return 1;
    }
    else if (getCurrentAB(true) == "ps" && (checkPreset(1) || checkPreset(3))) {
        if (autoBattle.sessionEnemiesKilled >= autoBattle.sessionTrimpsKilled) return false;
        else if (autoBattle.sessionEnemiesKilled < autoBattle.sessionTrimpsKilled && checkPreset(1)) return 3;
        else if (autoBattle.sessionEnemiesKilled < autoBattle.sessionTrimpsKilled && checkPreset(3)) return 1;
    }
    else if (getCurrentAB(true) == "bs" && (checkPreset(2) || checkPreset(3))) {
        if (autoBattle.sessionEnemiesKilled >= autoBattle.sessionTrimpsKilled) return false;
        else if (autoBattle.sessionEnemiesKilled < autoBattle.sessionTrimpsKilled && checkPreset(2)) return 3;
        else if (autoBattle.sessionEnemiesKilled < autoBattle.sessionTrimpsKilled && checkPreset(3)) return 2;
    }
}

function ABswtich() {
}
