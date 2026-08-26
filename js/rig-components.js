    /** Rig component catalog: hooks, leads, tubing, weights, baits, flavours. */
    var RigComponents = (function () {
        'use strict';

        var HOOKS = [
            { id: 'standard_hook', name: 'Standard Hook', icon: '🪝', cost: 0, desc: 'Basic curved hook. Reliable for general carp fishing.', catchMod: 0.00, weightMod: 0.00 },
            { id: 'wide_gape_hook', name: 'Wide Gape Hook', icon: '🎯', cost: 2500, desc: 'Wider gap for larger baits and bigger carp. Good hook-hold rate.', catchMod: 0.01, weightMod: 0.00 },
            { id: 'curved_hook', name: 'Curved Hook', icon: '〰️', cost: 3000, desc: 'Subtle curve helps bait presentation in weedy or silty lakes.', catchMod: 0.01, weightMod: 0.00 },
            { id: 'spade_hook', name: 'Spade End Hook', icon: '🔒', cost: 3500, desc: 'Flat spade end for secure knot and straight line pull.', catchMod: 0.02, weightMod: 0.00 },
            { id: 'chemically_sharp_hook', name: 'Chemically Sharpened Hook', icon: '⚗️', cost: 5000, desc: 'Ultra-sharp point. Penetrates tough carp mouths effortlessly.', catchMod: 0.03, weightMod: 0.00 }
        ];

        var LEADS = [
            { id: 'inline_lead', name: 'Inline Lead', icon: '📏', cost: 0, desc: 'Classic inline setup. Reliable all-rounder.', catchMod: 0.00, weightMod: 0.00 },
            { id: 'lead_clip_lead', name: 'Lead Clip', icon: '📎', cost: 1200, desc: 'Clip holds lead securely. Good for distance casting.', catchMod: 0.01, weightMod: 0.00 },
            { id: 'running_lead', name: 'Running Lead', icon: '🎗️', cost: 1500, desc: 'Free-sliding lead. Ideal for running water.', catchMod: 0.01, weightMod: 0.00 },
            { id: 'heli_lead', name: 'Helicopter', icon: '🚁', cost: 2000, desc: 'Free line movement above weed beds. Excellent for weedy lakes.', catchMod: 0.02, weightMod: 0.00 }
        ];

        var TUBING = [
            { id: 'none_tubing', name: 'No Tubing', icon: '➖', cost: 0, desc: 'Bare hooklink. Simple and direct.', catchMod: 0.00, weightMod: 0.00 },
            { id: 'anti_tangle_tubing', name: 'Anti-Tangle Tubing', icon: '🛡️', cost: 800, desc: 'Prevents tangles in weedy or snaggy swims.', catchMod: 0.00, weightMod: 0.00 },
            { id: 'camo_tubing', name: 'Camo Tubing', icon: '🌿', cost: 1200, desc: 'Conceals the line. Less wary carp will pick up the bait.', catchMod: 0.01, weightMod: 0.00 },
            { id: 'heavy_duty_tubing', name: 'Heavy Duty Tubing', icon: '⛓️', cost: 1800, desc: 'Abuse-resistant tubing for rough conditions and big fish.', catchMod: 0.00, weightMod: 0.01 }
        ];

        var WEIGHTS = [
            { id: 'weight_0oz', name: 'No Weight', icon: '➖', cost: 0, weightOz: 0, desc: 'Free-sinking or pop-up presentation.', catchMod: 0.00, weightMod: 0.00 },
            { id: 'weight_1oz', name: '1oz Lead', icon: '⚖️', cost: 200, weightOz: 1, desc: 'Light weight for short to medium casts.', catchMod: 0.00, weightMod: 0.00 },
            { id: 'weight_2oz', name: '2oz Lead', icon: '⚖️', cost: 400, weightOz: 2, desc: 'All-round weight. Good balance of distance and feel.', catchMod: 0.00, weightMod: 0.00 },
            { id: 'weight_3oz', name: '3oz Lead', icon: '⚖️', cost: 600, weightOz: 3, desc: 'Heavier for longer casts and stronger holds.', catchMod: 0.00, weightMod: 0.01 },
            { id: 'weight_4oz', name: '4oz Lead', icon: '⚖️', cost: 800, weightOz: 4, desc: 'Maximum distance and anchor in rough conditions.', catchMod: -0.01, weightMod: 0.02 }
        ];

        var BAITS = [
            { id: 'bottom_boilie', name: 'Bottom Boilie', icon: '🟤', cost: 0, desc: 'Classic bottom bait. Sinks and sits on the lake bed.', catchMod: 0.00, weightMod: 0.00 },
            { id: 'wafter', name: 'Wafter', icon: '🟡', cost: 600, desc: 'Neutrally buoyant wafter. Slow-sinking attractor.', catchMod: 0.02, weightMod: 0.00 },
            { id: 'dumbell_wafter', name: 'Dumbell Wafter', icon: '🔵', cost: 800, desc: 'Two-bead dumbell shape. More hookbait visibility.', catchMod: 0.01, weightMod: 0.00 },
            { id: 'popup', name: 'Pop-up Boilie', icon: '🟠', cost: 1000, desc: 'Floating boilie. Lifts bait off silty bottoms.', catchMod: 0.02, weightMod: 0.00 },
            { id: 'popup_corn', name: 'Pop-up Corn', icon: '🌽', cost: 400, desc: 'Bright pop-up corn. Visual attractor for wary fish.', catchMod: 0.01, weightMod: 0.00 },
            { id: 'snowman', name: 'Snowman Bait', icon: '☃️', cost: 1200, desc: 'Bottom boilie + pop-up combo. Two colours, two depths.', catchMod: 0.03, weightMod: 0.00 },
            { id: 'double_bottom', name: 'Double Bottom Bait', icon: '🟤🟤', cost: 1500, desc: 'Two boilies on the hook. Strong scent trail and bigger target.', catchMod: 0.02, weightMod: 0.01 }
        ];

        var FLAVOURS = [
            { id: 'natural', name: 'Natural / Unflavoured', icon: '🌾', cost: 0, desc: 'No added flavour. Trusted staple.', catchMod: 0.00, weightMod: 0.00 },
            { id: 'strawberry', name: 'Strawberry', icon: '🍓', cost: 300, desc: 'Sweet strawberry attracts inquisitive carp.', catchMod: 0.01, weightMod: 0.00 },
            { id: 'pineapple', name: 'Pineapple', icon: '🍍', cost: 300, desc: 'Tropical pineapple. Great summer flavour.', catchMod: 0.01, weightMod: 0.00 },
            { id: 'squid', name: 'Squid & Octopus', icon: '🦑', cost: 400, desc: 'Strong marine scent. Excellent for big, wary fish.', catchMod: 0.02, weightMod: 0.00 },
            { id: 'crab', name: 'Crab', icon: '🦀', cost: 400, desc: 'Natural crab scent. Works in most conditions.', catchMod: 0.01, weightMod: 0.00 },
            { id: 'strawberry_squid', name: 'Strawberry & Squid', icon: '🍓🦑', cost: 600, desc: 'Sweet and marine combo. A proven big-fish flavour.', catchMod: 0.02, weightMod: 0.00 },
            { id: 'tiger_nuts', name: 'Tiger Nuts', icon: '🥜', cost: 500, desc: 'High oil content. Extremely attractive to big carp.', catchMod: 0.02, weightMod: 0.00 },
            { id: 'chocolate', name: 'Chocolate', icon: '🍫', cost: 350, desc: 'Sweet chocolate aroma. Popular summer bait.', catchMod: 0.01, weightMod: 0.00 }
        ];

        function getById(list, id) {
            return list.find(function (x) { return x.id === id; }) || null;
        }

        function getHook(id) { return getById(HOOKS, id); }
        function getLead(id) { return getById(LEADS, id); }
        function getTubing(id) { return getById(TUBING, id); }
        function getWeight(id) { return getById(WEIGHTS, id); }
        function getBait(id) { return getById(BAITS, id); }
        function getFlavour(id) { return getById(FLAVOURS, id); }

        function getCustomizationEffects(rodIndex) {
            var state = Game.getState();
            if (!state.rigCustomizations) return { catchMod: 0, weightMod: 0 };
            var c = state.rigCustomizations[rodIndex];
            if (!c) return { catchMod: 0, weightMod: 0 };
            var catchMod = 0, weightMod = 0;
            var h = getHook(c.hookType); if (h) { catchMod += h.catchMod || 0; weightMod += h.weightMod || 0; }
            var l = getLead(c.leadType); if (l) { catchMod += l.catchMod || 0; weightMod += l.weightMod || 0; }
            var t = getTubing(c.tubing); if (t) { catchMod += t.catchMod || 0; weightMod += t.weightMod || 0; }
            var w = getWeight('weight_' + c.weight + 'oz'); if (w) { catchMod += w.catchMod || 0; weightMod += w.weightMod || 0; }
            var b = getBait(c.bait); if (b) { catchMod += b.catchMod || 0; weightMod += b.weightMod || 0; }
            var f = getFlavour(c.flavour); if (f) { catchMod += f.catchMod || 0; weightMod += f.weightMod || 0; }
            return { catchMod: catchMod, weightMod: weightMod };
        }

        function isOwned(componentId) {
            var state = Game.getState();
            return (state.rigComponentsOwned || []).indexOf(componentId) !== -1;
        }

        function buyComponent(componentId) {
            var state = Game.getState();
            if (!state.rigComponentsOwned) state.rigComponentsOwned = [];
            if (isOwned(componentId)) { UI.showToast('You already own this component.', 'warning'); return false; }
            var list = [HOOKS, LEADS, TUBING, WEIGHTS, BAITS, FLAVOURS];
            var item = null;
            for (var i = 0; i < list.length; i++) { item = getById(list[i], componentId); if (item) break; }
            if (!item) { UI.showToast('Component not found.', 'error'); return false; }
            if (!Game.spendMoney(item.cost)) { UI.showToast('Not enough money! Need ' + UI.formatMoney(item.cost) + '.', 'error'); return false; }
            state.rigComponentsOwned.push(componentId);
            UI.showToast((item.icon || '') + ' ' + item.name + ' purchased!', 'success');
            if (typeof Finance !== 'undefined') Finance.addFinanceLog('rig_component', -item.cost, item.name);
            Game.saveToStorage();
            return true;
        }

        return {
            HOOKS: HOOKS,
            LEADS: LEADS,
            TUBING: TUBING,
            WEIGHTS: WEIGHTS,
            BAITS: BAITS,
            FLAVOURS: FLAVOURS,
            getHook: getHook,
            getLead: getLead,
            getTubing: getTubing,
            getWeight: getWeight,
            getBait: getBait,
            getFlavour: getFlavour,
            getCustomizationEffects: getCustomizationEffects,
            isOwned: isOwned,
            buyComponent: buyComponent
        };
    })();
    window.RigComponents = RigComponents;
