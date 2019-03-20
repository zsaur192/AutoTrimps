function autoNatureTokens() {
    var changed = false;
    for (var nature in game.empowerments) {
        var empowerment = game.empowerments[nature];
        var setting = getPageSetting('Auto' + nature);
        if (!setting || setting == 'Off') continue;

        if (setting == 'Empowerment') {
            var cost = getNextNatureCost(nature);
            if (empowerment.tokens < cost || empowerment.tokens < getPageSetting('tokenthresh'))
                continue;
            empowerment.tokens -= cost;
            empowerment.level++;
            changed = true;
            debug('Upgraded Empowerment of ' + nature, 'nature');
        }
        else if (setting == 'Transfer') {
            if (empowerment.retainLevel >= 80 || empowerment.tokens < getPageSetting('tokenthresh'))
                continue;
            var cost = getNextNatureCost(nature, true);
            if (empowerment.tokens < cost) continue;
            empowerment.tokens -= cost;
            empowerment.retainLevel++;
            changed = true;
            debug('Upgraded ' + nature + ' transfer rate', 'nature');
        }
        else if (setting == 'Convert to Both') {
            if (empowerment.tokens < 20 || empowerment.tokens < getPageSetting('tokenthresh')) continue;
            for (var targetNature in game.empowerments) {
                if (targetNature == nature) continue;
                empowerment.tokens -= 10;
                var convertRate = (game.talents.nature.purchased) ? ((game.talents.nature2.purchased) ? 8 : 6) : 5;
                game.empowerments[targetNature].tokens += convertRate;
                changed = true;
                debug('Converted ' + nature + ' tokens to ' + targetNature, 'nature');
            }
        }
        else {
            if (empowerment.tokens < 10 || empowerment.tokens < getPageSetting('tokenthresh'))
                continue;
            var match = setting.match(/Convert to (\w+)/);
            var targetNature = match ? match[1] : null;
            if (!targetNature || targetNature === nature || !game.empowerments[targetNature]) continue;
            empowerment.tokens -= 10;
            var convertRate = (game.talents.nature.purchased) ? ((game.talents.nature2.purchased) ? 8 : 6) : 5;
            game.empowerments[targetNature].tokens += convertRate;
            changed = true;
            debug('Converted ' + nature + ' tokens to ' + targetNature, 'nature');
        }
    }
    if (changed)
        updateNatureInfoSpans();
}

function purchaseEnlight(nature) {
	var enlight = nature + "enlight";
	if (game.global.uberNature == false && game.global.world >= getPageSetting(enlight) && game.empowerments[nature].nextUberCost >= game.empowerments[nature].tokens) {
	    naturePurchase('uberEmpower', nature);
	}
}

function autoEnlight() {
	var nature = 'None';

	//FILLER
	if (getPageSetting('fillerenlight') ! = 'None' && game.global.challengeActive != "Daily" && !game.global.runningChallengeSquared && game.empowerments[nature].tokens >= getPageSetting('fillerenlightthreshdailyenlightthresh')) {
		nature = getPageSetting('fillerenlight');
		if (nature != 'None') {
		    purchaseEnlight(nature);
		}
	}

	//DAILY
	if (getPageSetting('dailyenlight') ! = 'None' && game.global.challengeActive == "Daily" && game.empowerments[nature].tokens >= getPageSetting('dailyenlightthresh')) {
		nature = getPageSetting('dailyenlight');
		if (nature != 'None') {
		    purchaseEnlight(nature);
		}
	}

	//C2
	if (getPageSetting('c2enlight') ! = 'None' && game.global.runningChallengeSquared && game.empowerments[nature].tokens >= getPageSetting('c2enlightthresh')) {
		nature = getPageSetting('c2enlight');
		if (nature != 'None') {
		    purchaseEnlight(nature);
		}
	}
}
