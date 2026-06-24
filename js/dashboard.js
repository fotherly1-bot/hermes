/**
 * Carp Fishing Tycoon - Dashboard System
 * Charts, quests with progress tracking, and notification/disaster board.
 */

'use strict';

const Dashboard = (function () {
    /**
     * Quest definitions with progress tracking.
     */
    const QUESTS = [
        {
            id: 'breed_rare',
            title: 'Master Breeder',
            description: 'Breed a Rare (or higher) rarity fish.',
            reward: { money: 5000, reputation: 5 },
            checkProgress: function (state) {
                var rareFish = state.fish.filter(function (f) {
                    return f.alive && f.parent_ids.length > 0 &&
                        (f.rarity === 'rare' || f.rarity === 'epic' || f.rarity === 'legendary' || f.rarity === 'mythic');
                });
                return { current: Math.min(1, rareFish.length), target: 1 };
            }
        },
        {
            id: 'reputation_50',
            title: 'Rising Star',
            description: 'Reach 200 reputation.',
            reward: { money: 10000, reputation: 0 },
            checkProgress: function (state) {
                return { current: Math.min(200, state.reputation), target: 200 };
            }
        },
        {
            id: 'own_3_lakes',
            title: 'Lake Baron',
            description: 'Own 3 lakes.',
            reward: { money: 15000, reputation: 5 },
            checkProgress: function (state) {
                return { current: Math.min(3, state.ownedLakes.length), target: 3 };
            }
        },
        {
            id: 'fish_over_40lb',
            title: 'Monster Hunter',
            description: 'Have a fish weighing over 40 lb.',
            reward: { money: 8000, reputation: 10 },
            checkProgress: function (state) {
                var heavyFish = state.fish.filter(function (f) {
                    return f.alive && f.weight_oz >= 640; // 40lb = 640oz
                });
                return { current: Math.min(1, heavyFish.length), target: 1 };
            }
        },
        {
            id: 'fully_upgrade_lake',
            title: 'Top Facility',
            description: 'Fully upgrade a lake with all available upgrades.',
            reward: { money: 20000, reputation: 10 },
            checkProgress: function (state) {
                if (!state.lakeUpgrades) return { current: 0, target: 6 };
                var totalUpgrades = typeof Shop !== 'undefined' ? Shop.getAllUpgrades().length : 6;
                var maxOwned = 0;
                Object.keys(state.lakeUpgrades).forEach(function (lakeId) {
                    if (state.lakeUpgrades[lakeId].length > maxOwned) {
                        maxOwned = state.lakeUpgrades[lakeId].length;
                    }
                });
                return { current: Math.min(totalUpgrades, maxOwned), target: totalUpgrades };
            }
        },
        {
            id: 'earn_100k',
            title: 'Big Earner',
            description: 'Earn a total of \u00A3100,000.',
            reward: { money: 5000, reputation: 3 },
            checkProgress: function (state) {
                return { current: Math.min(100000, state.totalEarnings), target: 100000 };
            }
        },
        {
            id: 'stock_20_fish',
            title: 'Fish Collector',
            description: 'Have 20 living fish across all lakes.',
            reward: { money: 3000, reputation: 5 },
            checkProgress: function (state) {
                var aliveCount = state.fish.filter(function (f) { return f.alive; }).length;
                return { current: Math.min(20, aliveCount), target: 20 };
            }
        },
        {
            id: 'legendary_fish',
            title: 'Legendary Discovery',
            description: 'Own a Legendary rarity fish.',
            reward: { money: 25000, reputation: 15 },
            checkProgress: function (state) {
                var legendaryFish = state.fish.filter(function (f) {
                    return f.alive && (f.rarity === 'legendary' || f.rarity === 'mythic');
                });
                return { current: Math.min(1, legendaryFish.length), target: 1 };
            }
        },
        {
            id: 'marketing_maestro',
            title: 'Marketing Maestro',
            description: 'Launch 3 marketing campaigns.',
            reward: { money: 4000, reputation: 5 },
            checkProgress: function (state) {
                var campaigns = state.marketingCampaigns || [];
                return { current: Math.min(3, campaigns.length), target: 3 };
            }
        },
        {
            id: 'loan_boss',
            title: 'Loan Boss',
            description: 'Take out a business loan.',
            reward: { money: 5000, reputation: 3 },
            checkProgress: function (state) {
                var loans = state.loans || [];
                return { current: Math.min(1, loans.length), target: 1 };
            }
        },
        {
            id: 'experienced_angler',
            title: 'Seasoned Host',
            description: 'Complete 10 angler bookings.',
            reward: { money: 7000, reputation: 8 },
            checkProgress: function (state) {
                var completed = state.anglerBookings ? state.anglerBookings.length : 0;
                return { current: Math.min(10, completed), target: 10 };
            }
        },
        {
            id: 'breeder_pro',
            title: 'Breeding Expert',
            description: 'Breed 5 fish.',
            reward: { money: 6000, reputation: 6 },
            checkProgress: function (state) {
                var bredFish = state.fish.filter(function (f) {
                    return f.alive && f.parent_ids && f.parent_ids.length > 0;
                });
                return { current: Math.min(5, bredFish.length), target: 5 };
            }
        },
        {
            id: 'breed_25',
            title: 'Brood Builder',
            description: 'Breed 25 fish.',
            reward: { money: 4000, reputation: 3 },
            checkProgress: function (state) {
                var count = state.fish.filter(function (f) {
                    return f.alive && f.parent_ids && f.parent_ids.length > 0;
                }).length;
                return { current: Math.min(25, count), target: 25 };
            }
        },
        {
            id: 'breed_100',
            title: 'Century Brood',
            description: 'Breed 100 fish.',
            reward: { money: 8000, reputation: 5 },
            checkProgress: function (state) {
                var count = state.fish.filter(function (f) {
                    return f.alive && f.parent_ids && f.parent_ids.length > 0;
                }).length;
                return { current: Math.min(100, count), target: 100 };
            }
        },
        {
            id: 'breed_250',
            title: 'Hatchery Accelerator',
            description: 'Breed 250 fish.',
            reward: { money: 14000, reputation: 8 },
            checkProgress: function (state) {
                var count = state.fish.filter(function (f) {
                    return f.alive && f.parent_ids && f.parent_ids.length > 0;
                }).length;
                return { current: Math.min(250, count), target: 250 };
            }
        },
        {
            id: 'breed_600',
            title: 'Production Line',
            description: 'Breed 600 fish.',
            reward: { money: 25000, reputation: 12 },
            checkProgress: function (state) {
                var count = state.fish.filter(function (f) {
                    return f.alive && f.parent_ids && f.parent_ids.length > 0;
                }).length;
                return { current: Math.min(600, count), target: 600 };
            }
        },
        {
            id: 'breed_1200',
            title: 'Industrial Breeder',
            description: 'Breed 1,200 fish.',
            reward: { money: 50000, reputation: 18 },
            checkProgress: function (state) {
                var count = state.fish.filter(function (f) {
                    return f.alive && f.parent_ids && f.parent_ids.length > 0;
                }).length;
                return { current: Math.min(1200, count), target: 1200 };
            }
        },
        {
            id: 'breed_2000',
            title: 'Breeding Titan',
            description: 'Breed 2,000 fish.',
            reward: { money: 80000, reputation: 25 },
            checkProgress: function (state) {
                var count = state.fish.filter(function (f) {
                    return f.alive && f.parent_ids && f.parent_ids.length > 0;
                }).length;
                return { current: Math.min(2000, count), target: 2000 };
            }
        },
        {
            id: 'breed_500',
            title: 'Hatchery Legend',
            description: 'Breed 500 fish.',
            reward: { money: 45000, reputation: 25 },
            checkProgress: function (state) {
                var count = state.fish.filter(function (f) {
                    return f.alive && f.parent_ids && f.parent_ids.length > 0;
                }).length;
                return { current: Math.min(500, count), target: 500 };
            }
        },
        {
            id: 'lake_magnate',
            title: 'Lake Magnate',
            description: 'Own 5 lakes.',
            reward: { money: 30000, reputation: 10 },
            checkProgress: function (state) {
                return { current: Math.min(5, state.ownedLakes.length), target: 5 };
            }
        },
        {
            id: 'reputation_master',
            title: 'Renowned Fishery',
            description: 'Reach 500 reputation.',
            reward: { money: 10000, reputation: 0 },
            checkProgress: function (state) {
                return { current: Math.min(500, state.reputation), target: 500 };
            }
        },
        {
            id: 'big_spender',
            title: 'High Roller',
            description: 'Spend £50,000 across all operations.',
            reward: { money: 8000, reputation: 5 },
            checkProgress: function (state) {
                return { current: Math.min(50000, state.totalSpent), target: 50000 };
            }
        },
        {
            id: 'wealthy_angler',
            title: 'Wealthy Operator',
            description: 'Have £100,000 cash on hand.',
            reward: { money: 15000, reputation: 8 },
            checkProgress: function (state) {
                return { current: Math.min(100000, state.money), target: 100000 };
            }
        },
        {
            id: 'bank_millionaire',
            title: 'First Million',
            description: 'Have £1,000,000 cash on hand.',
            reward: { money: 25000, reputation: 10 },
            checkProgress: function (state) {
                return { current: Math.min(1000000, state.money), target: 1000000 };
            }
        },
        {
            id: 'bank_millionaire_2',
            title: 'Two Million Strong',
            description: 'Have £2,000,000 cash on hand.',
            reward: { money: 50000, reputation: 15 },
            checkProgress: function (state) {
                return { current: Math.min(2000000, state.money), target: 2000000 };
            }
        },
        {
            id: 'bank_millionaire_3',
            title: 'Triple Figures',
            description: 'Have £3,000,000 cash on hand.',
            reward: { money: 75000, reputation: 15 },
            checkProgress: function (state) {
                return { current: Math.min(3000000, state.money), target: 3000000 };
            }
        },
        {
            id: 'bank_millionaire_4',
            title: 'Four Million Club',
            description: 'Have £4,000,000 cash on hand.',
            reward: { money: 100000, reputation: 20 },
            checkProgress: function (state) {
                return { current: Math.min(4000000, state.money), target: 4000000 };
            }
        },
        {
            id: 'bank_millionaire_5',
            title: 'Five Million Fortune',
            description: 'Have £5,000,000 cash on hand.',
            reward: { money: 150000, reputation: 25 },
            checkProgress: function (state) {
                return { current: Math.min(5000000, state.money), target: 5000000 };
            }
        },
        {
            id: 'weight_champion',
            title: 'Heavyweight Breeder',
            description: 'Breed a fish weighing at least 50 lb (800 oz).',
            reward: { money: 20000, reputation: 12 },
            checkProgress: function (state) {
                var heavyBred = state.fish.filter(function (f) {
                    return f.alive && f.parent_ids && f.parent_ids.length > 0 && f.weight_oz >= 800;
                });
                return { current: Math.min(1, heavyBred.length), target: 1 };
            }
        },
        {
            id: 'lake_value_pro',
            title: 'Prime Portfolio',
            description: 'Own lakes worth a total of £500,000 or more.',
            reward: { money: 20000, reputation: 10 },
            checkProgress: function (state) {
                var total = (state.ownedLakes || []).reduce(function (s, id) {
                    var lake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(id) : null;
                    return s + (lake ? lake.price : 0);
                }, 0);
                return { current: Math.min(500000, total), target: 500000 };
            }
        },
        {
            id: 'lake_value_king',
            title: 'Property Tycoon',
            description: 'Own lakes worth a total of £2,000,000 or more.',
            reward: { money: 50000, reputation: 20 },
            checkProgress: function (state) {
                var total = (state.ownedLakes || []).reduce(function (s, id) {
                    var lake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(id) : null;
                    return s + (lake ? lake.price : 0);
                }, 0);
                return { current: Math.min(2000000, total), target: 2000000 };
            }
        },
        {
            id: 'endgame_bank_10m',
            title: 'Fishery Tycoon',
            description: 'Have £10,000,000 cash on hand.',
            reward: { money: 200000, reputation: 30 },
            checkProgress: function (state) {
                return { current: Math.min(10000000, state.money), target: 10000000 };
            }
        },
        {
            id: 'endgame_bank_25m',
            title: 'Carp Empire',
            description: 'Have £25,000,000 cash on hand.',
            reward: { money: 500000, reputation: 50 },
            checkProgress: function (state) {
                return { current: Math.min(25000000, state.money), target: 25000000 };
            }
        },
        {
            id: 'endgame_breed_1000',
            title: 'Hatchery Emperor',
            description: 'Breed 1,000 fish.',
            reward: { money: 100000, reputation: 40 },
            checkProgress: function (state) {
                var count = state.fish.filter(function (f) {
                    return f.alive && f.parent_ids && f.parent_ids.length > 0;
                }).length;
                return { current: Math.min(1000, count), target: 1000 };
            }
        },
        {
            id: 'endgame_lake_value_10m',
            title: 'Property Emperor',
            description: 'Own lakes worth a total of £10,000,000 or more.',
            reward: { money: 250000, reputation: 40 },
            checkProgress: function (state) {
                var total = (state.ownedLakes || []).reduce(function (s, id) {
                    var lake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(id) : null;
                    return s + (lake ? lake.price : 0);
                }, 0);
                return { current: Math.min(10000000, total), target: 10000000 };
            }
        },
        {
            id: 'endgame_reputation_1000',
            title: 'Living Legend',
            description: 'Reach 1,000 reputation.',
            reward: { money: 150000, reputation: 0 },
            checkProgress: function (state) {
                return { current: Math.min(1000, state.reputation), target: 1000 };
            }
        },
        {
            id: 'endgame_angler_50',
            title: 'Legendary Guide',
            description: 'Complete 50 angler bookings.',
            reward: { money: 80000, reputation: 25 },
            checkProgress: function (state) {
                var completed = state.anglerBookings ? state.anglerBookings.length : 0;
                return { current: Math.min(50, completed), target: 50 };
            }
        },
        {
            id: 'endgame_stock_100',
            title: 'Fishery Colossus',
            description: 'Have 100 living fish at once across all lakes.',
            reward: { money: 50000, reputation: 20 },
            checkProgress: function (state) {
                var count = state.fish.filter(function (f) { return f.alive; }).length;
                return { current: Math.min(100, count), target: 100 };
            }
        },
        {
            id: 'endgame_spend_1m',
            title: 'Corporate Spender',
            description: 'Spend £1,000,000 across all operations.',
            reward: { money: 100000, reputation: 25 },
            checkProgress: function (state) {
                return { current: Math.min(1000000, state.totalSpent), target: 1000000 };
            }
        },
        {
            id: 'endgame_networth_20m',
            title: 'Carp Dynasty',
            description: 'Reach a total net worth of £20,000,000 including lakes and assets.',
            reward: { money: 300000, reputation: 50 },
            checkProgress: function (state) {
                var fisheryVal = typeof Finance !== 'undefined' ? Finance.getFisheryValue() : 0;
                var netWorth = state.money + fisheryVal;
                return { current: Math.min(20000000, netWorth), target: 20000000 };
            }
        }
    ];

    /**
     * Initialise quest tracking state.
     */
    function initState() {
        var state = Game.getState();
        if (!state.completedQuests) state.completedQuests = [];
        if (!state.disasterLog) state.disasterLog = [];
        if (!state.incomeHistory) state.incomeHistory = [];
    }

    /**
     * Check quest completion and award rewards.
     */
    function checkQuests() {
        initState();
        var state = Game.getState();

        QUESTS.forEach(function (quest) {
            // Skip already completed quests
            if (state.completedQuests.indexOf(quest.id) !== -1) return;

            var progress = quest.checkProgress(state);
            if (progress.current >= progress.target) {
                // Quest completed!
                state.completedQuests.push(quest.id);

                // Award rewards
                if (quest.reward.money > 0) {
                    state.money += quest.reward.money;
                    state.totalEarnings += quest.reward.money;
                    if (typeof Finance !== 'undefined') {
                        Finance.addFinanceLog('quest_reward', quest.reward.money,
                            'Quest reward: ' + quest.title);
                    }
                }
                if (quest.reward.reputation > 0) {
                    state.reputation = Math.min(100, state.reputation + quest.reward.reputation);
                }

                Game.addNotification('&#x1F3C6; Quest Complete: "' + quest.title + '"! Reward: ' +
                    (quest.reward.money > 0 ? UI.formatMoney(quest.reward.money) : '') +
                    (quest.reward.reputation > 0 ? ' +' + quest.reward.reputation + ' rep' : ''));
                UI.showToast('Quest completed: ' + quest.title + '!', 'success');
            }
        });
    }

    /**
     * Render the full dashboard panel — complete restructure.
     * Layout: KPI strip → 3-col row → 2-col rows
     */
    /** Sub-tab state for the dashboard panel. */
    var _dashTab = 'overview';
    var _financeTab = 'daily'; // 'daily' | 'totals'

    function showDashTab(tab) {
        _dashTab = tab;
        renderDashboard();
    }

    function showFinanceTab(tab) {
        _financeTab = tab;
        renderDashboard();
    }

    function renderDashboard() {
        initState();
        var state     = Game.getState();
        var container = document.getElementById('panel-dashboard');

        var html = '<h2>Dashboard</h2>';

        // Sub-tab switcher
        html += '<div class="dash-subtabs">';
        html += '<button class="dash-subtab' + (_dashTab === 'overview' ? ' dash-subtab-active' : '') +
                '" onclick="Dashboard.showDashTab(\'overview\')">Overview</button>';
        html += '<button class="dash-subtab' + (_dashTab === 'quests' ? ' dash-subtab-active' : '') +
                '" onclick="Dashboard.showDashTab(\'quests\')">\uD83C\uDFC6 Quests</button>';
        html += '<button class="dash-subtab' + (_dashTab === 'fish' ? ' dash-subtab-active' : '') +
                '" onclick="Dashboard.showDashTab(\'fish\')">\uD83D\uDC1F Fish Tracker</button>';
        html += '</div>';

        if (_dashTab === 'fish') {
            html += renderFishTracker(state);
            container.innerHTML = html;
            return;
        }

        if (_dashTab === 'quests') {
            html += renderInfoTab(state);
            container.innerHTML = html;
            return;
        }

        // ── Row 0: Your Angler ───────────────────────────────────────────────────
        html += '<div class="dash-row">';
        html += '<div class="dashboard-card" style="text-align:center;">' + renderYourAnglerCard(state) + '</div>';
        html += '</div>';

        // ── Row 1: Fishery Pulse ─────────────────────────────────────────────────
        html += '<div class="dash-row">';
        html += '<div class="dashboard-card">' + renderFisheryPulse(state) + '</div>';
        html += '</div>';

        // ── Row 2: Biggest Fish | Rarest Fish ─────────────────────────────────────
        html += '<div class="dash-row dash-row-2">';
        var aliveFish = state.fish.filter(function(f){ return f.alive; });
        if (aliveFish.length > 0) {
            html += '<div class="dashboard-card dash-feature-fish-card">' + renderBiggestFishCard(state) + '</div>';
            html += '<div class="dashboard-card dash-feature-fish-card">' + renderRarestFishCard(state) + '</div>';
        } else {
            html += '<div class="dashboard-card">' + renderTodayActivity(state) + '</div>';
            html += '<div class="dashboard-card">' + renderFinanceSnapshot(state) + '</div>';
        }
        html += '</div>';

        // ── Row 3: Progression (spans left+middle) | Weather ────────────────────────
        html += '<div class="dash-row dash-row-2">';
        html += '<div class="dashboard-card dash-progression-wide">' + renderProgressionCard(state) + '</div>';
        html += '<div class="dashboard-card">' + renderWeatherCard(state) + '</div>';
        html += '</div>';

        // ── Row 3: Active Card Buffs (always shown) ──────────────────────────
        var activeBuffs = (state.activeCardBuffs || []).filter(function(b){ return b.endDay >= state.day; });
        html += '<div class="dashboard-card" style="margin-top:1rem;">';
        html += '<h3>\uD83C\uDCCF Active Card Buffs</h3>';
        if (activeBuffs.length === 0) {
            html += '<p class="empty-state">No buffs active. Open card packs in the <strong>Shop</strong> to find buff cards.</p>';
        } else {
            html += '<div class="dash-buff-grid">';
            activeBuffs.forEach(function(b){
                var daysLeft = b.endDay - state.day + 1;
                var pct      = Math.max(5, Math.round((daysLeft / (b.endDay - b.startDay + 1)) * 100));
                html += '<div class="dash-buff-card" style="border-left:3px solid ' + b.colour + ';">';
                html += '<div class="dash-buff-top">';
                html += '<span class="dash-buff-name" style="color:' + b.colour + ';">' + b.name + '</span>';
                html += '<span class="dash-buff-timer">' + daysLeft + ' day' + (daysLeft !== 1 ? 's' : '') + ' left</span>';
                html += '</div>';
                html += '<div class="dash-buff-bar-track"><div class="dash-buff-bar-fill" style="width:' + pct + '%;background:' + b.colour + ';"></div></div>';
                html += '</div>';
            });
            html += '</div>';
        }
        html += '</div>';

        // ── Row 4: Activity & Notifications ──────────────────────────────────
        html += '<div class="dashboard-card" style="margin-top:1rem;">';
        html += '<h3>Activity &amp; Notifications</h3>';
        html += renderNotificationBoard(state);
        html += '</div>';

        container.innerHTML = html;
    }

    // ── Stat Bar (replaces pill KPI strip) ───────────────────────────────────

    function renderKPIStrip(state) {
        var netProfit     = state.totalEarnings - state.totalSpent;
        var debt          = typeof Finance !== 'undefined' ? Finance.getOutstandingDebt() : 0;
        var staffCount    = state.hiredStaff ? state.hiredStaff.length : 0;
        var staffWages    = state.hiredStaff ? state.hiredStaff.reduce(function (s, m) { return s + m.salary; }, 0) : 0;
        var activeAnglers = (state.anglerBookings || []).filter(function (b) {
            return state.day >= b.startDay && state.day <= b.endDay;
        }).length;
        var totalFish  = state.fish.filter(function (f) { return f.alive; }).length;
        var campaigns  = (state.marketingCampaigns || []).filter(function (c) { return c.endDay >= state.day; }).length;
        var pending    = (state.pendingBookings || []).length;
        var stockValue = typeof Fish !== 'undefined' ? Fish.getTotalStockValue(state.fish) : 0;
        var fisheryVal = typeof Finance !== 'undefined' ? Finance.getFisheryValue() : 0;
        var netWorth   = state.money + fisheryVal;
        var equitySold = typeof Finance !== 'undefined' ? Finance.getTotalEquitySold() : 0;
        var dividends  = state.dividendsPaid || 0;
        var dailyInvest = typeof Lakes !== 'undefined'
            ? (state.ownedLakes || []).reduce(function (s, id) {
                return s + Lakes.getLakeMaintenanceDailyCost(id);
              }, 0) : 0;

        var stats = [
            { label: 'Balance',       value: UI.formatMoney(state.money),
              colour: 'var(--colour-gold)' },
            { label: 'Net P\u0026L',  value: (netProfit >= 0 ? '+' : '') + UI.formatMoney(netProfit),
              colour: netProfit >= 0 ? 'var(--colour-accent)' : 'var(--colour-danger)' },
            { label: 'Date',          value: (typeof UI !== 'undefined' && UI.formatGameDate) ? UI.formatGameDate(state.day) : 'Day\u00A0' + state.day,
              colour: 'var(--colour-text-muted)' },
            { label: 'Fish',          value: totalFish,
              colour: '#9b59b6' },
            { label: 'Net Worth',     value: UI.formatMoney(netWorth),
              colour: 'var(--colour-gold)' },
            { label: 'Equity Sold',   value: equitySold > 0 ? equitySold + '%' : 'None',
              colour: equitySold > 0 ? '#e67e22' : 'var(--colour-text-muted)' },
            { label: 'Anglers On-Site', value: activeAnglers,
              colour: activeAnglers > 0 ? 'var(--colour-accent)' : 'var(--colour-text-muted)' },
            { label: 'Staff',         value: staffCount + '\u00A0(\u00A3' + staffWages + '/d)',
              colour: '#3498db' },
            { label: 'Debt',          value: debt > 0 ? UI.formatMoney(debt) : 'None',
              colour: debt > 0 ? 'var(--colour-danger)' : 'var(--colour-text-muted)' },
            { label: 'Campaigns',     value: campaigns > 0 ? campaigns + ' active' : 'None',
              colour: campaigns > 0 ? '#8e44ad' : 'var(--colour-text-muted)' },
            { label: 'Pending',       value: pending + (pending === 1 ? ' booking' : ' bookings'),
              colour: pending > 0 ? 'var(--colour-gold)' : 'var(--colour-text-muted)' },
            { label: 'Lake Invest',   value: dailyInvest > 0 ? UI.formatMoney(dailyInvest) + '/d' : 'None',
              colour: dailyInvest > 0 ? '#16a085' : 'var(--colour-text-muted)' }
        ];

        var html = '<div class="dash-stat-bar">';
        stats.forEach(function (s, i) {
            html += '<div class="dash-stat-item">';
            html += '<span class="dash-stat-label">' + s.label + '</span>';
            html += '<span class="dash-stat-value" style="color:' + s.colour + ';">' + s.value + '</span>';
            html += '</div>';
            if (i < stats.length - 1) html += '<div class="dash-stat-sep"></div>';
        });
        html += '</div>';
        return html;
    }

    // ── Overview card ─────────────────────────────────────────────────────────

    function renderOverviewCard(state) {
        var dayOfYear = typeof Weather !== 'undefined' ? Weather.getDayOfYear(state.day) : ((state.day - 1) % 365 + 1);
        var season    = typeof Weather !== 'undefined' ? Weather.getSeason(dayOfYear)    : 'spring';
        var seasonLabels = { spring: '\uD83C\uDF31 Spring', summer: '\u2600\uFE0F Summer',
                             autumn: '\uD83C\uDF42 Autumn', winter: '\u2744\uFE0F Winter' };

        var html = '<h3>Overview</h3>';

        html += '<div class="dash-overview-meta">';
        html += '<span>Day <strong>' + state.day + '</strong></span>';
        html += '<span>' + (seasonLabels[season] || season) + '</span>';
        html += '<span>Year <strong>' + Math.ceil(state.day / 365) + '</strong></span>';
        html += '</div>';

        // Reputation progress to next milestone
        var milestones  = [100, 200, 350, 500, 650, 800, 900, 1000];
        var nextMilestone = milestones.find(function (m) { return m > state.reputation; }) || 100;
        var prevMilestone = milestones.slice().reverse().find(function (m) { return m <= state.reputation; }) || 0;
        var segPct = nextMilestone === prevMilestone ? 100
            : Math.round(((state.reputation - prevMilestone) / (nextMilestone - prevMilestone)) * 100);

        html += '<div class="dash-rep-section">';
        html += '<div class="dash-rep-header">';
        html += '<span>Reputation <strong>' + state.reputation.toLocaleString('en-GB') + '</strong></span>';
        html += '<span style="font-size:0.72rem;color:var(--colour-text-muted);">Next unlock at <strong>' + nextMilestone.toLocaleString('en-GB') + '</strong></span>';        html += '</div>';
        html += '<div class="rep-bar-track" style="height:10px;">';
        html += '<div class="rep-bar-fill" style="width:' + (state.reputation / 10) + '%;"></div>';
        html += '</div>';
        html += '</div>';

        // Lakes status list
        if (state.ownedLakes.length > 0) {
            html += '<h4 class="dash-section-subheading">Lakes</h4>';
            html += '<div class="dash-lake-list">';
            state.ownedLakes.forEach(function (lakeId) {
                var lake    = typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
                if (!lake) return;
                var isClosed    = state.lakeClosures && state.lakeClosures[lakeId] && state.lakeClosures[lakeId] >= state.day;
                var fishCount   = state.fish.filter(function (f) { return f.alive && f.lake_id === lakeId; }).length;
                var anglerCount = (state.anglerBookings || []).filter(function (b) {
                    return b.lakeId === lakeId && state.day >= b.startDay && state.day <= b.endDay;
                }).length;
                var dotClass = isClosed ? 'dot-closed' : (anglerCount > 0 ? 'dot-busy' : 'dot-open');
                var maintCost = typeof Lakes !== 'undefined' ? Lakes.getLakeMaintenanceDailyCost(lakeId) : 0;
                var investColour = maintCost >= 300 ? 'var(--colour-accent)' : maintCost > 0 ? 'var(--colour-gold)' : 'transparent';

                html += '<div class="dash-lake-row">';
                html += '<span class="dash-dot ' + dotClass + '"></span>';
                html += '<span class="dash-lake-name">' + lake.name + '</span>';
                html += '<span class="dash-lake-meta">';
                html += fishCount + ' fish';
                if (anglerCount > 0) html += ' \u00B7 ' + anglerCount + ' \uD83C\uDFA3';
                if (maintCost > 0) html += ' \u00B7 <span style="color:' + investColour + ';">\uD83D\uDCCA ' + UI.formatMoney(maintCost) + '/d</span>';
                if (isClosed) html += ' \u00B7 <span style="color:var(--colour-danger);">Closed</span>';
                html += '</span>';
                html += '</div>';
            });
            html += '</div>';
        } else {
            html += '<p class="empty-state">No lakes yet. <span class="dash-link" onclick="UI.switchTab(\'lakes\')">Buy your first lake</span></p>';
        }

        // Breeding status badge
        if (state.breedingActive) {
            html += '<div class="dash-badge dash-badge-accent">\uD83E\uDD5A Breeding \u2014 ' +
                state.breedingTimer + ' day' + (state.breedingTimer === 1 ? '' : 's') + ' left</div>';
        } else if (state.breedingPond && state.breedingPond.length === 2) {
            html += '<div class="dash-badge dash-badge-gold">\u2728 Breeding pond ready</div>';
        }

        return html;
    }

    // ── Fishery Pulse card (replaces Quests in Row 1) ───────────────────────────
    function renderFisheryPulse(state) {
        var alive      = state.fish.filter(function(f){ return f.alive; });
        var totalFish  = alive.length;
        var totalValue = typeof Fish !== 'undefined' ? Fish.getTotalStockValue(alive) : 0;
        var avgHealth  = totalFish > 0 ? Math.round(alive.reduce(function(s,f){ return s + (f.stats?.health || 0); }, 0) / totalFish) : 0;
        var breedable  = alive.filter(function(f){ return f.weight_oz > 160 && (!f.lastBreedYear || f.lastBreedYear < Math.ceil(state.day/365)); }).length;
        var deadCount  = state.fish.filter(function(f){ return !f.alive; }).length;
        var staffCount = state.hiredStaff?.length || 0;
        var lakeCount  = state.ownedLakes?.length || 0;
        var rep        = state.reputation || 0;
        var money      = state.money || 0;
        var debt       = typeof Finance !== 'undefined' ? Finance.getOutstandingDebt() : 0;

        // Next events
        var nextEvent = '';
        if (state.breedingActive) nextEvent = '\uD83E\uDD5A Breeding completes in ' + state.breedingTimer + ' day' + (state.breedingTimer===1?'':'s');
        else if (state.breedingPond && state.breedingPond.length === 2) nextEvent = '\u2728 Breeding pond ready \u2014 click to start';
        else if (state.activeTournament) nextEvent = '\uD83C\uDFC6 ' + state.activeTournament.name + ' ends in ' + (state.activeTournament.endDay - state.day + 1) + 'd';
        else if (state.tournamentSeason && state.tournamentSeasonDay > 0) nextEvent = '\uD83C\uDFC6 Season ' + state.tournamentSeason + ' day ' + state.tournamentSeasonDay;

        var html = '<h3>\uD83D\uDCC8 Fishery Pulse</h3>';

        // Top metric row
        html += '<div class="dash-pulse-grid">';
        html += '<div class="dash-pulse-item"><span class="dash-pulse-val" style="color:var(--colour-gold);">' + UI.formatMoney(money) + '</span><span class="dash-pulse-label">Cash</span></div>';
        html += '<div class="dash-pulse-item"><span class="dash-pulse-val" style="color:var(--colour-accent);">' + totalFish + '</span><span class="dash-pulse-label">Living Fish</span></div>';
        html += '<div class="dash-pulse-item"><span class="dash-pulse-val" style="color:#f1c40f;">' + UI.formatMoney(totalValue) + '</span><span class="dash-pulse-label">Stock Value</span></div>';
        html += '<div class="dash-pulse-item"><span class="dash-pulse-val" style="color:var(--colour-text);">' + rep.toLocaleString() + '</span><span class="dash-pulse-label">Reputation</span></div>';
        html += '<div class="dash-pulse-item"><span class="dash-pulse-val" style="color:#e74c3c;">' + (debt > 0 ? UI.formatMoney(debt) : 'None') + '</span><span class="dash-pulse-label">Debt</span></div>';
        html += '<div class="dash-pulse-item"><span class="dash-pulse-val" style="color:#3498db;">' + staffCount + '</span><span class="dash-pulse-label">Staff</span></div>';
        html += '</div>';

        // Secondary metrics
        html += '<div class="dash-pulse-grid" style="margin-top:0.5rem;">';
        html += '<div class="dash-pulse-item"><span class="dash-pulse-val" style="color:#9b59b6;">' + breedable + '</span><span class="dash-pulse-label">Breedable</span></div>';
        html += '<div class="dash-pulse-item"><span class="dash-pulse-val" style="color:#e67e22;">' + deadCount + '</span><span class="dash-pulse-label">Deceased</span></div>';
        html += '<div class="dash-pulse-item"><span class="dash-pulse-val" style="color:#2ecc71;">' + avgHealth + '</span><span class="dash-pulse-label">Avg Health</span></div>';
        html += '<div class="dash-pulse-item"><span class="dash-pulse-val" style="color:#1abc9c;">' + lakeCount + '</span><span class="dash-pulse-label">Lakes</span></div>';
        html += '</div>';

        // Next event highlight
        if (nextEvent) {
            html += '<div class="dash-pulse-next" style="margin-top:0.75rem;padding:0.75rem;background:rgba(46,204,113,0.1);border:1px solid var(--colour-accent);border-radius:8px;">';
            html += '<span style="font-weight:600;color:var(--colour-accent);">Next: </span>' + nextEvent;
            html += '</div>';
        }

        // Quick action links
        html += '<div class="dash-pulse-actions" style="margin-top:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap;">';
        if (lakeCount === 0) {
            html += '<span class="dash-link" onclick="UI.switchTab(\'lakes\')">\uD83C\uDF89 Buy your first lake</span>';
        } else {
            if (breedable >= 2 && !state.breedingActive) html += '<span class="dash-link" onclick="UI.switchTab(\'breeding\')">\uD83E\uDD5A Start breeding</span>';
            if (state.activeTournament && !state.tournamentEntryPaid) html += '<span class="dash-link" onclick="Anglers.showAnglerView(\'tournaments\')">\uD83C\uDFC6 Enter tournament</span>';
            if (staffCount < 7) html += '<span class="dash-link" onclick="UI.switchTab(\'staff\')">\uD83D\uDC64 Hire staff</span>';
            html += '<span class="dash-link" onclick="UI.switchTab(\'quests\')">\uD83C\uDFC6 View quests</span>';
        }
        html += '</div>';

        return html;
    }

    // ── Progression & Milestones card ───────────────────────────────────────────
    function renderProgressionCard(state) {
        var alive      = state.fish.filter(function(f){ return f.alive; });
        var totalFish  = alive.length;
        var totalValue = typeof Fish !== 'undefined' ? Fish.getTotalStockValue(alive) : 0;
        var lakesOwned = state.ownedLakes?.length || 0;
        var staffCount = state.hiredStaff?.length || 0;
        var rep        = state.reputation || 0;
        var money      = state.money || 0;
        var debt       = typeof Finance !== 'undefined' ? Finance.getOutstandingDebt() : 0;
        var netWorth   = typeof Finance !== 'undefined' ? Finance.getFisheryValue() : 0;
        var bredCount  = state.fish.filter(function(f){ return f.parent_ids && f.parent_ids.length > 0; }).length;
        var questsDone = state.completedQuests?.length || 0;

        // Define milestones
        var milestones = [
            { id: 'first_lake',       label: 'Own 1 Lake',         progress: Math.min(lakesOwned, 1),    target: 1,   icon: '🏞️', colour: '#2ecc71', link: "'lakes'" },
            { id: 'ten_lakes',        label: 'Own 5 Lakes',        progress: Math.min(lakesOwned, 5),    target: 5,   icon: '🏞️🏞️🏞️🏞️🏞️', colour: '#27ae60', link: "'lakes'" },
            { id: 'all_lakes',        label: 'Own All 14 Lakes',   progress: Math.min(lakesOwned, 14),   target: 14,  icon: '🌍', colour: '#1abc9c', link: "'lakes'" },
            { id: 'first_breed',      label: 'First Breed',        progress: Math.min(bredCount, 1),     target: 1,   icon: '🧬', colour: '#e74c3c', link: "'breeding'" },
            { id: 'master_breeder',   label: 'Breed 10 Fish',      progress: Math.min(bredCount, 10),    target: 10,  icon: '🧬🧬', colour: '#c0392b', link: "'breeding'" },
            { id: 'staff_full',       label: 'Full Staff (7/7)',   progress: Math.min(staffCount, 7),    target: 7,   icon: '👥', colour: '#3498db', link: "'staff'" },
            { id: 'rep_100',          label: 'Reputation 100',     progress: Math.min(rep, 100),         target: 100, icon: '⭐', colour: '#f1c40f', link: null },
            { id: 'rep_1000',         label: 'Reputation 1,000',   progress: Math.min(rep, 1000),        target: 1000,icon: '⭐⭐⭐', colour: '#f39c12', link: null },
            { id: 'cash_1m',          label: '£1M Cash',           progress: Math.min(money, 1000000),   target: 1000000, icon: '💷', colour: '#2ecc71', link: null },
            { id: 'cash_10m',         label: '£10M Cash',          progress: Math.min(money, 10000000),  target: 10000000, icon: '💷💷', colour: '#27ae60', link: null },
            { id: 'networth_5m',      label: 'Net Worth £5M',      progress: Math.min(netWorth, 5000000),target: 5000000, icon: '🏦', colour: '#9b59b6', link: null },
            { id: 'networth_25m',     label: 'Net Worth £25M',     progress: Math.min(netWorth, 25000000),target: 25000000, icon: '🏦🏦', colour: '#8e44ad', link: null },
            { id: 'quests_10',        label: 'Complete 10 Quests', progress: Math.min(questsDone, 10),   target: 10, icon: '🏆', colour: '#e67e22', link: "'quests'" },
            { id: 'debt_free',        label: 'Debt Free',          progress: debt === 0 ? 1 : 0,         target: 1,   icon: '📄', colour: '#c0392b', link: "'finance'" }
        ];

        var html = '<h3>📈 Progression & Milestones</h3>';

        // Group by category
        var groups = [
            { name: '🏞️ Lake Empire', items: milestones.filter(function(m){ return m.id.indexOf('lake') !== -1 || m.id.indexOf('all_lakes') !== -1; }) },
            { name: '🧬 Breeding Legacy', items: milestones.filter(function(m){ return m.id.indexOf('breed') !== -1; }) },
            { name: '👥 Team & Reputation', items: milestones.filter(function(m){ return m.id.indexOf('staff') !== -1 || m.id.indexOf('rep') !== -1; }) },
            { name: '💰 Wealth & Status', items: milestones.filter(function(m){ return m.id.indexOf('cash') !== -1 || m.id.indexOf('networth') !== -1 || m.id.indexOf('debt') !== -1; }) },
            { name: '🏆 Achievements', items: milestones.filter(function(m){ return m.id.indexOf('quest') !== -1; }) }
        ];

        groups.forEach(function(g) {
            html += '<div class="prog-group">';
            html += '<h4 class="prog-group-title">' + g.name + '</h4>';
            g.items.forEach(function(m) {
                var pct = Math.min(100, Math.round((m.progress / m.target) * 100));
                var isDone = m.progress >= m.target;
                var valStr = (typeof m.target === 'number' && m.target >= 1000) 
                    ? UI.formatMoney(m.progress) + ' / ' + UI.formatMoney(m.target)
                    : m.progress + ' / ' + m.target;
                var linkHtml = m.link ? ' onclick="UI.switchTab(' + m.link + ')"' : '';
                var cursor = m.link ? ' style="cursor:pointer;"' : '';
                html += '<div class="prog-row' + (isDone ? ' prog-done' : '') + '"' + cursor + linkHtml + '>';
                html += '<span class="prog-icon">' + m.icon + '</span>';
                html += '<div class="prog-info">';
                html += '<span class="prog-label">' + m.label + '</span>';
                html += '<div class="prog-bar-track"><div class="prog-bar-fill" style="width:' + pct + '%;background:' + m.colour + ';"></div></div>';
                html += '<span class="prog-val" style="color:' + (isDone ? m.colour : 'var(--colour-text-muted)') + ';">' + valStr + '</span>';
                html += '</div>';
                html += '</div>';
            });
            html += '</div>';
        });

        return html;
    }

    // ── Today's Activity card ─────────────────────────────────────────────────

    function renderTodayActivity(state) {
        var html = '<h3>Today\'s Activity</h3>';

        // Income / cost estimate
        var anglerIncome = 0;
        (state.anglerBookings || []).forEach(function (b) {
            if (state.day >= b.startDay && state.day <= b.endDay) anglerIncome += b.dailyRate;
        });
        var lakeIncome = 0;
        if (anglerIncome > 0) {
            (state.ownedLakes || []).forEach(function (lakeId) {
                var lake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
                if (!lake) return;
                var aHere = (state.anglerBookings || []).filter(function (b) {
                    return b.lakeId === lakeId && state.day >= b.startDay && state.day <= b.endDay;
                }).length;
                if (aHere > 0) lakeIncome += lake.dailyIncomePerAngler * aHere * (lake.biodiversityScore / 10);
            });
        }
        var staffCosts = (state.hiredStaff || []).reduce(function (s, m) { return s + m.salary; }, 0);
        var loanCosts  = (state.loans || []).reduce(function (s, l) {
            return s + (l.paidOff ? 0 : Math.min(l.dailyRepayment, l.totalRepayable - l.totalPaid));
        }, 0);
        var maintCosts = typeof Lakes !== 'undefined'
            ? (state.ownedLakes || []).reduce(function (s, id) {
                return s + Lakes.getLakeMaintenanceDailyCost(id);
              }, 0) : 0;
        var totalIn   = Math.round(anglerIncome + lakeIncome);
        var totalOut  = Math.round(staffCosts + loanCosts + maintCosts);
        var netToday  = totalIn - totalOut;

        html += '<div class="dash-today-box">';
        html += '<div class="dash-today-row"><span>Angler income</span><span class="dash-pos">' + UI.formatMoney(anglerIncome) + '</span></div>';
        html += '<div class="dash-today-row"><span>Lake income</span><span class="dash-pos">' + UI.formatMoney(Math.round(lakeIncome)) + '</span></div>';
        html += '<div class="dash-today-row"><span>Staff wages</span><span class="dash-neg">-' + UI.formatMoney(staffCosts) + '</span></div>';
        html += '<div class="dash-today-row"><span>Loan repayments</span><span class="dash-neg">-' + UI.formatMoney(loanCosts) + '</span></div>';
        if (maintCosts > 0) {
            html += '<div class="dash-today-row"><span>Lake maintenance</span><span class="dash-neg">-' + UI.formatMoney(maintCosts) + '</span></div>';
        }
        html += '<div class="dash-today-total"><span>Net today</span>';
        html += '<span class="' + (netToday >= 0 ? 'dash-pos' : 'dash-neg') + '">' +
                    (netToday >= 0 ? '+' : '') + UI.formatMoney(netToday) + '</span></div>';
        html += '</div>';

        // Investment effects summary (if any maintenance is active)
        if (maintCosts > 0 && typeof Lakes !== 'undefined') {
            html += '<h4 class="dash-section-subheading">\uD83D\uDCCA Active Investment Effects</h4>';
            html += '<div class="dash-invest-list">';
            state.ownedLakes.forEach(function (lkId) {
                var lkDef   = Lakes.getLakeById(lkId);
                var lkCost  = Lakes.getLakeMaintenanceDailyCost(lkId);
                if (!lkCost || !lkDef) return;

                var effects = [];
                var bioBonus  = Lakes.getLakeMaintenanceEffect(lkId, 'biodiversityBonus');
                var satBonus  = Lakes.getLakeMaintenanceEffect(lkId, 'anglerSatisfactionBonus');
                var disRed    = Lakes.getLakeMaintenanceEffect(lkId, 'disasterReduction');
                var healthB   = Lakes.getLakeMaintenanceEffect(lkId, 'fishHealthBonus');
                var bkgBonus  = Lakes.getLakeMaintenanceEffect(lkId, 'bookingBonus');
                if (bioBonus  > 0) effects.push('+' + bioBonus + ' biodiversity');
                if (satBonus  > 0) effects.push('+' + satBonus + ' satisfaction/day');
                if (disRed    > 0) effects.push('\u2212' + Math.round(disRed * 100) + '% disasters');
                if (healthB   > 0) effects.push('+' + healthB + ' fish health/day');
                if (bkgBonus  > 0) effects.push('+' + Math.round(bkgBonus * 100) + '% bookings');

                html += '<div class="dash-invest-row">';
                html += '<span class="dash-invest-lake">' + lkDef.name + '</span>';
                html += '<span class="dash-invest-cost">' + UI.formatMoney(lkCost) + '/d</span>';
                html += '<span class="dash-invest-effects">' + effects.join(' \u00B7 ') + '</span>';
                html += '</div>';
            });
            html += '</div>';
        }

        // Active anglers list
        var activeBookings = (state.anglerBookings || []).filter(function (b) {
            return state.day >= b.startDay && state.day <= b.endDay;
        });

        if (activeBookings.length > 0) {
            html += '<h4 class="dash-section-subheading">On-Site (' + activeBookings.length + ')</h4>';
            html += '<div class="dash-booking-list">';
            activeBookings.slice(0, 5).forEach(function (b) {
                var lake     = typeof Lakes !== 'undefined' ? Lakes.getLakeById(b.lakeId) : null;
                var daysLeft = b.endDay - state.day + 1;
                var satCol   = b.satisfaction >= 60 ? '#2ecc71' : (b.satisfaction >= 30 ? '#f39c12' : '#e74c3c');
                html += '<div class="dash-booking-row">';
                html += '<span class="dash-booking-name">' + b.anglerName.split(' ')[0] + '</span>';
                html += '<span class="dash-booking-lake">' + (lake ? lake.name : '\u2014') + '</span>';
                html += '<span class="dash-booking-sat" style="color:' + satCol + ';">' + b.satisfaction + '%</span>';
                html += '<span class="dash-booking-days">' + daysLeft + 'd</span>';
                html += '</div>';
            });
            if (activeBookings.length > 5) {
                html += '<p class="dash-overflow-note">+' + (activeBookings.length - 5) + ' more</p>';
            }
            html += '</div>';
        } else {
            html += '<p class="empty-state" style="font-size:0.8rem;margin:0.5rem 0;">No anglers on-site. <span class="dash-link" onclick="UI.switchTab(\'anglers\')">Accept bookings</span></p>';
        }

        // Pending requests badge
        var pending = (state.pendingBookings || []).length;
        if (pending > 0) {
            html += '<div class="dash-badge dash-badge-gold" onclick="UI.switchTab(\'anglers\')" style="cursor:pointer;">';
            html += '\uD83D\uDCCB ' + pending + ' pending request' + (pending === 1 ? '' : 's') + ' \u2014 tap to review';
            html += '</div>';
        }

        // Today's disasters
        var todayDisasters = (state.disasterLog || []).filter(function (d) { return d.day === state.day; });
        if (todayDisasters.length > 0) {
            html += '<div class="dash-badge dash-badge-danger">';
            html += '\u26A0\uFE0F ' + todayDisasters.length + ' disaster' + (todayDisasters.length === 1 ? '' : 's') + ' today!';
            html += '</div>';
        }

        return html;
    }

    // ── Finance Snapshot card ─────────────────────────────────────────────────

    function renderFinanceSnapshot(state) {
        var html = '<h3>\uD83D\uDCB0 Finance</h3>';

        html += '<div class="dash-fin-tabs">';
        html += '<button class="dash-fin-tab' + (_financeTab === 'daily'  ? ' dash-fin-tab-active' : '') + '" onclick="Dashboard.showFinanceTab(\'daily\')">\uD83D\uDCC5 Daily</button>';
        html += '<button class="dash-fin-tab' + (_financeTab === 'totals' ? ' dash-fin-tab-active' : '') + '" onclick="Dashboard.showFinanceTab(\'totals\')">\uD83D\uDCCA Totals</button>';
        html += '</div>';

        html += _financeTab === 'daily' ? renderFinanceDailyTab(state) : renderFinanceTotalsTab(state);
        return html;
    }

    function renderFinanceDailyTab(state) {
        var html = '';

        // ── Today's income ───────────────────────────────────────────────────
        var anglerIncome = 0;
        (state.anglerBookings || []).forEach(function (b) {
            if (state.day >= b.startDay && state.day <= b.endDay) anglerIncome += b.dailyRate;
        });
        var lakeIncome = 0;
        if (anglerIncome > 0) {
            (state.ownedLakes || []).forEach(function (lakeId) {
                var lake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
                if (!lake) return;
                var aHere = (state.anglerBookings || []).filter(function (b) {
                    return b.lakeId === lakeId && state.day >= b.startDay && state.day <= b.endDay;
                }).length;
                if (aHere > 0) lakeIncome += lake.dailyIncomePerAngler * aHere * (lake.biodiversityScore / 10);
            });
        }
        var staffWages = (state.hiredStaff || []).reduce(function (s, m) { return s + m.salary; }, 0);
        var loanDaily  = (state.loans || []).reduce(function (s, l) {
            return s + (l.paidOff ? 0 : Math.min(l.dailyRepayment, l.totalRepayable - l.totalPaid));
        }, 0);
        var dashMaint  = typeof Lakes !== 'undefined'
            ? (state.ownedLakes || []).reduce(function (s, id) {
                return s + Lakes.getLakeMaintenanceDailyCost(id);
              }, 0) : 0;
        var royalty    = typeof Finance !== 'undefined' ? Finance.getDailyRoyaltyDue() : 0;

        var totalIn  = Math.round(anglerIncome + lakeIncome);
        var totalOut = Math.round(staffWages + loanDaily + dashMaint + royalty);
        var netToday = totalIn - totalOut;

        html += '<div class="dash-finance-rows">';
        html += '<div class="dash-finance-row"><span>\uD83C\uDFA3 Angler income</span><span class="dash-pos">+' + UI.formatMoney(Math.round(anglerIncome)) + '</span></div>';
        html += '<div class="dash-finance-row"><span>\uD83C\uDF0A Lake income</span><span class="dash-pos">+' + UI.formatMoney(Math.round(lakeIncome)) + '</span></div>';
        html += '<div class="dash-finance-row"><span>\uD83D\uDC65 Staff wages</span><span class="dash-neg">-' + UI.formatMoney(staffWages) + '</span></div>';
        html += '<div class="dash-finance-row"><span>\uD83C\uDFE6 Loan repayments</span><span class="dash-neg">-' + UI.formatMoney(loanDaily) + '</span></div>';
        if (dashMaint > 0) {
            html += '<div class="dash-finance-row"><span>\uD83D\uDCCA Maintenance</span><span class="dash-neg">-' + UI.formatMoney(dashMaint) + '</span></div>';
        }
        if (royalty > 0) {
            html += '<div class="dash-finance-row"><span>\uD83D\uDCC8 Royalties</span><span class="dash-neg">-' + UI.formatMoney(royalty) + '</span></div>';
        }
        html += '<div class="dash-finance-total"><span>Net today</span>';
        html += '<span class="' + (netToday >= 0 ? 'dash-pos' : 'dash-neg') + '">' + (netToday >= 0 ? '+' : '') + UI.formatMoney(netToday) + '</span></div>';
        html += '</div>';

        // ── Active loans ─────────────────────────────────────────────────────
        var activeLoans = (state.loans || []).filter(function (l) { return !l.paidOff; });
        if (activeLoans.length > 0) {
            html += '<h4 class="dash-section-subheading">Active Loans (' + activeLoans.length + ')</h4>';
            activeLoans.forEach(function (loan) {
                var remaining = loan.totalRepayable - loan.totalPaid;
                var pct       = Math.round((loan.totalPaid / loan.totalRepayable) * 100);
                html += '<div class="dash-finance-row" style="margin-bottom:0.2rem;"><span>' + loan.name + '</span><span class="dash-neg">' + UI.formatMoney(remaining) + '</span></div>';
                html += '<div class="finance-loan-bar-track" style="margin-bottom:0.45rem;"><div class="finance-loan-bar-fill" style="width:' + pct + '%;"></div></div>';
            });
        }

        // ── Active campaigns ─────────────────────────────────────────────────
        var activeCampaigns = (state.marketingCampaigns || []).filter(function (c) { return c.endDay >= state.day; });
        if (activeCampaigns.length > 0) {
            html += '<h4 class="dash-section-subheading">Marketing (' + activeCampaigns.length + ' active)</h4>';
            activeCampaigns.forEach(function (c) {
                var daysLeft = c.endDay - state.day;
                html += '<div class="dash-finance-row"><span>' + c.name + '</span><span style="color:#8e44ad;">' + daysLeft + 'd left</span></div>';
            });
        }

        html += '<p style="margin-top:0.75rem;font-size:0.78rem;"><span class="dash-link" onclick="UI.switchTab(\'finance\')">\uD83D\uDCC8 Open Finance \u2192</span></p>';
        return html;
    }

    function renderFinanceTotalsTab(state) {
        var html = '';

        var netProfit      = state.totalEarnings - state.totalSpent;
        var dashFisheryVal = typeof Finance !== 'undefined' ? Finance.getFisheryValue() : 0;
        var dashStockVal   = typeof Fish    !== 'undefined' ? Fish.getTotalStockValue(state.fish) : 0;
        var debt           = typeof Finance !== 'undefined' ? Finance.getOutstandingDebt() : 0;
        var dashEquity     = typeof Finance !== 'undefined' ? Finance.getTotalEquitySold() : 0;
        var dashMaint      = typeof Lakes   !== 'undefined'
            ? (state.ownedLakes || []).reduce(function (s, id) {
                return s + Lakes.getLakeMaintenanceDailyCost(id);
              }, 0) : 0;
        var dashRoyalty    = typeof Finance !== 'undefined' ? Finance.getDailyRoyaltyDue() : 0;
        var staffWages     = (state.hiredStaff || []).reduce(function (s, m) { return s + m.salary; }, 0);

        // ── 4 big KPI cards ──────────────────────────────────────────────────
        html += '<div class="dash-finance-bigstats">';
        html += '<div class="dash-finance-big"><span class="dash-finance-big-val" style="color:var(--colour-gold);">' + UI.formatMoney(state.money) + '</span><span class="dash-finance-big-label">Balance</span></div>';
        var npColour = netProfit >= 0 ? 'var(--colour-accent)' : 'var(--colour-danger)';
        html += '<div class="dash-finance-big"><span class="dash-finance-big-val" style="color:' + npColour + ';">' + (netProfit >= 0 ? '+' : '') + UI.formatMoney(netProfit) + '</span><span class="dash-finance-big-label">Net P&amp;L</span></div>';
        html += '<div class="dash-finance-big"><span class="dash-finance-big-val" style="color:var(--colour-accent);">' + UI.formatMoney(dashFisheryVal) + '</span><span class="dash-finance-big-label">Fishery Value</span></div>';
        html += '<div class="dash-finance-big"><span class="dash-finance-big-val" style="color:var(--colour-gold);">' + UI.formatMoney(state.money + dashFisheryVal) + '</span><span class="dash-finance-big-label">Net Worth</span></div>';
        html += '</div>';

        // ── All-time totals ──────────────────────────────────────────────────
        html += '<div class="dash-finance-rows">';
        html += '<div class="dash-finance-row"><span>Total earned</span><span class="dash-pos">' + UI.formatMoney(state.totalEarnings) + '</span></div>';
        html += '<div class="dash-finance-row"><span>Total spent</span><span class="dash-neg">-' + UI.formatMoney(state.totalSpent) + '</span></div>';
        html += '<div class="dash-finance-row"><span>Fish stock value</span><span style="color:#9b59b6;">' + UI.formatMoney(dashStockVal) + '</span></div>';
        html += '<div class="dash-finance-row"><span>Outstanding debt</span><span class="' + (debt > 0 ? 'dash-neg' : 'dash-pos') + '">' + (debt > 0 ? UI.formatMoney(debt) : 'None') + '</span></div>';
        html += '<div class="dash-finance-row"><span>Daily maintenance</span><span class="dash-neg">-' + UI.formatMoney(dashMaint) + '</span></div>';
        html += '<div class="dash-finance-row"><span>Daily staff wages</span><span class="dash-neg">-' + UI.formatMoney(staffWages) + '</span></div>';
        if (dashEquity > 0) {
            html += '<div class="dash-finance-row"><span>Equity sold</span><span style="color:#e67e22;">' + dashEquity + '%</span></div>';
            html += '<div class="dash-finance-row"><span>Dividends paid</span><span class="dash-neg">-' + UI.formatMoney(state.dividendsPaid || 0) + '</span></div>';
        }
        if (dashRoyalty > 0) {
            html += '<div class="dash-finance-row"><span>Daily royalty cost</span><span class="dash-neg">-' + UI.formatMoney(dashRoyalty) + '</span></div>';
        }
        html += '</div>';

        html += '<p style="margin-top:0.75rem;font-size:0.78rem;"><span class="dash-link" onclick="UI.switchTab(\'finance\')">\uD83D\uDCC8 Open Finance \u2192</span></p>';
        return html;
    }

    // ── Staff Snapshot ────────────────────────────────────────────────────────

    function renderStaffSnapshot(state) {
        var html = '<h3>\uD83D\uDC65 Staff</h3>';
        var hired = state.hiredStaff || [];

        if (hired.length === 0) {
            html += '<p class="empty-state" style="font-size:0.8rem;">No staff hired. <span class="dash-link" onclick="UI.switchTab(\'staff\')">Hire staff \u2192</span></p>';
            return html;
        }

        var totalWages = hired.reduce(function (s, m) { return s + m.salary; }, 0);
        html += '<div class="dash-staff-meta">' + hired.length + ' staff &mdash; ' + UI.formatMoney(totalWages) + '/day</div>';

        html += '<div class="dash-staff-list">';
        hired.forEach(function (member) {
            var roleDef  = typeof Staff !== 'undefined' ? Staff.ROLE_DEFINITIONS[member.role] : {};
            var hapColour = member.happiness >= 60 ? '#2ecc71' : (member.happiness >= 30 ? '#f39c12' : '#e74c3c');
            var hapLabel  = member.happiness >= 60 ? 'Happy' : (member.happiness >= 30 ? 'OK' : 'Unhappy');
            var assignedLake = member.assignedLakeId && typeof Lakes !== 'undefined' ? Lakes.getLakeById(member.assignedLakeId) : null;

            html += '<div class="dash-staff-row">';
            html += '<span class="dash-staff-emoji">' + (roleDef && roleDef.emoji ? roleDef.emoji : '\uD83D\uDC64') + '</span>';
            html += '<div class="dash-staff-info">';
            html += '<span class="dash-staff-name">' + member.name + '</span>';
            if (assignedLake) html += '<span class="dash-staff-lake">' + assignedLake.name + '</span>';
            html += '</div>';
            html += '<div class="dash-staff-hap-track"><div class="dash-staff-hap-fill" style="width:' + member.happiness + '%;background:' + hapColour + ';"></div></div>';
            html += '<span class="dash-staff-hap-label" style="color:' + hapColour + ';">' + hapLabel + '</span>';
            html += '</div>';
        });
        html += '</div>';

        var assistantRate = typeof Staff !== 'undefined' ? Math.round(Staff.getAssistantAcceptanceRate() * 100) : 0;
        if (assistantRate > 0) {
            html += '<div class="dash-badge dash-badge-accent">\uD83D\uDCCB Auto-booking at ' + assistantRate + '%</div>';
        }

        html += '<p style="margin-top:0.5rem;font-size:0.78rem;"><span class="dash-link" onclick="UI.switchTab(\'staff\')">Manage staff \u2192</span></p>';

        return html;
    }

    /**
     * Render the weather conditions card for the dashboard.
     */
    function renderWeatherCard(state) {
        if (typeof Weather === 'undefined') return '';

        var w        = Weather.getCurrentWeather();
        var wDef     = Weather.getWeatherDef(w.current || 'cloudy');
        var sDef     = Weather.getSeasonDef(w.season || 'spring');
        var dayOfYear = w.dayOfYear || 1;
        var temp     = (w.temperature !== undefined) ? w.temperature + '\u00b0C' : '—';

        // Combined angler modifier
        var anglerMod    = Weather.getAnglerModifier();
        var anglerPct    = Math.round(Math.abs(anglerMod) * 100);
        var anglerSign   = anglerMod >= 0 ? '+' : '-';
        var anglerArrow  = anglerMod > 0.05 ? '\u2191' : (anglerMod < -0.05 ? '\u2193' : '\u2192');
        var anglerClass  = anglerMod > 0.05 ? 'weather-impact-positive' :
                           (anglerMod < -0.05 ? 'weather-impact-negative' : 'weather-impact-neutral');

        // Season and weather breakdown for anglers
        var seasonAnglerMods = { spring: 0, summer: 30, autumn: -10, winter: -50 };
        var seasonPct  = seasonAnglerMods[w.season] || 0;
        var weatherPct = Math.round((wDef.anglerMod || 0) * 100);
        var breakdownParts = [];
        if (seasonPct !== 0)  breakdownParts.push(sDef.name + ' ' + (seasonPct > 0 ? '+' : '') + seasonPct + '%');
        if (weatherPct !== 0) breakdownParts.push(wDef.name + ' ' + (weatherPct > 0 ? '+' : '') + weatherPct + '%');
        var breakdown = breakdownParts.length > 0 ? ' (' + breakdownParts.join(', ') + ')' : '';

        var html = '<div class="dashboard-card">';
        html += '<h3>\uD83C\uDF24\uFE0F Weather &amp; Conditions</h3>';

        // Main weather display
        html += '<div class="weather-main-display">';
        html += '<span class="weather-big-icon">' + wDef.emoji + '</span>';
        html += '<div class="weather-main-info">';
        html += '<span class="weather-name">' + wDef.name + '</span>';
        html += '<span class="weather-temp">' + temp + '</span>';
        html += '</div>';
        html += '<div class="weather-season-info">';
        html += '<span class="weather-season-badge">' + sDef.emoji + ' ' + sDef.name + '</span>';
        html += '<span class="weather-day-of-year">Day ' + dayOfYear + ' / 365</span>';
        html += '</div>';
        html += '</div>';

        // Angler impact row
        html += '<div class="weather-impact-section">';
        html += '<div class="weather-impact-row">';
        html += '<span class="weather-impact-label">Angler Bookings</span>';
        html += '<span class="weather-impact-value ' + anglerClass + '">' +
                    anglerArrow + ' ' + anglerSign + anglerPct + '%' + breakdown +
                '</span>';
        html += '</div>';

        // Satisfaction modifier
        var satMod   = wDef.satisfactionMod || 0;
        var satArrow = satMod > 0 ? '\u2191' : (satMod < 0 ? '\u2193' : '\u2192');
        var satClass = satMod > 0 ? 'weather-impact-positive' :
                       (satMod < 0 ? 'weather-impact-negative' : 'weather-impact-neutral');
        html += '<div class="weather-impact-row">';
        html += '<span class="weather-impact-label">Angler Satisfaction</span>';
        html += '<span class="weather-impact-value ' + satClass + '">' +
                    satArrow + ' ' + (satMod >= 0 ? '+' : '') + satMod + ' / day</span>';
        html += '</div>';
        html += '</div>';

        // Per-lake oxygen levels
        if (state.ownedLakes.length > 0) {
            html += '<div class="weather-oxygen-section">';
            html += '<h4 class="weather-section-title">Lake Oxygen Levels</h4>';
            state.ownedLakes.forEach(function (lakeId) {
                var lakeDef   = typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
                var lakeName  = lakeDef ? lakeDef.name : lakeId;
                var oxygen    = Weather.getLakeOxygen(lakeId);
                var oxyStatus = Weather.getOxygenStatus(oxygen);
                var barWidth  = Math.round((oxygen / 14) * 100);
                html += '<div class="weather-oxygen-row">';
                html += '<span class="weather-oxygen-lake">' + lakeName + '</span>';
                html += '<div class="lake-oxygen-track weather-oxygen-track">';
                html += '<div class="lake-oxygen-fill ' + oxyStatus.cssClass + '" style="width:' + barWidth + '%;"></div>';
                html += '</div>';
                html += '<span class="lake-oxygen-reading ' + oxyStatus.cssClass + '">' + oxygen + ' mg/L</span>';
                html += '</div>';
            });
            html += '</div>';
        }

        // Weather tip
        var tip = getWeatherTip(w.current, w.season);
        if (tip) {
            html += '<p class="weather-tip">' + tip + '</p>';
        }

        html += '</div>'; // .dashboard-card
        return html;
    }

    // ── Your Angler card ──────────────────────────────────────────────────────
    function renderYourAnglerCard(state) {
        var html = '<h3 class="section-heading" style="margin-top:0;">🎣 Your Angler</h3>';
        var angler = null;
        if (state.playerAnglerId && typeof Anglers !== 'undefined' && typeof Anglers.getAnglerById === 'function') {
            angler = Anglers.getAnglerById(state.playerAnglerId);
        }
        if (!angler) {
            var activeBookings = (state.anglerBookings || []).filter(function (b) {
                return state.day >= b.startDay && state.day <= b.endDay;
            });
            var poolSize = (typeof ANGLER_POOL !== 'undefined' ? ANGLER_POOL.length : 0);
            var onSite = activeBookings.length;
            html += '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">';
            html += '<div><strong>Pool</strong><br/><span style="font-size:1.4rem;">' + poolSize + '</span></div>';
            html += '<div><strong>On Site</strong><br/><span style="font-size:1.4rem;color:var(--colour-accent);">' + onSite + '</span></div>';
            html += '</div>';
            html += '<p style="margin-top:0.6rem;color:var(--colour-text-muted);">This section will expand with your primary angler stats and progression.</p>';
            return html;
        }

        html += '<div style="display:flex;justify-content:center;">';
        html += '<div class="angler-card" style="width:320px;height:320px;box-sizing:content-box;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:visible;">';
        html += '<div class="angler-photo-slot" style="width:220px;height:220px;">';
        if (angler.photo) {
            html += '<img src="' + angler.photo + '" alt="' + angler.name + '" class="angler-photo-img" style="width:100%;height:100%;object-fit:contain;"/>';
        } else {
            html += '<div class="angler-photo-placeholder">' + angler.name.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2).toUpperCase() + '</div>';
        }
        html += '</div>';
        html += '<div class="angler-name" style="margin-top:10px;color:#2563eb;">' + angler.name + '</div>';
        html += '<div class="angler-stats-row" style="justify-content:center;"><span class="angler-stat-badge">Skill ' + angler.skill + '/10</span><span class="angler-stat-badge">Social Media ' + (typeof angler.socialMedia !== 'undefined' ? '' + angler.socialMedia + '/10' : '—') + '</span></div>';
        html += '</div></div>';
        return html;
    }

    // ── Biggest Fish card ───────────────────────────────────────────────────────
    function renderBiggestFishCard(state) {
        var alive = state.fish.filter(function(f){ return f.alive; });
        if (alive.length === 0) return '';
        
        var biggest = alive.reduce(function(max, f) {
            return (f.weight_oz || 0) > (max.weight_oz || 0) ? f : max;
        }, alive[0]);

        var rd = typeof Fish !== 'undefined' ? (Fish.RARITIES[biggest.rarity] || { name: biggest.rarity, colour: '#888' }) : { name: biggest.rarity, colour: '#888' };
        var sp = typeof Fish !== 'undefined' ? (Fish.SPECIES[biggest.species] ? Fish.SPECIES[biggest.species].name : biggest.species) : biggest.species;
        var speciesMax = typeof Fish !== 'undefined' && Fish.SPECIES[biggest.species] ? Fish.SPECIES[biggest.species].maxWeight : 1200;
        var weightPct = Math.min(100, Math.round((biggest.weight_oz / speciesMax) * 100));
        var RARITY_ORDER = ['mythic','legendary','epic','rare','uncommon','common'];
        var rarityIdx = RARITY_ORDER.indexOf(biggest.rarity);
        var rarityPct = rarityIdx === -1 ? 0 : Math.round(((RARITY_ORDER.length - 1 - rarityIdx) / (RARITY_ORDER.length - 1)) * 100);
        var health = biggest.stats?.health || 0;
        var age = biggest.age_days || 0;
        var maxAge = 2000;
        var agePct = Math.min(100, Math.round((age / maxAge) * 100));
        var value = typeof Fish !== 'undefined' ? Fish.getFishValue(biggest) : 0;
        var totalValue = typeof Fish !== 'undefined' ? Fish.getTotalStockValue(alive) : 0;
        var valuePct = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;

        var bars = [
            { label: 'Weight vs Max', pct: weightPct, colour: 'linear-gradient(90deg, #f1c40f, #e67e22)', icon: '⚖️' },
            { label: 'Rarity Tier', pct: rarityPct, colour: rd.colour, icon: '💎' },
            { label: 'Health', pct: health, colour: health >= 70 ? '#2ecc71' : (health >= 40 ? '#f39c12' : '#e74c3c'), icon: '❤️' },
            { label: 'Age Progress', pct: agePct, colour: '#3498db', icon: '📅' },
            { label: 'Fleet Value %', pct: valuePct, colour: '#9b59b6', icon: '💰' }
        ];

        var barsHtml = bars.map(function(b) {
            return '<div class="dash-fish-stat-bar">' +
                '<div class="dash-fish-stat-bar-header"><span class="dash-fish-stat-icon">' + b.icon + '</span><span class="dash-fish-stat-label">' + b.label + '</span><span class="dash-fish-stat-pct" style="color:' + (typeof b.colour === 'string' && b.colour.startsWith('linear') ? 'var(--colour-gold)' : b.colour) + ';">' + b.pct + '%</span></div>' +
                '<div class="dash-fish-stat-bar-track"><div class="dash-fish-stat-bar-fill" style="width:' + b.pct + '%;background:' + b.colour + ';"></div></div>' +
            '</div>';
        }).join('');

        return '<div class="dash-fish-feature-card">' +
            '<h4 class="dash-section-subheading">🏆🏆 <span style="font-size:1.4em;">🏆</span> Biggest Fish</h4>' +
            '<div class="dash-fish-feature">' +
                '<span class="dash-fish-name">' + biggest.name + '</span>' +
                '<span class="dash-fish-species">' + sp + '</span>' +
                '<span class="dash-fish-rarity" style="color:' + rd.colour + ';">' + rd.name + '</span>' +
                '<span class="dash-fish-weight" style="color:var(--colour-gold);font-size:1.4rem;font-weight:800;">' + UI.formatWeight(biggest.weight_oz) + '</span>' +
                '<span class="dash-fish-lake">Lake: ' + (biggest.lake_id ? (typeof Lakes !== 'undefined' && Lakes.getLakeById(biggest.lake_id) ? Lakes.getLakeById(biggest.lake_id).name : biggest.lake_id) : '—') + '</span>' +
            '</div>' +
            '<div class="dash-fish-stat-bars">' + barsHtml + '</div>' +
            '<div class="dash-fish-lineage-btn-wrap">' +
                '<button class="btn btn-primary btn-sm dash-lineage-btn" onclick="Dashboard.showFishLineage(\'' + biggest.uid + '\')">🧬 Lineage</button>' +
            '</div>' +
        '</div>';
    }

    // ── Rarest Fish card ────────────────────────────────────────────────────────
    function renderRarestFishCard(state) {
        var alive = state.fish.filter(function(f){ return f.alive; });
        if (alive.length === 0) return '';
        
        var RARITY_ORDER = ['mythic','legendary','epic','rare','uncommon','common'];
        var rarest = alive.reduce(function(best, f) {
            var idxF = RARITY_ORDER.indexOf(f.rarity);
            var idxB = RARITY_ORDER.indexOf(best.rarity);
            if (idxF === -1) idxF = RARITY_ORDER.length;
            if (idxB === -1) idxB = RARITY_ORDER.length;
            if (idxF !== idxB) return idxF < idxB ? f : best;
            // Same rarity tier: compare weight
            return (f.weight_oz || 0) > (best.weight_oz || 0) ? f : best;
        }, alive[0]);

        var rd = typeof Fish !== 'undefined' ? (Fish.RARITIES[rarest.rarity] || { name: rarest.rarity, colour: '#888' }) : { name: rarest.rarity, colour: '#888' };
        var sp = typeof Fish !== 'undefined' ? (Fish.SPECIES[rarest.species] ? Fish.SPECIES[rarest.species].name : rarest.species) : rarest.species;
        var speciesMax = typeof Fish !== 'undefined' && Fish.SPECIES[rarest.species] ? Fish.SPECIES[rarest.species].maxWeight : 1200;
        var weightPct = Math.min(100, Math.round((rarest.weight_oz / speciesMax) * 100));
        var rarityIdx = RARITY_ORDER.indexOf(rarest.rarity);
        var rarityPct = rarityIdx === -1 ? 100 : Math.round(((RARITY_ORDER.length - 1 - rarityIdx) / (RARITY_ORDER.length - 1)) * 100);
        var health = rarest.stats?.health || 0;
        var age = rarest.age_days || 0;
        var maxAge = 2000;
        var agePct = Math.min(100, Math.round((age / maxAge) * 100));
        var value = typeof Fish !== 'undefined' ? Fish.getFishValue(rarest) : 0;
        var totalValue = typeof Fish !== 'undefined' ? Fish.getTotalStockValue(alive) : 0;
        var valuePct = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
        var catchRate = rarest.times_caught ? Math.min(100, rarest.times_caught * 10) : 0;

        var bars = [
            { label: 'Rarity Tier', pct: rarityPct, colour: rd.colour, icon: '💎' },
            { label: 'Weight vs Max', pct: weightPct, colour: 'linear-gradient(90deg, #e74c3c, #f1c40f)', icon: '⚖️' },
            { label: 'Health', pct: health, colour: health >= 70 ? '#2ecc71' : (health >= 40 ? '#f39c12' : '#e74c3c'), icon: '❤️' },
            { label: 'Age Progress', pct: agePct, colour: '#9b59b6', icon: '📅' },
            { label: 'Elusiveness', pct: 100 - catchRate, colour: '#1abc9c', icon: '👻' }
        ];

        var barsHtml = bars.map(function(b) {
            return '<div class="dash-fish-stat-bar">' +
                '<div class="dash-fish-stat-bar-header"><span class="dash-fish-stat-icon">' + b.icon + '</span><span class="dash-fish-stat-label">' + b.label + '</span><span class="dash-fish-stat-pct" style="color:' + (typeof b.colour === 'string' && b.colour.startsWith('linear') ? 'var(--colour-gold)' : b.colour) + ';">' + b.pct + '%</span></div>' +
                '<div class="dash-fish-stat-bar-track"><div class="dash-fish-stat-bar-fill" style="width:' + b.pct + '%;background:' + b.colour + ';"></div></div>' +
            '</div>';
        }).join('');

        return '<div class="dash-fish-feature-card">' +
            '<h4 class="dash-section-subheading">💎💎 <span style="font-size:1.4em;">💎</span> Rarest Fish</h4>' +
            '<div class="dash-fish-feature">' +
                '<span class="dash-fish-name">' + rarest.name + '</span>' +
                '<span class="dash-fish-species">' + sp + '</span>' +
                '<span class="dash-fish-rarity" style="color:' + rd.colour + ';font-weight:700;font-size:1.1rem;">' + rd.name + '</span>' +
                '<span class="dash-fish-weight">' + UI.formatWeight(rarest.weight_oz) + '</span>' +
                '<span class="dash-fish-lake">Lake: ' + (rarest.lake_id ? (typeof Lakes !== 'undefined' && Lakes.getLakeById(rarest.lake_id) ? Lakes.getLakeById(rarest.lake_id).name : rarest.lake_id) : '—') + '</span>' +
            '</div>' +
            '<div class="dash-fish-stat-bars">' + barsHtml + '</div>' +
            '<div class="dash-fish-lineage-btn-wrap">' +
                '<button class="btn btn-primary btn-sm dash-lineage-btn" onclick="Dashboard.showFishLineage(\'' + rarest.uid + '\')">🧬 Lineage</button>' +
            '</div>' +
        '</div>';
    }

    /**
     * Return a contextual fishing tip for the current conditions.
     */
    function getWeatherTip(weatherType, season) {
        var tips = {
            sunny:    'Clear skies and warm water — carp are active. Good day for angler bookings.',
            cloudy:   'Overcast but mild. Carp often feed confidently in diffused light.',
            overcast: 'Flat light conditions. Carp can be cautious — anglers may struggle.',
            rainy:    'Rain oxygenates the water and can trigger feeding. Anglers may cancel, though.',
            stormy:   'Dangerous conditions — most anglers will stay away. Watch for flood damage.',
            foggy:    'Poor visibility makes bite detection harder. Angler satisfaction may dip.',
            frost:    'Sub-zero overnight. Carp metabolism slows — fish feed less actively. Ice risk on still water.',
            snowfall: 'Heavy snow — lake access is difficult. Expect very few bookings today.',
            heatwave: 'Extreme heat lowers lake oxygen. Monitor fish health and use aerators.'
        };
        if (tips[weatherType]) return '\uD83D\uDCA1 ' + tips[weatherType];
        // Seasonal tip as fallback
        var seasonTips = {
            winter: 'Winter fishing is slow — focus on lake upgrades and breeding to prepare for spring.',
            spring: 'Spring awakening! Fish metabolism picks up as water warms. Prime breeding season.',
            summer: 'Peak season. Maximise angler bookings and watch oxygen levels on hot days.',
            autumn: 'Fish are feeding hard before winter. Great conditions for specimen hunting.'
        };
        return seasonTips[season] ? '\uD83D\uDCA1 ' + seasonTips[season] : '';
    }

    /**
     * Render income chart (last 7 days bar chart).
     */
    function renderIncomeChart(state) {
        var history = state.incomeHistory || [];
        var last14  = history.slice(-14);
        if (last14.length === 0) {
            return '<p class="empty-state">No income data yet.</p>';
        }
        var maxIncome = last14.reduce(function (m, e) { return Math.max(m, e.income || 0); }, 1);
        var html = '<div class="chart-section">';
        html += '<h4 class="chart-title">Daily Income \u2014 Last 14 Days</h4>';
        html += '<div class="candle-chart">';
        last14.forEach(function (entry, i) {
            var val    = entry.income || 0;
            var prev   = i > 0 ? (last14[i-1].income || 0) : val;
            var isUp   = val >= prev;
            var bodyH  = Math.max(4, Math.floor((val / maxIncome) * 100));
            var colour = isUp ? '#2ecc71' : '#e74c3c';
            html += '<div class="candle-col">';
            html += '<div class="candle-wick" style="height:' + Math.min(bodyH + 10, 100) + '%;border-color:' + colour + ';"></div>';
            html += '<div class="candle-body" style="height:' + bodyH + '%;background:' + colour + ';"></div>';
            html += '<div class="candle-label">D' + entry.day + '</div>';
            html += '</div>';
        });
        html += '</div>';
        html += '<div class="candle-legend"><span style="color:#2ecc71;">\u25B2 Up</span><span style="color:#e74c3c;">\u25BC Down</span></div>';
        html += '</div>';
        return html;
    }

    function renderExpenseChart(state) {
        var log        = state.financeLog || [];
        var incHistory = state.incomeHistory || [];
        var dayRange   = incHistory.slice(-14).map(function (e) { return e.day; });
        if (dayRange.length === 0) return '';
        var expByDay = {};
        dayRange.forEach(function (d) { expByDay[d] = 0; });
        log.forEach(function (e) {
            if (e.amount < 0 && expByDay.hasOwnProperty(e.day)) {
                expByDay[e.day] += Math.abs(e.amount);
            }
        });
        var entries = dayRange.map(function (d) { return { day: d, exp: expByDay[d] || 0 }; });
        var maxExp   = entries.reduce(function (m, e) { return Math.max(m, e.exp); }, 1);
        var html = '<div class="chart-section">';
        html += '<h4 class="chart-title">Daily Expenses \u2014 Last 14 Days</h4>';
        html += '<div class="candle-chart">';
        entries.forEach(function (entry, i) {
            var val    = entry.exp;
            var prev   = i > 0 ? entries[i-1].exp : val;
            var isUp   = val >= prev;
            var bodyH  = Math.max(2, Math.floor((val / maxExp) * 100));
            var colour = isUp ? '#e74c3c' : '#2ecc71';
            html += '<div class="candle-col">';
            html += '<div class="candle-wick" style="height:' + Math.min(bodyH + 10, 100) + '%;border-color:' + colour + ';"></div>';
            html += '<div class="candle-body" style="height:' + bodyH + '%;background:' + colour + ';"></div>';
            html += '<div class="candle-label">D' + entry.day + '</div>';
            html += '</div>';
        });
        html += '</div>';
        html += '<div class="candle-legend"><span style="color:#2ecc71;">\u25BC Falling</span><span style="color:#e74c3c;">\u25B2 Rising</span></div>';
        html += '</div>';
        return html;
    }

    /**
     * Render fish population by lake chart.
     */
    function renderFishPopulationChart(state) {
        if (state.ownedLakes.length === 0) {
            return '<p class="empty-state">Own a lake to see fish population data.</p>';
        }

        var html = '<div class="chart-section">';
        html += '<h4 class="chart-title">Fish Population by Lake</h4>';
        html += '<div class="horizontal-bar-chart">';

        var maxPop = 1;
        var lakePops = [];
        state.ownedLakes.forEach(function (lakeId) {
            var lake = Lakes.getLakeById(lakeId);
            var pop = state.fish.filter(function (f) { return f.alive && f.lake_id === lakeId; }).length;
            if (pop > maxPop) maxPop = pop;
            lakePops.push({ lake: lake, pop: pop, id: lakeId });
        });

        lakePops.forEach(function (item) {
            var width = Math.max(4, Math.floor((item.pop / maxPop) * 100));
            var colour = typeof Anglers !== 'undefined' ? Anglers.getLakeColour(item.id) : '#4a9c6d';
            html += '<div class="h-bar-row">';
            html += '<span class="h-bar-label">' + (item.lake ? item.lake.name : 'Unknown') + '</span>';
            html += '<div class="h-bar-track"><div class="h-bar-fill" style="width: ' + width + '%; background-color: ' + colour + ';"></div></div>';
            html += '<span class="h-bar-value">' + item.pop + '</span>';
            html += '</div>';
        });

        html += '</div>';
        html += '</div>';
        return html;
    }

    /**
     * Render quests section.
     * Shows the first 3 incomplete quests with progress bars.
     * All completed quests are listed below as struck-through text.
     */
    function renderQuests(state) {
        var completedIds  = state.completedQuests || [];
        var activeQuests  = QUESTS.filter(function (q) { return completedIds.indexOf(q.id) === -1; });
        var doneQuests    = QUESTS.filter(function (q) { return completedIds.indexOf(q.id) !== -1; });
        var showing       = activeQuests.slice(0, 3);
        var queued        = activeQuests.slice(3);

        var html = '';

        // ── Active (up to 3) ─────────────────────────────────────────────────
        if (showing.length === 0 && doneQuests.length === QUESTS.length) {
            html += '<p class="empty-state" style="color:var(--colour-gold);">\uD83C\uDFC6 All quests complete!</p>';
        } else {
            html += '<div class="quest-list">';
            showing.forEach(function (quest) {
                var progress   = quest.checkProgress(state);
                var percentage = Math.min(100, Math.floor((progress.current / progress.target) * 100));
                html += '<div class="quest-item">';
                html += '<div class="quest-header">';
                html += '<span class="quest-title">' + quest.title + '</span>';
                html += '<span class="quest-reward">';
                if (quest.reward.money > 0)      html += UI.formatMoney(quest.reward.money);
                if (quest.reward.reputation > 0) html += ' +' + quest.reward.reputation + ' rep';
                html += '</span>';
                html += '</div>';
                html += '<p class="quest-desc">' + quest.description + '</p>';
                html += '<div class="quest-progress">';
                html += '<div class="quest-progress-track"><div class="quest-progress-fill" style="width:' + percentage + '%;"></div></div>';
                html += '<span class="quest-progress-text">' + progress.current + '/' + progress.target + '</span>';
                html += '</div>';
                html += '</div>';
            });
            html += '</div>';

            if (queued.length > 0) {
                html += '<p class="quest-queue-note">+' + queued.length + ' more quest' + (queued.length === 1 ? '' : 's') + ' unlocked after these</p>';
            }
        }

        // ── Completed ────────────────────────────────────────────────────────
        if (doneQuests.length > 0) {
            html += '<div class="quest-completed-list">';
            doneQuests.forEach(function (quest) {
                html += '<div class="quest-completed-entry">';
                html += '<span class="quest-done-tick">\u2713</span>';
                html += '<span class="quest-done-title">' + quest.title + '</span>';
                html += '</div>';
            });
            html += '</div>';
        }

        return html;
    }

    /**
     * Render the notification/disaster board.
     */
    function renderNotificationBoard(state) {
        var html = '<div class="notification-board-scroll">';

        // Combine notifications and disaster log
        var entries = [];

        // Current day notifications
        if (state.notifications && state.notifications.length > 0) {
            state.notifications.forEach(function (notif) {
                entries.push({
                    day: notif.day,
                    message: notif.message,
                    type: 'notification',
                    timestamp: notif.timestamp
                });
            });
        }

        // Disaster log
        if (state.disasterLog && state.disasterLog.length > 0) {
            state.disasterLog.forEach(function (disaster) {
                entries.push({
                    day: disaster.day,
                    message: '&#x26A0; ' + disaster.name + ' at ' + disaster.lake + ': ' + disaster.result,
                    type: 'disaster',
                    timestamp: disaster.timestamp
                });
            });
        }

        // Sort by timestamp descending (most recent first)
        entries.sort(function (a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });

        if (entries.length === 0) {
            html += '<p class="empty-state">No notifications yet. Press "Next Day" to begin!</p>';
        } else {
            // Show latest 15 entries
            var shown = entries.slice(0, 15);
            shown.forEach(function (entry) {
                var typeClass = entry.type === 'disaster' ? 'notif-disaster' : 'notif-normal';
                html += '<div class="notif-entry ' + typeClass + '">';
                html += '<span class="notif-day">Day ' + entry.day + '</span>';
                html += '<span class="notif-message">' + entry.message + '</span>';
                html += '</div>';
            });
        }

        html += '</div>';
        return html;
    }


    // ── Overview stat cards ────────────────────────────────────────────────────

    function renderOverviewStatCards(state) {
        var netProfit     = state.totalEarnings - state.totalSpent;
        var debt          = typeof Finance !== 'undefined' ? Finance.getOutstandingDebt() : 0;
        var staffCount    = state.hiredStaff ? state.hiredStaff.length : 0;
        var staffWages    = state.hiredStaff ? state.hiredStaff.reduce(function (s, m) { return s + m.salary; }, 0) : 0;
        var activeAnglers = (state.anglerBookings || []).filter(function (b) {
            return state.day >= b.startDay && state.day <= b.endDay;
        }).length;
        var campaigns     = (state.marketingCampaigns || []).filter(function (c) { return c.endDay >= state.day; }).length;
        var pending       = (state.pendingBookings || []).length;
        var stockValue    = typeof Fish !== 'undefined' ? Fish.getTotalStockValue(state.fish) : 0;
        var fisheryVal    = typeof Finance !== 'undefined' ? Finance.getFisheryValue() : 0;
        var netWorth      = state.money + fisheryVal;
        var equitySold    = typeof Finance !== 'undefined' ? Finance.getTotalEquitySold() : 0;
        var dailyInvest   = typeof Lakes !== 'undefined'
            ? (state.ownedLakes || []).reduce(function (s, id) { return s + Lakes.getLakeMaintenanceDailyCost(id); }, 0) : 0;

        var aliveFish     = state.fish.filter(function (f) { return f.alive; });
        var deadFish      = state.fish.filter(function (f) { return !f.alive; }).length;
        var totalFish     = aliveFish.length;
        var legendaryPlus = aliveFish.filter(function (f) { return f.rarity === 'legendary' || f.rarity === 'mythic'; }).length;
        var avgHealth     = totalFish > 0
            ? Math.round(aliveFish.reduce(function (s, f) { return s + (f.stats ? f.stats.health : 0); }, 0) / totalFish) : 0;
        var curYr         = Math.ceil(state.day / 365);
        var breedable     = aliveFish.filter(function (f) { return f.weight_oz > 160 && (!f.lastBreedYear || f.lastBreedYear < curYr); }).length;
        var totalCreated  = (state.fishCreationLog || []).length;

        var totalCap = 0, totalBio = 0;
        (state.ownedLakes || []).forEach(function (id) {
            var lake     = typeof Lakes !== 'undefined' ? Lakes.getLakeById(id) : null;
            if (!lake) return;
            var expBonus = typeof Lakes !== 'undefined' && Lakes.getLakeExpansionBonus ? Lakes.getLakeExpansionBonus(id) : { capacity: 0, biodiversity: 0 };
            totalCap += lake.capacity + (expBonus.capacity || 0);
            totalBio += lake.biodiversityScore + (expBonus.biodiversity || 0);
        });
        var avgOccupancy = totalCap > 0 ? Math.round((totalFish / totalCap) * 100) : 0;
        var avgBio       = state.ownedLakes.length > 0 ? (totalBio / state.ownedLakes.length) : 0;

        function row(label, val, colour, pct) {
            pct = Math.max(0, Math.min(100, isNaN(pct) ? 0 : pct));
            return '<div class="info-stat-row">' +
                '<div class="info-stat-header">' +
                '<span class="info-stat-label">' + label + '</span>' +
                '<span class="info-stat-val" style="color:' + colour + ';">' + val + '</span>' +
                '</div>' +
                '<div class="info-bar-track"><div class="info-bar-fill" style="width:' + pct + '%;background:' + colour + ';"></div></div>' +
                '</div>';
        }

        var html = '<div class="info-tab-grid">';

        html += '<div class="info-tab-col">';
        html += '<div class="info-col-header">\uD83D\uDCB0 Finance</div>';
        var maxRef = Math.max(state.money, netWorth, 50000);
        html += row('Balance', UI.formatMoney(state.money), 'var(--colour-gold)', (state.money / maxRef) * 100);
        html += row('Net P&L', (netProfit >= 0 ? '+' : '') + UI.formatMoney(netProfit), netProfit >= 0 ? 'var(--colour-accent)' : 'var(--colour-danger)', state.totalEarnings > 0 ? Math.max(0, (netProfit / state.totalEarnings) * 100) : 0);
        html += row('Net Worth', UI.formatMoney(netWorth), 'var(--colour-gold)', (netWorth / Math.max(1, netWorth + debt)) * 100);
        html += row('Stock Value', UI.formatMoney(stockValue), '#e67e22', Math.min(100, netWorth > 0 ? (stockValue / netWorth) * 100 : 0));
        html += row('Outstanding Debt', debt > 0 ? UI.formatMoney(debt) : 'None', debt > 0 ? 'var(--colour-danger)' : 'var(--colour-text-muted)', debt > 0 ? Math.min(100, (debt / Math.max(1, netWorth)) * 100) : 0);
        html += row('Daily Invest.', dailyInvest > 0 ? UI.formatMoney(dailyInvest) + '/d' : 'None', dailyInvest > 0 ? '#16a085' : 'var(--colour-text-muted)', Math.min(100, dailyInvest / 5));
        html += '</div>';

        html += '<div class="info-tab-col">';
        html += '<div class="info-col-header">\u2699\uFE0F Operations</div>';
        html += row('Reputation', state.reputation + ' / 1,000', 'var(--colour-accent)', (state.reputation / 1000) * 100);
        html += row('Active Anglers', activeAnglers, activeAnglers > 0 ? 'var(--colour-accent)' : 'var(--colour-text-muted)', Math.min(100, activeAnglers * 5));
        html += row('Pending Bookings', pending > 0 ? pending : 'None', pending > 0 ? 'var(--colour-gold)' : 'var(--colour-text-muted)', Math.min(100, pending * 20));
        html += row('Staff', staffCount > 0 ? staffCount + ' (£' + staffWages + '/d)' : 'None', staffCount > 0 ? '#3498db' : 'var(--colour-text-muted)', Math.min(100, staffCount * 12));
        html += row('Campaigns', campaigns > 0 ? campaigns + ' active' : 'None', campaigns > 0 ? '#8e44ad' : 'var(--colour-text-muted)', Math.min(100, campaigns * 25));
        html += row('Equity Sold', equitySold > 0 ? equitySold + '%' : 'None', equitySold > 0 ? '#e67e22' : 'var(--colour-text-muted)', equitySold);
        html += '</div>';

        html += '<div class="info-tab-col">';
        html += '<div class="info-col-header">\uD83D\uDC1F Fish</div>';
        html += row('Living Fish', totalFish, '#9b59b6', totalCap > 0 ? (totalFish / totalCap) * 100 : 0);
        html += row('Avg Health', totalFish > 0 ? avgHealth + ' / 100' : '—', avgHealth >= 70 ? 'var(--colour-accent)' : avgHealth >= 40 ? '#d4a843' : 'var(--colour-danger)', avgHealth);
        html += row('Legendary+', legendaryPlus > 0 ? legendaryPlus : 'None', legendaryPlus > 0 ? '#f1c40f' : 'var(--colour-text-muted)', Math.min(100, legendaryPlus * 10));
        html += row('Breedable', breedable > 0 ? breedable : 'None', breedable > 0 ? 'var(--colour-accent)' : 'var(--colour-text-muted)', totalFish > 0 ? (breedable / totalFish) * 100 : 0);
        html += row('Deceased', deadFish > 0 ? deadFish : 'None', deadFish > 0 ? 'var(--colour-danger)' : 'var(--colour-text-muted)', (totalFish + deadFish) > 0 ? (deadFish / (totalFish + deadFish)) * 100 : 0);
        html += row('Total Created', totalCreated > 0 ? totalCreated : 'None', 'var(--colour-text-muted)', Math.min(100, totalCreated * 2));
        html += '</div>';

        html += '<div class="info-tab-col">';
        html += '<div class="info-col-header">\uD83C\uDFDE\uFE0F Lakes</div>';
        html += row('Lakes Owned', state.ownedLakes.length + ' / 14', 'var(--colour-accent)', (state.ownedLakes.length / 14) * 100);
        html += row('Avg Occupancy', avgOccupancy + '%', avgOccupancy < 70 ? 'var(--colour-accent)' : avgOccupancy < 90 ? '#d4a843' : 'var(--colour-danger)', avgOccupancy);
        html += row('Total Capacity', totalCap > 0 ? totalCap + ' fish' : 'None', 'var(--colour-text-muted)', Math.min(100, (totalCap / 500) * 100));
        html += row('Total Stocked', totalFish > 0 ? totalFish + ' fish' : 'None', '#9b59b6', totalCap > 0 ? (totalFish / totalCap) * 100 : 0);
        html += row('Avg Bio Score', state.ownedLakes.length > 0 ? avgBio.toFixed(1) + ' / 10' : '—', avgBio >= 7 ? 'var(--colour-accent)' : avgBio >= 5 ? '#d4a843' : 'var(--colour-danger)', (avgBio / 10) * 100);
        html += row('Daily Maint.', dailyInvest > 0 ? UI.formatMoney(dailyInvest) + '/d' : 'None', dailyInvest > 0 ? '#16a085' : 'var(--colour-text-muted)', Math.min(100, dailyInvest / 5));
        html += '</div>';

        html += '</div>';
        return html;
    }

    // ── Info Tab ──────────────────────────────────────────────────────────────

    function renderInfoTab(state) {
        var html = '<div class="info-quest-section">';
        html += '<div class="info-col-header" style="margin-bottom:0.75rem;">\uD83C\uDFC6 Quest Tracker</div>';

        var completedIds  = state.completedQuests || [];
        var activeQuests  = QUESTS.filter(function (q) { return completedIds.indexOf(q.id) === -1; });
        var doneQuests    = QUESTS.filter(function (q) { return completedIds.indexOf(q.id) !== -1; });

        html += '<div class="info-quest-grid">';
        activeQuests.forEach(function (quest) {
            var progress = quest.checkProgress(state);
            var pct      = Math.min(100, Math.floor((progress.current / progress.target) * 100));
            html += '<div class="info-quest-card">';
            html += '<div class="info-quest-title">' + quest.title + '</div>';
            html += '<div class="info-quest-desc">' + quest.description + '</div>';
            html += '<div class="info-quest-progress">';
            html += '<div class="info-bar-track"><div class="info-bar-fill" style="width:' + pct + '%;background:var(--colour-accent);"></div></div>';
            html += '<span class="info-quest-count">' + progress.current + '\u00A0/\u00A0' + progress.target + '</span>';
            html += '</div>';
            html += '<div class="info-quest-reward">';
            if (quest.reward.money > 0)      html += '\uD83D\uDCB7\u00A0' + UI.formatMoney(quest.reward.money);
            if (quest.reward.reputation > 0) html += (quest.reward.money > 0 ? '\u00A0\u00B7\u00A0' : '') + '+' + quest.reward.reputation + '\u00A0rep';
            html += '</div>';
            html += '</div>';
        });
        if (activeQuests.length === 0) {
            html += '<p class="empty-state" style="padding:0.5rem 0;">\uD83C\uDFC6 All quests complete!</p>';
        }
        html += '</div>'; // info-quest-grid
        html += '</div>'; // info-quest-section
        return html;
    }

    // ── Fish Tracker ─────────────────────────────────────────────────────────

    function renderFishTracker(state) {
        var log   = (state.fishCreationLog || []).slice().reverse();
        var alive = state.fish.filter(function (f) { return f.alive; });

        var RARITY_COLS  = { common:'#aaa', uncommon:'#2ecc71', rare:'#3498db', epic:'#9b59b6', legendary:'#f1c40f', mythic:'#e74c3c' };
        var RARITY_ORDER = ['mythic','legendary','epic','rare','uncommon','common'];
        var SOURCE_META  = {
            breeding: { label: 'Bred',     icon: '\uD83E\uDD5A', colour: '#4a9c6d' },
            shop:     { label: 'Purchased', icon: '\uD83D\uDED2', colour: '#3498db' },
            spawning: { label: 'Spawned',  icon: '\uD83C\uDF31', colour: '#1abc9c' },
            starter:  { label: 'Starter',  icon: '\u2B50',       colour: '#d4a843' }
        };

        var byRarity = {}, bySource = {}, bySpecies = {}, byStage = {};
        alive.forEach(function (f) {
            byRarity[f.rarity]        = (byRarity[f.rarity]        || 0) + 1;
            bySpecies[f.species]      = (bySpecies[f.species]      || 0) + 1;
            byStage[f.growth_stage]   = (byStage[f.growth_stage]   || 0) + 1;
        });
        log.forEach(function (e) { bySource[e.source] = (bySource[e.source] || 0) + 1; });

        var totalValue = typeof Fish !== 'undefined' ? Fish.getTotalStockValue(alive) : 0;
        var avgWeight = 0, avgHealth = 0;
        if (alive.length > 0) {
            avgWeight = Math.round(alive.reduce(function(s,f){ return s + f.weight_oz; }, 0) / alive.length);
            avgHealth = Math.round(alive.reduce(function(s,f){ return s + (f.stats ? f.stats.health : 0); }, 0) / alive.length);
        }
        var curYr     = Math.ceil(state.day / 365);
        var breedable = alive.filter(function(f){ return f.weight_oz > 160 && (!f.lastBreedYear || f.lastBreedYear < curYr); }).length;
        var dead      = state.fish.filter(function(f){ return !f.alive; }).length;

        // Most expensive fish
        var mostExpensive = null, maxVal = 0;
        if (typeof Fish !== 'undefined') {
            alive.forEach(function(f){ var v = Fish.getFishValue(f); if (v > maxVal){ maxVal = v; mostExpensive = f; } });
        }
        // Rarest fish (highest tier, then highest value as tiebreak)
        var rarest = null, bestRarityIdx = -1;
        alive.forEach(function(f){
            var idx = RARITY_ORDER.indexOf(f.rarity);
            if (idx === -1) idx = RARITY_ORDER.length;
            var betterTier     = (bestRarityIdx === -1 || idx < bestRarityIdx);
            var sameTierBetter = (idx === bestRarityIdx && typeof Fish !== 'undefined' && rarest && Fish.getFishValue(f) > Fish.getFishValue(rarest));
            if (betterTier || sameTierBetter) { bestRarityIdx = idx; rarest = f; }
        });

        // ── KPI strip ─────────────────────────────────────────────────────────
        var html = '<div class="fish-tracker-summary">';
        html += '<div class="fish-tracker-kpi"><span class="fish-tracker-kpi-val">' + alive.length + '</span><span class="fish-tracker-kpi-label">Living Fish</span></div>';
        html += '<div class="fish-tracker-kpi"><span class="fish-tracker-kpi-val" style="color:var(--colour-text-muted);">' + dead + '</span><span class="fish-tracker-kpi-label">Deceased</span></div>';
        html += '<div class="fish-tracker-kpi"><span class="fish-tracker-kpi-val">' + log.length + '</span><span class="fish-tracker-kpi-label">Ever Created</span></div>';
        html += '<div class="fish-tracker-kpi"><span class="fish-tracker-kpi-val" style="color:var(--colour-gold);">' + UI.formatMoney(totalValue) + '</span><span class="fish-tracker-kpi-label">Stock Value</span></div>';
        html += '<div class="fish-tracker-kpi"><span class="fish-tracker-kpi-val" style="color:#f1c40f;">' + (byRarity['legendary'] || 0) + '</span><span class="fish-tracker-kpi-label">Legendary</span></div>';
        html += '<div class="fish-tracker-kpi"><span class="fish-tracker-kpi-val" style="color:#e74c3c;">' + (byRarity['mythic'] || 0) + '</span><span class="fish-tracker-kpi-label">Mythic</span></div>';
        var healthColour = avgHealth >= 70 ? 'var(--colour-accent)' : avgHealth >= 40 ? '#d4a843' : 'var(--colour-danger)';
        html += '<div class="fish-tracker-kpi"><span class="fish-tracker-kpi-val">' + (alive.length > 0 ? UI.formatWeight(avgWeight) : '\u2014') + '</span><span class="fish-tracker-kpi-label">Avg Weight</span></div>';
        html += '<div class="fish-tracker-kpi"><span class="fish-tracker-kpi-val" style="color:' + healthColour + ';">' + (alive.length > 0 ? avgHealth : '\u2014') + '</span><span class="fish-tracker-kpi-label">Avg Health</span></div>';
        html += '<div class="fish-tracker-kpi"><span class="fish-tracker-kpi-val" style="color:var(--colour-accent);">' + breedable + '</span><span class="fish-tracker-kpi-label">Breedable</span></div>';
        html += '</div>';

        // ── 3-column breakdown grid ───────────────────────────────────────────
        html += '<div class="fish-tracker-grid">';

        // Col 1 — Rarity + Source
        html += '<div class="fish-tracker-section">';
        html += '<h4 class="fish-tracker-heading">Rarity Breakdown</h4>';
        html += '<div class="fish-tracker-rarity-list">';
        RARITY_ORDER.forEach(function (r) {
            var count = byRarity[r] || 0;
            var col   = RARITY_COLS[r] || '#888';
            var pct   = alive.length > 0 ? Math.round((count / alive.length) * 100) : 0;
            var rd    = typeof Fish !== 'undefined' ? (Fish.RARITIES[r] || { name: r }) : { name: r };
            html += '<div class="fish-tracker-rarity-row">';
            html += '<span class="fish-tracker-rarity-dot" style="background:' + col + ';"></span>';
            html += '<span class="fish-tracker-rarity-name">' + rd.name + '</span>';
            html += '<div class="fish-tracker-bar-track"><div class="fish-tracker-bar-fill" style="width:' + pct + '%;background:' + col + ';"></div></div>';
            html += '<span class="fish-tracker-rarity-count">' + count + '</span>';
            html += '</div>';
        });
        html += '</div>';
        html += '<h4 class="fish-tracker-heading" style="margin-top:0.85rem;">By Source</h4>';
        html += '<div class="fish-tracker-source-list">';
        Object.keys(SOURCE_META).forEach(function (src) {
            var meta  = SOURCE_META[src];
            var count = bySource[src] || 0;
            if (!count) return;
            html += '<div class="fish-tracker-source-row"><span>' + meta.icon + ' ' + meta.label + '</span><span class="fish-tracker-source-count" style="color:' + meta.colour + ';">' + count + '</span></div>';
        });
        html += '</div>';
        html += '</div>';

        // Col 2 — Spotlight cards
        html += '<div class="fish-tracker-section">';
        html += '<h4 class="fish-tracker-heading">\uD83C\uDFC6 Most Expensive Fish</h4>';
        if (mostExpensive && typeof Fish !== 'undefined') {
            var eSpDef = Fish.SPECIES[mostExpensive.species] || { name: mostExpensive.species };
            var eRCol  = RARITY_COLS[mostExpensive.rarity] || '#888';
            var eRName = Fish.RARITIES[mostExpensive.rarity] ? Fish.RARITIES[mostExpensive.rarity].name : mostExpensive.rarity;
            html += '<div class="fish-spotlight-card">';
            html += '<div class="fish-spotlight-name">' + mostExpensive.name + '</div>';
            html += '<div class="fish-spotlight-meta"><span style="color:' + eRCol + ';font-weight:700;">' + eRName + '</span> &middot; ' + eSpDef.name + '</div>';
            html += '<div class="fish-spotlight-stats">';
            html += '<span class="fish-spotlight-stat">\u2696\uFE0F ' + UI.formatWeight(mostExpensive.weight_oz) + '</span>';
            html += '<span class="fish-spotlight-stat">\u2665 Health:\u00A0' + mostExpensive.stats.health + '</span>';
            html += '<span class="fish-spotlight-stat">\uD83D\uDCC5 Age:\u00A0' + mostExpensive.age_days + 'd</span>';
            html += '<span class="fish-spotlight-stat">' + mostExpensive.growth_stage + '</span>';
            html += '</div>';
            if (mostExpensive.personality_traits && mostExpensive.personality_traits.length) {
                html += '<div class="fish-spotlight-traits">';
                mostExpensive.personality_traits.slice(0,3).forEach(function(t){
                    var td = Fish.TRAIT_DEFINITIONS ? Fish.TRAIT_DEFINITIONS[t] : null;
                    var tc = td ? td.colour : '#4a9c6d';
                    html += '<span class="trait-badge" style="border-color:' + tc + ';color:' + tc + ';">' + t + '</span>';
                });
                html += '</div>';
            }
            html += '<div class="fish-spotlight-value">' + UI.formatMoney(maxVal) + '</div>';
            html += '</div>';
        } else { html += '<p class="empty-state">No fish yet.</p>'; }

        html += '<h4 class="fish-tracker-heading" style="margin-top:0.85rem;">\uD83D\uDC8E Rarest Fish</h4>';
        if (rarest && typeof Fish !== 'undefined') {
            var rSpDef = Fish.SPECIES[rarest.species] || { name: rarest.species };
            var rRCol  = RARITY_COLS[rarest.rarity] || '#888';
            var rRName = Fish.RARITIES[rarest.rarity] ? Fish.RARITIES[rarest.rarity].name : rarest.rarity;
            var rVal   = Fish.getFishValue(rarest);
            html += '<div class="fish-spotlight-card">';
            html += '<div class="fish-spotlight-name">' + rarest.name + '</div>';
            html += '<div class="fish-spotlight-meta"><span style="color:' + rRCol + ';font-weight:700;">' + rRName + '</span> &middot; ' + rSpDef.name + '</div>';
            html += '<div class="fish-spotlight-stats">';
            html += '<span class="fish-spotlight-stat">\u2696\uFE0F ' + UI.formatWeight(rarest.weight_oz) + '</span>';
            html += '<span class="fish-spotlight-stat">\u2665 Health:\u00A0' + rarest.stats.health + '</span>';
            html += '<span class="fish-spotlight-stat">\uD83D\uDCC5 Age:\u00A0' + rarest.age_days + 'd</span>';
            html += '<span class="fish-spotlight-stat">' + rarest.growth_stage + '</span>';
            html += '</div>';
            if (rarest.personality_traits && rarest.personality_traits.length) {
                html += '<div class="fish-spotlight-traits">';
                rarest.personality_traits.slice(0,3).forEach(function(t){
                    var td = Fish.TRAIT_DEFINITIONS ? Fish.TRAIT_DEFINITIONS[t] : null;
                    var tc = td ? td.colour : '#4a9c6d';
                    html += '<span class="trait-badge" style="border-color:' + tc + ';color:' + tc + ';">' + t + '</span>';
                });
                html += '</div>';
            }
            html += '<div class="fish-spotlight-value">' + UI.formatMoney(rVal) + '</div>';
            html += '</div>';
        } else { html += '<p class="empty-state">No fish yet.</p>'; }
        html += '</div>';

        // Col 3 — Species + Growth Stages
        html += '<div class="fish-tracker-section">';
        html += '<h4 class="fish-tracker-heading">Species</h4>';
        html += '<div class="fish-tracker-rarity-list">';
        var speciesNames = typeof Fish !== 'undefined' ? Fish.SPECIES : {};
        var speciesKeys  = Object.keys(bySpecies).sort(function(a,b){ return bySpecies[b]-bySpecies[a]; });
        if (speciesKeys.length === 0) {
            html += '<p class="empty-state" style="padding:0.4rem 0;">No fish stocked.</p>';
        } else {
            speciesKeys.forEach(function(sp){
                var count = bySpecies[sp];
                var spDef = speciesNames[sp] || { name: sp, colour: '#888' };
                var pct   = alive.length > 0 ? Math.round((count / alive.length) * 100) : 0;
                html += '<div class="fish-tracker-rarity-row">';
                html += '<span class="fish-tracker-rarity-dot" style="background:' + spDef.colour + ';"></span>';
                html += '<span class="fish-tracker-rarity-name" style="width:90px;">' + spDef.name + '</span>';
                html += '<div class="fish-tracker-bar-track"><div class="fish-tracker-bar-fill" style="width:' + pct + '%;background:' + spDef.colour + ';"></div></div>';
                html += '<span class="fish-tracker-rarity-count">' + count + '</span>';
                html += '</div>';
            });
        }
        html += '</div>';
        html += '<h4 class="fish-tracker-heading" style="margin-top:0.85rem;">Growth Stages</h4>';
        html += '<div class="fish-tracker-source-list">';
        var stageOrder = ['Fry','Juvenile','Adult','Mature','Elder'];
        var stageCols  = { Fry:'#3498db', Juvenile:'#2ecc71', Adult:'#4a9c6d', Mature:'#d4a843', Elder:'#9b59b6' };
        var anyStage   = false;
        stageOrder.forEach(function(s){
            var c = byStage[s] || 0;
            if (!c) return;
            anyStage = true;
            var col = stageCols[s] || '#888';
            html += '<div class="fish-tracker-source-row"><span style="color:' + col + ';">' + s + '</span><span class="fish-tracker-source-count" style="color:' + col + ';">' + c + '</span></div>';
        });
        if (!anyStage) html += '<p class="empty-state" style="padding:0.4rem 0;">No fish stocked.</p>';
        html += '</div>';
        html += '</div>';

        html += '</div>'; // end fish-tracker-grid

        // ── Lake Summary ──────────────────────────────────────────────────────
        if (state.ownedLakes && state.ownedLakes.length > 0 && typeof Lakes !== 'undefined') {
            html += '<div class="fish-tracker-section">';
            html += '<h4 class="fish-tracker-heading">\uD83C\uDFDE\uFE0F Lake Summary</h4>';
            html += '<div class="fish-tracker-lake-grid">';
            state.ownedLakes.forEach(function(lakeId){
                var lake = Lakes.getLakeById(lakeId);
                if (!lake) return;
                var lakeFish     = alive.filter(function(f){ return f.lake_id === lakeId; });
                var expBonus     = Lakes.getLakeExpansionBonus ? Lakes.getLakeExpansionBonus(lakeId) : { capacity:0, income:0, biodiversity:0 };
                var effectiveCap = lake.capacity + (expBonus.capacity || 0);
                var capPct       = effectiveCap > 0 ? Math.round((lakeFish.length / effectiveCap) * 100) : 0;
                var capColor     = capPct < 70 ? '#4a9c6d' : capPct < 90 ? '#d4a843' : '#b83020';
                var lakeVal = 0, topFish = null, topFishVal = 0;
                var lakeByRarity = {};
                lakeFish.forEach(function(f){
                    var v = typeof Fish !== 'undefined' ? Fish.getFishValue(f) : 0;
                    lakeVal += v;
                    lakeByRarity[f.rarity] = (lakeByRarity[f.rarity] || 0) + 1;
                    if (v > topFishVal){ topFishVal = v; topFish = f; }
                });
                var breedInLake   = lakeFish.filter(function(f){ return f.weight_oz > 160 && (!f.lastBreedYear || f.lastBreedYear < curYr); }).length;
                var lakeColour    = typeof Anglers !== 'undefined' && Anglers.getLakeColour ? Anglers.getLakeColour(lakeId) : '#4a9c6d';
                var biodiversity  = lake.biodiversityScore + ((expBonus.biodiversity) || 0);
                var activeAngHere = (state.anglerBookings || []).filter(function(b){ return b.lakeId === lakeId && state.day >= b.startDay && state.day <= b.endDay; }).length;

                html += '<div class="fish-tracker-lake-card">';
                html += '<div class="fish-tracker-lake-header" style="border-left:3px solid ' + lakeColour + ';">';
                html += '<span class="fish-tracker-lake-name">' + lake.name + '</span>';
                html += '<span class="fish-tracker-lake-value">' + UI.formatMoney(lakeVal) + '</span>';
                html += '</div>';

                html += '<div class="fish-tracker-lake-caprow">';
                html += '<span>\uD83D\uDC1F ' + lakeFish.length + '\u00A0/\u00A0' + effectiveCap + '</span>';
                html += '<span style="color:' + capColor + ';font-size:0.72rem;">' + capPct + '%</span>';
                html += '</div>';
                html += '<div class="fish-tracker-bar-track" style="margin:0.25rem 0 0.5rem;"><div class="fish-tracker-bar-fill" style="width:' + Math.min(capPct,100) + '%;background:' + capColor + ';"></div></div>';

                html += '<div class="fish-tracker-lake-inforow">';
                html += '<span>\uD83C\uDF3F Bio:\u00A0' + biodiversity + '/10</span>';
                html += '<span>\uD83C\uDFA3 ' + activeAngHere + '\u00A0anglers</span>';
                html += '<span>\uD83E\uDDEC ' + breedInLake + '\u00A0breedable</span>';
                html += '</div>';

                if (lakeFish.length > 0) {
                    html += '<div class="fish-tracker-lake-chips">';
                    RARITY_ORDER.forEach(function(r){
                        var c = lakeByRarity[r];
                        if (!c) return;
                        var rc = RARITY_COLS[r] || '#888';
                        var rn = Fish.RARITIES && Fish.RARITIES[r] ? Fish.RARITIES[r].name : r;
                        html += '<span class="fish-tracker-rarity-chip" style="background:' + rc + '20;color:' + rc + ';border:1px solid ' + rc + '50;">' + rn + '\u00A0' + c + '</span>';
                    });
                    html += '</div>';
                }

                if (topFish && typeof Fish !== 'undefined') {
                    var tSpName = Fish.SPECIES[topFish.species] ? Fish.SPECIES[topFish.species].name : topFish.species;
                    var tRCol   = RARITY_COLS[topFish.rarity] || '#888';
                    html += '<div class="fish-tracker-lake-topfish">';
                    html += '<span class="fish-tracker-lake-topfish-label">\uD83C\uDFC6 Top:</span>';
                    html += '<span style="color:' + tRCol + ';font-weight:600;">' + topFish.name + '</span>';
                    html += '<span style="color:var(--colour-text-muted);font-size:0.72rem;"> \u00B7 ' + tSpName + ' \u00B7 ' + UI.formatWeight(topFish.weight_oz) + ' \u00B7 ' + UI.formatMoney(topFishVal) + '</span>';
                    html += '</div>';
                }
                html += '</div>'; // lake-card
            });
            html += '</div>'; // lake-grid
            html += '</div>'; // section
        }

        // ── Creation Log (scrollable) ─────────────────────────────────────────
        html += '<div class="fish-tracker-section">';
        html += '<h4 class="fish-tracker-heading">Creation Log <span style="font-size:0.72rem;color:var(--colour-text-muted);font-weight:400;">(' + log.length + ' entries)</span></h4>';
        if (log.length === 0) {
            html += '<p class="empty-state">No fish recorded yet. Buy from the Shop, breed, or claim Willow Pool to get started.</p>';
        } else {
            html += '<div class="fish-tracker-log-scroll">';
            html += '<div class="fish-tracker-log">';
            html += '<div class="fish-tracker-log-header"><span>Day</span><span>Name</span><span>Species</span><span>Rarity</span><span>Value</span><span>Source</span><span>Parents</span></div>';
            log.forEach(function (e) {
                var col       = RARITY_COLS[e.rarity]  || '#888';
                var meta      = SOURCE_META[e.source]   || { label: e.source, icon: '\uD83D\uDC1F', colour: '#888' };
                var rarityDef = typeof Fish !== 'undefined' ? (Fish.RARITIES[e.rarity] || { name: e.rarity }) : { name: e.rarity };
                var isAlive   = alive.some(function (f) { return f.id === e.fishId; });
                var aliveF    = alive.find(function (f) { return f.id === e.fishId; });
                var fishVal   = aliveF && typeof Fish !== 'undefined' ? UI.formatMoney(Fish.getFishValue(aliveF)) : '\u2014';
                html += '<div class="fish-tracker-log-row' + (isAlive ? '' : ' fish-tracker-log-dead') + '">';
                html += '<span class="fish-tracker-log-day">D' + e.day + '</span>';
                html += '<span class="fish-tracker-log-name">' + e.name + (isAlive ? '' : ' \u2020') + '</span>';
                html += '<span class="fish-tracker-log-species">' + e.species + '</span>';
                html += '<span class="fish-tracker-log-rarity" style="color:' + col + ';">' + rarityDef.name + '</span>';
                html += '<span style="color:var(--colour-gold);font-weight:700;">' + fishVal + '</span>';
                html += '<span class="fish-tracker-log-source" style="color:' + meta.colour + ';">' + meta.icon + ' ' + meta.label + '</span>';
                html += '<span class="fish-tracker-log-parents">' + (e.parentNames ? e.parentNames.join(' \xD7 ') : '\u2014') + '</span>';
                html += '</div>';
            });
            html += '</div>';
            html += '</div>';
        }
        html += '</div>';
        return html;
    }


    return {
        initState: initState,
        checkQuests: checkQuests,
        renderDashboard: renderDashboard,
        renderWeatherCard: renderWeatherCard,
        showDashTab: showDashTab,
        showFinanceTab: showFinanceTab,
        showFishLineage: showFishLineage
    };
})();

// ── Fish Lineage Modal ───────────────────────────────────────────────────────
function showFishLineage(fishUid) {
    var state = Game.getState();
    var fish = state.fish.find(function(f){ return f.uid === fishUid; });
    if (!fish) {
        UI.showToast('Fish not found.', 'error');
        return;
    }
    if (typeof Fish === 'undefined' || !Fish.renderLineage) {
        UI.showToast('Lineage system not available.', 'error');
        return;
    }
    var lineageHtml = Fish.renderLineage(fish);

    var modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:1000;display:flex;align-items:center;justify-content:center;padding:2rem;';
    modal.innerHTML = '<div style="background:var(--colour-card);border:2px solid var(--colour-gold);border-radius:14px;max-width:500px;max-height:90vh;overflow-y:auto;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:1rem 1.5rem;border-bottom:1px solid var(--colour-border);">' +
        '<h3 style="margin:0;color:var(--colour-gold);">🧬 Lineage: ' + fish.name + '</h3>' +
        '<button class="btn btn-secondary btn-sm" onclick="this.closest(\'.modal-overlay\').remove()">Close</button>' +
        '</div>' +
        '<div style="padding:1.5rem;">' + lineageHtml + '</div>' +
        '</div>';
    document.body.appendChild(modal);
}

