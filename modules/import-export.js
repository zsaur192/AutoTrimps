MODULES["import-export"] = {};

//2018 AutoTrimps - genBTC, copied from SettingsGUI.js
//Create settings profile selection dropdown box in DOM. (import/export section)
var $settingsProfiles;
function settingsProfileMakeGUI() {
    var $settingsProfilesLabel = document.createElement("Label");
    $settingsProfilesLabel.id = 'settingsProfiles Label';
    $settingsProfilesLabel.innerHTML = "Settings Profile: ";
    if (game.options.menu.darkTheme.enabled == 2) $settingsProfilesLabel.setAttribute("style", "margin-left: 1.2vw; margin-right: 0.8vw; font-size: 0.8vw;");
    else $settingsProfilesLabel.setAttribute("style", "margin-left: 1.2vw; margin-right: 0.8vw; font-size: 0.8vw;");
    $settingsProfiles = document.createElement("select");
    $settingsProfiles.id = 'settingsProfiles';
    $settingsProfiles.setAttribute('class', 'noselect');
    $settingsProfiles.setAttribute('onchange', 'settingsProfileDropdownHandler()');
    var oldstyle = 'text-align: center; width: 160px; font-size: 1.0vw;';
    if(game.options.menu.darkTheme.enabled != 2) $settingsProfiles.setAttribute("style", oldstyle + " color: black;");
    else $settingsProfiles.setAttribute('style', oldstyle);
    //Create settings profile selection dropdown
    var $settingsProfilesButton = document.createElement("Button");
    $settingsProfilesButton.id = 'settingsProfiles Button';
    $settingsProfilesButton.setAttribute('class', 'btn btn-info');
    $settingsProfilesButton.innerHTML = "&lt;Delete Profile";
    $settingsProfilesButton.setAttribute('style', 'margin-left: 0.5vw; margin-right: 0.5vw; font-size: 0.8vw;');
    $settingsProfilesButton.setAttribute('onclick','onDeleteProfileHandler()');
    //populate with a Default (read default settings):
    var innerhtml = "<option id='customProfileCurrent'>Current</option>";
    //populate with a Default (read default settings):
    innerhtml += "<option id='customProfileDefault'>Reset to Default</option>";
    //Append a 2nd default item named "Save New..." and have it tied to a write function();
    innerhtml += "<option id='customProfileNew'>Save New...</option>";
    //dont forget to populate the rest of it with stored items:
    $settingsProfiles.innerHTML = innerhtml;    
    //Add the $settingsProfiles dropdown to UI
    var $ietab = document.getElementById('Import Export');
    if ($ietab == null) return;
    //Any ERRORs here are caused by incorrect order loading of script and you should reload until its gone.(for now)
    $ietab.insertBefore($settingsProfilesLabel, $ietab.childNodes[1]);
    $ietab.insertBefore($settingsProfiles, $ietab.childNodes[2]);
    $ietab.insertBefore($settingsProfilesButton, $ietab.childNodes[3]);
}   //self-executes at the bottom of the file.

//Populate dropdown menu with list of AT SettingsProfiles
function initializeSettingsProfiles() {
    if ($settingsProfiles == null) return;
    //load the old data in:
    var loadLastProfiles = localStorage.getItem('ATSelectedSettingsProfile');
    var oldpresets = loadLastProfiles ? JSON.parse(loadLastProfiles) : new Array(); //load the import.
    oldpresets.forEach(function(elem){
        //Populate dropdown menu to reflect new name:
        let optionElementReference = new Option(elem.name);
        optionElementReference.id = 'customProfileRead';
        $settingsProfiles.add(optionElementReference);
    });
    $settingsProfiles.selectedIndex = 0;
}

