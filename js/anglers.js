/**
 * Carp Fishing Tycoon - Angler System
 * Pool of anglers, bookings, satisfaction, and fishing match events.
 */

'use strict';

const Anglers = (function () {

    /**
     * Fishing match / competition event types.
     * anglerRange: [min, max] participants. Fee is per angler per day.
     * These book a large chunk of the lake for 1-2 days.
     */
    const MATCH_TYPES = [
        { id: 'club_match',      name: 'Local Carp Club Match',     anglerRange: [8,  12], durationDays: 1, feePerAngler: 14, repBonus: 15 },
        { id: 'charity_day',     name: 'Charity Fishing Day',       anglerRange: [10, 16], durationDays: 1, feePerAngler: 12, repBonus: 25 },
        { id: 'corporate',       name: 'Corporate Fishing Event',   anglerRange: [6,  10], durationDays: 1, feePerAngler: 30, repBonus: 10 },
        { id: 'regional_open',   name: 'Regional Open Match',       anglerRange: [14, 22], durationDays: 2, feePerAngler: 18, repBonus: 30 },
        { id: 'county_champ',    name: 'County Championship',       anglerRange: [18, 30], durationDays: 2, feePerAngler: 22, repBonus: 40 },
        { id: 'specimen_hunt',   name: 'Specimen Hunters Weekend',  anglerRange: [8,  14], durationDays: 2, feePerAngler: 25, repBonus: 20 }
    ];

    /** Base chance per day of a match request being generated. */
    var MATCH_CHANCE = 0.10;

    /**
     * UK-style angler names.
     */
    const ANGLER_POOL = [
        { id: 1,  name: 'Rod Hutchison',    preferred: ['still', 'estate_lake'],     disliked: ['running'],     budget: 35, skill: 7,  socialMedia: 5,  photo: 'img/anglers/rod-hutchison.png'  },
        { id: 2,  name: 'Steve Briggs',     preferred: ['gravel_pit','estate_lake'],  disliked: ['still'],       budget: 50, skill: 9,  socialMedia: 8,  photo: 'img/anglers/steve-briggs.png'  },
        { id: 3,  name: 'Terry Hearn',      preferred: ['gravel_pit','estate_lake'],  disliked: ['running'],     budget: 60, skill: 10, socialMedia: 10, targetHunter: true,  photo: 'img/anglers/terry-hearn.png'  },
        { id: 4,  name: 'Ian Russell',      preferred: ['still','running'],           disliked: ['gravel_pit'],  budget: 30, skill: 6,  socialMedia: 4,  photo: 'img/anglers/ian-russell.png'  },
        { id: 5,  name: 'Danny Fairbrass',  preferred: ['gravel_pit','still'],        disliked: ['running'],     budget: 45, skill: 8,  socialMedia: 9,  targetHunter: true,  photo: 'img/anglers/danny-fairbrass.png'  },
        { id: 6,  name: 'Ali Hamidi',       preferred: ['estate_lake','gravel_pit'],  disliked: ['still'],       budget: 55, skill: 9,  socialMedia: 8,  photo: 'img/anglers/ali-hamidi.png'  },
        { id: 7,  name: 'Alan Blair',       preferred: ['running','still'],           disliked: ['estate_lake'], budget: 40, skill: 7,  socialMedia: 6,  photo: 'img/anglers/alanb2.png'  },
        { id: 8,  name: 'Mark Pitchers',    preferred: ['still','running'],           disliked: ['gravel_pit'],  budget: 25, skill: 5,  socialMedia: 3,  photo: 'img/anglers/mark-pitchers.png'  },
        { id: 9,  name: 'Kev Hewitt',       preferred: ['running','gravel_pit'],      disliked: ['estate_lake'], budget: 35, skill: 6,  socialMedia: 5,  photo: 'img/anglers/kev-hewitt.png'  },
        { id: 10, name: 'Rob Hughes',       preferred: ['estate_lake','still'],       disliked: ['running'],     budget: 50, skill: 8,  socialMedia: 7,  photo: 'img/anglers/robhughes221.png'  },
        { id: 11, name: 'Simon Crow',       preferred: ['gravel_pit','still'],        disliked: ['running'],     budget: 40, skill: 7,  socialMedia: 6,  photo: 'img/anglers/simoncrow22.png'  },
        { id: 12, name: 'Nigel Sharp',      preferred: ['estate_lake','gravel_pit'],  disliked: ['still'],       budget: 55, skill: 9,  socialMedia: 7,  photo: 'img/anglers/nigelsharp11.png'  },
        { id: 13, name: 'Darrell Peck',     preferred: ['gravel_pit','running'],      disliked: ['still'],       budget: 45, skill: 8,  socialMedia: 8,  targetHunter: true, photo: 'img/anglers/darrellp112.png'  },
        { id: 14, name: 'Tom Maker',        preferred: ['still','running'],           disliked: ['gravel_pit'],  budget: 30, skill: 5,  socialMedia: 3  },
        { id: 15, name: 'Harry Charrington',preferred: ['estate_lake','still'],       disliked: ['running'],     budget: 60, skill: 9,  socialMedia: 6,  targetHunter: true },
        { id: 16, name: 'Oz Holness',       preferred: ['gravel_pit','running'],      disliked: ['estate_lake'], budget: 40, skill: 7,  socialMedia: 9  },
        { id: 17, name: 'Martin Bowler',    preferred: ['running','still'],           disliked: ['gravel_pit'],  budget: 35, skill: 6,  socialMedia: 7  },
        { id: 18, name: 'Jim Shelley',      preferred: ['gravel_pit','estate_lake'],  disliked: ['still'],       budget: 50, skill: 8,  socialMedia: 8  },
        { id: 19, name: 'Lee Jackson',      preferred: ['still','gravel_pit'],        disliked: ['running'],     budget: 30, skill: 5,  socialMedia: 4  },
        { id: 20, name: 'Adam Penning',     preferred: ['running','gravel_pit'],      disliked: ['estate_lake'], budget: 35, skill: 6,  socialMedia: 5  },
        { id: 21, name: 'Gary Bayes',       preferred: ['estate_lake','still'],       disliked: ['running'],     budget: 45, skill: 7,  socialMedia: 4  },
        { id: 22, name: 'Ian Chillcott',    preferred: ['gravel_pit','estate_lake'],  disliked: ['running'],     budget: 50, skill: 8,  socialMedia: 7  },
        { id: 23, name: 'Keith Jenkins',    preferred: ['still','running'],           disliked: ['gravel_pit'],  budget: 25, skill: 4,  socialMedia: 3  },
        { id: 24, name: 'Paul Forward',     preferred: ['running','still'],           disliked: ['estate_lake'], budget: 30, skill: 5,  socialMedia: 4  },
        { id: 25, name: 'Jeffrey Curry',    preferred: ['gravel_pit','estate_lake'],  disliked: ['running'],     budget: 55, skill: 9,  socialMedia: 6  },
        { id: 26, name: 'Lee Warner',       preferred: ['still','gravel_pit'],        disliked: ['estate_lake'], budget: 40, skill: 7,  socialMedia: 7  },
        { id: 27, name: 'Ste Black',        preferred: ['running','gravel_pit'],      disliked: ['still'],       budget: 45, skill: 8,  socialMedia: 8,  targetHunter: true }
    ];

    /**
     * Initialise angler state fields if missing.
     */
    function initState() {
        var state = Game.getState();
        if (!state.anglerBookings) state.anglerBookings = [];
        if (!state.anglerSatisfaction) state.anglerSatisfaction = {};
        if (!state.pendingBookings) state.pendingBookings = [];
        if (!state.incomeHistory) state.incomeHistory = [];
    }

    /** Sub-tab state */
    var _anglerView = 'bookings'; // 'bookings' | 'roster' | 'sponsorships' | 'leaderboard'

    function showAnglerView(view) {
        _anglerView = view;
        renderAnglers();
    }
    function getAnglerById(id) {
        return ANGLER_POOL.find(function (a) { return a.id === id; }) || null;
    }

    /**
     * Get all anglers.
     */
    function getAllAnglers() {
        return ANGLER_POOL;
    }

    /**
     * Generate new booking requests for the current day.
     * Anglers request bookings for lakes that match their preferred water types.
     */
    function generateBookingRequests() {
        initState();
        var state = Game.getState();
        if (state.ownedLakes.length === 0) return;

        // Determine which anglers are currently booked
        var bookedAnglerIds = [];
        state.anglerBookings.forEach(function (booking) {
            if (booking.endDay >= state.day) {
                bookedAnglerIds.push(booking.anglerId);
            }
        });
        // Also check pending
        state.pendingBookings.forEach(function (booking) {
            bookedAnglerIds.push(booking.anglerId);
        });

        // Each available angler has a chance to request a booking
        var availableAnglers = ANGLER_POOL.filter(function (a) {
            return bookedAnglerIds.indexOf(a.id) === -1;
        });

        // Booking volume scales with reputation up to pool size cap
        var baseMax     = Math.min(ANGLER_POOL.length, Math.floor(state.reputation / 100) + 2);
        var assistBonus = typeof Staff !== 'undefined' ? Staff.getAssistantBookingBonus() : 0;

        // Lakeside marketing maintenance adds booking volume
        var mktBonus = 0;
        if (typeof Lakes !== 'undefined') {
            state.ownedLakes.forEach(function (lkId) {
                mktBonus = Math.max(mktBonus, Lakes.getLakeMaintenanceEffect(lkId, 'bookingBonus'));
            });
        }
        var maxRequests = baseMax + assistBonus + Math.round(mktBonus * 3);

        var requestCount = Math.floor(Math.random() * (maxRequests + 1));

        // Scale requests by combined season + weather modifier.
        if (typeof Weather !== 'undefined') {
            var weatherMod = Weather.getAnglerModifier();
            requestCount = Math.max(0, Math.round(requestCount * (1 + weatherMod)));
        }

        // Further scale by any active marketing campaigns.
        if (typeof Finance !== 'undefined') {
            var marketingMod = Finance.getMarketingBookingModifier();
            if (marketingMod > 0) {
                requestCount = Math.max(requestCount, Math.round(requestCount * (1 + marketingMod)));
                // Marketing guarantees at least 1 request if campaigns are running and rep > 0
                if (requestCount === 0 && state.reputation > 0) requestCount = 1;
            }
        }

        var shuffled = availableAnglers.slice().sort(function () { return Math.random() - 0.5; });
        var selected = shuffled.slice(0, requestCount);

        selected.forEach(function (angler) {
            // Target Hunter anglers prefer lakes with 40lb+ (640oz) fish
            var targetLake;
            if (angler.targetHunter) {
                var lakesWithTargets = state.ownedLakes.filter(function(lakeId){
                    var lake = Lakes.getLakeById(lakeId);
                    if (!lake) return false;
                    if (angler.disliked.indexOf(lake.waterType) !== -1) return false;
                    return state.fish.some(function(f){ return f.alive && f.lake_id === lakeId && f.weight_oz >= 640; });
                });
                if (lakesWithTargets.length > 0) {
                    targetLake = lakesWithTargets[Math.floor(Math.random() * lakesWithTargets.length)];
                }
            }

            if (!targetLake) {
            // Find a matching lake (normal logic)
            var matchingLakes = state.ownedLakes.filter(function (lakeId) {
                var lake = Lakes.getLakeById(lakeId);
                if (!lake) return false;
                return angler.preferred.indexOf(lake.waterType) !== -1;
            });

            // If no preferred lake, try non-disliked
            if (matchingLakes.length === 0) {
                matchingLakes = state.ownedLakes.filter(function (lakeId) {
                    var lake = Lakes.getLakeById(lakeId);
                    if (!lake) return false;
                    return angler.disliked.indexOf(lake.waterType) === -1;
                });
            }

            if (matchingLakes.length === 0) return;
            targetLake = matchingLakes[Math.floor(Math.random() * matchingLakes.length)];
            }

            var advanceDays = Math.floor(Math.random() * 14) + 1; // book 1–14 days ahead
            var duration    = Math.floor(Math.random() * 14) + 1; // stay 1–14 days
            var startDay    = state.day + advanceDays;
            var endDay      = startDay + duration - 1;

            var lake       = Lakes.getLakeById(targetLake);

            // Auto-book immediately — no player input required
            state.anglerBookings.push({
                anglerId:     angler.id,
                anglerName:   angler.name,
                lakeId:       targetLake,
                startDay:     startDay,
                endDay:       endDay,
                duration:     duration,
                dailyRate:    angler.budget,
                satisfaction: 50
            });

            Game.addNotification(
                '\uD83D\uDCCB ' + angler.name + ' auto-booked at ' +
                (lake ? lake.name : targetLake) + ' for ' +
                duration + ' day' + (duration > 1 ? 's' : '') + '.'
            );
        });

        // Separately roll for a fishing match / competition event
        generateMatchRequest();
    }

    /**
     * Occasionally generate a fishing match / competition booking request.
     * Matches book a large portion of a lake for 1-2 days.
     */
    function generateMatchRequest() {
        var state = Game.getState();
        if (state.ownedLakes.length === 0) return;
        if (state.reputation < 5) return;  // need a little credibility first

        // Only allow 1 pending match at a time
        var hasPending = state.pendingBookings.some(function (b) { return b.isMatch; });
        if (hasPending) return;

        // Scale chance slightly with reputation
        var chance = Math.min(0.25, MATCH_CHANCE + (state.reputation / 2000));
        if (Math.random() > chance) return;

        // Pick a random match type
        var matchType = MATCH_TYPES[Math.floor(Math.random() * MATCH_TYPES.length)];

        // Pick a lake — prefer the most prestigious one available
        var lakeId = state.ownedLakes[state.ownedLakes.length - 1];
        var lake   = Lakes.getLakeById(lakeId);
        if (!lake) return;

        // Number of anglers (respect lake capacity roughly)
        var capPenalty = (state.capacityPenalties && state.capacityPenalties[lakeId])
            ? (state.capacityPenalties[lakeId].amount || 0) : 0;
        var available = lake.capacity - capPenalty;
        var min = matchType.anglerRange[0];
        var max = Math.min(matchType.anglerRange[1], available);
        if (max < min) max = min;
        var anglerCount = min + Math.floor(Math.random() * (max - min + 1));

        var totalFee = anglerCount * matchType.feePerAngler * matchType.durationDays;

        // Auto-book the match immediately
        state.anglerBookings.push({
            isMatch:      true,
            matchTypeId:  matchType.id,
            anglerName:   matchType.name,
            matchName:    matchType.name,
            lakeId:       lakeId,
            anglerCount:  anglerCount,
            duration:     matchType.durationDays,
            dailyRate:    Math.round(totalFee / matchType.durationDays),
            totalFee:     totalFee,
            repBonus:     matchType.repBonus,
            startDay:     state.day + 2,
            endDay:       state.day + 1 + matchType.durationDays,
            satisfaction: 70,
            anglerId:     -1
        });

        Game.addNotification(
            '\uD83C\uDFC6 ' + matchType.name + ' auto-booked at ' + lake.name +
            ' \u2014 ' + anglerCount + ' anglers, ' + matchType.durationDays +
            ' day' + (matchType.durationDays > 1 ? 's' : '') +
            ', ' + UI.formatMoney(totalFee) + ' total.'
        );
        UI.showToast('\uD83C\uDFC6 ' + matchType.name + ' booked!', 'success');
    }

    /**
     * Accept a pending booking (individual or match).
     */
    function acceptBooking(index) {
        initState();
        var state = Game.getState();
        if (index < 0 || index >= state.pendingBookings.length) return;

        var booking = state.pendingBookings.splice(index, 1)[0];
        state.anglerBookings.push({
            anglerId: booking.anglerId,
            anglerName: booking.anglerName,
            lakeId: booking.lakeId,
            startDay: booking.startDay,
            endDay: booking.startDay + booking.duration - 1,
            duration: booking.duration,
            dailyRate: booking.dailyRate,
            satisfaction: 50 // Start at neutral
        });

        UI.showToast(booking.anglerName + ' booked for ' + booking.duration + ' day' + (booking.duration > 1 ? 's' : '') + '!', 'success');
        Game.saveToStorage();
        renderAnglers();
    }

    /**
     * Decline a pending booking.
     */
    function declineBooking(index) {
        initState();
        var state = Game.getState();
        if (index < 0 || index >= state.pendingBookings.length) return;

        var booking = state.pendingBookings.splice(index, 1)[0];
        UI.showToast(booking.anglerName + '\'s booking declined.', 'warning');
        Game.saveToStorage();
        renderAnglers();
    }

    /**
     * Process daily angler bookings - run on nextDay().
     * Anglers fish, pay daily rate, update satisfaction.
     */
    function processDailyBookings() {
        initState();
        var state = Game.getState();
        var dailyAnglerIncome = 0;
        var activeAnglerCount = 0;

        state.anglerBookings.forEach(function (booking) {
            if (state.day >= booking.startDay && state.day <= booking.endDay) {
                // Angler is active today
                activeAnglerCount++;
                dailyAnglerIncome += booking.dailyRate;

                // Calculate satisfaction based on lake quality
                var lake = Lakes.getLakeById(booking.lakeId);
                var angler = getAnglerById(booking.anglerId);
                if (lake && angler) {
                    var satisfactionChange = 0;

                    // Preferred water type bonus
                    if (angler.preferred.indexOf(lake.waterType) !== -1) {
                        satisfactionChange += 5;
                    }
                    // Disliked water type penalty
                    if (angler.disliked.indexOf(lake.waterType) !== -1) {
                        satisfactionChange -= 10;
                    }

                    // Biodiversity bonus
                    satisfactionChange += Math.floor(lake.biodiversityScore / 3);

                    // Fish availability bonus
                    var fishInLake = state.fish.filter(function (f) {
                        return f.alive && f.lake_id === booking.lakeId;
                    }).length;
                    if (fishInLake > 5) satisfactionChange += 2;
                    if (fishInLake > 15) satisfactionChange += 3;

                    // Upgrades bonus
                    if (typeof Shop !== 'undefined' && Shop.lakeHasUpgrade(booking.lakeId, 'swim_platforms')) {
                        satisfactionChange += 3;
                    }

                    booking.satisfaction = Math.max(0, Math.min(100, booking.satisfaction + satisfactionChange));

                    // Weather affects on-site angler comfort
                    if (typeof Weather !== 'undefined') {
                        var weatherSatMod = Weather.getAnglerSatisfactionMod();
                        booking.satisfaction = Math.max(0, Math.min(100, booking.satisfaction + weatherSatMod));
                    }

                    // Lake Manager staff bonus
                    if (typeof Staff !== 'undefined') {
                        var managerBonus = Staff.getLakeManagerSatisfactionBonus(booking.lakeId);
                        booking.satisfaction = Math.max(0, Math.min(100, booking.satisfaction + managerBonus));
                        var assistantBonus = Staff.getAssistantSatisfactionBonus
                            ? Staff.getAssistantSatisfactionBonus() : 0;
                        booking.satisfaction = Math.max(0, Math.min(100, booking.satisfaction + assistantBonus));
                    }

                    // Grounds maintenance satisfaction bonus
                    if (typeof Lakes !== 'undefined') {
                        var groundsSat = Lakes.getLakeMaintenanceEffect(booking.lakeId, 'anglerSatisfactionBonus');
                        if (groundsSat > 0) {
                            booking.satisfaction = Math.max(0, Math.min(100, booking.satisfaction + groundsSat));
                        }
                    }
                }
            }
        });

        // Add angler income
        if (dailyAnglerIncome > 0) {
            state.money += dailyAnglerIncome;
            state.totalEarnings += dailyAnglerIncome;
            Game.addNotification('Earned ' + UI.formatMoney(dailyAnglerIncome) + ' from ' + activeAnglerCount + ' angler' + (activeAnglerCount > 1 ? 's' : '') + ' today.');
            if (typeof Finance !== 'undefined') {
                Finance.addFinanceLog('angler_income', dailyAnglerIncome,
                    'Angler income (' + activeAnglerCount + ' active)');
            }
        }

        // Process completed bookings - update reputation
        var completedBookings = [];
        state.anglerBookings = state.anglerBookings.filter(function (booking) {
            if (state.day > booking.endDay) {
                completedBookings.push(booking);
                return false;
            }
            return true;
        });

        completedBookings.forEach(function (booking) {
            if (booking.isMatch) {
                // Match completion: record result + fishery cut
                recordMatchResult(booking);
                var repGain = (booking.repBonus || 15) + (booking.satisfaction >= 70 ? 10 : 0);
                Game.addReputation(repGain);
                Game.addNotification(
                    '\uD83C\uDFC6 ' + booking.matchName + ' completed at ' +
                    ((typeof Lakes !== 'undefined' && Lakes.getLakeById(booking.lakeId))
                        ? Lakes.getLakeById(booking.lakeId).name : 'your lake') +
                    '! +' + repGain + ' reputation.'
                );
                UI.showToast(booking.matchName + ' completed! +' + repGain + ' rep', 'success');
            } else if (booking.satisfaction >= 70) {
                Game.addReputation(5);
                Game.addNotification(booking.anglerName + ' left very satisfied! (+5 reputation)');
                // Record visit stats for leaderboard
                if (booking.lakeId) recordAnglerVisit(booking.anglerName, booking.lakeId, 1);
            } else if (booking.satisfaction >= 40) {
                Game.addReputation(2);
                Game.addNotification(booking.anglerName + ' had a decent visit. (+100 reputation)');
            } else {
                Game.addNotification(booking.anglerName + ' left unhappy. (-100 reputation)');
                var state2 = Game.getState();
                state2.reputation = Math.max(0, state2.reputation - 2);
            }        });

        // Remove expired pending bookings (older than 2 days)
        state.pendingBookings = state.pendingBookings.filter(function (b) {
            return state.day - b.requestedOn <= 2;
        });

        // Track active anglers count for dashboard
        state.anglers = state.anglerBookings.filter(function (b) {
            return state.day >= b.startDay && state.day <= b.endDay;
        });

        // Track income history for charts
        if (!state.incomeHistory) state.incomeHistory = [];
        state.incomeHistory.push({ day: state.day, income: dailyAnglerIncome });
        // Keep only last 14 days
        if (state.incomeHistory.length > 14) {
            state.incomeHistory = state.incomeHistory.slice(-14);
        }

        // Process sponsorship payments
        processDailySponsorship();

        return dailyAnglerIncome;
    }

    /**
     * Get lake colour for calendar display.
     */
    function getLakeColour(lakeId) {
        var colours = {
            'willow_pool': '#4a9c6d',
            'oakmere_lake': '#3498db',
            'kingfisher_waters': '#2ecc71',
            'linch_hill': '#e67e22',
            'wraysbury': '#9b59b6',
            'yateley': '#e74c3c',
            'redmire_pool': '#d4a843',
            'savay_lake': '#1abc9c'
        };
        return colours[lakeId] || '#4a9c6d';
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
     * Render the Anglers panel — fully automated booking system.
     */
    function renderAnglers() {
        initState();
        var state = Game.getState();
        var container = document.getElementById('panel-anglers');

        var html = '<h2>Anglers</h2>';

        // Sub-tab bar
        html += '<div class="dash-subtabs">';
        html += '<button class="dash-subtab' + (_anglerView === 'bookings' ? ' dash-subtab-active' : '') +
                '" onclick="Anglers.showAnglerView(\'bookings\')">\uD83C\uDFA3 Bookings</button>';
        html += '<button class="dash-subtab' + (_anglerView === 'roster' ? ' dash-subtab-active' : '') +
                '" onclick="Anglers.showAnglerView(\'roster\')">\uD83D\uDCCB Roster</button>';
        html += '<button class="dash-subtab' + (_anglerView === 'sponsorships' ? ' dash-subtab-active' : '') +
                '" onclick="Anglers.showAnglerView(\'sponsorships\')">\uD83E\uDD1D Sponsorships</button>';
        html += '<button class="dash-subtab' + (_anglerView === 'leaderboard' ? ' dash-subtab-active' : '') +
                '" onclick="Anglers.showAnglerView(\'leaderboard\')">\uD83C\uDFC6 Leaderboard</button>';
        html += '</div>';

        if (_anglerView === 'roster') {
            html += renderRosterTab(state);
            container.innerHTML = html;
            return;
        }
        if (_anglerView === 'sponsorships') {
            html += renderSponsorshipsTab(state);
            container.innerHTML = html;
            return;
        }
        if (_anglerView === 'leaderboard') {
            html += renderLeaderboardTab(state);
            container.innerHTML = html;
            return;
        }

        // Auto-booking info banner
        html += '<div class="auto-booking-banner">';
        html += '<span class="auto-booking-icon">\uD83E\uDD16</span>';
        html += '<div>';
        html += '<strong>Bookings are fully automated.</strong>';
        html += ' Anglers and competitions are booked in automatically each day based on your reputation, season, and weather.';
        html += '</div>';
        html += '</div>';

        // Today's summary
        var todayActive = state.anglerBookings.filter(function (b) {
            return state.day >= b.startDay && state.day <= b.endDay;
        });
        var todayIncome = todayActive.reduce(function (s, b) { return s + b.dailyRate; }, 0);
        var todayMatches = todayActive.filter(function (b) { return b.isMatch; });

        html += '<div class="angler-today-strip">';
        html += '<div class="angler-today-stat"><span class="angler-today-val">' + todayActive.length + '</span><span class="angler-today-label">On-Site Today</span></div>';
        html += '<div class="angler-today-stat"><span class="angler-today-val">' + UI.formatMoney(todayIncome) + '</span><span class="angler-today-label">Today\'s Income</span></div>';
        html += '<div class="angler-today-stat"><span class="angler-today-val">' + todayMatches.length + '</span><span class="angler-today-label">Active Matches</span></div>';
        html += '</div>';

        // Calendar — one per lake
        html += '<h3 class="section-heading">Booking Calendar</h3>';
        html += renderCalendar();

        // Active Bookings
        html += '<h3 class="section-heading">Active Bookings</h3>';
        var activeBookings = state.anglerBookings.filter(function (b) {
            return state.day <= b.endDay;
        });
        if (activeBookings.length === 0) {
            html += '<p class="empty-state">No active bookings. Advance a day to generate new ones.</p>';
        } else {
            html += '<div class="active-bookings-list">';
            activeBookings.forEach(function (booking) {
                var lake     = Lakes.getLakeById(booking.lakeId);
                var angler   = getAnglerById(booking.anglerId);
                var sm       = angler ? (angler.socialMedia || 5) : 5;
                var daysLeft = booking.endDay - state.day + 1;
                var sat      = booking.satisfaction || 50;
                var borderCol = booking.isMatch ? 'var(--colour-gold)' : getLakeColour(booking.lakeId);

                // Marketing impact: social score × satisfaction modifier
                // High social + high satisfaction = big positive reach
                // Low social or low satisfaction = minimal/negative
                var satMod     = (sat - 50) / 50;           // -1 to +1
                var mktImpact  = Math.round(sm * (1 + satMod));  // 0–20 range
                var mktCol     = mktImpact >= 8 ? 'var(--colour-accent)' : mktImpact >= 5 ? '#d4a843' : 'var(--colour-danger)';
                var mktLabel   = mktImpact >= 8 ? '\u2B06 Boosting' : mktImpact >= 5 ? '\u2192 Neutral' : '\u2B07 Weak';
                var smCol      = sm >= 8 ? '#f1c40f' : sm >= 6 ? '#2ecc71' : '#aaa';

                html += '<div class="active-booking-card" style="border-left-color:' + borderCol + ';">';
                html += '<strong>' + (booking.isMatch ? '\uD83C\uDFC6 ' : '') + booking.anglerName + '</strong>';
                html += '<span class="booking-lake-tag" style="background:' + getLakeColour(booking.lakeId) + ';">' + (lake ? lake.name : 'Unknown') + '</span>';
                html += '<span>' + daysLeft + ' day' + (daysLeft > 1 ? 's' : '') + ' left</span>';
                html += '<span class="booking-satisfaction">Sat: ' + sat + '%</span>';
                html += '<span class="booking-social" style="color:' + smCol + ';">\uD83D\uDCF1 ' + sm + '/10</span>';
                html += '<span class="booking-mkt-impact" style="color:' + mktCol + ';" title="Marketing impact from this visit">' + mktLabel + '\u00A0(' + mktImpact + ')</span>';
                html += '</div>';
            });
            html += '</div>';
        }

        // Angler Pool
        html += '<h3 class="section-heading">Angler Pool</h3>';
        html += '<div class="angler-pool-grid">';
        ANGLER_POOL.forEach(function (angler) {
            var isBooked = state.anglerBookings.some(function (b) {
                return b.anglerId === angler.id && state.day <= b.endDay;
            });
            html += '<div class="angler-card' + (isBooked ? ' angler-booked' : '') + '">';
            html += '<div class="angler-card-name">' + angler.name + '</div>';
            html += '<div class="angler-photo-slot">' + (angler.photo ? '<img src="' + angler.photo + '" alt="' + angler.name + '" class="angler-photo-img" loading="lazy"/>' : '<div class="angler-photo-placeholder">' + angler.name.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2).toUpperCase() + '</div>') + '</div>';
            html += '<div class="angler-card-info">';
            html += '<span class="angler-skill-badge">Skill ' + angler.skill + '/10</span>';
            html += '<span class="angler-social-badge" style="color:' + (angler.socialMedia >= 8 ? '#f1c40f' : angler.socialMedia >= 6 ? '#2ecc71' : '#aaa') + ';">\uD83D\uDCF1 ' + angler.socialMedia + '/10</span>';
            html += '<span class="angler-budget-badge">' + UI.formatMoney(angler.budget) + '/day</span>';
            html += '</div>';
            html += '<div class="angler-card-prefs">';
            html += '<span class="pref-label">Likes:</span> ' + angler.preferred.map(formatWaterType).join(', ');
            html += '</div>';
            html += '<div class="angler-card-prefs angler-dislikes">';
            html += '<span class="pref-label">Dislikes:</span> ' + angler.disliked.map(formatWaterType).join(', ');
            html += '</div>';
            if (isBooked) {
                html += '<div class="angler-status-tag">Currently Booked</div>';
            }
            html += '<button class="angler-more-btn">More Info</button>';
            html += '</div>';
        });
        html += '</div>';

        container.innerHTML = html;
    }

    /**
     * Render one compact 14-day calendar per owned lake.
     * Each day cell stacks all anglers booked that day as small chips.
     */
    function renderCalendar() {
        var state = Game.getState();
        if (state.ownedLakes.length === 0) {
            return '<p class="empty-state">Own a lake to see bookings.</p>';
        }

        var DAYS = 14;
        var html = '<div class="cal-lake-grid">';

        state.ownedLakes.forEach(function (lakeId) {
            var lake      = typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
            var lakeCol   = getLakeColour(lakeId);
            var lakeName  = lake ? lake.name : lakeId;

            // Bookings that touch this lake and this window
            var lakeBookings = state.anglerBookings.filter(function (b) {
                return b.lakeId === lakeId &&
                       b.endDay >= state.day &&
                       b.startDay <= state.day + DAYS - 1;
            });

            html += '<div class="cal-lake-block">';
            html += '<div class="cal-lake-title" style="border-color:' + lakeCol + ';">' + lakeName;
            html += '<span class="cal-lake-count">' + lakeBookings.length + ' booking' + (lakeBookings.length === 1 ? '' : 's') + '</span>';
            html += '</div>';

            html += '<div class="cal-grid">';

            // Header row — dates
            html += '<div class="cal-header-row">';
            for (var d = 0; d < DAYS; d++) {
                var dayNum    = state.day + d;
                var isClosed  = state.lakeClosures && state.lakeClosures[lakeId] && state.lakeClosures[lakeId] >= dayNum;
                var dateLabel = typeof UI !== 'undefined' && UI.formatGameDate ? UI.formatGameDate(dayNum).replace(/ Y\d+/, '') : 'D' + dayNum;
                html += '<div class="cal-header-cell' + (d === 0 ? ' cal-today' : '') + (isClosed ? ' cal-closed' : '') + '">' +
                        dateLabel + '</div>';
            }
            html += '</div>';

            // Body row — anglers per day
            html += '<div class="cal-body-row">';
            for (var d2 = 0; d2 < DAYS; d2++) {
                var dayNum2   = state.day + d2;
                var isClosed2 = state.lakeClosures && state.lakeClosures[lakeId] && state.lakeClosures[lakeId] >= dayNum2;
                html += '<div class="cal-day-cell' + (isClosed2 ? ' cal-day-closed' : '') + '">';
                if (isClosed2) {
                    html += '<span class="cal-chip cal-chip-closed">\uD83D\uDEAB</span>';
                } else {
                    lakeBookings.forEach(function (b) {
                        if (dayNum2 < b.startDay || dayNum2 > b.endDay) return;
                        var isMatch   = b.isMatch;
                        var firstName = b.anglerName.split(' ')[0];
                        html += '<span class="cal-chip' + (isMatch ? ' cal-chip-match' : '') + '">' +
                                (isMatch ? '\uD83C\uDFC6 ' : '') + firstName + '</span>';
                    });
                }
                html += '</div>';
            }
            html += '</div>';
            html += '</div>'; // cal-grid
            html += '</div>'; // cal-lake-block
        });

        html += '</div>'; // cal-lake-grid
        return html;
    }

    // ── Sponsorship system ────────────────────────────────────────────────────

    var SPONSORSHIP_SALARY_MIN  = 100;
    var SPONSORSHIP_SALARY_MAX  = 2000;
    var SPONSORSHIP_BAIT_MIN    = 50;
    var SPONSORSHIP_BAIT_MAX    = 500;

    function offerSponsorship(anglerId, salary, baitBudget, months) {
        var state  = Game.getState();
        var angler = getAnglerById(anglerId);
        if (!angler) { UI.showToast('Angler not found.', 'error'); return; }

        if ((state.sponsorships || []).filter(function (s) { return !s.ended; }).length >= 3) {
            UI.showToast('Already at maximum 3 sponsorships.', 'warning'); return;
        }
        if ((state.sponsorships || []).some(function (s) { return s.anglerId === anglerId && !s.ended; })) {
            UI.showToast(angler.name + ' is already sponsored.', 'warning'); return;
        }

        salary     = Math.max(SPONSORSHIP_SALARY_MIN, Math.min(SPONSORSHIP_SALARY_MAX, parseInt(salary) || 500));
        baitBudget = Math.max(SPONSORSHIP_BAIT_MIN,   Math.min(SPONSORSHIP_BAIT_MAX,   parseInt(baitBudget) || 150));
        months     = (months === 12) ? 12 : 6;

        var totalCost = (salary + baitBudget) * months;
        var signing   = Math.round(salary * 0.5);

        if (state.money < signing) {
            UI.showToast('Need ' + UI.formatMoney(signing) + ' signing bonus upfront.', 'error'); return;
        }
        state.money      -= signing;
        state.totalSpent += signing;
        if (typeof Finance !== 'undefined') {
            Finance.addFinanceLog('hiring_cost', -signing, 'Sponsorship signing: ' + angler.name);
        }

        if (!state.sponsorships) state.sponsorships = [];
        state.sponsorships.push({
            id:          state.nextSponsorshipId++,
            anglerId:    anglerId,
            anglerName:  angler.name,
            salary:      salary,
            baitBudget:  baitBudget,
            months:      months,
            startDay:    state.day,
            endDay:      state.day + months * 30,
            nextPayDay:  state.day + 30,
            totalPaid:   signing,
            ended:       false,
            signingFee:  signing
        });

        Game.saveToStorage();
        UI.showToast('\uD83E\uDD1D ' + angler.name + ' signed for ' + months + ' months!', 'success');
        Game.addNotification('\uD83E\uDD1D Sponsorship signed: ' + angler.name + ' — ' +
            UI.formatMoney(salary) + '/month salary + ' + UI.formatMoney(baitBudget) + '/month bait.');
        renderAnglers();
    }

    function cancelSponsorship(sponsorshipId) {
        var state = Game.getState();
        var sp    = (state.sponsorships || []).find(function (s) { return s.id === sponsorshipId; });
        if (!sp) return;
        sp.ended = true;
        UI.showToast(sp.anglerName + '\'s sponsorship cancelled.', 'warning');
        Game.saveToStorage();
        renderAnglers();
    }

    function processDailySponsorship() {
        var state = Game.getState();
        if (!state.sponsorships || state.sponsorships.length === 0) return;

        state.sponsorships.forEach(function (sp) {
            if (sp.ended) return;

            // Contract expired
            if (state.day >= sp.endDay) {
                sp.ended = true;
                Game.addNotification('\uD83E\uDD1D ' + sp.anglerName + '\'s ' + sp.months + '-month sponsorship has ended.');
                return;
            }

            // ── Daily social media return ────────────────────────────────────
            // Income return: salary/30 * (socialMedia/5)  — profitable at socialMedia >= 6
            // Reputation:    socialMedia * 0.25 / day (accumulates via reputationAccumulator)
            var angler      = getAnglerById(sp.anglerId);
            var sm          = angler ? (angler.socialMedia || 5) : 5;
            var dailyIncome = Math.round((sp.salary / 30) * (sm / 5));
            var dailyRep    = sm * 0.25;

            if (dailyIncome > 0) {
                state.money         += dailyIncome;
                state.totalEarnings += dailyIncome;
                if (typeof Finance !== 'undefined') {
                    Finance.addFinanceLog('angler_income', dailyIncome, sp.anglerName + ' social reach income');
                }
            }
            if (dailyRep > 0) {
                if (!state.reputationAccumulator) state.reputationAccumulator = 0;
                state.reputationAccumulator += dailyRep;
                if (state.reputationAccumulator >= 1) {
                    var whole = Math.floor(state.reputationAccumulator);
                    Game.addReputation(whole);
                    state.reputationAccumulator -= whole;
                }
            }

            // Monthly salary + bait payment
            if (state.day >= sp.nextPayDay) {
                var payment = sp.salary + sp.baitBudget;
                state.money      = Math.max(0, state.money - payment);
                state.totalSpent += payment;
                sp.totalPaid     += payment;
                sp.nextPayDay    += 30;
                if (typeof Finance !== 'undefined') {
                    Finance.addFinanceLog('hiring_cost', -payment, sp.anglerName + ' monthly sponsorship');
                }
                // Monthly summary notification
                var monthlyReturn = dailyIncome * 30;
                var profit = monthlyReturn - payment;
                Game.addNotification('\uD83E\uDD1D Paid ' + UI.formatMoney(payment) + ' to ' + sp.anglerName +
                    ' \u2014 social reach earned ' + UI.formatMoney(monthlyReturn) +
                    ' (' + (profit >= 0 ? '+' : '') + UI.formatMoney(profit) + ').');
            }
        });
    }

    function getSponsoredAnglerIds() {
        var state = Game.getState();
        return (state.sponsorships || []).filter(function (s) { return !s.ended; }).map(function (s) { return s.anglerId; });
    }

    // ── Angler stats / leaderboard ────────────────────────────────────────────

    function recordAnglerVisit(anglerName, lakeId, daysActive) {
        var state = Game.getState();
        if (!state.anglerStats) state.anglerStats = {};
        if (!state.anglerStats[anglerName]) {
            state.anglerStats[anglerName] = { fishCaught: 0, biggestFishOz: 0, wins: 0, winnings: 0, visits: 0 };
        }
        var stats = state.anglerStats[anglerName];
        stats.visits++;

        // Simulate fish caught based on lake stock
        var lakeFish = state.fish.filter(function (f) { return f.alive && f.lake_id === lakeId; });
        var catchCount = Math.floor(Math.random() * 3) + (lakeFish.length > 10 ? 1 : 0);
        stats.fishCaught += catchCount;

        // Simulate biggest fish caught
        if (lakeFish.length > 0 && Math.random() < 0.5) {
            var caught = lakeFish[Math.floor(Math.random() * lakeFish.length)];
            if (caught.weight_oz > stats.biggestFishOz) {
                stats.biggestFishOz = caught.weight_oz;
            }
        }
    }

    function recordMatchResult(matchBooking) {
        var state   = Game.getState();
        var cut     = state.tournamentCut || 0.20;
        var pool    = Math.round(matchBooking.totalFee * 2); // prize pool = 2× entry fees
        var fishery = Math.round(pool * cut);
        var winner  = Math.round(pool * (1 - cut));

        // Pick winner from known anglers weighted by skill
        var candidates = ANGLER_POOL.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 5);
        var winnerAngler = candidates.reduce(function (best, a) { return a.skill > best.skill ? a : best; });

        if (!state.anglerStats) state.anglerStats = {};
        if (!state.anglerStats[winnerAngler.name]) {
            state.anglerStats[winnerAngler.name] = { fishCaught: 0, biggestFishOz: 0, wins: 0, winnings: 0, visits: 0 };
        }
        state.anglerStats[winnerAngler.name].wins++;
        state.anglerStats[winnerAngler.name].winnings += winner;

        // Fishery receives cut
        state.money         += fishery;
        state.totalEarnings += fishery;
        if (typeof Finance !== 'undefined') {
            Finance.addFinanceLog('fish_sale', fishery, matchBooking.matchName + ' prize cut');
        }

        if (!state.matchResults) state.matchResults = [];
        state.matchResults.push({
            day:         state.day,
            matchName:   matchBooking.matchName,
            winner:      winnerAngler.name,
            prizePool:   pool,
            fisheryGot:  fishery,
            winnerGot:   winner
        });
        if (state.matchResults.length > 10) state.matchResults = state.matchResults.slice(-10);

        Game.addNotification('\uD83C\uDFC6 ' + matchBooking.matchName + ' — Winner: ' + winnerAngler.name +
            '! Fishery received ' + UI.formatMoney(fishery) + ' (' + Math.round(cut * 100) + '% cut).');
        Game.saveToStorage();
    }

    /** Per-card sponsorship offer state — one slot per offer card (up to 3) */
    var _sponDur    = [6,   6,   6  ];
    var _sponSalary = [600, 600, 600];
    var _sponBait   = [150, 150, 150];

    /* Salary: 10 segments × £200 → £200–£2 000
       Bait:   10 segments × £50  →  £50–£500   */
    var SALARY_SEG_SIZE = 200;
    var BAIT_SEG_SIZE   = 50;

    var SAL_VALS  = [200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000];
    var BAIT_VALS = [50,  100, 150, 200,  250,  300,  350,  400,  450,  500];

    function _segColour(i) {
        return i < 3 ? 'spon-seg-green' : i < 7 ? 'spon-seg-amber' : 'spon-seg-red';
    }

    function selectContractDuration(idx, d) {
        _sponDur[idx] = d;
        var btn6  = document.getElementById('spon-dur-6-'  + idx);
        var btn12 = document.getElementById('spon-dur-12-' + idx);
        if (btn6)  btn6.classList.toggle('spon-dur-active',  d === 6);
        if (btn12) btn12.classList.toggle('spon-dur-active', d === 12);
        updateContractDisplay(idx);
    }

    function setSponValue(idx, field, value) {
        if (field === 'salary') _sponSalary[idx] = value;
        else                    _sponBait[idx]   = value;

        var stepSize = field === 'salary' ? SALARY_SEG_SIZE : BAIT_SEG_SIZE;
        var segs     = Math.round(value / stepSize);
        var barId    = (field === 'salary' ? 'spon-sal-bar-' : 'spon-bait-bar-') + idx;
        var valId    = (field === 'salary' ? 'spon-sal-val-' : 'spon-bait-val-') + idx;

        var bar = document.getElementById(barId);
        if (bar) {
            bar.querySelectorAll('.spon-bar-seg').forEach(function (seg, i) {
                seg.classList.toggle('spon-seg-active', i < segs);
            });
        }
        var valEl = document.getElementById(valId);
        if (valEl) valEl.textContent = '\u00a3' + value + '/mo';
        updateContractDisplay(idx);
    }

    function updateContractDisplay(idx) {
        var s   = _sponSalary[idx];
        var b   = _sponBait[idx];
        var dur = _sponDur[idx];
        var sig = Math.round(s * 0.5);
        var monthlyCostVal = s + b;
        var totalCost = monthlyCostVal * dur + sig;

        var anglerEl = document.getElementById('spon-angler-' + idx);
        var sm       = 5;
        if (anglerEl) {
            var ang = ANGLER_POOL.find(function (a) { return a.id === parseInt(anglerEl.value); });
            if (ang) sm = ang.socialMedia || 5;
        }

        // Social media return: salary/30 * (sm/5) per day * 30 = salary * (sm/5) per month
        var monthlyReturn = Math.round(s * (sm / 5));
        var netPerMonth   = monthlyReturn - monthlyCostVal;
        var netTotal      = monthlyReturn * dur - totalCost;
        var roiCol        = netPerMonth >= 0 ? '#5d9b48' : '#b83020';

        var sumEl = document.getElementById('spon-summary-' + idx);
        if (sumEl) {
            sumEl.innerHTML =
                '\uD83D\uDCF1 Social reach: <strong style="color:var(--colour-accent);">' + UI.formatMoney(monthlyReturn) + '/mo</strong>' +
                ' \u00b7 Cost: ' + UI.formatMoney(monthlyCostVal) + '/mo' +
                ' \u00b7 Signing: ' + UI.formatMoney(sig) +
                ' \u00b7 <span style="color:' + roiCol + ';font-weight:700;">Net: ' +
                (netPerMonth >= 0 ? '+' : '') + UI.formatMoney(netPerMonth) + '/mo</span>' +
                ' \u00b7 Total contract: <span style="color:' + (netTotal >= 0 ? '#5d9b48' : '#b83020') + ';">' +
                (netTotal >= 0 ? '+' : '') + UI.formatMoney(netTotal) + '</span>';
        }
    }

    function confirmContract(idx) {
        var anglerEl = document.getElementById('spon-angler-' + idx);
        if (!anglerEl) { UI.showToast('Could not read contract form.', 'error'); return; }
        offerSponsorship(parseInt(anglerEl.value), _sponSalary[idx], _sponBait[idx], _sponDur[idx]);
    }

    function _buildContractSummary(idx, anglerBudget) {
        var s   = _sponSalary[idx];
        var b   = _sponBait[idx];
        var dur = _sponDur[idx];
        var sig = Math.round(s * 0.5);
        var tot = (s + b) * dur;
        var estimatedVisits = Math.round(dur * 30 * 0.12);
        var estimatedIncome = estimatedVisits * anglerBudget;
        var netGain         = estimatedIncome - tot - sig;
        return '<strong>Total: ' + UI.formatMoney(tot) + '</strong>' +
            ' \u00b7 Signing: ' + UI.formatMoney(sig) +
            ' \u00b7 ~' + estimatedVisits + ' visits' +
            ' \u00b7 Est. income: ' + UI.formatMoney(estimatedIncome) +
            ' \u00b7 <span style="color:' + (netGain >= 0 ? '#5d9b48' : '#b83020') + ';">Net: ' +
            (netGain >= 0 ? '+' : '') + UI.formatMoney(netGain) + '</span>';
    }

    function renderSponsorshipsTab(state) {
        var active      = (state.sponsorships || []).filter(function (s) { return !s.ended; });
        var sponsored   = active.map(function (s) { return s.anglerId; });
        var monthlyCost = active.reduce(function (sum, s) { return sum + s.salary + s.baitBudget; }, 0);
        var html = '';

        // ── Active contracts ──────────────────────────────────────────────────
        if (active.length > 0) {
            html += '<h3 class="section-heading">Active Sponsorships (' + active.length + '/3)</h3>';
            html += '<div class="spon-contract-list">';
            active.forEach(function (sp) {
                var daysLeft = Math.max(0, sp.endDay - state.day);
                var progress = Math.round(((sp.endDay - sp.startDay - daysLeft) / (sp.endDay - sp.startDay)) * 100);
                html += '<div class="spon-contract-card">';
                html += '<div class="spon-contract-header">';
                html += '<span class="spon-name">\uD83E\uDD1D ' + sp.anglerName + '</span>';
                html += '<span class="spon-tag">' + sp.months + '-month contract</span>';
                html += '</div>';
                var spAngler     = getAnglerById(sp.anglerId);
                var sm           = spAngler ? (spAngler.socialMedia || 5) : 5;
                var dailyIncome  = Math.round((sp.salary / 30) * (sm / 5));
                var monthlyRet   = dailyIncome * 30;
                var monthlyCostSp= sp.salary + sp.baitBudget;
                var profit       = monthlyRet - monthlyCostSp;
                var profitCol    = profit >= 0 ? 'var(--colour-accent)' : 'var(--colour-danger)';
                html += '<div class="spon-meta">';
                html += '<span>\uD83D\uDCF1 Social ' + sm + '/10</span>';
                html += '<span>Salary ' + UI.formatMoney(sp.salary) + '/mo</span>';
                html += '<span>Bait ' + UI.formatMoney(sp.baitBudget) + '/mo</span>';
                html += '<span>' + daysLeft + 'd left</span>';
                html += '</div>';
                html += '<div class="spon-roi-row">';
                html += '<span style="color:var(--colour-text-muted);font-size:0.72rem;">Monthly return: <strong style="color:var(--colour-accent);">' + UI.formatMoney(monthlyRet) + '</strong></span>';
                html += '<span style="color:var(--colour-text-muted);font-size:0.72rem;">Net: <strong style="color:' + profitCol + ';">' + (profit >= 0 ? '+' : '') + UI.formatMoney(profit) + '/mo</strong></span>';
                html += '</div>';
                html += '<div class="finance-loan-bar-track" style="margin:0.4rem 0;"><div class="finance-loan-bar-fill" style="width:' + progress + '%;"></div></div>';
                html += '<button class="btn btn-danger btn-sm" onclick="Anglers.cancelSponsorship(' + sp.id + ')">End Early</button>';
                html += '</div>';
            });
            html += '</div>';
            html += '<p class="spon-total">Combined monthly: <strong>' + UI.formatMoney(monthlyCost) + '</strong></p>';
        } else {
            html += '<p class="empty-state">No active sponsorships. Offer a contract below to attract regular visits and earn match cut revenue.</p>';
        }

        if (active.length >= 3) {
            html += '<p class="empty-state" style="margin-top:0.5rem;">Maximum 3 sponsorships active at once.</p>';
            return html;
        }

        // ── Offer new contracts: 1–3 cards depending on slots available ───────
        var slotsAvailable = 3 - active.length;
        var defaultAngler  = ANGLER_POOL.find(function (a) { return sponsored.indexOf(a.id) === -1; }) || ANGLER_POOL[0];
        var defaultBudget  = defaultAngler ? defaultAngler.budget : 35;

        html += '<h3 class="section-heading">Offer a Contract</h3>';
        html += '<div class="spon-offer-cards">';

        for (var idx = 0; idx < slotsAvailable; idx++) {
            var salSegs  = Math.round(_sponSalary[idx] / SALARY_SEG_SIZE);
            var baitSegs = Math.round(_sponBait[idx]   / BAIT_SEG_SIZE);

            html += '<div class="spon-offer-card" id="spon-card-' + idx + '">';
            html += '<div class="spon-card-title">Contract Slot ' + (idx + 1) + '</div>';

            // Select Angler
            html += '<div class="spon-offer-row">';
            html += '<label class="spon-offer-label">Angler</label>';
            html += '<select class="shop-lake-select" id="spon-angler-' + idx + '" onchange="Anglers.updateContractDisplay(' + idx + ')">';
            ANGLER_POOL.forEach(function (a) {
                var already = sponsored.indexOf(a.id) !== -1;
                html += '<option value="' + a.id + '"' + (already ? ' disabled' : '') + '>' +
                    a.name + (already ? ' (sponsored)' : ' \u2014 Skill ' + a.skill + '/10 \u00b7 \uD83D\uDCF1 ' + a.socialMedia + '/10 \u00b7 ' + UI.formatMoney(a.budget) + '/day') +
                    '</option>';
            });
            html += '</select>';
            html += '</div>';

            // Salary bar
            html += '<div class="spon-offer-row">';
            html += '<label class="spon-offer-label">Salary</label>';
            html += '<div class="spon-bar-wrap">';
            html += '<div class="spon-bar-track" id="spon-sal-bar-' + idx + '">';
            for (var si = 0; si < SAL_VALS.length; si++) {
                html += '<div class="spon-bar-seg ' + _segColour(si) + (si < salSegs ? ' spon-seg-active' : '') + '"' +
                    ' onclick="Anglers.setSponValue(' + idx + ',\'salary\',' + SAL_VALS[si] + ')"' +
                    ' title="\u00a3' + SAL_VALS[si] + '/mo"></div>';
            }
            html += '</div>';
            html += '<span class="spon-val" id="spon-sal-val-' + idx + '">\u00a3' + _sponSalary[idx] + '/mo</span>';
            html += '</div>';
            html += '</div>';

            // Bait bar
            html += '<div class="spon-offer-row">';
            html += '<label class="spon-offer-label">Bait Budget</label>';
            html += '<div class="spon-bar-wrap">';
            html += '<div class="spon-bar-track" id="spon-bait-bar-' + idx + '">';
            for (var bi = 0; bi < BAIT_VALS.length; bi++) {
                html += '<div class="spon-bar-seg ' + _segColour(bi) + (bi < baitSegs ? ' spon-seg-active' : '') + '"' +
                    ' onclick="Anglers.setSponValue(' + idx + ',\'bait\',' + BAIT_VALS[bi] + ')"' +
                    ' title="\u00a3' + BAIT_VALS[bi] + '/mo"></div>';
            }
            html += '</div>';
            html += '<span class="spon-val" id="spon-bait-val-' + idx + '">\u00a3' + _sponBait[idx] + '/mo</span>';
            html += '</div>';
            html += '</div>';

            // Duration
            html += '<div class="spon-offer-row">';
            html += '<label class="spon-offer-label">Duration</label>';
            html += '<div class="spon-duration-btns">';
            html += '<button class="btn btn-secondary btn-sm spon-dur-btn' + (_sponDur[idx] === 6  ? ' spon-dur-active' : '') + '"' +
                    ' id="spon-dur-6-'  + idx + '" onclick="Anglers.selectContractDuration(' + idx + ',6)">6 Months</button>';
            html += '<button class="btn btn-secondary btn-sm spon-dur-btn' + (_sponDur[idx] === 12 ? ' spon-dur-active' : '') + '"' +
                    ' id="spon-dur-12-' + idx + '" onclick="Anglers.selectContractDuration(' + idx + ',12)">12 Months</button>';
            html += '</div>';
            html += '</div>';

            // Live summary (pre-populated with default angler)
            html += '<div class="spon-offer-summary" id="spon-summary-' + idx + '">' +
                    _buildContractSummary(idx, defaultBudget) + '</div>';

            // Offer button
            html += '<button class="btn btn-primary spon-offer-btn" onclick="Anglers.confirmContract(' + idx + ')">\uD83E\uDD1D Offer Contract</button>';
            html += '</div>'; // .spon-offer-card
        }

        html += '</div>'; // .spon-offer-cards
        return html;
    }

    function renderLeaderboardTab(state) {
        var stats    = state.anglerStats || {};
        var results  = (state.matchResults || []).slice().reverse();
        var cut      = Math.round((state.tournamentCut || 0.20) * 100);
        var RARITY_MEDAL = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];

        function topN(sortFn, n) {
            return Object.entries(stats).filter(function (e) { return e[1].fishCaught > 0 || e[1].wins > 0; })
                   .sort(sortFn).slice(0, n);
        }

        var html = '';

        // Tournament cut setting
        html += '<div class="spon-cut-row">';
        html += '<span class="spon-cut-label">\uD83C\uDFC6 Fishery tournament cut:</span>';
        html += '<select class="shop-lake-select" style="width:120px;" onchange="Anglers.setTournamentCut(this.value)">';
        [10, 15, 20, 25, 30].forEach(function (pct) {
            html += '<option value="' + pct + '"' + (pct === cut ? ' selected' : '') + '>' + pct + '%</option>';
        });
        html += '</select>';
        html += '<span class="spon-cut-earned">Earned from matches: <strong>' +
                UI.formatMoney(results.reduce(function(s,r){ return s+r.fisheryGot; }, 0)) + '</strong></span>';
        html += '</div>';

        // Most Fish Caught + Biggest Fish side by side
        html += '<div class="lb-two-col">';

        html += '<div>';
        html += '<h3 class="section-heading">\uD83D\uDC1F Most Fish Caught</h3>';
        var topFish = topN(function (a, b) { return b[1].fishCaught - a[1].fishCaught; }, 3);
        if (topFish.length === 0) {
            html += '<p class="empty-state">No stats yet.</p>';
        } else {
            html += '<div class="lb-list">';
            topFish.forEach(function (e, i) {
                html += '<div class="lb-row">';
                html += '<span class="lb-medal">' + (RARITY_MEDAL[i] || '#' + (i+1)) + '</span>';
                html += '<span class="lb-name">' + e[0] + '</span>';
                html += '<span class="lb-val">' + e[1].fishCaught + ' fish</span>';
                html += '<span class="lb-sub">' + e[1].visits + ' visits</span>';
                html += '</div>';
            });
            html += '</div>';
        }
        html += '</div>';

        html += '<div>';
        html += '<h3 class="section-heading">\uD83D\uDC1F Biggest Fish</h3>';
        var topBig = topN(function (a, b) { return b[1].biggestFishOz - a[1].biggestFishOz; }, 3)
                     .filter(function (e) { return e[1].biggestFishOz > 0; });
        if (topBig.length === 0) {
            html += '<p class="empty-state">No catches recorded yet.</p>';
        } else {
            html += '<div class="lb-list">';
            topBig.forEach(function (e, i) {
                var wt = typeof UI !== 'undefined' ? UI.formatWeight(e[1].biggestFishOz) : e[1].biggestFishOz + 'oz';
                html += '<div class="lb-row">';
                html += '<span class="lb-medal">' + (RARITY_MEDAL[i] || '#' + (i+1)) + '</span>';
                html += '<span class="lb-name">' + e[0] + '</span>';
                html += '<span class="lb-val">' + wt + '</span>';
                html += '</div>';
            });
            html += '</div>';
        }
        html += '</div>';

        html += '</div>'; // lb-two-col

        // Match/tournament results
        html += '<h3 class="section-heading">\uD83C\uDFC6 Recent Match Results</h3>';
        if (results.length === 0) {
            html += '<p class="empty-state">No matches completed yet.</p>';
        } else {
            html += '<div class="lb-match-list">';
            results.forEach(function (r) {
                html += '<div class="lb-match-row">';
                html += '<span class="lb-match-day">D' + r.day + '</span>';
                html += '<span class="lb-match-name">' + r.matchName + '</span>';
                html += '<span class="lb-match-winner">\uD83C\uDFC6 ' + r.winner + '</span>';
                html += '<span class="lb-match-cut" style="color:var(--colour-accent);">+' + UI.formatMoney(r.fisheryGot) + '</span>';
                html += '</div>';
            });
            html += '</div>';
        }

        return html;
    }

    function renderRosterTab(state) {
        var html = '<h3 class="section-heading">Roster</h3>';
        html += '<div class="angler-pool-grid">';
        ANGLER_POOL.forEach(function (angler) {
            var isBooked = (state.anglerBookings || []).some(function (b) {
                return b.anglerId === angler.id && state.day <= b.endDay;
            });
            html += '<div class="angler-card' + (isBooked ? ' angler-booked' : '') + '">';
            html += '<div class="angler-card-name">' + angler.name + '</div>';
            html += '<div class="angler-photo-slot">' + (angler.photo ? '<img src="' + angler.photo + '" alt="' + angler.name + '" class="angler-photo-img" loading="lazy"/>' : '<div class="angler-photo-placeholder">' + angler.name.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2).toUpperCase() + '</div>') + '</div>';
            html += '<div class="angler-card-info">';
            html += '<span class="angler-skill-badge">Skill ' + angler.skill + '/10</span>';
            html += '<span class="angler-social-badge" style="color:' + (angler.socialMedia >= 8 ? '#f1c40f' : angler.socialMedia >= 6 ? '#2ecc71' : '#aaa') + ';">\uD83D\uDCF1 ' + angler.socialMedia + '/10</span>';
            html += '<span class="angler-budget-badge">' + UI.formatMoney(angler.budget) + '/day</span>';
            html += '</div>';
            html += '<div class="angler-card-prefs">';
            html += '<span class="pref-label">Likes:</span> ' + angler.preferred.map(formatWaterType).join(', ');
            html += '</div>';
            html += '<div class="angler-card-prefs angler-dislikes">';
            html += '<span class="pref-label">Dislikes:</span> ' + angler.disliked.map(formatWaterType).join(', ');
            html += '</div>';
            if (isBooked) html += '<div class="angler-status-tag">Currently Booked</div>';
            html += '</div>';
        });
        html += '</div>';
        return html;
    }

    return {
        initState: initState,
        getAnglerById: getAnglerById,
        getAllAnglers: getAllAnglers,
        generateBookingRequests: generateBookingRequests,
        processDailyBookings: processDailyBookings,
        renderAnglers: renderAnglers,
        render: renderAnglers,
        renderRosterTab: renderRosterTab,
        getLakeColour: getLakeColour,
        showAnglerView: showAnglerView,
        renderRosterTab: renderRosterTab,
        offerSponsorship: offerSponsorship,
        cancelSponsorship: cancelSponsorship,
        getSponsoredAnglerIds: getSponsoredAnglerIds,
        selectContractDuration: selectContractDuration,
        setSponValue:           setSponValue,
        updateContractDisplay:  updateContractDisplay,
        confirmContract:        confirmContract,
        setTournamentCut: function (pct) {
            var state = Game.getState();
            state.tournamentCut = Math.max(0.05, Math.min(0.50, parseInt(pct) / 100));
            Game.saveToStorage();
            renderAnglers();
        }
    };
})();
window.Anglers = Anglers;
