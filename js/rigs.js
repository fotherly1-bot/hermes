    /** Carp fishing rig system. */
    var Rigs = (function () {
        'use strict';

        /* ── RIG CATALOG ──────────────────────────────────────────────────── */
        var RIG_CATALOG = [
            {
                id: 'blowback',
                name: 'Blowback Rig',
                description: 'Versatile all-rounder with a moving hookbait. Excellent for weedy lakes and pressured carp.',
                icon: '🪝',
                category: 'Rig',
                cost: 3000,
                leadTypes: ['inline', 'lead_clip', 'running'],
                bestLead: 'inline',
                baseCatchMod: 0.03,
                baseWeightMod: 0.01,
                weatherBonus: { sunny: 0.04, cloudy: 0.02, overcast: 0.00, rainy: -0.02, stormy: -0.06, foggy: -0.01, frost: -0.04, snowfall: -0.08, heatwave: 0.02 }
            },
            {
                id: 'ronnie',
                name: 'Ronnie Rig',
                description: 'Classic Ronnie Swinger. Great for long-range fishing and wary carp. Hook rotates freely.',
                icon: '🎯',
                category: 'Rig',
                cost: 3500,
                leadTypes: ['heli', 'lead_clip', 'inline'],
                bestLead: 'heli',
                baseCatchMod: 0.02,
                baseWeightMod: 0.02,
                weatherBonus: { sunny: 0.02, cloudy: 0.03, overcast: 0.01, rainy: 0.00, stormy: -0.03, foggy: 0.01, frost: -0.02, snowfall: -0.05, heatwave: 0.01 }
            },
            {
                id: 'inline_ronnie',
                name: 'Inline Ronnie Rig',
                description: 'Teardrop sinker with inline connector, black leader, yellow bead and right-curving hook. Excellent for wary fish.',
                icon: '🪝',
                category: 'Rig',
                cost: 3800,
                leadTypes: ['inline', 'heli', 'lead_clip'],
                bestLead: 'inline',
                baseCatchMod: 0.025,
                baseWeightMod: 0.015,
                weatherBonus: { sunny: 0.03, cloudy: 0.02, overcast: 0.01, rainy: -0.01, stormy: -0.04, foggy: 0.01, frost: -0.03, snowfall: -0.06, heatwave: 0.02 }
            },
            {
                id: 'hair',
                name: 'Hair Rig',
                description: 'The iconic carp rig. Hookbait sits away from the lead for natural presentation.',
                icon: '🧵',
                category: 'Rig',
                cost: 2000,
                leadTypes: ['inline', 'lead_clip', 'running'],
                bestLead: 'lead_clip',
                baseCatchMod: 0.04,
                baseWeightMod: 0.02,
                weatherBonus: { sunny: 0.05, cloudy: 0.03, overcast: 0.01, rainy: -0.01, stormy: -0.04, foggy: -0.02, frost: -0.03, snowfall: -0.06, heatwave: 0.04 }
            },
            {
                id: 'chod',
                name: 'Chod Rig',
                description: 'Perfect for weedy, silty, or rocky bottoms. The hook sits proud for easy pickup.',
                icon: '🌿',
                category: 'Rig',
                cost: 4000,
                leadTypes: ['heli', 'lead_clip', 'inline'],
                bestLead: 'heli',
                baseCatchMod: 0.02,
                baseWeightMod: 0.00,
                weatherBonus: { sunny: 0.01, cloudy: 0.02, overcast: 0.03, rainy: 0.02, stormy: -0.01, foggy: 0.02, frost: -0.01, snowfall: -0.03, heatwave: 0.00 }
            },
            {
                id: 'zig',
                name: 'Zig Rig',
                description: 'Floating zig rig for mid-water presentations. Devastating on warm, active carp.',
                icon: '〰️',
                category: 'Rig',
                cost: 2500,
                leadTypes: ['inline', 'running'],
                bestLead: 'inline',
                baseCatchMod: 0.01,
                baseWeightMod: -0.01,
                weatherBonus: { sunny: 0.03, cloudy: 0.01, overcast: -0.01, rainy: -0.03, stormy: -0.05, foggy: -0.02, frost: -0.06, snowfall: -0.10, heatwave: 0.06 }
            },
            {
                id: 'dumpy',
                name: 'Dumpy Rig',
                description: 'Short, heavy rig for rough conditions and long-range casting. Ideal for windy days.',
                icon: '⚓',
                category: 'Rig',
                cost: 3500,
                leadTypes: ['lead_clip', 'running', 'inline'],
                bestLead: 'lead_clip',
                baseCatchMod: 0.01,
                baseWeightMod: 0.03,
                weatherBonus: { sunny: -0.01, cloudy: 0.00, overcast: 0.01, rainy: 0.02, stormy: 0.04, foggy: 0.02, frost: 0.01, snowfall: 0.00, heatwave: -0.02 }
            },
            {
                id: 'popup',
                name: 'Pop-up Rig',
                description: 'Buoyant hookbait rig that lifts bait off the bottom. Great for weedy lakes and cautious fish.',
                icon: '🫧',
                category: 'Rig',
                cost: 2800,
                leadTypes: ['inline', 'lead_clip', 'heli'],
                bestLead: 'inline',
                baseCatchMod: 0.03,
                baseWeightMod: 0.00,
                weatherBonus: { sunny: 0.03, cloudy: 0.02, overcast: 0.01, rainy: -0.01, stormy: -0.02, foggy: 0.00, frost: -0.02, snowfall: -0.04, heatwave: 0.03 }
            },
            {
                id: 'straight',
                name: 'Straight Lead Rig',
                description: 'Simple, reliable, and deadly in running water. Perfect for river fishing or heavy currents.',
                icon: '🔗',
                category: 'Rig',
                cost: 1500,
                leadTypes: ['running', 'inline'],
                bestLead: 'running',
                baseCatchMod: 0.02,
                baseWeightMod: 0.01,
                weatherBonus: { sunny: 0.01, cloudy: 0.01, overcast: 0.02, rainy: 0.04, stormy: 0.03, foggy: 0.02, frost: -0.01, snowfall: -0.02, heatwave: -0.01 }
            }
        ];

        var LEAD_TYPES = {
            heli:      { name: 'Helicopter', icon: '🚁', desc: 'Allows free line movement above weed beds.' },
            lead_clip: { name: 'Lead Clip',  icon: '📎', desc: 'Clip holds lead securely; good for distance casting.' },
            running:   { name: 'Running Lead', icon: '🎗️', desc: 'Lead slides freely; ideal for running water.' },
            inline:    { name: 'Inline Lead', icon: '📏', desc: 'Classic inline setup; reliable all-rounder.' }
        };

        /* ── STATE HELPERS ────────────────────────────────────────────────── */
        function initState() {
            var state = Game.getState();
            if (!state.rigInventory) state.rigInventory = [];
            if (!state.rigEquipped) state.rigEquipped = [null, null, null];
            // Starter rig
            if (state.rigInventory.length === 0 && state.rigEquipped.every(function(s){ return !s; })) {
                state.rigInventory.push('hair');
                state.rigEquipped[0] = { rigId: 'hair', leadType: 'lead_clip' };
            }
        }

        function getRigById(id) {
            return RIG_CATALOG.find(function (r) { return r.id === id; }) || null;
        }

        function getLeadDef(type) {
            return LEAD_TYPES[type] || LEAD_TYPES.inline;
        }

        /* ── EQUIP / UNEQUIP ──────────────────────────────────────────────── */
        function equipRig(rodIndex, rigId, leadType) {
            var state = Game.getState();
            initState();
            if (rodIndex < 0 || rodIndex > 2) return false;
            var inv = state.rigInventory || [];
            if (inv.indexOf(rigId) === -1) return false;
            if (!LEAD_TYPES[leadType]) leadType = 'inline';
            state.rigEquipped[rodIndex] = { rigId: rigId, leadType: leadType };
            // Instant feedback
            var fx = getEquippedRigEffects();
            UI.showToast('Rod ' + (rodIndex + 1) + ' equipped. +' + (fx.catchRateBonus * 100).toFixed(0) + '% catch | +' + (fx.weightBonus * 100).toFixed(0) + '% weight', 'success');
            return true;
        }

        function unequipRig(rodIndex) {
            var state = Game.getState();
            initState();
            if (rodIndex < 0 || rodIndex > 2) return;
            state.rigEquipped[rodIndex] = null;
            UI.showToast('Rod ' + (rodIndex + 1) + ' unequipped.', 'warning');
        }

        function getEquippedRigEffects() {
            var state = Game.getState();
            initState();
            var equipped = state.rigEquipped || [null, null, null];
            var catchBonus = 0;
            var weightBonus = 0;
            equipped.forEach(function (slot) {
                if (!slot) return;
                var def = getRigById(slot.rigId);
                if (!def) return;
                catchBonus += def.baseCatchMod || 0;
                weightBonus += def.baseWeightMod || 0;
                // Best lead bonus
                if (slot.leadType === def.bestLead) {
                    catchBonus += 0.02;
                    weightBonus += 0.01;
                }
            });
            return { catchRateBonus: catchBonus, weightBonus: weightBonus };
        }

        function getRigWeatherBonus(weatherType) {
            var state = Game.getState();
            initState();
            var equipped = state.rigEquipped || [null, null, null];
            var bonus = 0;
            equipped.forEach(function (slot) {
                if (!slot) return;
                var def = getRigById(slot.rigId);
                if (!def) return;
                var wb = def.weatherBonus && def.weatherBonus[weatherType];
                if (typeof wb === 'number') bonus += wb;
                // Best lead bonus
                if (slot.leadType === def.bestLead) {
                    bonus += 0.01;
                }
            });
            return bonus;
        }

        /* ── RENDER ───────────────────────────────────────────────────────── */
        function renderRigs() {
            initState();
            var state = Game.getState();
            var html = '<div class="rigs-root">';

            // Rod slots row with selectors below each
            html += '<div class="rigs-rod-row">';
            for (var i = 0; i < 3; i++) {
                var slot = (state.rigEquipped || [])[i];
                var slotLabel = 'Rod ' + (i + 1);
                html += '<div class="rig-rod-col">';
                if (slot) {
                    var def = getRigById(slot.rigId);
                    var lead = getLeadDef(slot.leadType);
                    html += '<div class="rig-rod-card">';
                    html += '<div class="rig-rod-label">' + slotLabel + '</div>';
                    if (def) {
                        html += '<div class="rig-rod-icon">' + def.icon + '</div>';
                        html += '<div class="rig-rod-name">' + def.name + '</div>';
                        html += '<div class="rig-rod-lead">' + lead.icon + ' ' + lead.name + '</div>';
                        // Live bonus preview
                        var fx = getEquippedRigEffects();
                        var cBonus = (fx.catchRateBonus * 100).toFixed(0);
                        var wBonus = (fx.weightBonus * 100).toFixed(0);
                        html += '<div class="rig-rod-bonus">+' + cBonus + '% catch | +' + wBonus + '% weight</div>';
                    } else {
                        html += '<div class="rig-rod-icon">🎣</div>';
                        html += '<div class="rig-rod-name">Empty</div>';
                    }
                    html += '<button class="btn btn-sm btn-primary" onclick="Rigs.unequipRig(' + i + ');Rigs.renderRigs();">Unequip</button>';
                    html += '</div>';
                } else {
                    html += '<div class="rig-rod-card rig-rod-empty">';
                    html += '<div class="rig-rod-label">' + slotLabel + '</div>';
                    html += '<div class="rig-rod-icon">🎣</div>';
                    html += '<div class="rig-rod-name">Empty Slot</div>';
                    html += '</div>';
                }

                // Rig selector below rod
                html += '<div class="rig-rod-selector">';
                html += '<div class="rig-selector-label">Select Rig for ' + slotLabel + '</div>';
                html += '<div class="rig-selector-grid">';
                (state.rigInventory || []).forEach(function (rigId) {
                    var rDef = getRigById(rigId);
                    if (!rDef) return;
                    var isActive = slot && slot.rigId === rigId;
                    html += '<button class="btn btn-sm ' + (isActive ? 'btn-primary' : 'btn-secondary') + '" onclick="Rigs.equipRig(' + i + ',\'' + rigId + '\',\'' + (rDef.leadTypes[0] || 'inline') + '\');Rigs.renderRigs();">' + rDef.icon + ' ' + rDef.name + '</button>';
                });
                html += '</div>';
                html += '</div>';

                html += '</div>'; // close rig-rod-col
            }
            html += '</div>'; // close rigs-rod-row

            // Tackle Box Shop
            html += renderTackleBoxShop();

            // Weather preview
            if (typeof Weather !== 'undefined') {
                var w = Weather.getCurrentWeather();
                var wDef = Weather.getWeatherDef(w.current);
                var rigBonus = getRigWeatherBonus(w.current);
                html += '<div class="rigs-weather-bonus">';
                html += '<strong>Current Weather:</strong> ' + (wDef.emoji || '') + ' ' + (wDef.name || w.current);
                html += ' &nbsp;|&nbsp; <strong>Rig Bonus:</strong> ' + (rigBonus >= 0 ? '+' : '') + (rigBonus * 100).toFixed(0) + '% catch rate';
                html += '</div>';
            }

            html += '</div>';
            return html;
        }

        /* ── EQUIP MODAL ──────────────────────────────────────────────────── */
        function openEquipModal(rodIndex) {
            initState();
            var state = Game.getState();
            var inventory = state.rigInventory || [];

            var html = '<div class="rig-equip-modal">';
            html += '<h4>Equip Rod ' + (rodIndex + 1) + '</h4>';

            // Preset rigs
            html += '<h5 style="color:var(--colour-text-muted);margin-top:1rem;margin-bottom:0.5rem;">Rigs</h5>';
            html += '<div class="rig-equip-carousel">';
            RIG_CATALOG.forEach(function (def) {
                var owned = inventory.indexOf(def.id) !== -1;
                html += '<div class="rig-equip-card' + (owned ? '' : ' rig-disabled') + '">';
                html += '<div class="rig-equip-icon">' + def.icon + '</div>';
                html += '<div class="rig-equip-name">' + def.name + '</div>';
                html += '<div class="rig-equip-desc">' + def.description + '</div>';
                if (owned) {
                    html += '<div class="rig-lead-selector">';
                    def.leadTypes.forEach(function (lt) {
                        var lead = getLeadDef(lt);
                        html += '<button class="btn btn-sm ' + (lt === def.bestLead ? 'btn-primary' : 'btn-secondary') + '" onclick="Rigs.selectLead(' + rodIndex + ', \'' + def.id + '\', \'' + lt + '\')" title="' + lead.desc + '">' + lead.icon + ' ' + lead.name + '</button>';
                    });
                    html += '</div>';
                } else {
                    html += '<button class="btn btn-sm btn-muted" disabled>Not Owned</button>';
                }
                html += '</div>';
            });
            html += '</div>';

            html += '<button class="btn btn-secondary" style="margin-top:1rem;width:100%;" onclick="UI.hideModal()">Close</button>';
            html += '</div>';

            UI.showModal('<h3 style="margin-top:0;color:var(--colour-gold);">Select Rig</h3>' + html);
        }

        function selectLead(rodIndex, rigId, leadType) {
            var ok = equipRig(rodIndex, rigId, leadType);
            if (ok) {
                UI.hideModal();
                renderRigs();
                var def = getRigById(rigId);
                var lead = getLeadDef(leadType);
                UI.showToast((def ? def.icon : '') + ' Equipped ' + (def ? def.name : rigId) + ' + ' + lead.name, 'success');
            }
        }

        /* ── TACKLE BOX SHOP ──────────────────────────────────────────────── */
        function renderTackleBoxShop() {
            var state = Game.getState();
            var html = '<div class="rigs-shop-root">';
            html += '<h3 class="rigs-section-heading">🎒 Rig Shop</h3>';
            html += '<p class="rigs-shop-intro">Buy and unlock new rigs. Owned rigs appear below and can be equipped on any rod.</p>';

            html += '<div class="rigs-shop-grid">';
            RIG_CATALOG.forEach(function (def) {
                var inv = state.rigInventory || [];
                var alreadyOwned = inv.indexOf(def.id) !== -1;
                html += '<div class="rigs-shop-card' + (alreadyOwned ? ' rig-owned' : '') + '">';
                html += '<div class="rigs-shop-card-img-wrap">';
                html += '<img class="rigs-shop-card-img" src="img/rigs/' + def.id + '.png" alt="' + def.name + '" loading="lazy" onerror="this.style.display=\'none\'"/>';
                html += '</div>';
                html += '<div class="rigs-shop-card-icon">' + def.icon + '</div>';
                html += '<div class="rigs-shop-card-name">' + def.name + '</div>';
                html += '<div class="rigs-shop-card-desc">' + def.description + '</div>';
                if (alreadyOwned) {
                    html += '<span class="rig-badge rig-badge-owned">Owned</span>';
                } else {
                    html += '<span class="rig-badge rig-badge-cost">£' + UI.formatMoney(def.cost) + '</span>';
                    html += '<button class="btn btn-sm btn-primary" onclick="Rigs.buyRigFromShop(\'' + def.id + '\')">Buy</button>';
                }
                html += '</div>';
            });
            html += '</div>';

            html += '</div>';
            return html;
        }

        function buyRigFromShop(rigId) {
            var state = Game.getState();
            initState();
            var def = getRigById(rigId);
            if (!def) { UI.showToast('Rig not found.', 'error'); return; }
            var inv = state.rigInventory || [];
            if (inv.indexOf(rigId) !== -1) {
                UI.showToast('You already own ' + def.name + '.', 'warning');
                renderRigs();
                return;
            }
            var cost = def.cost || 2500;
            if (!Game.spendMoney(cost)) {
                UI.showToast('Not enough money! You need ' + UI.formatMoney(cost) + '.', 'error');
                return;
            }
            inv.push(rigId);
            UI.showToast(def.icon + ' ' + def.name + ' added to your tackle box!', 'success');
            if (typeof Finance !== 'undefined') {
                Finance.addFinanceLog('rig_purchase', -cost, def.name);
            }
            Game.saveToStorage();
            renderRigs();
        }

        /* ── PUBLIC API ───────────────────────────────────────────────────── */
        return {
            RIG_CATALOG: RIG_CATALOG,
            LEAD_TYPES: LEAD_TYPES,
            initState: initState,
            getRigById: getRigById,
            getLeadDef: getLeadDef,
            equipRig: equipRig,
            unequipRig: unequipRig,
            getEquippedRigEffects: getEquippedRigEffects,
            getRigWeatherBonus: getRigWeatherBonus,
            renderRigs: renderRigs,
            openEquipModal: openEquipModal,
            selectLead: selectLead,
            buyRigFromShop: buyRigFromShop
        };
    })();
    window.Rigs = Rigs;
