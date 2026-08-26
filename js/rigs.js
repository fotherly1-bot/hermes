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
            // Component bonuses
            if (typeof RigComponents !== 'undefined' && RigComponents.getCustomizationEffects) {
                equipped.forEach(function (slot, idx) {
                    if (!slot) return;
                    var fx = RigComponents.getCustomizationEffects(idx);
                    catchBonus += fx.catchMod || 0;
                    weightBonus += fx.weightMod || 0;
                });
            }
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

        function getRigEffectsFromConfig(cfg) {
            cfg = cfg || {};
            var catchMod = 0;
            var weightMod = 0;
            if (typeof RigComponents !== 'undefined') {
                var h = RigComponents.getHook(cfg.hookType);
                if (h) { catchMod += h.catchMod || 0; weightMod += h.weightMod || 0; }
                var l = RigComponents.getLead(cfg.leadType);
                if (l) { catchMod += l.catchMod || 0; weightMod += l.weightMod || 0; }
                var t = RigComponents.getTubing(cfg.tubing);
                if (t) { catchMod += t.catchMod || 0; weightMod += t.weightMod || 0; }
                var b = RigComponents.getBait(cfg.bait);
                if (b) { catchMod += b.catchMod || 0; weightMod += b.weightMod || 0; }
            }
            return { catchRateBonus: catchMod, weightBonus: weightMod };
        }

        /* ── RENDER ───────────────────────────────────────────────────────── */
        function renderRigs() {
            initState();
            var state = Game.getState();
            var html = '<div class="rigs-root">';

            // Rod slots row
            html += '<div class="rigs-rod-row">';
            for (var i = 0; i < 3; i++) {
                var slot = (state.rigEquipped || [])[i];
                var slotLabel = 'Rod ' + (i + 1);
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
                    html += '<button class="btn btn-sm btn-primary" onclick="Rigs.openEquipModal(' + i + ')">Swap</button>';
                    html += '</div>';
                } else {
                    html += '<div class="rig-rod-card rig-rod-empty">';
                    html += '<div class="rig-rod-label">' + slotLabel + '</div>';
                    html += '<div class="rig-rod-icon">🎣</div>';
                    html += '<div class="rig-rod-name">Empty Slot</div>';
                    html += '<button class="btn btn-sm btn-primary" onclick="Rigs.openEquipModal(' + i + ')">Equip Rig</button>';
                    html += '</div>';
                }
            }
            html += '</div>'; // close rigs-rod-row

            // ── Custom Rig Slots Summary ───────────────────────────────────
            html += '<div class="rigs-custom-slots-summary">';
            html += '<h3 class="rigs-section-heading">🎣 Custom Rig Slots</h3>';
            html += '<div class="rigs-custom-slots-grid">';
            var customRigs = state.customRigs || [null, null, null];
            for (var s = 0; s < 3; s++) {
                var rig = customRigs[s];
                var slotId = 'custom_' + (s + 1);
                html += '<div class="rig-custom-slot-card">';
                html += '<div class="rig-slot-header">';
                html += '<span class="rig-slot-number">Slot ' + (s + 1) + '</span>';
                if (rig) {
                    html += '<span class="rig-slot-name">' + rig.name + '</span>';
                } else {
                    html += '<span class="rig-slot-empty">Empty</span>';
                }
                html += '</div>';
                if (rig) {
                    html += '<div class="rig-slot-details">';
                    html += '<div><strong>Hook:</strong> ' + (RigComponents.getHook(rig.hookType) ? RigComponents.getHook(rig.hookType).name : rig.hookType) + '</div>';
                    html += '<div><strong>Lead:</strong> ' + (RigComponents.getLead(rig.leadType) ? RigComponents.getLead(rig.leadType).name : rig.leadType) + '</div>';
                    html += '<div><strong>Tubing:</strong> ' + (RigComponents.getTubing(rig.tubing) ? RigComponents.getTubing(rig.tubing).name : rig.tubing) + '</div>';
                    html += '<div><strong>Weight:</strong> ' + rig.weight + 'oz</div>';
                    html += '<div><strong>Bait:</strong> ' + (RigComponents.getBait(rig.bait) ? RigComponents.getBait(rig.bait).name : rig.bait) + '</div>';
                    html += '<div><strong>Flavour:</strong> ' + (RigComponents.getFlavour(rig.flavour) ? RigComponents.getFlavour(rig.flavour).name : rig.flavour) + '</div>';
                    html += '<div><strong>Length:</strong> ' + rig.rigLength + 'cm</div>';
                    if (rig.popupHeight > 0) html += '<div><strong>Popup:</strong> ' + rig.popupHeight + 'cm</div>';
                    html += '<div><strong>Hair:</strong> ' + rig.hairLength + 'cm</div>';
                    html += '</div>';
                    // Calculate and show buffs
                    var slotFx = getRigEffectsFromConfig(rig);
                    var slotCatch = (slotFx.catchRateBonus * 100).toFixed(0);
                    var slotWeight = (slotFx.weightBonus * 100).toFixed(0);
                    html += '<div class="rig-slot-buffs">+' + slotCatch + '% catch | +' + slotWeight + '% weight</div>';
                    html += '<div class="rig-slot-actions">';
                    html += '<button class="btn btn-sm btn-secondary" onclick="Rigs.selectCustomRig(\'' + slotId + '\')">Load</button>';
                    html += '<button class="btn btn-sm btn-primary" onclick="Rigs.equipCustomRig(0,\'' + slotId + '\')">Equip</button>';
                    html += '<button class="btn btn-sm btn-muted" onclick="Rigs.deleteCustomRig(\'' + slotId + '\')">Clear</button>';
                    html += '</div>';
                } else {
                    html += '<div class="rig-slot-empty-state">Not configured</div>';
                }
                html += '</div>';
            }
            html += '</div>';
            html += '</div>';

            // Tackle box inventory
            html += '<h3 class="rigs-section-heading">Tackle Box Inventory</h3>';
            html += '<div class="rigs-inventory-grid">';
            var inventory = state.rigInventory || [];
            if (inventory.length === 0) {
                html += '<p class="empty-state">No rigs yet. Buy rigs from the shop!</p>';
            } else {
                var seen = {};
                inventory.forEach(function (rigId) {
                    if (seen[rigId]) return;
                    seen[rigId] = true;
                    var def = getRigById(rigId);
                    if (!def) return;
                    html += '<div class="rig-inventory-card">';
                    html += '<div class="rig-inv-icon">' + def.icon + '</div>';
                    html += '<div class="rig-inv-name">' + def.name + '</div>';
                    html += '<div class="rig-inv-desc">' + def.description + '</div>';
                    html += '<div class="rig-inv-meta">Category: ' + def.category + '</div>';
                    html += '</div>';
                });
            }
            html += '</div>'; // close rigs-inventory-grid

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
            var equipped = state.rigEquipped || [null, null, null];
            var usedRigIds = equipped.filter(function(s){ return s; }).map(function(s){ return s.rigId; });

            var html = '<div class="rig-equip-modal">';
            html += '<h4>Equip Rod ' + (rodIndex + 1) + '</h4>';

            // Custom rigs first
            var customRigs = state.customRigs || [null, null, null];
            var hasCustom = customRigs.some(function(r){ return r !== null; });
            if (hasCustom) {
                html += '<h5 style="color:var(--colour-gold);margin-bottom:0.5rem;">Custom Rigs</h5>';
                html += '<div class="rig-equip-carousel">';
                for (var s = 0; s < 3; s++) {
                    var rig = customRigs[s];
                    var slotId = 'custom_' + (s + 1);
                    if (!rig) continue;
                    var isEquipped = equipped[rodIndex] && equipped[rodIndex].rigId === 'custom' && equipped[rodIndex].customRigId === slotId;
                    html += '<div class="rig-equip-card">';
                    html += '<div class="rig-equip-icon">🎣</div>';
                    html += '<div class="rig-equip-name">Slot ' + (s + 1) + ' - ' + rig.name + '</div>';
                    html += '<div class="rig-equip-desc">Custom rig</div>';
                    if (isEquipped) {
                        html += '<button class="btn btn-sm btn-muted" disabled>In use</button>';
                    } else {
                        html += '<button class="btn btn-sm btn-primary" onclick="Rigs.equipCustomRig(' + rodIndex + ',\'' + slotId + '\')">Equip</button>';
                    }
                    html += '</div>';
                }
                html += '</div>';
            }

            // Preset rigs
            html += '<h5 style="color:var(--colour-text-muted);margin-top:1rem;margin-bottom:0.5rem;">Preset Rigs</h5>';
            html += '<div class="rig-equip-carousel">';
            RIG_CATALOG.forEach(function (def) {
                var owned = inventory.indexOf(def.id) !== -1;
                var isEquipped = usedRigIds.indexOf(def.id) !== -1 && equipped[rodIndex] && equipped[rodIndex].rigId !== def.id;
                html += '<div class="rig-equip-card' + (owned ? '' : ' rig-disabled') + '">';
                html += '<div class="rig-equip-icon">' + def.icon + '</div>';
                html += '<div class="rig-equip-name">' + def.name + '</div>';
                html += '<div class="rig-equip-desc">' + def.description + '</div>';
                if (owned) {
                    // Lead selector
                    html += '<div class="rig-lead-selector">';
                    def.leadTypes.forEach(function (lt) {
                        var lead = getLeadDef(lt);
                        html += '<button class="btn btn-sm ' + (lt === def.bestLead ? 'btn-primary' : 'btn-secondary') + '" onclick="Rigs.selectLead(' + rodIndex + ', \'' + def.id + '\', \'' + lt + '\')" title="' + lead.desc + '">' + lead.icon + ' ' + lead.name + '</button>';
                    });
                    html += '</div>';
                    if (isEquipped) {
                        html += '<button class="btn btn-sm btn-muted" disabled>In use</button>';
                    } else {
                        html += '<button class="btn btn-sm btn-primary" onclick="Rigs.selectLead(' + rodIndex + ', \'' + def.id + '\', \'' + (def.leadTypes[0] || 'inline') + '\')">Equip</button>';
                    }
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
                // Reset custom rig config when a preset rig is selected
                if (rigId !== 'custom') {
                    resetCustomRigConfig();
                }
                UI.hideModal();
                renderRigs();
                var def = getRigById(rigId);
                var lead = getLeadDef(leadType);
                UI.showToast((def ? def.icon : '') + ' Equipped ' + (def ? def.name : rigId) + ' + ' + lead.name, 'success');
            }
        }

        /* ── CUSTOMIZATION ─────────────────────────────────────────────────── */
        function ensureCustomizationDefaults() {
            var state = Game.getState();
            if (!state.rigCustomizations) state.rigCustomizations = [{ hookType: 'standard', leadType: 'lead_clip', tubing: 'none', weight: 2, bait: 'bottom_boilie', flavour: 'natural', rigLength: 45, popupHeight: 0, hairLength: 2 }, { hookType: 'standard', leadType: 'inline', tubing: 'none', weight: 2, bait: 'bottom_boilie', flavour: 'natural', rigLength: 45, popupHeight: 0, hairLength: 2 }, { hookType: 'standard', leadType: 'heli', tubing: 'none', weight: 2, bait: 'bottom_boilie', flavour: 'natural', rigLength: 45, popupHeight: 0, hairLength: 2 }];
        }

        function getCustomization(rodIndex) {
            ensureCustomizationDefaults();
            var state = Game.getState();
            return state.rigCustomizations[rodIndex] || { hookType: 'standard', leadType: 'lead_clip', tubing: 'none', weight: 2, bait: 'bottom_boilie', flavour: 'natural', rigLength: 45, popupHeight: 0, hairLength: 2 };
        }

        function setCustomization(rodIndex, key, value) {
            ensureCustomizationDefaults();
            var state = Game.getState();
            if (!state.rigCustomizations[rodIndex]) state.rigCustomizations[rodIndex] = {};
            state.rigCustomizations[rodIndex][key] = value;
            Game.saveToStorage();
        }

        function renderCustomizationModal(rodIndex) {
            ensureCustomizationDefaults();
            var c = getCustomization(rodIndex);
            var html = '<div class="rig-customize-modal">';
            html += '<h4 style="margin-top:0;color:var(--colour-gold);">Customise Rod ' + (rodIndex + 1) + '</h4>';

            function selectorRow(label, options, current, key) {
                var row = '<div class="rig-customize-row"><label>' + label + '</label><div class="rig-customize-options">';
                options.forEach(function (opt) {
                    var active = opt.id === current ? ' rig-opt-active' : '';
                    row += '<button class="btn btn-sm btn-secondary' + active + '" onclick="Rigs.setCustomization(' + rodIndex + ',\'' + key + '\',\'' + opt.id + '\');Rigs.renderCustomizationModal(' + rodIndex + ');">' + (opt.icon || '') + ' ' + opt.name + '</button>';
                });
                row += '</div></div>';
                return row;
            }

            function sliderRow(label, key, min, max, unit) {
                return '<div class="rig-customize-row"><label>' + label + ': <strong>' + c[key] + unit + '</strong></label>' +
                    '<input type="range" min="' + min + '" max="' + max + '" value="' + c[key] + '" onchange="Rigs.setCustomization(' + rodIndex + ',\'' + key + '\', parseInt(this.value));Rigs.renderCustomizationModal(' + rodIndex + ');" style="width:100%;"/></div>';
            }

            html += selectorRow('Hook', RigComponents.HOOKS, c.hookType, 'hookType');
            html += selectorRow('Lead Type', RigComponents.LEADS, c.leadType, 'leadType');
            html += selectorRow('Tubing', RigComponents.TUBING, c.tubing, 'tubing');
            html += selectorRow('Weight', RigComponents.WEIGHTS, 'weight_' + c.weight + 'oz', 'weight');
            html += selectorRow('Bait', RigComponents.BAITS, c.bait, 'bait');
            html += selectorRow('Flavour', RigComponents.FLAVOURS, c.flavour, 'flavour');
            html += sliderRow('Rig Length', 'rigLength', 20, 80, 'cm');
            var isPopupBait = c.bait === 'popup' || c.bait === 'popup_corn';
            html += '<div class="rig-customize-row" id="popup-height-row-' + rodIndex + '" style="opacity:' + (isPopupBait ? '1' : '0.4') + ';pointer-events:' + (isPopupBait ? 'auto' : 'none') + ';">';
            html += '<label>Popup Height: <strong>' + c.popupHeight + 'cm</strong></label>';
            html += '<input type="range" min="0" max="30" value="' + c.popupHeight + '" ' + (isPopupBait ? '' : 'disabled') + ' onchange="Rigs.setCustomization(' + rodIndex + ',\'popupHeight\', parseInt(this.value));Rigs.renderCustomizationModal(' + rodIndex + ');" style="width:100%;"/></div>';
            html += sliderRow('Hair Length', 'hairLength', 0, 8, 'cm');

            html += '<div class="rig-customize-section">';
            html += '<h5 style="color:var(--colour-text-muted);">Buy Components</h5>';
            var all = RigComponents.HOOKS.concat(RigComponents.LEADS, RigComponents.TUBING, RigComponents.WEIGHTS, RigComponents.BAITS, RigComponents.FLAVOURS);
            all.forEach(function (item) {
                if (RigComponents.isOwned(item.id)) return;
                html += '<div class="rig-component-row">';
                html += '<span>' + (item.icon || '') + ' ' + item.name + '</span>';
                html += '<span style="color:var(--colour-text-muted);font-size:0.8rem;">' + item.desc + '</span>';
                html += '<span style="font-weight:700;">£' + UI.formatMoney(item.cost) + '</span>';
                html += '<button class="btn btn-sm btn-primary" onclick="Rigs.buyComponentAndRerender(\'' + item.id + '\',' + rodIndex + ')">Buy</button>';
                html += '</div>';
            });
            html += '</div>';

            html += '<div class="rig-customize-actions">';
            html += '<button class="btn btn-secondary" onclick="UI.hideModal()">Close</button>';
            html += '</div>';

            html += '</div>';
            UI.showModal(html);
        }

        function buyComponentAndRerender(componentId, rodIndex) {
            if (typeof RigComponents !== 'undefined' && RigComponents.buyComponent) {
                RigComponents.buyComponent(componentId);
            }
            renderCustomizationModal(rodIndex);
        }

        /* ── CUSTOM RIG CREATOR ───────────────────────────────────────────── */
        function getActiveCustomRigConfig() {
            var state = Game.getState();
            if (!state.customRigs || state.customRigs.length !== 3) return null;
            return state.customRigs[0] || null;
        }

        function saveCustomRig(slotIndex) {
            slotIndex = slotIndex || 0;
            var state = Game.getState();
            if (!state.customRigs) state.customRigs = [null, null, null];
            var newRig = {
                id: 'custom_' + (slotIndex + 1),
                name: 'Custom Rig ' + (slotIndex + 1),
                hookType: (state.rigCustomizations && state.rigCustomizations[0] ? state.rigCustomizations[0].hookType : 'standard'),
                leadType: (state.rigCustomizations && state.rigCustomizations[0] ? state.rigCustomizations[0].leadType : 'lead_clip'),
                tubing: (state.rigCustomizations && state.rigCustomizations[0] ? state.rigCustomizations[0].tubing : 'none'),
                weight: (state.rigCustomizations && state.rigCustomizations[0] ? state.rigCustomizations[0].weight : 2),
                bait: (state.rigCustomizations && state.rigCustomizations[0] ? state.rigCustomizations[0].bait : 'bottom_boilie'),
                flavour: (state.rigCustomizations && state.rigCustomizations[0] ? state.rigCustomizations[0].flavour : 'natural'),
                rigLength: (state.rigCustomizations && state.rigCustomizations[0] ? state.rigCustomizations[0].rigLength : 45),
                popupHeight: (state.rigCustomizations && state.rigCustomizations[0] ? state.rigCustomizations[0].popupHeight : 0),
                hairLength: (state.rigCustomizations && state.rigCustomizations[0] ? state.rigCustomizations[0].hairLength : 2)
            };
            state.customRigs[slotIndex] = newRig;
            Game.saveToStorage();
            return newRig;
        }

        function selectCustomRig(customRigId) {
            var state = Game.getState();
            var slotIndex = parseInt(customRigId.split('_')[1], 10) - 1;
            if (isNaN(slotIndex) || slotIndex < 0 || slotIndex > 2) return;
            var rig = state.customRigs[slotIndex];
            if (!rig) return;
            state.activeCustomRigId = customRigId;
            if (state.rigCustomizations && state.rigCustomizations[0]) {
                state.rigCustomizations[0].hookType = rig.hookType;
                state.rigCustomizations[0].leadType = rig.leadType;
                state.rigCustomizations[0].tubing = rig.tubing;
                state.rigCustomizations[0].weight = rig.weight;
                state.rigCustomizations[0].bait = rig.bait;
                state.rigCustomizations[0].flavour = rig.flavour;
                state.rigCustomizations[0].rigLength = rig.rigLength;
                state.rigCustomizations[0].popupHeight = rig.popupHeight;
                state.rigCustomizations[0].hairLength = rig.hairLength;
            }
            Game.saveToStorage();
            renderRigs();
            UI.showToast('Selected custom rig ' + (slotIndex + 1) + ': ' + rig.name, 'success');
        }

        function deleteCustomRig(customRigId) {
            var state = Game.getState();
            var slotIndex = parseInt(customRigId.split('_')[1], 10) - 1;
            if (isNaN(slotIndex) || slotIndex < 0 || slotIndex > 2) return;
            state.customRigs[slotIndex] = null;
            if (state.activeCustomRigId === customRigId) state.activeCustomRigId = null;
            Game.saveToStorage();
            renderRigs();
            UI.showToast('Custom rig ' + (slotIndex + 1) + ' cleared.', 'warning');
        }

        function equipCustomRig(rodIndex, customRigId) {
            var state = Game.getState();
            var slotIndex = parseInt(customRigId.split('_')[1], 10) - 1;
            if (isNaN(slotIndex) || slotIndex < 0 || slotIndex > 2) return;
            var rig = state.customRigs[slotIndex];
            if (!rig) return;
            state.rigEquipped[rodIndex] = { rigId: 'custom', customRigId: customRigId };
            state.activeCustomRigId = customRigId;
            Game.saveToStorage();
            renderRigs();
            UI.showToast('Equipped custom rig ' + (slotIndex + 1) + ': ' + rig.name, 'success');
        }

        function resetCustomRigConfig() {
            var state = Game.getState();
            state.activeCustomRigId = null;
            if (state.rigCustomizations && state.rigCustomizations[0]) {
                state.rigCustomizations[0] = { hookType: 'standard', leadType: 'lead_clip', tubing: 'none', weight: 2, bait: 'bottom_boilie', flavour: 'natural', rigLength: 45, popupHeight: 0, hairLength: 2 };
            }
            Game.saveToStorage();
            renderRigs();
        }

        /* ── TACKLE BOX SHOP ──────────────────────────────────────────────── */
        function renderTackleBoxShop() {
            var state = Game.getState();
            var owned = state.rigComponentsOwned || [];
            var html = '<div class="rigs-shop-root">';
            html += '<h3 class="rigs-section-heading">🎒 Tackle Box Shop</h3>';
            html += '<p class="rigs-shop-intro">Buy rigs, leads, hooks, tubing, weights, baits and flavours. Unlocked items appear in the Customise Rig section.</p>';

            function shopSection(title, items, renderItem) {
                html += '<div class="rigs-shop-section">';
                html += '<h4 style="color:var(--colour-gold);margin-bottom:0.5rem;">' + title + '</h4>';
                html += '<div class="rigs-shop-grid">';
                items.forEach(function (item) {
                    var isOwned = owned.indexOf(item.id) !== -1;
                    html += '<div class="rigs-shop-card' + (isOwned ? ' rig-owned' : '') + '">';
                    html += '<div class="rigs-shop-card-icon">' + (item.icon || '') + '</div>';
                    html += '<div class="rigs-shop-card-name">' + item.name + '</div>';
                    html += '<div class="rigs-shop-card-desc">' + item.desc + '</div>';
                    if (renderItem) renderItem(item, isOwned);
                    html += '</div>';
                });
                html += '</div></div>';
            }

            // Rig Types
            shopSection('Rig Types', RIG_CATALOG, function (item, isOwned) {
                var inv = state.rigInventory || [];
                var alreadyOwned = inv.indexOf(item.id) !== -1;
                if (alreadyOwned || isOwned) {
                    html += '<span class="rig-badge rig-badge-owned">Owned</span>';
                } else {
                    html += '<span class="rig-badge rig-badge-cost">£' + UI.formatMoney(item.cost) + '</span>';
                    html += '<button class="btn btn-sm btn-primary" onclick="Rigs.buyRigFromShop(\'' + item.id + '\')">Buy</button>';
                }
            });

            // Lead Types
            shopSection('Lead Types', RigComponents.LEADS, function (item, isOwned) {
                if (isOwned) {
                    html += '<span class="rig-badge rig-badge-owned">Owned</span>';
                } else {
                    html += '<span class="rig-badge rig-badge-cost">£' + UI.formatMoney(item.cost) + '</span>';
                    html += '<button class="btn btn-sm btn-primary" onclick="Rigs.buyComponentFromShop(\'' + item.id + '\')">Buy</button>';
                }
            });

            // Hooks & Sizes
            shopSection('Hooks & Sizes', RigComponents.HOOKS, function (item, isOwned) {
                if (isOwned) {
                    html += '<span class="rig-badge rig-badge-owned">Owned</span>';
                } else {
                    html += '<span class="rig-badge rig-badge-cost">£' + UI.formatMoney(item.cost) + '</span>';
                    html += '<button class="btn btn-sm btn-primary" onclick="Rigs.buyComponentFromShop(\'' + item.id + '\')">Buy</button>';
                }
            });

            // Hooklink Materials
            shopSection('Hooklink Materials', RigComponents.TUBING, function (item, isOwned) {
                if (isOwned) {
                    html += '<span class="rig-badge rig-badge-owned">Owned</span>';
                } else {
                    html += '<span class="rig-badge rig-badge-cost">£' + UI.formatMoney(item.cost) + '</span>';
                    html += '<button class="btn btn-sm btn-primary" onclick="Rigs.buyComponentFromShop(\'' + item.id + '\')">Buy</button>';
                }
            });

            // Weights
            shopSection('Weights', RigComponents.WEIGHTS, function (item, isOwned) {
                if (isOwned) {
                    html += '<span class="rig-badge rig-badge-owned">Owned</span>';
                } else {
                    html += '<span class="rig-badge rig-badge-cost">£' + UI.formatMoney(item.cost) + '</span>';
                    html += '<button class="btn btn-sm btn-primary" onclick="Rigs.buyComponentFromShop(\'' + item.id + '\')">Buy</button>';
                }
            });

            // Baits
            shopSection('Baits', RigComponents.BAITS, function (item, isOwned) {
                if (isOwned) {
                    html += '<span class="rig-badge rig-badge-owned">Owned</span>';
                } else {
                    html += '<span class="rig-badge rig-badge-cost">£' + UI.formatMoney(item.cost) + '</span>';
                    html += '<button class="btn btn-sm btn-primary" onclick="Rigs.buyComponentFromShop(\'' + item.id + '\')">Buy</button>';
                }
            });

            // Flavours
            shopSection('Flavours', RigComponents.FLAVOURS, function (item, isOwned) {
                if (isOwned) {
                    html += '<span class="rig-badge rig-badge-owned">Owned</span>';
                } else {
                    html += '<span class="rig-badge rig-badge-cost">£' + UI.formatMoney(item.cost) + '</span>';
                    html += '<button class="btn btn-sm btn-primary" onclick="Rigs.buyComponentFromShop(\'' + item.id + '\')">Buy</button>';
                }
            });

            html += '</div>';
            return html;
        }

        function buyRigFromShop(rigId) {
            var state = Game.getState();
            initState();
            var def = (typeof Rigs !== 'undefined' ? Rigs.getRigById(rigId) : null);
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

        function buyComponentFromShop(componentId) {
            if (typeof RigComponents !== 'undefined' && RigComponents.buyComponent) {
                RigComponents.buyComponent(componentId);
            }
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
            setCustomization: setCustomization,
            renderCustomizationModal: renderCustomizationModal,
            buyComponentAndRerender: buyComponentAndRerender,
            getCustomization: getCustomization,
            saveCustomRig: saveCustomRig,
            selectCustomRig: selectCustomRig,
            deleteCustomRig: deleteCustomRig,
            equipCustomRig: equipCustomRig,
            resetCustomRigConfig: resetCustomRigConfig,
            renderTackleBoxShop: renderTackleBoxShop,
            buyRigFromShop: buyRigFromShop,
            buyComponentFromShop: buyComponentFromShop,
            getActiveCustomRigConfig: getActiveCustomRigConfig
        };
    })();
    window.Rigs = Rigs;
