# AutoTrimps + Zek

## Discussion / Discord Channel
<a href="https://discord.gg/Ztcnfjr"><img src="https://png.icons8.com/color/180/discord-new-logo.png" width=48></a>
Discord is a chat program. Come to talk about AutoTrimps, for help, or suggestions for new features : https://discord.gg/Ztcnfjr

## Current Version (full changes below) - Ongoing Development!
- Too many to list
- This version has beta changes by Zek, forked from GenBTC + Kfro. Includes a lot more. Please tell me about bugs on Discord

## Script Installation
**Please backup your game via export before and during use to prevent losing your save due to corruption!**

***Your only Option***: Install TamperMonkey (Chrome) or GreaseMonkey (Firefox)

**EASY INSTALL click here: https://github.com/Zorn192/AutoTrimps/raw/gh-pages/.user.js** (the Monkeys will detect this and prompt you to install it)

Overly detailed Chrome/TamperMonkey Instructions:
- Open the TamperMonkey dashboard and go to utilities – in the URL box paste https://github.com/Zorn192/AutoTrimps/raw/gh-pages/.user.js and click IMPORT
- Alternatively, paste the contents of `.user.js` into a user script (pay attention, it says .user.js - this contains 4 lines of code that loads AutoTrimps2.js)
- The script should automatically load everytime you go to https://trimps.github.io or the game on Kongregate
- You will know you have the script loaded if you see the Automation and Graphs buttons in the game menu at the bottom
- DO NOT PASTE THE FULL 2000+ line contents of the script into TamperMonkey! It will not work properly!
- The .user.js file is a "stub" or "loader" that references the AutoTrimps2.js file which is where the actual script is located.
- The purpose of .user.js is so that you don't have to rely on TamperMonkey's update functionality - instead it will automaticaly download the updated copy from the URL provided everytime its loaded.

FireFox/GreaseMonkey instructions:
- GreaseMonkey identifies userscripts by visiting a URL that ends with ".user.js" in them:
- Visit this URL, and Agree to install the userscript:  https://github.com/Zorn192/AutoTrimps/raw/gh-pages/.user.js

## Easy explanation of Colors for EquipUpgrades / prestiges highlights
- white - Upgrade is not available
- yellow - Upgrade is not affordable
- orange - Upgrade is affordable, but will lower stats
- red - Yes, do it now!

## Detailed Code Documentation:

Since javascript is easily human readable, Much can be learned by reading the source code, starting with this knowledge:

The script was faux-modularized on 12/4/2016, with the modules residing in the '/modules/' dir. This means that although the files are seperate, they are all still required for the script to run. In addition, the interoperability of the modules is still undocumented, and some(most) rely on other modules. Sometime in the future, you will be able to load/use different verisons of the various modules.
AutoTrimps2.js is the main file that loads the modules, and then runs its mainLoop.

The mainLoop() consists of the following subroutine functions, all of which are enable-able/disable-able by their buttons.:
-     exitSpireCell();        //"Exit Spire After Cell" (other.js)
-     workerRatios();         //"Auto Worker Ratios"
-     buyUpgrades();          //"Buy Upgrades"
-     autoGoldenUpgrades();   //"AutoGoldenUpgrades" (genBTC settings area)
-     buyStorage();           //"Buy Storage"
-     buyBuildings();         //"Buy Buildings"
-     buyJobs();              //"Buy Jobs"
-     manualLabor();          //"Auto Gather/Build"
-     autoMap();              //"Auto Maps"
-     autoBreedTimer();          //"Genetecist Timer" / "Auto Breed Timer"
-     autoPortal();           //"Auto Portal" (hidden until level 40)
-     autoHeirlooms2();  or  autoHeirlooms(); //"Auto Heirlooms 2" (genBTC settings area) or //"Auto Heirlooms"
-     autoNull();             //"Auto Upgrade Heirlooms" (genBTC settings area)
-     toggleAutoTrap();       //"Trap Trimps"
-     autoRoboTrimp();        //"AutoRoboTrimp" (genBTC settings area)
-     autoLevelEquipment();   //"Buy Armor", "Buy Armor Upgrades", "Buy Weapons","Buy Weapons Upgrades"
-     autoStance();           //"Auto Stance"
-     betterAutoFight();      //"Better Auto Fight"
-     prestigeChanging2();    //"Dynamic Prestige" (genBTC settings area)
-     userscripts();          //Runs any user provided scripts - by copying and pasting a function named userscripts() into the Chrome Dev console. (F12)

Once you have determined the function you wish to examine, CTRL+F to find it and read its code. In this way you can determine why AutoTrimps is acting a certain way.
