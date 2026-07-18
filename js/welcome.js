/* eslint-disable no-undef */
(function () {
    'use strict';

    var carouselIndex = 0;

    function _startGame() {
        if (typeof Game === 'undefined') {
            alert('Game system not ready yet.');
            return;
        }

        var saved = Game.loadFromStorage();
        if (saved) {
            Game.setState(saved);
            var st = Game.getState();
            if (!st.fish || st.fish.length === 0) {
                var initial = Game.DEFAULT_STATE._initialFish || null;
                if (initial) {
                    st.fish = initial.fish;
                    st.nextFishId = initial.nextFishId;
                    if (typeof Fish !== 'undefined' && typeof Fish.getFishValue === 'function') {
                        st.fish.forEach(function (f) { f.value = Fish.getFishValue(f); });
                    }
                }
            }
        } else {
            Game.setState(JSON.parse(JSON.stringify(Game.DEFAULT_STATE)));
            var initial = Game.DEFAULT_STATE._initialFish || null;
            if (initial) {
                var st2 = Game.getState();
                st2.fish = initial.fish;
                st2.nextFishId = initial.nextFishId;
                if (typeof Fish !== 'undefined' && typeof Fish.getFishValue === 'function') {
                    st2.fish.forEach(function (f) { f.value = Fish.getFishValue(f); });
                }
            }
        }
        var state = Game.getState();

        if (!state.ownedLakes || state.ownedLakes.indexOf('oakmere_lake') === -1) {
            if (typeof Lakes !== 'undefined' && typeof Lakes.addOwnedLake === 'function') {
                Lakes.addOwnedLake('oakmere_lake');
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

        if (typeof Dashboard !== 'undefined' && typeof Dashboard.renderDashboard === 'function') {
            Dashboard.renderDashboard();
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
            '<h4>Oakmere Lake</h4>' +
            '<p>A picturesque two-acre lake nestled amongst ancient oak trees. Your starting venue.</p>' +
            '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">' +
                '<span class="angler-stat-badge">Fish Capacity: 240</span>' +
                '<span class="angler-stat-badge">Still Water</span>' +
            '</div>' +
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

        var startBtn = document.getElementById('welcome-start-btn');
        if (startBtn) startBtn.onclick = function () {
            _startGame();
        };
    }

    function show() {
        var welcome = document.getElementById('welcome-screen');
        if (!welcome) return;
        welcome.style.display = 'block';
        carouselIndex = 0;
        _renderCarousel();
        _renderLakeCard();
        _bindEvents();
    }

    window.Welcome = {
        show: show,
        startGame: _startGame
    };
}());