//This switches into the new profile when the dropdown is selected.
//it is the "onchange" handler of the settingsProfiles dropdown
//Asks them do a confirmation check tooltip first. The
function settingsProfileDropdownHandler() {
    if ($settingsProfiles == null) return;
    var index = $settingsProfiles.selectedIndex;
    var id = $settingsProfiles.options[index].id;
    //Current: placeholder.
    if (id == 'customProfileCurrent')
        return;
    cancelTooltip();
//Default: simply calls Reset To Default:
    if (id == 'customProfileDefault')
        //calls a tooltip then resetAutoTrimps() below
        ImportExportTooltip('ResetDefaultSettingsProfiles');
//Save new...: asks a name and saves new profile
    else if (id == 'customProfileNew')
        //calls a tooltip then nameAndSaveNewProfile() below
        ImportExportTooltip('NameSettingsProfiles');
//Reads the existing profile name and switches into it.
    else if (id == 'customProfileRead')
        //calls a tooltip then confirmedSwitchNow() below
        ImportExportTooltip('ReadSettingsProfiles');
    //NOPE.XWait 200ms for everything to reset and then re-select the old index.
    //setTimeout(function(){ settingsProfiles.selectedIndex = index;} ,200);
    return;
}

function confirmedSwitchNow() {
    if ($settingsProfiles == null) return;
    var index = $settingsProfiles.selectedIndex;
    var profname = $settingsProfiles.options[index].text;
    //load the stored profiles from browser
    var loadLastProfiles = JSON.parse(localStorage.getItem('ATSelectedSettingsProfile'));
    if (loadLastProfiles != null) {
        var results = loadLastProfiles.filter(function(elem,i){
            return elem.name == profname;
        });
        if (results.length > 0) {
            resetAutoTrimps(results[0].data,profname);
            debug("Successfully loaded existing profile: " + profname, "profile");
        }
    }
}

//called by ImportExportTooltip('NameSettingsProfiles')
function nameAndSaveNewProfile() {
    //read the name in from tooltip
    try {
        var profname = document.getElementById("setSettingsNameTooltip").value.replace(/[\n\r]/gm, "");
        if (profname == null) {
            debug("Error in naming, the string is empty.", "profile");
            return;
        }
    } catch (err) {
        debug("Error in naming, the string is bad." + err.message, "profile");
        return;
    }
    var profile = {
        name: profname,
        data: JSON.parse(serializeSettings())
    }
    //load the old data in,
    var loadLastProfiles = localStorage.getItem('ATSelectedSettingsProfile');
    var oldpresets = loadLastProfiles ? JSON.parse(loadLastProfiles) : new Array(); //load the import.
    //rewrite the updated array in
    var presetlists = [profile];
    //add the two arrays together, string them, and store them.
    safeSetItems('ATSelectedSettingsProfile', JSON.stringify(oldpresets.concat(presetlists)));
    debug("Successfully created new profile: " + profile.name, "profile");
    ImportExportTooltip('message', 'Successfully created new profile: ' + profile.name);
    //Update dropdown menu to reflect new name:
    let optionElementReference = new Option(profile.name);
    optionElementReference.id = 'customProfileRead';
    if ($settingsProfiles == null) return;
    $settingsProfiles.add(optionElementReference);
    $settingsProfiles.selectedIndex = $settingsProfiles.length-1;
}

//event handler for profile delete button - confirmation check tooltip
function onDeleteProfileHandler() {
    ImportExportTooltip('DeleteSettingsProfiles');  //calls a tooltip then onDeleteProfile() below
}
//Delete Profile runs after.
function onDeleteProfile() {
    if ($settingsProfiles == null) return;
    var index = $settingsProfiles.selectedIndex;
    //Remove the option
    $settingsProfiles.options.remove(index);
    //Stay on the same index (becomes next item) - so we dont have to Toggle into a new profile again and can keep chain deleting.
    $settingsProfiles.selectedIndex = (index > ($settingsProfiles.length-1)) ? $settingsProfiles.length-1 : index;
    //load the old data in:
    var loadLastProfiles = localStorage.getItem('ATSelectedSettingsProfile');
    var oldpresets = loadLastProfiles ? JSON.parse(loadLastProfiles) : new Array(); //load the import.
    //rewrite the updated array in. string them, and store them.
    var target = (index-3); //subtract the 3 default choices out
    oldpresets.splice(target, 1);
    safeSetItems('ATSelectedSettingsProfile', JSON.stringify(oldpresets));
    debug("Successfully deleted profile #: " + target, "profile");
}


