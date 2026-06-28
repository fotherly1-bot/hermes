/**
 * Carp Fishing Tycoon — Breeding Pond (rebuilt)
 * Auto-breeds fish when a Breeding Scientist is on staff.
 */
'use strict';

const Breeding = (function () {

    const CYCLE_DAYS   = 5;  // days per breeding cycle
    const RARITY_ORDER = ['common','uncommon','rare','epic','legendary','mythic'];
    const RARITY_COLS  = { common:'#aaa', uncommon:'#2ecc71', rare:'#3498db', epic:'#9b59b6', legendary:'#f1c40f', mythic:'#e74c3c' };

    // ── State ─────────────────────────────────────────────────────────────────
    function initState() {
        var s = Game.getState();
        if (!s.breedingActive)      s.breedingActive      = false;
        if (!s.breedingTimer)       s.breedingTimer       = 0;
        if (s.breedingPond  === undefined) s.breedingPond  = [];
        if (!s.lastBreedingOutcome) s.lastBreedingOutcome = null;
        if (!s.fishCreationLog)     s.fishCreationLog     = [];
    }

    // ── Scientist helper (reads state directly, no Staff module needed) ───────
    function getScientist() {
        var s = Game.getState();
        return (s.hiredStaff || []).find(function(m){ return m.role === 'scientist'; }) || null;
    }

    function scientistRarityBonus() {
        var sci = getScientist(); if (!sci) return 0;
        var mult = 1.0;
        if ((sci.traits||[]).indexOf('thorough')  !== -1) mult *= 2.00;
        if ((sci.traits||[]).indexOf('efficient') !== -1) mult *= 1.20;
        if ((sci.traits||[]).indexOf('lazy')      !== -1) mult *= 0.85;
        var hap = 0.5 + (sci.happiness||70) / 200;
        return Math.round(12 * mult * hap);
    }

    // ── Eligible fish ─────────────────────────────────────────────────────────
    function getEligible() {
        var s   = Game.getState();
        var yr  = Math.ceil(s.day / 365);
        var inP = (s.breedingPond || []).filter(Boolean).map(function(f){ return f.id; });
        return s.fish.filter(function(f){
            return f.alive &&
                   f.growth_stage !== 'Fry' &&
                   f.growth_stage !== 'Juvenile' &&
                   f.weight_oz > 160 &&
                   (!f.lastBreedYear || f.lastBreedYear < yr) &&
                   inP.indexOf(f.id) === -1;
        }).sort(function(a,b){
            var ra = RARITY_ORDER.indexOf(a.rarity), rb = RARITY_ORDER.indexOf(b.rarity);
            if (rb !== ra) return rb - ra;
            return (typeof Fish !== 'undefined' ? Fish.getFishValue(b) - Fish.getFishValue(a) : 0);
        });
    }

    function pickBestPair() {
        var elig = getEligible();
        if (elig.length < 2) return null;
        var f1 = elig[0];
        var f2 = elig.slice(1).find(function(f){ return f.species !== f1.species; }) || elig[1];
        return [f1, f2];
    }

    // ── Rarity calculation ────────────────────────────────────────────────────
    function calcOffspringRarity(r1, r2, boost) {
        var avg = (RARITY_ORDER.indexOf(r1) + RARITY_ORDER.indexOf(r2)) / 2;
        var raw = {
            common:   Math.max(2, 50 - avg*12 - boost*0.6),
            uncommon: 30 + avg*2  + boost*0.25,
            rare:     13 + avg*4  + boost*0.25,
            epic:      5 + avg*4  + boost*0.20,
            legendary: 2 + avg*3  + boost*0.20,
            mythic:    0.5 + avg*1 + boost*0.10
        };
        var tot   = Object.keys(raw).reduce(function(s,k){ return s+raw[k]; }, 0);
        var roll  = Math.random() * tot, cum = 0;
        for (var i = 0; i < RARITY_ORDER.length; i++) {
            cum += raw[RARITY_ORDER[i]];
            if (roll <= cum) return RARITY_ORDER[i];
        }
        return 'common';
    }

    // ── Produce offspring ─────────────────────────────────────────────────────
    function produceOffspring() {
        var s    = Game.getState();
        var p1   = s.breedingPond[0], p2 = s.breedingPond[1];
        if (!p1 || !p2) return;
        var boost   = scientistRarityBonus();
        var numOff  = 1 + Math.floor(Math.random() * 3);
        var lakeId  = s.activeLakeId || (s.ownedLakes.length > 0 ? s.ownedLakes[0] : null);
        var lake    = lakeId && typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
        var cap     = lake ? lake.capacity : 0;
        var stocked = lakeId ? s.fish.filter(function(f){ return f.alive && f.lake_id === lakeId; }).length : 0;
        numOff      = Math.min(numOff, Math.max(0, cap - stocked));

        var offspringList = [];
        for (var i = 0; i < numOff; i++) {
            var rarity  = calcOffspringRarity(p1.rarity, p2.rarity, boost);
            var species = Math.random() < 0.5 ? p1.species : p2.species;
            var offspring = typeof Fish !== 'undefined' ? Fish.createFish({
                species: species, rarity: rarity, lake_id: lakeId,
                parent_ids: [p1.id, p2.id],
                weight_oz: 16
            }) : null;
            if (offspring) {
                s.fish.push(offspring);
                if (typeof Fish !== 'undefined') s.nextFishId = Fish.getNextId();
                if (typeof Game.logFishCreation === 'function')
                    Game.logFishCreation(offspring, 'breeding', [p1.name, p2.name]);
                offspringList.push({ name: offspring.name, rarity: rarity, species: species, weight_oz: offspring.weight_oz });
            }
        }

        // Return parents
        var yr = Math.ceil(s.day / 365);
        [p1, p2].forEach(function(p){
            p.lake_id = lakeId;
            p.lastBreedYear = yr;
            s.fish.push(p);
        });
        s.breedingPond = [];
        s.breedingActive = false;
        s.breedingTimer  = 0;

        s.lastBreedingOutcome = {
            day: s.day,
            parent1: { name: p1.name, rarity: p1.rarity },
            parent2: { name: p2.name, rarity: p2.rarity },
            offspring: offspringList
        };

        var best = offspringList.length > 0 ? offspringList.reduce(function(b,o){
            return RARITY_ORDER.indexOf(o.rarity) > RARITY_ORDER.indexOf(b.rarity) ? o : b;
        }) : null;
        Game.addReputation(5);
        Game.addNotification('\uD83E\uDD5A Breeding complete! ' + offspringList.length + ' offspring produced' +
            (best ? ' — best: ' + best.rarity + ' ' + best.name : '') + '.');
        Game.saveToStorage();
    }

    // ── Daily processing ──────────────────────────────────────────────────────
    function processDailyBreeding() {
        initState();
        var s  = Game.getState();
        var sci = getScientist();

        // Auto-select pair if scientist present and pond empty
        if (!s.breedingActive && (!s.breedingPond || s.breedingPond.filter(Boolean).length === 0)) {
            if (sci) {
                var pair = pickBestPair();
                if (pair) {
                    // Remove from main fish list and place in pond
                    var idx1 = s.fish.findIndex(function(f){ return f.id === pair[0].id; });
                    var idx2 = s.fish.findIndex(function(f){ return f.id === pair[1].id; });
                    if (idx1 !== -1 && idx2 !== -1) {
                        var f1 = s.fish.splice(Math.max(idx1,idx2), 1)[0];
                        var f2 = s.fish.splice(Math.min(idx1,idx2), 1)[0];
                        s.breedingPond = [f2, f1];
                        s.breedingActive = true;
                        s.breedingTimer  = CYCLE_DAYS;
                        Game.addNotification('\uD83D\uDD2C ' + sci.name + ' started a breeding cycle: ' + pair[0].name + ' \xD7 ' + pair[1].name + '.');
                    }
                }
            }
            return;
        }

        if (!s.breedingActive) return;
        s.breedingTimer--;
        if (s.breedingTimer <= 0) {
            produceOffspring();
        }
    }


    // ── Sell fish ─────────────────────────────────────────────────────────────
    function sellFish(fishId) {
        var s   = Game.getState();
        var idx = s.fish.findIndex(function(f){ return f.id === fishId; });
        if (idx === -1) return;
        var f   = s.fish[idx];
        if (!f.alive) return;
        var val = typeof Fish !== 'undefined' ? Fish.getFishValue(f) : 0;
        s.fish.splice(idx, 1);
        s.money += val; s.totalEarnings += val;
        if (typeof Finance !== 'undefined') Finance.addFinanceLog('fish_sale', val, 'Sold ' + f.name);
        Game.addNotification('\uD83D\uDCB8 Sold ' + f.name + ' for ' + UI.formatMoney(val) + '.');
        UI.showToast(f.name + ' sold for ' + UI.formatMoney(val) + '!', 'success');
        Game.saveToStorage();
        renderBreedingPond();
        UI.renderTopBar();
    }

    // ── Render ────────────────────────────────────────────────────────────────
    function renderBreedingPond() {
        var container = document.getElementById('panel-breeding');
        if (!container) return;
        initState();
        var s   = Game.getState();
        var sci = getScientist();
        var lbo = s.lastBreedingOutcome;

        var html = '<h2>\uD83E\uDD5A Breeding Pond</h2>';

        // ── Scientist status banner ───────────────────────────────────────────
        if (sci) {
            var eff = Math.round((function(m){
                var mult=1.0;
                if((m.traits||[]).indexOf('thorough')  !==-1) mult*=2.00;
                if((m.traits||[]).indexOf('efficient') !==-1) mult*=1.20;
                if((m.traits||[]).indexOf('lazy')      !==-1) mult*=0.85;
                return mult*(0.5+(m.happiness||70)/200);
            })(sci) * 100);
            var rb = scientistRarityBonus();
            html += '<div class="breed-sci-banner">';
            html += '<span class="breed-sci-name">\uD83D\uDD2C ' + sci.name + ' — Breeding Scientist</span>';
            html += '<div class="breed-sci-stats">';
            html += '<span>\u26A1 ' + eff + '% effective</span>';
            html += '<span>\uD83C\uDFB2 Rarity boost: +' + rb + ' pts</span>';
            html += '<span>\u23F1 ' + CYCLE_DAYS + ' day cycles</span>';
            html += '</div></div>';
        } else {
            html += '<div class="breed-no-sci">\uD83D\uDD2C Hire a <strong>Breeding Scientist</strong> from the Staff page to enable auto-breeding.</div>';
        }

        // ── Breeding cards — always shown, greyed when idle ───────────────────
        var isActive = s.breedingActive && s.breedingPond && s.breedingPond.length === 2;
        var p1 = isActive ? s.breedingPond[0] : null;
        var p2 = isActive ? s.breedingPond[1] : null;
        var prog = isActive ? Math.round(((CYCLE_DAYS - s.breedingTimer) / CYCLE_DAYS) * 100) : 0;
        var elig2 = getEligible();
        var stMsg = isActive
            ? ('\uD83E\uDD5A Breeding in Progress \u2014 ' + s.breedingTimer + ' day' + (s.breedingTimer!==1?'s':'') + ' remaining')
            : (sci ? (elig2.length<2 ? '\u23F3 Waiting for eligible fish' : '\u23F3 ' + sci.name + ' will start the next cycle tomorrow') : '\uD83D\uDD2C Hire a Breeding Scientist to enable auto-breeding');
        var stCol = isActive ? 'var(--colour-accent)' : 'var(--colour-text-muted)';

        html += '<div class="breed-active-wrap">';
        html += '<div class="breed-active-title-row"><span class="breed-active-label" style="color:'+stCol+';">'+stMsg+'</span></div>';
        html += '<div class="breed-progress-track" style="margin-bottom:0.85rem;"><div class="breed-progress-fill" style="width:'+prog+'%;'+(isActive?'':'opacity:0.15;')+'"></div></div>';

        html += '<div class="breed-parent-cards">';
        [p1, p2].forEach(function(f, idx) {
            if (f) {
                var rc  = RARITY_COLS[f.rarity] || '#888';
                var rn  = (typeof Fish !== 'undefined' && Fish.RARITIES && Fish.RARITIES[f.rarity]) ? Fish.RARITIES[f.rarity].name : f.rarity;
                var sp  = (typeof Fish !== 'undefined' && Fish.SPECIES && Fish.SPECIES[f.species]) ? Fish.SPECIES[f.species].name : f.species;
                var sts = f.stats || { strength:50, cunning:50, size_potential:50, health:50 };
                html += '<div class="breed-parent-card" style="border-top:3px solid ' + rc + ';">';
                // Coloured banner
                html += '<div class="breed-parent-banner" style="background:linear-gradient(135deg,'+rc+'44,'+rc+'18);">';
                html += '<div class="breed-parent-banner-label">';
                html += '<span class="breed-parent-card-label" style="color:' + rc + ';">Parent ' + (idx+1) + '</span>';
                html += '<span class="breed-parent-rarity" style="background:'+rc+'33;color:'+rc+';border:1px solid '+rc+'55;">'+rn+'</span>';
                html += '</div>';
                html += '<span style="font-size:2.5rem;opacity:0.85;">\uD83D\uDC1F</span>';
                html += '</div>';
                // Body
                html += '<div class="breed-parent-body">';
                html += '<div class="breed-parent-name">' + f.name + '</div>';
                html += '<div class="breed-parent-species">' + sp + ' \u00B7 ' + (typeof UI !== 'undefined' ? UI.formatWeight(f.weight_oz) : f.weight_oz + 'oz') + ' \u00B7 ' + f.growth_stage + '</div>';
                // Extra info row: age + value
                var fishVal = (typeof Fish !== 'undefined') ? UI.formatMoney(Fish.getFishValue(f)) : '';
                html += '<div class="breed-parent-extra">';
                html += '<span>\uD83D\uDCC5 ' + f.age_days + ' days old</span>';
                html += '<span style="color:var(--colour-gold);">\uD83D\uDCB7 ' + fishVal + '</span>';
                html += '</div>';
                var statDefs = [
                    { label:'Strength',      val: sts.strength,       col:'#e74c3c' },
                    { label:'Cunning',       val: sts.cunning,        col:'#3498db' },
                    { label:'Size Potential',val: sts.size_potential, col:'#2ecc71' },
                    { label:'Health',        val: sts.health,         col: sts.health>=70?'#2ecc71':sts.health>=40?'#d4a843':'#e74c3c' }
                ];
                html += '<div class="breed-parent-stats">';
                statDefs.forEach(function(st) {
                    html += '<div class="breed-stat-row"><span class="breed-stat-label">' + st.label + '</span><div class="breed-stat-track"><div class="breed-stat-fill" style="width:' + Math.max(3,Math.min(100,st.val)) + '%;background:' + st.col + ';"></div></div><span class="breed-stat-val" style="color:' + st.col + ';">' + st.val + '</span></div>';
                });
                html += '</div>';
                if (f.personality_traits && f.personality_traits.length) {
                    html += '<div class="breed-parent-traits">';
                    f.personality_traits.slice(0,3).forEach(function(t){
                        var td = (typeof Fish !== 'undefined' && Fish.TRAIT_DEFINITIONS) ? Fish.TRAIT_DEFINITIONS[t] : null;
                        var tc = td ? td.colour : '#4a9c6d';
                        html += '<span class="trait-badge" style="border-color:'+tc+';color:'+tc+';">'+t+'</span>';
                    });
                    html += '</div>';
                }
                html += '</div>'; // breed-parent-body
                html += '</div>'; // breed-parent-card
            } else {
                html += '<div class="breed-parent-card breed-parent-placeholder">';
                html += '<div class="breed-parent-card-header" style="background:rgba(255,255,255,0.03);"><span class="breed-parent-card-label" style="color:var(--colour-text-muted);">Parent '+(idx+1)+'</span></div>';
                html += '<div class="breed-placeholder-body"><div class="breed-placeholder-fish">\uD83D\uDC1F</div><div class="breed-placeholder-label">Awaiting selection</div>';
                ['Strength','Cunning','Size Potential','Health'].forEach(function(lbl){ html += '<div class="breed-stat-row"><span class="breed-stat-label">'+lbl+'</span><div class="breed-stat-track" style="opacity:0.15;"><div class="breed-stat-fill" style="width:50%;background:#888;"></div></div><span class="breed-stat-val" style="color:#444;">\u2014</span></div>'; });
                html += '</div></div>';
            }
        });

            // 3rd card: Trait inheritance + mutation chances
            var allTraits   = [];
            console.log('renderBreedingPond crash', p1, p2, isActive, s.breedingPond);
            [p1, p2].forEach(function(p){ (p && p.personality_traits || []).forEach(function(t){ if (allTraits.indexOf(t)===-1) allTraits.push(t); }); });
            var inheritPct  = allTraits.length > 0 ? Math.round(70 / allTraits.length * 10) / 10 : 0; // each trait shared across offspring
            var mutationPct = 20; // base mutation chance for a new random trait
            var positivePct = 60; // of mutations, % that are positive
            html += '<div class="breed-parent-card'+(isActive?'':' breed-parent-placeholder')+'" style="border-top:3px solid var(--colour-border);">';
            html += '<div class="breed-parent-card-header" style="background:rgba(255,255,255,0.04);">';
            html += '<span class="breed-parent-card-label">\u2728 Trait Odds</span>';
            html += '</div>';
            html += '<div style="padding:0.6rem 0.65rem;'+(isActive?'':'opacity:0.3;')+'">';

            // Mutation chance
            html += '<div class="breed-trait-section-title">Mutation</div>';
            html += '<div class="breed-odds-row">';
            html += '<span class="breed-odds-label" style="color:#e67e22;">New Trait</span>';
            html += '<div class="breed-stat-track" style="margin:0 0.4rem;"><div class="breed-stat-fill" style="width:'+mutationPct+'%;background:#e67e22;"></div></div>';
            html += '<span class="breed-odds-pct" style="color:#e67e22;">'+mutationPct+'%</span>';
            html += '</div>';
            html += '<div class="breed-odds-row">';
            html += '<span class="breed-odds-label" style="color:#2ecc71;">Positive</span>';
            html += '<div class="breed-stat-track" style="margin:0 0.4rem;"><div class="breed-stat-fill" style="width:'+positivePct+'%;background:#2ecc71;"></div></div>';
            html += '<span class="breed-odds-pct" style="color:#2ecc71;">'+positivePct+'%</span>';
            html += '</div>';
            html += '<div class="breed-odds-row">';
            html += '<span class="breed-odds-label" style="color:#e74c3c;">Negative</span>';
            html += '<div class="breed-stat-track" style="margin:0 0.4rem;"><div class="breed-stat-fill" style="width:'+(100-positivePct)+'%;background:#e74c3c;"></div></div>';
            html += '<span class="breed-odds-pct" style="color:#e74c3c;">'+(100-positivePct)+'%</span>';
            html += '</div>';

            // Inheritable traits
            if (allTraits.length > 0) {
                html += '<div class="breed-trait-section-title" style="margin-top:0.55rem;">Inheritable Traits</div>';
                allTraits.forEach(function(t) {
                    var td  = (typeof Fish !== 'undefined' && Fish.TRAIT_DEFINITIONS) ? Fish.TRAIT_DEFINITIONS[t] : null;
                    var col = td ? td.colour : '#4a9c6d';
                    var fromBoth = ((p1&&p1.personality_traits||[]).indexOf(t) !== -1) && ((p2&&p2.personality_traits||[]).indexOf(t) !== -1);
                    var pct2 = fromBoth ? Math.min(90, Math.round(inheritPct * 1.6)) : Math.round(inheritPct);
                    html += '<div class="breed-odds-row">';
                    html += '<span class="breed-odds-label" style="color:'+col+';font-size:0.62rem;">'+t+(fromBoth?' \u2605':'')+'</span>';
                    html += '<div class="breed-stat-track" style="margin:0 0.4rem;"><div class="breed-stat-fill" style="width:'+pct2+'%;background:'+col+'66;border:none;"></div></div>';
                    html += '<span class="breed-odds-pct" style="color:'+col+';">'+pct2+'%</span>';
                    html += '</div>';
                });
            } else {
                html += '<p style="font-size:0.68rem;color:var(--colour-text-muted);margin-top:0.5rem;">No inherited traits — all offspring traits will be from mutation.</p>';
            }
            html += '</div></div>';

            html += '</div>'; // breed-parent-cards
            html += '</div>'; // breed-active-wrap

        // ── Two-column: Last Outcome + Rarity Odds ────────────────────────────
        html += '<div class="breed-two-col">';

        // Last outcome
        html += '<div class="breed-outcome-banner">';
        html += '<div class="breed-outcome-header"><span class="breed-outcome-title">\uD83E\uDD5A Last Outcome</span>';
        if (lbo) html += '<span class="breed-outcome-day">Day ' + lbo.day + '</span>';
        html += '</div>';
        if (!lbo) {
            html += '<p class="empty-state" style="margin:0.5rem 0;">No cycles completed yet.</p>';
        } else {
            html += '<p style="font-size:0.78rem;color:var(--colour-text-muted);margin:0.3rem 0;">' + lbo.parent1.name + ' \u00D7 ' + lbo.parent2.name + '</p>';
            if (!lbo.offspring || !lbo.offspring.length) {
                html += '<p style="font-size:0.8rem;color:var(--colour-text-muted);">No offspring — lake was full.</p>';
            } else {
                html += '<div class="breed-outcome-fish">';
                lbo.offspring.forEach(function(o){
                    var col = RARITY_COLS[o.rarity]||'#888';
                    html += '<div class="breed-outcome-fish-card" style="border-color:'+col+';">';
                    html += '<span style="color:'+col+';font-size:0.68rem;font-weight:700;">'+(o.rarity.charAt(0).toUpperCase()+o.rarity.slice(1))+'</span>';
                    html += '<span style="font-size:0.78rem;font-weight:600;">'+o.name+'</span>';
                    html += '<span style="font-size:0.68rem;color:var(--colour-text-muted);">'+o.species+'</span>';
                    html += '</div>';
                });
                html += '</div>';
            }
        }
        html += '</div>';

        // Rarity odds (if active or waiting with a pair)
        html += '<div class="breed-outcome-banner">';
        html += '<div class="breed-outcome-header"><span class="breed-outcome-title">\uD83C\uDFB2 Rarity Odds</span></div>';
        var displayPair = (s.breedingActive && s.breedingPond && s.breedingPond.length === 2) ? s.breedingPond : null;
        if (!displayPair && lbo) displayPair = [{rarity: lbo.parent1.rarity},{rarity: lbo.parent2.rarity}];
        if (!displayPair) {
            html += '<p class="empty-state" style="margin:0.5rem 0;">Select parents to see odds.</p>';
        } else {
            var boost2 = scientistRarityBonus();
            var avg2 = (RARITY_ORDER.indexOf(displayPair[0].rarity) + RARITY_ORDER.indexOf(displayPair[1].rarity)) / 2;
            var raw2 = { common: Math.max(2,50-avg2*12-boost2*0.6), uncommon:30+avg2*2+boost2*0.25, rare:13+avg2*4+boost2*0.25, epic:5+avg2*4+boost2*0.20, legendary:2+avg2*3+boost2*0.20, mythic:0.5+avg2+boost2*0.10 };
            var tot2 = Object.keys(raw2).reduce(function(t,k){ return t+raw2[k]; },0);
            ['mythic','legendary','epic','rare','uncommon','common'].forEach(function(r){
                var pct = Math.round((raw2[r]/tot2)*100); if (!pct) return;
                var col = RARITY_COLS[r]||'#888';
                html += '<div class="sci-bar-row"><span class="sci-bar-dot" style="background:'+col+';"></span>';
                html += '<span class="sci-bar-label">'+(r.charAt(0).toUpperCase()+r.slice(1))+'</span>';
                html += '<div class="sci-bar-track"><div class="sci-bar-fill" style="width:'+pct+'%;background:'+col+';"></div></div>';
                html += '<span class="sci-bar-pct">'+pct+'%</span></div>';
            });
        }
        html += '</div>';
        html += '</div>'; // breed-two-col

        // ── Fish Stock ────────────────────────────────────────────────────────
        var allFish = s.fish.filter(function(f){ return f.alive; })
            .sort(function(a,b){ return RARITY_ORDER.indexOf(b.rarity)-RARITY_ORDER.indexOf(a.rarity); });
        var yr2 = Math.ceil(s.day / 365);
        var inPond = (s.breedingPond||[]).filter(Boolean).map(function(f){ return f.id; });

        html += '<h3 class="section-heading" style="margin-top:1.25rem;">\uD83D\uDC1F Fish Stock</h3>';
        if (!allFish.length) {
            html += '<p class="empty-state">No fish in stock.</p>';
        } else {
            html += '<div class="fish-stock-table">';
            html += '<div class="fish-stock-header"><span>Name</span><span>Species</span><span>Rarity</span><span>Stage</span><span>Weight</span><span>Value</span><span>Status</span><span></span></div>';
            html += '<div class="fish-stock-body">';
            allFish.forEach(function(f){
                var rc  = RARITY_COLS[f.rarity]||'#888';
                var sp  = (typeof Fish!=='undefined'&&Fish.SPECIES[f.species]) ? Fish.SPECIES[f.species].name : f.species;
                var rn  = (typeof Fish!=='undefined'&&Fish.RARITIES[f.rarity]) ? Fish.RARITIES[f.rarity].name : f.rarity;
                var bred = f.lastBreedYear && f.lastBreedYear >= yr2;
                var inP  = inPond.indexOf(f.id) !== -1;
                var notReady = f.growth_stage === 'Fry' || f.growth_stage === 'Juvenile' || f.weight_oz <= 160;
                var val  = (typeof Fish !== 'undefined') ? UI.formatMoney(Fish.getFishValue(f)) : '';
                var status = inP ? '<span style="color:#3498db;">In Pond</span>'
                           : bred ? '<span style="color:var(--colour-text-muted);">Bred Y'+f.lastBreedYear+'</span>'
                           : notReady ? '<span style="color:#aaa;">Not Ready</span>'
                           : '<span style="color:var(--colour-accent);">\u2713 Eligible</span>';
                var canSell = !inP && (typeof Fish !== 'undefined');
                html += '<div class="fish-stock-row">';
                html += '<span class="fish-stock-name">'+f.name+'</span>';
                html += '<span>'+sp+'</span>';
                html += '<span style="color:'+rc+';font-weight:700;">'+rn+'</span>';
                html += '<span>'+f.growth_stage+'</span>';
                html += '<span>'+((typeof UI!=='undefined')?UI.formatWeight(f.weight_oz):f.weight_oz+'oz')+'</span>';
                html += '<span style="color:var(--colour-gold);font-weight:700;">'+val+'</span>';
                html += '<span>'+status+'</span>';
                html += '<span>' + (canSell ? '<button class="btn btn-danger btn-sm" onclick="Breeding.sellFish('+f.id+')">Sell</button>' : '') + '</span>';
                html += '</div>';
            });
            html += '</div>';
        }

        container.innerHTML = html;
    }

    // ── Public API ────────────────────────────────────────────────────────────
    return { initState, processDailyBreeding, renderBreedingPond, sellFish };
})();
