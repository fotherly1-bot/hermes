/**
 * Carp Fishing Tycoon - Shop System
 * Lake upgrades and breeding stock purchases.
 */

'use strict';

const Shop = (function () {
    /**
     * Lake upgrade definitions.
     */
    var UPGRADES = [
        {
            id: 'aerator',
            name: 'Aerator',
            description: 'Increases oxygen levels, boosting biodiversity score by 1.',
            cost: 5000,
            effect: { biodiversityBonus: 1 },
            icon: '&#x1f4a8;'
        },
        {
            id: 'fish_shelters',
            name: 'Fish Shelters',
            description: 'Provides hiding spots for fish, increasing fish health and lifespan.',
            cost: 8000,
            effect: { healthBonus: 10 },
            icon: '&#x1f3e0;'
        },
        {
            id: 'feeding_station',
            name: 'Feeding Station',
            description: 'Automated feeding improves fish growth rate across the lake.',
            cost: 12000,
            effect: { growthBonus: 0.2 },
            icon: '&#x1f35e;'
        },
        {
            id: 'swim_platforms',
            name: 'Swim Platforms',
            description: 'Wooden platforms for anglers, increasing angler satisfaction and daily income.',
            cost: 15000,
            effect: { incomeBonus: 20 },
            icon: '&#x1fa9c;'
        },
        {
            id: 'island_feature',
            name: 'Island Feature',
            description: 'A scenic island that increases the lake value and reputation gain.',
            cost: 50000,
            effect: { reputationBonus: 1, valueBonus: 100000 },
            icon: '&#x1f3dd;'
        },
        {
            id: 'security_camera',
            name: 'Security Camera',
            description: 'Reduces chance of disasters affecting this lake by 50%.',
            cost: 20000,
            effect: { disasterReduction: 0.5 },
            icon: '&#x1f4f7;'
        }
    ];

    /**
     * Breeding stock fish for purchase.
     * Each entry has an age range [min, max] (days) which determines
     * growth stage and breedability. Prices reflect the size.
     *
     * Stages:  Fry 0-30 | Juvenile 31-120 | Adult 121+ (breedable)
     */
    var STOCK_FISH = [
        // ── Common Carp ──────────────────────────────────────────────────
        { species: 'common',  rarity: 'common',    size: 'fingerling', ageRange: [5,  25],  cost: 150,   label: 'Common Carp' },
        { species: 'common',  rarity: 'common',    size: 'yearling',   ageRange: [90, 120], cost: 300,   label: 'Common Carp' },
        { species: 'common',  rarity: 'common',    size: 'adult',      ageRange: [150,300], cost: 500,   label: 'Common Carp' },
        // ── Mirror Carp ──────────────────────────────────────────────────
        { species: 'mirror',  rarity: 'common',    size: 'fingerling', ageRange: [5,  25],  cost: 200,   label: 'Mirror Carp' },
        { species: 'mirror',  rarity: 'common',    size: 'yearling',   ageRange: [90, 120], cost: 450,   label: 'Mirror Carp' },
        { species: 'mirror',  rarity: 'common',    size: 'adult',      ageRange: [150,300], cost: 750,   label: 'Mirror Carp' },
        // ── Crucian Carp ─────────────────────────────────────────────────
        { species: 'crucian', rarity: 'common',    size: 'fingerling', ageRange: [5,  25],  cost: 125,   label: 'Crucian Carp' },
        { species: 'crucian', rarity: 'common',    size: 'adult',      ageRange: [150,300], cost: 600,   label: 'Crucian Carp' },
        // ── Grass Carp ───────────────────────────────────────────────────
        { species: 'grass',   rarity: 'uncommon',  size: 'yearling',   ageRange: [90, 120], cost: 1000,  label: 'Grass Carp' },
        { species: 'grass',   rarity: 'uncommon',  size: 'adult',      ageRange: [150,300], cost: 2000,  label: 'Grass Carp' },
        // ── Ghost Carp ───────────────────────────────────────────────────
        { species: 'ghost',   rarity: 'uncommon',  size: 'fingerling', ageRange: [5,  25],  cost: 700,   label: 'Ghost Carp' },
        { species: 'ghost',   rarity: 'uncommon',  size: 'adult',      ageRange: [150,300], cost: 2500,  label: 'Ghost Carp' },
        // ── Koi Carp ─────────────────────────────────────────────────────
        { species: 'koi',     rarity: 'rare',      size: 'fingerling', ageRange: [5,  25],  cost: 1500,  label: 'Koi Carp' },
        { species: 'koi',     rarity: 'rare',      size: 'yearling',   ageRange: [90, 120], cost: 3000,  label: 'Koi Carp' },
        { species: 'koi',     rarity: 'rare',      size: 'adult',      ageRange: [150,300], cost: 5000,  label: 'Koi Carp' },
        // ── Leather Carp ─────────────────────────────────────────────────
        { species: 'leather', rarity: 'rare',      size: 'yearling',   ageRange: [90, 120], cost: 3500,  label: 'Leather Carp' },
        { species: 'leather', rarity: 'rare',      size: 'adult',      ageRange: [150,300], cost: 7500,  label: 'Leather Carp' },
        // ── Epic ─────────────────────────────────────────────────────────
        { species: 'mirror',  rarity: 'epic',      size: 'adult',      ageRange: [150,300], cost: 20000, label: 'Prize Mirror Carp' },
        { species: 'common',  rarity: 'epic',      size: 'adult',      ageRange: [150,300], cost: 18000, label: 'Champion Common Carp' },
        // ── Legendary ────────────────────────────────────────────────────
        { species: 'koi',     rarity: 'legendary', size: 'adult',      ageRange: [150,300], cost: 50000, label: 'Legendary Koi Carp' }
    ];

    // Size display metadata
    var SIZE_META = {
        fingerling: { label: 'Fingerling', emoji: '\uD83D\uDFE4', colour: '#cd7f32', hint: 'Fry stage \u2014 needs ~100 days to reach breeding age.' },
        yearling:   { label: 'Yearling',   emoji: '\uD83D\uDFE1', colour: '#d4a843', hint: 'Juvenile stage \u2014 needs ~30 days to reach breeding age.' },
        adult:      { label: 'Adult',       emoji: '\uD83D\uDFE2', colour: '#4a9c6d', hint: 'Adult stage \u2014 ready to breed immediately.' }
    };

    /**
     * Initialise upgrade tracking in state.
     */
    function initState() {
        var state = Game.getState();
        if (!state.lakeUpgrades) {
            state.lakeUpgrades = {};
        }
    }

    /** Currently selected lake in the shop UI (module-level, not persisted). */
    var _shopLakeId = null;
    var _shopView   = 'buy'; // 'buy' | 'sell'

    /** Switch between Buy and Sell views. */
    function showShopView(view) {
        _shopView = view;
        renderShop();
    }

    /**
     * Set the shop's active lake and re-render.
     * Called by the in-page dropdown via onclick.
     */
    function setShopLake(lakeId) {
        _shopLakeId = lakeId || null;
        renderShop();
    }

    /**
     * Return the lake the shop is currently targeting.
     * Falls back to activeLakeId then first owned lake.
     */
    function getShopLakeId() {
        var state = Game.getState();
        if (_shopLakeId && state.ownedLakes.includes(_shopLakeId)) return _shopLakeId;
        if (state.activeLakeId && state.ownedLakes.includes(state.activeLakeId)) {
            _shopLakeId = state.activeLakeId;
            return _shopLakeId;
        }
        if (state.ownedLakes.length > 0) {
            _shopLakeId = state.ownedLakes[0];
            return _shopLakeId;
        }
        return null;
    }

    /**
     * Render the lake picker dropdown shared by both shop sections.
     */
    function renderLakePicker() {
        var state      = Game.getState();
        var currentId  = getShopLakeId();

        if (state.ownedLakes.length === 0) {
            return '<div class="shop-lake-picker"><p class="empty-state">You don\'t own any lakes yet. Buy one from the Lakes tab first.</p></div>';
        }

        var html = '<div class="shop-lake-picker">';
        html += '<label class="shop-lake-picker-label" for="shop-lake-select">\uD83C\uDFDE\uFE0F Applying to:</label>';
        html += '<select id="shop-lake-select" class="shop-lake-select" onchange="Shop.setShopLake(this.value)">';
        state.ownedLakes.forEach(function (lakeId) {
            var lake = Lakes.getLakeById(lakeId);
            if (!lake) return;
            var upgCount  = (state.lakeUpgrades && state.lakeUpgrades[lakeId]) ? state.lakeUpgrades[lakeId].length : 0;
            var fishCount = state.fish.filter(function (f) { return f.alive && f.lake_id === lakeId; }).length;
            var label     = lake.name + ' \u2014 ' + upgCount + '/6 upgrades \u00B7 ' + fishCount + ' fish';
            html += '<option value="' + lakeId + '"' + (lakeId === currentId ? ' selected' : '') + '>' + label + '</option>';
        });
        html += '</select>';
        html += '</div>';
        return html;
    }

    /**
     * Check if a lake already has a specific upgrade.
     */
    function lakeHasUpgrade(lakeId, upgradeId) {
        var state = Game.getState();
        if (!state.lakeUpgrades || !state.lakeUpgrades[lakeId]) {
            return false;
        }
        return state.lakeUpgrades[lakeId].indexOf(upgradeId) !== -1;
    }

    /**
     * Purchase and apply an upgrade to the shop-selected lake.
     */
    function buyUpgrade(upgradeId) {
        initState();
        var state  = Game.getState();
        var lakeId = getShopLakeId();

        if (!lakeId) {
            UI.showToast('Select a lake first.', 'warning');
            return false;
        }

        var upgrade = UPGRADES.find(function (u) { return u.id === upgradeId; });
        if (!upgrade) { UI.showToast('Upgrade not found.', 'error'); return false; }

        if (lakeHasUpgrade(lakeId, upgradeId)) {
            UI.showToast((Lakes.getLakeById(lakeId) || {}).name + ' already has ' + upgrade.name + '.', 'warning');
            return false;
        }

        if (!Game.spendMoney(upgrade.cost)) {
            UI.showToast('Not enough money! You need ' + UI.formatMoney(upgrade.cost) + '.', 'error');
            return false;
        }

        if (!state.lakeUpgrades[lakeId]) state.lakeUpgrades[lakeId] = [];
        state.lakeUpgrades[lakeId].push(upgradeId);

        if (typeof Finance !== 'undefined') {
            Finance.addFinanceLog('shop_purchase', -upgrade.cost, upgrade.name + ' upgrade');
        }

        var lake = Lakes.getLakeById(lakeId);
        UI.showToast(upgrade.name + ' installed at ' + (lake ? lake.name : 'your lake') + '!', 'success');
        if (typeof News !== 'undefined') News.addUpgradeStory(upgrade.name, lakeId);
        Game.saveToStorage();
        renderShop();
        UI.renderTopBar();
        return true;
    }

    /**
     * Purchase a stock fish and assign it to the shop-selected lake.
     */
    function buyStockFish(index) {
        var state     = Game.getState();
        var stockItem = STOCK_FISH[index];
        var lakeId    = getShopLakeId();

        if (!stockItem) { UI.showToast('Fish not found.', 'error'); return false; }

        if (!lakeId) {
            UI.showToast('Select a lake first.', 'warning');
            return false;
        }

        if (state.money < stockItem.cost) {
            UI.showToast('Not enough money! You need ' + UI.formatMoney(stockItem.cost) + '.', 'error');
            return false;
        }

        var lake = Lakes.getLakeById(lakeId);
        if (lake) {
            var currentStock = state.fish.filter(function (f) { return f.alive && f.lake_id === lakeId; }).length;
            var capPenalty   = (state.capacityPenalties && state.capacityPenalties[lakeId])
                ? (state.capacityPenalties[lakeId].amount || 0) : 0;
            var effectiveCap = lake.capacity - capPenalty;
            if (currentStock >= effectiveCap) {
                UI.showToast(lake.name + ' is at full capacity (' + effectiveCap + ' fish).', 'warning');
                return false;
            }
        }

        if (!Game.spendMoney(stockItem.cost)) { return false; }

        if (typeof Finance !== 'undefined') {
            Finance.addFinanceLog('shop_purchase', -stockItem.cost, 'Stocked fish: ' + stockItem.label + ' (' + stockItem.size + ')');
        }

        // Resolve age from the size variant's range
        var ageMin = stockItem.ageRange[0];
        var ageMax = stockItem.ageRange[1];
        var age    = ageMin + Math.floor(Math.random() * (ageMax - ageMin + 1));

        var fish = Fish.createFish({
            species:  stockItem.species,
            rarity:   stockItem.rarity,
            age_days: age,
            lake_id:  lakeId
        });
        state.fish.push(fish);
        if (typeof Game.logFishCreation === 'function') {
            Game.logFishCreation(fish, 'shop', null);
        }
        Game.addEvent('fish_born', '\uD83D\uDED2', stockItem.label + ' purchased and stocked.');
        if (typeof News !== 'undefined') News.addStockingStory(stockItem.label, stockItem.rarity, lakeId);

        var sizeMeta = SIZE_META[stockItem.size] || {};
        UI.showToast(
            sizeMeta.emoji + ' ' + fish.name + ' (' + stockItem.label + ', ' + (sizeMeta.label || stockItem.size) + ') \u2192 ' +
            (lake ? lake.name : 'your lake') + '!',
            'success'
        );
        Game.saveToStorage();
        renderShop();
        UI.renderTopBar();
        return true;
    }

    /**
     * Get the growth bonus for a specific lake from its upgrades.
     */
    function getLakeGrowthBonus(lakeId) {
        var state = Game.getState();
        var bonus = 0;
        if (state.lakeUpgrades && state.lakeUpgrades[lakeId]) {
            state.lakeUpgrades[lakeId].forEach(function (upId) {
                var up = UPGRADES.find(function (u) { return u.id === upId; });
                if (up && up.effect.growthBonus) {
                    bonus += up.effect.growthBonus;
                }
            });
        }
        return bonus;
    }

    /**
     * Get the income bonus for a specific lake from its upgrades.
     */
    function getLakeIncomeBonus(lakeId) {
        var state = Game.getState();
        var bonus = 0;
        if (state.lakeUpgrades && state.lakeUpgrades[lakeId]) {
            state.lakeUpgrades[lakeId].forEach(function (upId) {
                var up = UPGRADES.find(function (u) { return u.id === upId; });
                if (up && up.effect.incomeBonus) {
                    bonus += up.effect.incomeBonus;
                }
            });
        }
        return bonus;
    }

    /**
     * Get the health bonus for a specific lake from its upgrades.
     */
    function getLakeHealthBonus(lakeId) {
        var state = Game.getState();
        var bonus = 0;
        if (state.lakeUpgrades && state.lakeUpgrades[lakeId]) {
            state.lakeUpgrades[lakeId].forEach(function (upId) {
                var up = UPGRADES.find(function (u) { return u.id === upId; });
                if (up && up.effect.healthBonus) {
                    bonus += up.effect.healthBonus;
                }
            });
        }
        return bonus;
    }

    /**
     * Render the shop panel — Buy / Sell tabbed.
     */
    function renderShop() {
        initState();
        var state     = Game.getState();
        var container = document.getElementById('panel-shop');
        var lakeId    = getShopLakeId();

        var html = '<h2>Shop</h2>';

        // ── Tab switcher ─────────────────────────────────────────────────────
        html += '<div class="shop-tabs">';
        html += '<button class="shop-tab' + (_shopView === 'buy' ? ' shop-tab-active' : '') +
                '" onclick="Shop.showShopView(\'buy\')">\uD83D\uDED2 Buy</button>';
        html += '<button class="shop-tab' + (_shopView === 'sell' ? ' shop-tab-active' : '') +
                '" onclick="Shop.showShopView(\'sell\')">\uD83D\uDCB8 Sell Fish</button>';
        html += '</div>';

        if (_shopView === 'sell') {
            html += renderSellTab(state);
            container.innerHTML = html;
            return;
        }

        // ── Card Packs (top of buy tab) ──────────────────────────────────────
        if (typeof Cards !== 'undefined') {
            html += Cards.renderCardShopSection();
        }

        // ── Lake picker (Buy tab) ────────────────────────────────────────────
        html += renderLakePicker();

        if (!lakeId) {
            container.innerHTML = html;
            return;
        }

        var lake = lakeId ? Lakes.getLakeById(lakeId) : null;

        // ── Breeding Stock (categorised) ─────────────────────────────────────
        html += '<h3 class="section-heading">Breeding Stock</h3>';
        html += '<p class="shop-subtitle">Purchasing fish to: <strong>' + (lake ? lake.name : lakeId) + '</strong></p>';

        var currentStock = state.fish.filter(function (f) { return f.alive && f.lake_id === lakeId; }).length;
        var capPenalty   = (state.capacityPenalties && state.capacityPenalties[lakeId]) ? (state.capacityPenalties[lakeId].amount || 0) : 0;
        var effectiveCap = lake ? (lake.capacity - capPenalty) : 0;
        var spaceLeft    = Math.max(0, effectiveCap - currentStock);

        html += '<p class="shop-capacity-info">';
        html += '\uD83D\uDC1F Capacity: <strong>' + currentStock + ' / ' + effectiveCap + '</strong> &nbsp;&mdash;&nbsp; ';
        html += '<span style="color:' + (spaceLeft > 0 ? 'var(--colour-accent)' : 'var(--colour-danger)') + ';">' +
                    (spaceLeft > 0 ? spaceLeft + ' slots available' : 'Full \u2014 no room for new fish') + '</span>';
        html += '</p>';

        var CATEGORY_ORDER = ['common','crucian','mirror','leather','grass','ghost','koi'];
        var CATEGORY_META  = {
            common:  { label: 'Common Carp',  colour: '#8B7355', desc: 'The classic carp. Hardy and easy to breed.' },
            crucian: { label: 'Crucian Carp', colour: '#DAA520', desc: 'Small but spirited. Adds variety to any lake.' },
            mirror:  { label: 'Mirror Carp',  colour: '#B8860B', desc: 'Distinctively scaled. Highly prized by anglers.' },
            leather: { label: 'Leather Carp', colour: '#6B4226', desc: 'Rare scaleless variant. Sought-after specimen.' },
            grass:   { label: 'Grass Carp',   colour: '#556B2F', desc: 'Fast-growing and great for weed control.' },
            ghost:   { label: 'Ghost Carp',   colour: '#C0C0C0', desc: 'Pale and elusive. Mysterious lake presence.' },
            koi:     { label: 'Koi Carp',     colour: '#FF6347', desc: 'Ornamental carp. Premium price, premium value.' }
        };
        var BREED_ODDS = {
            common:    [{ r:'uncommon',  c:'#2ecc71', pct:22 }, { r:'rare',      c:'#3498db', pct:7  }, { r:'epic',      c:'#9b59b6', pct:1   }],
            uncommon:  [{ r:'rare',      c:'#3498db', pct:14 }, { r:'epic',      c:'#9b59b6', pct:4  }, { r:'legendary', c:'#f1c40f', pct:0.5 }],
            rare:      [{ r:'rare',      c:'#3498db', pct:28 }, { r:'epic',      c:'#9b59b6', pct:10 }, { r:'legendary', c:'#f1c40f', pct:2   }],
            epic:      [{ r:'epic',      c:'#9b59b6', pct:25 }, { r:'legendary', c:'#f1c40f', pct:5  }],
            legendary: [{ r:'epic',      c:'#9b59b6', pct:35 }, { r:'legendary', c:'#f1c40f', pct:15 }]
        };
        var rarityOrder = ['legendary','epic','rare','uncommon','common'];

        CATEGORY_ORDER.forEach(function (species) {
            var catMeta   = CATEGORY_META[species];
            var fishInCat = STOCK_FISH.filter(function (f) { return f.species === species; });
            if (!fishInCat.length) return;
            var topRarity = 'common';
            fishInCat.forEach(function (f) { if (rarityOrder.indexOf(f.rarity) < rarityOrder.indexOf(topRarity)) topRarity = f.rarity; });
            var topRarDef = Fish.getRarity ? Fish.getRarity(topRarity) : { colour: '#aaa', name: topRarity };

            html += '<div class="st-category">';
            html += '<div class="st-category-header" style="border-left:4px solid ' + catMeta.colour + ';">';
            html += '<div><span class="st-category-name">' + catMeta.label + '</span>';
            html += '<span class="st-category-desc">' + catMeta.desc + '</span></div>';
            html += '<span class="shop-card-rarity" style="background:' + topRarDef.colour + ';color:' + (topRarity === 'common' ? '#333' : '#fff') + ';">up to ' + topRarDef.name + '</span>';
            html += '</div>';
            html += '<div class="st-category-cards">';
            fishInCat.forEach(function (item) {
                var gIdx     = STOCK_FISH.indexOf(item);
                var rarDef   = Fish.getRarity(item.rarity);
                var sizeMeta = SIZE_META[item.size] || { label: item.size, emoji: '', colour: '#888', hint: '' };
                var full     = spaceLeft <= 0;
                var afford   = state.money >= item.cost;
                html += '<div class="st-stock-card' + (full || !afford ? ' shop-card-disabled' : '') + '">';
                html += '<div class="st-stock-badges">';
                html += '<span class="shop-size-badge" style="background:' + sizeMeta.colour + '22;color:' + sizeMeta.colour + ';border:1px solid ' + sizeMeta.colour + '55;">' + sizeMeta.emoji + ' ' + sizeMeta.label + '</span>';
                html += '<span class="shop-card-rarity" style="background:' + rarDef.colour + ';color:' + (item.rarity === 'common' ? '#333' : '#fff') + ';">' + rarDef.name + '</span>';
                html += '</div>';
                html += '<p class="st-stock-hint">' + sizeMeta.hint + '</p>';
                var odds = BREED_ODDS[item.rarity] || [];
                if (odds.length) {
                    html += '<div class="st-stock-odds">';
                    odds.forEach(function(o){ html += '<span class="st-stock-odd" style="color:' + o.c + ';">' + o.r.charAt(0).toUpperCase() + o.r.slice(1) + ' ' + o.pct + '%</span>'; });
                    html += '</div>';
                }
                html += '<div class="st-stock-footer">';
                html += '<span class="shop-card-cost">' + UI.formatMoney(item.cost) + '</span>';
                if (full) {
                    html += '<button class="btn btn-secondary btn-sm" disabled>Full</button>';
                } else if (!afford) {
                    html += '<button class="btn btn-secondary btn-sm" disabled>Can\'t afford</button>';
                } else {
                    html += '<button class="btn btn-primary btn-sm" onclick="Shop.buyStockFish(' + gIdx + ')">Buy</button>';
                }
                html += '</div></div>';
            });
            html += '</div></div>';
        });

        container.innerHTML = html;
    }

    /** Sell a fish immediately for its calculated value. */
    function sellFish(fishId) {
        var state = Game.getState();
        var idx   = state.fish.findIndex(function (f) { return f.id === fishId; });
        if (idx === -1) { UI.showToast('Fish not found.', 'error'); return; }
        var fish  = state.fish[idx];
        if (!fish.alive) { UI.showToast('Cannot sell a deceased fish.', 'error'); return; }

        var price = typeof Fish !== 'undefined' ? Fish.getFishValue(fish) : 0;
        state.fish.splice(idx, 1);
        state.money         += price;
        state.totalEarnings += price;

        if (typeof Finance !== 'undefined') {
            Finance.addFinanceLog('fish_sale', price, 'Sold ' + fish.name + ' (' + fish.speciesName + ')');
        }
        Game.addNotification('\uD83D\uDCB8 Sold ' + fish.name + ' for ' + UI.formatMoney(price) + '.');
        UI.showToast(fish.name + ' sold for ' + UI.formatMoney(price) + '!', 'success');
        Game.saveToStorage();
        renderShop();
        UI.renderTopBar();
    }

    /** List a fish for auction at a premium. Resolves after 3 days. */
    function auctionFish(fishId) {
        var state = Game.getState();
        var idx   = state.fish.findIndex(function (f) { return f.id === fishId; });
        if (idx === -1) { UI.showToast('Fish not found.', 'error'); return; }
        var fish  = state.fish[idx];
        if (!fish.alive) { UI.showToast('Cannot auction a deceased fish.', 'error'); return; }

        var RARITY_MULT = { common: 1.20, uncommon: 1.30, rare: 1.45, epic: 1.60, legendary: 1.80 };
        var baseVal  = typeof Fish !== 'undefined' ? Fish.getFishValue(fish) : 0;
        var askPrice = Math.round(baseVal * (RARITY_MULT[fish.rarity] || 1.25));

        if (!state.fishAuctions) state.fishAuctions = [];
        state.fishAuctions.push({
            fishId:      fish.id,
            fishName:    fish.name,
            fishSpecies: fish.speciesName,
            fishRarity:  fish.rarity,
            fishWeightOz:fish.weight_oz,
            baseValue:   baseVal,
            askingPrice: askPrice,
            startDay:    state.day,
            endDay:      state.day + 3
        });

        // Remove from main fish pool while auctioned
        state.fish.splice(idx, 1);
        Game.addNotification('\uD83C\uDFC6 ' + fish.name + ' listed for auction at ' + UI.formatMoney(askPrice) + '. Resolves in 3 days.');
        UI.showToast(fish.name + ' listed at ' + UI.formatMoney(askPrice) + '!', 'success');
        Game.saveToStorage();
        renderShop();
    }

    /** Cancel an active auction and return the fish to stock. */
    function cancelAuction(fishId) {
        var state = Game.getState();
        if (!state.fishAuctions) return;
        var aIdx = state.fishAuctions.findIndex(function (a) { return a.fishId === fishId; });
        if (aIdx === -1) return;
        var auction = state.fishAuctions.splice(aIdx, 1)[0];

        // Recreate a minimal fish stub and return it (best-effort)
        if (typeof Fish !== 'undefined') {
            var stub = Fish.createFish({
                species:   'common',
                rarity:    auction.fishRarity,
                age_days:  200,
                weight_oz: auction.fishWeightOz,
                lake_id:   state.activeLakeId || (state.ownedLakes[0] || null)
            });
            stub.id   = auction.fishId;
            stub.name = auction.fishName;
            state.fish.push(stub);
        }
        UI.showToast(auction.fishName + ' auction cancelled.', 'warning');
        Game.saveToStorage();
        renderShop();
    }

    /** Called from Game.nextDay() — resolves any auctions that have ended. */
    function processDailyAuctions() {
        var state = Game.getState();
        if (!state.fishAuctions || state.fishAuctions.length === 0) return;

        var toSettle = state.fishAuctions.filter(function (a) { return a.endDay <= state.day; });
        state.fishAuctions = state.fishAuctions.filter(function (a) { return a.endDay > state.day; });

        toSettle.forEach(function (auction) {
            state.money         += auction.askingPrice;
            state.totalEarnings += auction.askingPrice;
            if (typeof Finance !== 'undefined') {
                Finance.addFinanceLog('fish_sale', auction.askingPrice,
                    'Auction settled: ' + auction.fishName + ' (' + auction.fishSpecies + ')');
            }
            Game.addNotification('\uD83C\uDFC6 Auction settled! ' + auction.fishName +
                ' sold for ' + UI.formatMoney(auction.askingPrice) + '.');
            UI.showToast('Auction: ' + auction.fishName + ' sold for ' + UI.formatMoney(auction.askingPrice) + '!', 'success');
        });

        if (toSettle.length > 0) Game.saveToStorage();
    }

    /** Render the Sell Fish tab. */
    function renderSellTab(state) {
        var RARITY_COLS = { common:'#aaa', uncommon:'#2ecc71', rare:'#3498db', epic:'#9b59b6', legendary:'#f1c40f', mythic:'#e74c3c' };
        var RARITY_MULT = { common: 1.20, uncommon: 1.30, rare: 1.45, epic: 1.60, legendary: 1.80, mythic: 2.20 };

        var html = '';

        // Active auctions
        var auctions = state.fishAuctions || [];
        if (auctions.length > 0) {
            html += '<h3 class="section-heading">\uD83C\uDFC6 Active Auctions</h3>';
            html += '<div class="sell-auction-list">';
            auctions.forEach(function (a) {
                var col      = RARITY_COLS[a.fishRarity] || '#888';
                var daysLeft = Math.max(0, a.endDay - state.day);
                html += '<div class="sell-auction-row">';
                html += '<span class="sell-auction-name">' + a.fishName + '</span>';
                html += '<span class="sell-auction-species">' + a.fishSpecies + '</span>';
                html += '<span class="sell-auction-rarity" style="color:' + col + ';">' + (a.fishRarity || '') + '</span>';
                html += '<span class="sell-auction-price">' + UI.formatMoney(a.askingPrice) + '</span>';
                html += '<span class="sell-auction-days">' + daysLeft + 'd left</span>';
                html += '<button class="btn btn-danger btn-sm" onclick="Shop.cancelAuction(' + a.fishId + ')">Cancel</button>';
                html += '</div>';
            });
            html += '</div>';
        }

        // All alive fish including breeding pond
        var alive = state.fish.filter(function (f) { return f.alive; });
        var pondFish = (state.breedingPond || []).filter(function (f) { return f && f.alive; });
        var allFish = alive.concat(pondFish.map(function(f){ return Object.assign({}, f, { _inPond: true }); }));

        var ro = { common:0, uncommon:1, rare:2, epic:3, legendary:4, mythic:5 };
        allFish.sort(function (a, b) {
            return (ro[b.rarity] || 0) - (ro[a.rarity] || 0);
        });

        html += '<h3 class="section-heading">Your Fish Stock (' + alive.length + ' fish' + (pondFish.length ? ' + ' + pondFish.length + ' in pond' : '') + ')</h3>';

        if (allFish.length === 0) {
            html += '<p class="empty-state">No fish in stock to sell.</p>';
        } else {
            html += '<div class="sell-fish-table">';
            html += '<div class="sell-fish-header">';
            html += '<span>Name</span><span>Species</span><span>Rarity</span><span>Weight</span><span>Stage</span><span>Location</span><span>Value</span><span>Auction</span><span></span>';
            html += '</div>';
            html += '<div class="sell-fish-body">';

            allFish.forEach(function (f) {
                var col         = RARITY_COLS[f.rarity] || '#888';
                var rd          = typeof Fish !== 'undefined' ? (Fish.RARITIES[f.rarity] || { name: f.rarity }) : { name: f.rarity };
                var sp          = typeof Fish !== 'undefined' ? (Fish.SPECIES[f.species] ? Fish.SPECIES[f.species].name : f.species) : f.species;
                var val         = typeof Fish !== 'undefined' ? Fish.getFishValue(f) : 0;
                var auctionMult = RARITY_MULT[f.rarity] || 1.25;
                var auctionVal  = Math.round(val * auctionMult);
                var lk          = f._inPond ? '🧬 Breeding Pond' : (f.lake_id && typeof Lakes !== 'undefined' ? ((Lakes.getLakeById(f.lake_id) || {}).name || '\u2014') : '\u2014');
                var inPond      = !!f._inPond;

                html += '<div class="sell-fish-row' + (inPond ? ' sell-fish-row-pond' : '') + '">';
                html += '<span class="sell-fish-name">' + f.name + '</span>';
                html += '<span class="sell-fish-species">' + sp + '</span>';
                html += '<span class="sell-fish-rarity" style="color:' + col + ';font-weight:700;">' + rd.name + '</span>';
                html += '<span>' + UI.formatWeight(f.weight_oz) + '</span>';
                html += '<span>' + f.growth_stage + '</span>';
                html += '<span class="sell-fish-lake">' + lk + '</span>';
                html += '<span class="sell-fish-val">' + UI.formatMoney(val) + '</span>';
                html += '<span class="sell-auction-val">' + UI.formatMoney(auctionVal) + ' <em>+' + Math.round((auctionMult - 1) * 100) + '%</em></span>';
                html += '<span class="sell-fish-actions">';
                if (inPond) {
                    html += '<span class="sell-fish-pond-tag">In Pond</span>';
                } else {
                    html += '<button class="btn btn-danger btn-sm" onclick="Shop.sellFish(' + f.id + ')">Sell</button> ';
                    html += '<button class="btn btn-secondary btn-sm" onclick="Shop.auctionFish(' + f.id + ')">Auction</button>';
                }
                html += '</span></div>';
            });

            html += '</div></div>';
        }

        return html;
    }

    /**
     * Get all upgrades.
     */
    function getAllUpgrades() {
        return UPGRADES;
    }

    return {
        initState: initState,
        setShopLake: setShopLake,
        showShopView: showShopView,
        buyUpgrade: buyUpgrade,
        buyStockFish: buyStockFish,
        sellFish: sellFish,
        auctionFish: auctionFish,
        cancelAuction: cancelAuction,
        processDailyAuctions: processDailyAuctions,
        lakeHasUpgrade: lakeHasUpgrade,
        getLakeGrowthBonus: getLakeGrowthBonus,
        getLakeIncomeBonus: getLakeIncomeBonus,
        getLakeHealthBonus: getLakeHealthBonus,
        getAllUpgrades: getAllUpgrades,
        renderShop: renderShop
    };
})();
