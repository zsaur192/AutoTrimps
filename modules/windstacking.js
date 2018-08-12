MODULES["windstacking"] = {};

function windstacking() {
         var windstackzone = getPageSetting('ultwindstackzone');
         var HD = HDratioy();
         var needequipwind = false;
         var needcoordwind = false;
         var needmapwind = false;
         var world = game.global.world
         if (HD < 0.00025 && world >= (windstackzone - 5) {
             MODULES["equipment"].enoughDamageCutoff = 90
             MODULES["maps"].enoughDamageCutoff = 90
             }
         if (HD > 0.00025 && world >= (windstackzone - 5) {
             MODULES["equipment"].enoughDamageCutoff = 4
             MODULES["maps"].enoughDamageCutoff = 4
             }
         if (meh cant be bothered) dontdothis();
}
