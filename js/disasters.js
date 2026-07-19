/**
 * Carp Fishing Tycoon - Disaster System
 * Random events that affect lakes, fish, and finances.
 */

'use strict';

const Disasters = (function () {
    /**
     * Disaster event definitions.
     */
    const DISASTER_TYPES = [
        {
            id: 'otter_attack',
            name: 'Otter Attack',
            description: 'Otters have been spotted in your lake! Some fish have been taken.',
            probability: 0.005,
            effect: function (state, lakeId) {
                var lakeFish = state.fish.filter(function (f) { return f.alive && f.lake_id === lakeId; });
                if (lakeFish.length === 0) return 'No fish were harmed.';
                var lostCount = Math.min(lakeFish.length, Math.floor(Math.random() * 3) + 1);
                var lost = lakeFish.sort(function () { return Math.random() - 0.5; }).slice(0, lostCount);
                lost.forEach(function (fish) {
                    fish.alive = false;
                    if (!state.fishHistory) state.fishHistory = [];
                    state.fishHistory.push(fish);
                });
                state.fish = state.fish.filter(function (f) { return f.alive; });
                return lostCount + ' fish lost to otter predation.';
            }
        },
        {
            id: 'blue_green_algae',
            name: 'Blue-Green Algae',
            description: 'Blue-green algae bloom detected! Lake closed for 3 days.',
            probability: 0.005,
            effect: function (state, lakeId) {
                // Mark lake as closed for 3 days
                if (!state.lakeClosures) state.lakeClosures = {};
                state.lakeClosures[lakeId] = state.day + 3;
                // Cancel active bookings at this lake
                var cancelled = 0;
                state.anglerBookings = state.anglerBookings.filter(function (b) {
                    if (b.lakeId === lakeId && b.endDay >= state.day) {
                        cancelled++;
                        return false;
                    }
                    return true;
                });
                return 'Lake closed for 3 days.' + (cancelled > 0 ? ' ' + cancelled + ' booking(s) cancelled.' : '');
            }
        },
        {
            id: 'poaching',
            name: 'Poaching',
            description: 'Poachers have stolen valuable fish from your lake overnight.',
            probability: 0.008,
            effect: function (state, lakeId) {
                // Target fish with rarity-weighted random selection
                var lakeFish = state.fish.filter(function (f) { return f.alive && f.lake_id === lakeId; });
                if (lakeFish.length === 0) return 'No fish were stolen.';
                var rarityWeight = { common: 1, uncommon: 2, rare: 4, epic: 8, legendary: 16 };
                var totalWeight = 0;
                lakeFish.forEach(function (f) { totalWeight += (rarityWeight[f.rarity] || 1); });
                var roll = Math.random() * totalWeight;
                var cumulative = 0;
                var stolen = lakeFish[0];
                for (var i = 0; i < lakeFish.length; i++) {
                    cumulative += (rarityWeight[lakeFish[i].rarity] || 1);
                    if (roll <= cumulative) {
                        stolen = lakeFish[i];
                        break;
                    }
                }
                stolen.alive = false;
                if (!state.fishHistory) state.fishHistory = [];
                state.fishHistory.push(stolen);
                state.fish = state.fish.filter(function (f) { return f.alive; });
                return stolen.name + ' (' + stolen.speciesName + ', ' + stolen.rarity + ') was stolen!';
            }
        },
        {
            id: 'storm_damage',
            name: 'Storm Damage',
            description: 'A severe storm has damaged lakeside vegetation and reduced biodiversity.',
            probability: 0.012,
            effect: function (state, lakeId) {
                // Temporary biodiversity reduction tracked separately
                if (!state.biodiversityPenalties) state.biodiversityPenalties = {};
                state.biodiversityPenalties[lakeId] = {
                    amount: 2,
                    expiresDay: state.day + 7
                };
                return 'Biodiversity reduced by 2 for 7 days.';
            }
        },
        {
            id: 'fish_disease',
            name: 'Fish Disease',
            description: 'A disease has spread among some fish, reducing their health.',
            probability: 0.010,
            effect: function (state, lakeId) {
                var lakeFish = state.fish.filter(function (f) { return f.alive && f.lake_id === lakeId; });
                if (lakeFish.length === 0) return 'No fish were affected.';
                var affected = Math.min(lakeFish.length, Math.floor(Math.random() * 5) + 2);
                var targets = lakeFish.sort(function () { return Math.random() - 0.5; }).slice(0, affected);
                targets.forEach(function (fish) {
                    fish.stats.health = Math.max(10, fish.stats.health - 20);
                    // Reduce max age
                    fish.max_age_days = Math.max(fish.age_days + 30, fish.max_age_days - 100);
                });
                return affected + ' fish affected by disease. Health reduced.';
            }
        },
        {
            id: 'drought',
            name: 'Drought',
            description: 'Extended dry weather has lowered water levels, reducing lake capacity.',
            probability: 0.008,
            effect: function (state, lakeId) {
                if (!state.capacityPenalties) state.capacityPenalties = {};
                state.capacityPenalties[lakeId] = {
                    amount: 10,
                    expiresDay: state.day + 10
                };
                return 'Lake capacity reduced by 10 for 10 days.';
            }
        },
        {
            id: 'vandalism',
            name: 'Vandalism',
            description: 'Vandals have damaged equipment at your lake. Repairs needed.',
            probability: 0.007,
            effect: function (state, lakeId) {
                // Cost to repair
                var repairCost = 1000 + Math.floor(Math.random() * 4000);
                state.money = Math.max(0, state.money - repairCost);
                state.totalSpent += repairCost;
                if (typeof Finance !== 'undefined') {
                    Finance.addFinanceLog('disaster_cost', -repairCost, 'Vandalism repairs');
                }
                // Chance to damage an upgrade
                if (state.lakeUpgrades && state.lakeUpgrades[lakeId] && state.lakeUpgrades[lakeId].length > 0) {
                    var randomIndex = Math.floor(Math.random() * state.lakeUpgrades[lakeId].length);
                    var damagedId = state.lakeUpgrades[lakeId].splice(randomIndex, 1)[0];
                    // Look up the display name for the upgrade
                    var allUpgrades = typeof Shop !== 'undefined' ? Shop.getAllUpgrades() : [];
                    var upgradeInfo = allUpgrades.find(function (u) { return u.id === damagedId; });
                    var damagedName = upgradeInfo ? upgradeInfo.name : damagedId;
                    return 'Repair costs: ' + UI.formatMoney(repairCost) + '. ' + damagedName + ' upgrade destroyed.';
                }
                return 'Repair costs: ' + UI.formatMoney(repairCost) + '.';
            }
        },
        // ── Weather-conditional disasters ────────────────────────────────────────
        // These have probability: 0 and are only triggered when the current weather
        // matches their weatherConditions list. rollForDisasters() uses weatherProbability.
        {
            id: 'ice_formation',
            name: 'Ice Formation',
            description: 'Freezing temperatures have caused ice to form across the lake, making it inaccessible.',
            probability: 0,
            weatherConditions: ['frost', 'snowfall'],
            weatherProbability: 0.12,
            effect: function (state, lakeId) {
                if (!state.lakeClosures) state.lakeClosures = {};
                state.lakeClosures[lakeId] = state.day + 2;
                var cancelled = 0;
                state.anglerBookings = state.anglerBookings.filter(function (b) {
                    if (b.lakeId === lakeId && b.endDay >= state.day) {
                        cancelled++;
                        return false;
                    }
                    return true;
                });
                return 'Lake frozen and closed for 2 days.' +
                    (cancelled > 0 ? ' ' + cancelled + ' booking(s) cancelled.' : '');
            }
        },
        {
            id: 'flash_flood',
            name: 'Flash Flood',
            description: 'Torrential storm rain has caused flash flooding, damaging the lake banks.',
            probability: 0,
            weatherConditions: ['stormy'],
            weatherProbability: 0.10,
            effect: function (state, lakeId) {
                if (!state.capacityPenalties) state.capacityPenalties = {};
                state.capacityPenalties[lakeId] = { amount: 15, expiresDay: state.day + 5 };
                if (!state.biodiversityPenalties) state.biodiversityPenalties = {};
                state.biodiversityPenalties[lakeId] = { amount: 1, expiresDay: state.day + 5 };
                var repairCost = 2000 + Math.floor(Math.random() * 3000);
                state.money = Math.max(0, state.money - repairCost);
                state.totalSpent += repairCost;
                if (typeof Finance !== 'undefined') {
                    Finance.addFinanceLog('disaster_cost', -repairCost, 'Flash flood repairs');
                }
                return 'Lake capacity reduced by 15 for 5 days. Repair costs: ' +
                    UI.formatMoney(repairCost) + '.';
            }
        }
    ];

    /**
     * Roll for disasters on each owned lake.
     * Security Camera upgrade reduces base chance by 50%.
     * Current weather modifies probabilities and unlocks weather-specific disasters.
     */
    function rollForDisasters() {
        var state = Game.getState();
        if (!state.ownedLakes || state.ownedLakes.length === 0) return;

        if (!state.disasterLog) state.disasterLog = [];
        if (!state.lastDisasterDay) state.lastDisasterDay = 0;

        // Max 1 disaster per 30 days
        if (state.day - state.lastDisasterDay < 30) return;

        // Get today's weather for probability modifiers
        var currentWeather = typeof Weather !== 'undefined' ? Weather.getCurrentWeather() : null;
        var weatherType    = currentWeather ? (currentWeather.current || 'cloudy') : 'cloudy';

        state.ownedLakes.forEach(function (lakeId) {
            // Skip closed lakes
            if (state.lakeClosures && state.lakeClosures[lakeId] &&
                state.lakeClosures[lakeId] >= state.day) {
                return;
            }

            var hasCamera        = typeof Shop !== 'undefined' && Shop.lakeHasUpgrade(lakeId, 'security_camera');
            var cameraMultiplier = hasCamera ? 0.5 : 1.0;
            var staffMultiplier  = typeof Staff !== 'undefined' ? Staff.getDisasterModifier(lakeId) : 1.0;
            // Grounds + security maintenance further reduce disaster chance
            var maintReduction = 0;
            if (typeof Lakes !== 'undefined') {
                maintReduction += Lakes.getLakeMaintenanceEffect(lakeId, 'disasterReduction');
            }
            var maintMultiplier = Math.max(0.1, 1.0 - maintReduction);
            var totalMultiplier    = cameraMultiplier * staffMultiplier * maintMultiplier;
            var disasterFired      = false;

            DISASTER_TYPES.forEach(function (disaster) {
                if (disasterFired) return;

                var chance;

                if (disaster.probability === 0) {
                    // Weather-conditional disaster — only fires in matching weather
                    if (!disaster.weatherConditions ||
                        disaster.weatherConditions.indexOf(weatherType) === -1) return;
                    chance = (disaster.weatherProbability || 0) * totalMultiplier;
                } else {
                    // Standard disaster — apply weather probability modifiers
                    chance = disaster.probability * totalMultiplier;

                    // Heatwave: algae blooms and drought far more likely; disease risk up
                    if (weatherType === 'heatwave') {
                        if (disaster.id === 'blue_green_algae') chance *= 3.0;
                        if (disaster.id === 'drought')          chance *= 2.5;
                        if (disaster.id === 'fish_disease')     chance *= 1.5;
                    }
                    // Storms: physical damage and vandalism more likely
                    if (weatherType === 'stormy') {
                        if (disaster.id === 'storm_damage')     chance *= 2.5;
                        if (disaster.id === 'vandalism')        chance *= 1.5;
                        if (disaster.id === 'fish_disease')     chance *= 1.5;
                    }
                    // Cold weather: no drought; poachers stay home
                    if (weatherType === 'frost' || weatherType === 'snowfall') {
                        if (disaster.id === 'drought')          chance = 0;
                        if (disaster.id === 'poaching')         chance *= 0.5;
                    }
                    // Rain flushes algae; vandals dislike getting wet
                    if (weatherType === 'rainy') {
                        if (disaster.id === 'blue_green_algae') chance *= 0.5;
                        if (disaster.id === 'vandalism')        chance *= 0.5;
                    }
                }

                if (Math.random() < chance) {
                    disasterFired = true;

                    var result   = disaster.effect(state, lakeId);
                    var lake     = Lakes.getLakeById(lakeId);
                    var lakeName = lake ? lake.name : 'Unknown Lake';

                    var logEntry = {
                        day:         state.day,
                        disasterId:  disaster.id,
                        name:        disaster.name,
                        lake:        lakeName,
                        lakeId:      lakeId,
                        description: disaster.description,
                        result:      result,
                        timestamp:   Date.now()
                    };

                    state.disasterLog.push(logEntry);
                    if (state.disasterLog.length > 20) {
                        state.disasterLog = state.disasterLog.slice(-20);
                    }

                    state.lastDisasterDay = state.day;

                    Game.addNotification('\u26A0 DISASTER: ' + disaster.name +
                        ' at ' + lakeName + '! ' + result);
                    UI.showToast(disaster.name + ' at ' + lakeName + '!', 'error');
                }
            });
        });

        // Clean up expired closures
        if (state.lakeClosures) {
            Object.keys(state.lakeClosures).forEach(function (lakeId) {
                if (state.lakeClosures[lakeId] < state.day) {
                    delete state.lakeClosures[lakeId];
                }
            });
        }

        // Clean up expired penalties
        if (state.biodiversityPenalties) {
            Object.keys(state.biodiversityPenalties).forEach(function (lakeId) {
                if (state.biodiversityPenalties[lakeId].expiresDay < state.day) {
                    delete state.biodiversityPenalties[lakeId];
                }
            });
        }
        if (state.capacityPenalties) {
            Object.keys(state.capacityPenalties).forEach(function (lakeId) {
                if (state.capacityPenalties[lakeId].expiresDay < state.day) {
                    delete state.capacityPenalties[lakeId];
                }
            });
        }
    }

    /**
     * Get all disaster types.
     */
    function getAllDisasterTypes() {
        return DISASTER_TYPES;
    }

    /**
     * Get the disaster log.
     */
    function getDisasterLog() {
        var state = Game.getState();
        return state.disasterLog || [];
    }

    return {
        rollForDisasters: rollForDisasters,
        getAllDisasterTypes: getAllDisasterTypes,
        getDisasterLog: getDisasterLog
    };
})();
