const Test = (function () {
    'use strict';

    var CARDS = [
        { name: 'Common Crucian', rarity: 'common', fish: 'img/carp/common-carp.png', sub: 'Common Carp · 12lb · 3yr old', bait: 'Corn, Worms', traits: ['Slimy', 'Bottom Feeder'] },
        { name: 'Rare Mirror', rarity: 'rare', fish: 'img/carp/mirror-carp.png', sub: 'Mirror Carp · 22lb · 6yr old', bait: 'Boilies, Pellets', traits: ['Scaleless', 'Evasive'] },
        { name: 'Epic Leather', rarity: 'epic', fish: 'img/carp/leather-carp.png', sub: 'Leather Carp · 28lb · 8yr old', bait: 'Boilies, Popups', traits: ['Thick Hide', 'Heavy'] },
        { name: 'Legendary Koi', rarity: 'legendary', fish: 'img/carp/koi-carp.png', sub: 'Koi · 18lb 2oz · 5yr old', bait: 'Corn, Dough', traits: ['Golden Scale', 'Wary'] }
    ];

    var MYTHICS = [
        { name: 'Mythic Abyss', sub: 'Abyss Koi · 31lb 8oz · 12yr old', fish: 'img/carp/koi-carp.png', bait: 'Secret Popup', traits: ['Void Scale', 'Phantom Drift'] },
        { name: 'Mythic Aether', sub: 'Aether Koi · 29lb 1oz · 10yr old', fish: 'img/carp/koi-carp.png', bait: 'Luminous Pellet', traits: ['Prismatic Sheen', 'Static Field'] },
        { name: 'Mythic Ember', sub: 'Ember Koi · 33lb 4oz · 14yr old', fish: 'img/carp/koi-carp.png', bait: 'Chili Crust', traits: ['Magma Scale', 'Searing Wake'] },
        { name: 'Mythic Frost', sub: 'Frost Koi · 27lb 9oz · 11yr old', fish: 'img/carp/koi-carp.png', bait: 'Glacial Worm', traits: ['Ice Mirror', 'Frozen Trail'] }
    ];

    var RARITY_GRADIENT = {
        common: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.0))',
        rare: 'linear-gradient(180deg, rgba(51,136,255,0.25), rgba(51,136,255,0.05))',
        epic: 'linear-gradient(180deg, rgba(170,68,255,0.25), rgba(170,68,255,0.05))',
        legendary: 'linear-gradient(180deg, rgba(255,170,0,0.30), rgba(255,170,0,0.05))',
        mythic: 'linear-gradient(180deg, rgba(255,34,102,0.40), rgba(255,34,102,0.08))'
    };

    function cardFor(item) {
        var posTrait = item.traits[0] || '';
        var negTrait = item.traits[1] || '';
        var bg = RARITY_GRADIENT[item.rarity] || '';
        return '<div class="test-card top-header-card th-' + item.rarity + '">' +
               '<div class="th-topbar"><span class="th-badge th-badge-' + item.rarity + '">' + item.rarity.toUpperCase() + '</span><span class="th-name">' + item.name + '</span></div>' +
               '<div class="th-art" style="background:' + bg + '"><img src="' + item.fish + '" class="th-fish-img th-img-lg" onerror="this.style.display=\'none\'" /></div>' +
               '<div class="th-body">' +
               '<div class="th-sub">' + item.sub + '</div>' +
               '<div class="th-line">Preferred bait: <strong>' + item.bait + '</strong></div>' +
               '<div class="cf-traits"><span class="cf-trait cf-trait-pos">' + posTrait + '</span>' + (negTrait ? '<span class="cf-trait cf-trait-neg">' + negTrait + '</span>' : '') + '</div>' +
               '<div class="th-actions"><button class="btn btn-primary btn-sm">Use</button><button class="btn btn-secondary btn-sm">Discard</button></div>' +
               '</div>' +
               '</div>';
    }

    function render() {
        var html = '<p class="empty-state" style="margin-bottom:0.6rem;">One card per rarity, 4-across row.</p>';
        html += '<div class="test-card-grid test-card-grid-4">';
        CARDS.forEach(function(item) {
            html += cardFor(item);
        });
        html += '</div>';

        html += '<p class="empty-state" style="margin:1.2rem 0 0.6rem;">Mythic variations.</p>';
        html += '<div class="test-card-grid test-card-grid-4">';
        MYTHICS.forEach(function(item) {
            html += cardFor(item);
        });
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