//Handler for the popup/tooltip window for Import/Export/Default
function ImportExportTooltip(what, event) {
    if (game.global.lockTooltip)
        return;
    var $elem = document.getElementById("tooltipDiv");
    swapClass("tooltipExtra", "tooltipExtraNone", $elem);
    var ondisplay = null; // if non-null, called after the tooltip is displayed
    var tooltipText;
    var costText = "";
    var titleText = what;
    if (what == "ExportAutoTrimps") {
        tooltipText = "This is your AUTOTRIMPS save string. There are many like it but this one is yours. Save this save somewhere safe so you can save time next time. <br/><br/><textarea id='exportArea' style='width: 100%' rows='5'>" + serializeSettings() + "</textarea>";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Got it</div>";
        if (document.queryCommandSupported('copy')) {
            costText += "<div id='clipBoardBtn' class='btn btn-success'>Copy to Clipboard</div>";
            ondisplay = function() {
                document.getElementById('exportArea').select();
                document.getElementById('clipBoardBtn').addEventListener('click', function(event) {
                    document.getElementById('exportArea').select();
                    try {
                        document.execCommand('copy');
                    } catch (err) {
                        document.getElementById('clipBoardBtn').innerHTML = "Error, not copied";
                    }
                });
            };
        } else {
            ondisplay = function() {
                document.getElementById('exportArea').select();
            };
        }
        costText += "</div>";
    } else if (what == "Export550") {
        tooltipText = "This is your AUTOTRIMPS z550+ save string. use this string to import the settings. <br/><br/><textarea id='exportArea' style='width: 100%' rows='5'>" + {"ManualGather2":2,"ATversion":"2.1.6.9b-genbtc-4-2-2018 + KFrowde + Zeker0","BetterAutoFight":3,"AutoStance":3,"BuyStorage":true,"BuyBuildings":true,"BuyUpgrades":true,"BuyJobs":true,"TrapTrimps":false,"AutoHeirlooms":true,"HireScientists":true,"WorkerRatios":false,"ManageBreedtimer":false,"AutoPortal":"Custom","HeliumHourChallenge":"Corrupted","CustomAutoPortal":559,"HeHrDontPortalBefore":496,"HeliumHrBuffer":3,"AutoFinishDaily":true,"AutoFinishDailyZone":0,"AutoStartDaily":false,"PauseScript":false,"BuyArmor":true,"BuyArmorUpgrades":true,"BuyWeapons":true,"BuyWeaponUpgrades":true,"BuyShieldblock":false,"Prestige":"Dagadder","PrestigeBackup":{"selected":"Dagadder","id":"PrestigeBackup","name":"PrestigeBackup"},"DynamicPrestige2":-1,"PrestigeSkipMode":false,"AlwaysArmorLvl2":true,"WaitTill60":true,"DelayArmorWhenNeeded":false,"CapEquip2":125,"AutoMaps":1,"DynamicSiphonology":true,"LowerFarmingZone":true,"MinutestoFarmBeforeSpire":0,"RunBionicBeforeSpire":false,"ExitSpireCell":90,"CorruptionCalc":true,"FarmWhenNomStacks7":true,"VoidMaps":555,"RunNewVoids":false,"RunNewVoidsUntil":600,"VoidCheck":1,"MaxTox":false,"DisableFarm":true,"FarmerRatio":20,"LumberjackRatio":10,"MinerRatio":1000,"MaxScientists":"-1","MaxExplorers":3000,"MaxTrainers":-1,"MaxHut":100,"MaxHouse":0,"MaxMansion":0,"MaxHotel":0,"MaxResort":0,"MaxGateway":0,"MaxWormhole":0,"MaxCollector":0,"FirstGigastation":1,"DeltaGigastation":1,"MaxGym":"-1","MaxTribute":"-1","MaxNursery":-1,"BreedFire":false,"AutoMagmamancers":true,"WarpstationCap":true,"WarpstationWall3":-1,"WarpstationCoordBuy":true,"AutoRoboTrimp":230,"AutoGoldenUpgrades":"Void 60","AutoHeirlooms2":false,"AutoUpgradeHeirlooms":false,"TrainerCaptoTributes":"-1","NoNurseriesUntil":485,"AutoMagmiteSpender2":2,"ForceAbandon":true,"GymWall":-1,"DynamicGyms":true,"AutoAllocatePerks":1,"SpireBreedTimer":-1,"UseScryerStance":false,"ScryerUseWhenOverkill":false,"ScryerMinZone":481,"ScryerMaxZone":-1,"ScryerUseinMaps2":2,"ScryerUseinVoidMaps2":0,"ScryerUseinSpire2":0,"ScryerSkipBoss2":2,"ScryerSkipCorrupteds2":2,"ScryerDieToUseS":true,"SpamGeneral":true,"SpamUpgrades":false,"SpamEquipment":false,"SpamMaps":false,"SpamOther":false,"SpamBuilding":false,"SpamJobs":false,"ManualCoords":false,"TrimpleZ":0,"ScryerDieZ":230.6,"IgnoreCrits":2,"ForcePresZ":-1,"PreferMetal":false,"PreSpireNurseries":7000,"FinishC2":-1,"PowerSaving":0,"PrestigeSkip2":false,"AutoEggs":false,"UseAutoGen":1,"AutoGen2":3,"AutoGen2End":320,"AutoGen2SupplyEnd":false,"AutoGen3":0,"AutoGenDC":1,"AutoGenC2":1,"AutoGen2Override":1,"SupplyWall":1,"OneTimeOnly":false,"BuyOvclock":false,"IgnoreSpiresUntil":500,"goldStrat":"Max then Helium","goldAlternating":2,"goldZone":600,"MaxStacksForSpire":true,"UsePatience":false,"AutoNatureTokens":true,"AutoPoison":"Convert to Wind","AutoWind":"Empowerment","AutoIce":"Convert to Wind","MaxMapBonusAfterZone":-1,"SpamGraphs":false,"allowSettingsUpload":false,"EnhanceGrids":false,"EnableAFK":{"id":"EnableAFK","name":"Enable AFK","description":"Enables CPU and RAM saving AFK-mode","type":"action","value":1},"SpamMagmite":false,"SpamPerks":true,"analyticsID":"7f11701e-adc9-477c-a08d-2b66fe3ec2a2","ChangeLog":{"id":"ChangeLog","name":"Show Changelog","description":"Shows the changelog popup message that AT loads on startup in case you missed it.","type":"action","value":1},"AdvMapSpecialModifier":false,"GeneticistTimer":-1,"goldNoBattle":true,"BuyUpgradesNew":1,"AutoFinishDailyNew":0,"BuyBuildingsNew":1,"BuyJobsNew":2,"BuyArmorNew":1,"BuyWeaponsNew":1,"PrestigeSkip1_2":0,"RunNewVoidsUntilNew":0,"DailyVoidMod":570,"PlusMapVoidToggle":0,"Praidingzone":{"id":"Praidingzone","name":"P Raiding Z","description":"Raids Maps for prestiges at zone specified. Example: 495, will raid Maps at 501. Once all gear is obtained from the map, it will revert back to regular farming. Extremely helpful for spire. Best used in poison zones. <b>You can use multiple values like this 495,506,525! </b>","type":"multiValue","value":[495,531,540,545,551,555]},"BWraid":false,"BWraidingmin":-1,"BWraidingmax":{"id":"BWraidingmax","name":"Max BW to raid","description":"Raids BWs until zone specified. Example: 515, will raid all BWs for all gear until 515. Will skip lower BWs if you have enough damage. Once all gear is obtained, will return to regular farming. Now accepts comma separated lists - see description of Z to BW raid setting for details.","type":"multiValue","value":[615]},"lootdumpz":232,"lootdumpa":10000,"WindStackingMin":526,"ScryUseinPoison":-1,"ScryUseinWind":-1,"ScryUseinIce":-1,"BuyOneTimeOC":2,"AutoHeirloomsNew":2,"ShowSettings":true,"BWraidingz":{"id":"BWraidingz","name":"Z to BW Raid","description":"Raids BWs at zone specified. Example: 495, will raid all BWs for all gear starting from 495. Will skip lower BWs if you have enough damage. Once all gear is obtained, will return to regular farming. Accepts comma separated lists, and raids up to the value in the corrsponding position in the Max BW to raid setting. So if this is set to 480,495 and Max BW to Raid is set to 500,515 AT will BW raid up to 500 from 480, and 515 from 495. Make sure these lists are the same length or BW raiding may fail.","type":"multiValue","value":[595]},"fastallocate":true,"VoidPraid":true,"trimpsnotdie":true,"gearamounttobuy":5,"Dailyportal":575,"dVoidPraid":true,"dPraidingzone":{"id":"dPraidingzone","name":"Daily P Raiding Z","description":"Raids Maps for prestiges at zone specified in Dailys. Example: 495, will raid Maps at 501. Once all gear is obtained from the map, it will revert back to regular farming. Extremely helpful for spire. Best used in poison zones. <b>You can use multiple values like this 495,506,525! </b>","type":"multiValue","value":[480,491,495,510,525,531,540,546,551,555,566,570]},"Dailybwraid":false,"dBWraidingz":{"id":"dBWraidingz","name":"Daily Z to BW Raid","description":"Raids BWs at zone specified in dailys. Example: 495, will raid all BWs for all gear starting from 495. Will skip lower BWs if you have enough damage. Once all gear is obtained, will return to regular farming. Accepts comma separated lists, and raids up to the value in the corrsponding position in the Max BW to raid setting. So if this is set to 480,495 and Daily Max BW to Raid is set to 500,515 AT will BW raid up to 500 from 480, and 515 from 495. Make sure these lists are the same length or BW raiding may fail.","type":"multiValue","value":[495]},"dBWraidingmax":{"id":"dBWraidingmax","name":"Daily Max BW to raid","description":"Raids BWs until zone specified in dailys. Example: 515, will raid all BWs for all gear until 515. Will skip lower BWs if you have enough damage. Once all gear is obtained, will return to regular farming. Now accepts comma separated lists - see description of Daily Z to BW raid setting for details.","type":"multiValue","value":[515]},"dexitspirecell":-1,"WindStackingMax":195,"buyheliumy":-1,"buynojobsc":true,"Trimpicide":true,"fightforever":false,"use3daily":true,"windcutoff":90,"spireshitbuy":true,"hardcorewind":541,"PraidHarder":false,"PraidFarmFrags":false,"PraidBeforeFarm":false,"dPraidHarder":false,"dMaxPraidZone":{"id":"dMaxPraidZone","name":"Daily Max P Raid Z","description":"List of maximum zones to Praid on Dailies corresponding to the list specified in Daily Praiding Z.  e.g. if Daily P raiding Z setting is 491,495 and this setting is 495,505, AT will P raid up to 495 from 491, and 505 from 495.  Set to -1 to always buy highest available prestige map.  If no corrsponding value, or value is invalid, defaults to max available (up to +10)","type":"multiValue","value":[-1]},"dPraidFarmFragsZ":{"id":"dPraidFarmFragsZ","name":"Daily Farm Frags Z","description":"P Raiding harder: List of zones where we should farm fragments until we can afford the highest or target prestige map for P raiding. Set to -1 to never farm fragments.","type":"multiValue","value":[-1]},"dPraidBeforeFarmZ":{"id":"dPraidBeforeFarmZ","name":"Dy Raid bef farm Z","description":"P Raiding harder: List of zones where we should P Raid as far as we can afford before trying to farm fragments to Praid the highest or target prestige map.  Only occasionally useful, e.g. if it picks up a Speedexplorer or farming fragments is slow due to low damage. Set to -1 to never raid prestiges before farming fragents.","type":"multiValue","value":[-1]},"MaxPraidZone":{"id":"MaxPraidZone","name":"Max P Raid Zones","description":"List of maximum zones to Praid corresponding to the list specified in Praiding zones.  e.g. if P raiding zones setting is 491,495 and this setting is 495,505, AT will P raid up to 495 from 491, and 505 from 495. Set to -1 to always buy highest available prestige map.  If no corrsponding value, or value is invalid, defaults to max available (up to +10)","type":"multiValue","value":[505,535,545,555,561]},"PraidFarmFragsZ":{"id":"PraidFarmFragsZ","name":"Farm Fragments Z","description":"P Raiding harder: List of zones where we should farm fragments until we can afford the highest or target prestige map for P raiding. Set to -1 to never farm fragments. ","type":"multiValue","value":[-1]},"PraidBeforeFarmZ":{"id":"PraidBeforeFarmZ","name":"Raid before farm Z","description":"P Raiding harder: List of zones where we should P Raid as far as we can afford before trying to farm fragments to Praid the highest or target prestige map.  Only occasionally useful, e.g. if it picks up a Speedexplorer or farming fragments is slow due to low damage. Set to -1 to never raid prestiges before farming fragents.","type":"multiValue","value":[-1]},"fuellater":300,"dWindStackingMin":511,"dWindStackingMax":190,"dwindcutoff":80,"dhardcorewind":526,"ScryerSkipHealthy":2,"addpoison":true,"amalcoord":true,"dAutoGoldenUpgrades":"Void 60","cAutoGoldenUpgrades":"Battle","dhardcorewindmax":"-1","cfightforever":true,"work":false,"in":false,"progress":false,"hardcorewindmax":"-1","dfightforever":true} + "</textarea>";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Got it</div>";
        if (document.queryCommandSupported('copy')) {
            costText += "<div id='clipBoardBtn' class='btn btn-success'>Copy to Clipboard</div>";
            ondisplay = function() {
                document.getElementById('exportArea').select();
                document.getElementById('clipBoardBtn').addEventListener('click', function(event) {
                    document.getElementById('exportArea').select();
                    try {
                        document.execCommand('copy');
                    } catch (err) {
                        document.getElementById('clipBoardBtn').innerHTML = "Error, not copied";
                    }
                });
            };
        } else {
            ondisplay = function() {
                document.getElementById('exportArea').select();
            };
        }
        costText += "</div>";
    } else if (what == "ImportAutoTrimps") {
        //runs the loadAutoTrimps() function.
        tooltipText = "Import your AUTOTRIMPS save string! It'll be fine, I promise.<br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); loadAutoTrimps();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
        ondisplay = function() {
            document.getElementById('importBox').focus();
        };
    } else if (what == "CleanupAutoTrimps") {
        cleanupAutoTrimps();
        tooltipText = "Autotrimps saved-settings have been attempted to be cleaned up. If anything broke, refreshing will fix it, but check that your settings are correct! (prestige in particular)";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>OK</div></div>";
    } else if (what == "ExportModuleVars") {
        tooltipText = "These are your custom Variables. The defaults have not been included, only what you have set... <br/><br/><textarea id='exportArea' style='width: 100%' rows='5'>" + exportModuleVars() + "</textarea>";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Got it</div>";
        if (document.queryCommandSupported('copy')) {
            costText += "<div id='clipBoardBtn' class='btn btn-success'>Copy to Clipboard</div>";
            ondisplay = function() {
                document.getElementById('exportArea').select();
                document.getElementById('clipBoardBtn').addEventListener('click', function(event) {
                    document.getElementById('exportArea').select();
                    try {
                        document.execCommand('copy');
                    } catch (err) {
                        document.getElementById('clipBoardBtn').innerHTML = "Error, not copied";
                    }
                });
            };
        } else {
            ondisplay = function() {
                document.getElementById('exportArea').select();
            };
        }
        costText += "</div>";
    } else if (what == "ImportModuleVars") {
        tooltipText = "Enter your Autotrimps MODULE variable settings to load, and save locally for future use between refreshes:<br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); importModuleVars();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
        ondisplay = function() {
            document.getElementById('importBox').focus();
        };
    } else if (what == "ATModuleLoad") {
        var mods = document.getElementById('ATModuleListDropdown');
        var modnames = "";
        for (script in mods.selectedOptions) {
            var $item = mods.selectedOptions[script];
            if ($item.value != null) {
                ATscriptLoad(modulepath, $item.value);
                //console.log($item.value);
                modnames += $item.value + " ";
            }
        }
        tooltipText = "Autotrimps - Loaded the MODULE .JS File(s): " + modnames;
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>OK</div></div>";
    } else if (what == "ATModuleUnload") {
        var mods = document.getElementById('ATModuleListDropdown');
        var modnames = "";
        for (script in mods.selectedOptions) {
            var $item = mods.selectedOptions[script];
            if ($item.value != null) {
                ATscriptUnload($item.value);
                //console.log($item.value);
                modnames += $item.value + " ";
            }            
        }
        tooltipText = "Autotrimps - UnLoaded the MODULE .JS File(s): " + modnames;
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>OK</div></div>";
    } else if (what == "ResetModuleVars") {
        resetModuleVars();
        tooltipText = "Autotrimps MODULE variable settings have been successfully reset to its defaults!";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>OK</div></div>";
    } else if (what == 'MagmiteExplain') {
        tooltipText = "<img src='" + basepath + "mi.png'>";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>Thats all the help you get.</div></div>";
    } else if (what == 'ReadSettingsProfiles') {
        //Shows a Question Popup to READ the profile:
        titleText = '<b>Loading New AutoTrimps Profile...</b><p>Current Settings will be lost';
        tooltipText = '<b>NOTICE:</b> Switching to new AutoTrimps settings profile!!!! <br>All current settings <b>WILL</b> be lost after this point. <br>You might want to cancel, to go back and save your existing settings first....';
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 10vw' onclick='cancelTooltip(); confirmedSwitchNow();'>Confirm and Switch Profiles</div><div style='margin-left: 15%' class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>";
    } else if (what == 'ResetDefaultSettingsProfiles') {
        //Shows a Question Popup to RESET to DEFAULT the profile:
        titleText = '<b>Loading AutoTrimps Default Profile...</b><p>Current Settings will be lost!';
        tooltipText = '<b>NOTICE:</b> Switching to Default AutoTrimps settings profile!!!! <br>All current settings <b>WILL</b> be lost after this point. <br>You might want to cancel, to go back and save your existing settings first.... <br>This will <b><u>Reset</u></b> the script to factory settings.';
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 10vw' onclick='cancelTooltip(); resetAutoTrimps(); settingsProfiles.selectedIndex = 1;'>Reset to Default Profile</div><div style='margin-left: 15%' class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>";
    } else if (what == 'NameSettingsProfiles') {
        //Shows a Question Popup to NAME the profile
        titleText = "Enter New Settings Profile Name";
        tooltipText = "What would you like the name of the Settings Profile to be?<br/><br/><textarea id='setSettingsNameTooltip' style='width: 100%' rows='1'></textarea>";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 10vw' onclick='cancelTooltip(); nameAndSaveNewProfile();'>Import</div><div class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();document.getElementById(\"settingsProfiles\").selectedIndex=0;'>Cancel</div></div>";
        ondisplay = function() {
            document.getElementById('setSettingsNameTooltip').focus();
        };
    } else if (what == 'DeleteSettingsProfiles') {
        //Shows a Question Popup to DELETE the profile:
        titleText = "<b>WARNING:</b> Delete Profile???"
        tooltipText = "You are about to delete the <B><U>"+`${settingsProfiles.value}`+"</B></U> settings profile.<br>This will not switch your current settings though. Continue ?<br/>";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); onDeleteProfile();'>Delete Profile</div><div style='margin-left: 15%' class='btn btn-info' onclick='cancelTooltip();'>Cancel</div></div>";
    } else if (what == 'message') {
        titleText = "Generic message";
        tooltipText = event;
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 50%' onclick='cancelTooltip();'>OK</div></div>";
    }
    //Common:
    game.global.lockTooltip = true;
    $elem.style.left = "33.75%";
    $elem.style.top = "25%";
    document.getElementById("tipTitle").innerHTML = titleText;
    document.getElementById("tipText").innerHTML = tooltipText;
    document.getElementById("tipCost").innerHTML = costText;
    $elem.style.display = "block";
    if (ondisplay !== null)
        ondisplay();
}
//reset autotrimps to defaults (also handles imports)
function resetAutoTrimps(imported,profname) {
    ATrunning = false; //stop AT, wait, remove
    function waitRemoveLoad(imported) {
        localStorage.removeItem('autoTrimpSettings');
        //delete,remake,init defaults, recreate everything:
        autoTrimpSettings = imported ? imported : new Object(); //load the import.
        var $settingsRow = document.getElementById("settingsRow");
        $settingsRow.removeChild(document.getElementById("autoSettings"));
        $settingsRow.removeChild(document.getElementById("autoTrimpsTabBarMenu"));
        automationMenuSettingsInit();
        initializeAllTabs();
        initializeAllSettings();
        initializeSettingsProfiles();
        updateCustomButtons();
        saveSettings();
        checkPortalSettings();
        ATrunning = true; //restart AT.
    }
    setTimeout(waitRemoveLoad(imported),101);
    if (imported) {
        debug("Successfully imported new AT settings...", "profile");
        if (profname)   //pass in existing profile name to use:
            ImportExportTooltip("message", "Successfully Imported Autotrimps Settings File!: " + profname);
        else            //or prompt to create a new name:
            ImportExportTooltip('NameSettingsProfiles');
    } else {
        debug("Successfully reset AT settings to Defaults...", "profile");
        ImportExportTooltip("message", "Autotrimps has been successfully reset to its defaults!");
    }
}

