/* eslint-disable no-undef */
(function () {
    'use strict';

    var SLOT_KEYS = [
        'carp_tycoon_slot_1',
        'carp_tycoon_slot_2',
        'carp_tycoon_slot_3'
    ];

    var carouselIndex = 0;
    var selectedSlotIndex = 0;

    function _loadSlotIntoGame(index) {
        if (typeof Game === 'undefined') return;
        Game.setActiveSlotIndex(index);
        var saved = Game.loadFromStorage();
        if (saved) {
            Game.setState(saved);
        } else {
            Game.setState(JSON.parse(JSON.stringify(Game.DEFAULT_STATE)));
        }
    }

    function _slotOccupied(index) {
        try {
            return !!localStorage.getItem(SLOT_KEYS[index]);
        } catch (e) {
            return false;
        }
    }

    function _renderSlotButton(index) {
        var occupied = _slotOccupied(index);
        var isActive = (index === selectedSlotIndex);
        var cls = 'btn ' + (occupied ? 'btn-primary' : 'btn-secondary');
        if (isActive) cls += ' active-slot';
        return '<button class="' + cls + ' welcome-slot-btn" data-slot="' + index + '">' +
            'Slot ' + (index + 1) + '</button>';
    }

    function _renderSlots() {
        var container = document.getElementById('welcome-slots');
        if (!container) return;
        container.innerHTML = '';
        SLOT_KEYS.forEach(function (_, idx) {
            container.innerHTML += _renderSlotButton(idx);
        });
    }

    function _startGame() {
        if (typeof Game === 'undefined') {
            alert('Game system not ready yet.');
            return;
        }

        _loadSlotIntoGame(selectedSlotIndex);
        var state = Game.getState();

        if (!state.ownedLakes || state.ownedLakes.indexOf('willow_pool') === -1) {
            if (typeof Lakes !== 'undefined' && typeof Lakes.addOwnedLake === 'function') {
                Lakes.addOwnedLake('willow_pool');
            }
            state.day = 1;
        }

        var anglers = (typeof Anglers !== 'undefined' && typeof Anglers.getAllAnglers === 'function')
            ? Anglers.getAllAnglers()
            : [];
        if (anglers.length && carouselIndex >= 0 && carouselIndex < anglers.length) {
            state.playerAnglerId = anglers[carouselIndex].id;
        }

        if (typeof Game.saveToStorage === 'function') {
            Game.saveToStorage();
        }

        var welcome = document.getElementById('welcome-screen');
        if (welcome) welcome.style.display = 'none';

        if (typeof UI !== 'undefined' && typeof UI.renderDashboard === 'function') {
            UI.renderDashboard();
        }
        if (typeof Lakes !== 'undefined' && typeof Lakes.renderLakes === 'function') {
            Lakes.renderLakes();
        }

        UI.showToast('Welcome! Remember to hire staff before you start.', 'info');
    }

    function _renderCarousel() {
        var container = document.getElementById('welcome-angler-carousel');
        if (!container) return;
        var anglers = (typeof Anglers !== 'undefined' && typeof Anglers.getAllAnglers === 'function')
            ? Anglers.getAllAnglers()
            : [];
        if (!anglers.length) {
            container.innerHTML = '<p class="empty-state">No anglers available.</p>';
            return;
        }
        carouselIndex = Math.max(0, Math.min(carouselIndex, anglers.length - 1));
        var a = anglers[carouselIndex];
        container.innerHTML = '<div class="angler-card" style="width:380px;height:500px;box-sizing:content-box;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:visible;">' +
            '<div class="angler-name" style="color:#2563eb;margin-bottom:12px;">' + a.name + '</div>' +
            '<div class="angler-photo-slot" style="width:320px;height:320px;">' +
            (a.photo ? '<img src="' + a.photo + '" alt="' + a.name + '" class="angler-photo-img" style="width:100%;height:100%;object-fit:contain;"/>' :
                '<div class="angler-photo-placeholder">' + a.name.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2).toUpperCase() + '</div>') +
            '</div>' +
            '<div style="text-align:center;margin-top:12px;">' +
                '<div class="angler-stat-badge">Skill ' + a.skill + '/10</div>' +
                '<div class="angler-stat-badge" style="color:#f1c40f;margin-top:6px;">Social Media ' + (typeof a.socialMedia !== 'undefined' ? '' + a.socialMedia + '/10' : '—') + '</div>' +
            '</div>' +
            '</div>';
    }

    function _renderLakeCard() {
        var container = document.getElementById('welcome-lake-card');
        if (!container) return;
        container.innerHTML = '<div class="dashboard-card" style="display:inline-block;min-width:220px;text-align:center;">' +
            '<h4>Willow Pool</h4>' +
            '<p>A small, sheltered pool surrounded by willows. Your starting venue.</p>' +
            '<span class="angler-stat-badge">Fish Capacity: 70</span>' +
            '<span class="angler-stat-badge" style="margin-left:8px;">Still Water</span>' +
            '</div>';
    }

    function _bindEvents() {
        var prev = document.getElementById('angler-prev');
        var next = document.getElementById('angler-next');
        if (prev) prev.onclick = function () {
            carouselIndex--;
            _renderCarousel();
        };
        if (next) next.onclick = function () {
            carouselIndex++;
            _renderCarousel();
        };

        var slotsContainer = document.getElementById('welcome-slots');
        if (slotsContainer) {
            slotsContainer.onclick = function (e) {
                var btn = e.target.closest('.welcome-slot-btn');
                if (!btn) return;
                selectedSlotIndex = parseInt(btn.getAttribute('data-slot'), 10);
                _renderSlots();
            };
        }

        var startBtn = document.getElementById('welcome-start-btn');
        if (startBtn) startBtn.onclick = function () {
            _startGame();
        };
    }

    function show() {
        var welcome = document.getElementById('welcome-screen');
        if (!welcome) return;
        welcome.style.display = 'block';
        selectedSlotIndex = 0;
        carouselIndex = 0;
        _renderSlots();
        _renderCarousel();
        _renderLakeCard();
        _bindEvents();
    }

    window.Welcome = {
        show: show,
        startGame: _startGame
    };
}());
