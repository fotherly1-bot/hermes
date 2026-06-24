/**
 * Carp Fishing Tycoon — Card Pack System
 * Famous carp cards + buff cards. Buy packs, collect cards, use or discard.
 */
'use strict';

const Cards = (function () {

    // ── Card Pool ─────────────────────────────────────────────────────────────
    const CARD_POOL = {
        // LEGENDARY FISH
        benson:      { id:'benson',      type:'fish', rarity:'legendary', name:'Benson',               species:'common',  weight_oz:1026, age_days:1200, traits:['Champion','Alpha','Pristine'],              flavour:'"Britain\'s biggest and best-loved carp." 64lb 2oz. Died 2009.' },
        heather:     { id:'heather',     type:'fish', rarity:'legendary', name:'Heather the Leather',  species:'leather', weight_oz:832,  age_days:1800, traits:['Legendary Genes','Pristine','Iron Scales'],  flavour:'"Britain\'s most famous fish." 52lb scaleless legend.' },
        two_tone:    { id:'two_tone',    type:'fish', rarity:'legendary', name:'Two Tone',             species:'mirror',  weight_oz:1086, age_days:1600, traits:['Champion','Iron Scales','Alpha'],            flavour:'Half-and-half colouring. 67lb 14oz. Most desired mirror in England.' },
        clarissa:    { id:'clarissa',    type:'fish', rarity:'legendary', name:'Clarissa',             species:'common',  weight_oz:704,  age_days:1400, traits:['Legendary Genes','Alpha'],                   flavour:'Richard Walker\'s 44lb record (1952) — the catch that started modern carp fishing.' },
        // EPIC FISH
        the_parrot:      { id:'the_parrot',      type:'fish', rarity:'epic', name:'The Parrot',      species:'mirror',  weight_oz:880, age_days:1100, traits:['Champion','Clever'],              flavour:'Savay syndicate legend. Named for its distinctive curved lower lip.' },
        shoulders:       { id:'shoulders',       type:'fish', rarity:'epic', name:'Shoulders',       species:'common',  weight_oz:928, age_days:1050, traits:['Alpha','Apex Feeder'],            flavour:'Famous Wraysbury common. Unmistakable broad powerful shoulders.' },
        the_black_mirror:{ id:'the_black_mirror',type:'fish', rarity:'epic', name:'The Black Mirror',species:'mirror',  weight_oz:768, age_days:950,  traits:['Nocturnal','Iron Scales'],        flavour:'Near-black colouration. A Yateley mystery that eluded anglers for years.' },
        the_colossus:    { id:'the_colossus',    type:'fish', rarity:'epic', name:'The Colossus',    species:'common',  weight_oz:960, age_days:1300, traits:['Champion','Apex Feeder','Alpha'],  flavour:'An enormous frame. Possibly the most powerful carp alive.' },
        the_plated_mirror:{ id:'the_plated_mirror',type:'fish',rarity:'epic',name:'The Plated Mirror',species:'mirror', weight_oz:816, age_days:1000, traits:['Pristine','Legendary Genes'],     flavour:'Perfectly plated scales like armour. Consistent spawner of exceptional offspring.' },
        lady_of_the_lake:{ id:'lady_of_the_lake',type:'fish', rarity:'epic', name:'Lady of the Lake',species:'leather',weight_oz:736, age_days:900,  traits:['Pristine','Clever'],              flavour:'A silky-smooth leather carp. Only ever caught twice. Pure class.' },
        // RARE FISH
        the_warrior:  { id:'the_warrior',  type:'fish', rarity:'rare', name:'The Warrior',   species:'common', weight_oz:608, age_days:700, traits:['Hardy','Bold'],           flavour:'Battle-scarred and magnificent. Fought off otters more than once.' },
        the_general:  { id:'the_general',  type:'fish', rarity:'rare', name:'The General',   species:'mirror', weight_oz:576, age_days:680, traits:['Alpha','Cautious'],        flavour:'Commands respect in every lake it inhabits.' },
        spring_jewel: { id:'spring_jewel', type:'fish', rarity:'rare', name:'Spring Jewel',  species:'koi',    weight_oz:512, age_days:600, traits:['Pristine','Champion'],     flavour:'Radiant colouration that catches the spring light.' },
        the_shadow:   { id:'the_shadow',   type:'fish', rarity:'rare', name:'The Shadow',    species:'ghost',  weight_oz:544, age_days:650, traits:['Nocturnal','Clever'],      flavour:'Barely visible below the surface. Rarely caught, never forgotten.' },
        old_willow:   { id:'old_willow',   type:'fish', rarity:'rare', name:'Old Willow',    species:'common', weight_oz:592, age_days:900, traits:['Hardy','Cautious'],        flavour:'A survivor. Has outlasted three lake owners.' },
        the_grass_king:{ id:'the_grass_king',type:'fish',rarity:'rare', name:'The Grass King',species:'grass', weight_oz:480, age_days:550, traits:['Apex Feeder','Bold'],      flavour:'Master of the margins. Fastest-growing carp in its lake.' },
        // UNCOMMON FISH
        silver_fin:   { id:'silver_fin',   type:'fish', rarity:'uncommon', name:'Silver Fin',    species:'mirror', weight_oz:380, age_days:480, traits:['Greedy','Hardy'],     flavour:'Distinctive silver flanks. A solid addition to any water.' },
        old_goldie:   { id:'old_goldie',   type:'fish', rarity:'uncommon', name:'Old Goldie',    species:'crucian',weight_oz:96,  age_days:600, traits:['Hardy','Cautious'],    flavour:'The biggest crucian anyone in the club had ever seen.' },
        copper_scales:{ id:'copper_scales',type:'fish', rarity:'uncommon', name:'Copper Scales', species:'mirror', weight_oz:340, age_days:450, traits:['Aggressive','Greedy'], flavour:'Copper-tinted scales that glow at dusk.' },
        murky_mike:   { id:'murky_mike',   type:'fish', rarity:'uncommon', name:'Murky Mike',    species:'leather',weight_oz:360, age_days:500, traits:['Cautious','Hardy'],    flavour:'A leather carp that lives in the deepest silt.' },
        // COMMON FISH
        roger:        { id:'roger',       type:'fish', rarity:'common', name:'Roger',        species:'common', weight_oz:240, age_days:400, traits:['Greedy'],     flavour:'Not famous, but dependable. Always first to the bait.' },
        muddy_pete:   { id:'muddy_pete',  type:'fish', rarity:'common', name:'Muddy Pete',   species:'common', weight_oz:200, age_days:350, traits:['Cautious'],   flavour:'Spends most of his time in the silt. Reliable stock fish.' },
        little_mirror:{ id:'little_mirror',type:'fish',rarity:'common', name:'Little Mirror',species:'mirror', weight_oz:220, age_days:380, traits:['Shy'],        flavour:'Small but perfectly formed.' },
        weed_watcher: { id:'weed_watcher',type:'fish', rarity:'common', name:'Weed Watcher', species:'grass',  weight_oz:280, age_days:420, traits:['Lethargic'],  flavour:'Tucked behind the weed bed. Low maintenance, low drama.' },
        // LEGENDARY BUFF
        legendary_luck:  { id:'legendary_luck',  type:'buff', rarity:'legendary', name:'Legendary Luck',  buffType:'breeding_boost', buffValue:3,     buffDuration:10, colour:'#f1c40f', flavour:'Breeding rarity dramatically boosted for 10 days.' },
        // EPIC BUFFS
        boom_season:     { id:'boom_season',     type:'buff', rarity:'epic',      name:'Boom Season',     buffType:'income',          buffValue:1.0,   buffDuration:5,  colour:'#f1c40f', flavour:'+100% daily lake income for 5 days.' },
        feeding_frenzy:  { id:'feeding_frenzy',  type:'buff', rarity:'epic',      name:'Feeding Frenzy',  buffType:'growth',          buffValue:0.5,   buffDuration:7,  colour:'#9b59b6', flavour:'+50% fish growth rate for 7 days.' },
        // RARE BUFFS
        income_surge:    { id:'income_surge',    type:'buff', rarity:'rare',      name:'Income Surge',    buffType:'income',          buffValue:0.5,   buffDuration:3,  colour:'#2ecc71', flavour:'+50% daily lake income for 3 days.' },
        weather_shield:  { id:'weather_shield',  type:'buff', rarity:'rare',      name:'Weather Shield',  buffType:'weather',         buffValue:1.0,   buffDuration:7,  colour:'#3498db', flavour:'Ignore weather penalties for 7 days.' },
        sponsor_deal:    { id:'sponsor_deal',    type:'buff', rarity:'rare',      name:'Sponsor Deal',    buffType:'money',           buffValue:15000, buffDuration:0,  colour:'#2ecc71', flavour:'A tackle brand sponsors your fishery — £15,000 cash!' },
        growth_spurt:    { id:'growth_spurt',    type:'buff', rarity:'rare',      name:'Growth Spurt',    buffType:'growth',          buffValue:0.5,   buffDuration:5,  colour:'#1abc9c', flavour:'+50% fish growth rate for 5 days.' },
        // UNCOMMON BUFFS
        angler_magnet:   { id:'angler_magnet',   type:'buff', rarity:'uncommon',  name:'Angler Magnet',   buffType:'bookings',        buffValue:1.0,   buffDuration:5,  colour:'#3498db', flavour:'Double angler booking requests for 5 days.' },
        health_wave:     { id:'health_wave',     type:'buff', rarity:'uncommon',  name:'Health Wave',     buffType:'health',          buffValue:20,    buffDuration:0,  colour:'#e74c3c', flavour:'All living fish gain +20 health instantly.' },
        // COMMON BUFFS
        rep_boost:       { id:'rep_boost',       type:'buff', rarity:'common',    name:'Reputation Boost',buffType:'reputation',       buffValue:25,    buffDuration:0,  colour:'#f1c40f', flavour:'+25 reputation instantly.' },
        lucky_day:       { id:'lucky_day',       type:'buff', rarity:'common',    name:'Lucky Day',       buffType:'income',          buffValue:0.25,  buffDuration:1,  colour:'#2ecc71', flavour:'+25% lake income for 1 day.' }
    };

    // ── Pack Definitions ─────────────────────────────────────────────────────
    const PACK_DEFS = [
        { id:'bronze', name:'Bronze Pack', icon:'\uD83E\uDD49', cost:3000,  colour:'#cd7f32', desc:'A beginner\'s luck draw. Mostly commons with a hint of something better.',         odds:{ common:55, uncommon:30, rare:12, epic:2.5, legendary:0.5 } },
        { id:'silver', name:'Silver Pack', icon:'\uD83E\uDD48', cost:12000, colour:'#a8a9ad', desc:'Premium selection. Uncommon and rare cards are much more likely.',                  odds:{ common:20, uncommon:42, rare:28, epic:8,   legendary:2   } },
        { id:'gold',   name:'Gold Pack',   icon:'\uD83E\uDD47', cost:35000, colour:'#f1c40f', desc:'The finest packs in the business. Legendary draws are possible.',                   odds:{ common:5,  uncommon:18, rare:38, epic:30,  legendary:9   } }
    ];

    var RARITY_COLS  = { common:'#aaa', uncommon:'#2ecc71', rare:'#3498db', epic:'#9b59b6', legendary:'#f1c40f', mythic:'#e74c3c' };
    var RARITY_NAMES = { common:'Common', uncommon:'Uncommon', rare:'Rare', epic:'Epic', legendary:'Legendary', mythic:'Mythic' };
    var SPECIES_NAMES= { common:'Common Carp', mirror:'Mirror Carp', leather:'Leather Carp', ghost:'Ghost Carp', koi:'Koi Carp', grass:'Grass Carp', crucian:'Crucian Carp' };

    // ── State helpers ─────────────────────────────────────────────────────────
    function initState() {
        var s = Game.getState();
        if (!s.cardInventory)   s.cardInventory   = [];
        if (!s.cardPacksBought) s.cardPacksBought = {};
        if (!s.activeCardBuffs) s.activeCardBuffs = [];
        if (!s.cardNextId)      s.cardNextId      = 1;
    }
    function getCycle(s)        { return Math.floor((s.day - 1) / 3); }
    function daysUntilRefresh(s){ return 3 - ((s.day - 1) % 3); }
    function isPackBought(s, id){ return !!(s.cardPacksBought && s.cardPacksBought[id + '_' + getCycle(s)]); }

    // ── Draw a card from a pack ───────────────────────────────────────────────
    function drawCard(pack) {
        var odds  = pack.odds;
        var total = Object.keys(odds).reduce(function(sum, k){ return sum + odds[k]; }, 0);
        var roll  = Math.random() * total, cum = 0, chosen = 'common';
        Object.keys(odds).forEach(function(r){ if (roll > cum) { cum += odds[r]; chosen = r; } });
        var pool  = Object.values(CARD_POOL).filter(function(c){ return c.rarity === chosen; });
        if (!pool.length) pool = Object.values(CARD_POOL).filter(function(c){ return c.rarity === 'common'; });
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function makeInstance(tpl, state) {
        return {
            uid: 'c' + (state.cardNextId++), cardId: tpl.id,
            type: tpl.type, name: tpl.name, rarity: tpl.rarity, flavour: tpl.flavour,
            acquiredDay: state.day,
            species: tpl.species||null, weight_oz: tpl.weight_oz||null, age_days: tpl.age_days||null,
            traits: tpl.traits ? tpl.traits.slice() : [],
            buffType: tpl.buffType||null, buffValue: tpl.buffValue||0,
            buffDuration: tpl.buffDuration||0, buffColour: tpl.colour||'#888'
        };
    }

    // ── Open Pack (with shine animation) ─────────────────────────────────────
    function openPackAnimated(packId, btn) {
        var card = btn;
        while (card && !card.classList.contains('card-pack-card')) {
            card = card.parentElement;
        }
        if (card) {
            card.classList.add('card-pack-opening');
            btn.disabled = true;
            setTimeout(function () { openPack(packId); }, 720);
        } else {
            openPack(packId);
        }
    }

    // ── Open Pack ─────────────────────────────────────────────────────────────
    function openPack(packId) {
        initState();
        var state = Game.getState();
        var pack  = PACK_DEFS.find(function(p){ return p.id === packId; });
        if (!pack) { UI.showToast('Pack not found.', 'error'); return; }
        if (isPackBought(state, packId)) { UI.showToast('Out of stock until next refresh.', 'warning'); return; }
        if (state.money < pack.cost) { UI.showToast('Need ' + UI.formatMoney(pack.cost) + '.', 'error'); return; }
        if (!Game.spendMoney(pack.cost)) return;

        state.cardPacksBought[packId + '_' + getCycle(state)] = true;
        var drawn = [];
        for (var i = 0; i < 5; i++) { var inst = makeInstance(drawCard(pack), state); state.cardInventory.push(inst); drawn.push(inst); }

        if (typeof Finance !== 'undefined') Finance.addFinanceLog('card_pack', -pack.cost, 'Opened ' + pack.name);
        Game.addNotification('\uD83C\uDCCF Opened ' + pack.name + '! Got: ' + drawn.map(function(c){ return c.name; }).join(', ') + '.');
        UI.showToast(pack.name + ' opened \u2014 5 cards added to inventory!', 'success');
        Game.saveToStorage(); renderCards(); UI.renderTopBar();
    }

    // ── Use Card ──────────────────────────────────────────────────────────────
    function useCard(uid) {
        initState();
        var state = Game.getState();
        var idx   = state.cardInventory.findIndex(function(c){ return c.uid === uid; });
        if (idx === -1) { UI.showToast('Card not found.', 'error'); return; }
        var card  = state.cardInventory[idx];

        // For fish cards, show lake selector modal (no animation yet - just redirect)
        if (card.type === 'fish') {
            if (state.ownedLakes.length === 0) { UI.showToast('You must own a lake first.', 'error'); return; }
            showLakeSelectorForFishCard(card, idx);
            return;
        }

        // For buff cards: trigger destruction animation, then apply effect
        var cardEl = document.getElementById('card-' + uid);
        if (cardEl) {
            cardEl.classList.add('destroying');
            // Wait for animation to complete before applying effect
            setTimeout(function() {
                applyBuffCard(card);
                state.cardInventory.splice(idx, 1);
                Game.saveToStorage(); renderCards(); UI.renderTopBar();
            }, 450);
        } else {
            // Fallback if element not found (e.g. re-rendered)
            applyBuffCard(card);
            state.cardInventory.splice(idx, 1);
            Game.saveToStorage(); renderCards(); UI.renderTopBar();
        }
    }

    function showLakeSelectorForFishCard(card, invIdx) {
        var state = Game.getState();
        var lakeOptions = state.ownedLakes.map(function(id) {
            var l = typeof Lakes !== 'undefined' ? Lakes.getLakeById(id) : null;
            return '<option value="' + id + '">' + (l ? l.name : id) + '</option>';
        }).join('');

        var modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = '<div style="background:var(--colour-card);padding:1.5rem;border-radius:12px;min-width:300px;border:1px solid var(--colour-gold);">' +
            '<h3 style="margin-top:0;color:var(--colour-gold);">🎴 Stock ' + card.name + '</h3>' +
            '<p style="color:var(--colour-text-muted);margin-bottom:1rem;">Select which lake to release this fish into:</p>' +
            '<select id="card-lake-select" class="shop-lake-select" style="width:100%;margin-bottom:1rem;">' + lakeOptions + '</select>' +
            '<div style="display:flex;gap:0.5rem;justify-content:flex-end;">' +
            '<button class="btn btn-secondary btn-sm" onclick="this.closest(\'.modal-overlay\').remove()">Cancel</button>' +
            '<button class="btn btn-primary btn-sm" onclick="Cards.confirmFishCardStock(\'' + card.uid + '\', document.getElementById(\'card-lake-select\').value, this.closest(\'.modal-overlay\'))">Release</button>' +
            '</div>' +
            '</div>';
        document.body.appendChild(modal);
    }

    function confirmFishCardStock(uid, lakeId, modalEl) {
        var state = Game.getState();
        var idx   = state.cardInventory.findIndex(function(c){ return c.uid === uid; });
        if (idx === -1) { UI.showToast('Card not found.', 'error'); modalEl.remove(); return; }
        var card  = state.cardInventory[idx];

        var lake   = typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
        var nf     = Fish.createFish({ species:card.species, rarity:card.rarity, age_days:card.age_days||400, weight_oz: Math.min(card.weight_oz || 320, 320), lake_id:lakeId });
        nf.name    = card.name; nf.personality_traits = card.traits.slice();
        state.fish.push(nf);
        if (typeof Fish !== 'undefined') state.nextFishId = Fish.getNextId();
        Game.logFishCreation(nf, 'shop');
        Game.addNotification('\uD83C\uDCCF ' + card.name + ' released into ' + (lake ? lake.name : lakeId) + '!');
        UI.showToast(card.name + ' stocked in ' + (lake ? lake.name : 'your lake') + '!', 'success');

        state.cardInventory.splice(idx, 1);
        Game.saveToStorage(); renderCards(); UI.renderTopBar();
        modalEl.remove();
    }

    function applyBuffCard(card) {
        var state = Game.getState();
        var bt = card.buffType;
        if      (bt === 'money')      { state.money += card.buffValue; state.totalEarnings += card.buffValue; if (typeof Finance !== 'undefined') Finance.addFinanceLog('card_buff', card.buffValue, 'Card: '+card.name); UI.showToast(card.name+': '+UI.formatMoney(card.buffValue)+' added!','success'); }
        else if (bt === 'reputation') { Game.addReputation(card.buffValue); UI.showToast(card.name+': \u00B0'+card.buffValue+' reputation!','success'); }
        else if (bt === 'health')     { state.fish.forEach(function(f){ if(f.alive) f.stats.health=Math.min(100,(f.stats.health||0)+card.buffValue); }); UI.showToast(card.name+': All fish \u00B0'+card.buffValue+' health!','success'); }
        else { state.activeCardBuffs.push({ uid:card.uid, name:card.name, buffType:bt, buffValue:card.buffValue, startDay:state.day, endDay:state.day+card.buffDuration, colour:card.buffColour }); UI.showToast(card.name+' active for '+card.buffDuration+' days!','success'); }
        Game.addNotification('\uD83C\uDCCF Card used: ' + card.name + ' \u2014 ' + card.flavour);
    }

    // ── Discard Card ──────────────────────────────────────────────────────────
    function discardCard(uid) {
        initState();
        var state = Game.getState();
        var idx   = state.cardInventory.findIndex(function(c){ return c.uid === uid; });
        if (idx === -1) return;
        var name  = state.cardInventory[idx].name;
        state.cardInventory.splice(idx, 1);
        Game.saveToStorage(); UI.showToast(name + ' discarded.', 'warning'); renderCards();
    }

    // ── Process Buffs each day ────────────────────────────────────────────────
    function processBuffs() {
        initState();
        var state  = Game.getState();
        var before = state.activeCardBuffs.length;
        state.activeCardBuffs = state.activeCardBuffs.filter(function(b){ return state.day <= b.endDay; });
        if (state.activeCardBuffs.length < before) Game.addNotification('\uD83C\uDCCF A card buff has expired.');
    }

    function getBuffMultiplier(buffType) {
        var state = Game.getState();
        if (!state.activeCardBuffs) return 0;
        return state.activeCardBuffs.filter(function(b){ return b.buffType === buffType && b.endDay >= state.day; }).reduce(function(s,b){ return s+b.buffValue; }, 0);
    }

    // ── Active Timers strip ───────────────────────────────────────────────────
    function renderActiveTimers(state) {
        var pills = [];

        // Card buffs
        var buffs = (state.activeCardBuffs || []).filter(function(b){ return b.endDay >= state.day; });
        buffs.forEach(function(b){
            var left = b.endDay - state.day + 1;
            pills.push({ icon: '⚡', label: b.name, days: left + 'd left', colour: b.colour });
        });

        // Breeding timer
        if (state.breedingActive && state.breedingTimer > 0) {
            var p1 = state.breedingPond && state.breedingPond[0] ? state.breedingPond[0].name : '?';
            var p2 = state.breedingPond && state.breedingPond[1] ? state.breedingPond[1].name : '?';
            pills.push({ icon: '🧬', label: 'Breeding: ' + p1 + ' × ' + p2, days: state.breedingTimer + 'd left', colour: '#e74c3c' });
        }

        // Lake expansions
        if (state.lakeExpansions) {
            Object.keys(state.lakeExpansions).forEach(function(lakeId) {
                var exp = state.lakeExpansions[lakeId];
                if (!exp.inProgress) return;
                var daysLeft = Math.max(0, exp.completionDay - state.day);
                var lake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
                var name = lake ? lake.name : lakeId;
                pills.push({ icon: '🏗️', label: name + ' expansion', days: daysLeft + 'd left', colour: '#2ecc71' });
            });
        }

        // Active marketing campaigns
        (state.marketingCampaigns || []).filter(function(c){ return c.endDay >= state.day; }).forEach(function(c){
            var daysLeft = c.endDay - state.day + 1;
            pills.push({ icon: '📣', label: c.name, days: daysLeft + 'd left', colour: '#8e44ad' });
        });

        // Lake closures
        if (state.lakeClosures) {
            Object.keys(state.lakeClosures).forEach(function(lakeId) {
                var reopenDay = state.lakeClosures[lakeId];
                if (reopenDay < state.day) return;
                var daysLeft = reopenDay - state.day + 1;
                var lake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
                var name = lake ? lake.name : lakeId;
                pills.push({ icon: '🔒', label: name + ' closed', days: daysLeft + 'd left', colour: '#e74c3c' });
            });
        }

        // Water treatments
        if (state.lakeWaterTreatments) {
            Object.keys(state.lakeWaterTreatments).forEach(function(lakeId) {
                var t = state.lakeWaterTreatments[lakeId];
                if (!t || t.endDay < state.day) return;
                var daysLeft = t.endDay - state.day + 1;
                var lake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
                var name = lake ? lake.name : lakeId;
                pills.push({ icon: '💧', label: name + ' treatment', days: daysLeft + 'd left', colour: '#3498db' });
            });
        }

        // Active loans
        var activeLoans = (state.loans || []).filter(function(l){ return !l.paidOff; });
        if (activeLoans.length > 0) {
            var debt = activeLoans.reduce(function(s, l){ return s + (l.totalRepayable - l.totalPaid); }, 0);
            pills.push({ icon: '🏦', label: activeLoans.length + ' active loan' + (activeLoans.length > 1 ? 's' : ''), days: UI.formatMoney(debt) + ' remaining', colour: '#e67e22' });
        }

        if (pills.length === 0) {
            return '<div class="card-buffs-strip"><span class="card-buff-pill" style="border:1px solid var(--colour-border);color:var(--colour-text-muted);">✅ No active timers</span></div>';
        }

        var html = '<div class="card-buffs-strip-heading">⏱ Active Timers</div>';
        html += '<div class="card-buffs-strip">';
        pills.forEach(function(p){
            html += '<div class="card-buff-pill" style="border:1px solid '+p.colour+';color:'+p.colour+';">';
            html += p.icon + ' ' + p.label;
            html += '<span class="card-buff-days"> · ' + p.days + '</span>';
            html += '</div>';
        });
        html += '</div>';
        return html;
    }

    // ── Render Cards Page ─────────────────────────────────────────────────────
    function renderCards() {
        var container = document.getElementById('panel-cards');
        if (!container) return;
        initState();
        var state = Game.getState();
        var inv   = state.cardInventory;
        var buffs = (state.activeCardBuffs || []).filter(function(b){ return b.endDay >= state.day; });
        var html  = '<h2>\uD83C\uDCCF Card Inventory</h2>';

        html += renderActiveTimers(state);

        if (!inv.length) { html += '<p class="empty-state" style="margin-top:2rem;">No cards yet. Open packs in the <strong>Shop</strong>.</p>'; container.innerHTML = html; return; }

        html += '<p class="shop-subtitle">'+inv.length+' card'+(inv.length!==1?'s':'')+' in inventory \u2014 cards are destroyed when used.</p>';
        var ORDER  = ['legendary','epic','rare','uncommon','common'];
        var sorted = inv.slice().sort(function(a,b){ var d=ORDER.indexOf(a.rarity)-ORDER.indexOf(b.rarity); return d!==0?d:a.name.localeCompare(b.name); });

        html += '<div class="card-inventory-grid">';
        sorted.forEach(function(card){
            var rc = RARITY_COLS[card.rarity]||'#888', rn = RARITY_NAMES[card.rarity]||card.rarity;
            var isFish = card.type === 'fish';
            var rarityClass = 'card-item-' + card.rarity;
            html += '<div class="card-item ' + rarityClass + '" data-rarity="' + card.rarity + '" id="card-' + card.uid + '">';

            // Header band with rarity colour
            html += '<div class="card-item-header" style="background:linear-gradient(135deg,'+rc+'33,'+rc+'11);">';
            html += '<div class="card-item-header-left">';
            html += '<span class="card-rarity-badge" style="background:'+rc+'33;color:'+rc+';border:1px solid '+rc+'55;">'+rn+'</span>';
            html += '<span class="card-type-badge">'+(isFish?'\uD83D\uDC1F Fish':'\u26A1 Buff')+'</span>';
            html += '</div>';
            if (isFish) html += '<span class="card-item-fish-emoji">\uD83D\uDC1F</span>';
            html += '</div>';

            html += '<div class="card-item-body">';
            html += '<div class="card-item-name">'+card.name+'</div>';
            if (card.type === 'fish') {
                html += '<div class="card-item-sub">'+(SPECIES_NAMES[card.species]||card.species)+' \u00B7 '+UI.formatWeight(card.weight_oz)+' \u00B7 '+card.age_days+'d old</div>';
                if (card.traits.length) {
                    html += '<div class="card-item-traits">';
                    card.traits.forEach(function(t){ var td=typeof Fish!=='undefined'&&Fish.TRAIT_DEFINITIONS?Fish.TRAIT_DEFINITIONS[t]:null,tc=td?td.colour:'#4a9c6d'; html+='<span class="trait-badge" style="border-color:'+tc+';color:'+tc+';">'+t+'</span>'; });
                    html += '</div>';
                }
            } else {
                html += '<div class="card-item-sub" style="color:'+card.buffColour+';">'+(card.buffDuration>0?card.buffDuration+'d effect':'Instant')+'</div>';
            }
            html += '<div class="card-item-flavour">&ldquo;'+card.flavour+'&rdquo;</div>';
            html += '<div class="card-item-footer">';
            html += '<button class="btn btn-primary btn-sm" onclick="Cards.useCard(\''+card.uid+'\')">Use</button>';
            html += '<button class="btn btn-secondary btn-sm" onclick="Cards.discardCard(\''+card.uid+'\')">Discard</button>';
            html += '</div></div></div>';  // footer, body, card-item
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // ── Render Shop Section ───────────────────────────────────────────────────
    function renderCardShopSection() {
        initState();
        var state = Game.getState();
        var dtr   = daysUntilRefresh(state);
        var html  = '<h3 class="section-heading">\uD83C\uDCCF Card Packs</h3>';
        html += '<p class="shop-subtitle">One purchase per pack per cycle. 5 cards per pack. Refreshes every 3 days.</p>';
        html += '<div class="card-pack-refresh">Next refresh in <strong>' + dtr + '</strong> day' + (dtr !== 1 ? 's' : '') + '</div>';
        html += '<div class="card-pack-shop-bg">';
        html += '<div class="card-pack-grid">';
        PACK_DEFS.forEach(function(pack){
            var bought     = isPackBought(state, pack.id);
            var afford     = state.money >= pack.cost;
            var borderCol  = bought ? 'rgba(255,255,255,0.1)' : pack.colour;
            var glowColour = bought ? 'none' : '0 0 12px ' + pack.colour + '44';
            html += '<div class="card-pack-card' + (bought ? ' card-pack-sold' : '') + '" style="border-color:' + borderCol + ';box-shadow:' + glowColour + ';">';
            html += '<div class="card-pack-icon">' + pack.icon + '</div>';
            html += '<div class="card-pack-name" style="color:' + (bought ? 'var(--colour-text-muted)' : pack.colour) + ';">' + pack.name + '</div>';
            html += '<div class="card-pack-desc">' + pack.desc + '</div>';
            html += '<div class="card-pack-odds">';
            Object.keys(pack.odds).forEach(function(r){ var rc = bought ? 'var(--colour-text-muted)' : (RARITY_COLS[r]||'#888'); html += '<div class="card-pack-odd-row"><span style="color:'+rc+';">'+(RARITY_NAMES[r]||r)+'</span><span style="color:'+rc+';">'+pack.odds[r]+'%</span></div>'; });
            html += '</div>';
            html += '<div class="card-pack-footer"><span class="card-pack-price" style="'+(bought?'color:var(--colour-text-muted);':'color:'+pack.colour+';')+'">' + UI.formatMoney(pack.cost) + '</span>';
            if (bought)       html += '<span class="card-pack-soldout">\uD83D\uDD12 Out of stock \u2014 ' + dtr + 'd</span>';
            else if (!afford) html += '<button class="btn btn-secondary btn-sm" disabled>Can\'t afford</button>';
            else              html += '<button class="btn btn-primary btn-sm" onclick="Cards.openPackAnimated(\'' + pack.id + '\', this)">Open Pack</button>';
            html += '</div></div>';
        });
        html += '</div>';
        html += '</div>';
        return html;
    }

    return { initState, openPack, openPackAnimated, useCard, discardCard, processBuffs, getBuffMultiplier, renderCards, renderCardShopSection, confirmFishCardStock };
})();
