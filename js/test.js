const Test = (function () {
    'use strict';

    function topHeaderCardA2() {
        return '<div class="test-card top-header-card th-ocean">' +
               '<div class="th-topbar"><span class="th-badge th-badge-epic">EPIC</span><span class="th-name">Mirror Monarch</span></div>' +
               '<div class="th-art"><img src="img/carp/koi-carp.png" class="th-fish-img th-img-lg" onerror="this.style.display=\'none\'" /></div>' +
               '<div class="th-body">' +
               '<div class="th-sub">Koi · 18lb 2oz · 5yr old</div>' +
               '<div class="th-line">Preferred bait: <strong>Corn, Dough</strong></div>' +
               '<div class="cf-traits"><span class="cf-trait cf-trait-pos">Golden Scale</span><span class="cf-trait cf-trait-neg">Wary</span></div>' +
               '<div class="th-actions"><button class="btn btn-primary btn-sm">Use</button><button class="btn btn-secondary btn-sm">Discard</button></div>' +
               '</div>' +
               '</div>';
    }

    function inlayCardB2() {
        return '<div class="test-card inlay-card inlay-metal">' +
               '<div class="inlay-frame inlay-frame-heavy">' +
               '<div class="inlay-window inlay-window-etched"><img src="img/carp/ghost-carp.png" class="inlay-img" onerror="this.style.display=\'none\'" /></div>' +
               '</div>' +
               '<div class="inlay-body">' +
               '<div class="inlay-title">Ghost Koi</div>' +
               '<div class="inlay-sub">Ghost Carp · 12lb 4oz · 3yr old</div>' +
               '<div class="inlay-line">Preferred bait: <strong>Boilies, Popups</strong></div>' +
               '<div class="cf-traits"><span class="cf-trait cf-trait-pos">Giant</span><span class="cf-trait cf-trait-neg">Shy</span></div>' +
               '<div class="inlay-actions"><button class="btn btn-primary btn-sm">Use</button><button class="btn btn-secondary btn-sm">Discard</button></div>' +
               '</div>' +
               '</div>';
    }

    function render() {
        var html = '<p class="empty-state" style="margin-bottom:1rem;">Two base card designs.</p>';
        html += '<div class="test-card-grid">';
        html += topHeaderCardA2();
        html += inlayCardB2();
        html += '</div>';
        return html;
    }

    function open() {
        var container = document.getElementById('test-content');
        if (!container) return;
        container.innerHTML = render();
    }

    return { render: render, open: open };
})();
