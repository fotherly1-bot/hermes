/**
 * Carp Fishing Tycoon - Finance System
 * Comprehensive financial tracking: loans, marketing campaigns, transaction log,
 * income/expense breakdown, 7-day projections, and pie/bar charts.
 */

'use strict';

const Finance = (function () {

    // ── Loan products ───────────────────────────────────────────────────────────
    const LOAN_TYPES = [
        {
            id:          'emergency',
            name:        'Emergency Loan',
            amount:      10000,
            rate:        0.10,
            termDays:    150,
            description: 'Quick cash for urgent needs. Short term, higher cost.'
        },
        {
            id:          'short_term',
            name:        'Short-Term Loan',
            amount:      25000,
            rate:        0.11,
            termDays:    225,
            description: 'A mid-sized bridge loan for immediate opportunities.'
        },
        {
            id:          'business',
            name:        'Business Loan',
            amount:      50000,
            rate:        0.09,
            termDays:    300,
            description: 'Standard business financing. Good for lake purchases or upgrades.'
        },
        {
            id:          'expansion',
            name:        'Expansion Loan',
            amount:      150000,
            rate:        0.12,
            termDays:    450,
            description: 'Fund major fishery expansion. Higher rate reflects the risk.'
        },
        {
            id:          'corporate',
            name:        'Corporate Finance',
            amount:      500000,
            rate:        0.14,
            termDays:    900,
            description: 'Serious capital for elite venues. Long repayment window.'
        },
        {
            id:          'investment_fund',
            name:        'Investment Fund',
            amount:      1500000,
            rate:        0.15,
            termDays:    1825,
            description: 'Major long-term capital for the most ambitious fishery empires.'
        }
    ];

    // ── Marketing campaign products ─────────────────────────────────────────────
    const MARKETING_TYPES = [
        {
            id:          'social',
            name:        'Social Media Blast',
            emoji:       '\uD83D\uDCF1',
            cost:        500,
            duration:    5,
            repBonus:    1,
            bookingMod:  0.30,
            description: 'A quick social media campaign. Cost-effective short burst.'
        },
        {
            id:          'newspaper',
            name:        'Local Newspaper Ad',
            emoji:       '\uD83D\uDCF0',
            cost:        1500,
            duration:    10,
            repBonus:    3,
            bookingMod:  0.25,
            description: 'Reaches local anglers. Good mid-term visibility.'
        },
        {
            id:          'magazine',
            name:        'Fishing Magazine Feature',
            emoji:       '\uD83D\uDCD6',
            cost:        4000,
            duration:    20,
            repBonus:    6,
            bookingMod:  0.40,
            description: 'Targeted audience. High impact over a longer period.'
        },
        {
            id:          'event',
            name:        'Sponsored Competition',
            emoji:       '\uD83C\uDFC6',
            cost:        8000,
            duration:    14,
            repBonus:    8,
            bookingMod:  0.50,
            description: 'Host a competition at one of your lakes. Excellent brand boost.'
        },
        {
            id:          'tv',
            name:        'National TV Feature',
            emoji:       '\uD83D\uDCFA',
            cost:        20000,
            duration:    30,
            repBonus:    15,
            bookingMod:  0.65,
            description: 'National exposure. The biggest possible marketing investment.'
        }
    ];

    // ── Transaction categories and colours for charts ───────────────────────────
    const CATEGORY_META = {
        angler_income:   { label: 'Angler Bookings',    colour: '#4a9c6d' },
        lake_income:     { label: 'Lake Income',        colour: '#3498db' },
        quest_reward:    { label: 'Quest Rewards',      colour: '#d4a843' },
        staff_lucky:     { label: 'Lucky Finds',        colour: '#1abc9c' },
        loan_received:   { label: 'Loans Received',     colour: '#9b59b6' },
        staff_wages:     { label: 'Staff Wages',        colour: '#e67e22' },
        loan_repayment:  { label: 'Loan Repayments',    colour: '#c0392b' },
        shop_purchase:   { label: 'Shop Purchases',     colour: '#2980b9' },
        marketing:       { label: 'Marketing',          colour: '#8e44ad' },
        disaster_cost:   { label: 'Disaster Repairs',   colour: '#7f8c8d' },
        hiring_cost:     { label: 'Hiring Costs',     colour: '#d35400' },
        fish_sale:       { label: 'Fish Sales',        colour: '#27ae60' },
        lake_maintenance: { label: 'Lake Maintenance', colour: '#16a085' }
    };

    // ── State helpers ────────────────────────────────────────────────────────────

    function initState() {
        var state = Game.getState();
        if (!state.loans)            state.loans            = [];
        if (!state.marketingCampaigns) state.marketingCampaigns = [];
        if (!state.financeLog)       state.financeLog       = [];
        if (!state.nextLoanId)       state.nextLoanId       = 1;
        if (!state.nextCampaignId)   state.nextCampaignId   = 1;
    }

    /**
     * Log a financial transaction. Called by game.js, anglers.js, staff.js etc.
     * amount > 0 = income, amount < 0 = expense.
     */
    function addFinanceLog(category, amount, description) {
        var state = Game.getState();
        if (!state.financeLog) state.financeLog = [];
        state.financeLog.push({
            day:         state.day,
            category:    category,
            amount:      amount,
            description: description,
            timestamp:   Date.now()
        });
        // Rolling 90-day window to keep save size sane
        if (state.financeLog.length > 500) {
            state.financeLog = state.financeLog.slice(-500);
        }
    }

    // ── Loan functions ──────────────────────────────────────────────────────────

    function takeLoan(loanTypeId) {
        initState();
        var state    = Game.getState();
        var loanType = LOAN_TYPES.find(function (l) { return l.id === loanTypeId; });
        if (!loanType) return;

        var alreadyActive = state.loans.some(function (l) {
            return !l.paidOff && l.typeId === loanTypeId;
        });
        if (alreadyActive) {
            UI.showToast('You already have an active ' + loanType.name + '.', 'warning');
            return;
        }

        var totalRepayable  = Math.round(loanType.amount * (1 + loanType.rate));
        var termWeeks       = Math.max(1, Math.floor(loanType.termDays / 7));
        var weeklyRepayment = Math.ceil(totalRepayable / termWeeks);

        var loan = {
            id:             state.nextLoanId++,
            typeId:         loanType.id,
            name:           loanType.name,
            principal:      loanType.amount,
            totalRepayable: totalRepayable,
            dailyRepayment: weeklyRepayment,   // kept for display/compatibility
            weeklyRepayment: weeklyRepayment,
            termDays:       loanType.termDays,
            startDay:       state.day,
            endDay:         state.day + loanType.termDays,
            paidOff:        false,
            totalPaid:      0,
            missedPayments: 0
        };

        state.loans.push(loan);
        state.money         += loanType.amount;
        state.totalEarnings += loanType.amount;

        addFinanceLog('loan_received', loanType.amount, loanType.name);
        Game.saveToStorage();
        UI.showToast('\uD83C\uDFE6 ' + UI.formatMoney(loanType.amount) + ' loan approved!', 'success');
        Game.addNotification(
            '\uD83C\uDFE6 Loan approved: ' + loanType.name + ' — ' + UI.formatMoney(loanType.amount) +
            '. Repay ' + UI.formatMoney(weeklyRepayment) + '/week for ' +
            Math.max(1, Math.floor(loanType.termDays / 7)) + ' weeks. ' +
            'Total repayable: ' + UI.formatMoney(totalRepayable) + '.'
        );
        renderFinance();
    }

    /**
     * Pay off an entire loan immediately (early repayment).
     * A 2% early repayment fee is applied on the remaining balance.
     */
    function payOffLoan(loanId) {
        var state = Game.getState();
        var loan  = (state.loans || []).find(function (l) { return l.id === loanId; });
        if (!loan || loan.paidOff) { UI.showToast('Loan not found.', 'error'); return; }

        var remaining = loan.totalRepayable - loan.totalPaid;
        var fee       = Math.round(remaining * 0.02);  // 2% early repayment fee
        var total     = remaining + fee;

        if (state.money < total) {
            UI.showToast('Need ' + UI.formatMoney(total) + ' to pay off early (inc. 2% fee).', 'error');
            return;
        }

        state.money      -= total;
        state.totalSpent += total;
        loan.totalPaid   += total;
        loan.paidOff      = true;

        addFinanceLog('loan_repayment', -total, loan.name + ' early repayment');
        Game.addNotification('\uD83C\uDFE6 ' + loan.name + ' paid off early! Fee: ' + UI.formatMoney(fee) + '.');
        UI.showToast(loan.name + ' paid off!', 'success');
        Game.saveToStorage();
        renderFinance();
    }

    /**
     * Make an extra lump-sum payment on a loan.
     */
    function makeExtraPayment(loanId, amount) {
        var state = Game.getState();
        var loan  = (state.loans || []).find(function (l) { return l.id === loanId; });
        if (!loan || loan.paidOff) return;

        amount = Math.min(parseInt(amount) || 0, loan.totalRepayable - loan.totalPaid);
        if (amount <= 0) { UI.showToast('Enter a valid amount.', 'error'); return; }
        if (state.money < amount) {
            UI.showToast('Not enough funds.', 'error'); return;
        }

        state.money      -= amount;
        state.totalSpent += amount;
        loan.totalPaid   += amount;
        addFinanceLog('loan_repayment', -amount, loan.name + ' extra payment');

        if (loan.totalPaid >= loan.totalRepayable) {
            loan.paidOff = true;
            Game.addNotification('\uD83C\uDFE6 ' + loan.name + ' fully repaid!');
            UI.showToast('Loan fully repaid!', 'success');
        } else {
            UI.showToast('Extra payment of ' + UI.formatMoney(amount) + ' applied.', 'success');
        }
        Game.saveToStorage();
        renderFinance();
    }

    // ── Marketing functions ─────────────────────────────────────────────────

    function launchCampaign(campaignTypeId) {
        initState();
        var state    = Game.getState();
        var campType = MARKETING_TYPES.find(function (c) { return c.id === campaignTypeId; });
        if (!campType) return;

        if (state.money < campType.cost) {
            UI.showToast('Insufficient funds. Need ' + UI.formatMoney(campType.cost) + '.', 'error');
            return;
        }

        var alreadyActive = state.marketingCampaigns.some(function (c) {
            return c.typeId === campaignTypeId && c.endDay >= state.day;
        });
        if (alreadyActive) {
            UI.showToast('That campaign is already running!', 'warning');
            return;
        }

        Game.spendMoney(campType.cost);
        addFinanceLog('marketing', -campType.cost, campType.name + ' campaign');

        var campaign = {
            id:          state.nextCampaignId++,
            typeId:      campType.id,
            name:        campType.name,
            startDay:    state.day,
            endDay:      state.day + campType.duration,
            duration:    campType.duration,
            bookingMod:  campType.bookingMod,
            repBonus:    campType.repBonus,
            cost:        campType.cost,
            repAccum:    0
        };
        state.marketingCampaigns.push(campaign);

        Game.saveToStorage();
        UI.showToast(campType.emoji + ' ' + campType.name + ' launched!', 'success');
        Game.addNotification(
            '\uD83D\uDCE3 Marketing: ' + campType.name + ' running for ' + campType.duration +
            ' days. +' + Math.round(campType.bookingMod * 100) + '% booking requests.'
        );
        renderFinance();
    }

    // ── Daily processing ────────────────────────────────────────────────────────

    function processDailyFinance() {
        initState();
        var state = Game.getState();

        // ── Loan repayments ──

        // ── Loan repayments — weekly (every 7 days) ──
        if (state.day % 7 === 0) {
            state.loans.forEach(function (loan) {
                if (loan.paidOff || state.day < loan.startDay || state.day > loan.endDay) return;

                var remaining = loan.totalRepayable - loan.totalPaid;
                var payment   = Math.min(loan.weeklyRepayment || loan.dailyRepayment, remaining);

                if (state.money >= payment) {
                    state.money      -= payment;
                    state.totalSpent += payment;
                    loan.totalPaid   += payment;
                    addFinanceLog('loan_repayment', -payment, loan.name + ' weekly repayment');
                } else {
                    var partial   = state.money;
                    var missed    = payment - partial;
                    var penalty   = Math.round(missed * 0.12);
                    state.money      = 0;
                    state.totalSpent += partial;
                    loan.totalPaid   += partial;
                    loan.totalRepayable += penalty;
                    loan.missedPayments++;
                    addFinanceLog('loan_repayment', -partial, loan.name + ' partial repayment');
                    Game.addNotification(
                        '\u26A0\uFE0F Missed weekly loan repayment! ' + UI.formatMoney(missed) +
                        ' unpaid. Penalty: ' + UI.formatMoney(penalty) + ' added to balance.'
                    );
                    UI.showToast('Loan payment missed!', 'error');
                }

                if (loan.totalPaid >= loan.totalRepayable) {
                    loan.paidOff = true;
                    Game.addNotification('\uD83C\uDFE6 ' + loan.name + ' fully repaid! Well done.');
                    UI.showToast('Loan fully repaid!', 'success');
                }
            });
        }

        // ── Marketing rep drip ──
        state.marketingCampaigns.forEach(function (c) {
            if (c.endDay < state.day) return;
            var campType = MARKETING_TYPES.find(function (m) { return m.id === c.typeId; });
            if (!campType) return;
            c.repAccum += campType.repBonus / campType.duration;
            if (c.repAccum >= 1) {
                var whole = Math.floor(c.repAccum);
                Game.addReputation(whole);
                c.repAccum -= whole;
            }
        });

        // ── Investor royalties (use angler + lake income from incomeHistory) ──
        var todayIncome = (state.incomeHistory || []).slice(-1)[0];
        processInvestorRoyalties(todayIncome ? (todayIncome.income || 0) : 0);

        // ── Clean up finished campaigns ──
        state.marketingCampaigns = state.marketingCampaigns.filter(function (c) {
            return c.endDay >= state.day;
        });

        Game.saveToStorage();
    }

    // ── Getters used by other modules ───────────────────────────────────────────

    /** Combined marketing booking modifier (additive across all active campaigns). */
    function getMarketingBookingModifier() {
        var state = Game.getState();
        if (!state.marketingCampaigns) return 0;
        var mod = 0;
        state.marketingCampaigns.forEach(function (c) {
            if (c.endDay >= state.day) mod += c.bookingMod;
        });
        return Math.min(1.5, mod);
    }

    // ── Financial calculations ──────────────────────────────────────────────────

    function getNetProfit() {
        var state = Game.getState();
        return state.totalEarnings - state.totalSpent;
    }

    function getOutstandingDebt() {
        var state = Game.getState();
        if (!state.loans) return 0;
        return state.loans.reduce(function (sum, l) {
            return sum + (l.paidOff ? 0 : (l.totalRepayable - l.totalPaid));
        }, 0);
    }

    function getDailyStaffCost() {
        var state = Game.getState();
        if (!state.hiredStaff) return 0;
        return state.hiredStaff.reduce(function (s, m) { return s + m.salary; }, 0);
    }

    function getDailyLoanRepayments() {
        var state = Game.getState();
        if (!state.loans) return 0;
        return state.loans.reduce(function (s, l) {
            if (l.paidOff) return s;
            var weekly = l.weeklyRepayment || l.dailyRepayment || 0;
            return s + Math.round(weekly / 7); // convert weekly to daily equivalent
        }, 0);
    }

    /** Sum transactions of a given category from the financeLog. */
    function sumCategory(category) {
        var state = Game.getState();
        var log   = state.financeLog || [];
        return log.reduce(function (s, e) {
            return s + (e.category === category ? Math.abs(e.amount) : 0);
        }, 0);
    }

    function getIncomeSegments() {
        var segs = [];
        var cats = ['angler_income', 'lake_income', 'quest_reward', 'staff_lucky', 'loan_received', 'fish_sale'];
        cats.forEach(function (cat) {
            var v = sumCategory(cat);
            if (v > 0) {
                var meta = CATEGORY_META[cat] || { label: cat, colour: '#888' };
                segs.push({ label: meta.label, value: v, colour: meta.colour });
            }
        });
        // Fallback to totals if log is empty
        if (segs.length === 0) {
            var state = Game.getState();
            if (state.totalEarnings > 0) {
                segs.push({ label: 'Total Earnings', value: state.totalEarnings, colour: '#4a9c6d' });
            }
        }
        return segs;
    }

    function getExpenseSegments() {
        var segs = [];
        var cats = ['staff_wages', 'loan_repayment', 'shop_purchase', 'marketing', 'disaster_cost', 'hiring_cost', 'lake_maintenance'];
        cats.forEach(function (cat) {
            var v = sumCategory(cat);
            if (v > 0) {
                var meta = CATEGORY_META[cat] || { label: cat, colour: '#888' };
                segs.push({ label: meta.label, value: v, colour: meta.colour });
            }
        });
        if (segs.length === 0) {
            var state = Game.getState();
            if (state.totalSpent > 0) {
                segs.push({ label: 'Total Spent', value: state.totalSpent, colour: '#e67e22' });
            }
        }
        return segs;
    }

    function getProjections() {
        var state        = Game.getState();
        var dailyStaff   = getDailyStaffCost();
        var dailyLoans   = getDailyLoanRepayments();
        var dailyMaint   = typeof Lakes !== 'undefined'
            ? (Game.getState().ownedLakes || []).reduce(function (s, id) {
                return s + Lakes.getLakeMaintenanceDailyCost(id);
              }, 0) : 0;
        var projections  = [];

        for (var d = 1; d <= 7; d++) {
            var futureDay = state.day + d;
            // Known angler income from confirmed bookings
            var anglerIncome = 0;
            (state.anglerBookings || []).forEach(function (b) {
                if (futureDay >= b.startDay && futureDay <= b.endDay) {
                    anglerIncome += b.dailyRate;
                }
            });
            // Estimated lake income (if anglers present)
            var lakeIncome = 0;
            if (anglerIncome > 0) {
                (state.ownedLakes || []).forEach(function (lakeId) {
                    var lake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
                    if (!lake) return;
                    var anglersHere = (state.anglerBookings || []).filter(function (b) {
                        return b.lakeId === lakeId &&
                               futureDay >= b.startDay && futureDay <= b.endDay;
                    }).length;
                    if (anglersHere > 0) {
                        lakeIncome += lake.dailyIncomePerAngler * anglersHere * (lake.biodiversityScore / 10);
                    }
                });
            }
            var totalIncome   = Math.round(anglerIncome + lakeIncome);
            var totalExpenses = Math.round(dailyStaff + dailyLoans + dailyMaint);
            projections.push({
                day:      futureDay,
                income:   totalIncome,
                expenses: totalExpenses,
                net:      totalIncome - totalExpenses
            });
        }
        return projections;
    }

    // ── Chart renderers ─────────────────────────────────────────────────────────

    function renderPieChart(segments, title) {
        if (!segments || segments.length === 0) {
            return '<p class="empty-state" style="margin:0.5rem 0;">No data yet.</p>';
        }
        var total = segments.reduce(function (s, seg) { return s + seg.value; }, 0);
        if (total <= 0) return '<p class="empty-state" style="margin:0.5rem 0;">No data yet.</p>';

        var deg  = 0;
        var grad = segments.map(function (seg) {
            var sweep = (seg.value / total) * 360;
            var part  = seg.colour + ' ' + deg + 'deg ' + (deg + sweep) + 'deg';
            deg += sweep;
            return part;
        }).join(', ');

        var html = '<div class="finance-pie-block">';
        if (title) html += '<h4 class="finance-chart-title">' + title + '</h4>';
        html += '<div class="finance-pie-row">';
        html += '<div class="finance-pie-donut" style="background:conic-gradient(' + grad + ');"></div>';
        html += '<div class="finance-pie-legend">';
        segments.forEach(function (seg) {
            var pct = Math.round((seg.value / total) * 100);
            html += '<div class="finance-pie-legend-item">';
            html += '<span class="finance-pie-dot" style="background:' + seg.colour + ';"></span>';
            html += '<span class="finance-pie-legend-label">' + seg.label + '</span>';
            html += '<span class="finance-pie-legend-val">' +
                        UI.formatMoney(seg.value) + ' <em>' + pct + '%</em></span>';
            html += '</div>';
        });
        html += '</div>';  // legend
        html += '</div>';  // row
        html += '</div>';  // block
        return html;
    }

    function renderIncomeBarChart(state) {
        // ── Shared candle chart builder ───────────────────────────────────────
        function candleChart(title, groups, maxVal, hasZeroLine) {
            if (!groups[0].values.length) return '<p class="empty-state">No data yet.</p>';
            var h = '<div class="fc-chart-wrap">';
            h += '<div class="fc-chart-title">' + title + '</div>';
            h += '<div class="fc-chart">';
            [75, 50, 25].forEach(function(pct){
                h += '<div class="fc-grid-line" style="bottom:' + pct + '%"></div>';
            });
            if (hasZeroLine) h += '<div class="fc-grid-line fc-zero-line" style="bottom:50%;border-color:rgba(255,255,255,0.15);"></div>';
            h += '<div class="fc-bars">';
            groups.forEach(function(col){
                h += '<div class="fc-day-group">';
                col.series.forEach(function(s){
                    var pct = maxVal > 0 ? Math.max(2, Math.round((Math.abs(s.val) / maxVal) * (hasZeroLine ? 45 : 90))) : 2;
                    var bot = hasZeroLine ? (s.val >= 0 ? 50 : Math.max(2, 50 - pct)) : 0;
                    var col2 = typeof s.colour === 'function' ? s.colour(s.val) : s.colour;
                    h += '<div class="fc-candle" style="height:'+pct+'%;bottom:'+bot+'%;background:'+col2+';" title="'+s.label+': '+(typeof s.val==='number'?UI.formatMoney(s.val):s.val)+'"></div>';
                });
                h += '<div class="fc-day-label">' + col.label + '</div>';
                h += '</div>';
            });
            h += '</div></div></div>';
            return h;
        }

        // ── Chart 1: Reputation Growth ────────────────────────────────────────
        var repHistory = (state.reputationHistory || []).slice(-14);
        var maxRep     = Math.max(1, Math.max.apply(null, repHistory.map(function(e){ return e.reputation || 0; })));
        var repGroups  = repHistory.map(function(e){
            return { label: 'D'+e.day, values: [e.reputation], series: [{ val: e.reputation, colour: 'var(--colour-accent)', label: 'Rep' }] };
        });

        // ── Chart 2: Income by Lake ───────────────────────────────────────────
        var LAKE_COLOURS = ['#4a9c6d','#3498db','#9b59b6','#e67e22','#e74c3c','#1abc9c','#f39c12','#2980b9'];
        var lakeIncome  = {};
        (state.anglerBookings || []).forEach(function(b){
            lakeIncome[b.lakeId] = (lakeIncome[b.lakeId] || 0) + (b.dailyRate * b.duration);
        });
        var lakeGroups = [];
        var maxLakeInc = 1;
        state.ownedLakes.forEach(function(lakeId, i){
            var lake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
            var inc  = lakeIncome[lakeId] || 0;
            if (inc > maxLakeInc) maxLakeInc = inc;
            lakeGroups.push({
                label: lake ? lake.name.split(' ')[0] : lakeId,
                values: [inc],
                series: [{ val: inc, colour: LAKE_COLOURS[i % LAKE_COLOURS.length], label: lake ? lake.name : lakeId }]
            });
        });

        var html = '<div class="fc-two-charts">';
        html += candleChart('Reputation Growth \u2014 Last ' + repGroups.length + ' Days', repGroups, maxRep, false);
        html += candleChart('Total Angler Income by Lake', lakeGroups.length ? lakeGroups : [{ label:'-', series:[{val:0,colour:'#888',label:'None'}] }], maxLakeInc, false);
        html += '</div>';

        // Legend for lake chart
        if (state.ownedLakes.length > 0) {
            html += '<div class="fc-legend">';
            state.ownedLakes.forEach(function(lakeId, i){
                var lake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
                html += '<span class="fc-legend-dot" style="background:'+LAKE_COLOURS[i%LAKE_COLOURS.length]+';'+(i>0?'margin-left:0.6rem;':'')+'""></span>';
                html += '<span>' + (lake ? lake.name : lakeId) + '</span>';
            });
            html += '</div>';
        }
        return html;
    }

    function renderProjectionTable() {
        var projections = getProjections();
        var html = '<div class="finance-proj-table">';
        html += '<div class="finance-proj-header">';
        html += '<span>Day</span><span>Est. Income</span><span>Daily Costs</span><span>Net P&amp;L</span>';
        html += '</div>';
        projections.forEach(function (p) {
            var cls = p.net >= 0 ? 'finance-proj-pos' : 'finance-proj-neg';
            html += '<div class="finance-proj-row">';
            html += '<span class="finance-proj-day">Day ' + p.day + '</span>';
            html += '<span class="finance-proj-income">' + UI.formatMoney(p.income) + '</span>';
            html += '<span class="finance-proj-cost">' + UI.formatMoney(p.expenses) + '</span>';
            html += '<span class="finance-proj-net ' + cls + '">' +
                        (p.net >= 0 ? '+' : '') + UI.formatMoney(p.net) + '</span>';
            html += '</div>';
        });
        html += '</div>';
        return html;
    }

    function renderLoansSection(state) {
        var activeLoans = (state.loans || []).filter(function (l) { return !l.paidOff; });
        var html = '';

        if (activeLoans.length > 0) {
            html += '<h4 class="finance-sub-heading">Active Loans</h4>';
            html += '<div class="finance-loan-list">';
            activeLoans.forEach(function (loan) {
                var remaining     = loan.totalRepayable - loan.totalPaid;
                var interestTotal = loan.totalRepayable - loan.principal;
                var interestPaid  = Math.round(loan.totalPaid * (interestTotal / loan.totalRepayable));
                var interestLeft  = interestTotal - interestPaid;
                var progress      = Math.round((loan.totalPaid / loan.totalRepayable) * 100);
                var daysLeft      = Math.max(0, loan.endDay - state.day);
                var overdue       = daysLeft === 0 && !loan.paidOff;
                var earlyFee      = Math.round(remaining * 0.02);
                var earlyTotal    = remaining + earlyFee;
                var canPayOff     = state.money >= earlyTotal;
                var weeksLeft     = Math.max(0, Math.ceil(daysLeft / 7));

                html += '<div class="finance-loan-card' + (overdue ? ' finance-loan-overdue' : '') + '">';

                // Header
                html += '<div class="finance-loan-row">';
                html += '<span class="finance-loan-name">\uD83C\uDFE6 ' + loan.name + '</span>';
                html += '<span class="finance-loan-owed">' + UI.formatMoney(remaining) + ' remaining</span>';
                html += '</div>';

                // Interest breakdown
                html += '<div class="loan-interest-strip">';
                html += '<span>Principal <strong>' + UI.formatMoney(loan.principal) + '</strong></span>';
                html += '<span>Total interest <strong style="color:var(--colour-danger);">' + UI.formatMoney(interestTotal) + '</strong></span>';
                html += '<span>Interest left <strong style="color:var(--colour-gold);">' + UI.formatMoney(interestLeft) + '</strong></span>';
                html += '<span>Interest paid <strong>' + UI.formatMoney(interestPaid) + '</strong></span>';
                html += '</div>';

                // Schedule
                html += '<div class="finance-loan-meta">';
                html += '<span>\uD83D\uDCB8 ' + UI.formatMoney(loan.weeklyRepayment || loan.dailyRepayment) + '/week</span>';
                html += '<span>\uD83D\uDCC5 ' + weeksLeft + ' week' + (weeksLeft !== 1 ? 's' : '') + ' left</span>';
                html += '<span>\uD83D\uDCCA Rate: ' + (loan.typeId ? (LOAN_TYPES.find(function(t){return t.id===loan.typeId;})||{}).rate * 100 : '?') + '%</span>';
                if (loan.missedPayments > 0) {
                    html += '<span style="color:var(--colour-danger);">\u26A0 ' + loan.missedPayments + ' missed</span>';
                }
                html += '</div>';

                // Progress bar
                html += '<div class="finance-loan-bar-track">';
                html += '<div class="finance-loan-bar-fill" style="width:' + progress + '%;"></div>';
                html += '</div>';
                html += '<div class="loan-progress-labels"><span>' + progress + '% repaid</span><span>' + UI.formatMoney(loan.totalPaid) + ' / ' + UI.formatMoney(loan.totalRepayable) + '</span></div>';

                // Payback option tabs (20% / 50% / 100%)
                html += '<div class="loan-payback-tabs">';
                html += '<span class="loan-payback-heading">Quick Repayment</span>';
                html += '<div class="loan-payback-btns">';
                [20, 50, 100].forEach(function (pct) {
                    var payAmt   = Math.round(remaining * pct / 100);
                    var isEarly  = pct === 100;
                    var fee      = isEarly ? Math.round(remaining * 0.02) : 0;
                    var total    = payAmt + fee;
                    var canPay   = state.money >= total;
                    var label    = pct + '% — ' + UI.formatMoney(total) + (fee > 0 ? ' (inc. 2% fee)' : '');
                    var fn       = isEarly
                        ? 'Finance.payOffLoan(' + loan.id + ')'
                        : 'Finance.makeExtraPayment(' + loan.id + ',' + payAmt + ')';
                    html += '<button class="btn btn-sm loan-pct-btn ' + (pct === 100 ? 'btn-primary' : 'btn-secondary') + '"' +
                            (!canPay ? ' disabled' : '') +
                            ' onclick="' + fn + '">' + label + '</button>';
                });
                html += '</div>';
                html += '</div>'; // loan-payback-tabs
                html += '</div>'; // finance-loan-card
            });
            html += '</div>';
        }

        html += '<h4 class="finance-sub-heading">Available Loans</h4>';
        html += '<div class="finance-loan-products">';
        LOAN_TYPES.forEach(function (lt) {
            var total   = Math.round(lt.amount * (1 + lt.rate));
            var interest = total - lt.amount;
            var weeks   = Math.max(1, Math.floor(lt.termDays / 7));
            var weekly  = Math.ceil(total / weeks);
            var hasActive = (state.loans || []).some(function (l) { return !l.paidOff && l.typeId === lt.id; });

            html += '<div class="finance-product-card' + (hasActive ? ' finance-product-active' : '') + '">';
            html += '<div class="finance-product-header">';
            html += '<span class="finance-product-name">' + lt.name + '</span>';
            html += '<span class="finance-product-amount">' + UI.formatMoney(lt.amount) + '</span>';
            html += '</div>';
            html += '<p class="finance-product-desc">' + lt.description + '</p>';

            // Detailed interest breakdown
            html += '<div class="loan-product-breakdown">';
            html += '<div class="lpb-row"><span>Borrow</span><span class="lpb-pos">' + UI.formatMoney(lt.amount) + '</span></div>';
            html += '<div class="lpb-row"><span>Interest (' + (lt.rate * 100).toFixed(0) + '%)</span><span class="lpb-neg">+' + UI.formatMoney(interest) + '</span></div>';
            html += '<div class="lpb-row lpb-total"><span>Total repayable</span><span>' + UI.formatMoney(total) + '</span></div>';
            html += '<div class="lpb-row"><span>Weekly payment</span><span>' + UI.formatMoney(weekly) + '/wk \xD7 ' + weeks + ' wks</span></div>';
            html += '<div class="lpb-row"><span>Term</span><span>' + lt.termDays + ' days</span></div>';
            html += '</div>';

            if (hasActive) {
                html += '<button class="btn btn-secondary btn-sm" disabled>Already active</button>';
            } else {
                html += '<button class="btn btn-primary btn-sm" onclick="Finance.takeLoan(\'' + lt.id + '\')">' +
                        'Borrow ' + UI.formatMoney(lt.amount) + '</button>';
            }
            html += '</div>';
        });
        html += '</div>';
        return html;
    }

    function renderMarketingSection(state) {
        var active = (state.marketingCampaigns || []).filter(function (c) {
            return c.endDay >= state.day;
        });
        var html = '';

        if (active.length > 0) {
            html += '<h4 class="finance-sub-heading">Active Campaigns</h4>';
            html += '<div class="finance-campaign-active-list">';
            active.forEach(function (c) {
                var daysLeft = c.endDay - state.day;
                var elapsed  = c.duration - daysLeft;
                var pct      = Math.round((elapsed / c.duration) * 100);
                var campType = MARKETING_TYPES.find(function (m) { return m.id === c.typeId; });
                var emoji    = campType ? campType.emoji : '\uD83D\uDCE3';
                html += '<div class="finance-campaign-card">';
                html += '<div class="finance-campaign-row">';
                html += '<span class="finance-campaign-name">' + emoji + ' ' + c.name + '</span>';
                html += '<span class="finance-campaign-days">' + daysLeft + 'd left</span>';
                html += '</div>';
                html += '<div class="finance-campaign-meta">';
                html += '<span>+' + Math.round(c.bookingMod * 100) + '% bookings</span>';
                html += '<span>Cost ' + UI.formatMoney(c.cost) + '</span>';
                html += '</div>';
                html += '<div class="finance-loan-bar-track">';
                html += '<div class="finance-campaign-bar-fill" style="width:' + pct + '%;"></div>';
                html += '</div>';
                html += '</div>';
            });
            html += '</div>';
        }

        // Check if a marketing manager is auto-managing campaigns
        var hasMarketer = (state.hiredStaff || []).some(function(m){ return m.role === 'marketer'; });

        html += '<h4 class="finance-sub-heading">Available Campaigns' + (hasMarketer ? ' <span style="font-size:0.68rem;color:#8e44ad;font-weight:600;">\uD83D\uDCE3 Auto-managed by Marketing Manager</span>' : '') + '</h4>';
        html += '<div class="finance-loan-products">';
        MARKETING_TYPES.forEach(function (mt) {
            var running      = active.some(function (c) { return c.typeId === mt.id; });
            var canAfford    = state.money >= mt.cost;
            var autoManaged  = hasMarketer;

            html += '<div class="finance-product-card' +
                    (running ? ' finance-product-active' : '') +
                    (!canAfford && !running ? ' finance-product-unaffordable' : '') +
                    (autoManaged && !running ? ' finance-product-auto' : '') + '">';
            html += '<div class="finance-product-header">';
            html += '<span class="finance-product-name">' + mt.emoji + ' ' + mt.name + '</span>';
            html += '<span class="finance-product-amount">' + UI.formatMoney(mt.cost) + '</span>';
            html += '</div>';
            html += '<p class="finance-product-desc">' + mt.description + '</p>';
            html += '<div class="finance-product-details">';
            html += '<span>\uD83D\uDCC5 ' + mt.duration + ' days</span>';
            html += '<span>\u2B06 +' + mt.repBonus + ' rep</span>';
            html += '<span>\uD83D\uDCCB +' + Math.round(mt.bookingMod * 100) + '% bookings</span>';
            html += '</div>';
            if (running) {
                html += '<button class="btn btn-secondary btn-sm" disabled>Already running</button>';
            } else if (autoManaged) {
                html += '<button class="btn btn-secondary btn-sm" disabled style="color:#8e44ad;">\uD83D\uDCE3 Auto-managed</button>';
            } else if (!canAfford) {
                html += '<button class="btn btn-secondary btn-sm" disabled>Need ' + UI.formatMoney(mt.cost) + '</button>';
            } else {
                html += '<button class="btn btn-primary btn-sm" onclick="Finance.launchCampaign(\'' + mt.id + '\')">Launch ' + UI.formatMoney(mt.cost) + '</button>';
            }
            html += '</div>';
        });
        html += '</div>';
        html += '<div class="finance-campaign-auto">';
        html += '<h4 class="finance-sub-heading">\uD83D\uDCE3 Auto-Marketing</h4>';

        (state.hiredStaff || []).forEach(function (m) {
            if (m.role !== 'marketer') return;
            var poolVal   = Math.round(m.marketingPool || 0);
            var budgetVal = Math.max(0, Math.min(1000, m.marketingBudget || 0));
            html += '<div class="staff-mkt-budget">';
            html += '<div class="staff-mkt-budget-header"><span class="staff-mkt-budget-label">Budget</span><span class="staff-mkt-budget-val" style="color:#8e44ad;">'+UI.formatMoney(budgetVal)+'/day</span></div>';
            html += '<input type="range" class="breed-slider" min="0" max="1000" step="50" value="'+budgetVal+'" oninput="Staff.setMarketingBudget('+m.instanceId+',this.value)">';
            html += '<div class="staff-mkt-pool">Pool: '+UI.formatMoney(poolVal)+'</div>';
            html += '</div>';
        });

        if (!(state.hiredStaff || []).some(function (m) { return m.role === 'marketer'; })) {
            html += '<p class="empty-state">Hire a marketer to enable auto-marketing.</p>';
        }

        html += '</div>';
        return html;
    }

    function renderTransactionLog(state) {
        var log    = (state.financeLog || []).slice().reverse().slice(0, 30);
        if (log.length === 0) {
            return '<p class="empty-state">No transactions recorded yet.</p>';
        }
        var html = '<div class="finance-txn-list">';
        log.forEach(function (entry) {
            var meta      = CATEGORY_META[entry.category] || { label: entry.category, colour: '#888' };
            var isIncome  = entry.amount > 0;
            var amtClass  = isIncome ? 'finance-txn-pos' : 'finance-txn-neg';
            var amtPrefix = isIncome ? '+' : '';
            html += '<div class="finance-txn-row">';
            html += '<span class="finance-txn-day">D' + entry.day + '</span>';
            html += '<span class="finance-txn-dot" style="background:' + meta.colour + ';"></span>';
            html += '<span class="finance-txn-desc">' + entry.description + '</span>';
            html += '<span class="finance-txn-amount ' + amtClass + '">' +
                        amtPrefix + UI.formatMoney(Math.abs(entry.amount)) + '</span>';
            html += '</div>';
        });
        html += '</div>';
        return html;
    }

    // ── Investor & Stock system ─────────────────────────────────────────────────

    const INVESTOR_TYPES = [
        {
            id:          'angel',
            name:        'Angel Investor',
            emoji:       '\uD83D\uDC7C',
            investment:  25000,
            equityPct:   5,
            royaltyPct:  8,
            minLakes:    3,
            minRep:      100,
            description: 'A local fishing enthusiast with capital to deploy. Low equity ask, reasonable royalty.',
            buybackMult: 1.40
        },
        {
            id:          'venture',
            name:        'Venture Capital',
            emoji:       '\uD83D\uDCBC',
            investment:  100000,
            equityPct:   15,
            royaltyPct:  14,
            minLakes:    3,
            minRep:      300,
            description: 'A sports & leisure VC firm. Significant capital injection, higher ongoing royalty.',
            buybackMult: 1.50
        },
        {
            id:          'corporate',
            name:        'Corporate Partnership',
            emoji:       '\uD83C\uDFE2',
            investment:  300000,
            equityPct:   25,
            royaltyPct:  20,
            minLakes:    4,
            minRep:      500,
            description: 'A national fishing retail chain. Major investment, significant ongoing cut.',
            buybackMult: 1.60
        }
    ];

    const IPO_SHARE_COUNT = 1000;   // total issued shares
    const MAX_PUBLIC_EQUITY = 40;   // max % sold to market

    // ── Valuation helpers ────────────────────────────────────────────────────────

    function getFisheryValue() {
        var state      = Game.getState();
        var lakeVal    = (state.ownedLakes || []).reduce(function (s, id) {
            var l = typeof Lakes !== 'undefined' ? Lakes.getLakeById(id) : null;
            return s + (l ? (l.cost || 0) : 0);
        }, 0);
        var stockVal   = typeof Fish !== 'undefined' ? Fish.getTotalStockValue(state.fish) : 0;
        var avgDaily   = (state.incomeHistory || []).slice(-7).reduce(function (s, e) { return s + (e.income || 0); }, 0) /
                         Math.max(1, Math.min(7, (state.incomeHistory || []).length));
        var earningsVal = Math.round(avgDaily * 30);
        return lakeVal + stockVal + earningsVal;
    }

    function getSharePrice() {
        var state = Game.getState();
        if (!state.fisheryListed) return 0;
        return Math.max(1, Math.round(getFisheryValue() / IPO_SHARE_COUNT));
    }

    function getTotalEquitySold() {
        var state     = Game.getState();
        var dealEquity = (state.investorDeals || []).filter(function (d) { return !d.boughtBack; })
                         .reduce(function (s, d) { return s + d.equityPct; }, 0);
        return dealEquity + (state.marketEquityPct || 0);
    }

    function getDailyRoyaltyDue() {
        var state   = Game.getState();
        var history = state.incomeHistory || [];
        var recent  = history.slice(-3);
        var avgIncome = recent.reduce(function (s, e) { return s + (e.income || 0); }, 0) /
                        Math.max(1, recent.length);
        var total = 0;
        (state.investorDeals || []).forEach(function (d) {
            if (!d.boughtBack) total += avgIncome * (d.royaltyPct / 100);
        });
        // Market equity royalty (blended 12%)
        total += avgIncome * ((state.marketEquityPct || 0) / 100) * 0.12;
        return Math.round(total);
    }

    // ── Investor deal actions ────────────────────────────────────────────────────

    function acceptInvestorDeal(typeId) {
        initState();
        var state    = Game.getState();
        var invType  = INVESTOR_TYPES.find(function (t) { return t.id === typeId; });
        if (!invType) return;

        // Eligibility checks
        if (state.ownedLakes.length < invType.minLakes) {
            UI.showToast('Need ' + invType.minLakes + ' lakes to attract ' + invType.name + '.', 'error');
            return;
        }
        if (state.reputation < invType.minRep) {
            UI.showToast('Need reputation ' + invType.minRep + ' for ' + invType.name + '.', 'error');
            return;
        }
        if (getTotalEquitySold() + invType.equityPct > 49) {
            UI.showToast('Cannot sell — would exceed 49% equity cap.', 'error');
            return;
        }
        var already = (state.investorDeals || []).some(function (d) { return d.typeId === typeId && !d.boughtBack; });
        if (already) {
            UI.showToast('You already have an active deal with this investor.', 'warning');
            return;
        }

        var deal = {
            id:           state.nextInvestorId++,
            typeId:       typeId,
            name:         invType.name,
            emoji:        invType.emoji,
            equityPct:    invType.equityPct,
            royaltyPct:   invType.royaltyPct,
            investment:   invType.investment,
            buybackCost:  Math.round(invType.investment * invType.buybackMult),
            acceptedDay:  state.day,
            totalPaid:    0,
            boughtBack:   false
        };

        if (!state.investorDeals) state.investorDeals = [];
        state.investorDeals.push(deal);
        state.money         += invType.investment;
        state.totalEarnings += invType.investment;

        addFinanceLog('loan_received', invType.investment, invType.name + ' investment');
        Game.addEvent('hire', invType.emoji, invType.name + ' invested ' + UI.formatMoney(invType.investment) + ' for ' + invType.equityPct + '% equity.');
        Game.addNotification(invType.emoji + ' ' + invType.name + ' invested ' + UI.formatMoney(invType.investment) +
            ' for ' + invType.equityPct + '% equity. Royalty: ' + invType.royaltyPct + '% of daily income.');
        UI.showToast(invType.name + ' deal accepted!', 'success');
        Game.saveToStorage();
        renderFinance();
    }

    function buybackInvestor(dealId) {
        initState();
        var state = Game.getState();
        var deal  = (state.investorDeals || []).find(function (d) { return d.id === dealId; });
        if (!deal || deal.boughtBack) { UI.showToast('Deal not found.', 'error'); return; }

        if (state.money < deal.buybackCost) {
            UI.showToast('Need ' + UI.formatMoney(deal.buybackCost) + ' to buy back this stake.', 'error');
            return;
        }

        state.money      -= deal.buybackCost;
        state.totalSpent += deal.buybackCost;
        deal.boughtBack   = true;

        addFinanceLog('loan_repayment', -deal.buybackCost, deal.name + ' equity buyback');
        Game.addNotification('\uD83D\uDCC8 Bought back ' + deal.equityPct + '% equity from ' + deal.name +
            ' for ' + UI.formatMoney(deal.buybackCost) + '.');
        UI.showToast(deal.name + ' equity reclaimed!', 'success');
        Game.saveToStorage();
        renderFinance();
    }

    // ── IPO / Market listing ─────────────────────────────────────────────────────

    function listFishery() {
        initState();
        var state = Game.getState();
        if (state.ownedLakes.length < 3) {
            UI.showToast('Need at least 3 lakes to list the fishery.', 'error'); return;
        }
        if (state.reputation < 30) {
            UI.showToast('Need reputation 30 to list.', 'error'); return;
        }
        state.fisheryListed = true;
        state.sharePrice    = getSharePrice();
        Game.addNotification('\uD83D\uDCC8 Fishery listed! Initial share price: ' + UI.formatMoney(state.sharePrice) + ' per share.');
        Game.addEvent('hire', '\uD83D\uDCC8', 'Fishery listed at ' + UI.formatMoney(state.sharePrice) + '/share.');
        UI.showToast('Fishery listed on the market!', 'success');
        Game.saveToStorage();
        renderFinance();
    }

    function sellMarketShares(pct) {
        initState();
        var state = Game.getState();
        pct = parseInt(pct, 10);
        if (isNaN(pct) || pct <= 0) return;
        if (!state.fisheryListed) { UI.showToast('List the fishery first.', 'error'); return; }
        if (getTotalEquitySold() + pct > MAX_PUBLIC_EQUITY + (state.investorDeals || []).filter(function(d){return !d.boughtBack;}).reduce(function(s,d){return s+d.equityPct;},0)) {
            UI.showToast('Cannot sell — exceeds maximum equity limits.', 'error'); return;
        }
        if (getTotalEquitySold() + pct > 49) {
            UI.showToast('Cannot sell more than 49% total equity.', 'error'); return;
        }
        var price    = getSharePrice();
        var proceeds = Math.round(price * (pct / 100) * IPO_SHARE_COUNT);
        state.marketEquityPct  = (state.marketEquityPct || 0) + pct;
        state.money            += proceeds;
        state.totalEarnings    += proceeds;
        state.sharePrice       = price;
        addFinanceLog('loan_received', proceeds, 'Market equity sale (' + pct + '%)');
        Game.addNotification('\uD83D\uDCC8 Sold ' + pct + '% market equity for ' + UI.formatMoney(proceeds) + '.');
        UI.showToast('Sold ' + pct + '% for ' + UI.formatMoney(proceeds) + '!', 'success');
        Game.saveToStorage();
        renderFinance();
    }

    function buybackMarketShares(pct) {
        initState();
        var state = Game.getState();
        pct = parseInt(pct, 10);
        if (isNaN(pct) || pct <= 0 || pct > (state.marketEquityPct || 0)) {
            UI.showToast('Invalid amount.', 'error'); return;
        }
        var price = Math.round(getSharePrice() * 1.15); // 15% premium to buy back
        var cost  = Math.round(price * (pct / 100) * IPO_SHARE_COUNT);
        if (state.money < cost) {
            UI.showToast('Need ' + UI.formatMoney(cost) + ' to buy back ' + pct + '%.', 'error'); return;
        }
        state.money          -= cost;
        state.totalSpent     += cost;
        state.marketEquityPct = Math.max(0, (state.marketEquityPct || 0) - pct);
        addFinanceLog('loan_repayment', -cost, 'Market equity buyback (' + pct + '%)');
        Game.addNotification('\uD83D\uDCC8 Bought back ' + pct + '% market equity for ' + UI.formatMoney(cost) + '.');
        UI.showToast('Bought back ' + pct + '% equity!', 'success');
        Game.saveToStorage();
        renderFinance();
    }

    // ── Daily investor royalties ─────────────────────────────────────────────────

    function processInvestorRoyalties(dailyIncome) {
        var state = Game.getState();
        if ((!state.investorDeals || state.investorDeals.length === 0) && !(state.marketEquityPct > 0)) return;
        if (dailyIncome <= 0) return;

        var totalRoyalty = 0;

        (state.investorDeals || []).forEach(function (deal) {
            if (deal.boughtBack) return;
            var r = Math.round(dailyIncome * (deal.royaltyPct / 100));
            deal.totalPaid += r;
            totalRoyalty   += r;
        });

        if ((state.marketEquityPct || 0) > 0) {
            var marketR = Math.round(dailyIncome * (state.marketEquityPct / 100) * 0.12);
            totalRoyalty += marketR;
        }

        if (totalRoyalty > 0) {
            state.money      = Math.max(0, state.money - totalRoyalty);
            state.totalSpent += totalRoyalty;
            if (!state.dividendsPaid) state.dividendsPaid = 0;
            state.dividendsPaid += totalRoyalty;
            addFinanceLog('loan_repayment', -totalRoyalty, 'Investor royalties');
            Game.addNotification('\uD83D\uDCC8 Investor royalties paid: ' + UI.formatMoney(totalRoyalty) + '.');
        }

        // Update share price daily
        if (state.fisheryListed) {
            var newPrice = getSharePrice();
            // Slight random market fluctuation ±4%
            var fluc = 1 + ((Math.random() - 0.5) * 0.08);
            state.sharePrice = Math.max(1, Math.round(newPrice * fluc));
        }
    }

    // ── Investors & Stock render ─────────────────────────────────────────────────

    function renderInvestorsSection(state) {
        var fishVal   = getFisheryValue();
        var sPrice    = state.fisheryListed ? getSharePrice() : 0;
        var equitySold = getTotalEquitySold();
        var equityLeft = 49 - equitySold;
        var canList   = state.ownedLakes.length >= 3 && state.reputation >= 30;

        var html = '';

        // Fishery valuation card
        html += '<div class="inv-valuation-strip">';
        html += '<div class="inv-val-item"><span class="inv-val-label">Fishery Value</span><span class="inv-val-num">' + UI.formatMoney(fishVal) + '</span></div>';
        html += '<div class="inv-val-item"><span class="inv-val-label">Equity Available</span><span class="inv-val-num">' + equityLeft + '%</span></div>';
        html += '<div class="inv-val-item"><span class="inv-val-label">Dividends Paid</span><span class="inv-val-num" style="color:var(--colour-danger);">' + UI.formatMoney(state.dividendsPaid || 0) + '</span></div>';
        if (state.fisheryListed) {
            html += '<div class="inv-val-item"><span class="inv-val-label">Share Price</span><span class="inv-val-num" style="color:var(--colour-gold);">' + UI.formatMoney(state.sharePrice || sPrice) + '</span></div>';
        }
        html += '</div>';

        // Active investor deals
        var activeDeals = (state.investorDeals || []).filter(function (d) { return !d.boughtBack; });
        if (activeDeals.length > 0) {
            html += '<h4 class="finance-sub-heading">Active Investor Deals</h4>';
            html += '<div class="inv-deals-list">';
            activeDeals.forEach(function (deal) {
                var progress = Math.min(100, Math.round((deal.totalPaid / deal.investment) * 100));
                html += '<div class="inv-deal-card">';
                html += '<div class="inv-deal-header">';
                html += '<span>' + deal.emoji + ' ' + deal.name + '</span>';
                html += '<span class="inv-deal-equity">' + deal.equityPct + '% equity</span>';
                html += '</div>';
                html += '<div class="inv-deal-meta">';
                html += '<span>\uD83D\uDCB8 ' + deal.royaltyPct + '% daily royalty</span>';
                html += '<span>Paid so far: ' + UI.formatMoney(deal.totalPaid) + '</span>';
                html += '</div>';
                html += '<div class="finance-loan-bar-track"><div class="finance-campaign-bar-fill" style="width:' + progress + '%;"></div></div>';
                html += '<div class="inv-deal-footer">';
                html += '<span style="font-size:0.72rem;color:var(--colour-text-muted);">Buyback cost: ' + UI.formatMoney(deal.buybackCost) + '</span>';
                html += '<button class="btn btn-secondary btn-sm" onclick="Finance.buybackInvestor(' + deal.id + ')"' +
                        (state.money < deal.buybackCost ? ' disabled' : '') + '>Buy Back</button>';
                html += '</div>';
                html += '</div>';
            });
            html += '</div>';
        }

        // Available investor types
        html += '<h4 class="finance-sub-heading">Seek Investment</h4>';
        html += '<div class="finance-loan-products">';
        INVESTOR_TYPES.forEach(function (inv) {
            var equityOK  = equityLeft >= inv.equityPct;
            var lakeOK    = state.ownedLakes.length >= inv.minLakes;
            var repOK     = state.reputation >= inv.minRep;
            var alreadyActive = (state.investorDeals || []).some(function (d) { return d.typeId === inv.id && !d.boughtBack; });
            var eligible  = equityOK && lakeOK && repOK && !alreadyActive;
            html += '<div class="finance-product-card' + (!eligible ? ' finance-product-unaffordable' : '') + '">';
            html += '<div class="finance-product-header">';
            html += '<span class="finance-product-name">' + inv.emoji + ' ' + inv.name + '</span>';
            html += '<span class="finance-product-amount">' + UI.formatMoney(inv.investment) + '</span>';
            html += '</div>';
            html += '<p class="finance-product-desc">' + inv.description + '</p>';
            html += '<div class="finance-product-details">';
            html += '<span>' + inv.equityPct + '% equity</span>';
            html += '<span>' + inv.royaltyPct + '% royalty</span>';
            html += '<span>Buyback: ' + UI.formatMoney(Math.round(inv.investment * inv.buybackMult)) + '</span>';
            html += '<span>Req: ' + inv.minLakes + ' lakes, rep ' + inv.minRep + '</span>';
            html += '</div>';
            if (alreadyActive) {
                html += '<button class="btn btn-secondary btn-sm" disabled>Already active</button>';
            } else if (!eligible) {
                var reason = !lakeOK ? ('Need ' + inv.minLakes + ' lakes') : (!repOK ? ('Need rep ' + inv.minRep) : (!equityOK ? 'Equity full' : ''));
                html += '<button class="btn btn-secondary btn-sm" disabled>' + reason + '</button>';
            } else {
                html += '<button class="btn btn-primary btn-sm" onclick="Finance.acceptInvestorDeal(\'' + inv.id + '\')">Accept Deal</button>';
            }
            html += '</div>';
        });
        html += '</div>';

        // IPO / Market section
        html += '<h4 class="finance-sub-heading">\uD83D\uDCC8 Stock Market</h4>';
        if (!state.fisheryListed) {
            if (!canList) {
                html += '<p class="empty-state">Own 3+ lakes and reach reputation 30 to list the fishery on the market.</p>';
            } else {
                html += '<div class="inv-ipo-card">';
                html += '<p style="font-size:0.82rem;color:var(--colour-text-muted);margin-bottom:0.75rem;">Estimated listing value: <strong>' + UI.formatMoney(fishVal) + '</strong> &mdash; ' + UI.formatMoney(Math.round(fishVal / IPO_SHARE_COUNT)) + ' / share</p>';
                html += '<button class="btn btn-primary" onclick="Finance.listFishery()">List Fishery (IPO)</button>';
                html += '</div>';
            }
        } else {
            var curPrice = state.sharePrice || sPrice;
            var mktPct   = state.marketEquityPct || 0;
            html += '<div class="inv-ipo-card">';
            html += '<div class="inv-valuation-strip" style="margin-bottom:0.75rem;">';
            html += '<div class="inv-val-item"><span class="inv-val-label">Share Price</span><span class="inv-val-num" style="color:var(--colour-gold);">' + UI.formatMoney(curPrice) + '</span></div>';
            html += '<div class="inv-val-item"><span class="inv-val-label">Market Cap</span><span class="inv-val-num">' + UI.formatMoney(curPrice * IPO_SHARE_COUNT) + '</span></div>';
            html += '<div class="inv-val-item"><span class="inv-val-label">Public Float</span><span class="inv-val-num">' + mktPct + '%</span></div>';
            html += '</div>';
            // Sell slider
            var maxSellPct = Math.min(MAX_PUBLIC_EQUITY, 49 - equitySold);
            if (maxSellPct > 0) {
                html += '<div class="inv-trade-row">';
                html += '<label class="inv-trade-label">Sell shares:</label>';
                html += '<input type="range" class="breed-slider" min="1" max="' + maxSellPct + '" value="5" id="sell-pct-slider" ' +
                        'oninput="document.getElementById(\'sell-pct-val\').textContent=this.value+\'% = '+'\' + Finance.quoteShareSale(this.value)">';
                html += '<span id="sell-pct-val" class="inv-trade-quote">5%</span>';
                html += '<button class="btn btn-primary btn-sm" onclick="Finance.sellMarketShares(document.getElementById(\'sell-pct-slider\').value)">Sell</button>';
                html += '</div>';
            }
            // Buyback slider
            if (mktPct > 0) {
                html += '<div class="inv-trade-row" style="margin-top:0.5rem;">';
                html += '<label class="inv-trade-label">Buy back:</label>';
                html += '<input type="range" class="breed-slider" min="1" max="' + mktPct + '" value="1" id="buyback-pct-slider" ' +
                        'oninput="document.getElementById(\'buyback-pct-val\').textContent=this.value+\'%\'">';
                html += '<span id="buyback-pct-val" class="inv-trade-quote">1%</span>';
                html += '<button class="btn btn-secondary btn-sm" onclick="Finance.buybackMarketShares(document.getElementById(\'buyback-pct-slider\').value)">Buy Back</button>';
                html += '</div>';
            }
            html += '</div>';
        }

        return html;
    }

    /** Helper called by the inline slider to show a live quote. */
    function quoteShareSale(pct) {
        var state = Game.getState();
        var price = state.sharePrice || getSharePrice();
        return UI.formatMoney(Math.round(price * (parseInt(pct) / 100) * IPO_SHARE_COUNT));
    }

    // ── Main render ─────────────────────────────────────────────────────────────

    function renderFinance() {
        initState();
        var state       = Game.getState();
        var container   = document.getElementById('panel-finance');
        if (!container) return;

        var netProfit   = getNetProfit();
        var debt        = getOutstandingDebt();
        var dailyStaff  = getDailyStaffCost();
        var dailyLoans  = getDailyLoanRepayments();
        var dailyMaintF = typeof Lakes !== 'undefined'
            ? (state.ownedLakes || []).reduce(function (s, id) {
                return s + Lakes.getLakeMaintenanceDailyCost(id);
              }, 0) : 0;
        var dailyCosts  = dailyStaff + dailyLoans + dailyMaintF;
        var activeMarketing = (state.marketingCampaigns || []).filter(function (c) {
            return c.endDay >= state.day;
        });
        var incomeSegs  = getIncomeSegments();
        var expenseSegs = getExpenseSegments();
        var totalInc    = incomeSegs.reduce(function (s, e) { return s + e.value; }, 0);
        var totalExp    = expenseSegs.reduce(function (s, e) { return s + e.value; }, 0);

        var html = '<h2>Finance</h2>';

        // ── KPI strip (single row) ─────────────────────────────────────────────
        var kpis = [
            { label: 'Balance',       value: UI.formatMoney(state.money),         colour: 'var(--colour-gold)' },
            { label: 'Earned',        value: UI.formatMoney(state.totalEarnings), colour: 'var(--colour-accent)' },
            { label: 'Spent',         value: UI.formatMoney(state.totalSpent),    colour: 'var(--colour-danger)' },
            { label: 'Daily Costs',   value: UI.formatMoney(dailyCosts),          colour: '#e67e22' },
            { label: 'Staff/Day',     value: UI.formatMoney(dailyStaff),          colour: 'var(--colour-text-muted)' },
            { label: 'Loans/Day',     value: UI.formatMoney(dailyLoans),          colour: 'var(--colour-text-muted)' },
            { label: 'Debt',          value: debt > 0 ? UI.formatMoney(debt) : 'None',
              colour: debt > 0 ? 'var(--colour-danger)' : 'var(--colour-text-muted)' },
            { label: 'Campaigns',     value: activeMarketing.length || 'None',    colour: activeMarketing.length ? '#8e44ad' : 'var(--colour-text-muted)' }
        ];

        html += '<div class="finance-stat-bar">';
        kpis.forEach(function (k, i) {
            html += '<div class="finance-stat-item">';
            html += '<span class="finance-stat-label">' + k.label + '</span>';
            html += '<span class="finance-stat-value" style="color:' + k.colour + ';">' + k.value + '</span>';
            html += '</div>';
            if (i < kpis.length - 1) html += '<div class="finance-stat-sep"></div>';
        });
        html += '</div>';

        // ── Two-column body ────────────────────────────────────────────────────
        // LEFT:  7-day projection, bank & loans, marketing campaigns
        // RIGHT: income bar chart, pie charts, transaction log
        html += '<div class="finance-two-col">';

        // ── LEFT COLUMN ──────────────────────────────────────────────────────
        html += '<div class="finance-left-col">';

        html += '<div class="finance-card">';
        html += '<h3 class="finance-card-heading">\uD83D\uDCC8 7-Day Projection</h3>';
        html += '<p class="finance-card-desc">Based on confirmed bookings and daily running costs.</p>';
        html += renderProjectionTable();
        html += '</div>';

        // ── Loan Payback (only shown when active loans exist) ─────────────────
        var activeLoansQuick = (state.loans || []).filter(function (l) { return !l.paidOff; });
        if (activeLoansQuick.length > 0) {
            html += '<div class="finance-card">';
            html += '<h3 class="finance-card-heading">\uD83C\uDFE6 Loan Repayments</h3>';
            html += '<p class="finance-card-desc">Quick repayment options for all active loans.</p>';
            activeLoansQuick.forEach(function (loan) {
                var remaining = loan.totalRepayable - loan.totalPaid;
                var progress  = Math.round((loan.totalPaid / loan.totalRepayable) * 100);
                html += '<div class="lpq-card">';
                html += '<div class="lpq-header">';
                html += '<span class="lpq-name">' + loan.name + '</span>';
                html += '<span class="lpq-remaining">' + UI.formatMoney(remaining) + ' left</span>';
                html += '</div>';
                html += '<div class="finance-loan-bar-track" style="margin:0.3rem 0;"><div class="finance-loan-bar-fill" style="width:' + progress + '%;"></div></div>';
                html += '<div class="loan-payback-tabs">';
                html += '<span class="loan-payback-heading">Pay</span>';
                html += '<div class="loan-payback-btns">';
                [20, 50, 100].forEach(function (pct) {
                    var payAmt   = Math.round(remaining * pct / 100);
                    var isEarly  = pct === 100;
                    var fee      = isEarly ? Math.round(remaining * 0.02) : 0;
                    var total    = payAmt + fee;
                    var canPay   = state.money >= total;
                    var label    = pct + '% — ' + UI.formatMoney(total) + (fee > 0 ? '*' : '');
                    var fn       = isEarly
                        ? 'Finance.payOffLoan(' + loan.id + ')'
                        : 'Finance.makeExtraPayment(' + loan.id + ',' + payAmt + ')';
                    html += '<button class="btn btn-sm loan-pct-btn ' + (pct === 100 ? 'btn-primary' : 'btn-secondary') + '"' +
                            (!canPay ? ' disabled' : '') + ' onclick="' + fn + '">' + label + '</button>';
                });
                html += '</div>';
                if (activeLoansQuick.some(function(l){ return !l.paidOff && Math.round((l.totalRepayable-l.totalPaid)*0.02)>0; })) {
                    html += '<span style="font-size:0.65rem;color:var(--colour-text-muted);">* inc. 2% early repayment fee</span>';
                }
                html += '</div>';
                html += '</div>';
            });
            html += '</div>';
        }

        html += '<div class="finance-card">';
        html += '<h3 class="finance-card-heading">\uD83E\uDDD1\u200D\uD83D\uDCBC Investors &amp; Stock</h3>';
        html += '<p class="finance-card-desc">Sell equity to investors or list on the market. Requires 3 lakes.</p>';
        html += renderInvestorsSection(state);
        html += '</div>';

        html += '</div>'; // finance-left-col

        // ── RIGHT COLUMN ─────────────────────────────────────────────────────
        html += '<div class="finance-right-col">';

        html += '<div class="finance-card">';
        html += renderIncomeBarChart(state);
        html += '</div>';

        html += '<div class="finance-pies-row">';

        html += '<div class="finance-card finance-pie-card">';
        html += renderPieChart(incomeSegs, 'Income Sources');
        html += '<div class="finance-pie-total">Total: ' + UI.formatMoney(totalInc) + '</div>';
        html += '</div>';

        html += '<div class="finance-card finance-pie-card">';
        html += renderPieChart(expenseSegs, 'Expense Breakdown');
        html += '<div class="finance-pie-total">Total: ' + UI.formatMoney(totalExp) + '</div>';
        html += '</div>';

        html += '</div>'; // finance-pies-row

        html += '<div class="finance-card">';
        html += '<h3 class="finance-card-heading">\uD83C\uDFE6 Bank &amp; Loans</h3>';
        html += '<p class="finance-card-desc">Borrow capital to grow faster. Repayments are automatic daily.</p>';
        html += renderLoansSection(state);
        html += '</div>';

        html += '<div class="finance-card">';
        html += '<h3 class="finance-card-heading">\uD83D\uDCE3 Marketing Campaigns</h3>';
        html += '<p class="finance-card-desc">Boost angler bookings and reputation. Campaigns stack.</p>';
        html += renderMarketingSection(state);
        html += '</div>';

        // ── Staff list ────────────────────────────────────────────────────────
        if (state.hiredStaff && state.hiredStaff.length > 0) {
            html += '<div class="finance-card">';
            html += '<h3 class="finance-card-heading">\uD83D\uDC64 Staff</h3>';
            var totalWages = state.hiredStaff.reduce(function(s, m){ return s + m.salary; }, 0);
            html += '<p class="finance-card-desc">Total wages: <strong>' + UI.formatMoney(totalWages) + '/day</strong></p>';
            html += '<div class="finance-staff-list">';
            state.hiredStaff.forEach(function(member){
                var happiness = member.happiness || 0;
                var hapCol = happiness >= 70 ? 'var(--colour-accent)' : happiness >= 40 ? '#d4a843' : 'var(--colour-danger)';
                html += '<div class="finance-staff-row">';
                html += '<div class="finance-staff-info">';
                html += '<span class="finance-staff-name">' + member.name + '</span>';
                html += '<span class="finance-staff-role">' + (member.role || 'Staff') + '</span>';
                html += '</div>';
                html += '<div class="finance-staff-right">';
                html += '<span class="finance-staff-wage">' + UI.formatMoney(member.salary) + '/d</span>';
                html += '<span class="finance-staff-hap" style="color:' + hapCol + ';">\u2665 ' + happiness + '%</span>';
                html += '</div>';
                html += '</div>';
            });
            html += '</div>';
            html += '</div>';
        }

        html += '<div class="finance-card">';
        html += '<h3 class="finance-card-heading">\uD83D\uDCCB Transaction Log</h3>';
        html += '<p class="finance-card-desc">Last 30 recorded transactions.</p>';
        html += renderTransactionLog(state);
        html += '</div>';

        html += '</div>'; // finance-right-col

        html += '</div>'; // finance-two-col

        container.innerHTML = html;
    }

    // ── Public API ───────────────────────────────────────────────────────────────

    return {
        initState:                   initState,
        addFinanceLog:               addFinanceLog,
        takeLoan:                    takeLoan,
        launchCampaign:              launchCampaign,
        launchCampaignSilent:        function(id) {
            // same as launchCampaign but does not call renderFinance
            initState();
            var state    = Game.getState();
            var campType = MARKETING_TYPES.find(function(c){ return c.id === id; });
            if (!campType || state.money < campType.cost) return false;
            var alreadyActive = state.marketingCampaigns.some(function(c){ return c.typeId === id && c.endDay >= state.day; });
            if (alreadyActive) return false;
            Game.spendMoney(campType.cost);
            addFinanceLog('marketing', -campType.cost, campType.name + ' campaign (auto)');
            state.marketingCampaigns.push({ id: state.nextCampaignId++, typeId: campType.id, name: campType.name,
                startDay: state.day, endDay: state.day + campType.duration, duration: campType.duration,
                bookingMod: campType.bookingMod, repBonus: campType.repBonus, cost: campType.cost });
            return true;
        },
        getMarketingTypes:           function(){ return MARKETING_TYPES; },
        makeExtraPayment:            makeExtraPayment,
        processDailyFinance:         processDailyFinance,
        getMarketingBookingModifier: getMarketingBookingModifier,
        getNetProfit:                getNetProfit,
        getOutstandingDebt:          getOutstandingDebt,
        getFisheryValue:             getFisheryValue,
        getSharePrice:               getSharePrice,
        getTotalEquitySold:          getTotalEquitySold,
        getDailyRoyaltyDue:          getDailyRoyaltyDue,
        acceptInvestorDeal:          acceptInvestorDeal,
        buybackInvestor:             buybackInvestor,
        listFishery:                 listFishery,
        sellMarketShares:            sellMarketShares,
        buybackMarketShares:         buybackMarketShares,
        quoteShareSale:              quoteShareSale,
        renderFinance:               renderFinance
    };
})();