//import autotrimps settings from a textbox
//For importing a new AT Config on the fly and reloading/applying all the settings.
function loadAutoTrimps() {
    //try the import
    try {
        var thestring = document.getElementById("importBox").value.replace(/[\n\r]/gm, "");
        var tmpset = JSON.parse(thestring);
        if (tmpset == null) {
            debug("Error importing AT settings, the string is empty.", "profile");
            return;
        }
    } catch (err) {
        debug("Error importing AT settings, the string is bad." + err.message, "profile");
        return;
    }
    debug("Importing new AT settings file...", "profile");
    resetAutoTrimps(tmpset);
}

//remove stale values from past autotrimps versions
function cleanupAutoTrimps() {
    for (var setting in autoTrimpSettings) {
        var $elem = document.getElementById(autoTrimpSettings[setting].id);
        if ($elem == null)
            delete autoTrimpSettings[setting];
    }
}

//export MODULE variables to a textbox
function exportModuleVars() {
    return JSON.stringify(compareModuleVars());
}

//diff two modules to find the difference;
function compareModuleVars() {
    var diffs = {};
    var mods = Object.keys(MODULES);
    for (var i in mods) {
        var mod = mods[i];
        var vars = Object.keys(MODULES[mods[i]]);
        for (var j in vars) {
            var vj = vars[j];
            var a = MODULES[mod][vj];
            var b = MODULESdefault[mod][vj];
            if (JSON.stringify(a)!=JSON.stringify(b)) {
                if (typeof diffs[mod] === 'undefined')
                    diffs[mod] = {};
                diffs[mod][vj] = a;
            }
        }
    }
    return diffs;
}

