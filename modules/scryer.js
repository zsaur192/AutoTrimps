let wantToScry = false;

function useScryerStance() {

    const AutoStance = getPageSetting('AutoStance');
    const useScryerEnabled = getPageSetting('UseScryerStance') === true;
    const onMapsScreen = game.global.mapsActive;
    const onVoidMap = game.global.mapsActive && getCurrentMapObject().location === "Void";
    const inDaily = game.global.challengeActive === "Daily";
    const dailyScryInVoid = getPageSetting('dscryvoidmaps') === true;
    const inPoisonZone = getEmpowerment() === "Poison";
    const inWindZone = getEmpowerment() === "Wind";
    const inIceZone = getEmpowerment() === "Ice";

    const scryInPoisonEnabled = getPageSetting('ScryUseinPoison') >= 0;
    const scryInWindEnabled = getPageSetting('ScryUseinWind') >= 0;
    const scryInIceEnabled = getPageSetting('ScryUseinIce') >= 0;
    const inOrAboveScryInPoisonZone = game.global.world >= getPageSetting('ScryUseinPoison');
    const inOrAboveScryInWindZone = game.global.world >= getPageSetting('ScryUseinWind');
    const inOrAboveScryInIceZone = game.global.world >= getPageSetting('ScryUseinIce');

    function autostancefunction() {
        if (AutoStance === 1) autoStance();
        else if (AutoStance === 2) autoStance2();
        else if (AutoStance === 3) autoStance3();
    }

//Never
    let use_scry = game.global.preMapsActive || game.global.gridArray.length === 0 || game.global.highestLevelCleared < 180;
    use_scry = use_scry || game.global.world <= 60;

    const vmScryerEnabled = getPageSetting('scryvoidmaps') === true;
    const scryInMapsNever = getPageSetting('ScryerUseinMaps2') === 0;
    const scryInVoidNever = getPageSetting('ScryerUseinVoidMaps2') === 0;
    const scryInSpireNever = getPageSetting('ScryerUseinSpire2') === 0;

    const inVoidOnMapsScreen = onMapsScreen && onVoidMap;

    use_scry = use_scry || (useScryerEnabled && onMapsScreen && scryInMapsNever && !onVoidMap);
    use_scry = use_scry || (inVoidOnMapsScreen && (scryInVoidNever && (!useScryerEnabled && !vmScryerEnabled && !inDaily) || (!useScryerEnabled && !dailyScryInVoid && inDaily)));
    use_scry = use_scry || (!onMapsScreen && isActiveSpireAT() && scryInSpireNever);

    const scryOnBossNeverAboveVoid = getPageSetting('ScryerSkipBoss2') === 1;
    const currentZoneBelowVMZone = game.global.world < getPageSetting('VoidMaps');
    const scryOnBossNever = getPageSetting('ScryerSkipBoss2') === 0;
    const onBossCell = game.global.lastClearedCell === 98;

    use_scry = use_scry || (scryOnBossNeverAboveVoid && currentZoneBelowVMZone && onBossCell) || (scryOnBossNever && onBossCell);
    use_scry = use_scry || (!onMapsScreen && ((inPoisonZone && scryInPoisonEnabled && !inOrAboveScryInPoisonZone)
                                              || (inWindZone && scryInWindEnabled && !inOrAboveScryInWindZone)
                                              || (inIceZone && scryInIceEnabled && !inOrAboveScryInWindZone)));

    //check Corrupted Never
    const currentEnemy = getCurrentEnemy(1);
    const isMagamaCell = mutations.Magma.active();
    const corruptionStartZone = mutations.Corruption.start();
    const scryForCorruptedCellsNever = getPageSetting('ScryerSkipCorrupteds2') === 0;

    let isCorruptedCell = currentEnemy && currentEnemy.mutation === "Corruption";
    isCorruptedCell = isCorruptedCell || (onMapsScreen && isMagamaCell);
    isCorruptedCell = isCorruptedCell || (inVoidOnMapsScreen && game.global.world >= corruptionStartZone);
    if ((isCorruptedCell && scryForCorruptedCellsNever || (use_scry))) {
        autostancefunction();
        wantToScry = false;
        return;
    }
    //check Healthy never
    const currentEnemyHealth = getCurrentEnemy(1);
    const scryForHealthyCellsNever = getPageSetting('ScryerSkipHealthy') === 0;

    let ishealthy = currentEnemyHealth && currentEnemyHealth.mutation === "Healthy";
    ishealthy = ishealthy || (inVoidOnMapsScreen && game.global.world >= corruptionStartZone);
    if ((ishealthy && scryForHealthyCellsNever || (use_scry))) {
        autostancefunction();
        wantToScry = false;
        return;
    }

//Force
    let scryInMapsForce = getPageSetting('ScryerUseinMaps2') === 1;
    let scryinVoidForce = getPageSetting('ScryerUseinVoidMaps2') === 1;
    let scryInSpireForce = getPageSetting('ScryerUseinSpire2') === 1;

    let use_scryer = useScryerEnabled && onMapsScreen && scryInMapsForce;
    use_scryer = use_scryer || (inVoidOnMapsScreen && ((scryinVoidForce) || (vmScryerEnabled && !inDaily) || (dailyScryInVoid && inDaily)));
    use_scryer = use_scryer || (!onMapsScreen && useScryerEnabled && isActiveSpireAT() && scryInSpireForce);

    let willScryForNature = (!onMapsScreen && useScryerEnabled && ((inPoisonZone && scryInPoisonEnabled && (inOrAboveScryInPoisonZone))
                                                                   || (inWindZone && scryInWindEnabled && (inOrAboveScryInWindZone))
                                                                   || (inIceZone && scryInIceEnabled && (inOrAboveScryInIceZone))));
    if (!onVoidMap || (onVoidMap && !scryInVoidNever)) {
        use_scryer = use_scryer || willScryForNature;
    }

    //check Corrupted Force
    const scryForCorruptedCellsForce = getPageSetting('ScryerSkipCorrupteds2') === 1;

    if ((isCorruptedCell && scryForCorruptedCellsForce && useScryerEnabled) || (use_scryer)) {
        setFormation(4);
        wantToScry = true;
        return;
    }
    //check healthy force
    const scryForHealthyCellsForce = getPageSetting('ScryerSkipHealthy') === 1;

    if ((ishealthy && scryForHealthyCellsForce && useScryerEnabled) || (use_scryer)) {
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
    const isNewSquadReady = game.resources.trimps.realMax() <= game.resources.trimps.owned + 1;
    const dieToScryZone = getPageSetting('ScryerDieZ');
    const dieToScryEnabled = dieToScryZone !== -1;
    const aboveDieToScryZone = game.global.world >= dieToScryZone;

    let okToSwitchStance = true;
    let isAllowedToDie = (dieToScryEnabled && aboveDieToScryZone);
    if (isAllowedToDie && dieToScryZone >= 0) {
        var [dieZ, dieC] = dieToScryZone.toString().split(".");
        if (dieC && dieC.length === 1) dieC = dieC + "0";
        isAllowedToDie = game.global.world >= dieZ && (!dieC || (game.global.lastClearedCell + 1 >= dieC));
    }
    const inXFormation = game.global.formation === 0;
    const inHFormation = game.global.formation === 1;

    if (inXFormation || inHFormation)
        okToSwitchStance = isAllowedToDie || isNewSquadReady || (missingHealth < (baseHealth / 2));

//Overkill
    const noOverkillLevels = game.portal.Overkill.level === 0;
    const hasOverkillLevels = game.portal.Overkill.level > 0;

    let scryForOverkill = getPageSetting('ScryerUseWhenOverkill');
    if (scryForOverkill && noOverkillLevels)
        setPageSetting('ScryerUseWhenOverkill', false);
    if (scryForOverkill && !onMapsScreen && isActiveSpireAT() && scryInSpireNever)
        scryForOverkill = false;
    if (scryForOverkill && hasOverkillLevels && useScryerEnabled) {
        const minDamage = calcOurDmg("min", false, true);
        const Sstance = 0.5;
        const ovkldmg = minDamage * Sstance * (game.portal.Overkill.level * 0.005);
        const ovklHDratio = getCurrentEnemy(1).maxHealth / ovkldmg;
        if (ovklHDratio < 2) {
            if (okToSwitchStance)
                setFormation(4);
            return;
        }
    }

//Default
    const min_zone = getPageSetting('ScryerMinZone');
    const max_zone = getPageSetting('ScryerMaxZone');
    const valid_min = game.global.world >= min_zone && game.global.world > 60;
    const valid_max = max_zone <= 0 || game.global.world < max_zone;
    const onlyScryForMinMaxEnabled = getPageSetting('onlyminmaxworld') === true;

    if (useScryerEnabled && valid_min && valid_max && !(onlyScryForMinMaxEnabled && onMapsScreen)) {
        if (okToSwitchStance)
            setFormation(4);
        wantToScry = true;
    }
    else {
        autostancefunction();
        wantToScry = false;

    }
}
