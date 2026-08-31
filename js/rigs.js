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
                weatherBonus: { sunny: 0.04, cloudy: 0.02, overcast: 0.00, rainy: -0.02, stormy: -0.06, foggy: -0.01, frost: -0.04, snowfall: -0.08, heatwave: 0.02 },
                substrateBonus: { weedy: 0.04, silty: 0.02, gravel: 0.00, rocky: -0.01, clay: 0.01, sandy: 0.00, muddy: 0.03, peaty: 0.01 }
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
                weatherBonus: { sunny: 0.02, cloudy: 0.03, overcast: 0.01, rainy: 0.00, stormy: -0.03, foggy: 0.01, frost: -0.02, snowfall: -0.05, heatwave: 0.01 },
                substrateBonus: { weedy: 0.01, silty: 0.02, gravel: 0.03, rocky: 0.04, clay: 0.02, sandy: 0.03, muddy: 0.01, peaty: 0.02 }
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
                weatherBonus: { sunny: 0.03, cloudy: 0.02, overcast: 0.01, rainy: -0.01, stormy: -0.04, foggy: 0.01, frost: -0.03, snowfall: -0.06, heatwave: 0.02 },
                substrateBonus: { weedy: 0.02, silty: 0.03, gravel: 0.02, rocky: 0.01, clay: 0.03, sandy: 0.02, muddy: 0.04, peaty: 0.03 }
            },
            {
                id: 'hair',
                name: 'Hair Rig',
                description: 'The iconic carp rig. Hookbait sits away from the lead for natural presentation.',
                icon: '🎣',
                image: '',
                category: 'Rig',
                cost: 0,
                leadTypes: ['inline', 'lead_clip', 'running'],
                bestLead: 'lead_clip',
                baseCatchMod: 0.04,
                baseWeightMod: 0.02,
                weatherBonus: { sunny: 0.05, cloudy: 0.03, overcast: 0.01, rainy: -0.01, stormy: -0.04, foggy: -0.02, frost: -0.03, snowfall: -0.06, heatwave: 0.04 },
                substrateBonus: { weedy: 0.02, silty: 0.01, gravel: 0.02, rocky: 0.00, clay: 0.01, sandy: 0.02, muddy: 0.02, peaty: 0.01 }
            },
            {
                id: 'chod',
                name: 'Chod Rig',
                description: 'Perfect for weedy, silty, or rocky bottoms. The hook sits proud for easy pickup.',
                icon: '🌿',
                image: '',
                category: 'Rig',
                cost: 4000,
                leadTypes: ['heli', 'lead_clip', 'inline'],
                bestLead: 'heli',
                baseCatchMod: 0.02,
                baseWeightMod: 0.00,
                weatherBonus: { sunny: 0.01, cloudy: 0.02, overcast: 0.03, rainy: 0.02, stormy: -0.01, foggy: 0.02, frost: -0.01, snowfall: -0.03, heatwave: 0.00 },
                substrateBonus: { weedy: 0.06, silty: 0.05, gravel: -0.02, rocky: 0.04, clay: 0.03, sandy: 0.02, muddy: 0.06, peaty: 0.04 }
            },
            {
                id: 'zig',
                name: 'Zig Rig',
                description: 'Floating zig rig for mid-water presentations. Devastating on warm, active carp.',
                icon: '〰️',
                image: '',
                category: 'Rig',
                cost: 2500,
                leadTypes: ['inline', 'running'],
                bestLead: 'inline',
                baseCatchMod: 0.01,
                baseWeightMod: -0.01,
                weatherBonus: { sunny: 0.03, cloudy: 0.01, overcast: -0.01, rainy: -0.03, stormy: -0.05, foggy: -0.02, frost: -0.06, snowfall: -0.10, heatwave: 0.06 },
                substrateBonus: { weedy: 0.02, silty: 0.02, gravel: 0.02, rocky: 0.02, clay: 0.02, sandy: 0.02, muddy: 0.02, peaty: 0.02 }
            },
            {
                id: 'dumpy',
                name: 'Dumpy Rig',
                description: 'Short, heavy rig for rough conditions and long-range casting. Ideal for windy days.',
                icon: '⚓',
                image: '',
                category: 'Rig',
                cost: 3500,
                leadTypes: ['lead_clip', 'running', 'inline'],
                bestLead: 'lead_clip',
                baseCatchMod: 0.01,
                baseWeightMod: 0.03,
                weatherBonus: { sunny: -0.01, cloudy: 0.00, overcast: 0.01, rainy: 0.02, stormy: 0.04, foggy: 0.02, frost: 0.01, snowfall: 0.00, heatwave: -0.02 },
                substrateBonus: { weedy: -0.01, silty: 0.01, gravel: 0.02, rocky: 0.02, clay: 0.01, sandy: 0.00, muddy: 0.01, peaty: 0.00 }
            },
            {
                id: 'popup',
                name: 'Pop-up Rig',
                description: 'Buoyant hookbait rig that lifts bait off the bottom. Great for weedy lakes and cautious fish.',
                icon: '🫧',
                image: '',
                category: 'Rig',
                cost: 2800,
                leadTypes: ['inline', 'lead_clip', 'heli'],
                bestLead: 'inline',
                baseCatchMod: 0.03,
                baseWeightMod: 0.00,
                weatherBonus: { sunny: 0.03, cloudy: 0.02, overcast: 0.01, rainy: -0.01, stormy: -0.02, foggy: 0.00, frost: -0.02, snowfall: -0.04, heatwave: 0.03 },
                substrateBonus: { weedy: 0.04, silty: 0.03, gravel: 0.00, rocky: -0.01, clay: 0.01, sandy: 0.01, muddy: 0.04, peaty: 0.02 }
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
                weatherBonus: { sunny: 0.01, cloudy: 0.01, overcast: 0.02, rainy: 0.04, stormy: 0.03, foggy: 0.02, frost: -0.01, snowfall: -0.02, heatwave: -0.01 },
                substrateBonus: { weedy: -0.01, silty: -0.01, gravel: 0.03, rocky: 0.02, clay: 0.01, sandy: 0.02, muddy: -0.01, peaty: 0.01 }
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
            if (!state.rigBaitEquipped) state.rigBaitEquipped = ['boilie_standard','boilie_standard','boilie_standard'];
            // Migrate old saves that used fishmeal or nulls
            for (var i = 0; i < 3; i++) {
                if (!state.rigBaitEquipped[i] || state.rigBaitEquipped[i] === 'boilie_fishmeal') state.rigBaitEquipped[i] = 'boilie_standard';
            }
            // Starter setup: always equipped Hair Rig + Standard Boilies on all 3 rods
            var allEquipped = state.rigEquipped.every(function(s){ return !!s; });
            var allBaited = state.rigBaitEquipped.every(function(b){ return !!b; });
            if (!allEquipped || !allBaited) {
                state.rigInventory.push('hair');
                for (var j = 0; j < 3; j++) {
                    state.rigEquipped[j] = { rigId: 'hair', leadType: 'lead_clip' };
                    state.rigBaitEquipped[j] = 'boilie_standard';
                }
            }
            if (!state.anglerBait) state.anglerBait = [];
            if (state.anglerBait.indexOf('boilie_standard') === -1) state.anglerBait.unshift('boilie_standard');
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
            // Rods must always stay equipped; keep current setup
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

        function getRigSubstrateBonus(substrateTrait) {
            var state = Game.getState();
            initState();
            var equipped = state.rigEquipped || [null, null, null];
            var bonus = 0;
            if (!substrateTrait) return bonus;
            equipped.forEach(function (slot) {
                if (!slot) return;
                var def = getRigById(slot.rigId);
                if (!def || !def.substrateBonus) return;
                var sb = def.substrateBonus[substrateTrait];
                if (typeof sb === 'number') bonus += sb;
            });
            return bonus;
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

        function getBaitById(id) {
            return (typeof Anglers !== 'undefined' && Anglers.getBaitById) ? Anglers.getBaitById(id) : null;
        }

        function getBaitDef(id) {
            if (id === 'boilie_standard') return { id: 'boilie_standard', name: 'Standard Boilies', effects: { catchRateBonus: 0.01 } };
            if (id === 'boilie_fishmeal') return { id: 'boilie_fishmeal', name: 'Fishmeal Boilies', effects: { catchRateBonus: 0.02 } };
            if (id === 'boilie_birdfood') return { id: 'boilie_birdfood', name: 'Birdfood Blend Boilies', effects: { catchRateBonus: 0.02 } };
            if (id === 'boilie_tigernut') return { id: 'boilie_tigernut', name: 'Tiger Nut Boilies', effects: { catchRateBonus: 0.02, weightBonus: 0.01 } };
            if (id === 'popup_white') return { id: 'popup_white', name: 'White Popups', effects: { catchRateBonus: 0.01 } };
            if (id === 'popup_yellow') return { id: 'popup_yellow', name: 'Yellow Popups', effects: { catchRateBonus: 0.01 } };
            if (id === 'popup_pink') return { id: 'popup_pink', name: 'Pink Popups', effects: { catchRateBonus: 0.01 } };
            if (id === 'popup_orange') return { id: 'popup_orange', name: 'Orange Popups', effects: { catchRateBonus: 0.01 } };
            if (id === 'popup_purple') return { id: 'popup_purple', name: 'Purple Popups', effects: { catchRateBonus: 0.01 } };
            if (id === 'spod_mix') return { id: 'spod_mix', name: 'Spod Mix', effects: { catchRateBonus: 0.01 } };
            return null;
        }

        function getEquippedBaitEffects() {
            var state = Game.getState();
            initState();
            var baits = state.rigBaitEquipped || [null, null, null];
            var catchBonus = 0;
            var weightBonus = 0;
            baits.forEach(function (baitId) {
                if (!baitId) return;
                var def = getBaitDef(baitId);
                if (!def) return;
                var fx = def.effects || {};
                catchBonus += fx.catchRateBonus || 0;
                weightBonus += fx.weightBonus || 0;
            });
            return { catchRateBonus: catchBonus, weightBonus: weightBonus };
        }

        function equipBait(rodIndex, baitId) {
            var state = Game.getState();
            initState();
            if (rodIndex < 0 || rodIndex > 2) return;
            if (!getBaitDef(baitId)) return;
            if ((state.anglerBait || []).indexOf(baitId) === -1) {
                UI.showToast('Buy this bait in the Shop first.', 'warning');
                return;
            }
            state.rigBaitEquipped[rodIndex] = baitId;
            var fx = getEquippedBaitEffects();
            UI.showToast('Rod ' + (rodIndex + 1) + ' bait set. +' + (fx.catchRateBonus * 100).toFixed(0) + '% catch | +' + (fx.weightBonus * 100).toFixed(0) + '% weight', 'success');
            renderRigs();
        }

        function unequipBait(rodIndex) {
            // Bait should always be equipped; keep current bait
        }

        function getEquippedSummary() {
            var state = Game.getState();
            initState();
            var equipped = state.rigEquipped || [null, null, null];
            var baits = state.rigBaitEquipped || [null, null, null];
            var rows = [];
            for (var i = 0; i < 3; i++) {
                var slot = equipped[i];
                var baitId = baits[i];
                var def = slot ? getRigById(slot.rigId) : null;
                var lead = slot ? getLeadDef(slot.leadType) : null;
                var baitDef = getBaitDef(baitId);
                rows.push({
                    rodLabel: 'Rod ' + (i + 1),
                    rigName: def ? def.name : 'Empty',
                    rigIcon: def ? def.icon : '🎣',
                    rigImage: def ? def.image : '',
                    leadName: lead ? lead.name : '',
                    leadIcon: lead ? lead.icon : '',
                    baitName: baitDef ? baitDef.name : 'None',
                    baitId: baitId || ''
                });
            }
            return rows;
        }

        /* ── RENDER ───────────────────────────────────────────────────────── */
        function renderRigs() {
            initState();
            var state = Game.getState();
            var html = '<div class="rigs-root">';

            // Rod slots row with selectors below each
            html += '<div class="rigs-rod-row">';
            for (var i = 0; i < 3; i++) {
                var summary = getEquippedSummary()[i];
                var slot = (state.rigEquipped || [])[i];
                var slotLabel = summary.rodLabel;
                html += '<div class="rig-rod-col">';
                html += '<div class="rig-rod-card">';
                html += '<div class="rig-rod-label">' + summary.rodLabel + '</div>';
                html += '<div class="rig-rod-icon">';
                html += '<img src="img/rigs/rod112.png" alt="Rod" class="rig-rod-static-img" onerror="this.style.display=\'none\'">';
                if (summary.rigImage) {
                    html += '<img src="' + summary.rigImage + '" alt="' + summary.rigName + '" class="rig-rod-img" onerror="this.style.display=\'none\';this.parentNode.innerHTML+=\'' + summary.rigIcon + '\';">';
                } else {
                    html += summary.rigIcon;
                }
                html += '</div>';
                html += '<div class="rig-rod-name">' + summary.rigName + '</div>';
                html += '<div class="rig-rod-lead">' + summary.leadIcon + ' ' + summary.leadName + '</div>';
                var fx = getEquippedRigEffects();
                var cBonus = (fx.catchRateBonus * 100).toFixed(0);
                var wBonus = (fx.weightBonus * 100).toFixed(0);
                html += '<div class="rig-rod-bonus">+' + cBonus + '% catch | +' + wBonus + '% weight</div>';
                html += '</div>';

                // Rig selector below rod
                html += '<div class="rig-rod-selector">';
                html += '<div class="rig-selector-label">Select Rig for ' + slotLabel + ' <span class="rig-help-trigger" title="Opens the full rig list. Owned rigs are selectable.">?</span></div>';
                html += '<button class="btn btn-primary" onclick="Rigs.openEquipModal(' + i + ')">Select Rig</button>';
                html += '<div style="margin-top:0.4rem;font-size:0.82rem;color:var(--colour-text-muted);">Equipped: ' + (summary.rigName || '—') + '</div>';
                html += '</div>';

                // Bait selector below rig
                html += '<div class="rig-bait-selector">';
                html += '<div class="rig-selector-label">Bait for ' + slotLabel + '</div>';
                html += '<button class="btn btn-primary" onclick="Rigs.openBaitModal(' + i + ')">Select Bait</button>';
                html += '<div style="margin-top:0.4rem;font-size:0.82rem;color:var(--colour-text-muted);">Equipped: ' + (summary.baitName || 'Standard Boilies') + '</div>';
                html += '</div>';

                html += '</div>'; // close rig-rod-col
            }
            html += '</div>'; // close rigs-rod-row

            // Bait preference tip panel
            html += '<div class="rigs-bait-tip-panel">';
            html += '<div class="rigs-bait-tip-title">🌍 Lake Substrate</div>';
            html += '<div class="rigs-bait-tip-text">Lakes have substrate traits like weedy, silty, gravel, rocky, clay, sandy, muddy, peaty. Equipped rigs gain catch bonuses when their Lake Substrate matches the active lake.</div>';
            html += '</div>';

            // Bait preference tip panel
            html += '<div class="rigs-bait-tip-panel">';
            html += '<div class="rigs-bait-tip-title">🎣 Bait Selection</div>';
            html += '<div class="rigs-bait-tip-text">All fish prefer 2 baits. Equipping a matching bait gives a catch bonus, especially on bigger fish.</div>';
            html += '</div>';

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
                if (def.substrateBonus) {
                    var substrateEntries = Object.keys(def.substrateBonus).map(function(k){ return k + ' ' + (def.substrateBonus[k] >= 0 ? '+' : '') + (def.substrateBonus[k] * 100).toFixed(0) + '%'; }).filter(function(s){ return s.indexOf('+0') === -1 && s.indexOf('-0') === -1; });
                    if (substrateEntries.length) html += '<div style="font-size:0.72rem;color:var(--colour-text-muted);margin-top:0.35rem;"><strong>Lake Substrate:</strong> ' + substrateEntries.join(', ') + '</div>';
                }
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

        function openBaitModal(rodIndex) {
            initState();
            var state = Game.getState();
            var ownedBait = (state.anglerBait || []);
            var currentBait = (state.rigBaitEquipped || [])[rodIndex] || 'boilie_standard';
            var summary = getEquippedSummary()[rodIndex];

            var html = '<div class="rig-equip-modal">';
            html += '<h4>Bait for Rod ' + (rodIndex + 1) + '</h4>';
            html += '<div style="margin-bottom:0.6rem;font-size:0.85rem;color:var(--colour-text-muted);">Currently equipped: ' + (summary.baitName || 'Standard Boilies') + '</div>';

            html += '<div class="rig-bait-grid">';
            [
                {id:'boilie_standard', name:'Standard Boilies'},
                {id:'boilie_fishmeal', name:'Fishmeal Boilies'},
                {id:'boilie_birdfood', name:'Birdfood Blend Boilies'},
                {id:'boilie_tigernut', name:'Tiger Nut Boilies'},
                {id:'popup_white', name:'White Popups'},
                {id:'popup_yellow', name:'Yellow Popups'},
                {id:'popup_pink', name:'Pink Popups'},
                {id:'popup_orange', name:'Orange Popups'},
                {id:'popup_purple', name:'Purple Popups'},
                {id:'spod_mix', name:'Spod Mix'}
            ].forEach(function(opt){
                var isActive = currentBait === opt.id;
                var isOwned = ownedBait.indexOf(opt.id) !== -1;
                var cls = 'btn btn-sm bait-opt ' + (isActive ? 'btn-primary' : 'btn-secondary');
                html += '<button class="' + cls + '" onclick="Rigs.equipBait(' + rodIndex + ',\'' + opt.id + '\');Rigs.renderRigs();UI.hideModal();" aria-pressed="' + isActive + '" ' + (isOwned ? '' : 'disabled') + '>' + opt.name + (isActive ? ' ✓' : '') + '</button>';
            });
            html += '</div>';

            html += '<button class="btn btn-secondary" style="margin-top:1rem;width:100%;" onclick="UI.hideModal()">Close</button>';
            html += '</div>';

            UI.showModal('<h3 style="margin-top:0;color:var(--colour-gold);">Select Bait</h3>' + html);
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
                html += '<div class="rigs-shop-card-icon">' + (def.icon || '') + '</div>';
                html += '<div class="rigs-shop-card-name">' + def.name + '</div>';
                html += '<div class="rigs-shop-card-desc">' + def.description + '</div>';
                if (def.substrateBonus) {
                    var substrateEntries = Object.keys(def.substrateBonus).map(function(k){ return k + ' ' + (def.substrateBonus[k] >= 0 ? '+' : '') + (def.substrateBonus[k] * 100).toFixed(0) + '%'; }).filter(function(s){ return s.indexOf('+0') === -1 && s.indexOf('-0') === -1; });
                    if (substrateEntries.length) {
                        html += '<div style="font-size:0.7rem;color:var(--colour-text-muted);margin-top:0.35rem;"><strong>Lake Substrate:</strong> ' + substrateEntries.join(', ') + '</div>';
                    }
                }
                if (alreadyOwned) {
                    html += '<span class="rig-badge rig-badge-owned">Owned</span>';
                    html += '<button class="btn btn-sm btn-muted" disabled>Owned</button>';
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
            if ((state.rigInventory || []).indexOf(rigId) === -1) state.rigInventory.push(rigId);
            state.pendingRigPurchases = (state.pendingRigPurchases || []).filter(function(id){ return id !== rigId; });
            UI.showToast(def.icon + ' ' + def.name + ' purchased!', 'success');
            if (typeof Finance !== 'undefined') {
                Finance.addFinanceLog('rig_purchase', -cost, def.name);
            }
            Game.saveToStorage();
            renderTackleBoxShop();
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
            getRigSubstrateBonus: getRigSubstrateBonus,
            renderRigs: renderRigs,
            openEquipModal: openEquipModal,
            openBaitModal: openBaitModal,
            selectLead: selectLead,
            buyRigFromShop: buyRigFromShop,
            renderTackleBoxShop: renderTackleBoxShop,
            getBaitDef: getBaitDef,
            getEquippedBaitEffects: getEquippedBaitEffects,
            equipBait: equipBait,
            unequipBait: unequipBait,
            getEquippedSummary: getEquippedSummary
        };
    })();
    window.Rigs = Rigs;
