/**
 * Carp Fishing Tycoon - Core Game Engine
 * Manages game state, save/load, and day progression.
 */

'use strict';

const Game = (function () {
    // Default state for a new game
    const DEFAULT_STATE = {
        day: 1,
        money: 50000,
        reputation: 0,
        ownedLakes: ['oakmere_lake'],
        activeLakeId: 'oakmere_lake',
        playerAnglerId: null,
        fish: [],
        anglers: [],
        notifications: [],
        totalEarnings: 0,
        totalSpent: 0,
        breedingPond: [],
        breedingTimer: 0,
        breedingActive: false,
        lakeUpgrades: {},
        fishHistory: [],
        nextFishId: 1,
        anglerBookings: [],
        anglerSatisfaction: {},
        pendingBookings: [],
        incomeHistory: [],
        completedQuests: [],
        disasterLog: [],
        nextWorldEventDay: 14,
        lakeClosures: {},
        biodiversityPenalties: {},
        capacityPenalties: {},
        reputationAccumulator: 0,
        weather: null,
        lakeOxygen: {},
        hiredStaff: [],
        availableStaffIds: [],
        nextStaffRefreshDay: 0,
        nextStaffInstanceId: 1,
        loans: [],
        marketingCampaigns: [],
        financeLog: [],
        nextLoanId: 1,
        nextCampaignId: 1,
        spawnLog: {},
        breedingSettings: { feedQuality: 0, feedFrequency: 1, pondTemp: 1, stressControl: 1 },
        eventLog: [],
        fishCreationLog: [],
        nextEventId: 1,
        lastBreedingOutcome: null,
        investorDeals: [],
        marketEquityPct: 0,
        dividendsPaid: 0,
        fisheryListed: false,
        sharePrice: 0,
        nextInvestorId: 1,
        fishAuctions: [],
        lakeMaintenance: {},
        lakeExpansions: {},
        sponsorships: [],
        anglerStats: {},
        matchResults: [],
        tournamentCut: 0.20,
        nextSponsorshipId: 1,
        cardInventory:    [],
        cardPacksBought:  {},
        activeCardBuffs:  [],
        cardNextId:       1,
        reputationHistory: [],
        newsStories:      [],
        nextNewsId:       1,
        lastDeathCount: 0,
        _initialFish: (function () {
            var fish = [];
            var nextId = 1;
            var commonWeights = [16, 32, 64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240, 256, 272, 288, 300, 305, 320];
            var uncommonWeights = [48, 305];
            var commonNames = ['Spotted Dick', 'Big Jenny', 'The Governor', 'Captain Carl', 'Muddy Pete', 'King Elisha', 'Serial Dave', 'Helen of Troy', 'The Sheriffs Special', 'Colin the Crab', "Gordon's Monster", 'Floating Log', 'The Bishop', 'Pirate Pete', 'Dusty Miller', 'The Landlord', 'Sidney Scallop', 'Mojo M', 'The General', 'The Dentist'];
            var uncommonNames = ['The Ghost of Oakmere', 'Leviathan'];
            for (var i = 0; i < 20; i++) {
                var w = commonWeights[i];
                fish.push({
                    id: nextId++,
                    name: commonNames[i],
                    species: 'common',
                    speciesName: 'Common Carp',
                    age_days: Math.floor(Math.random() * 200) + 30,
                    max_age_days: 800,
                    growth_rate: 1.0,
                    rarity: 'common',
                    personality_traits: [],
                    stats: { health: 60, aggression: 50, size: 50, metabolism: 50, curiosity: 50, size_potential: 50 },
                    parent_ids: [],
                    lake_id: 'oakmere_lake',
                    growth_stage: 'adult',
                    alive: true,
                    weight_oz: w,
                    value: Math.round((50 * Math.max(0.4, w / 160)) * (0.6 + 50/250))
                });
            }
            for (var j = 0; j < 2; j++) {
                var w2 = uncommonWeights[j];
                fish.push({
                    id: nextId++,
                    name: uncommonNames[j],
                    species: 'mirror',
                    speciesName: 'Mirror Carp',
                    age_days: Math.floor(Math.random() * 250) + 60,
                    max_age_days: 900,
                    growth_rate: 0.9,
                    rarity: 'uncommon',
                    personality_traits: [],
                    stats: { health: 70, aggression: 60, size: 60, metabolism: 55, curiosity: 55, size_potential: 60 },
                    parent_ids: [],
                    lake_id: 'oakmere_lake',
                    growth_stage: 'adult',
                    alive: true,
                    weight_oz: w2,
                    value: Math.round((200 * Math.max(0.4, w2 / 160)) * (0.6 + 60/250))
                });
            }
            return { fish: fish, nextFishId: nextId };
        })()

    };
    console.log('[Game] DEFAULT_STATE created');

    const STORAGE_KEY = 'carpFishingTycoon_saveData';
    let state = {};

    function _generateInitialFish() {
        var fish = [];
        var nextId = 1;
        var commonNames = ['Spotted Dick', 'Big Jenny', 'The Governor', 'Captain Carl', 'Muddy Pete', 'King Elisha', 'Serial Dave', 'Helen of Troy', 'The Sheriffs Special', 'Colin the Crab', "Gordon's Monster", 'Floating Log', 'The Bishop', 'Pirate Pete', 'Dusty Miller', 'The Landlord', 'Sidney Scallop', 'Mojo M', 'The General', 'The Dentist'];
        var uncommonNames = ['The Ghost of Oakmere', 'Leviathan'];
        var commonWeights = [16, 32, 64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240, 256, 272, 288, 300, 305, 320];
        var uncommonWeights = [48, 305];
        for (var i = 0; i < 20; i++) {
            var f = {
                id: nextId++,
                name: commonNames[i],
                species: 'common',
                speciesName: 'Common Carp',
                age_days: Math.floor(Math.random() * 200) + 30,
                max_age_days: 800,
                growth_rate: 1.0,
                rarity: 'common',
                personality_traits: [],
                stats: { health: 60, aggression: 50, size: 50, metabolism: 50, curiosity: 50, size_potential: 50 },
                parent_ids: [],
                lake_id: 'oakmere_lake',
                growth_stage: 'adult',
                alive: true
            };
            f.weight_oz = commonWeights[i];
            f.value = (typeof Fish !== 'undefined' && typeof Fish.getFishValue === 'function')
                ? Fish.getFishValue(f)
                : Math.round((50 * Math.max(0.4, f.weight_oz / 160)) * (0.6 + (f.stats.size / 250)));
            fish.push(f);
        }
        // 2 uncommon fish 1-20lb (16-320oz)
        for (var j = 0; j < 2; j++) {
            var f2 = {
                id: nextId++,
                name: uncommonNames[j],
                species: 'mirror',
                speciesName: 'Mirror Carp',
                age_days: Math.floor(Math.random() * 250) + 60,
                max_age_days: 900,
                growth_rate: 0.9,
                rarity: 'uncommon',
                personality_traits: [],
                stats: { health: 70, aggression: 60, size: 60, metabolism: 55, curiosity: 55, size_potential: 60 },
                parent_ids: [],
                lake_id: 'oakmere_lake',
                growth_stage: 'adult',
                alive: true
            };
            f2.weight_oz = uncommonWeights[j];
            f2.value = (typeof Fish !== 'undefined' && typeof Fish.getFishValue === 'function')
                ? Fish.getFishValue(f2)
                : Math.round((200 * Math.max(0.4, f2.weight_oz / 160)) * (0.6 + (f2.stats.size / 250)));
            fish.push(f2);
        }
        return { fish: fish, nextFishId: nextId };
    }

    /**
     * Initialise the game - load saved state or create new.
     */
    function init() {
        const saved = loadFromStorage();
        console.log('[Game.init] saved=', saved, 'typeof=', typeof saved, 'keys=', saved ? Object.keys(saved).sort().join(',') : 'none');
        if (saved) {
            state = saved;
            console.log('[Game.init] took saved branch');
            // Ensure new state fields exist for older saves
            if (!state.breedingPond) state.breedingPond = [];
            if (!state.breedingTimer) state.breedingTimer = 0;
            if (!state.breedingActive) state.breedingActive = false;
            if (!state.lakeUpgrades) state.lakeUpgrades = {};
            if (!state.fishHistory) state.fishHistory = [];
            if (!state.nextFishId) state.nextFishId = 1;
            if (!state.anglerBookings) state.anglerBookings = [];
            if (!state.anglerSatisfaction) state.anglerSatisfaction = {};
            if (!state.pendingBookings) state.pendingBookings = [];
            if (!state.incomeHistory) state.incomeHistory = [];
            if (!state.completedQuests) state.completedQuests = [];
            if (!state.disasterLog) state.disasterLog = [];
            if (!state.lakeClosures) state.lakeClosures = {};
            if (!state.biodiversityPenalties) state.biodiversityPenalties = {};
            if (!state.capacityPenalties) state.capacityPenalties = {};
            if (state.reputationAccumulator === undefined) state.reputationAccumulator = 0;
            if (!state.weather)    state.weather    = null;
            if (!state.lakeOxygen) state.lakeOxygen = {};
            if (!state.hiredStaff)          state.hiredStaff          = [];
            if (!state.availableStaffIds)   state.availableStaffIds   = [];
            if (state.nextStaffRefreshDay  === undefined) state.nextStaffRefreshDay  = 0;
            if (state.nextStaffInstanceId  === undefined) state.nextStaffInstanceId  = 1;
            if (!state.loans)            state.loans            = [];
            if (!state.marketingCampaigns) state.marketingCampaigns = [];
            if (!state.financeLog)       state.financeLog       = [];
            if (!state.nextLoanId)       state.nextLoanId       = 1;
            if (!state.nextCampaignId)   state.nextCampaignId   = 1;
            if (!state.spawnLog)         state.spawnLog         = {};
            if (!state.breedingSettings) state.breedingSettings = { feedQuality: 0, feedFrequency: 1, pondTemp: 1, stressControl: 1 };
            if (!state.eventLog)          state.eventLog          = [];
            if (!state.fishCreationLog)   state.fishCreationLog   = [];
            if (!state.nextEventId)       state.nextEventId       = 1;
            if (state.lastBreedingOutcome === undefined) state.lastBreedingOutcome = null;
            if (!state.investorDeals)    state.investorDeals    = [];
            if (!state.marketEquityPct)  state.marketEquityPct  = 0;
            if (!state.dividendsPaid)    state.dividendsPaid    = 0;
            if (!state.fisheryListed)    state.fisheryListed    = false;
            if (!state.sharePrice)       state.sharePrice       = 0;
            if (!state.nextInvestorId)   state.nextInvestorId   = 1;
            if (!state.fishAuctions)     state.fishAuctions     = [];
            if (!state.lakeMaintenance)  state.lakeMaintenance  = {};
            if (!state.lakeExpansions)   state.lakeExpansions   = {};
            if (!state.sponsorships)     state.sponsorships     = [];
            if (!state.anglerStats)      state.anglerStats      = {};
            if (!state.matchResults)     state.matchResults     = [];
        } else {
            state = JSON.parse(JSON.stringify(DEFAULT_STATE));
            console.log('[Game.init] took ELSE branch, DEFAULT_STATE keys:', Object.keys(state).sort().join(','));
        }
        // If loaded/created state has no fish, seed Oakmere Lake stock
        if (!state.fish || state.fish.length === 0) {
            var initial = DEFAULT_STATE._initialFish || null;
            if (initial) {
                state.fish = initial.fish;
                state.nextFishId = initial.nextFishId;
                if (typeof Fish !== 'undefined' && typeof Fish.getFishValue === 'function') {
                    state.fish.forEach(function (f) { f.value = Fish.getFishValue(f); });
                }
                console.log('[Game.init] reseeded empty fish array with initial stock, count=', state.fish.length);
            }
        }
        // Sync fish ID counter
        if (typeof Fish !== 'undefined') {
            Fish.setNextId(state.nextFishId);
        }
        // Set opening weather silently (no notifications on load)
        if (typeof Weather !== 'undefined') {
            Weather.initWeather();
        }
        // Ensure starter fish have weight and value
        if (state.fish && state.fish.length) {
            state.fish.forEach(function (f) {
                if (typeof f.weight_oz !== 'number' || f.weight_oz === null || f.weight_oz === undefined) {
                    f.weight_oz = Math.floor(Math.random() * 305) + 16;
                    if (f.weight_oz < 16) f.weight_oz = 16;
                    if (f.weight_oz > 320) f.weight_oz = 320;
                }
                if (typeof f.value !== 'number' || f.value === null || f.value === undefined) {
                    f.value = (typeof Fish !== 'undefined' && typeof Fish.getFishValue === 'function')
                        ? Fish.getFishValue(f)
                        : Math.round((50 * Math.max(0.4, f.weight_oz / 160)) * (0.6 + ((f.stats && f.stats.size) || 50) / 250));
                }
            });
        }
        console.log('[Game.init] before return keys:', Object.keys(state).sort().join(','));
        return state;
    }

    /**
     * Get the current game state.
     */
    function getState() {
        return state;
    }

    function setState(newState) {
        state = newState;
    }

    /**
     * Save game state to localStorage.
     */
    function saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save game state:', e);
        }
    }

    function loadFromStorage() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.warn('Failed to load game state:', e);
        }
        return null;
    }
    function resetGame() {
        state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        var initial = _generateInitialFish();
        state.fish = initial.fish;
        state.nextFishId = initial.nextFishId;
        saveToStorage();
        return state;
    }

    /**
     * Advance to the next day - processes all daily events.
     */
    function nextDay() {
        state.day++;

        // Clear yesterday's notifications first, then generate weather so its
        // notifications are part of today's log
        state.notifications = [];

        // Generate today's weather — must run before anglers, disasters, etc.
        if (typeof Weather !== 'undefined') {
            Weather.processWeather();
        }

        // Process fish aging and permadeath
        processFishAging();

        // Process breeding pond
        if (typeof Breeding !== 'undefined') {
            Breeding.processDailyBreeding();
        }

        // Process angler bookings (income, satisfaction, reputation)
        if (typeof Anglers !== 'undefined') {
            Anglers.processDailyBookings();
        }

        // Roll for disasters
        if (typeof Disasters !== 'undefined') {
            Disasters.rollForDisasters();
        }

        // Generate new booking requests
        if (typeof Anglers !== 'undefined') {
            Anglers.generateBookingRequests();
        }

        // Process staff (salaries, happiness, auto-bookings — must run AFTER
        // generateBookingRequests so the assistant can accept today's new requests)
        if (typeof Staff !== 'undefined') {
            Staff.processStaff();
        }

        // Process finance (loan repayments, marketing rep drip)
        if (typeof Finance !== 'undefined') {
            Finance.processDailyFinance();
        }

        // Process tournament system
        if (typeof Anglers !== 'undefined' && Anglers.processTournaments) {
            Anglers.processTournaments();
        }

        // Resolve any completed fish auctions
        if (typeof Shop !== 'undefined' && Shop.processDailyAuctions) {
            Shop.processDailyAuctions();
        }

        // Apply lake maintenance costs + effects
        if (typeof Lakes !== 'undefined') {
            // Check for completed expansions
            Lakes.processExpansions();

            state.ownedLakes.forEach(function (lakeId) {
                var cost = Lakes.getLakeMaintenanceDailyCost(lakeId);
                if (cost > 0) {
                    state.money      = Math.max(0, state.money - cost);
                    state.totalSpent += cost;
                    if (typeof Finance !== 'undefined') {
                        var lakeDef = Lakes.getLakeById(lakeId);
                        Finance.addFinanceLog('lake_maintenance', -cost,
                            (lakeDef ? lakeDef.name : lakeId) + ' maintenance');
                    }
                }
                // Feed quality daily fish health bonus
                var feedBonus = Lakes.getLakeMaintenanceEffect(lakeId, 'fishHealthBonus');
                if (feedBonus > 0) {
                    state.fish.forEach(function (fish) {
                        if (fish.alive && fish.lake_id === lakeId) {
                            fish.stats.health = Math.min(100, fish.stats.health + feedBonus);
                        }
                    });
                }
            });
        }

        // Process daily income from owned lakes (only generates income when anglers are present)
        let dailyIncome = 0;
        state.ownedLakes.forEach(function (lakeId) {
            const lakeDef = Lakes.getLakeById(lakeId);
            if (lakeDef) {
                // Skip closed lakes
                if (state.lakeClosures && state.lakeClosures[lakeId] && state.lakeClosures[lakeId] >= state.day) {
                    return;
                }
                // Count active anglers at this lake
                var anglersAtLake = state.anglerBookings.filter(function (b) {
                    return b.lakeId === lakeId && state.day >= b.startDay && state.day <= b.endDay;
                }).length;
                if (anglersAtLake === 0) return;

                // Base income scales with angler count and biodiversity
                // Groundskeeper staff add an effective biodiversity bonus
                var effectiveBiodiversity = lakeDef.biodiversityScore;
                if (typeof Staff !== 'undefined') {
                    effectiveBiodiversity += Staff.getLakeBiodiversityBonus(lakeId);
                }
                // Expansion biodiversity and income bonus
                var expBonus = typeof Lakes !== 'undefined' ? Lakes.getLakeExpansionBonus(lakeId) : { biodiversity: 0, income: 0 };
                effectiveBiodiversity += expBonus.biodiversity;
                var baseIncome = (lakeDef.dailyIncomePerAngler + expBonus.income) * anglersAtLake * (effectiveBiodiversity / 10);
                // Add income bonus from upgrades
                if (typeof Shop !== 'undefined') {
                    baseIncome += Shop.getLakeIncomeBonus(lakeId);
                }
                dailyIncome += baseIncome;
            }
        });

        if (dailyIncome > 0) {
            state.money += dailyIncome;
            state.totalEarnings += dailyIncome;
            addNotification('Earned ' + UI.formatMoney(dailyIncome) + ' from your lakes today.');
            if (typeof Finance !== 'undefined') {
                Finance.addFinanceLog('lake_income', dailyIncome, 'Lake passive income');
            }
        }

        // ── Lake Buff Effects Processing ───────────────────────────────────────────
        if (typeof Lakes !== 'undefined') {
            state.ownedLakes.forEach(function (lakeId) {
                var lakeDef = Lakes.getLakeById(lakeId);
                if (!lakeDef || !lakeDef.buffs) return;

                var lakeFish = state.fish.filter(function(f) { return f.alive && f.lake_id === lakeId; });
                if (lakeFish.length === 0) return;

                var pos = lakeDef.buffs.positive || {};
                var neg = lakeDef.buffs.negative || {};

                // Growth bonus/penalty
                if (pos.growthBonus || neg.growthPenalty) {
                    var mult = 1 + (pos.growthBonus || 0) - (neg.growthPenalty || 0);
                    lakeFish.forEach(function(f) {
                        if (f.growth_stage !== 'Elder') {
                            f.weight_oz = Math.round(f.weight_oz * mult);
                        }
                    });
                }

                // Health regen
                if (pos.healthRegen) {
                    lakeFish.forEach(function(f) {
                        f.stats.health = Math.min(100, (f.stats.health || 0) + pos.healthRegen);
                    });
                }

                // Oxygen bonus (reduces stress)
                if (pos.oxygenBonus) {
                    lakeFish.forEach(function(f) {
                        f.stats.health = Math.min(100, (f.stats.health || 0) + Math.round(pos.oxygenBonus * 2));
                    });
                }

                // Stress reduction
                if (pos.stressReduction) {
                    lakeFish.forEach(function(f) {
                        f.stats.health = Math.min(100, (f.stats.health || 0) + 1);
                    });
                }

                // Predator chance increase
                if (neg.predatorChance && Math.random() < neg.predatorChance) {
                    var victims = lakeFish.sort(function() { return Math.random() - 0.5; }).slice(0, Math.max(1, Math.floor(lakeFish.length * 0.05)));
                    victims.forEach(function(f) {
                        f.alive = false;
                        if (!state.fishHistory) state.fishHistory = [];
                        state.fishHistory.push(f);
                    });
                    state.fish = state.fish.filter(function(f) { return f.alive; });
                    addNotification('⚠️ Predators struck ' + lakeDef.name + '! Lost ' + victims.length + ' fish.');
                }

                // Winter kill
                if (neg.winterKill && Math.random() < neg.winterKill) {
                    var victims = lakeFish.slice(0, Math.max(1, Math.floor(lakeFish.length * 0.03)));
                    victims.forEach(function(f) {
                        f.alive = false;
                        if (!state.fishHistory) state.fishHistory = [];
                        state.fishHistory.push(f);
                    });
                    state.fish = state.fish.filter(function(f) { return f.alive; });
                    addNotification('❄️ Winter kill at ' + lakeDef.name + '! Lost ' + victims.length + ' fish.');
                }

                // Flood risk
                if (neg.floodRisk && Math.random() < neg.floodRisk) {
                    var displaced = Math.max(1, Math.floor(lakeFish.length * 0.1));
                    var victims = lakeFish.slice(0, displaced);
                    victims.forEach(function(f) {
                        f.alive = false;
                        if (!state.fishHistory) state.fishHistory = [];
                        state.fishHistory.push(f);
                    });
                    state.fish = state.fish.filter(function(f) { return f.alive; });
                    addNotification('🌊 Flood at ' + lakeDef.name + '! Lost ' + victims.length + ' fish.');
                }

                // Poaching risk
                if (neg.poachingRisk && Math.random() < neg.poachingRisk && lakeFish.length > 0) {
                    var victim = lakeFish.sort(function(a,b) { return (b.weight_oz||0) - (a.weight_oz||0); })[0];
                    victim.alive = false;
                    if (!state.fishHistory) state.fishHistory = [];
                    state.fishHistory.push(victim);
                    state.fish = state.fish.filter(function(f) { return f.alive; });
                    addNotification('🎯 Poachers hit ' + lakeDef.name + '! Lost ' + victim.name + '.');
                }

                // Disease spread
                if (neg.diseaseSpread && Math.random() < neg.diseaseSpread) {
                    lakeFish.forEach(function(f) {
                        f.stats.health = Math.max(0, (f.stats.health || 100) - Math.floor(Math.random() * 20) - 10);
                        if (f.stats.health <= 0) f.alive = false;
                    });
                    state.fish = state.fish.filter(function(f) { return f.alive; });
                    addNotification('🦠 Disease outbreak at ' + lakeDef.name + '!');
                }

                // Reputation gain from positive buffs
                if (pos.reputationGain) {
                    addReputation(pos.reputationGain);
                }
            });
        }

        // Fish generate reputation based on rarity, size and target-fish status
        if (!state.reputationAccumulator) state.reputationAccumulator = 0;
        var reputationFromFish = 0;
        state.fish.forEach(function (fish) {
            if (fish.alive) {
                var rarityBonus = { common: 0.05, uncommon: 0.10, rare: 0.25, epic: 0.5, legendary: 1.0, mythic: 2.5 };
                reputationFromFish += rarityBonus[fish.rarity] || 0;
                // Social media boost: 30lb+ fish attract attention online
                if (fish.weight_oz >= 480) reputationFromFish += 0.15;
                // Target fish bonus: 40lb+ generates extra buzz
                if (fish.weight_oz >= 640) reputationFromFish += 0.30;
            }
        });
        if (reputationFromFish > 0) {
            state.reputationAccumulator += reputationFromFish;
            if (state.reputationAccumulator >= 1) {
                var wholeRep = Math.floor(state.reputationAccumulator);
                addReputation(wholeRep);
                state.reputationAccumulator -= wholeRep;
            }
        }

        // Natural fish spawning (June — days 152–181 of each year)
        processNaturalSpawning();

        // Check quest completion
        if (typeof Dashboard !== 'undefined') {
            Dashboard.checkQuests();
        }

        // Process card buffs
        if (typeof Cards !== 'undefined') {
            Cards.processBuffs();
        }

        // Generate daily news stories
        if (typeof News !== 'undefined') {
            News.generateDailyStories();
        }

        // Track reputation history
        if (!state.reputationHistory) state.reputationHistory = [];
        if (!state.newsStories)       state.newsStories       = [];
        if (!state.nextNewsId)        state.nextNewsId        = 1;
        if (!state.lastDeathCount)    state.lastDeathCount    = 0;
        state.reputationHistory.push({ day: state.day, reputation: state.reputation });
        if (state.reputationHistory.length > 30) state.reputationHistory.shift();

        // Add day progression notification
        addNotification('Day ' + state.day + ' has begun.');

        // World events: occasional windfalls / setbacks every ~14-21 days
        if (!state.nextWorldEventDay) state.nextWorldEventDay = 14;
        if (state.day >= state.nextWorldEventDay) {
            state.nextWorldEventDay = state.day + Math.floor(Math.random() * 8) + 14;
            processWorldEvent();
        }

        // Save nextFishId
        if (typeof Fish !== 'undefined') {
            state.nextFishId = Fish.getNextId();
        }

        saveToStorage();
        return state;
    }

    function processWorldEvent() {
        var roll = Math.random();
        var event, amount, balanceBefore = state.money;

        if (roll < 0.35) {
            amount = Math.floor(Math.random() * 4000) + 2000;
            state.money += amount;
            state.totalEarnings += amount;
            event = { icon: '\uD83C\uDF1F', text: 'Tourist boom: extra angler spending brought in ' + UI.formatMoney(amount) + '.' };
        } else if (roll < 0.65) {
            amount = Math.floor(Math.random() * 6000) + 2000;
            state.money = Math.max(0, state.money - amount);
            state.totalSpent += amount;
            event = { icon: '\u26A0\uFE0F', text: 'Equipment failure: repairs and fines cost ' + UI.formatMoney(amount) + '.' };
        } else if (roll < 0.85) {
            amount = Math.floor(Math.random() * 12000) + 8000;
            state.money += amount;
            state.totalEarnings += amount;
            event = { icon: '\uD83D\uDCB0', text: 'Corporate booking: a large group paid ' + UI.formatMoney(amount) + ' for a private event.' };
        } else {
            amount = Math.floor(Math.random() * 10000) + 8000;
            state.money = Math.max(0, state.money - amount);
            state.totalSpent += amount;
            event = { icon: '\uD83D\uDCA5', text: 'Lake pollution notice: cleanup and fines cost ' + UI.formatMoney(amount) + '.' };
        }

        if (typeof Finance !== 'undefined') {
            var delta = state.money - balanceBefore;
            Finance.addFinanceLog(delta >= 0 ? 'world_event_income' : 'world_event_cost',
                delta, event.text);
        }

        addEvent('world', event.icon, event.text);
        addNotification(event.text);
    }

    /**
     * Natural carp spawning — runs every day in June (days 152–181 of the game year).
     * Each owned lake can produce up to 3% of its current stock as new fry per season.
     * Fry inherit the species of a random adult in the lake and are always common rarity.
     */
    function processNaturalSpawning() {
        if (typeof Fish === 'undefined' || typeof Lakes === 'undefined') return;

        var dayOfYear = typeof Weather !== 'undefined'
            ? Weather.getDayOfYear(state.day)
            : ((state.day - 1) % 365 + 1);

        // June only (days 152–181)
        if (dayOfYear < 152 || dayOfYear > 181) return;

        var gameYear = Math.ceil(state.day / 365);
        if (!state.spawnLog) state.spawnLog = {};

        state.ownedLakes.forEach(function (lakeId) {
            var lakeFish = state.fish.filter(function (f) {
                return f.alive && f.lake_id === lakeId &&
                       f.growth_stage !== 'Fry' && f.growth_stage !== 'Juvenile';
            });
            if (lakeFish.length < 2) return; // need adults present to spawn

            var lake = Lakes.getLakeById(lakeId);
            if (!lake) return;

            // Capacity check
            var capPenalty = (state.capacityPenalties && state.capacityPenalties[lakeId])
                ? (state.capacityPenalties[lakeId].amount || 0) : 0;
            var effectiveCap = lake.capacity - capPenalty;
            var totalStocked = state.fish.filter(function (f) {
                return f.alive && f.lake_id === lakeId;
            }).length;
            if (totalStocked >= effectiveCap) return;

            // Season cap: max 3% of total current stock (minimum 1 fry per season)
            var maxThisSeason = Math.max(1, Math.floor(totalStocked * 0.03));
            var logKey        = lakeId + '_' + gameYear;
            var alreadySpawned = state.spawnLog[logKey] || 0;
            if (alreadySpawned >= maxThisSeason) return;

            // ~8% daily chance of a spawn event during June
            if (Math.random() > 0.08) return;

            // Inherit species from a random adult
            var parent = lakeFish[Math.floor(Math.random() * lakeFish.length)];
            var fry = Fish.createFish({
                species:   parent.species,
                rarity:    'common',
                age_days:  0,
                weight_oz: 1 + Math.floor(Math.random() * 3),
                lake_id:   lakeId
            });
            state.fish.push(fry);
            state.spawnLog[logKey] = alreadySpawned + 1;

            addNotification(
                '\uD83D\uDC1F Natural spawning at ' + lake.name + '! A ' +
                parent.speciesName + ' fry (' + fry.name + ') was born. ' +
                'Season total: ' + (alreadySpawned + 1) + '/' + maxThisSeason + '.'
            );
        });
    }

    /**
     * Process fish aging - ages all fish, applies growth, checks permadeath.
     */
    function processFishAging() {
        if (typeof Fish === 'undefined') return;

        var deadFish = [];
        state.fish.forEach(function (fish) {
            if (fish.alive) {
                var survived = Fish.ageFish(fish);
                if (!survived) {
                    deadFish.push(fish);
                }
            }
        });

        // Also age breeding pond fish
        if (state.breedingPond) {
            state.breedingPond.forEach(function (fish) {
                if (fish && fish.alive) {
                    var survived = Fish.ageFish(fish);
                    if (!survived) {
                        deadFish.push(fish);
                    }
                }
            });
        }

        // Handle permadeath notifications and move to history
        deadFish.forEach(function (fish) {
            addNotification(fish.name + ' (' + fish.speciesName + ') has passed away at ' + fish.age_days + ' days old. Rest in peace.');
            // Move to fish history for lineage tracking
            if (!state.fishHistory) state.fishHistory = [];
            state.fishHistory.push(fish);
        });

        // Remove dead fish from main list
        state.fish = state.fish.filter(function (f) { return f.alive; });

        // Remove dead fish from breeding pond
        if (state.breedingPond) {
            state.breedingPond = state.breedingPond.filter(function (f) { return f && f.alive; });
            // Cancel breeding if pond lost a fish
            if (state.breedingActive && state.breedingPond.length < 2) {
                state.breedingActive = false;
                state.breedingTimer = 0;
                addNotification('Breeding cancelled due to fish loss.');
            }
        }
    }

    /**
     * Spend money - returns true if successful.
     */
    function spendMoney(amount) {
        if (state.money >= amount) {
            state.money -= amount;
            state.totalSpent += amount;
            saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Add money to the player's balance.
     */
    function addMoney(amount) {
        state.money += amount;
        state.totalEarnings += amount;
        saveToStorage();
    }

    /**
     * Add reputation points (capped at 100).
     */
    function addReputation(amount) {
        state.reputation = Math.min(1000, state.reputation + amount);
        saveToStorage();
    }

    /**
     * Add a lake to owned lakes.
     */
    function addOwnedLake(lakeId) {
        if (!state.ownedLakes.includes(lakeId)) {
            state.ownedLakes.push(lakeId);
            if (!state.activeLakeId) {
                state.activeLakeId = lakeId;
            }
            saveToStorage();
        }
    }

    /**
     * Set the active lake.
     */
    function setActiveLake(lakeId) {
        if (state.ownedLakes.includes(lakeId)) {
            state.activeLakeId = lakeId;
            saveToStorage();
        }
    }

    /**
     * Add a significant game event to the persistent event log.
     * Events are shown in the page-wide events strip and never cleared daily.
     */
    function addEvent(type, icon, message) {
        if (!state.eventLog) state.eventLog = [];
        if (!state.nextEventId) state.nextEventId = 1;
        state.eventLog.push({
            id:        state.nextEventId++,
            day:       state.day,
            type:      type,
            icon:      icon,
            message:   message,
            timestamp: Date.now()
        });
        // Keep rolling 50-event window
        if (state.eventLog.length > 50) state.eventLog = state.eventLog.slice(-50);
    }

    /**
     * Add a fish to the creation log.
     */
    function logFishCreation(fish, source, parentNames) {
        if (!state.fishCreationLog) state.fishCreationLog = [];
        state.fishCreationLog.push({
            day:         state.day,
            fishId:      fish.id,
            name:        fish.name,
            species:     fish.speciesName || fish.species,
            rarity:      fish.rarity,
            source:      source,        // 'breeding' | 'shop' | 'spawning' | 'starter'
            parentNames: parentNames || null
        });
        if (state.fishCreationLog.length > 200) state.fishCreationLog = state.fishCreationLog.slice(-200);
    }

    /**
     * Add a notification to the current day's log.
     */
    function addNotification(message) {
        state.notifications.push({
            day: state.day,
            message: message,
            timestamp: Date.now()
        });
    }

    return {
        init: init,
        getState: getState,
        setState: setState,
        saveToStorage: saveToStorage,
        loadFromStorage: loadFromStorage,
        resetGame: resetGame,
        nextDay: nextDay,
        spendMoney: spendMoney,
        addMoney: addMoney,
        addReputation: addReputation,
        addOwnedLake: addOwnedLake,
        setActiveLake: setActiveLake,
        addNotification: addNotification,
        addEvent: addEvent,
        logFishCreation: logFishCreation,
        DEFAULT_STATE: DEFAULT_STATE
    };
})();
