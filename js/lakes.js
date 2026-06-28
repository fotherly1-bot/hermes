/**
 * Carp Fishing Tycoon - Lake Management
 * Defines UK lakes, handles buying/unlocking, and lake selector UI.
 */

'use strict';

const Lakes = (function () {
    /**
     * Lake definitions - UK-named fishing venues.
     * Each lake has properties for cost, reputation requirement, capacity,
     * water type, biodiversity, and daily income.
     */
    const LAKE_DEFINITIONS = [
        {
            id: 'willow_pool',
            name: 'Willow Pool',
            county: 'Surrey',
            cost: 0,
            wealthRequired: 0,
            capacity: 70,
            waterType: 'still',
            biodiversityScore: 5,
            dailyIncomePerAngler: 25,
            description: 'A small, sheltered pool surrounded by willows. Your starting venue with modest stock.',
            buffs: {
                positive: { growthBonus: 0.05, summary: 'Sheltered waters → +5% fish growth' },
                negative: { predatorChance: 0.02, summary: 'Shallow margins → +2% predator loss risk' }
            }
        },
        {
            id: 'oakmere_lake',
            name: 'Oakmere Lake',
            county: 'Cheshire',
            cost: 75000,
            wealthRequired: 40000,
            capacity: 240,
            waterType: 'still',
            biodiversityScore: 6,
            dailyIncomePerAngler: 40,
            description: 'A picturesque two-acre lake nestled amongst ancient oak trees.',
            buffs: {
                positive: { healthRegen: 1, summary: 'Oak tannins → +1 daily fish health' },
                negative: { siltBuildUp: 0.03, summary: 'Leaf fall → +3% monthly silt event chance' }
            }
        },
        {
            id: 'kingfisher_waters',
            name: 'Kingfisher Waters',
            county: 'Derbyshire',
            cost: 150000,
            wealthRequired: 90000,
            capacity: 320,
            waterType: 'running',
            biodiversityScore: 7,
            dailyIncomePerAngler: 55,
            description: 'A spring-fed lake with crystal-clear running water. Excellent biodiversity.',
            buffs: {
                positive: { oxygenBonus: 0.5, summary: 'Spring flow → +0.5 mg/L base oxygen' },
                negative: { floodRisk: 0.04, summary: 'Flash floods → +4% seasonal fish displacement' }
            }
        },
        {
            id: 'linch_hill',
            name: 'Linch Hill',
            county: 'Oxfordshire',
            cost: 350000,
            wealthRequired: 200000,
            capacity: 220,
            waterType: 'gravel_pit',
            biodiversityScore: 8,
            dailyIncomePerAngler: 80,
            description: 'A former gravel pit transformed into a premier carp fishery in Oxfordshire.',
            buffs: {
                positive: { growthBonus: 0.15, summary: 'Mineral-rich clay → +15% fish growth' },
                negative: { predatorChance: 0.05, summary: 'Deep margins → +5% otter/perch predation' }
            }
        },
        {
            id: 'wraysbury',
            name: 'Wraysbury',
            county: 'Berkshire',
            cost: 750000,
            wealthRequired: 450000,
            capacity: 300,
            waterType: 'gravel_pit',
            biodiversityScore: 9,
            dailyIncomePerAngler: 120,
            description: 'A legendary gravel pit near Heathrow. Home to some of the largest carp in the country.',
            buffs: {
                positive: { maxWeightBonus: 0.20, rarityBoost: 0.10, summary: 'Legendary genetics → +20% max weight, +10% rarity rolls' },
                negative: { poachingRisk: 0.06, stressPenalty: 0.05, summary: 'High profile → +6% poaching, +5% angling stress' }
            }
        },
        {
            id: 'yateley',
            name: 'Yateley',
            county: 'Hampshire',
            cost: 1500000,
            wealthRequired: 900000,
            capacity: 360,
            waterType: 'estate_lake',
            biodiversityScore: 9,
            dailyIncomePerAngler: 180,
            description: 'The iconic Yateley complex in Hampshire. Steeped in carp fishing history.',
            buffs: {
                positive: { reputationGain: 2, biodiversityBonus: 1, summary: 'Prestige venue → +2 rep/day, +1 biodiversity' },
                negative: { maintenanceCostMult: 1.25, summary: 'Estate upkeep → +25% maintenance costs' }
            }
        },
        {
            id: 'redmire_pool',
            name: 'Redmire Pool',
            county: 'Herefordshire',
            cost: 3000000,
            wealthRequired: 1800000,
            capacity: 240,
            waterType: 'estate_lake',
            biodiversityScore: 9,
            dailyIncomePerAngler: 250,
            description: 'The birthplace of modern carp fishing in Herefordshire. A truly hallowed venue.',
            buffs: {
                positive: { growthBonus: 0.25, rarityBoost: 0.15, maxWeightBonus: 0.15, summary: 'Hallowed waters → +25% growth, +15% rarity, +15% max weight' },
                negative: { anglingPressure: 0.10, capacityPenalty: 0.15, summary: 'Famous venue → +10% hook pulls, -15% effective capacity' }
            }
        },
        {
            id: 'savay_lake',
            name: 'Savay Lake',
            county: 'Buckinghamshire',
            cost: 5000000,
            wealthRequired: 3000000,
            capacity: 500,
            waterType: 'estate_lake',
            biodiversityScore: 10,
            dailyIncomePerAngler: 350,
            description: 'The crown jewel of British carp fishing. An exclusive estate lake of unrivalled prestige.',
            buffs: {
                positive: { growthBonus: 0.30, rarityBoost: 0.20, reputationGain: 3, incomeBonus: 0.15, summary: 'Apex fishery → +30% growth, +20% rarity, +3 rep/day, +15% income' },
                negative: { maintenanceCostMult: 1.50, poachingRisk: 0.08, anglingPressure: 0.12, summary: 'Ultra-high profile → +50% maint, +8% poaching, +12% hook pulls' }
            }
        },
        // ── Additional lakes ─────────────────────────────────────────────────
        {
            id: 'clearbeck_reservoir',
            name: 'Clearbeck Reservoir',
            county: 'North Yorkshire',
            cost: 200000,
            wealthRequired: 120000,
            capacity: 180,
            waterType: 'still',
            biodiversityScore: 7,
            dailyIncomePerAngler: 65,
            description: 'A former water-supply reservoir converted to a premium fishery. Deep, cold and full of specimens.',
            buffs: {
                positive: { growthBonus: 0.10, oxygenBonus: 0.3, summary: 'Cold depths → +10% growth, +0.3mg/L oxygen' },
                negative: { winterKill: 0.04, summary: 'Ice cover → +4% winter mortality' }
            }
        },
        {
            id: 'monks_mere',
            name: 'Monks Mere',
            county: 'Shropshire',
            cost: 450000,
            wealthRequired: 275000,
            capacity: 240,
            waterType: 'estate_lake',
            biodiversityScore: 8,
            dailyIncomePerAngler: 95,
            description: 'Peaceful monastic grounds with a sheltered three-acre mere. Prized for its tranquil setting.',
            buffs: {
                positive: { stressReduction: 0.10, reputationGain: 1, summary: 'Sanctuary waters → -10% angling stress, +1 rep/day' },
                negative: { growthPenalty: 0.05, capacityLimit: 200, summary: 'No feeding → -5% growth, max 200 fish' }
            }
        },
        {
            id: 'bradshaw_pits',
            name: 'Bradshaw Pits',
            county: 'Lancashire',
            cost: 950000,
            wealthRequired: 575000,
            capacity: 320,
            waterType: 'gravel_pit',
            biodiversityScore: 9,
            dailyIncomePerAngler: 145,
            description: 'A series of interconnected gravel pits in Lancashire. Wide open water and big fish.',
            buffs: {
                positive: { growthBonus: 0.20, maxWeightBonus: 0.15, summary: 'Interconnected pits → +20% growth, +15% max weight' },
                negative: { predatorChance: 0.07, diseaseSpread: 0.03, summary: 'Connected system → +7% predators, +3% disease spread' }
            }
        },
        {
            id: 'cranfield_weir',
            name: 'Cranfield Weir',
            county: 'Bedfordshire',
            cost: 1200000,
            wealthRequired: 720000,
            capacity: 270,
            waterType: 'running',
            biodiversityScore: 9,
            dailyIncomePerAngler: 160,
            description: 'A dramatic weir pool on the River Ouse. Moving water and exceptional biodiversity attract specialist anglers.',
            buffs: {
                positive: { oxygenBonus: 0.8, biodiversityBonus: 1, reputationGain: 1, summary: 'Weir turbulence → +0.8mg/L oxygen, +1 biodiversity, +1 rep/day' },
                negative: { floodRisk: 0.06, washoutChance: 0.02, summary: 'River surges → +6% flood displacement, +2% washout' }
            }
        },
        {
            id: 'harrington_park',
            name: 'Harrington Park Lake',
            county: 'Northamptonshire',
            cost: 2200000,
            wealthRequired: 1300000,
            capacity: 340,
            waterType: 'estate_lake',
            biodiversityScore: 9,
            dailyIncomePerAngler: 210,
            description: 'A Georgian estate lake surrounded by ancient parkland. One of the finest addresses in English fishing.',
            buffs: {
                positive: { reputationGain: 2, incomeBonus: 0.10, maxWeightBonus: 0.10, summary: 'Heritage venue → +2 rep/day, +10% income, +10% max weight' },
                negative: { maintenanceCostMult: 1.30, anglingPressure: 0.08, summary: 'Listed grounds → +30% maint, +8% hook pulls' }
            }
        },
        {
            id: 'loch_davan',
            name: 'Loch Davan',
            county: 'Aberdeenshire',
            cost: 4000000,
            wealthRequired: 2400000,
            capacity: 420,
            waterType: 'still',
            biodiversityScore: 10,
            dailyIncomePerAngler: 300,
            description: 'A remote Scottish loch of legendary status. Wild, windswept and home to the most elusive fish in Britain.',
            buffs: {
                positive: { growthBonus: 0.25, rarityBoost: 0.18, reputationGain: 2, maxWeightBonus: 0.25, summary: 'Wild loch → +25% growth, +18% rarity, +2 rep/day, +25% max weight' },
                negative: { winterKill: 0.08, stormRisk: 0.06, accessPenalty: 0.10, summary: 'Remote/harsh → +8% winter kill, +6% storms, -10% angler access' }
            }
        }
    ];

    /**
     * Per-lake maintenance investment configuration.
     * Each setting has 6 levels (0–5). Level 0 = free baseline.
     */
    const MAINTENANCE_CONFIG = {
        grounds: {
            label: 'Grounds Maintenance',
            icon:  '\uD83C\uDF3F',
            desc:  'Landscaping, bank repairs, mowing, planting. Boosts angler satisfaction and biodiversity.',
            costs:  [0, 20, 50, 90, 140, 200],
            effects: {
                biodiversityBonus:         [0, 0.5, 1.0, 1.5, 2.0, 3.0],
                anglerSatisfactionBonus:   [0, 1,   2,   3,   5,   8  ],
                disasterReduction:         [0, 0.03,0.06,0.10,0.15,0.22]
            }
        },
        feed: {
            label: 'Fish Feed Quality',
            icon:  '\uD83C\uDF3E',
            desc:  'Premium pellets and supplements. Boosts daily fish health and growth.',
            costs:  [0, 15, 35, 65, 100, 150],
            effects: {
                fishHealthBonus:  [0, 1, 2,  4,  6,  10],
                fishGrowthBonus:  [0, 0.05, 0.10, 0.18, 0.28, 0.40]
            }
        },
        security: {
            label: 'Security',
            icon:  '\uD83D\uDEE1\uFE0F',
            desc:  'Fencing, CCTV, regular patrols. Cuts disaster probability.',
            costs:  [0, 12, 25, 45, 70, 100],
            effects: {
                disasterReduction: [0, 0.05,0.10,0.16,0.23,0.32]
            }
        },
        marketing: {
            label: 'Lakeside Marketing',
            icon:  '\uD83D\uDCE2',
            desc:  'Signage, local ads, social posts. Increases daily booking volume.',
            costs:  [0, 8, 18, 30, 45, 65],
            effects: {
                bookingBonus: [0, 0.05, 0.10, 0.18, 0.28, 0.40]
            }
        }
    };

    var MAINTENANCE_KEYS = ['grounds', 'feed', 'security', 'marketing'];

    /**
     * Get maintenance settings for a lake (defaults to all 0).
     */
    function getLakeMaintenance(lakeId) {
        var state = Game.getState();
        if (!state.lakeMaintenance) state.lakeMaintenance = {};
        if (!state.lakeMaintenance[lakeId]) {
            state.lakeMaintenance[lakeId] = { grounds: 0, feed: 0, security: 0, marketing: 0 };
        }
        return state.lakeMaintenance[lakeId];
    }

    /**
     * Total daily maintenance cost for a lake.
     */
    function getLakeMaintenanceDailyCost(lakeId) {
        var settings = getLakeMaintenance(lakeId);
        return MAINTENANCE_KEYS.reduce(function (sum, key) {
            var cfg = MAINTENANCE_CONFIG[key];
            return sum + (cfg ? (cfg.costs[settings[key]] || 0) : 0);
        }, 0);
    }

    /**
     * Get the numeric value of a specific effect for a lake.
     * effectType: 'biodiversityBonus' | 'anglerSatisfactionBonus' |
     *             'disasterReduction' | 'fishHealthBonus' | 'fishGrowthBonus' | 'bookingBonus'
     */
    function getLakeMaintenanceEffect(lakeId, effectType) {
        var settings = getLakeMaintenance(lakeId);
        var total = 0;
        MAINTENANCE_KEYS.forEach(function (key) {
            var cfg = MAINTENANCE_CONFIG[key];
            if (!cfg || !cfg.effects[effectType]) return;
            total += cfg.effects[effectType][settings[key]] || 0;
        });
        return total;
    }

    /**
     * Update a single maintenance slider value and re-render.
     */
    function setMaintenance(lakeId, key, level) {
        var state = Game.getState();
        if (!state.lakeMaintenance) state.lakeMaintenance = {};
        if (!state.lakeMaintenance[lakeId]) state.lakeMaintenance[lakeId] = { grounds: 0, feed: 0, security: 0, marketing: 0 };
        state.lakeMaintenance[lakeId][key] = parseInt(level, 10);
        Game.saveToStorage();
        renderManagementPanel();
    }

    // ── Lake Expansion System ────────────────────────────────────────────────────

    /**
     * Expansion tiers — 3 upgrades per lake, each bigger, slower and more expensive.
     */
    const EXPANSION_TIERS = [
        {
            level:       1,
            name:        'Site Clearance & Bank Work',
            icon:        '\uD83D\uDEA7',
            cost:        50000,
            days:        30,
            capacityAdd: 25,
            biodivAdd:   1,
            incomeAdd:   10,
            description: 'Ground clearance, bank reinforcement and basic infrastructure. Moderate gains.'
        },
        {
            level:       2,
            name:        'Habitat Development',
            icon:        '\uD83C\uDF33',
            cost:        150000,
            days:        60,
            capacityAdd: 50,
            biodivAdd:   2,
            incomeAdd:   25,
            description: 'Planting, reed beds, aerator channels and spawning habitat. Significant improvement.'
        },
        {
            level:       3,
            name:        'Grand Lake Development',
            icon:        '\uD83C\uDFD7\uFE0F',
            cost:        500000,
            days:        90,
            capacityAdd: 100,
            biodivAdd:   3,
            incomeAdd:   60,
            description: 'Full lake reconstruction — deeper channels, islands, premium facilities. Transformational.'
        }
    ];

    const MAX_EXPANSION_LEVEL = 3;

    /**
     * Get or initialise expansion state for a lake.
     */
    function getExpansionState(lakeId) {
        var state = Game.getState();
        if (!state.lakeExpansions) state.lakeExpansions = {};
        if (!state.lakeExpansions[lakeId]) {
            state.lakeExpansions[lakeId] = { level: 0, inProgress: false, completionDay: 0 };
        }
        return state.lakeExpansions[lakeId];
    }

    /**
     * Start an expansion on a lake.
     */
    function startExpansion(lakeId) {
        var state    = Game.getState();
        var expState = getExpansionState(lakeId);
        var lake     = getLakeById(lakeId);

        if (!lake) return;
        if (expState.inProgress) { UI.showToast('Expansion already in progress!', 'warning'); return; }
        if (expState.level >= MAX_EXPANSION_LEVEL) {
            UI.showToast(lake.name + ' has reached maximum expansion.', 'warning'); return;
        }

        var tier = EXPANSION_TIERS[expState.level]; // 0-indexed = next tier
        if (state.money < tier.cost) {
            UI.showToast('Need ' + UI.formatMoney(tier.cost) + ' to start expansion.', 'error'); return;
        }

        state.money      -= tier.cost;
        state.totalSpent += tier.cost;
        if (typeof Finance !== 'undefined') {
            Finance.addFinanceLog('shop_purchase', -tier.cost, tier.name + ' — ' + lake.name);
        }

        expState.inProgress    = true;
        expState.completionDay = state.day + tier.days;

        Game.addNotification(
            tier.icon + ' Expansion started at ' + lake.name + ': ' + tier.name +
            '. Completes in ' + tier.days + ' days (' + UI.formatMoney(tier.cost) + ' spent).'
        );
        UI.showToast(tier.icon + ' Expansion started — ' + tier.days + ' days remaining.', 'success');
        Game.saveToStorage();
        renderLakes();
    }

    /**
     * Called daily — completes any finished expansions.
     */
    function processExpansions() {
        var state = Game.getState();
        if (!state.lakeExpansions) return;
        Object.keys(state.lakeExpansions).forEach(function (lakeId) {
            var expState = state.lakeExpansions[lakeId];
            if (!expState.inProgress) return;
            if (state.day < expState.completionDay) return;

            // Complete this expansion
            var tier        = EXPANSION_TIERS[expState.level];
            var lake        = getLakeById(lakeId);
            expState.level++;
            expState.inProgress    = false;
            expState.completionDay = 0;

            Game.addNotification(
                tier.icon + ' Expansion complete at ' + (lake ? lake.name : lakeId) + ': ' + tier.name +
                '! Capacity +' + tier.capacityAdd + ', Biodiversity +' + tier.biodivAdd + ', Income +' + UI.formatMoney(tier.incomeAdd) + '/angler.'
            );
            UI.showToast(tier.icon + ' ' + (lake ? lake.name : '') + ' expansion complete!', 'success');
        });
    }

    /**
     * Returns cumulative expansion bonuses for a lake.
     */
    function getLakeExpansionBonus(lakeId) {
        var expState = getExpansionState(lakeId);
        var bonus    = { capacity: 0, biodiversity: 0, income: 0 };
        for (var i = 0; i < expState.level; i++) {
            bonus.capacity    += EXPANSION_TIERS[i].capacityAdd;
            bonus.biodiversity += EXPANSION_TIERS[i].biodivAdd;
            bonus.income      += EXPANSION_TIERS[i].incomeAdd;
        }
        return bonus;
    }

    /**
     * Render the expansion panel within the management column.
     */
    function renderExpansionPanel(lakeId) {
        var lake     = getLakeById(lakeId);
        var expState = getExpansionState(lakeId);
        var bonus    = getLakeExpansionBonus(lakeId);
        var state    = Game.getState();
        var html     = '';

        html += '<div class="lake-expand-section">';
        html += '<h4 class="lake-mgmt-heading" style="margin-top:1rem;">\uD83D\uDEA7 Lake Expansions (' + expState.level + '/' + MAX_EXPANSION_LEVEL + ')</h4>';

        // Show earned bonuses
        if (expState.level > 0) {
            html += '<div class="lake-expand-bonuses">';
            html += '<span>Capacity <span style="color:var(--colour-accent);">+' + bonus.capacity + '</span></span>';
            html += '<span>Biodiversity <span style="color:var(--colour-accent);">+' + bonus.biodiversity + '</span></span>';
            html += '<span>Income <span style="color:var(--colour-accent);">+' + UI.formatMoney(bonus.income) + '/angler</span></span>';
            html += '</div>';
        }

        if (expState.inProgress) {
            var daysLeft = Math.max(0, expState.completionDay - state.day);
            var tier     = EXPANSION_TIERS[expState.level - 1]; // current in-progress tier
            var pct      = Math.round(((tier.days - daysLeft) / tier.days) * 100);
            html += '<div class="lake-expand-progress">';
            html += '<div class="lake-expand-progress-header">';
            html += '<span>' + tier.icon + ' ' + tier.name + '</span>';
            html += '<span style="color:var(--colour-gold);">' + daysLeft + ' days left</span>';
            html += '</div>';
            html += '<div class="finance-loan-bar-track"><div class="lake-expand-bar" style="width:' + pct + '%;"></div></div>';
            html += '</div>';
        } else if (expState.level < MAX_EXPANSION_LEVEL) {
            var nextTier = EXPANSION_TIERS[expState.level];
            var canAfford = state.money >= nextTier.cost;
            html += '<div class="lake-expand-next">';
            html += '<div class="lake-expand-next-header">';
            html += '<span>' + nextTier.icon + ' ' + nextTier.name + '</span>';
            html += '<span class="lake-expand-cost">' + UI.formatMoney(nextTier.cost) + '</span>';
            html += '</div>';
            html += '<p class="lake-mgmt-effect">' + nextTier.description + '</p>';
            html += '<div class="lake-expand-gains">';
            html += '<span>+' + nextTier.capacityAdd + ' capacity</span>';
            html += '<span>+' + nextTier.biodivAdd + ' biodiversity</span>';
            html += '<span>+' + UI.formatMoney(nextTier.incomeAdd) + '/angler</span>';
            html += '<span>' + nextTier.days + ' days</span>';
            html += '</div>';
            html += '<button class="btn btn-primary btn-sm" style="margin-top:0.5rem;"' +
                    (!canAfford ? ' disabled' : '') +
                    ' onclick="Lakes.startExpansion(\'' + lakeId + '\')">' +
                    (canAfford ? '\uD83D\uDEA7 Start Expansion' : 'Need ' + UI.formatMoney(nextTier.cost)) +
                    '</button>';
            html += '</div>';
        } else {
            html += '<p style="font-size:0.78rem;color:var(--colour-accent);font-weight:600;">\u2705 Fully expanded!</p>';
        }

        html += '</div>';
        return html;
    }

    /**
     * Render the management sliders into #lake-management-panel.
     */
    function renderManagementPanel() {
        var panel = document.getElementById('lake-management-panel');
        if (!panel) return;
        var state  = Game.getState();
        var lakeId = state.activeLakeId;
        if (!lakeId || !state.ownedLakes.includes(lakeId)) {
            panel.innerHTML = '<div class="lake-detail-placeholder"><span class="lake-detail-placeholder-icon">\uD83D\uDCCA</span><p>Select a lake to manage investment.</p></div>';
            return;
        }
        var lake     = getLakeById(lakeId);
        var settings = getLakeMaintenance(lakeId);
        var totalCost = getLakeMaintenanceDailyCost(lakeId);

        var html = '<h4 class="lake-mgmt-heading">\uD83D\uDCCA Investment — ' + (lake ? lake.name : '') + '</h4>';
        html += '<p class="lake-mgmt-desc">Adjust daily spending per category. Costs are deducted automatically each day and logged to Finance.</p>';

        MAINTENANCE_KEYS.forEach(function (key) {
            var cfg   = MAINTENANCE_CONFIG[key];
            var level = settings[key] || 0;
            var cost  = cfg.costs[level] || 0;

            html += '<div class="lake-mgmt-row">';
            html += '<div class="lake-mgmt-row-header">';
            html += '<span class="lake-mgmt-icon">' + cfg.icon + '</span>';
            html += '<span class="lake-mgmt-label">' + cfg.label + '</span>';
            html += '<span class="lake-mgmt-level">Lvl ' + level + ' &mdash; ' + (cost > 0 ? UI.formatMoney(cost) + '/day' : 'Free') + '</span>';
            html += '</div>';
            html += '<input type="range" class="breed-slider lake-mgmt-slider" min="0" max="5" value="' + level + '"' +
                    ' oninput="Lakes.setMaintenance(\'' + lakeId + '\',\'' + key + '\',this.value)">';
            html += '<div class="lake-mgmt-marks">';
            cfg.costs.forEach(function (c, i) {
                html += '<span class="' + (i === level ? 'lake-mgmt-mark-active' : '') + '">' +
                        (c > 0 ? '\u00a3' + c : 'Off') + '</span>';
            });
            html += '</div>';
            html += '<p class="lake-mgmt-effect">' + cfg.desc + '</p>';

            // Effect list
            html += '<div class="lake-mgmt-effects">';
            Object.keys(cfg.effects).forEach(function (eff) {
                var val = cfg.effects[eff][level];
                if (!val) return;
                var LABELS = {
                    biodiversityBonus:       'Biodiversity +',
                    anglerSatisfactionBonus: 'Satisfaction +',
                    disasterReduction:       'Disaster risk \u2212',
                    fishHealthBonus:         'Fish health +',
                    fishGrowthBonus:         'Growth +',
                    bookingBonus:            'Bookings +'
                };
                var SUFFIXES = {
                    biodiversityBonus:'pts', anglerSatisfactionBonus:'/day',
                    disasterReduction:'%', fishHealthBonus:'/day',
                    fishGrowthBonus:'%', bookingBonus:'%'
                };
                var displayVal = eff === 'disasterReduction' || eff === 'fishGrowthBonus' || eff === 'bookingBonus'
                    ? Math.round(val * 100)
                    : val;
                html += '<span class="lake-mgmt-eff-badge">' + (LABELS[eff] || eff) + displayVal + (SUFFIXES[eff] || '') + '</span>';
            });
            html += '</div>';
            html += '</div>'; // .lake-mgmt-row
        });

        // Total cost summary + expansion panel
        html += '<div class="lake-mgmt-total">';
        html += '<span>Total daily investment</span>';
        html += '<span class="lake-mgmt-total-val' + (totalCost > 0 ? ' lake-mgmt-total-cost' : '') + '">' +
                (totalCost > 0 ? UI.formatMoney(totalCost) + '/day' : 'No investment') + '</span>';
        html += '</div>';

        // Expansion panel below investment sliders
        html += renderExpansionPanel(lakeId);

        // Net Fish panel
        html += renderNetFishPanel(lakeId);

        panel.innerHTML = html;
    }

    /**
     * Net fish from a lake by weight range — sell, remove, or transfer to another lake.
     * action: 'sell' | 'remove' | 'transfer'
     * targetLakeId: required for 'transfer'
     */
    function netFish(lakeId, minLb, maxLb, action, targetLakeId) {
        var state   = Game.getState();
        var minOz   = Math.round(minLb * 16);
        var maxOz   = Math.round(maxLb * 16);
        var targets = state.fish.filter(function (f) {
            return f.alive && f.lake_id === lakeId &&
                   f.weight_oz >= minOz && f.weight_oz <= maxOz;
        });
        if (targets.length === 0) {
            UI.showToast('No fish in that weight range.', 'warning');
            return;
        }
        var totalVal = 0;

        if (action === 'transfer') {
            if (!targetLakeId) { UI.showToast('Select a destination lake.', 'error'); return; }
            if (targetLakeId === lakeId) { UI.showToast('Cannot transfer to the same lake.', 'error'); return; }
            // Check capacity of target lake
            var targetFish = state.fish.filter(function(f){ return f.alive && f.lake_id === targetLakeId; }).length;
            var capPenalty = (state.capacityPenalties && state.capacityPenalties[targetLakeId]) ? (state.capacityPenalties[targetLakeId].amount || 0) : 0;
            var targetCap = typeof Lakes !== 'undefined' ? (Lakes.getLakeById(targetLakeId)||{}).capacity : 999;
            var effectiveCap = targetCap - capPenalty;
            if (targetFish + targets.length > effectiveCap) {
                UI.showToast('Destination lake has no room for all ' + targets.length + ' fish. Capacity: ' + targetFish + '/' + effectiveCap, 'error');
                return;
            }
            targets.forEach(function(f){ f.lake_id = targetLakeId; });
            var tgtLake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(targetLakeId) : null;
            UI.showToast('\uD83D\uDEA3 Transferred ' + targets.length + ' fish to ' + (tgtLake ? tgtLake.name : targetLakeId) + '!', 'success');
            Game.addNotification('\uD83D\uDEA3 Transferred ' + targets.length + ' fish to ' + (tgtLake ? tgtLake.name : targetLakeId) + '.');
        } else if (action === 'sell') {
            if (typeof Fish !== 'undefined') {
                targets.forEach(function (f) { totalVal += Fish.getFishValue(f); });
            }
            var ids = targets.map(function (f) { return f.id; });
            state.fish = state.fish.filter(function (f) { return ids.indexOf(f.id) === -1; });
            if (totalVal > 0) {
                state.money         += totalVal;
                state.totalEarnings += totalVal;
                if (typeof Finance !== 'undefined') {
                    Finance.addFinanceLog('fish_sale', totalVal, 'Net & Sell (' + targets.length + ' fish) at ' + (typeof Lakes !== 'undefined' ? (Lakes.getLakeById(lakeId)||{}).name||lakeId : lakeId));
                }
                UI.showToast('\uD83D\uDEA3 Netted & sold ' + targets.length + ' fish for ' + UI.formatMoney(totalVal) + '!', 'success');
                Game.addNotification('\uD83D\uDEA3 Netted and sold ' + targets.length + ' fish for ' + UI.formatMoney(totalVal) + '.');
            }
        } else {
            // remove
            var ids = targets.map(function (f) { return f.id; });
            state.fish = state.fish.filter(function (f) { return ids.indexOf(f.id) === -1; });
            UI.showToast('\uD83D\uDEA3 Removed ' + targets.length + ' fish from the lake.', 'success');
            Game.addNotification('\uD83D\uDEA3 Removed ' + targets.length + ' fish from lake.');
        }
        Game.saveToStorage();
        renderLakes();
    }

    function updateNetPreview(lakeId) {
        var state   = Game.getState();
        var minEl   = document.getElementById('net-min');
        var maxEl   = document.getElementById('net-max');
        if (!minEl || !maxEl) return;
        var minLb   = parseFloat(minEl.value);
        var maxLb   = parseFloat(maxEl.value);
        var minOz   = Math.round(minLb * 16);
        var maxOz   = Math.round(maxLb * 16);
        var targets = state.fish.filter(function (f) {
            return f.alive && f.lake_id === lakeId &&
                   f.weight_oz >= minOz && f.weight_oz <= maxOz;
        });
        var totalVal = typeof Fish !== 'undefined'
            ? targets.reduce(function (s, f) { return s + Fish.getFishValue(f); }, 0) : 0;
        var minValEl = document.getElementById('net-min-val');
        var maxValEl = document.getElementById('net-max-val');
        var previewEl = document.getElementById('net-preview');
        var sellBtn   = document.getElementById('net-sell-btn');
        if (minValEl) minValEl.textContent = minLb + ' lb';
        if (maxValEl) maxValEl.textContent = maxLb + ' lb';
        if (previewEl) {
            previewEl.innerHTML = targets.length > 0
                ? '<strong>' + targets.length + ' fish</strong> in range \u00b7 est. value <strong style="color:var(--colour-gold);">' + UI.formatMoney(totalVal) + '</strong>'
                : '<span style="color:var(--colour-text-muted);">No fish in this range</span>';
        }
        if (sellBtn) sellBtn.disabled = targets.length === 0;
        var transferBtn = document.getElementById('net-transfer-btn');
        if (transferBtn) transferBtn.disabled = targets.length === 0;
    }

    function renderNetFishPanel(lakeId) {
        var state   = Game.getState();
        var lake    = getLakeById(lakeId);
        var lakeFish = state.fish.filter(function (f) {
            return f.alive && f.lake_id === lakeId;
        });

        var html = '<div class="lake-net-section">';
        html += '<h4 class="lake-mgmt-heading" style="margin-top:1rem;">\uD83D\uDEA3 Net Fish</h4>';
        html += '<p class="lake-mgmt-desc">Set a weight range to net fish from this lake, then sell or remove them.</p>';

        if (lakeFish.length === 0) {
            html += '<p class="empty-state" style="font-size:0.78rem;margin:0.5rem 0;">No fish in this lake to net.</p>';
            html += '</div>';
            return html;
        }

        // Weight sliders
        html += '<div class="net-slider-row">';
        html += '<label class="lake-mgmt-label">Min weight</label>';
        html += '<input type="range" class="breed-slider" id="net-min" min="0" max="40" step="0.5" value="0" oninput="Lakes.updateNetPreview(\'' + lakeId + '\')">';
        html += '<span id="net-min-val" class="lake-mgmt-level">0 lb</span>';
        html += '</div>';

        html += '<div class="net-slider-row">';
        html += '<label class="lake-mgmt-label">Max weight</label>';
        html += '<input type="range" class="breed-slider" id="net-max" min="0" max="40" step="0.5" value="10" oninput="Lakes.updateNetPreview(\'' + lakeId + '\')">';
        html += '<span id="net-max-val" class="lake-mgmt-level">10 lb</span>';
        html += '</div>';

        html += '<div id="net-preview" class="net-preview">Adjust sliders to preview\u2026</div>';

        // Lake selector for transfer
        var otherLakes = state.ownedLakes.filter(function(id){ return id !== lakeId; });
        var hasOtherLakes = otherLakes.length > 0;
        var transferLakeOptions = hasOtherLakes ? otherLakes.map(function(id) {
            var l = getLakeById(id);
            return '<option value="' + id + '">' + (l ? l.name : id) + '</option>';
        }).join('') : '<option value="">No other lakes owned</option>';

        html += '<div class="net-action-row" style="gap:0.5rem;display:flex;flex-wrap:wrap;">';
        html += '<button id="net-sell-btn" class="btn btn-primary btn-sm" disabled' +
                ' onclick="Lakes.netFish(\'' + lakeId + '\', ' +
                'parseFloat(document.getElementById(\'net-min\').value), ' +
                'parseFloat(document.getElementById(\'net-max\').value), ' +
                '\'sell\')">' +
                '\uD83D\uDCB8 Net &amp; Sell</button>';
        html += '<button id="net-transfer-btn" class="btn btn-secondary btn-sm" disabled' +
                ' onclick="Lakes.netFish(\'' + lakeId + '\', ' +
                'parseFloat(document.getElementById(\'net-min\').value), ' +
                'parseFloat(document.getElementById(\'net-max\').value), ' +
                '\'transfer\', document.getElementById(\'net-transfer-lake\').value)">' +
                '\uD83D\uDDE9\uFE0F Transfer</button>';
        if (hasOtherLakes) {
            html += '<select id="net-transfer-lake" class="shop-lake-select" style="flex:1;min-width:140px;">' + transferLakeOptions + '</select>';
        } else {
            html += '<span class="lake-mgmt-level" style="color:var(--colour-text-muted);align-self:center;">Own another lake to enable transfer</span>';
        }
        html += '</div>';
        html += '</div>';
        return html;
    }

    /**
     * Get lake definition by ID.
     */
    function getLakeById(id) {
        return LAKE_DEFINITIONS.find(function (lake) {
            return lake.id === id;
        }) || null;
    }

    /**
     * Get all lake definitions.
     */
    function getAllLakes() {
        return LAKE_DEFINITIONS;
    }

    /**
     * Format water type for display.
     */
    function formatWaterType(type) {
        switch (type) {
            case 'still': return 'Still Water';
            case 'running': return 'Running Water';
            case 'gravel_pit': return 'Gravel Pit';
            case 'estate_lake': return 'Estate Lake';
            default: return type;
        }
    }

    /**
     * Determine lake status relative to current player state.
     */
    function getLakeStatus(lake) {
        const state = Game.getState();
        if (state.ownedLakes.includes(lake.id)) {
            return 'owned';
        }
        if (state.money >= lake.wealthRequired) {
            return 'available';
        }
        return 'locked';
    }

    /**
     * Attempt to buy a lake.
     */
    function buyLake(lakeId) {
        const lake = getLakeById(lakeId);
        if (!lake) {
            UI.showToast('Lake not found.', 'error');
            return false;
        }

        const state = Game.getState();
        const status = getLakeStatus(lake);

        if (status === 'owned') {
            UI.showToast('You already own ' + lake.name + '.', 'warning');
            return false;
        }

        if (status === 'locked') {
            UI.showToast('You need a balance of ' + UI.formatMoney(lake.wealthRequired) + ' to unlock ' + lake.name + '.', 'error');
            return false;
        }

        if (lake.cost === 0) {
            Game.addOwnedLake(lakeId);
            Game.addReputation(2);

            // Starter stock — 20 fish up to ~10 lb + 10 fish at 20-30 lb
            var starterStock = [
                { species: 'common',  rarity: 'common',   age: 300, wt: 100 },
                { species: 'mirror',  rarity: 'common',   age: 280, wt: 120 },
                { species: 'common',  rarity: 'common',   age: 320, wt: 90  },
                { species: 'crucian', rarity: 'common',   age: 260, wt: 60  },
                { species: 'mirror',  rarity: 'common',   age: 310, wt: 110 },
                { species: 'grass',   rarity: 'uncommon', age: 290, wt: 130 },
                { species: 'ghost',   rarity: 'uncommon', age: 275, wt: 125 },
                { species: 'common',  rarity: 'common',   age: 330, wt: 95  },
                { species: 'leather', rarity: 'common',   age: 295, wt: 105 },
                { species: 'koi',     rarity: 'uncommon', age: 285, wt: 115 },
                { species: 'common',  rarity: 'common',   age: 350, wt: 140 },
                { species: 'mirror',  rarity: 'uncommon', age: 340, wt: 150 },
                { species: 'crucian', rarity: 'common',   age: 270, wt: 70  },
                { species: 'grass',   rarity: 'common',   age: 305, wt: 100 },
                { species: 'ghost',   rarity: 'common',   age: 315, wt: 95  },
                { species: 'common',  rarity: 'common',   age: 360, wt: 145 },
                { species: 'leather', rarity: 'uncommon', age: 345, wt: 160 },
                { species: 'mirror',  rarity: 'common',   age: 290, wt: 112 },
                { species: 'koi',     rarity: 'common',   age: 300, wt: 90  },
                { species: 'common',  rarity: 'common',   age: 380, wt: 155 },
                // 10 larger fish — 20-30 lb (320-480 oz)
                { species: 'common',  rarity: 'uncommon', age: 500, wt: 320 },
                { species: 'mirror',  rarity: 'uncommon', age: 490, wt: 350 },
                { species: 'common',  rarity: 'uncommon', age: 510, wt: 335 },
                { species: 'leather', rarity: 'uncommon', age: 485, wt: 360 },
                { species: 'mirror',  rarity: 'uncommon', age: 520, wt: 345 },
                { species: 'grass',   rarity: 'uncommon', age: 495, wt: 375 },
                { species: 'ghost',   rarity: 'uncommon', age: 505, wt: 325 },
                { species: 'common',  rarity: 'rare',     age: 530, wt: 420 },
                { species: 'mirror',  rarity: 'rare',     age: 525, wt: 440 },
                { species: 'koi',     rarity: 'uncommon', age: 515, wt: 345 }
            ];
            var startState = Game.getState();
            starterStock.forEach(function (s) {
                var fish = Fish.createFish({
                    species:  s.species,
                    rarity:   s.rarity,
                    age_days: s.age + Math.floor(Math.random() * 30),
                    weight_oz: s.wt + Math.floor(Math.random() * 20),
                    lake_id:  lakeId
                });
                startState.fish.push(fish);
            });
            Game.saveToStorage();

            Game.addReputation(10);
            UI.showToast('You claimed ' + lake.name + ' — pre-stocked with 20 fish!', 'success');
            renderLakes();
            UI.renderTopBar();
            return true;
        }

        if (state.money < lake.cost) {
            UI.showToast('Not enough money! You need ' + UI.formatMoney(lake.cost) + '.', 'error');
            return false;
        }

        // Purchase the lake
        if (Game.spendMoney(lake.cost)) {
            Game.addOwnedLake(lakeId);
            Game.addReputation(25);
            stockLakeOnPurchase(lakeId, lake);
            UI.showToast('Congratulations! You purchased ' + lake.name + '!', 'success');
            renderLakes();
            UI.renderTopBar();
            return true;
        }

        return false;
    }

    /**
     * Pre-stock a purchased lake with fish appropriate to its tier.
     * Fish weights up to 20 lb (320 oz) for higher-tier lakes.
     */
    function stockLakeOnPurchase(lakeId, lake) {
        var state = Game.getState();

        // Per-lake stocking profiles: [species, rarity, minWeight, maxWeight]
        var PROFILES = {
            'oakmere_lake':      { count: 35, entries: [
                ['common','common',60,160], ['mirror','common',70,180], ['crucian','common',40,100],
                ['grass','uncommon',80,200], ['ghost','uncommon',75,190], ['leather','common',65,170],
                ['common','uncommon',320,480], ['mirror','uncommon',320,480], ['leather','uncommon',320,480]
            ]},
            'kingfisher_waters': { count: 40, entries: [
                ['common','common',80,220], ['mirror','uncommon',90,240], ['leather','uncommon',85,230],
                ['grass','uncommon',100,260], ['ghost','rare',90,250], ['koi','rare',80,240],
                ['mirror','uncommon',320,480], ['ghost','uncommon',320,480], ['grass','rare',320,480]
            ]},
            'linch_hill':        { count: 45, entries: [
                ['common','uncommon',100,260], ['mirror','uncommon',110,280], ['leather','rare',105,270],
                ['grass','rare',120,300], ['ghost','rare',115,290], ['koi','rare',100,280],
                ['mirror','rare',320,480], ['leather','uncommon',320,480], ['common','rare',320,480]
            ]},
            'wraysbury':         { count: 55, entries: [
                ['mirror','uncommon',130,300], ['leather','rare',125,295], ['koi','rare',130,310],
                ['ghost','rare',120,305], ['grass','epic',140,320], ['common','rare',110,290],
                ['mirror','rare',320,480], ['koi','uncommon',320,480], ['ghost','rare',320,480]
            ]},
            'yateley':           { count: 65, entries: [
                ['mirror','rare',150,320], ['koi','rare',145,320], ['leather','epic',150,320],
                ['ghost','epic',140,320], ['grass','rare',140,315], ['common','uncommon',120,300],
                ['mirror','epic',320,480], ['koi','rare',320,480], ['leather','rare',320,480]
            ]},
            'redmire_pool':      { count: 55, entries: [
                ['mirror','rare',160,320], ['koi','epic',155,320], ['leather','epic',160,320],
                ['ghost','rare',150,320], ['grass','epic',155,320], ['common','rare',140,310],
                ['mirror','epic',320,480], ['ghost','rare',320,480], ['common','epic',320,480]
            ]},
            'savay_lake':        { count: 75, entries: [
                ['mirror','epic',180,320], ['koi','epic',175,320], ['leather','legendary',180,320],
                ['ghost','epic',170,320], ['grass','epic',175,320], ['common','rare',160,320],
                ['mirror','legendary',320,480], ['koi','epic',320,480], ['leather','epic',320,480]
            ]}
        };

        var profile = PROFILES[lakeId];
        if (!profile) return;

        for (var i = 0; i < profile.count; i++) {
            var entry = profile.entries[Math.floor(Math.random() * profile.entries.length)];
            var wt = entry[2] + Math.floor(Math.random() * (entry[3] - entry[2] + 1));
            var fish = Fish.createFish({
                species:   entry[0],
                rarity:    entry[1],
                age_days:  250 + Math.floor(Math.random() * 350),
                weight_oz: wt,
                lake_id:   lakeId
            });
            state.fish.push(fish);
        }

        Game.addNotification(
            '\uD83D\uDC1F ' + lake.name + ' arrives pre-stocked with ' + profile.count + ' fish!'
        );
        Game.saveToStorage();
    }

    /**
     * Render the full lakes page.
     * - Owned lakes: compact sidebar list (left) + inline detail panel (right)
     * - Available / locked lakes: card grid below
     */
    // ── Lake Upgrades Section ─────────────────────────────────────────────────
    function renderLakeUpgradesSection(state) {
        var container = document.getElementById('lake-upgrades-section');
        if (!container) return;
        if (!state.ownedLakes || state.ownedLakes.length === 0 || typeof Shop === 'undefined') {
            container.innerHTML = ''; return;
        }
        var lakeId = state.activeLakeId || state.ownedLakes[0];
        var lake   = getLakeById(lakeId);
        if (!lake) { container.innerHTML = ''; return; }
        var upgrades = Shop.getAllUpgrades();
        var html = '<div class="lake-upgrades-bar">';
        html += '<div class="lake-upgrades-bar-header">';
        html += '<span class="lake-upgrades-bar-title">\uD83D\uDD27 Upgrades \u2014 ' + lake.name + '</span>';
        html += '</div>';
        html += '<div class="lake-upgrades-bar-grid">';
        upgrades.forEach(function(upgrade){
            var owned = Shop.lakeHasUpgrade(lakeId, upgrade.id);
            html += '<div class="lake-upgrade-card' + (owned ? ' lake-upgrade-owned' : '') + '">';
            html += '<div class="lake-upgrade-top"><span class="lake-upgrade-icon">' + upgrade.icon + '</span><span class="lake-upgrade-name">' + upgrade.name + '</span></div>';
            html += '<p class="lake-upgrade-desc">' + upgrade.description + '</p>';
            html += '<div class="lake-upgrade-footer">';
            html += '<span class="lake-upgrade-cost">' + UI.formatMoney(upgrade.cost) + '</span>';
            if (owned) {
                html += '<button class="btn btn-secondary btn-sm" disabled>\u2713 Installed</button>';
            } else if (state.money < upgrade.cost) {
                html += '<button class="btn btn-secondary btn-sm" disabled>Can\'t afford</button>';
            } else {
                html += '<button class="btn btn-primary btn-sm" onclick="Shop.setShopLake(\'' + lakeId + '\');Shop.buyUpgrade(\'' + upgrade.id + '\');Lakes.renderLakes();">Buy</button>';
            }
            html += '</div></div>';
        });
        html += '</div></div>';
        container.innerHTML = html;
    }

    function renderLakes() {
        const state = Game.getState();

        // ── Section visibility ───────────────────────────────────────────────
        const ownedSection  = document.getElementById('lake-owned-section');
        const ownedList     = document.getElementById('lake-owned-list');

        const hasOwned = state.ownedLakes.length > 0;
        ownedSection.classList.toggle('hidden', !hasOwned);

        // ── Left column: owned lake mini-cards ───────────────────────────────
        if (hasOwned) {
            let ownedHtml = '';
            state.ownedLakes.forEach(function (lakeId) {
                const lake      = getLakeById(lakeId);
                if (!lake) return;
                const isSelected  = state.activeLakeId === lakeId;
                const isClosed    = state.lakeClosures && state.lakeClosures[lakeId] &&
                                    state.lakeClosures[lakeId] >= state.day;
                const fishCount   = state.fish.filter(function (f) {
                    return f.alive && f.lake_id === lakeId;
                }).length;
                const anglerCount = (state.anglerBookings || []).filter(function (b) {
                    return b.lakeId === lakeId &&
                           state.day >= b.startDay && state.day <= b.endDay;
                }).length;

                let oxygen = null, oxyStatus = null;
                if (typeof Weather !== 'undefined') {
                    oxygen    = Weather.getLakeOxygen(lakeId);
                    oxyStatus = Weather.getOxygenStatus(oxygen);
                }

                ownedHtml += '<div class="lake-mini-card' +
                    (isSelected ? ' lake-mini-selected' : '') +
                    (isClosed   ? ' lake-mini-closed'   : '') +
                    '" onclick="Lakes.selectLake(\'' + lakeId + '\')">';

                ownedHtml += '<div class="lake-mini-header">';
                ownedHtml += '<span class="lake-mini-name">' + lake.name + '</span>';
                if (isClosed) {
                    ownedHtml += '<span class="lake-mini-badge badge-closed">Closed</span>';
                } else if (anglerCount > 0) {
                    ownedHtml += '<span class="lake-mini-badge badge-busy">' + anglerCount + ' \uD83C\uDFA3</span>';
                }
                ownedHtml += '</div>';

                ownedHtml += '<div class="lake-mini-tags">';
                ownedHtml += '<span class="lake-info-tag">' + formatWaterType(lake.waterType) + '</span>';
                if (oxygen !== null) {
                    ownedHtml += '<span class="lake-info-tag ' + oxyStatus.cssClass + '">' + oxygen + ' mg/L</span>';
                }
                ownedHtml += '</div>';
                ownedHtml += '</div>';
            });
            ownedList.innerHTML = ownedHtml;
        }

        // ── Right column: detail panel ───────────────────────────────────────
        renderActiveLakeDetail();
        renderManagementPanel();

        // ── Bottom: available / locked lake cards now on separate Buy Lakes page ──
        // Nothing more to render here
    }

    /** Currently selected lake on the Buy Lakes page. */
    var _buyLakeId = null;

    function selectBuyLake(lakeId) {
        _buyLakeId = (_buyLakeId === lakeId) ? null : lakeId;
        renderBuyLakes();
    }

    /**
     * Render the buy lakes marketplace with premium styling.
     */
    function renderBuyLakes() {
        var container = document.getElementById('lake-market-grid');
        if (!container) return;

        var state     = Game.getState();
        var available = LAKE_DEFINITIONS.filter(function (l) { return getLakeStatus(l) === 'available'; });
        var locked    = LAKE_DEFINITIONS.filter(function (l) { return getLakeStatus(l) === 'locked'; });

        if (available.length === 0 && locked.length === 0) {
            container.innerHTML = '<p class="empty-state">\uD83C\uDF89 You own every available lake!</p>';
            return;
        }

        var FISH_PROFILES = {
            willow_pool:      { count: 20, topRarity: 'Uncommon'  },
            oakmere_lake:     { count: 25, topRarity: 'Uncommon'  },
            kingfisher_waters:{ count: 30, topRarity: 'Rare'      },
            linch_hill:       { count: 35, topRarity: 'Rare'      },
            wraysbury:        { count: 45, topRarity: 'Epic'      },
            yateley:          { count: 55, topRarity: 'Epic'      },
            redmire_pool:     { count: 45, topRarity: 'Epic'      },
            savay_lake:       { count: 65, topRarity: 'Legendary' }
        };

        var COUNTY_FONTS = {
            'Surrey':           "'Georgia', serif",
            'Cheshire':         "'Palatino Linotype', 'Palatino', serif",
            'Derbyshire':       "'Trebuchet MS', sans-serif",
            'Oxfordshire':      "'Garamond', 'Book Antiqua', serif",
            'Berkshire':        "'Cambria', 'Times New Roman', serif",
            'Hampshire':        "'Gill Sans', 'Gill Sans MT', sans-serif",
            'Herefordshire':    "'Book Antiqua', 'Palatino', serif",
            'Buckinghamshire':  "'Baskerville', 'Times New Roman', serif",
            'North Yorkshire':  "'Century Gothic', 'Futura', sans-serif",
            'Shropshire':       "'Optima', 'Candara', sans-serif",
            'Lancashire':       "'Arial Narrow', 'Helvetica Neue', sans-serif",
            'Bedfordshire':     "'Perpetua', 'Georgia', serif",
            'Northamptonshire': "'Rockwell', 'Courier New', serif",
            'Aberdeenshire':    "'Impact', 'Arial Black', sans-serif"
        };

        var COUNTY_EMOJIS = {
            'Surrey':           '🌿',
            'Cheshire':         '🐄',
            'Derbyshire':       '⛰️',
            'Oxfordshire':      '🎓',
            'Berkshire':        '🏰',
            'Hampshire':        '🌾',
            'Herefordshire':    '🍎',
            'Buckinghamshire':  '👑',
            'North Yorkshire':  '🦅',
            'Shropshire':       '⛪',
            'Lancashire':       '🌹',
            'Bedfordshire':     '🛶',
            'Northamptonshire': '🏛️',
            'Aberdeenshire':    '🏔️'
        };

        var WATER_TYPE_EMOJIS = {
            'still':       '🪷',
            'running':     '🌊',
            'gravel_pit':  '⛏️',
            'estate_lake': '🏡'
        };

        var LAKE_FONTS = {
            willow_pool:       "'Georgia', serif",
            oakmere_lake:      "'Palatino Linotype', 'Palatino', serif",
            kingfisher_waters: "'Trebuchet MS', sans-serif",
            linch_hill:        "'Garamond', 'Book Antiqua', serif",
            wraysbury:         "'Cambria', 'Times New Roman', serif",
            yateley:           "'Gill Sans', 'Gill Sans MT', sans-serif",
            redmire_pool:      "'Baskerville', 'Times New Roman', serif",
            savay_lake:        "'Impact', 'Arial Black', sans-serif",
            clearbeck_reservoir:"'Century Gothic', 'Futura', sans-serif",
            monks_mere:        "'Optima', 'Candara', sans-serif",
            bradshaw_pits:     "'Arial Narrow', 'Helvetica Neue', sans-serif",
            cranfield_weir:    "'Perpetua', 'Georgia', serif",
            harrington_park:   "'Rockwell', 'Courier New', serif",
            loch_davan:        "'Copperplate', 'Papyrus', fantasy"
        };

        var WATER_ICONS = {
            still: '🪷', running: '🌊', gravel_pit: '⛏️', estate_lake: '🏡'
        };

        var BIO_COLS = ['#e74c3c','#e67e22','#f1c40f','#a3cb38','#2ecc71','#1abc9c','#3498db','#9b59b6','#f1c40f','#e74c3c'];

        function tileHtml(lake, isLocked) {
            var isSelected = _buyLakeId === lake.id;
            var status = isLocked ? 'locked' : 'available';
            var cls = 'lake-luxury-card ' + status + (isSelected ? ' selected' : '');
            var font    = LAKE_FONTS[lake.id] || "'Georgia', serif";
            var wIcon   = WATER_ICONS[lake.waterType] || '🏞️';
            var bioCol  = BIO_COLS[lake.biodiversityScore] || '#2ecc71';
            var bioDots = '';
            for (var i = 1; i <= 10; i++) {
                bioDots += '<span style="color:' + (i <= lake.biodiversityScore ? bioCol : 'rgba(255,255,255,0.1)') + ';font-size:0.55rem;">●</span>';
            }
            var shortDesc = lake.description.split('.')[0] + '.';
            
            // Buff display
            var buffHtml = '';
            if (lake.buffs) {
                var posSummary = lake.buffs.positive?.summary || '';
                var negSummary = lake.buffs.negative?.summary || '';
                if (posSummary || negSummary) {
                    buffHtml += '<div class="lake-buffs-section">';
                    if (posSummary) buffHtml += '<span class="lake-buff lake-buff-positive">✨ ' + posSummary + '</span>';
                    if (negSummary) buffHtml += '<span class="lake-buff lake-buff-negative">⚠️ ' + negSummary + '</span>';
                    buffHtml += '</div>';
                }
            }
            
            var t = '<div class="' + cls + '" onclick="Lakes.selectBuyLake(\'' + lake.id + '\')">';
            t += '<div class="lake-card-header">';
            t += '<div class="lake-card-name-wrapper">';
            t += '<div class="lake-card-name" style="font-family:' + font + ';font-size:1.05rem;">' + wIcon + ' ' + lake.name + '</div>';
            t += '<div class="lake-card-county">' + (lake.county ? '📍 ' + lake.county : '') + '</div>';
            t += '</div>';
            t += '<span class="lake-card-status-badge ' + status + '">' + status + '</span>';
            t += '</div>';
            t += '<div class="lake-card-stats">';
            t += '<div class="lake-stat-item"><span class="lake-stat-value">' + lake.capacity + '</span><span class="lake-stat-label">Fish</span></div>';
            t += '<div class="lake-stat-item"><span class="lake-stat-value">' + lake.biodiversityScore + '/10</span><span class="lake-stat-label">Biodiversity</span></div>';
            t += '<div class="lake-stat-item"><span class="lake-stat-value">' + UI.formatMoney(lake.dailyIncomePerAngler) + '</span><span class="lake-stat-label">Income/angler</span></div>';
            t += '</div>';
            t += buffHtml;
            t += '<div class="lake-card-footer">';
            t += '<div class="lake-card-description">' + shortDesc + '</div>';
            t += '<span class="lake-card-price">' + (lake.cost > 0 ? UI.formatMoney(lake.cost) : 'Free') + '</span>';
            if (!isLocked) {
                t += '<button class="btn btn-primary btn-tile-buy" onclick="event.stopPropagation();Lakes.buyLake(\'' + lake.id + '\')">Buy</button>';
            }
            t += '</div>';
            t += '</div>';
            return t;
        }

        function detailHtml(lakeId) {
            var lake      = getLakeById(lakeId);
            if (!lake) return '';
            var status    = getLakeStatus(lake);
            var isLocked  = status === 'locked';
            var canAfford = state.money >= lake.cost;
            var fishInfo  = FISH_PROFILES[lakeId] || { count: 20, topRarity: 'Common' };
            var weekIncome = Math.round(lake.dailyIncomePerAngler * 3 * (lake.biodiversityScore / 10) * 7);
            var d = '<div class="lake-detail-panel">';
            d += '<div class="lake-detail-header">';
            d += '<div><h3 class="lake-detail-title">' + lake.name + '</h3>';
            d += '<p class="lake-detail-county">' + (COUNTY_EMOJIS[lake.county] || '📍') + ' ' + (lake.county || '') + '</p></div>';
            d += '<div class="lake-detail-emoji">' + (WATER_EMOJIS[lake.waterType] || '🏞️') + '</div>';
            d += '</div>';
            d += '<p class="lake-detail-description">' + lake.description + '</p>';
            d += '<div class="lake-detail-grid">';
            d += '<div class="lake-detail-box"><div class="lake-detail-box-value">' + lake.capacity + '</div><div class="lake-detail-box-label">Capacity</div></div>';
            d += '<div class="lake-detail-box"><div class="lake-detail-box-value">' + lake.biodiversityScore + '/10</div><div class="lake-detail-box-label">Biodiversity</div></div>';
            d += '<div class="lake-detail-box"><div class="lake-detail-box-value">' + formatWaterType(lake.waterType) + '</div><div class="lake-detail-box-label">Water Type</div></div>';
            d += '<div class="lake-detail-box"><div class="lake-detail-box-value">' + fishInfo.count + '</div><div class="lake-detail-box-label">Pre-stocked Fish</div></div>';
            d += '<div class="lake-detail-box"><div class="lake-detail-box-value">' + UI.formatMoney(weekIncome) + '</div><div class="lake-detail-box-label">Weekly Income</div></div>';
            d += '<div class="lake-detail-box"><div class="lake-detail-box-value" style="color:#f1c40f;">' + fishInfo.topRarity + '</div><div class="lake-detail-box-label">Top Stock Rarity</div></div>';
            d += '</div>';
            d += '<div class="lake-income-projection" style="margin-top:1rem;">';
            d += '<span class="value">' + UI.formatMoney(lake.cost) + '</span>';
            d += '<span class="label">' + (lake.cost === 0 ? 'Complimentary Venue' : 'Purchase Price') + '</span>';
            d += '</div>';
            d += '<div style="margin-top:1rem;text-align:right;">';
            if (isLocked) {
                d += '<p class="blv-cta-note">\uD83D\uDCB0 Need ' + UI.formatMoney(lake.wealthRequired - state.money) + ' more in balance</p>';
            } else if (lake.cost === 0) {
                d += '<button class="btn btn-primary" onclick="event.stopPropagation();Lakes.buyLake(\'' + lake.id + '\')">Claim Free</button>';
            } else if (!canAfford) {
                d += '<p class="blv-cta-note">\uD83D\uDCB0 Need ' + UI.formatMoney(lake.cost - state.money) + ' more</p>';
                d += '<button class="btn btn-secondary" disabled>' + UI.formatMoney(lake.cost) + '</button>';
            } else {
                d += '<button class="btn btn-primary" onclick="event.stopPropagation();Lakes.buyLake(\'' + lake.id + '\')">\uD83C\uDF3E Buy \u2014 ' + UI.formatMoney(lake.cost) + '</button>';
            }
            d += '</div></div>';
            return d;
        }

        var html = '';
        if (available.length > 0) {
            html += '<h3 class="lakes-section-heading">Available to Purchase</h3>';
            html += '<div class="blv-grid">';
            available.forEach(function (l) { html += tileHtml(l, false); });
            html += '</div>';
            if (_buyLakeId && available.some(function (l) { return l.id === _buyLakeId; })) {
                html += detailHtml(_buyLakeId);
            }
        }
        if (locked.length > 0) {
            html += '<h3 class="lakes-section-heading">Locked Venues</h3>';
            html += '<div class="blv-grid">';
            locked.forEach(function (l) { html += tileHtml(l, true); });
            html += '</div>';
            if (_buyLakeId && locked.some(function (l) { return l.id === _buyLakeId; })) {
                html += detailHtml(_buyLakeId);
            }
        }
        container.innerHTML = html;
    }

    function selectLake(lakeId) {
        Game.setActiveLake(lakeId);
        renderLakes();
    }

    // ── Water Treatment ───────────────────────────────────────────────────────
    function treatWater(lakeId) {
        var state = Game.getState();
        var COST  = 2500;
        if (state.money < COST) { UI.showToast('Need ' + UI.formatMoney(COST) + ' to treat the water.', 'error'); return; }
        if (!state.lakeWaterTreatments) state.lakeWaterTreatments = {};
        if (state.lakeWaterTreatments[lakeId] && state.lakeWaterTreatments[lakeId].endDay > state.day) {
            UI.showToast('Water is already being treated.', 'warning'); return;
        }
        Game.spendMoney(COST);
        if (typeof Finance !== 'undefined') Finance.addFinanceLog('lake_maintenance', -COST, 'Water treatment: ' + getLakeById(lakeId).name);
        state.lakeWaterTreatments[lakeId] = { endDay: state.day + 14 };
        Game.saveToStorage();
        UI.showToast('Water treatment applied — quality optimal for 14 days!', 'success');
        renderActiveLakeDetail();
        UI.renderTopBar();
    }

    // ── Water Test Chart ──────────────────────────────────────────────────────
    function renderWaterTestChart(lake, lakeFish, oxygen, effectiveCap, bioScore, state) {
        var treated = state.lakeWaterTreatments && state.lakeWaterTreatments[lake.id] &&
                      state.lakeWaterTreatments[lake.id].endDay >= state.day;
        var treatDaysLeft = treated ? state.lakeWaterTreatments[lake.id].endDay - state.day + 1 : 0;
        var capRatio = effectiveCap > 0 ? lakeFish.length / effectiveCap : 0;
        var o2Val    = oxygen !== null ? oxygen : (7 + bioScore * 0.4);
        var seed     = lake.id.split('').reduce(function(s,c){ return s + c.charCodeAt(0); }, 0);
        function sr(min, max) { seed = ((seed * 1664525) + 1013904223) >>> 0; return min + (seed % (max - min + 1)); }
        var pH   = Math.min(9.5, Math.max(5.5, +(6.5 + (bioScore/10)*1.5 + sr(-15,15)/100).toFixed(1)));
        var co2  = Math.max(0, Math.round(25 - o2Val*2.0 - bioScore*0.3 + capRatio*18));
        var nh3  = Math.max(0, +(capRatio*0.85 - bioScore*0.02 + sr(0,8)/100).toFixed(2));
        var no2  = Math.max(0, +(capRatio*0.5  - bioScore*0.02 + sr(0,12)/100).toFixed(2));
        var no3  = Math.max(0, Math.round(capRatio*35 + bioScore*0.3 + sr(2,10)));
        var doy  = ((state.day - 1) % 365) + 1;
        var temp = +(10 + 9*Math.sin((doy-80)/365*2*Math.PI) + sr(-5,5)/10).toFixed(1);        // Apply treatment — push values to ideal midpoints
        if (treated) {
            pH   = 7.8; co2  = 5; nh3  = 0.05; no2  = 0.08; no3  = 12;
            o2Val = 10;
        }

        var params = [
            { label:'pH',              unit:'',     val:pH,   min:5,  max:10, ideal:[7.0,8.5], desc:'Acidity'    },
            { label:'O\u2082',         unit:'mg/L', val:+o2Val.toFixed(1), min:0, max:14, ideal:[6,12], desc:'Oxygen' },
            { label:'CO\u2082',        unit:'ppm',  val:co2,  min:0,  max:30, ideal:[0,10],   desc:'CO\u2082'   },
            { label:'NH\u2083',        unit:'mg/L', val:nh3,  min:0,  max:1,  ideal:[0,0.25], desc:'Ammonia'    },
            { label:'NO\u2082',        unit:'mg/L', val:no2,  min:0,  max:1,  ideal:[0,0.3],  desc:'Nitrite'    },
            { label:'NO\u2083',        unit:'mg/L', val:no3,  min:0,  max:50, ideal:[0,25],   desc:'Nitrate'    },
            { label:'\u00B0C',         unit:'',     val:temp, min:0,  max:28, ideal:[8,22],   desc:'Temperature'}
        ];
        function pCol(v, id) { if (v>=id[0]&&v<=id[1]) return '#2ecc71'; var lo=id[0]-(id[1]-id[0])*0.5,hi=id[1]+(id[1]-id[0])*0.5; return (v>=lo&&v<=hi)?'#d4a843':'#e74c3c'; }
        var allOk = params.every(function(p){ return p.val>=p.ideal[0]&&p.val<=p.ideal[1]; });
        var anyBad= params.some(function(p){ var lo=p.ideal[0]-(p.ideal[1]-p.ideal[0])*0.5,hi=p.ideal[1]+(p.ideal[1]-p.ideal[0])*0.5; return p.val<lo||p.val>hi; });
        var ovCol = allOk ? '#2ecc71' : anyBad ? '#e74c3c' : '#d4a843';
        var h = '<div class="water-test-chart">';
        h += '<div class="water-test-title">\uD83E\uDDEA Water Quality' + (treated ? ' <span class="water-treat-active">\uD83D\uDCA7 Treated</span>' : '') + '</div>';
        h += '<div class="water-test-status" style="color:'+ovCol+';">'+(treated?'\u2714 Treatment active \u2014 '+treatDaysLeft+'d remaining':allOk?'\u2714 All levels optimal':anyBad?'\u26A0 Levels need attention':'\uD83D\uDFE1 Minor imbalance')+'</div>';
        h += '<div class="water-test-bars">';
        params.forEach(function(p){
            var col  = pCol(p.val, p.ideal);
            var fill = Math.max(4, Math.min(95, Math.round(((p.val-p.min)/(p.max-p.min))*100)));
            var idLo = Math.round(((p.ideal[0]-p.min)/(p.max-p.min))*100);
            var idHi = Math.round(((p.ideal[1]-p.min)/(p.max-p.min))*100);
            h += '<div class="water-test-col" title="'+p.desc+': '+p.val+p.unit+'">';
            h += '<div class="water-test-val" style="color:'+col+';">'+p.val+'<span class="water-test-unit">'+p.unit+'</span></div>';
            h += '<div class="water-test-track">';
            h += '<div class="water-test-ideal" style="bottom:'+idLo+'%;height:'+(idHi-idLo)+'%;"></div>';
            h += '<div class="water-test-candle" style="height:'+fill+'%;background:'+col+';box-shadow:0 0 6px '+col+'66;"></div>';
            h += '</div>';
            h += '<div class="water-test-label">'+p.label+'</div>';
            h += '</div>';
        });
        h += '</div>';
        h += '<div class="water-test-legend"><span class="water-test-ideal-swatch"></span>Ideal range</div>';
        h += '<div class="water-treat-btn-row">';
        if (treated) {
            h += '<button class="btn btn-secondary btn-sm" disabled>\uD83D\uDCA7 Treated \u2014 ' + treatDaysLeft + 'd left</button>';
        } else {
            h += '<button class="btn btn-primary btn-sm" onclick="Lakes.treatWater(\'' + lake.id + '\')">\uD83D\uDCA7 Treat Water \u2014 \u00A32,500</button>';
        }
        h += '</div>';
        h += '</div>';
        return h;
    }

    /**
     * Render the right panel: expandable lake details + fish grid.
     */
    function renderActiveLakeDetail() {
        const state     = Game.getState();
        const container = document.getElementById('active-lake-detail');
        if (!container) return;

        if (!state.activeLakeId || !state.ownedLakes.includes(state.activeLakeId)) {
            container.innerHTML =
                '<div class="lake-detail-placeholder">' +
                '<span class="lake-detail-placeholder-icon">\uD83C\uDF3F</span>' +
                '<p>Select one of your lakes to view details and fish.</p>' +
                '</div>';
            return;
        }

        const lake = getLakeById(state.activeLakeId);
        if (!lake) { container.innerHTML = ''; return; }

        const lakeFish = state.fish.filter(function (f) {
            return f.alive && f.lake_id === state.activeLakeId;
        });
        const activeAnglersCount = (state.anglerBookings || []).filter(function (b) {
            return b.lakeId === state.activeLakeId &&
                   state.day >= b.startDay && state.day <= b.endDay;
        }).length;
        const capPenalty = (state.capacityPenalties && state.capacityPenalties[state.activeLakeId])
            ? (state.capacityPenalties[state.activeLakeId].amount || 0) : 0;
        const expansionBonus = getLakeExpansionBonus(state.activeLakeId);
        const effectiveCapacity = lake.capacity + expansionBonus.capacity - capPenalty;
        const isClosed = state.lakeClosures && state.lakeClosures[state.activeLakeId] &&
                         state.lakeClosures[state.activeLakeId] >= state.day;

        let html = '';

        // ── Expandable lake details accordion ────────────────────────────────
        html += '<details class="lake-accordion" open>';
        html += '<summary class="lake-accordion-summary">';
        html += '<span class="lake-accordion-title">' + lake.name + ' \u2014 Details</span>';
        html += '<span class="lake-accordion-meta">' + activeAnglersCount + ' anglers';
        if (isClosed) html += ' &middot; <span style="color:var(--colour-danger);">Closed</span>';
        html += '</span>';
        html += '</summary>';

        html += '<p class="lake-accordion-desc">' + lake.description + '</p>';

        if (isClosed) {
            html += '<div class="lake-closed-banner">&#9888; Closed until day ' +
                state.lakeClosures[state.activeLakeId] + '</div>';
        }

        // ── Two-column layout ────────────────────────────────────────────────
        html += '<div class="lake-detail-two-col">';
        html += '<div class="lake-detail-left">';

        // ── Stats data ───────────────────────────────────────────────────────
        var stockVal = (typeof Fish !== 'undefined') ? Fish.getTotalStockValue(lakeFish) : 0;
        var oxygen = null, oxyStatus = null, oxyPct = 0;
        if (typeof Weather !== 'undefined') {
            oxygen    = Weather.getLakeOxygen(state.activeLakeId);
            oxyStatus = Weather.getOxygenStatus(oxygen);
            oxyPct    = Math.round((oxygen / 14) * 100);
        }
        var capPct    = effectiveCapacity > 0 ? Math.round((lakeFish.length / effectiveCapacity) * 100) : 0;
        var capColor  = capPct < 70 ? '#4a9c6d' : capPct < 90 ? '#d4a843' : '#b83020';
        var bioScore  = lake.biodiversityScore + expansionBonus.biodiversity;
        var bioPct    = Math.round((bioScore / 10) * 100);
        var bioColor  = bioScore < 4 ? '#b83020' : bioScore < 7 ? '#d4a843' : '#4a9c6d';

        var upgrades = (state.lakeUpgrades && state.lakeUpgrades[state.activeLakeId])
            ? state.lakeUpgrades[state.activeLakeId] : [];
        var upgradeNames = [];
        if (upgrades.length > 0 && typeof Shop !== 'undefined') {
            upgradeNames = upgrades.map(function (id) {
                var u = Shop.getAllUpgrades().find(function (u) { return u.id === id; });
                return u ? u.name : id;
            });
        }
        var visiting = (state.anglerBookings || []).filter(function (b) {
            return b.lakeId === state.activeLakeId &&
                   state.day >= b.startDay && state.day <= b.endDay;
        });

        // ── Badge strip ──────────────────────────────────────────────────────
        html += '<div class="lake-info-badge-strip">';
        html += '<span class="lake-info-badge">\uD83C\uDF0A ' + formatWaterType(lake.waterType) + '</span>';
        html += '<span class="lake-info-badge lake-info-badge-income">\uD83D\uDCB7 ' + UI.formatMoney(lake.dailyIncomePerAngler + expansionBonus.income) + '/angler</span>';
        if (expansionBonus.capacity > 0) {
            html += '<span class="lake-info-badge lake-info-badge-accent">\u2B06 +' + expansionBonus.capacity + ' capacity</span>';
        }
        html += '</div>';

        // ── Capacity bar ─────────────────────────────────────────────────────
        html += '<div class="lake-bar-stat">';
        html += '<div class="lake-bar-stat-header"><span class="lake-bar-stat-label">\uD83D\uDC1F Stocked Fish</span>';
        html += '<span class="lake-bar-stat-value">' + lakeFish.length + ' / ' + effectiveCapacity + ' fish</span></div>';
        html += '<div class="lake-bar-track"><div class="lake-bar-fill" style="width:' + Math.min(capPct, 100) + '%;background:' + capColor + ';"></div></div>';
        html += '</div>';

        // ── Biodiversity bar ─────────────────────────────────────────────────
        html += '<div class="lake-bar-stat">';
        html += '<div class="lake-bar-stat-header"><span class="lake-bar-stat-label">\uD83C\uDF3F Biodiversity</span>';
        html += '<span class="lake-bar-stat-value">' + bioScore + ' / 10</span></div>';
        html += '<div class="lake-bar-track"><div class="lake-bar-fill" style="width:' + bioPct + '%;background:' + bioColor + ';"></div></div>';
        html += '</div>';

        // ── Oxygen bar ───────────────────────────────────────────────────────
        if (oxygen !== null) {
            var oxyColor = oxyStatus.cssClass === 'oxygen-excellent' ? '#2ecc71' :
                           oxyStatus.cssClass === 'oxygen-good'      ? '#a3cb38' :
                           oxyStatus.cssClass === 'oxygen-low'       ? '#e67e22' : 'var(--colour-danger)';
            html += '<div class="lake-bar-stat">';
            html += '<div class="lake-bar-stat-header"><span class="lake-bar-stat-label">O\u2082 Oxygen</span>';
            html += '<span class="lake-bar-stat-value ' + oxyStatus.cssClass + '">' + oxygen + ' mg/L \u2014 ' + oxyStatus.label + '</span></div>';
            html += '<div class="lake-bar-track"><div class="lake-bar-fill" style="width:' + oxyPct + '%;background:' + oxyColor + ';"></div></div>';
            if (oxyStatus.cssClass === 'oxygen-critical' || oxyStatus.cssClass === 'oxygen-low') {
                html += '<p class="lake-bar-warn">\u26A0 Install an Aerator from the Shop to improve oxygen levels.</p>';
            }
            html += '</div>';
        }

        // ── Avg fish growth rate bar ─────────────────────────────────────────
        if (lakeFish.length > 0 && typeof Fish !== 'undefined') {
            var SMULT = { 'Fry':0.3, 'Juvenile':0.8, 'Adult':1.0, 'Mature':0.5, 'Elder':0.1 };
            var totalGrowth = 0;
            lakeFish.forEach(function(f){
                var gm = 1.0;
                if (f.personality_traits) {
                    if (f.personality_traits.indexOf('Stunted')     !== -1) gm *= 0.50;
                    if (f.personality_traits.indexOf('Apex Feeder') !== -1) gm *= 1.20;
                    if (f.personality_traits.indexOf('Greedy')      !== -1) gm *= 1.10;
                    if (f.personality_traits.indexOf('Lethargic')   !== -1) gm *= 0.85;
                }
                var daily = (f.growth_rate||1) * (SMULT[f.growth_stage]||0.1) * ((f.stats?f.stats.size_potential:50)/100) * 10 * gm;
                totalGrowth += daily;
            });
            var avgGrowthOz  = totalGrowth / lakeFish.length;
            var avgGrowthLb  = (avgGrowthOz / 16).toFixed(2);
            var growthPct    = Math.min(100, Math.round((avgGrowthOz / 20) * 100));
            var growthColor  = avgGrowthOz >= 8 ? '#2ecc71' : avgGrowthOz >= 3 ? '#d4a843' : '#aaa';
            html += '<div class="lake-bar-stat">';
            html += '<div class="lake-bar-stat-header"><span class="lake-bar-stat-label">\uD83D\uDCC8 Avg Growth</span>';
            html += '<span class="lake-bar-stat-value" style="color:' + growthColor + ';">' + avgGrowthLb + ' lb/day</span></div>';
            html += '<div class="lake-bar-track"><div class="lake-bar-fill" style="width:' + growthPct + '%;background:' + growthColor + ';"></div></div>';
            html += '</div>';
        }

        // ── KPI grid ─────────────────────────────────────────────────────────
        html += '<div class="lake-kpi-grid">';
        html += '<div class="lake-kpi-card"><span class="lake-kpi-val">' + UI.formatMoney(lake.dailyIncomePerAngler + expansionBonus.income) + '</span><span class="lake-kpi-label">Income / Angler</span></div>';
        html += '<div class="lake-kpi-card"><span class="lake-kpi-val">' + activeAnglersCount + '</span><span class="lake-kpi-label">Anglers Today</span></div>';
        html += '<div class="lake-kpi-card"><span class="lake-kpi-val lake-kpi-gold">' + UI.formatMoney(stockVal) + '</span><span class="lake-kpi-label">Fish Stock Value</span></div>';
        html += '<div class="lake-kpi-card"><span class="lake-kpi-val lake-kpi-gold">' + UI.formatMoney(lake.cost + stockVal) + '</span><span class="lake-kpi-label">Lake + Stock</span></div>';
        html += '</div>';


        html += '</div>'; // end lake-detail-left

        // ── Right column: Water test chart ───────────────────────────────────
        html += '<div class="lake-detail-right">';
        html += renderWaterTestChart(lake, lakeFish, oxygen, effectiveCapacity, bioScore, state);
        html += '</div>';

        html += '</div>'; // end lake-detail-two-col

        // ── Upgrades — 4-column tiles (full width below) ─────────────────────
        if (typeof Shop !== 'undefined') {
            var allUpgrades = Shop.getAllUpgrades();
            html += '<div class="lake-upgrades-inline" style="margin-top:0.85rem;">';
            html += '<div class="lake-upgrades-inline-title">\uD83D\uDD27 Upgrades</div>';
            html += '<div class="lake-upgrades-4col">';
            allUpgrades.forEach(function(upgrade){
                var owned = Shop.lakeHasUpgrade(state.activeLakeId, upgrade.id);
                html += '<div class="lake-upgrade-inline-card' + (owned ? ' lake-upgrade-owned' : '') + '">';
                html += '<div class="lake-upgrade-top"><span class="lake-upgrade-icon">' + upgrade.icon + '</span><span class="lake-upgrade-name">' + upgrade.name + '</span></div>';
                html += '<p class="lake-upgrade-desc">' + upgrade.description + '</p>';
                html += '<div class="lake-upgrade-footer"><span class="lake-upgrade-cost">' + UI.formatMoney(upgrade.cost) + '</span>';
                if (owned) {
                    html += '<button class="btn btn-secondary btn-sm" disabled>\u2713 Installed</button>';
                } else if (state.money < upgrade.cost) {
                    html += '<button class="btn btn-secondary btn-sm" disabled>Can\'t afford</button>';
                } else {
                    html += '<button class="btn btn-primary btn-sm" onclick="Shop.setShopLake(\'' + state.activeLakeId + '\');Shop.buyUpgrade(\'' + upgrade.id + '\');Lakes.renderActiveLakeDetail();">Buy</button>';
                }
                html += '</div></div>';
            });
            html += '</div></div>';
        }

        // ── Visiting anglers chips ────────────────────────────────────────────
        if (visiting.length > 0) {
            html += '<div class="lake-chips-row"><span class="lake-chips-label">\uD83C\uDFA3 Visiting</span>';
            html += '<div class="lake-chips">';
            visiting.forEach(function (b) { html += '<span class="lake-chip lake-chip-angler">' + b.anglerName.split(' ')[0] + '</span>'; });
            html += '</div></div>';
        }

        // ── Projected fish growth ─────────────────────────────────────────────
        if (lakeFish.length > 0 && typeof Fish !== 'undefined') {
            var SMULT2     = { 'Fry':0.3, 'Juvenile':0.8, 'Adult':1.0, 'Mature':0.5, 'Elder':0.1 };
            var PERIODS    = [7, 30, 90];
            var totalGrowOz= 0, totalHealth = 0, totalVal2 = 0;

            lakeFish.forEach(function(f){
                var gm = 1.0;
                if (f.personality_traits) {
                    if (f.personality_traits.indexOf('Stunted')     !== -1) gm *= 0.50;
                    if (f.personality_traits.indexOf('Apex Feeder') !== -1) gm *= 1.20;
                    if (f.personality_traits.indexOf('Greedy')      !== -1) gm *= 1.10;
                    if (f.personality_traits.indexOf('Lethargic')   !== -1) gm *= 0.85;
                }
                totalGrowOz += (f.growth_rate||1) * (SMULT2[f.growth_stage]||0.1) * ((f.stats?f.stats.size_potential:50)/100) * 10 * gm;
                totalHealth += f.stats ? f.stats.health : 50;
                totalVal2   += Fish.getFishValue(f);
            });

            var n          = lakeFish.length;
            var avgGrow    = totalGrowOz / n;         // oz/day
            var avgHealth  = totalHealth / n;
            // Health recovers ~1/day for Pristine, -2/day for Sickly, else slow natural regen (~0.3/day net)
            var healthRegen = 0.3;
            lakeFish.forEach(function(f){
                if (f.personality_traits) {
                    if (f.personality_traits.indexOf('Pristine') !== -1) healthRegen += 1/n;
                    if (f.personality_traits.indexOf('Sickly')   !== -1) healthRegen -= 2/n;
                    if (f.personality_traits.indexOf('Hardy')    !== -1) healthRegen += 0.3/n;
                }
            });
            var avgValNow  = totalVal2 / n;

            html += '<div class="lake-proj-section">';
            html += '<div class="lake-proj-title">\uD83D\uDCC8 Projected Growth</div>';
            html += '<div class="lake-proj-grid">';

            // Weight projections
            html += '<div class="lake-proj-col">';
            html += '<div class="lake-proj-col-head">Avg Weight</div>';
            html += '<div class="lake-proj-col-sub">Current</div>';
            var avgWtNow = lakeFish.reduce(function(s,f){ return s+f.weight_oz; },0) / n;
            html += '<div class="lake-proj-val">' + (avgWtNow/16).toFixed(1) + ' lb</div>';
            PERIODS.forEach(function(d){
                var specDef    = typeof Fish !== 'undefined' ? Fish.SPECIES : {};
                var projected  = lakeFish.reduce(function(s,f){
                    var gm2 = 1.0;
                    if (f.personality_traits) {
                        if (f.personality_traits.indexOf('Stunted')     !== -1) gm2 *= 0.50;
                        if (f.personality_traits.indexOf('Apex Feeder') !== -1) gm2 *= 1.20;
                        if (f.personality_traits.indexOf('Greedy')      !== -1) gm2 *= 1.10;
                        if (f.personality_traits.indexOf('Lethargic')   !== -1) gm2 *= 0.85;
                    }
                    var daily2 = (f.growth_rate||1)*(SMULT2[f.growth_stage]||0.1)*((f.stats?f.stats.size_potential:50)/100)*10*gm2;
                    var maxW   = specDef[f.species] ? specDef[f.species].maxWeight : 960;
                    return s + Math.min(maxW, f.weight_oz + daily2 * d);
                },0) / n;
                var gain  = projected - avgWtNow;
                var col   = gain > 32 ? 'var(--colour-accent)' : gain > 8 ? '#d4a843' : '#aaa';
                html += '<div class="lake-proj-col-sub">+' + d + 'd</div>';
                html += '<div class="lake-proj-val" style="color:'+col+';">' + (projected/16).toFixed(1) + ' lb <span class="lake-proj-delta">(+' + (gain/16).toFixed(1) + ')</span></div>';
            });
            html += '</div>';

            // Health projections
            html += '<div class="lake-proj-col">';
            html += '<div class="lake-proj-col-head">Avg Health</div>';
            html += '<div class="lake-proj-col-sub">Current</div>';
            var hCol = avgHealth >= 70 ? 'var(--colour-accent)' : avgHealth >= 40 ? '#d4a843' : 'var(--colour-danger)';
            html += '<div class="lake-proj-val" style="color:'+hCol+';">' + Math.round(avgHealth) + ' / 100</div>';
            PERIODS.forEach(function(d){
                var proj = Math.min(100, Math.round(avgHealth + healthRegen * d));
                var col2 = proj >= 70 ? 'var(--colour-accent)' : proj >= 40 ? '#d4a843' : 'var(--colour-danger)';
                var delta = proj - Math.round(avgHealth);
                html += '<div class="lake-proj-col-sub">+' + d + 'd</div>';
                html += '<div class="lake-proj-val" style="color:'+col2+';">' + proj + ' <span class="lake-proj-delta">' + (delta >= 0 ? '+' : '') + delta + '</span></div>';
            });
            html += '</div>';

            // Value projections
            html += '<div class="lake-proj-col">';
            html += '<div class="lake-proj-col-head">Avg Fish Value</div>';
            html += '<div class="lake-proj-col-sub">Current</div>';
            html += '<div class="lake-proj-val" style="color:var(--colour-gold);">' + UI.formatMoney(Math.round(avgValNow)) + '</div>';
            PERIODS.forEach(function(d){
                // Value grows as weight grows — approximate by recalculating
                var projectedVal = lakeFish.reduce(function(s,f){
                    var gm3 = 1.0;
                    if (f.personality_traits) {
                        if (f.personality_traits.indexOf('Stunted')     !== -1) gm3 *= 0.50;
                        if (f.personality_traits.indexOf('Apex Feeder') !== -1) gm3 *= 1.20;
                        if (f.personality_traits.indexOf('Greedy')      !== -1) gm3 *= 1.10;
                        if (f.personality_traits.indexOf('Lethargic')   !== -1) gm3 *= 0.85;
                    }
                    var daily3 = (f.growth_rate||1)*(SMULT2[f.growth_stage]||0.1)*((f.stats?f.stats.size_potential:50)/100)*10*gm3;
                    var specDef2 = typeof Fish !== 'undefined' && Fish.SPECIES ? Fish.SPECIES : {};
                    var maxW2    = specDef2[f.species] ? specDef2[f.species].maxWeight : 960;
                    var futureWt = Math.min(maxW2, f.weight_oz + daily3 * d);
                    var futureF  = Object.assign({}, f, { weight_oz: futureWt });
                    return s + Fish.getFishValue(futureF);
                },0) / n;
                var vDelta = projectedVal - avgValNow;
                var vCol   = vDelta > 0 ? 'var(--colour-accent)' : '#aaa';
                html += '<div class="lake-proj-col-sub">+' + d + 'd</div>';
                html += '<div class="lake-proj-val" style="color:var(--colour-gold);">' + UI.formatMoney(Math.round(projectedVal)) + ' <span class="lake-proj-delta" style="color:'+vCol+';">' + (vDelta >= 0 ? '+' : '') + UI.formatMoney(Math.round(vDelta)) + '</span></div>';
            });
            html += '</div>';

            html += '</div>'; // lake-proj-grid
            html += '</div>'; // lake-proj-section
        }

        html += '</details>';

        // ── Fish tracker for this lake ────────────────────────────────────────
        if (typeof Fish !== 'undefined') {
            var RARITY_COLS = { common:'#aaa', uncommon:'#2ecc71', rare:'#3498db', epic:'#9b59b6', legendary:'#f1c40f', mythic:'#e74c3c' };
            var byRarity = {};
            var totalVal = 0;
            lakeFish.forEach(function (f) {
                byRarity[f.rarity] = (byRarity[f.rarity] || 0) + 1;
                totalVal += Fish.getFishValue(f);
            });

            html += '<details class="lake-accordion" open style="margin-top:0.75rem;">';
            html += '<summary class="lake-accordion-summary">';
            html += '<span class="lake-accordion-title">\uD83D\uDC1F Fish in this Lake (' + lakeFish.length + ')</span>';
            html += '<span class="lake-accordion-meta">' + (totalVal > 0 ? 'Value: ' + UI.formatMoney(totalVal) : 'No fish') + '</span>';
            html += '</summary>';

            if (lakeFish.length === 0) {
                html += '<p class="empty-state" style="margin:0.5rem 0;">No fish stocked. Buy from the Shop or breed offspring here.</p>';
            } else {
                // Summary KPI strip
                html += '<div class="lake-fish-kpi-strip">';
                html += '<div class="lake-fish-kpi"><span class="lake-fish-kpi-val">' + lakeFish.length + '</span><span class="lake-fish-kpi-label">Total</span></div>';
                html += '<div class="lake-fish-kpi"><span class="lake-fish-kpi-val" style="color:var(--colour-gold);">' + UI.formatMoney(totalVal) + '</span><span class="lake-fish-kpi-label">Stock Value</span></div>';
                var legendaryCount = byRarity['legendary'] || 0;
                html += '<div class="lake-fish-kpi"><span class="lake-fish-kpi-val" style="color:#f1c40f;">' + legendaryCount + '</span><span class="lake-fish-kpi-label">Legendary</span></div>';
                var canBreed = lakeFish.filter(function(f){ var yr = Math.ceil(state.day/365); return f.weight_oz > 160 && (!f.lastBreedYear || f.lastBreedYear < yr); }).length;
                html += '<div class="lake-fish-kpi"><span class="lake-fish-kpi-val" style="color:var(--colour-accent);">' + canBreed + '</span><span class="lake-fish-kpi-label">Breedable</span></div>';
                html += '</div>';

                // Rarity bars
                html += '<div class="lake-fish-rarity-bars">';
                ['mythic','legendary','epic','rare','uncommon','common'].forEach(function (r) {
                    var count = byRarity[r] || 0;
                    if (!count) return;
                    var col = RARITY_COLS[r] || '#888';
                    var rd  = Fish.RARITIES[r] ? Fish.RARITIES[r].name : r;
                    var pct = Math.round((count / lakeFish.length) * 100);
                    html += '<div class="lake-fish-bar-row">';
                    html += '<span class="lake-fish-bar-dot" style="background:' + col + ';"></span>';
                    html += '<span class="lake-fish-bar-label">' + rd + '</span>';
                    html += '<div class="lake-fish-bar-track"><div class="lake-fish-bar-fill" style="width:' + pct + '%;background:' + col + ';"></div></div>';
                    html += '<span class="lake-fish-bar-count">' + count + '</span>';
                    html += '</div>';
                });
                html += '</div>';

                // Compact fish list
                html += '<div class="lake-fish-list">';
                html += '<div class="lake-fish-list-header"><span>Name</span><span>Species</span><span>Rarity</span><span>Weight</span><span>Value</span></div>';
                html += '<div class="lake-fish-list-body">';
                var curYr = Math.ceil(state.day / 365);
                lakeFish.slice().sort(function(a,b){ var ro={common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5}; return (ro[b.rarity]||0)-(ro[a.rarity]||0); }).forEach(function (f) {
                    var col = RARITY_COLS[f.rarity] || '#888';
                    var sp  = Fish.SPECIES[f.species] ? Fish.SPECIES[f.species].name : f.species;
                    var val = Fish.getFishValue(f);
                    var bred = f.lastBreedYear && f.lastBreedYear >= curYr;
                    html += '<div class="lake-fish-list-row">';
                    html += '<span class="lake-fish-list-name">' + f.name + (bred ? ' <em>\u{1F6AB}</em>' : '') +
                        (f.weight_oz >= 640 ? ' <span style="color:#e67e22;font-size:0.7rem;">\uD83C\uDFAF</span>' : f.weight_oz >= 480 ? ' <span style="color:#3498db;font-size:0.7rem;">\uD83D\uDCF1</span>' : '') + '</span>';
                    html += '<span>' + sp + '</span>';
                    html += '<span style="color:' + col + ';font-weight:700;">' + (Fish.RARITIES[f.rarity] ? Fish.RARITIES[f.rarity].name : f.rarity) + '</span>';
                    html += '<span>' + UI.formatWeight(f.weight_oz) + '</span>';
                    html += '<span style="color:var(--colour-gold);">' + UI.formatMoney(val) + '</span>';
                    html += '</div>';
                });
                html += '</div>';
                html += '</div>';
            }
            html += '</details>';
        }

        container.innerHTML = html;
    }

    return {
        getLakeById: getLakeById,
        getAllLakes: getAllLakes,
        getLakeStatus: getLakeStatus,
        buyLake: buyLake,
        selectLake: selectLake,
        renderLakes: renderLakes,
        renderBuyLakes: renderBuyLakes,
        selectBuyLake: selectBuyLake,
        renderActiveLakeDetail: renderActiveLakeDetail,
        treatWater:             treatWater,
        setMaintenance: setMaintenance,
        getLakeMaintenanceDailyCost: getLakeMaintenanceDailyCost,
        getLakeMaintenanceEffect: getLakeMaintenanceEffect,
        startExpansion: startExpansion,
        processExpansions: processExpansions,
        getLakeExpansionBonus: getLakeExpansionBonus,
        netFish: netFish,
        updateNetPreview: updateNetPreview
    };
})();

// Initialise the game when the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    Game.init();
    UI.init();
});
