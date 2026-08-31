const DLC = (function () {
    'use strict';

    var PACKS = [
        {
            id: 'fish-pack-1',
            type: 'Fish Card Pack',
            title: 'Mystic Carp Collection',
            emoji: '🐟',
            image: 'img/dlc/fish-pack-1.png',
            bullets: [
                '5 new rare fish species',
                'Exclusive card backs',
                'Breeding trait bonuses'
            ]
        },
        {
            id: 'fish-pack-2',
            type: 'Fish Card Pack',
            title: 'Ghost Koi Expansion',
            emoji: '🐟',
            image: 'img/dlc/fish-pack-2.png',
            bullets: [
                '3 legendary fish variants',
                'New breeding combinations',
                'Unique skin patterns'
            ]
        },
        {
            id: 'fish-pack-3',
            type: 'Fish Card Pack',
            title: 'Tropical Invaders',
            emoji: '🐟',
            image: 'img/dlc/fish-pack-3.png',
            bullets: [
                '6 warm-water species',
                'Exclusive weather events',
                'New bait preferences'
            ]
        },
        {
            id: 'lake-pack-1',
            type: 'Lake Pack',
            title: 'Northern Meres',
            emoji: '🏞️',
            image: 'img/dlc/lake-pack-1.png',
            bullets: [
                '3 new northern lakes',
                'Cold-water fish species',
                'Winter weather mechanics',
                'Ice fishing events'
            ]
        },
        {
            id: 'lake-pack-2',
            type: 'Lake Pack',
            title: 'River Delta Network',
            emoji: '🏞️',
            image: 'img/dlc/lake-pack-2.png',
            bullets: [
                '4 connected river lakes',
                'Tidal fish patterns',
                'New substrate types',
                'Migration mechanics'
            ]
        },
        {
            id: 'lake-pack-3',
            type: 'Lake Pack',
            title: 'Alpine High Lakes',
            emoji: '🏞️',
            image: 'img/dlc/lake-pack-3.png',
            bullets: [
                '3 mountain lakes',
                'High-altitude species',
                'Reduced oxygen events',
                'Scenic lake art'
            ]
        },
        {
            id: 'angler-pack-1',
            type: 'Angler Pack',
            title: 'Pro Circuit',
            emoji: '🎣',
            image: 'img/dlc/angler-pack-1.png',
            bullets: [
                '5 professional anglers',
                'Championship booking types',
                'Sponsorship deals',
                'TV interview events'
            ]
        },
        {
            id: 'angler-pack-2',
            type: 'Angler Pack',
            title: 'Celebrity Guests',
            emoji: '🎣',
            image: 'img/dlc/angler-pack-2.png',
            bullets: [
                '3 celebrity anglers',
                'Special quest chains',
                'Exclusive rig setups',
                'Media buzz bonuses'
            ]
        },
        {
            id: 'angler-pack-3',
            type: 'Angler Pack',
            title: 'Local Legends',
            emoji: '🎣',
            image: 'img/dlc/angler-pack-3.png',
            bullets: [
                '6 regional experts',
                'Local knowledge traits',
                'Hidden lake unlocks',
                'Community events'
            ]
        }
    ];

    function card(pack) {
        var img = '<div class="dlc-thumb" style="background:rgba(255,255,255,0.05);border:1px dashed rgba(255,255,255,0.2);">' +
                  '<span style="font-size:2.4rem;">' + pack.emoji + '</span>' +
                  '<div style="font-size:0.7rem;color:var(--colour-text-muted);margin-top:0.3rem;">' + pack.id + '</div></div>';
        var bullets = pack.bullets.map(function(b){ return '<li>' + b + '</li>'; }).join('');
        return '<div class="dlc-card">' +
               img +
               '<div class="dlc-body">' +
               '<div class="dlc-type">' + pack.type + '</div>' +
               '<h3 class="dlc-title">' + pack.title + '</h3>' +
               '<ul class="dlc-bullets">' + bullets + '</ul>' +
               '<button class="btn btn-primary btn-sm" disabled>Unlocks with purchase</button>' +
               '</div></div>';
    }

    function render() {
        var html = '<p class="empty-state" style="margin-bottom:1rem;">Expand your fishery with official DLC packs. Each pack unlocks immediately after purchase.</p>';
        html += '<div class="dlc-grid">';
        PACKS.forEach(function(p){ html += card(p); });
        html += '</div>';
        return html;
    }

    function open() {
        var container = document.getElementById('dlc-content');
        if (!container) return;
        container.innerHTML = render();
    }

    return { render: render, open: open };
})();
