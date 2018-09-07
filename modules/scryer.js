let wantToScry = false;

function useScryerStance() {

    const AutoStance = getPageSetting('AutoStance');
    const useScryerEnabled = getPageSetting('UseScryerStance') === true;
    const onMapsScreen = game.global.mapsActive;
    const onVoidMap = getCurrentMapObject().location === "Void";
    const inDaily = game.global.challengeActive === "Daily";
    const scryInDaily = getPageSetting('dscryvoidmaps');
    const inPoisonZone = getEmpowerment() === "Poison";
    const inWindZone = getEmpowerment() === "Wind";
    const inIceZone = getEmpowerment() === "Ice";
    const scryInPoisonEnabled = 0 <= getPageSetting('ScryUseinPoison');
    const scryInWindEnabled = 0 <= getPageSetting('ScryUseinWind');
    const scryInIceEnabled = 0 <= getPageSetting('ScryUseinIce');

    function autostancefunction() {
        if (AutoStance === 1) autoStance();
        else if (AutoStance === 2) autoStance2();
        else if (AutoStance === 3) autoStance3();
    }
//Never
    let use_scry = game.global.preMapsActive || game.global.gridArray.length === 0 || game.global.highestLevelCleared < 180;
    use_scry = use_scry || game.global.world <= 60;
    use_scry = use_scry || (useScryerEnabled && onMapsScreen && getPageSetting('ScryerUseinMaps2') === 0 && getCurrentMapObject().location !== "Void");
    use_scry = use_scry || (onMapsScreen && onVoidMap && ((getPageSetting('ScryerUseinVoidMaps2') === 0) && (getPageSetting('UseScryerStance') === false && getPageSetting('scryvoidmaps') === false && game.global.challengeActive !== "Daily") || (getPageSetting('UseScryerStance') === false && scryInDaily === false && inDaily)));
    use_scry = use_scry || (!onMapsScreen && isActiveSpireAT() && getPageSetting('ScryerUseinSpire2') === 0);
    use_scry = use_scry || (getPageSetting('ScryerSkipBoss2') === 1 && game.global.world < getPageSetting('VoidMaps') && game.global.lastClearedCell === 98) || (getPageSetting('ScryerSkipBoss2') === 0 && game.global.lastClearedCell === 98);
    use_scry = use_scry || (!onMapsScreen && (inPoisonZone && scryInPoisonEnabled && (game.global.world < getPageSetting('ScryUseinPoison'))) || (inWindZone && scryInWindEnabled && (game.global.world < getPageSetting('ScryUseinWind'))) || (inIceZone && scryInIceEnabled && (game.global.world < getPageSetting('ScryUseinIce'))));

    //check Corrupted Never
    const curEnemy = getCurrentEnemy(1);
    let iscorrupt = curEnemy && curEnemy.mutation === "Corruption";
    iscorrupt = iscorrupt || (onMapsScreen && mutations.Magma.active());
    iscorrupt = iscorrupt || (onMapsScreen && onVoidMap && game.global.world >= mutations.Corruption.start());
    if ((iscorrupt && getPageSetting('ScryerSkipCorrupteds2') === 0 || (use_scry))) {
        autostancefunction();
        wantToScry = false;
        return;
    }
    //check Healthy never
    const curEnemyhealth = getCurrentEnemy(1);
    let ishealthy = curEnemyhealth && curEnemyhealth.mutation === "Healthy";
    ishealthy = ishealthy || (onMapsScreen && onVoidMap && game.global.world >= mutations.Corruption.start());
    let scryerDoHealthy = getPageSetting('ScryerSkipHealthy') === 0;
    if ((ishealthy && scryerDoHealthy || (use_scry))) {
        autostancefunction();
        wantToScry = false;
        return;
    }

//Force
    let scryInMapsForce = getPageSetting('ScryerUseinMaps2') === 1;
    let vmScryerEnabled = getPageSetting('scryvoidmaps') === true;
    let scryinVoidForce = getPageSetting('ScryerUseinVoidMaps2') === 1;
    let scryInSpireForce = getPageSetting('ScryerUseinSpire2') === 1;

    let aboveScryInPoisonZone = game.global.world >= getPageSetting('ScryUseinPoison');
    let aboveScryInWindZone = game.global.world >= getPageSetting('ScryUseinWind');
    let aboveScryInIceZone = game.global.world >= getPageSetting('ScryUseinIce');

    let use_scryer = use_scryer || (useScryerEnabled && onMapsScreen && scryInMapsForce);
    use_scryer = use_scryer || (onMapsScreen && onVoidMap && ((scryinVoidForce) || (vmScryerEnabled && !inDaily) || (scryInDaily === true && inDaily)));
    use_scryer = use_scryer || (!onMapsScreen && useScryerEnabled && isActiveSpireAT() && scryInSpireForce);

    let willScryForNature = (!onMapsScreen && useScryerEnabled && ((inPoisonZone && scryInPoisonEnabled && (aboveScryInPoisonZone))
                                                                   || (inWindZone && scryInWindEnabled && (aboveScryInWindZone))
                                                                   || (inIceZone && scryInIceEnabled && (aboveScryInIceZone))));
    use_scryer = use_scryer || willScryForNature;

    //check Corrupted Force
    if ((iscorrupt && getPageSetting('ScryerSkipCorrupteds2') === 1 && useScryerEnabled) || (use_scryer)) {
        setFormation(4);
        wantToScry = true;
        return;
    }
    //check healthy force
    if ((ishealthy && getPageSetting('ScryerSkipHealthy') === 1 && useScryerEnabled) || (use_scryer)) {
        setFormation(4);
        wantToScry = true;
        return;
    }

//Calc Damage
    if (AutoStance === 1)
        calcBaseDamageinX();
    else if (AutoStance >= 2)
        calcBaseDamageinX2();

//Suicide to Scry
    const missingHealth = game.global.soldierHealthMax - game.global.soldierHealth;
    const newSquadRdy = game.resources.trimps.realMax() <= game.resources.trimps.owned + 1;
    let oktoswitch = true;
    let die = (getPageSetting('ScryerDieZ') !== -1 && getPageSetting('ScryerDieZ') <= game.global.world);
    const willSuicide = getPageSetting('ScryerDieZ');
    if (die && willSuicide >= 0) {
        var [dieZ, dieC] = willSuicide.toString().split(".");
        if (dieC && dieC.length === 1) dieC = dieC + "0";
        die = game.global.world >= dieZ && (!dieC || (game.global.lastClearedCell + 1 >= dieC));
    }
    if (game.global.formation === 0 || game.global.formation === 1)
        oktoswitch = die || newSquadRdy || (missingHealth < (baseHealth / 2));

//Overkill
    let useoverkill = getPageSetting('ScryerUseWhenOverkill');
    if (useoverkill && game.portal.Overkill.level === 0)
        setPageSetting('ScryerUseWhenOverkill', false);
    if (useoverkill && !onMapsScreen && isActiveSpireAT() && getPageSetting('ScryerUseinSpire2') === 0)
        useoverkill = false;
    if (useoverkill && game.portal.Overkill.level > 0 && useScryerEnabled) {
        const minDamage = calcOurDmg("min", false, true);
        const Sstance = 0.5;
        const ovkldmg = minDamage * Sstance * (game.portal.Overkill.level * 0.005);
        const ovklHDratio = getCurrentEnemy(1).maxHealth / ovkldmg;
        if (ovklHDratio < 2) {
            if (oktoswitch)
                setFormation(4);
            return;
        }
    }

//Default
    const min_zone = getPageSetting('ScryerMinZone');
    const max_zone = getPageSetting('ScryerMaxZone');
    const valid_min = game.global.world >= min_zone && game.global.world > 60;
    const valid_max = max_zone <= 0 || game.global.world < max_zone;
    if (useScryerEnabled && valid_min && valid_max && !(getPageSetting('onlyminmaxworld') === true && onMapsScreen)) {
        if (oktoswitch)
            setFormation(4);
        wantToScry = true;
    }
    else {
        autostancefunction();
        wantToScry = false;

    }
}
