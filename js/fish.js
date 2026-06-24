/**
 * Carp Fishing Tycoon - Fish System
 * Fish data model, aging, growth stages, permadeath, and name generation.
 */

'use strict';

const Fish = (function () {
    /**
     * Species definitions with base stats.
     */
    const SPECIES = {
        common: { name: 'Common Carp', maxWeight: 960, baseGrowth: 1.0, colour: '#8B7355' },
        mirror: { name: 'Mirror Carp', maxWeight: 1080, baseGrowth: 0.9, colour: '#B8860B' },
        leather: { name: 'Leather Carp', maxWeight: 840, baseGrowth: 0.85, colour: '#6B4226' },
        ghost: { name: 'Ghost Carp', maxWeight: 720, baseGrowth: 1.1, colour: '#C0C0C0' },
        koi: { name: 'Koi Carp', maxWeight: 600, baseGrowth: 0.95, colour: '#FF6347' },
        grass: { name: 'Grass Carp', maxWeight: 900, baseGrowth: 1.2, colour: '#556B2F' },
        crucian: { name: 'Crucian Carp', maxWeight: 120, baseGrowth: 0.7, colour: '#DAA520' }
    };

    /**
     * Growth stage definitions.
     * age_days thresholds for transitioning between stages.
     */
    const GROWTH_STAGES = [
        { name: 'Fry', minAge: 0, maxAge: 30 },
        { name: 'Juvenile', minAge: 31, maxAge: 120 },
        { name: 'Adult', minAge: 121, maxAge: 365 },
        { name: 'Mature', minAge: 366, maxAge: 730 },
        { name: 'Elder', minAge: 731, maxAge: Infinity }
    ];

    /**
     * Rarity levels with colour coding.
     * mythic is a new ultra-rare tier above legendary.
     */
    const RARITIES = {
        common:    { name: 'Common',    colour: '#aaaaaa', weight: 50 },
        uncommon:  { name: 'Uncommon',  colour: '#2ecc71', weight: 30 },
        rare:      { name: 'Rare',      colour: '#3498db', weight: 13 },
        epic:      { name: 'Epic',      colour: '#9b59b6', weight: 5  },
        legendary: { name: 'Legendary', colour: '#f1c40f', weight: 1.7 },
        mythic:    { name: 'Mythic',    colour: '#e74c3c', weight: 0.3 }
    };

    /**
     * Expanded trait pool.
     * Category: 'positive' | 'neutral' | 'negative'
     * Effects are applied in ageFish() and getFishValue().
     */
    const TRAIT_DEFINITIONS = {
        // ── POSITIVE ──────────────────────────────────────────────────────────
        'Shy':             { category: 'neutral',  colour: '#95a5a6', desc: 'Keeps to itself — no net stat effect.' },
        'Aggressive':      { category: 'positive', colour: '#e67e22', desc: 'Fights for food. Slightly faster growth.' },
        'Clever':          { category: 'positive', colour: '#3498db', desc: 'Adapts quickly. Better offspring stat inheritance.' },
        'Greedy':          { category: 'positive', colour: '#f39c12', desc: 'Eats voraciously. Higher weight potential.' },
        'Cautious':        { category: 'neutral',  colour: '#7f8c8d', desc: 'Avoids risk. Resists stress events.' },
        'Bold':            { category: 'positive', colour: '#2ecc71', desc: 'Thrives under pressure. Less health loss from stress.' },
        'Nocturnal':       { category: 'neutral',  colour: '#2c3e50', desc: 'Active at night — harder for anglers to catch.' },
        'Hardy':           { category: 'positive', colour: '#27ae60', desc: 'Built tough. Health damage from all sources reduced by 30%.' },
        'Alpha':           { category: 'positive', colour: '#d4a843', desc: 'Dominant fish. +10% sale value.' },
        'Fast Learner':    { category: 'positive', colour: '#1abc9c', desc: 'Offspring inherit +10 to all stats.' },
        'Champion':        { category: 'positive', colour: '#f1c40f', desc: 'Prize specimen. +25% sale value.' },
        'Pristine':        { category: 'positive', colour: '#16a085', desc: 'Flawless condition. Recovers +1 health per day naturally.' },
        'Legendary Genes': { category: 'positive', colour: '#9b59b6', desc: 'Carries exceptional genetics. +8 rarity boost when breeding.' },
        'Iron Scales':     { category: 'positive', colour: '#7f8c8d', desc: 'Natural armour. Immune to Otter Attack.' },
        'Apex Feeder':     { category: 'positive', colour: '#e67e22', desc: 'Dominates feeding. Growth rate +20%.' },
        // ── NEGATIVE ──────────────────────────────────────────────────────────
        'Sickly':          { category: 'negative', colour: '#e74c3c', desc: 'Constantly unwell. Loses 2 health per day.' },
        'Stunted':         { category: 'negative', colour: '#7f8c8d', desc: 'Growth rate permanently halved.' },
        'Fragile':         { category: 'negative', colour: '#c0392b', desc: 'Shorter lifespan. Max age reduced by 25%.' },
        'Disease-Prone':   { category: 'negative', colour: '#e74c3c', desc: 'Vulnerable to illness. Double health loss from disease events.' },
        'Timid':           { category: 'negative', colour: '#95a5a6', desc: 'Skittish around hooks. Slightly reduces angler satisfaction.' },
        'Territorial':     { category: 'negative', colour: '#c0392b', desc: 'Disrupts the lake. Reduces angler satisfaction.' },
        'Weak Genes':      { category: 'negative', colour: '#7f8c8d', desc: 'Poor genetics. Offspring trend toward lower rarities (-5 rarity boost).' },
        'Lethargic':       { category: 'negative', colour: '#95a5a6', desc: 'Barely moves. Growth rate −15%, sale value −10%.' }
    };

    /**
     * Personality traits available for fish — now includes positive and negative options.
     */
    const PERSONALITY_TRAITS = Object.keys(TRAIT_DEFINITIONS);

    /**
     * UK-style fish name parts for random generation.
     */
    const NAME_PREFIXES = [
        'Big', 'Old', 'Little', 'Mighty', 'Sly', 'Lucky', 'Golden',
        'Dark', 'Silver', 'Rusty', 'Swift', 'Gentle', 'Wily', 'Chunky',
        'Dusty', 'Muddy', 'Sandy', 'Copper', 'Bronze', 'Stormy'
    ];

    const NAME_SUFFIXES = [
        'Whiskers', 'Fin', 'Scales', 'Tail', 'Gill', 'Lips', 'Eyes',
        'Bob', 'Pete', 'Charlie', 'Bert', 'Reg', 'Neville', 'Arthur',
        'George', 'Norman', 'Barry', 'Dennis', 'Trevor', 'Malcolm'
    ];

    let nextFishId = 1;

    /**
     * Generate a random UK-style fish name.
     */
    function generateName() {
        var prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
        var suffix = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
        return prefix + ' ' + suffix;
    }

    /**
     * Determine rarity from weighted random.
     */
    function randomRarity() {
        var total = 0;
        var keys = Object.keys(RARITIES);
        keys.forEach(function (k) { total += RARITIES[k].weight; });
        var roll = Math.random() * total;
        var cumulative = 0;
        for (var i = 0; i < keys.length; i++) {
            cumulative += RARITIES[keys[i]].weight;
            if (roll <= cumulative) {
                return keys[i];
            }
        }
        return 'common';
    }

    /**
     * Generate random personality traits (1-3).
     * Negative traits have ~20% chance of appearing; positive/neutral ~80%.
     */
    function randomTraits() {
        var count    = Math.floor(Math.random() * 3) + 1;
        var positive = Object.keys(TRAIT_DEFINITIONS).filter(function (t) { return TRAIT_DEFINITIONS[t].category !== 'negative'; });
        var negative = Object.keys(TRAIT_DEFINITIONS).filter(function (t) { return TRAIT_DEFINITIONS[t].category === 'negative'; });
        var result   = [];

        for (var i = 0; i < count; i++) {
            var pool = (Math.random() < 0.20) ? negative : positive;
            pool = pool.filter(function (t) { return result.indexOf(t) === -1; });
            if (pool.length === 0) break;
            result.push(pool[Math.floor(Math.random() * pool.length)]);
        }
        if (result.length === 0) result.push(positive[Math.floor(Math.random() * positive.length)]);
        return result;
    }

    /**
     * Generate random stats (0-100 scale).
     */
    function randomStats() {
        return {
            strength: Math.floor(Math.random() * 70) + 30,
            cunning: Math.floor(Math.random() * 70) + 30,
            size_potential: Math.floor(Math.random() * 70) + 30,
            health: Math.floor(Math.random() * 50) + 50
        };
    }

    /**
     * Get the growth stage for a given age.
     */
    function getGrowthStage(ageDays) {
        for (var i = 0; i < GROWTH_STAGES.length; i++) {
            if (ageDays >= GROWTH_STAGES[i].minAge && ageDays <= GROWTH_STAGES[i].maxAge) {
                return GROWTH_STAGES[i].name;
            }
        }
        return 'Elder';
    }

    /**
     * Create a new fish with given or random properties.
     */
    function createFish(options) {
        options = options || {};
        var speciesKey = options.species || randomSpeciesKey();
        var speciesDef = SPECIES[speciesKey];
        var rarity = options.rarity || randomRarity();
        var ageDays = options.age_days || 0;
        var stats = options.stats || randomStats();

        // Adjust max age based on health stat and rarity
        var rarityMultiplier = { common: 1.0, uncommon: 1.1, rare: 1.2, epic: 1.3, legendary: 1.5, mythic: 2.0 };
        var baseMaxAge = 600 + Math.floor(stats.health * 4);
        var maxAge = Math.floor(baseMaxAge * (rarityMultiplier[rarity] || 1.0));

        // Fragile trait reduces max age at creation
        var traits = options.personality_traits || randomTraits();
        if (traits.indexOf('Fragile') !== -1) maxAge = Math.floor(maxAge * 0.75);

        var fish = {
            id: nextFishId++,
            name: options.name || generateName(),
            species: speciesKey,
            speciesName: speciesDef.name,
            weight_oz: options.weight_oz || Math.floor(Math.random() * 32) + 8,
            age_days: ageDays,
            max_age_days: maxAge,
            growth_rate: speciesDef.baseGrowth * (0.8 + Math.random() * 0.4),
            rarity: rarity,
            personality_traits: traits,
            stats: stats,
            parent_ids: options.parent_ids || [],
            lake_id: options.lake_id || null,
            growth_stage: getGrowthStage(ageDays),
            alive: true
        };

        return fish;
    }

    /**
     * Get a random species key.
     */
    function randomSpeciesKey() {
        var keys = Object.keys(SPECIES);
        return keys[Math.floor(Math.random() * keys.length)];
    }

    /**
     * Age a fish by one day. Returns true if fish is still alive.
     */
    function ageFish(fish) {
        if (!fish.alive) return false;

        fish.age_days++;
        fish.growth_stage = getGrowthStage(fish.age_days);

        // Grow weight based on growth_rate and stage
        var stageMultiplier = { 'Fry': 0.3, 'Juvenile': 0.8, 'Adult': 1.0, 'Mature': 0.5, 'Elder': 0.1 };
        var mult = stageMultiplier[fish.growth_stage] || 0.1;
        var speciesDef = SPECIES[fish.species];
        var maxWeightOz = speciesDef ? speciesDef.maxWeight : 640;

        // Trait growth modifiers
        var growthMod = 1.0;
        if (fish.personality_traits) {
            if (fish.personality_traits.indexOf('Stunted')     !== -1) growthMod *= 0.50;
            if (fish.personality_traits.indexOf('Apex Feeder') !== -1) growthMod *= 1.20;
            if (fish.personality_traits.indexOf('Greedy')      !== -1) growthMod *= 1.10;
            if (fish.personality_traits.indexOf('Lethargic')   !== -1) growthMod *= 0.85;
        }

        // Weight growth proportional to stats.size_potential
        var growth = fish.growth_rate * mult * (fish.stats.size_potential / 100) * 10 * growthMod;
        fish.weight_oz = Math.min(maxWeightOz, fish.weight_oz + growth);

        // Trait health effects (applied each day)
        if (fish.personality_traits) {
            if (fish.personality_traits.indexOf('Sickly')   !== -1) {
                fish.stats.health = Math.max(1, fish.stats.health - 2);
            }
            if (fish.personality_traits.indexOf('Pristine') !== -1) {
                fish.stats.health = Math.min(100, fish.stats.health + 1);
            }
        }

        // Check permadeath
        if (fish.age_days >= fish.max_age_days) {
            fish.alive = false;
            return false;
        }

        return true;
    }

    /**
     * Get species definition.
     */
    function getSpecies(key) {
        return SPECIES[key] || null;
    }

    /**
     * Get all species.
     */
    function getAllSpecies() {
        return SPECIES;
    }

    /**
     * Get rarity definition.
     */
    function getRarity(key) {
        return RARITIES[key] || RARITIES.common;
    }

    /**
     * Get all rarities.
     */
    function getAllRarities() {
        return RARITIES;
    }

    /**
     * Get all personality traits.
     */
    function getAllTraits() {
        return PERSONALITY_TRAITS;
    }

    /**
     * Get growth stages.
     */
    function getGrowthStages() {
        return GROWTH_STAGES;
    }

    /**
     * Set the next fish ID (for loading saved games).
     */
    function setNextId(id) {
        nextFishId = id;
    }

    /**
     * Get the current next ID.
     */
    function getNextId() {
        return nextFishId;
    }

    /**
     * Render a fish card HTML string.
     */
    function renderFishCard(fish, options) {
        options = options || {};
        var speciesDef = SPECIES[fish.species] || SPECIES.common;
        var rarityDef = RARITIES[fish.rarity] || RARITIES.common;
        var showActions = options.showActions !== false;
        var showLineage = options.showLineage !== false;

        var html = '';
        html += '<div class="fish-card rarity-' + fish.rarity + '">';

        // ── Rarity-coloured header band (matches card inventory style) ────────
        var rc = rarityDef.colour || '#888';
        html += '<div class="fish-card-header" style="background:linear-gradient(135deg,' + rc + '33,' + rc + '11);border-bottom:1px solid ' + rc + '33;">';
        html += '<div class="fish-card-header-left">';
        html += '<span class="fish-rarity-badge" style="background:' + rc + '33;color:' + rc + ';border:1px solid ' + rc + '55;">' + rarityDef.name + '</span>';
        html += '<span class="fish-species">' + speciesDef.name + '</span>';
        html += '<h4 class="fish-name">' + fish.name + '</h4>';
        html += '</div>';
        html += '<span class="fish-card-emoji">\uD83D\uDC1F</span>';
        html += '</div>';

        html += '<div class="fish-card-body">';
        html += '<div class="fish-info-row"><span class="fish-label">Weight:</span><span class="fish-value">' + UI.formatWeight(fish.weight_oz) + '</span></div>';
        html += '<div class="fish-info-row"><span class="fish-label">Age:</span><span class="fish-value">' + fish.age_days + ' days</span></div>';
        html += '<div class="fish-info-row"><span class="fish-label">Stage:</span><span class="fish-value">' + fish.growth_stage + '</span></div>';
        html += '<div class="fish-info-row"><span class="fish-label">Status:</span><span class="fish-value ' + (fish.alive ? 'status-alive' : 'status-dead') + '">' + (fish.alive ? 'Alive' : 'Deceased') + '</span></div>';

        // Personality traits — colour-coded by category
        html += '<div class="fish-traits">';
        fish.personality_traits.forEach(function (trait) {
            var tdef    = TRAIT_DEFINITIONS[trait];
            var col     = tdef ? tdef.colour : '#4a9c6d';
            var cat     = tdef ? tdef.category : 'neutral';
            var tooltip = tdef ? tdef.desc : '';
            html += '<span class="trait-badge trait-' + cat + '" style="border-color:' + col + ';color:' + col + ';" title="' + tooltip + '">' + trait + '</span>';
        });
        html += '</div>';

        // Stats bars
        html += '<div class="fish-stats">';
        html += renderStatBar('Strength', fish.stats.strength);
        html += renderStatBar('Cunning', fish.stats.cunning);
        html += renderStatBar('Size Potential', fish.stats.size_potential);
        html += renderStatBar('Health', fish.stats.health);
        html += '</div>';

        // Vertical parent lineage
        if (showLineage && fish.parent_ids && fish.parent_ids.length > 0) {
            html += renderLineage(fish);
        }

        html += '</div>';

        // Actions
        if (showActions && fish.alive) {
            html += '<div class="fish-card-actions">';
            html += '<button class="btn btn-secondary btn-sm" onclick="Breeding.addToBreedingPond(' + fish.id + ')">Send to Breed</button>';
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    /**
     * Render a stat bar.
     */
    function renderStatBar(label, value) {
        var html = '<div class="stat-bar-row">';
        html += '<span class="stat-bar-label">' + label + '</span>';
        html += '<div class="stat-bar-track"><div class="stat-bar-fill" style="width: ' + value + '%;"></div></div>';
        html += '<span class="stat-bar-value">' + value + '</span>';
        html += '</div>';
        return html;
    }

    /**
     * Render vertical parent lineage tree.
     */
    function renderLineage(fish) {
        var state = Game.getState();
        var html = '<div class="fish-lineage">';
        html += '<h5 class="lineage-title">Lineage</h5>';
        html += '<div class="lineage-tree">';

        // Current fish
        html += '<div class="lineage-node lineage-current">';
        html += '<span class="lineage-name">' + fish.name + '</span>';
        html += '</div>';

        // Parents
        if (fish.parent_ids.length > 0) {
            html += '<div class="lineage-connector"></div>';
            html += '<div class="lineage-parents">';
            fish.parent_ids.forEach(function (parentId) {
                var parent = findFishById(parentId, state);
                if (parent) {
                    var parentRarity = RARITIES[parent.rarity] || RARITIES.common;
                    html += '<div class="lineage-node lineage-parent">';
                    html += '<span class="lineage-name" style="border-color: ' + parentRarity.colour + ';">' + parent.name + '</span>';
                    html += '<span class="lineage-species">' + (SPECIES[parent.species] || SPECIES.common).name + '</span>';

                    // Grandparents
                    if (parent.parent_ids && parent.parent_ids.length > 0) {
                        html += '<div class="lineage-connector"></div>';
                        html += '<div class="lineage-grandparents">';
                        parent.parent_ids.forEach(function (gpId) {
                            var gp = findFishById(gpId, state);
                            if (gp) {
                                var gpRarity = RARITIES[gp.rarity] || RARITIES.common;
                                html += '<div class="lineage-node lineage-grandparent">';
                                html += '<span class="lineage-name" style="border-color: ' + gpRarity.colour + ';">' + gp.name + '</span>';
                                html += '</div>';
                            }
                        });
                        html += '</div>';
                    }

                    html += '</div>';
                }
            });
            html += '</div>';
        }

        html += '</div>';
        html += '</div>';
        return html;
    }

    /**
     * Find a fish by ID in the game state (alive or dead/history).
     */
    function findFishById(id, state) {
        state = state || Game.getState();
        var found = state.fish.find(function (f) { return f.id === id; });
        if (found) return found;
        // Check breeding pond
        if (state.breedingPond) {
            for (var i = 0; i < state.breedingPond.length; i++) {
                if (state.breedingPond[i] && state.breedingPond[i].id === id) {
                    return state.breedingPond[i];
                }
            }
        }
        // Check fish history for deceased fish lineage
        if (state.fishHistory) {
            found = state.fishHistory.find(function (f) { return f.id === id; });
            if (found) return found;
        }
        return null;
    }

    /**
     * Calculate the monetary value of a fish based on rarity, weight, and health.
     */
    function getFishValue(fish) {
        var RARITY_BASE = { common: 50, uncommon: 200, rare: 750, epic: 2500, legendary: 8000, mythic: 30000 };
        var base        = RARITY_BASE[fish.rarity] || 50;
        var weightMult  = Math.max(0.4, fish.weight_oz / 160);
        var healthMult  = 0.6 + ((fish.stats ? fish.stats.health : 80) / 250);
        var traitMult   = 1.0;
        if (fish.personality_traits) {
            if (fish.personality_traits.indexOf('Champion')  !== -1) traitMult *= 1.25;
            if (fish.personality_traits.indexOf('Alpha')     !== -1) traitMult *= 1.10;
            if (fish.personality_traits.indexOf('Sickly')    !== -1) traitMult *= 0.80;
            if (fish.personality_traits.indexOf('Stunted')   !== -1) traitMult *= 0.85;
            if (fish.personality_traits.indexOf('Lethargic') !== -1) traitMult *= 0.90;
        }
        return Math.round(base * weightMult * healthMult * traitMult);
    }

    /**
     * Total stock value for an array of living fish.
     */
    function getTotalStockValue(fishArray) {
        return fishArray.reduce(function (sum, f) {
            return sum + (f.alive ? getFishValue(f) : 0);
        }, 0);
    }

    return {
        SPECIES: SPECIES,
        RARITIES: RARITIES,
        TRAIT_DEFINITIONS: TRAIT_DEFINITIONS,
        GROWTH_STAGES: GROWTH_STAGES,
        PERSONALITY_TRAITS: PERSONALITY_TRAITS,
        createFish: createFish,
        ageFish: ageFish,
        getGrowthStage: getGrowthStage,
        getSpecies: getSpecies,
        getAllSpecies: getAllSpecies,
        getRarity: getRarity,
        getAllRarities: getAllRarities,
        getAllTraits: getAllTraits,
        getGrowthStages: getGrowthStages,
        generateName: generateName,
        randomRarity: randomRarity,
        randomTraits: randomTraits,
        randomStats: randomStats,
        renderFishCard: renderFishCard,
        findFishById: findFishById,
        renderLineage: renderLineage,
        setNextId: setNextId,
        getNextId: getNextId,
        getFishValue: getFishValue,
        getTotalStockValue: getTotalStockValue
    };
})();
