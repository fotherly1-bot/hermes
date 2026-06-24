/**
 * Carp Fishing Tycoon - UI Management
 * Handles tabs, modals, notifications, formatting, and DOM rendering.
 */

'use strict';

const UI = (function () {
    let currentTab = 'dashboard';

    /**
     * Initialise UI event listeners and render initial state.
     */
    function init() {
        setupTabNavigation();
        setupNextDayButton();
        setupModal();
        renderAll();
    }

    /**
     * Setup tab navigation click handlers.
     */
    function setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                switchTab(btn.dataset.tab);
            });
        });
    }

    /**
     * Switch to a specific tab.
     */
    function switchTab(tabName) {
        currentTab = tabName;

        // Update tab button styles
        document.querySelectorAll('.tab-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update panel visibility
        document.querySelectorAll('.panel').forEach(function (panel) {
            panel.classList.toggle('active', panel.id === 'panel-' + tabName);
        });

        // Refresh the active panel content
        renderPanel(tabName);
    }

    // ── Day auto-timer ────────────────────────────────────────────────────────

    var _timerPaused      = false;
    var _timerSecsLeft    = 60;    // 1 minute per day
    var _timerInterval    = null;
    var _speedMultiplier  = 1;     // 1 = normal, 2 = 2x, 4 = 4x
    var DAY_DURATION      = 60;    // seconds

    function startDayTimer() {
        _timerSecsLeft = DAY_DURATION;
        if (_timerInterval) clearInterval(_timerInterval);
        _timerInterval = setInterval(function () {
            if (_timerPaused) return;
            _timerSecsLeft -= _speedMultiplier;
            updateTimerDisplay();
            if (_timerSecsLeft <= 0) {
                _timerSecsLeft = DAY_DURATION;
                Game.nextDay();
                renderAll();
            }
        }, 1000);
        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        var displaySecs = Math.max(0, _timerSecsLeft);
        var mins  = Math.floor(displaySecs / 60);
        var secs  = displaySecs % 60;
        var label = mins + ':' + (secs < 10 ? '0' : '') + secs;

        var timerEl = document.getElementById('timer-display');
        if (timerEl) timerEl.innerHTML = '\u23F1 <strong>' + label + '</strong>';

        var fill = document.getElementById('day-progress-fill');
        if (fill) fill.style.width = (((DAY_DURATION - displaySecs) / DAY_DURATION) * 100) + '%';

        var pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) pauseBtn.innerHTML = _timerPaused ? '\u25B6 Resume' : '\u23F8 Pause';

        var speedBtn = document.getElementById('speed-btn');
        if (speedBtn) {
            if (_speedMultiplier === 1) {
                speedBtn.innerHTML = '\u23E9 2x';
                speedBtn.className = speedBtn.className.replace(/ ?active/g, '').replace(/ ?speed-4x/g, '');
            } else if (_speedMultiplier === 2) {
                speedBtn.innerHTML = '\u23E9 4x';
                speedBtn.className = speedBtn.className.replace(/ ?speed-4x/g, '') + ' active';
            } else {
                speedBtn.innerHTML = '\u23E9 1x';
                speedBtn.className = speedBtn.className.replace(/ ?active/g, '') + ' active speed-4x';
            }
        }
    }

    function toggleTimer() {
        _timerPaused = !_timerPaused;
        updateTimerDisplay();
        showToast(_timerPaused ? 'Game paused.' : 'Game resumed.', 'success');
    }

    function toggleSpeed() {
        if (_speedMultiplier === 1)      _speedMultiplier = 2;
        else if (_speedMultiplier === 2) _speedMultiplier = 4;
        else                             _speedMultiplier = 1;
        updateTimerDisplay();
        showToast('Speed: ' + _speedMultiplier + 'x', 'success');
    }

    /**
     * Setup the day timer (replaces the old Next Day button).
     */
    function setupNextDayButton() {
        startDayTimer();
    }

    /**
     * Setup modal close functionality.
     */
    function setupModal() {
        const overlay = document.getElementById('modal-overlay');
        const closeBtn = document.getElementById('modal-close');

        closeBtn.addEventListener('click', hideModal);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                hideModal();
            }
        });
    }

    /**
     * Show a modal with custom content.
     */
    function showModal(html) {
        document.getElementById('modal-body').innerHTML = html;
        document.getElementById('modal-overlay').classList.remove('hidden');
    }

    /**
     * Hide the modal.
     */
    function hideModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
        document.getElementById('modal-body').innerHTML = '';
    }

    /**
     * Show a toast notification.
     */
    function showToast(message, type) {
        type = type || 'success';
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.innerHTML = '<span class="toast-message">' + message + '</span>';
        container.appendChild(toast);

        // Auto-remove after 3 seconds
        setTimeout(function () {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(function () {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Convert a game day number to a calendar date string.
     * Day 1 = 1 January, Year 1.
     */
    function formatGameDate(dayNumber) {
        var MONTHS     = [31,28,31,30,31,30,31,31,30,31,30,31];
        var MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun',
                           'Jul','Aug','Sep','Oct','Nov','Dec'];
        var dayOfYear  = (dayNumber - 1) % 365;
        var year       = Math.floor((dayNumber - 1) / 365) + 1;
        var month = 0;
        var rem   = dayOfYear;
        while (month < 11 && rem >= MONTHS[month]) {
            rem -= MONTHS[month];
            month++;
        }
        return (rem + 1) + ' ' + MONTH_NAMES[month] + ' Y' + year;
    }

    /**
     * Calculate today's estimated income from active bookings.
     */
    function calcDailyIncome(state) {
        var income = 0;
        (state.anglerBookings || []).forEach(function (b) {
            if (state.day >= b.startDay && state.day <= b.endDay) {
                income += b.dailyRate;
            }
        });
        (state.ownedLakes || []).forEach(function (lakeId) {
            var lake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
            if (!lake) return;
            var anglersHere = (state.anglerBookings || []).filter(function (b) {
                return b.lakeId === lakeId && state.day >= b.startDay && state.day <= b.endDay;
            }).length;
            if (anglersHere > 0) {
                income += Math.round(lake.dailyIncomePerAngler * anglersHere * (lake.biodiversityScore / 10));
            }
        });
        return income;
    }

    /**
     * Format money in GBP.
     */
    function formatMoney(amount) {
        if (amount >= 1000000) {
            return '\u00A3' + (amount / 1000000).toFixed(2) + 'M';
        } else if (amount >= 10000) {
            return '\u00A3' + amount.toLocaleString('en-GB');
        }
        return '\u00A3' + amount.toLocaleString('en-GB');
    }

    /**
     * Format weight in lb and oz.
     */
    function formatWeight(totalOz) {
        var lb = Math.floor(totalOz / 16);
        var oz = Math.round(totalOz % 16);
        if (lb === 0) {
            return oz + ' oz';
        }
        if (oz === 0) {
            return lb + ' lb';
        }
        return lb + ' lb ' + oz + ' oz';
    }

    /**
     * Show a confirmation modal before resetting the game.
     */
    function confirmReset() {
        var html = '<h3 style=\"color:var(--colour-danger);margin-bottom:0.75rem;\">&#x26A0; Start a New Game?</h3>';
        html += '<p style=\"margin-bottom:1rem;color:var(--colour-text-muted);\">This will permanently delete your current save — all lakes, fish, staff, money, and progress will be lost.</p>';
        html += '<div style=\"display:flex;gap:0.75rem;justify-content:flex-end;">';
        html += '<button class=\"btn btn-secondary\" onclick=\"UI.hideModal()\">Cancel</button>';
        html += '<button class=\"btn btn-danger\" onclick=\"UI.doReset()\">Yes, reset everything</button>';
        html += '</div>';
        showModal(html);
    }

    function doLoad() {
        hideModal();
        if (typeof Game !== 'undefined') {
            var saved = Game.loadFromStorage ? Game.loadFromStorage() : null;
            if (saved) {
                Game.setState(saved);
            } else {
                Game.setState(JSON.parse(JSON.stringify(Game.DEFAULT_STATE)));
            }
            if (typeof Game.saveToStorage === 'function') Game.saveToStorage();
            if (typeof UI.renderDashboard === 'function') UI.renderDashboard();
            if (typeof UI.renderLakes === 'function') UI.renderLakes();
            UI.showToast('Game loaded.', 'success');
        }
    }

    /**
     * Execute the game reset and re-initialise the UI.
     */
    function doReset() {
        hideModal();
        Game.resetGame();
        if (typeof Staff !== 'undefined')   Staff.initState();
        if (typeof Finance !== 'undefined') Finance.initState();
        if (typeof Breeding !== 'undefined') Breeding.initState();
        if (typeof Anglers !== 'undefined')  Anglers.initState();
        currentTab = 'dashboard';
        document.querySelectorAll('.tab-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.tab === 'dashboard');
        });
        document.querySelectorAll('.panel').forEach(function (panel) {
            panel.classList.toggle('active', panel.id === 'panel-dashboard');
        });
        if (typeof Weather !== 'undefined') Weather.initWeather();
        renderAll();
        showToast('New game started!', 'success');
    }
    /**
     * Render the page-wide events strip below the nav.
     * Shows the last 6 significant game events.
     */
    function renderEventsStrip() {
        var strip = document.getElementById('events-strip');
        if (!strip) return;
        var state = Game.getState();
        var events = (state.eventLog || []).slice().reverse().slice(0, 6);
        if (!events.length) { strip.innerHTML = ''; strip.style.display = 'none'; return; }
        strip.style.display = 'flex';
        var TYPE_COLOURS = {
            fish_born:'#4a9c6d', disaster:'#c0392b', match:'#d4a843',
            quest:'#3498db', spawning:'#1abc9c', hire:'#9b59b6',
            loan:'#e67e22', purchase:'#8e44ad', breeding:'#4a9c6d'
        };
        strip.innerHTML = events.map(function (e) {
            var col = TYPE_COLOURS[e.type] || '#888';
            return '<div class="event-pill" style="border-color:' + col + '55;color:' + col + ';">' +
                   '<span class="event-pill-icon">' + e.icon + '</span>' +
                   '<span class="event-pill-msg">' + e.message + '</span>' +
                   '<span class="event-pill-day">D' + e.day + '</span>' +
                   '</div>';
        }).join('');
    }

    function renderAll() {
        renderTopBar();
        renderPanel(currentTab);
    }

    /**
     * Render the top bar statistics.
     */
    function renderTopBar() {
        const state = Game.getState();
        document.getElementById('day-counter').innerHTML =
            'Day: <strong>' + formatGameDate(state.day) + '</strong>';
        document.getElementById('money-display').innerHTML =
            'Money: <strong>' + formatMoney(state.money) + '</strong>';
        document.getElementById('reputation-display').innerHTML =
            'Reputation: <strong>' + state.reputation.toLocaleString('en-GB') + '</strong>/1,000';

        // Daily income estimate
        var incomeEl = document.getElementById('income-display');
        if (incomeEl) {
            var daily = calcDailyIncome(state);
            incomeEl.innerHTML = 'Today: <strong>' +
                (daily > 0 ? formatMoney(daily) : '\u00a30') + '</strong>';
        }
        var weatherEl = document.getElementById('weather-display');
        if (weatherEl && typeof Weather !== 'undefined') {
            var w    = Weather.getCurrentWeather();
            var wDef = Weather.getWeatherDef(w.current || 'cloudy');
            var sDef = Weather.getSeasonDef(w.season  || 'spring');
            var temp = (w.temperature !== undefined) ? w.temperature + '\u00b0C' : '';
            weatherEl.innerHTML =
                wDef.emoji + ' <strong>' + wDef.name + '</strong>' +
                ' &nbsp;&bull;&nbsp; ' +
                sDef.emoji + ' ' + sDef.name +
                (temp ? ' &nbsp;&bull;&nbsp; <strong>' + temp + '</strong>' : '');
        }
    }

    /**
     * Render a specific panel's content.
     */
    function renderPanel(tabName) {
        switch (tabName) {
            case 'dashboard':
                if (typeof Dashboard !== 'undefined') {
                    Dashboard.renderDashboard();
                } else {
                    renderDashboardFallback();
                }
                break;
            case 'lakes':
                Lakes.renderLakes();
                break;
            case 'buylakes':
                Lakes.renderBuyLakes();
                break;
            case 'breeding':
                if (typeof Breeding !== 'undefined') {
                    Breeding.renderBreedingPond();
                }
                break;
            case 'anglers':
                if (window.Anglers && typeof window.Anglers.render === 'function') {
                    window.Anglers.render();
                }
                break;
            case 'shop':
                if (typeof Shop !== 'undefined') Shop.renderShop();
                break;
            case 'news':
                if (typeof News !== 'undefined') News.renderNews();
                break;
            case 'cards':
                if (typeof Cards !== 'undefined') Cards.renderCards();
                break;
            case 'staff':
                if (typeof Staff !== 'undefined') {
                    Staff.renderStaff();
                }
                break;
            case 'finance':
                if (typeof Finance !== 'undefined') {
                    Finance.renderFinance();
                }
                break;
            default:
                break;
        }
    }

    /**
     * Render the dashboard panel (fallback if Dashboard module not loaded).
     */
    function renderDashboardFallback() {
        const state = Game.getState();

        // Update overview
        document.getElementById('overview-lakes').textContent = state.ownedLakes.length;
        var totalFish = state.fish.filter(function (f) { return f.alive; }).length;
        if (state.breedingPond) {
            totalFish += state.breedingPond.filter(function (f) { return f && f.alive; }).length;
        }
        document.getElementById('overview-fish').textContent = totalFish;
        document.getElementById('overview-anglers').textContent = state.anglers.length;

        // Render notifications
        const notifBoard = document.getElementById('notification-board');
        if (state.notifications.length === 0) {
            notifBoard.innerHTML = '<p class="empty-state">No notifications yet. Press "Next Day" to begin!</p>';
        } else {
            let html = '';
            var shown = state.notifications.slice(-25);
            for (var i = 0; i < shown.length; i++) {
                var notif = shown[i];
                html += '<div class="notif-entry notif-normal">';
                html += '<span class="notif-day">Day ' + notif.day + '</span>';
                html += '<span class="notif-message">' + notif.message + '</span>';
                html += '</div>';
            }
            notifBoard.innerHTML = html;
        }
    }

        return {
        init: init,
        switchTab: switchTab,
        showModal: showModal,
        hideModal: hideModal,
        showToast: showToast,
        formatMoney: formatMoney,
        formatWeight: formatWeight,
        formatGameDate: formatGameDate,
        renderAll: renderAll,
        renderTopBar: renderTopBar,
        toggleTimer: toggleTimer,
        toggleSpeed: toggleSpeed,
        confirmReset: confirmReset,
        doReset: doReset,
        doLoad: doLoad
    };
})();
