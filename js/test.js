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

    function render() {
        var html = '<p class="empty-state" style="margin-bottom:1rem;">One base card design.</p>';
        html += '<div class="test-card-grid">';
        html += topHeaderCardA2();
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
