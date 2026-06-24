/**
 * Carp Fishing Tycoon - Weather System
 * Seasonal weather with effects on lake oxygen, angler bookings, fish health,
 * and disaster probability. A 365-day year cycles through four UK seasons.
 */

'use strict';

const Weather = (function () {

    const BASE_OXYGEN = 8.5; // mg/L in neutral conditions

    /**
     * Season definitions.
     * Winter wraps around: days 335-365 and 1-59.
     */
    const SEASONS = {
        spring: { name: 'Spring', emoji: '\uD83C\uDF31', dayStart: 60,  dayEnd: 151, oxygenMod:  0.5 },
        summer: { name: 'Summer', emoji: '\u2600\uFE0F', dayStart: 152, dayEnd: 243, oxygenMod: -1.5 },
        autumn: { name: 'Autumn', emoji: '\uD83C\uDF42', dayStart: 244, dayEnd: 334, oxygenMod:  0.0 },
        winter: { name: 'Winter', emoji: '\u2744\uFE0F', dayStart: 335, dayEnd:  59, oxygenMod:  1.5 }
    };

    /**
     * Weather type definitions.
     *   oxygenMod      — change to lake oxygen level (mg/L)
     *   anglerMod      — additive modifier to booking probability (e.g. -0.6 = 60% fewer)
     *   satisfactionMod — daily satisfaction delta for active anglers
     *   tempMod        — °C offset from seasonal baseline
     */
    const WEATHER_TYPES = {
        sunny:    { name: 'Sunny',    emoji: '\u2600\uFE0F',  tempMod:  3, oxygenMod:  0.0, anglerMod:  0.20, satisfactionMod:  3 },
        cloudy:   { name: 'Cloudy',   emoji: '\u26C5',        tempMod:  0, oxygenMod:  0.0, anglerMod:  0.00, satisfactionMod:  0 },
        overcast: { name: 'Overcast', emoji: '\u2601\uFE0F',  tempMod: -1, oxygenMod: -0.2, anglerMod: -0.10, satisfactionMod: -2 },
        rainy:    { name: 'Rainy',    emoji: '\uD83C\uDF27\uFE0F', tempMod: -2, oxygenMod:  0.3, anglerMod: -0.25, satisfactionMod: -5 },
        stormy:   { name: 'Stormy',   emoji: '\u26C8\uFE0F',  tempMod: -3, oxygenMod:  0.5, anglerMod: -0.60, satisfactionMod: -10 },
        foggy:    { name: 'Foggy',    emoji: '\uD83C\uDF2B\uFE0F', tempMod: -1, oxygenMod: -0.2, anglerMod: -0.20, satisfactionMod: -3 },
        frost:    { name: 'Frost',    emoji: '\uD83C\uDF28\uFE0F', tempMod: -5, oxygenMod:  0.7, anglerMod: -0.40, satisfactionMod: -8 },
        snowfall: { name: 'Snowfall', emoji: '\u2744\uFE0F',  tempMod: -6, oxygenMod:  0.5, anglerMod: -0.70, satisfactionMod: -12 },
        heatwave: { name: 'Heatwave', emoji: '\uD83C\uDF21\uFE0F', tempMod:  8, oxygenMod: -2.0, anglerMod:  0.10, satisfactionMod: -4 }
    };

    /**
     * Weighted probability tables for weather per season.
     * Values are relative weights (not percentages).
     */
    const SEASON_WEIGHTS = {
        spring: { sunny: 25, cloudy: 25, overcast: 20, rainy: 20, stormy:  5, foggy:  5, frost:  0, snowfall: 0, heatwave: 0 },
        summer: { sunny: 38, cloudy: 20, overcast: 10, rainy: 10, stormy: 10, foggy:  5, frost:  0, snowfall: 0, heatwave: 7 },
        autumn: { sunny: 15, cloudy: 25, overcast: 20, rainy: 25, stormy: 10, foggy:  5, frost:  0, snowfall: 0, heatwave: 0 },
        winter: { sunny:  5, cloudy: 20, overcast: 20, rainy: 15, stormy: 10, foggy: 10, frost: 14, snowfall: 6, heatwave: 0 }
    };

    /** Seasonal base temperatures (°C). */
    const SEASON_TEMPS = { spring: 12, summer: 21, autumn: 11, winter: 3 };

    // ── Internal helpers ────────────────────────────────────────────────────────

    function getDayOfYear(gameDay) {
        return ((gameDay - 1) % 365) + 1;
    }

    function getSeason(dayOfYear) {
        if (dayOfYear >= 60  && dayOfYear <= 151) return 'spring';
        if (dayOfYear >= 152 && dayOfYear <= 243) return 'summer';
        if (dayOfYear >= 244 && dayOfYear <= 334) return 'autumn';
        return 'winter';
    }

    function pickWeatherType(season) {
        var weights = SEASON_WEIGHTS[season] || SEASON_WEIGHTS.spring;
        var keys    = Object.keys(weights);
        var total   = 0;
        keys.forEach(function (k) { total += weights[k]; });
        var roll = Math.random() * total;
        var cumulative = 0;
        for (var i = 0; i < keys.length; i++) {
            cumulative += weights[keys[i]];
            if (roll <= cumulative) return keys[i];
        }
        return 'cloudy';
    }

    function calcTemperature(season, weatherType) {
        var base    = SEASON_TEMPS[season] || 12;
        var wDef    = WEATHER_TYPES[weatherType] || {};
        var variance = Math.round((Math.random() - 0.5) * 6); // ±3 °C
        return base + (wDef.tempMod || 0) + variance;
    }

    function calcLakeOxygen(lakeId, season, weatherType) {
        var state   = Game.getState();
        var sDef    = SEASONS[season]        || SEASONS.spring;
        var wDef    = WEATHER_TYPES[weatherType] || WEATHER_TYPES.cloudy;
        var oxygen  = BASE_OXYGEN + sDef.oxygenMod + wDef.oxygenMod;

        // Aerator upgrade boosts oxygen
        if (typeof Shop !== 'undefined' && Shop.lakeHasUpgrade(lakeId, 'aerator')) {
            oxygen += 1.5;
        }

        // Overcrowded lake depletes oxygen faster
        if (typeof Lakes !== 'undefined') {
            var lake = Lakes.getLakeById(lakeId);
            if (lake) {
                var capPenalty = 0;
                if (state.capacityPenalties && state.capacityPenalties[lakeId]) {
                    capPenalty = state.capacityPenalties[lakeId].amount || 0;
                }
                var effectiveCap = lake.capacity - capPenalty;
                var stocked = state.fish.filter(function (f) {
                    return f.alive && f.lake_id === lakeId;
                }).length;
                if (effectiveCap > 0 && stocked / effectiveCap > 0.8) {
                    oxygen -= 0.8;
                }
            }
        }

        // Active algae bloom tanks oxygen
        if (state.lakeClosures && state.lakeClosures[lakeId] &&
            state.lakeClosures[lakeId] >= state.day) {
            oxygen -= 2.5;
        }

        return Math.max(0.0, Math.min(14.0, Math.round(oxygen * 10) / 10));
    }

    // ── Public API ──────────────────────────────────────────────────────────────

    /**
     * Called from Game.init() — sets opening weather silently (no notifications).
     */
    function initWeather() {
        var state = Game.getState();
        if (state.weather && state.weather.current) return; // already set

        var dayOfYear   = getDayOfYear(state.day);
        var season      = getSeason(dayOfYear);
        var weatherType = pickWeatherType(season);
        var temperature = calcTemperature(season, weatherType);

        if (!state.weather)    state.weather    = {};
        if (!state.lakeOxygen) state.lakeOxygen = {};

        state.weather.current     = weatherType;
        state.weather.season      = season;
        state.weather.temperature = temperature;
        state.weather.dayOfYear   = dayOfYear;

        state.ownedLakes.forEach(function (lakeId) {
            state.lakeOxygen[lakeId] = calcLakeOxygen(lakeId, season, weatherType);
        });
    }

    /**
     * Called from Game.nextDay() — generates weather, recalculates oxygen,
     * applies low-oxygen fish damage, and queues notifications.
     */
    function processWeather() {
        var state       = Game.getState();
        var dayOfYear   = getDayOfYear(state.day);
        var season      = getSeason(dayOfYear);
        var weatherType = pickWeatherType(season);
        var temperature = calcTemperature(season, weatherType);
        var wDef        = WEATHER_TYPES[weatherType];
        var sDef        = SEASONS[season];

        if (!state.weather)    state.weather    = {};
        if (!state.lakeOxygen) state.lakeOxygen = {};

        state.weather.current     = weatherType;
        state.weather.season      = season;
        state.weather.temperature = temperature;
        state.weather.dayOfYear   = dayOfYear;

        // Daily weather notification
        Game.addNotification(
            wDef.emoji + ' ' + wDef.name +
            ' \u2014 ' + sDef.emoji + ' ' + sDef.name +
            ' \u2014 ' + temperature + '\u00b0C'
        );

        // Notable weather warnings
        if (weatherType === 'heatwave') {
            Game.addNotification(
                '\uD83C\uDF21\uFE0F Heatwave! Lake oxygen is falling \u2014 watch your fish closely.'
            );
        } else if (weatherType === 'snowfall') {
            Game.addNotification(
                '\u2744\uFE0F Snowfall \u2014 most anglers will stay home. Ice may form on still water.'
            );
        } else if (weatherType === 'stormy') {
            Game.addNotification(
                '\u26C8\uFE0F Storm conditions! Angler bookings are very unlikely; flood risk is elevated.'
            );
        } else if (weatherType === 'frost') {
            Game.addNotification(
                '\uD83C\uDF28\uFE0F Heavy frost \u2014 anglers are cautious and ice may form on still water.'
            );
        }

        // Recalculate oxygen for every owned lake and handle low-oxygen effects
        state.ownedLakes.forEach(function (lakeId) {
            var oxygen = calcLakeOxygen(lakeId, season, weatherType);
            state.lakeOxygen[lakeId] = oxygen;

            var lakeDef  = typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
            var lakeName = lakeDef ? lakeDef.name : lakeId;

            if (oxygen < 3.0) {
                // Critical — fish take health damage every day
                var affected = 0;
                state.fish.forEach(function (fish) {
                    if (fish.alive && fish.lake_id === lakeId) {
                        fish.stats.health = Math.max(1, fish.stats.health - 8);
                        affected++;
                    }
                });
                if (affected > 0) {
                    Game.addNotification(
                        '\u26A0\uFE0F CRITICAL OXYGEN at ' + lakeName +
                        ' (' + oxygen + ' mg/L)! ' + affected +
                        ' fish losing health. Install an Aerator urgently!'
                    );
                }
            } else if (oxygen < 5.0) {
                Game.addNotification(
                    '\u26A0\uFE0F Low oxygen at ' + lakeName +
                    ' (' + oxygen + ' mg/L). Consider an Aerator upgrade.'
                );
            }
        });

        return state.weather;
    }

    /** Returns the current weather object from state. */
    function getCurrentWeather() {
        var state = Game.getState();
        return state.weather || { current: 'cloudy', season: 'spring', temperature: 12, dayOfYear: 1 };
    }

    /** Returns the definition object for a weather type key. */
    function getWeatherDef(type) {
        return WEATHER_TYPES[type] || WEATHER_TYPES.cloudy;
    }

    /** Returns the definition object for a season key. */
    function getSeasonDef(season) {
        return SEASONS[season] || SEASONS.spring;
    }

    /**
     * Combined season + weather angler-booking modifier.
     * Negative = fewer bookings, positive = more.
     * Clamped to [-0.95, +0.60].
     */
    function getAnglerModifier() {
        var w          = getCurrentWeather();
        var seasonMods = { spring: 0.0, summer: 0.30, autumn: -0.10, winter: -0.50 };
        var wDef       = WEATHER_TYPES[w.current] || { anglerMod: 0 };
        var total      = (seasonMods[w.season] || 0) + (wDef.anglerMod || 0);
        return Math.max(-0.95, Math.min(0.60, total));
    }

    /** Daily satisfaction modifier for anglers already on-site. */
    function getAnglerSatisfactionMod() {
        var w    = getCurrentWeather();
        var wDef = WEATHER_TYPES[w.current] || {};
        return wDef.satisfactionMod || 0;
    }

    /** Returns the cached oxygen level for a specific lake. */
    function getLakeOxygen(lakeId) {
        var state = Game.getState();
        if (!state.lakeOxygen) return BASE_OXYGEN;
        return (state.lakeOxygen[lakeId] !== undefined)
            ? state.lakeOxygen[lakeId]
            : BASE_OXYGEN;
    }

    /**
     * Returns a { label, cssClass } for an oxygen reading.
     * Used for colour-coded display.
     */
    function getOxygenStatus(oxygen) {
        if (oxygen >= 7.0) return { label: 'Excellent', cssClass: 'oxygen-excellent' };
        if (oxygen >= 5.0) return { label: 'Good',      cssClass: 'oxygen-good'      };
        if (oxygen >= 3.0) return { label: 'Low',       cssClass: 'oxygen-low'       };
        return                     { label: 'Critical',  cssClass: 'oxygen-critical'  };
    }

    /** Expose WEATHER_TYPES and SEASONS for use in rendering (dashboard etc.). */
    function getAllWeatherTypes() { return WEATHER_TYPES; }
    function getAllSeasons()      { return SEASONS; }

    return {
        initWeather:              initWeather,
        processWeather:           processWeather,
        getCurrentWeather:        getCurrentWeather,
        getWeatherDef:            getWeatherDef,
        getSeasonDef:             getSeasonDef,
        getAnglerModifier:        getAnglerModifier,
        getAnglerSatisfactionMod: getAnglerSatisfactionMod,
        getLakeOxygen:            getLakeOxygen,
        getOxygenStatus:          getOxygenStatus,
        getAllWeatherTypes:        getAllWeatherTypes,
        getAllSeasons:             getAllSeasons,
        getSeason:                getSeason,
        getDayOfYear:             getDayOfYear
    };
})();