//import MODULE variables from a textbox
function importModuleVars() {
    //try the import
    try {
        var thestring = document.getElementById("importBox").value;
        var strarr = thestring.split(/\n/);
        for (var line in strarr) {
            var s = strarr[line];
            s = s.substring(0, s.indexOf(';')+1); //cut after the ;
            s = s.replace(/\s/g,'');    //regexp remove ALL(/g) whitespaces(\s)
            eval(s);
            strarr[line] = s;
        }
        var tmpset = compareModuleVars();
    } catch (err) {
        debug("Error importing MODULE vars, the string is bad." + err.message, "profile");
        return;
    }
    localStorage.removeItem('storedMODULES');
    safeSetItems('storedMODULES', JSON.stringify(tmpset));
}

//reset MODULE variables to default, (and/or then import)
function resetModuleVars(imported) {
    ATrunning = false; //stop AT, wait, remove
    function waitRemoveLoad(imported) {
        localStorage.removeItem('storedMODULES');
        MODULES = JSON.parse(JSON.stringify(MODULESdefault));
        //load everything again, anew
        safeSetItems('storedMODULES', JSON.stringify(storedMODULES));
        ATrunning = true; //restart AT.
    }
    setTimeout(waitRemoveLoad(imported),101);
}

settingsProfileMakeGUI(); //runs at the bottom now:
initializeSettingsProfiles();   //populate dropdown.
