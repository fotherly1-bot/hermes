/**
 * Anglers page
 */

'use strict';

if (!window.Anglers) window.Anglers = {};

(function () {
    var RAW_ANGLERS = [
        { id: 1,  name: 'Dave Hutchinson',  preferred: ['still', 'estate_lake'],     disliked: ['running'],   budget: 35, skill: 7,  socialMedia: 5 },
        { id: 2,  name: 'Steve Briggs',     preferred: ['gravel_pit','estate_lake'],disliked: ['still'],    budget: 50, skill: 9,  socialMedia: 8 },
        { id: 3,  name: 'Terry Hearn',      preferred: ['gravel_pit','estate_lake'],disliked: [],           budget: 60, skill: 10, socialMedia: 10 },
        { id: 4,  name: 'Ian Russell',      preferred: ['still','running'],         disliked: ['gravel_pit'],budget: 30, skill: 6,  socialMedia: 4 },
        { id: 5,  name: 'Danny Fairbrass',  preferred: ['gravel_pit'],              disliked: ['running'],   budget: 45, skill: 8,  socialMedia: 9 },
        { id: 6,  name: 'Ali Hamidi',       preferred: ['estate_lake','gravel_pit'],disliked: ['still'],    budget: 55, skill: 9,  socialMedia: 8, photo: 'img/anglers/ali-hamidi.png' },
        { id: 7,  name: 'Alan Blair',       preferred: ['running','still'],         disliked: ['estate_lake'],budget: 40, skill: 7,  socialMedia: 6 },
        { id: 8,  name: 'Mark Pitchers',    preferred: ['still'],                   disliked: ['gravel_pit'],budget: 25, skill: 5,  socialMedia: 3 },
        { id: 9,  name: 'Kev Hewitt',       preferred: ['running','gravel_pit'],    disliked: [],           budget: 35, skill: 6,  socialMedia: 5 },
        { id: 10, name: 'Rob Hughes',       preferred: ['estate_lake'],             disliked: ['running'],   budget: 50, skill: 8,  socialMedia: 7 },
        { id: 11, name: 'Simon Crow',       preferred: ['gravel_pit','still'],       disliked: [],           budget: 40, skill: 7,  socialMedia: 6 },
        { id: 12, name: 'Nigel Sharp',      preferred: ['estate_lake','gravel_pit'],  disliked: ['still'],    budget: 55, skill: 9,  socialMedia: 7 },
        { id: 13, name: 'Darrell Peck',     preferred: ['gravel_pit'],               disliked: ['running'],   budget: 45, skill: 8,  socialMedia: 8 },
        { id: 14, name: 'Tom Maker',        preferred: ['still','running'],          disliked: [],           budget: 30, skill: 5,  socialMedia: 3 },
        { id: 15, name: 'Harry Charrington',preferred: ['estate_lake'],              disliked: ['still'],    budget: 60, skill: 9,  socialMedia: 6 },
        { id: 16, name: 'Oz Holness',       preferred: ['gravel_pit','running'],     disliked: [],           budget: 40, skill: 7,  socialMedia: 9 },
        { id: 17, name: 'Martin Bowler',    preferred: ['running','still'],          disliked: ['estate_lake'],budget: 35, skill: 6,  socialMedia: 7 },
        { id: 18, name: 'Jim Shelley',      preferred: ['gravel_pit','estate_lake'],  disliked: [],           budget: 50, skill: 8,  socialMedia: 8 },
        { id: 19, name: 'Lee Jackson',      preferred: ['still','gravel_pit'],       disliked: ['running'],   budget: 30, skill: 5,  socialMedia: 4 },
        { id: 20, name: 'Adam Penning',     preferred: ['running'],                  disliked: ['estate_lake'],budget: 35, skill: 6,  socialMedia: 5 },
        { id: 21, name: 'Gary Bayes',       preferred: ['estate_lake','still'],       disliked: [],           budget: 45, skill: 7,  socialMedia: 4 },
        { id: 22, name: 'Ian Chillcott',    preferred: ['gravel_pit','estate_lake'],  disliked: ['running'],   budget: 50, skill: 8,  socialMedia: 7 },
        { id: 23, name: 'Keith Jenkins',    preferred: ['still'],                    disliked: ['gravel_pit'],budget: 25, skill: 4,  socialMedia: 3 },
        { id: 24, name: 'Paul Forward',     preferred: ['running','still'],           disliked: [],           budget: 30, skill: 5,  socialMedia: 4 },
        { id: 25, name: 'Jeffrey Curry',    preferred: ['gravel_pit','estate_lake'],  disliked: ['running'],   budget: 55, skill: 9,  socialMedia: 6 },
        { id: 26, name: 'Lee Warner',       preferred: ['still','gravel_pit'],        disliked: ['estate_lake'],budget: 40, skill: 7,  socialMedia: 7 },
        { id: 27, name: 'Ste Black',        preferred: ['running','gravel_pit'],      disliked: [],           budget: 45, skill: 8,  socialMedia: 8 }
    ];

    var MAX_DISPLAY = 28;
    var currentView = 'roster';

    function listValues(arr) {
        return Array.isArray(arr) && arr.length ? arr.join(', ') : 'None';
    }

    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        if (!attrs) return node;
        Object.keys(attrs).forEach(function (k) {
            if (k === 'className') node.className = attrs[k];
            else if (k === 'onclick') node.setAttribute('onclick', attrs[k]);
            else if (k === 'style') node.setAttribute('style', attrs[k]);
            else node.setAttribute(k, attrs[k]);
        });
        if (children) {
            (Array.isArray(children) ? children : [children]).forEach(function (c) {
                node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
            });
        }
        return node;
    }

    function cardFor(a) {
        var card = el('div', { className: 'anglers-card' }, [
            el('div', { className: 'anglers-card-header' }, [
                el('div', { className: 'anglers-card-name' }, [a.name])
            ]),
            a.photo
                ? el('img', { src: a.photo, alt: a.name, className: 'angler-photo-img', loading: 'lazy' })
                : el('div', { className: 'angler-photo-placeholder' }, [a.name.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2).toUpperCase()]),
            el('div', { className: 'angler-card-attrs' }, [
                el('div', { className: 'angler-card-meta' }, ['🎯 Skill ' + a.skill + ' / 💬 Social ' + a.socialMedia + ' / 💷 £' + a.budget + '/day']),
                el('div', { className: 'angler-card-prefs' }, [
                    el('span', { className: 'pref-label' }, ['❤️ Likes:']),
                    ' ' + listValues(a.preferred)
                ]),
                el('div', { className: 'angler-card-prefs' }, [
                    el('span', { className: 'pref-label' }, ['💔 Dislikes:']),
                    ' ' + listValues(a.disliked)
                ])
            ]),
            el('button', { className: 'btn btn-secondary', onclick: 'Anglers.showDetails(' + a.id + ')' }, ['View Details'])
        ]);
        return card;
    }

    function render() {
        var root = document.getElementById('anglers-content');
        if (!root) return;
        root.innerHTML = '';

        var tabs = el('div', { className: 'anglers-tabs' });
        var tabItems = [
            ['roster', '🎣 Anglers'],
            ['bookings', '📅 Bookings'],
            ['tournaments', '🏆 Tournaments'],
            ['sponsorships', '🤝 Sponsorships'],
            ['leaderboard', '📊 Leaderboard']
        ];
        tabItems.forEach(function (item, idx) {
            var tab = el('button', {
                className: 'tab-btn' + (idx === 0 ? ' active' : ''),
                'data-anglers-tab': item[0]
            }, [item[1]]);
            tab.onclick = function () {
                tabs.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
                tab.classList.add('active');
                renderPanel(tab.getAttribute('data-anglers-tab'));
            };
            tabs.appendChild(tab);
        });
        root.appendChild(tabs);

        var panelWrap = el('div', { className: 'anglers-page-view', id: 'anglers-roster' });
        var grid = el('div', { className: 'anglers-grid' });

        RAW_ANGLERS.slice(0, MAX_DISPLAY).forEach(function (a) {
            grid.appendChild(cardFor(a));
        });
        panelWrap.appendChild(grid);
        root.appendChild(panelWrap);

        function renderPanel(view) {
            var views = root.querySelectorAll('.anglers-page-view');
            views.forEach(function (v) { v.classList.add('hidden'); });
            var target = root.querySelector('#anglers-' + view);
            if (target) target.classList.remove('hidden');

            if (view !== 'roster') {
                var container = root.querySelector('#anglers-' + view);
                if (!container) {
                    container = el('div', { className: 'anglers-page-view hidden', id: 'anglers-' + view }, [
                        el('p', { className: 'empty-state' }, [view + ' coming soon...'])
                    ]);
                    root.appendChild(container);
                }
            }
        }
    }

    function htmlToElement(html) {
        var el = document.createElement('div');
        el.innerHTML = html.trim();
        return el.firstElementChild || el.firstChild;
    }

    function showDetails(anglerId) {
        var a = RAW_ANGLERS.find(function (x) { return x.id === anglerId; });
        if (!a) return;
        var body = '<h3>' + a.name + '</h3>';
        body += '<p>Skill: ' + a.skill + '</p>';
        body += '<p>Social: ' + a.socialMedia + '</p>';
        body += '<p>Budget: £' + a.budget + '</p>';
        body += '<p>Likes: ' + listValues(a.preferred) + '</p>';
        body += '<p>Dislikes: ' + listValues(a.disliked) + '</p>';
        if (typeof UI !== 'undefined' && typeof UI.showModal === 'function') {
            UI.showModal('Angler Details', body);
        } else {
            alert(body.replace(/<[^>]+>/g, ''));
        }
    }

    window.Anglers.render = render;
    window.Anglers.showDetails = showDetails;
})();
