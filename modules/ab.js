//AB

function getCurrentAB(effect) {
    if (effect == false) {
        return autoBattle.enemyLevel;
    }
    else {
        var poison = autoBattle.enemy.poisonResist;
        var bleed = autoBattle.enemy.bleedResist;
        var shock = autoBattle.enemy.shockResist;

        var sort = [poison, bleed, shock];
        sort.sort(function(a, b){return a-b});

        var what;

        if (sort[0] == sort[1] && sort[0] == sort[2]) what = 'pbs';
        else if (sort[0] == sort[1]) {
            if (sort[0] == autoBattle.enemy.poisonResist && sort[1] == autoBattle.enemy.bleedResist) what = 'pb';
            //else if (sort[0] == autoBattle.enemy.bleedResist && sort[1] == autoBattle.enemy.poisonResist) what = 'bp';
            else if (sort[0] == autoBattle.enemy.poisonResist && sort[1] == autoBattle.enemy.shockResist) what = 'ps';
            //else if (sort[0] == autoBattle.enemy.shockResist && sort[1] == autoBattle.enemy.poisonResist) what = 'sp';
            else if (sort[0] == autoBattle.enemy.bleedResist && sort[1] == autoBattle.enemy.shockResist) what = 'bs';
            //else if (sort[0] == autoBattle.enemy.shockResist && sort[1] == autoBattle.enemy.bleedResist) what = 'sb';
        }
        else if (sort[0] == autoBattle.enemy.poisonResist) what = 'p';
        else if (sort[0] == autoBattle.enemy.bleedResist) what = 'b';
        else if (sort[0] == autoBattle.enemy.shockResist) what = 's';

        return what;
    }
};
