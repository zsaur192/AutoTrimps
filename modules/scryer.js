var wantToScry = false;
function useScryerStance() {
  var AutoStance = getPageSetting('AutoStance');
    function autostancefunction() {
        if (AutoStance<=1) autoStance();    //"Auto Stance"
        else if (AutoStance==2) autoStance2();
        else if (AutoStance==3) autoStance3();   //"Auto Stance #3"
    }

    //check NEVER & Prerequisites (This overrides overkill settings)
    var use_auto = game.global.preMapsActive || game.global.gridArray.length === 0 || game.global.highestLevelCleared < 180;
    //check scryer is unlocked
    use_auto = use_auto || game.global.world <= 60;
    //check map NEVER
    use_auto = use_auto || game.global.mapsActive && getPageSetting('ScryerUseinMaps2') == 0;
    //check void map NEVER
    use_auto = use_auto || game.global.mapsActive && getCurrentMapObject().location == "Void" && getPageSetting('ScryerUseinVoidMaps2') == 0;
    //check spire NEVER
    use_auto = use_auto || !game.global.mapsActive && isActiveSpireAT() && getPageSetting('ScryerUseinSpire2') == 0;
    //check Boss NEVERs
    use_auto = use_auto || (getPageSetting('ScryerSkipBoss2') == 1 && game.global.world > getPageSetting('VoidMaps') && game.global.lastClearedCell > 98) || (getPageSetting('ScryerSkipBoss2') == 2 && game.global.lastClearedCell > 98);
    //Check Nature Min Zone
    use_auto = use_auto || ((getEmpowerment() == "Poison" && 0 <= getPageSetting('ScryUseinPoison') && (game.global.world < getPageSetting('ScryUseinPoison'))) || (getEmpowerment() == "Wind" && 0 <= getPageSetting('ScryUseinWind') && (game.global.world < getPageSetting('ScryUseinWind'))) || (getEmpowerment() == "Ice" && 0 <= getPageSetting('ScryUseinIce') && (game.global.world < getPageSetting('ScryUseinIce'))));
    //check Corrupted Never
    var curEnemy = getCurrentEnemy(1);
    var iscorrupt = curEnemy && curEnemy.mutation == "Corruption";
    iscorrupt = iscorrupt || (game.global.mapsActive && mutations.Magma.active());
    iscorrupt = iscorrupt || (game.global.mapsActive && getCurrentMapObject().location == "Void" && game.global.world >= mutations.Corruption.start());
    if ((iscorrupt && getPageSetting('ScryerSkipCorrupteds2') == 0 || (use_auto))) {
        autostancefunction();
        wantToScry = false;
        return;
    }
    //check Healthy never
    var curEnemyhealth = getCurrentEnemy(1);
    var ishealthy = curEnemyhealth && curEnemyhealth.mutation == "Healthy";
    ishealthy = ishealthy || (game.global.mapsActive && getCurrentMapObject().location == "Void" && game.global.world >= mutations.Corruption.start());
    if ((ishealthy && getPageSetting('ScryerSkipHealthy') == 0 || (use_auto))) {
        autostancefunction();
        wantToScry = false;
        return;
    }

    var use_scryer = use_scryer || (game.global.mapsActive && getPageSetting('ScryerUseinMaps2') == 1);
    //check void map Force
    use_scryer = use_scryer || (game.global.mapsActive && getCurrentMapObject().location == "Void" && getPageSetting('ScryerUseinVoidMaps2') == 1);
    //check spire Force
    use_scryer = use_scryer || (!game.global.mapsActive && isActiveSpireAT() && getPageSetting('ScryerUseinSpire2') == 1);
    //check boss
    use_scryer = use_scryer || (getPageSetting('ScryerSkipBoss2') == 1 && game.global.world > getPageSetting('VoidMaps') && game.global.lastClearedCell > 98) || (getPageSetting('ScryerSkipBoss2') == 2 && game.global.lastClearedCell > 98);
    //Check Nature Min Zone
    use_scryer = use_scryer || (!game.global.mapsActive && ((getEmpowerment() == "Poison" && 0 <= getPageSetting('ScryUseinPoison') && (game.global.world >= getPageSetting('ScryUseinPoison'))) || (getEmpowerment() == "Wind" && 0 <= getPageSetting('ScryUseinWind') && (game.global.world >= getPageSetting('ScryUseinWind'))) || (getEmpowerment() == "Ice" && 0 <= getPageSetting('ScryUseinIce') && (game.global.world >= getPageSetting('ScryUseinIce')))));
    //check Corrupted Force
    if ((iscorrupt && getPageSetting('ScryerSkipCorrupteds2') == 1) || (use_scryer)) {
        setFormation(4);
        wantToScry = true;
        return;
    }
    if ((ishealthy && getPageSetting('ScryerSkipHealthy') == 1) || (use_scryer)) {
        setFormation(4);
        wantToScry = true;
        return;
    }


    if (AutoStance<=1)
        calcBaseDamageinX();
    else if (AutoStance>=2)
        calcBaseDamageinX2();
//Decide whether it is oktoswitch (Suicide)
    var missingHealth = game.global.soldierHealthMax - game.global.soldierHealth;
    var newSquadRdy = game.resources.trimps.realMax() <= game.resources.trimps.owned + 1;
    var form = game.global.formation;
    var oktoswitch = true;
    var die = (getPageSetting('ScryerDieZ') != -1 && getPageSetting('ScryerDieZ') <= game.global.world) ;
    var willSuicide = getPageSetting('ScryerDieZ');
    if (die && willSuicide >= 0) {
        var [dieZ, dieC] = willSuicide.toString().split(".");
        if (dieC && dieC.length == 1) dieC = dieC + "0";
        die = game.global.world >= dieZ && (!dieC || (game.global.lastClearedCell + 1 >= dieC));
    }
    if (form == 0 || form == 1)
        oktoswitch = die || newSquadRdy || (missingHealth < (baseHealth / 2));

//Decide whether Overkill is possible
    var useoverkill = getPageSetting('ScryerUseWhenOverkill');
    //If Overkill isn't unlocked, toggle overkill use off!
    if (useoverkill && game.portal.Overkill.level == 0)
        setPageSetting('ScryerUseWhenOverkill', false);
    //If Spire is set to never and is active, don't use overkill setting.
    if (useoverkill && !game.global.mapsActive && isActiveSpireAT() && getPageSetting('ScryerUseinSpire2')==0)
      useoverkill = false;
    //If lower than nature zone, do not use overkill
    if (useoverkill && ((getEmpowerment() == "Poison" && 0 <= getPageSetting('ScryUseinPoison') && (game.global.world < getPageSetting('ScryUseinPoison'))) || (getEmpowerment() == "Wind" && 0 <= getPageSetting('ScryUseinWind') && (game.global.world < getPageSetting('ScryUseinWind'))) || (getEmpowerment() == "Ice" && 0 <= getPageSetting('ScryUseinIce') && (game.global.world < getPageSetting('ScryUseinIce')))))
      useoverkill = false;
    //Overkill button being on and being able to overkill in S will override any setting other than never spire & nature zone, regardless.
    if (useoverkill && game.portal.Overkill.level > 0) {
       
        var minDamage = calcOurDmg("min",false,true);
        var Sstance = 0.5;
        var ovkldmg = minDamage * Sstance * (game.portal.Overkill.level*0.005);
        //are we going to overkill in S?
        var ovklHDratio = getCurrentEnemy(1).maxHealth / ovkldmg;
        if (ovklHDratio < 2) {
            if (oktoswitch)
                setFormation(4);
            return;
        }
    }

//Default. (All Never and Always are accounted for, Overkill has decided whether to run, leaving solely what zones you want to run S in even when you can't overkill)
    var min_zone = getPageSetting('ScryerMinZone');
    var max_zone = getPageSetting('ScryerMaxZone');
    var valid_min = game.global.world >= min_zone;
    var valid_max = max_zone <= 0 || game.global.world < max_zone;
    if (valid_min && valid_max && !(getPageSetting('onlyminmaxworld') == true && game.global.mapsActive)) {
        if (oktoswitch)
            setFormation(4);
        wantToScry = true;
    } else {
        autostancefunction();
        wantToScry = false;
        return;
    }
}
