/**
 * Carp Fishing Tycoon — Staff System (rebuilt)
 */
'use strict';

const Staff = (function () {

    // ── Data ──────────────────────────────────────────────────────────────────
    const POOL = [
        { id:1,  name:'Gary Stokes',         role:'assistant',     salary:35,  hire:400,  traits:['efficient'],              budget:0,   bio:'Keeps the fishery running smoothly. Anglers arrive happier.' },
        { id:2,  name:'Claire Atkins',        role:'assistant',     salary:30,  hire:300,  traits:['enthusiastic'],           budget:0,   bio:'Her energy is infectious. Anglers always leave with a smile.' },
        { id:3,  name:'Sean Murphy',          role:'assistant',     salary:20,  hire:150,  traits:['lazy'],                   budget:0,   bio:'He\'s there if you need him. Barely.' },
        { id:4,  name:'Debbie Foxwell',       role:'assistant',     salary:45,  hire:600,  traits:['thorough'],               budget:0,   bio:'Meticulously organises every visit. Satisfaction scores are higher.' },
        { id:5,  name:'Nicky Pearce',         role:'assistant',     salary:40,  hire:500,  traits:['experienced'],            budget:0,   bio:'Fifteen years in fishery management. Brings in more regulars.' },
        { id:6,  name:'Bill Thornton',        role:'manager',       salary:65,  hire:800,  traits:['experienced','efficient'],budget:0,   bio:'Veteran lake manager with decades of experience.' },
        { id:7,  name:'Margaret Cosgrove',    role:'manager',       salary:55,  hire:700,  traits:['enthusiastic'],           budget:0,   bio:'Keeps anglers happy and the lakeside immaculate.' },
        { id:8,  name:'Pete Weston',          role:'manager',       salary:50,  hire:600,  traits:['grumpy','efficient'],     budget:0,   bio:'Difficult to work with, but runs a tight ship.' },
        { id:9,  name:'Donna Hale',           role:'manager',       salary:60,  hire:750,  traits:['dedicated'],              budget:0,   bio:'Never calls in sick. The most dependable manager you\'ll find.' },
        { id:10, name:'Jim Larkin',           role:'keeper',        salary:75,  hire:900,  traits:['thorough'],               budget:0,   bio:'Obsessively monitors fish health. Your stock will thrive.' },
        { id:11, name:'Susan Fletcher',       role:'keeper',        salary:70,  hire:850,  traits:['experienced','enthusiastic'],budget:0,bio:'Passionate about carp biology. Fish grow faster under her care.' },
        { id:12, name:'Rob Haines',           role:'keeper',        salary:45,  hire:500,  traits:['lazy'],                   budget:0,   bio:'Knows his stuff but needs chasing. Budget option.' },
        { id:13, name:'Dave Barker',          role:'guard',         salary:55,  hire:650,  traits:['dedicated','efficient'],  budget:0,   bio:'Ex-police. Nothing gets past him. Absolutely reliable.' },
        { id:14, name:'Alan Morse',           role:'guard',         salary:40,  hire:450,  traits:['grumpy'],                 budget:0,   bio:'Intimidating presence deters poachers.' },
        { id:15, name:'Terry Banks',          role:'guard',         salary:50,  hire:600,  traits:['experienced'],            budget:0,   bio:'Twenty years of site security. Knows all the tricks.' },
        { id:16, name:'Yvonne Blatchford',    role:'groundskeeper', salary:45,  hire:500,  traits:['enthusiastic','thorough'],budget:0,   bio:'Transforms the lakeside. Anglers love the atmosphere she creates.' },
        { id:17, name:'Colin Shepherd',       role:'groundskeeper', salary:40,  hire:450,  traits:['experienced'],            budget:0,   bio:'Expert in aquatic plants. Biodiversity improves noticeably.' },
        { id:18, name:'Ray Prescott',         role:'groundskeeper', salary:25,  hire:250,  traits:['lazy'],                   budget:0,   bio:'Does the bare minimum. Grounds are tidy but nothing special.' },
        { id:19, name:'Fiona Draper',         role:'groundskeeper', salary:42,  hire:480,  traits:['efficient'],              budget:0,   bio:'Gets twice as much done in half the time. Very cost-effective.' },
        { id:20, name:'Keith Oldham',         role:'groundskeeper', salary:38,  hire:420,  traits:['dedicated'],              budget:0,   bio:'Quietly devoted to the job. Never cuts corners.' },
        { id:21, name:'Dr. Helen Marsh',      role:'scientist',     salary:90,  hire:1200, traits:['thorough','experienced'], budget:0,   bio:'PhD in aquaculture genetics. Dramatically improves rarity outcomes.' },
        { id:22, name:'Prof. Alan Croft',     role:'scientist',     salary:80,  hire:1000, traits:['experienced'],            budget:0,   bio:'Retired university professor. Deep knowledge of carp genetics.' },
        { id:23, name:'Samantha Voss',        role:'scientist',     salary:60,  hire:700,  traits:['enthusiastic'],           budget:0,   bio:'Young researcher brimming with ideas. Fresh technique.' },
        { id:24, name:'Dr. Raj Patel',        role:'scientist',     salary:75,  hire:900,  traits:['efficient','thorough'],   budget:0,   bio:'Specialist in selective breeding. Cycles are faster under his watch.' },
        { id:25, name:'Wendy Barlow',         role:'scientist',     salary:50,  hire:550,  traits:['dedicated'],              budget:0,   bio:'Self-taught geneticist with 20 years of hands-on experience.' },
        { id:26, name:'Priya Sharma',         role:'marketer',      salary:55,  hire:700,  traits:['enthusiastic','efficient'],budget:300, bio:'Digital marketing specialist. Campaigns get results fast.' },
        { id:27, name:'Marcus Webb',          role:'marketer',      salary:50,  hire:600,  traits:['experienced'],            budget:250, bio:'Former fishing magazine editor. Newspaper campaigns are exceptional.' },
        { id:28, name:'Jade Holloway',        role:'marketer',      salary:40,  hire:400,  traits:['enthusiastic'],           budget:200, bio:'Social media expert. Great at generating online buzz.' },
        { id:29, name:'Tom Briscoe',          role:'marketer',      salary:45,  hire:500,  traits:['dedicated'],              budget:220, bio:'Consistent and reliable. Never lets a budget go unspent.' },
        { id:30, name:'Zoe Carmichael',       role:'marketer',      salary:65,  hire:800,  traits:['efficient','thorough'],   budget:400, bio:'Strategic marketer who picks the highest-ROI campaigns.' }
    ];

    const ROLES = {
        assistant:     { name:'Fishing Assistant',   emoji:'\uD83D\uDCCB', colour:'#2a7a6a', desc:'Boosts daily booking volume and angler satisfaction.' },
        manager:       { name:'Lake Manager',         emoji:'\uD83C\uDFE0', colour:'#2ecc71', desc:'Boosts angler satisfaction and cuts disaster chance.' },
        keeper:        { name:'Head Keeper',          emoji:'\uD83D\uDC1F', colour:'#9b59b6', desc:'Restores fish health daily and improves growth.' },
        guard:         { name:'Security Guard',       emoji:'\uD83D\uDEE1\uFE0F', colour:'#e67e22', desc:'Significantly reduces disaster probability.' },
        groundskeeper: { name:'Groundskeeper',        emoji:'\uD83C\uDF3F', colour:'#1abc9c', desc:'Raises the effective biodiversity score.' },
        scientist:     { name:'Breeding Scientist',   emoji:'\uD83D\uDD2C', colour:'#e74c3c', desc:'Boosts offspring rarity and provides genetic analysis.' },
        marketer:      { name:'Marketing Manager',    emoji:'\uD83D\uDCE3', colour:'#8e44ad', desc:'Auto-launches marketing campaigns from a daily budget.' }
    };

    const TRAITS = {
        efficient:    { emoji:'\u26A1', name:'Efficient',    desc:'20% more effective.' },
        lazy:         { emoji:'\uD83D\uDE34',name:'Lazy',    desc:'15% less effective.' },
        experienced:  { emoji:'\uD83C\uDF93',name:'Experienced',desc:'Happiness decays slower.' },
        enthusiastic: { emoji:'\uD83D\uDE04',name:'Enthusiastic',desc:'+3 happiness/day.' },
        grumpy:       { emoji:'\uD83D\uDE20',name:'Grumpy',  desc:'-3 happiness/day.' },
        dedicated:    { emoji:'\uD83D\uDCAA',name:'Dedicated',desc:'Never quits.' },
        thorough:     { emoji:'\uD83D\uDD0D',name:'Thorough',desc:'Role effectiveness doubled.' }
    };

    const SLOTS = [
        {role:'assistant',     count:1},
        {role:'manager',       count:1},
        {role:'keeper',        count:1},
        {role:'guard',         count:1},
        {role:'groundskeeper', count:1},
        {role:'scientist',     count:1},
        {role:'marketer',      count:1}
    ];

    const REFRESH_DAYS = 3;
    const PER_ROLE     = 3;  // applicants shown per role


    // ── State ─────────────────────────────────────────────────────────────────
    function initState() {
        var s = Game.getState();
        if (!s.hiredStaff)          s.hiredStaff          = [];
        if (!s.availableStaffIds)   s.availableStaffIds   = [];
        if (!s.nextStaffRefreshDay) s.nextStaffRefreshDay  = s.day + REFRESH_DAYS;
        if (s.nextStaffInstanceId  === undefined) s.nextStaffInstanceId  = 1;
        if (!s.availableStaffIds.length) refreshPool();
    }

    function refreshPool() {
        var s     = Game.getState();
        var taken = s.hiredStaff.map(function(m){ return m.poolId; });
        var ids   = [];
        // Pick up to PER_ROLE unhired candidates per role
        var roles = SLOTS.map(function(sl){ return sl.role; });
        roles.forEach(function(role) {
            var candidates = POOL.filter(function(p){ return p.role === role && taken.indexOf(p.id) === -1; });
            var shuffled   = candidates.slice().sort(function(){ return Math.random() - 0.5; });
            shuffled.slice(0, PER_ROLE).forEach(function(p){ ids.push(p.id); });
        });
        s.availableStaffIds   = ids;
        s.nextStaffRefreshDay = s.day + REFRESH_DAYS;
    }

    function getPoolById(id) {
        return POOL.find(function(p){ return p.id === id; }) || null;
    }

    function effectiveness(m) {
        var mult = 1.0;
        if (m.traits.indexOf('efficient') !== -1) mult *= 1.20;
        if (m.traits.indexOf('lazy')      !== -1) mult *= 0.85;
        if (m.traits.indexOf('thorough')  !== -1) mult *= 2.00;
        return mult * (0.5 + (m.happiness||70) / 200);
    }

    // ── Hire / Fire ───────────────────────────────────────────────────────────
    function isRoleFilled(role) {
        initState();
        var s = Game.getState();
        return s.hiredStaff.some(function(m){ return m.role === role; });
    }

    function hireStaff(poolId) {
        initState();
        var s   = Game.getState();
        var def = getPoolById(poolId);
        if (!def) return;
        if (isRoleFilled(def.role)) {
            UI.showToast('Release the current ' + (ROLES[def.role]||{name:def.role}).name + ' first.','warning');
            renderStaff();
            return;
        }
        if (!Game.spendMoney(def.hire)) { UI.showToast('Not enough money.','error'); return; }
        s.hiredStaff.push({
            instanceId: s.nextStaffInstanceId++,
            poolId: def.id, name: def.name, role: def.role,
            salary: def.salary, traits: def.traits.slice(),
            happiness: 80, assignedLakeId: null, hiredDay: s.day,
            marketingBudget: def.budget || 0, marketingPool: 0
        });
        s.availableStaffIds = s.availableStaffIds.filter(function(id){ return id !== poolId; });
        Game.saveToStorage();
        UI.showToast(def.name + ' hired!', 'success');
        Game.addNotification('\uD83D\uDC64 ' + def.name + ' joined as ' + (ROLES[def.role]||{name:def.role}).name + '.');
        renderStaff();
        UI.renderTopBar();
    }

    function fireStaff(instanceId) {
        initState();
        var s   = Game.getState();
        var idx = s.hiredStaff.findIndex(function(m){ return m.instanceId === instanceId; });
        if (idx === -1) return;
        var m = s.hiredStaff.splice(idx, 1)[0];
        Game.saveToStorage();
        UI.showToast(m.name + ' has left.', 'warning');
        renderStaff();
    }

    function assignToLake(instanceId, lakeId) {
        var s = Game.getState();
        var m = s.hiredStaff.find(function(x){ return x.instanceId === instanceId; });
        if (m) { m.assignedLakeId = lakeId || null; Game.saveToStorage(); renderStaff(); }
    }

    function setMarketingBudget(instanceId, val) {
        var s = Game.getState();
        var m = s.hiredStaff.find(function(x){ return x.instanceId === instanceId; });
        if (m) { m.marketingBudget = Math.max(0, Math.min(1000, parseInt(val)||0)); Game.saveToStorage(); renderStaff(); }
    }


    function setMarketingBudget(instanceId, val) {
        var s = Game.getState();
        var m = s.hiredStaff.find(function(x){ return x.instanceId === instanceId; });
        if (m) { m.marketingBudget = Math.max(0, Math.min(1000, parseInt(val)||0)); Game.saveToStorage(); renderStaff(); }
    }

    // ── Daily processing ─────────────────────────────────────────────────────
    function processStaff() {
        initState();
        var s = Game.getState();
        if (s.day >= (s.nextStaffRefreshDay||0)) refreshPool();
        if (!s.hiredStaff.length) return;

        var toFire = [];
        s.hiredStaff.forEach(function(m) {
            // Salary
            s.money      = Math.max(0, s.money - m.salary);
            s.totalSpent = (s.totalSpent||0) + m.salary;

            // Happiness
            var d = -1 + 2; // grind offset + salary paid
            if (m.traits.indexOf('enthusiastic') !== -1) d += 3;
            if (m.traits.indexOf('grumpy')        !== -1) d -= 3;
            if (m.traits.indexOf('experienced')   !== -1) d = Math.round(d * 0.5);
            if (s.money <= 0) d -= 4;
            m.happiness = Math.max(0, Math.min(100, (m.happiness||70) + d));

            // Quit check
            if (m.happiness < 20 && m.traits.indexOf('dedicated') === -1 && Math.random() < 0.15) {
                toFire.push(m.instanceId);
                Game.addNotification('\uD83D\uDC64 ' + m.name + ' resigned due to low morale!');
                return;
            }

            var eff = effectiveness(m);

            // Role effects
            if (m.role === 'keeper') {
                var heal = Math.max(1, Math.round(3 * eff));
                s.fish.forEach(function(f){ if (f.alive) f.stats.health = Math.min(100, f.stats.health + heal); });
            }

            // Marketer: accumulate pool and silently launch campaign
            if (m.role === 'marketer') {
                if (!m.marketingPool) m.marketingPool = 0;
                m.marketingPool += (m.marketingBudget || 0);
                var mktTypes = (typeof Finance !== 'undefined' && Finance.getMarketingTypes) ? Finance.getMarketingTypes() : [];
                var affordable = mktTypes.filter(function(c){ return c.cost <= m.marketingPool && s.money >= c.cost; });
                if (affordable.length) {
                    var effMult = m.traits.indexOf('thorough') !== -1 ? 1.4 : m.traits.indexOf('efficient') !== -1 ? 1.2 : 1.0;
                    affordable.sort(function(a,b){ return (b.bookingMod*b.duration*effMult)-(a.bookingMod*a.duration*effMult); });
                    var pick = affordable[0];
                    if (typeof Finance !== 'undefined' && Finance.launchCampaignSilent) {
                        if (Finance.launchCampaignSilent(pick.id)) {
                            m.marketingPool = Math.max(0, m.marketingPool - pick.cost);
                            Game.addNotification('\uD83D\uDCE3 ' + m.name + ' launched "' + pick.name + '".');
                        }
                    }
                }
            }
        });
        toFire.forEach(function(id) {
            var idx = s.hiredStaff.findIndex(function(m){ return m.instanceId === id; });
            if (idx !== -1) s.hiredStaff.splice(idx, 1);
        });
    }

    // ── Query helpers (used by other modules) ─────────────────────────────────
    function getHiredByRole(role) {
        var s = Game.getState();
        return (s.hiredStaff||[]).filter(function(m){ return m.role === role; });
    }
    function getBestScientist() {
        var list = getHiredByRole('scientist');
        return list.length ? list.sort(function(a,b){ return effectiveness(b)-effectiveness(a); })[0] : null;
    }
    function getAssistantBookingBonus() {
        return getHiredByRole('assistant').reduce(function(s,m){ return s + Math.round(2*effectiveness(m)); }, 0);
    }
    function getAssistantAcceptanceRate() {
        return Math.min(0.95, 0.5 + getHiredByRole('assistant').length * 0.1);
    }
    function getAssistantSatisfactionBonus() {
        return getHiredByRole('assistant').reduce(function(s,m){ return s + Math.round(3*effectiveness(m)); }, 0);
    }
    function getScientistRarityBonus() {
        var sci = getBestScientist(); if (!sci) return 0;
        return Math.round(12 * effectiveness(sci));
    }
    function getScientistDurationMod() {
        var sci = getBestScientist(); if (!sci) return 0;
        return effectiveness(sci) >= 0.9 ? -1 : 0;
    }
    function getDisasterModifier(lakeId) {
        var s = Game.getState(); var mod = 1.0;
        (s.hiredStaff||[]).forEach(function(m){
            if (m.role === 'guard' && m.assignedLakeId !== lakeId) return;
            var e = effectiveness(m);
            if (m.role === 'manager') mod *= (1 - Math.min(0.50, 0.25*e));
            if (m.role === 'guard')   mod *= (1 - Math.min(0.65, 0.40*e));
        });
        return mod;
    }
    function getLakeManagerSatisfactionBonus(lakeId) {
        var s = Game.getState(); var b = 0;
        (s.hiredStaff||[]).forEach(function(m){
            if (m.role === 'manager') b += Math.round(5*effectiveness(m));
        });
        return b;
    }
    function getLakeBiodiversityBonus(lakeId) {
        var s = Game.getState(); var b = 0;
        (s.hiredStaff||[]).forEach(function(m){
            if (m.role === 'groundskeeper' && m.assignedLakeId === lakeId) b += Math.max(1, Math.round(1*effectiveness(m)));
        });
        return b;
    }


    // ── Render helpers ────────────────────────────────────────────────────────
    function roleBadge(role) {
        var r = ROLES[role]||{}; if (!r.name) return '';
        return '<span class="staff-role-badge" style="background:'+r.colour+'20;color:'+r.colour+';border-color:'+r.colour+';">'+r.emoji+' '+r.name+'</span>';
    }
    function traitBadges(traits) {
        return (traits||[]).map(function(t){ var d=TRAITS[t]||{}; return d.name?'<span class="staff-trait-badge" title="'+(d.desc||'')+'">'+d.emoji+' '+d.name+'</span>':''; }).join('');
    }
    function happinessBar(h) {
        var col = h>=60?'#2ecc71':h>=30?'#f39c12':'#e74c3c';
        var lbl = h>=60?'Happy':h>=30?'OK':'Unhappy';
        return '<div class="staff-happiness-row"><span class="staff-happiness-label-text">Morale</span><div class="staff-happiness-track"><div class="staff-happiness-fill" style="width:'+h+'%;background:'+col+'"></div></div><span class="staff-happiness-value" style="color:'+col+'">'+h+'% '+lbl+'</span></div>';
    }
    function lakeDropdown(instanceId, assigned) {
        var s = Game.getState();
        var html = '<select class="staff-lake-select" onchange="Staff.assignToLake('+instanceId+', this.value||null)">';
        html += '<option value=""'+(assigned?'':' selected')+'>— No lake —</option>';
        (s.ownedLakes||[]).forEach(function(lid){
            var lake = (typeof Lakes!=='undefined') ? Lakes.getLakeById(lid) : null;
            if (!lake) return;
            html += '<option value="'+lid+'"'+(assigned===lid?' selected':'')+'>'+lake.name+'</option>';
        });
        return html+'</select>';
    }

    // ── Interview modal ───────────────────────────────────────────────────────
    function interviewStaff(poolId) {
        var s   = Game.getState();
        var def = getPoolById(poolId); if (!def) return;
        var r   = ROLES[def.role]||{};
        var can = s.money >= def.hire;
        var html = '<div style="display:flex;flex-direction:column;gap:0.75rem;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid '+(r.colour||'#888')+';padding-bottom:0.75rem;">';
        html += '<div><div style="font-size:2rem;">'+(r.emoji||'\uD83D\uDC64')+'</div>';
        html += '<div style="font-size:1.1rem;font-weight:800;color:var(--colour-text);">'+def.name+'</div>';
        html += roleBadge(def.role)+'</div>';
        html += '<div style="text-align:right;display:flex;flex-direction:column;gap:0.3rem;">';
        html += '<div><span style="font-size:0.62rem;color:var(--colour-text-muted);text-transform:uppercase;">Hire Fee</span><br><strong style="color:var(--colour-gold);">'+UI.formatMoney(def.hire)+'</strong></div>';
        html += '<div><span style="font-size:0.62rem;color:var(--colour-text-muted);text-transform:uppercase;">Salary</span><br><strong style="color:var(--colour-gold);">'+UI.formatMoney(def.salary)+'/day</strong></div>';
        if (def.budget>0) html += '<div><span style="font-size:0.62rem;color:var(--colour-text-muted);text-transform:uppercase;">Mkt Budget</span><br><strong style="color:#8e44ad;">'+UI.formatMoney(def.budget)+'/day</strong></div>';
        html += '</div></div>';
        html += '<div>'+traitBadges(def.traits)+'</div>';
        html += '<p style="font-size:0.8rem;color:var(--colour-text-muted);">'+def.bio+'</p>';
        html += '<p style="font-size:0.75rem;color:var(--colour-text-muted);">'+(r.desc||'')+'</p>';
        html += can && !isRoleFilled(def.role)
            ? '<button class="btn btn-primary" onclick="Staff.hireStaff('+poolId+');UI.hideModal();">Hire Me</button>'
            : '<button class="btn btn-secondary" disabled>Can\'t Hire</button>';
        html += '</div>';
        UI.showModal(html);
    }


    // ── Render ────────────────────────────────────────────────────────────────
    function renderStaff() {
        var container = document.getElementById('panel-staff');
        if (!container) return;
        initState();
        var s = Game.getState();
        var dtr = Math.max(0, (s.nextStaffRefreshDay||0) - s.day);
        var totalSalary = s.hiredStaff.reduce(function(t,m){ return t+m.salary; }, 0);

        // Map hired by role
        var byRole = {};
        s.hiredStaff.forEach(function(m){
            if (!byRole[m.role]) byRole[m.role] = [];
            byRole[m.role].push(m);
        });

        var html = '<h2>Staff</h2>';
        html += '<h3 class="section-heading">Your Team';
        if (totalSalary > 0) html += ' <span class="staff-count-badge">'+s.hiredStaff.length+' hired &mdash; '+UI.formatMoney(totalSalary)+'/day</span>';
        html += '</h3>';

        html += '<div class="staff-hire-group staff-your-team-group">';
        html += '<div class="staff-slots-grid">';
        SLOTS.forEach(function(slotDef) {
            var rd     = ROLES[slotDef.role] || {};
            var filled = byRole[slotDef.role] || [];
            for (var i = 0; i < slotDef.count; i++) {
                var m = filled[i] || null;
                if (m) {
                    var eff       = Math.round(effectiveness(m) * 100);
                    var happVal   = m.happiness || 70;
                    var happCol   = happVal >= 60 ? '#2ecc71' : happVal >= 30 ? '#f39c12' : '#e74c3c';
                    var rc        = rd.colour || '#888';
                    html += '<div class="staff-slot staff-slot-filled" style="border-top:3px solid '+rc+';">';

                    // ── Coloured banner (mirrors breed-parent-banner) ──────────
                    html += '<div class="breed-parent-banner" style="background:linear-gradient(135deg,'+rc+'33,'+rc+'11);">';
                    html += '<div class="breed-parent-banner-label">';
                    html += '<span class="staff-slot-role-label" style="color:'+rc+';">'+(rd.name||m.role)+'</span>';
                    html += '<span style="background:'+rc+'22;color:'+rc+';border:1px solid '+rc+'44;font-size:0.6rem;font-weight:700;padding:0.1rem 0.4rem;border-radius:8px;">⚡ '+eff+'%</span>';
                    html += '</div>';
                    html += '<span style="font-size:1.5rem;">'+(rd.emoji||'👤')+'</span>';
                    html += '</div>';

                    // ── Body (mirrors breed-parent-body) ──────────────────────
                    html += '<div class="breed-parent-body">';
                    html += '<div class="breed-parent-name">'+m.name+'</div>';

                    // Trait badges
                    if (m.traits && m.traits.length) {
                        html += '<div class="breed-parent-traits">'+traitBadges(m.traits)+'</div>';
                    }

                    // Stat bars: morale + effectiveness
                    html += '<div class="breed-parent-stats">';
                    html += '<div class="breed-stat-row"><span class="breed-stat-label">Morale</span><div class="breed-stat-track"><div class="breed-stat-fill" style="width:'+happVal+'%;background:'+happCol+';"></div></div><span class="breed-stat-val" style="color:'+happCol+';">'+happVal+'</span></div>';
                    html += '<div class="breed-stat-row"><span class="breed-stat-label">Effective</span><div class="breed-stat-track"><div class="breed-stat-fill" style="width:'+Math.min(100,eff)+'%;background:'+rc+'99;"></div></div><span class="breed-stat-val" style="color:'+rc+';">'+eff+'</span></div>';
                    html += '</div>';

                    // Hire day + salary row
                    html += '<div class="breed-parent-extra">';
                    if (m.hiredDay) html += '<span>\uD83D\uDCC5 Day '+m.hiredDay+'</span>';
                    html += '<span style="color:var(--colour-gold);">\uD83D\uDCB7 '+UI.formatMoney(m.salary)+'/day</span>';
                    html += '</div>';

                    // Role-specific effect note
                    if (m.role === 'assistant') html += '<p class="staff-effect-note">\uD83D\uDCCB Booking bonus: +'+Math.round(2*effectiveness(m))+'/day</p>';
                    if (m.role === 'manager')   html += '<p class="staff-effect-note">\uD83D\uDDE1\uFE0F Disaster reduction: '+Math.round(Math.min(50,25*effectiveness(m)))+'%</p>';
                    if (m.role === 'keeper')    html += '<p class="staff-effect-note">\u2665 Fish health: +'+Math.max(1,Math.round(3*effectiveness(m)))+'/day</p>';
                    if (m.role === 'guard')     html += '<p class="staff-effect-note">\uD83D\uDEE1\uFE0F Disaster reduction: '+Math.round(Math.min(65,40*effectiveness(m)))+'%</p>';
                    if (m.role === 'groundskeeper') html += '<p class="staff-effect-note">\uD83C\uDF3F Bio bonus: +'+Math.max(1,Math.round(effectiveness(m)))+' pts</p>';
                    if (m.role === 'scientist') html += '<p class="staff-effect-note">\uD83D\uDD2C Rarity boost: +'+getScientistRarityBonus()+' pts</p>';

                    html += '<button class="btn btn-danger btn-sm" style="width:100%;" onclick="Staff.fireStaff('+m.instanceId+')">Release '+m.name.split(' ')[0]+'</button>';
                    html += '</div>'; // breed-parent-body
                    html += '</div>'; // staff-slot
                } else {
                    html += '<div class="staff-slot staff-slot-empty">';
                    html += '<div class="staff-slot-header staff-slot-empty-header"><span class="staff-slot-role-label" style="color:'+(rd.colour||'#888')+';opacity:0.55;">'+(rd.emoji||'')+' '+(rd.name||slotDef.role)+'</span></div>';
                    html += '<div class="staff-slot-vacant-icon">'+(rd.emoji||'\uD83D\uDC64')+'</div>';
                    html += '<div class="staff-slot-vacant-label">Vacant</div>';
                    html += '<div class="staff-slot-vacant-sub">'+(rd.desc||'')+'</div>';
                    html += '</div>';
                }
            }
        });
        html += '</div>';
        html += '</div>'; // staff-your-team-group

        // Applicants
        html += '<h3 class="section-heading">Available for Hire <span class="staff-refresh-badge">New applicants in '+dtr+' day'+(dtr!==1?'s':'')+'</span></h3>';
        var avail = (s.availableStaffIds||[]).map(function(id){ return getPoolById(id); }).filter(Boolean);
        if (!avail.length) {
            html += '<p class="empty-state">No applicants right now.</p>';
        } else {
            // Group by role in SLOTS order
            var roleOrder = SLOTS.map(function(s){ return s.role; });
            var grouped   = {};
            avail.forEach(function(def){ if (!grouped[def.role]) grouped[def.role] = []; grouped[def.role].push(def); });
            roleOrder.forEach(function(role){
                var group = grouped[role]; if (!group || !group.length) return;
                var rd3 = ROLES[role]||{};
                html += '<div class="staff-hire-group">';
                html += '<div class="staff-hire-group-title" style="color:'+(rd3.colour||'#888')+';">'+(rd3.emoji||'')+' '+(rd3.name||role)+'</div>';
                html += '<div class="staff-applicant-list">';
                group.forEach(function(def){
                    var traitNames = def.traits.slice(0,2).map(function(t){ var td = TRAITS[t] || {}; return (td.emoji||'') + ' ' + (td.name || t); }).join(' · ');
                    if (!traitNames) traitNames = 'Standard';
                    var fake = { role: def.role, traits: def.traits.slice(), happiness: 80, salary: def.salary || 0 };
                    var eff = Math.round(effectiveness(fake) * 100);
                    var happ = 80;
                    var happCol = happ >= 60 ? '#2ecc71' : happ >= 30 ? '#f39c12' : '#e74c3c';
                    var rc2 = (ROLES[role]||{}).colour || '#888';
                    var exp = Math.min(100, Math.max(0, Math.round((def.hire || 0) / 15)));
                    var expCol = '#f1c40f';
                    var val = Math.round(eff / Math.max(1, def.salary || 1) * 20);
                    var valNorm = Math.min(100, Math.max(0, val));
                    var valCol = val >= 80 ? '#2ecc71' : val >= 40 ? '#f39c12' : '#e74c3c';

                    html += '<div class="staff-applicant-card">';
                    html += '<div class="staff-applicant-top">';
                    html += '<div class="staff-applicant-name-row">';
                    html += '<span class="staff-applicant-avatar">'+(rd3.emoji||'👤')+'</span>';
                    html += '<span class="staff-applicant-name">'+def.name+'</span>';
                    html += '</div>';
                    if (rd3.colour) html += '<span class="staff-applicant-role-pill" style="color:'+rd3.colour+';border-color:'+rd3.colour+'55;">'+(rd3.name||role)+'</span>';
                    html += '</div>';
                    html += '<div class="staff-applicant-bars">';
                    html += '<div class="staff-applicant-bar"><span class="staff-applicant-bar-label">MORALE</span><div class="staff-applicant-track"><div class="staff-applicant-fill" style="width:'+Math.min(100,happ)+'%;background:'+happCol+';"></div></div><span class="staff-applicant-bar-value" style="color:'+happCol+';">'+happ+'</span></div>';
                    html += '<div class="staff-applicant-bar"><span class="staff-applicant-bar-label">EFFECTIVE</span><div class="staff-applicant-track"><div class="staff-applicant-fill" style="width:'+Math.min(100,eff)+'%;background:'+rc2+'99;"></div></div><span class="staff-applicant-bar-value" style="color:'+rc2+';">'+eff+'</span></div>';
                    html += '<div class="staff-applicant-bar"><span class="staff-applicant-bar-label">EXPERIENCE</span><div class="staff-applicant-track"><div class="staff-applicant-fill" style="width:'+exp+'%;background:'+expCol+'99;"></div></div><span class="staff-applicant-bar-value" style="color:'+expCol+';">'+exp+'</span></div>';
                    html += '<div class="staff-applicant-bar"><span class="staff-applicant-bar-label">VALUE</span><div class="staff-applicant-track"><div class="staff-applicant-fill" style="width:'+valNorm+'%;background:'+valCol+'99;"></div></div><span class="staff-applicant-bar-value" style="color:'+valCol+';">'+valNorm+'</span></div>';
                    html += '</div>';
                    html += '<div class="staff-applicant-stats">';
                    html += '<span class="staff-applicant-stat">💷 '+UI.formatMoney(def.salary)+' / day</span>';
                    html += '<span class="staff-applicant-stat">🎯 Hire: '+UI.formatMoney(def.hire)+'</span>';
                    html += '<span class="staff-applicant-stat">✨ '+traitNames+'</span>';
                    if (def.bio) html += '<span class="staff-applicant-stat staff-applicant-bio">'+def.bio+'</span>';
                    html += '</div>';
                    if (isRoleFilled(def.role)) {
                        html += '<button class="btn btn-secondary" disabled style="width:100%;opacity:0.55;cursor:not-allowed;">Position Filled</button>';
                    } else {
                        html += '<button class="btn btn-primary" onclick="Staff.hireStaff('+def.id+');UI.showToast(\'Hired '+def.name.split(' ')[0]+'!\', \'success\');">Hire Me</button>';
                    }
                    html += '</div>';
                });
                html += '</div></div>';
            });
        }

        container.innerHTML = html;
    }

    // ── Public API ────────────────────────────────────────────────────────────
    return {
        initState, hireStaff, fireStaff, assignToLake, setMarketingBudget,
        interviewStaff, processStaff, renderStaff,
        getBestScientist, getAssistantBookingBonus, getAssistantAcceptanceRate,
        getAssistantSatisfactionBonus, getScientistRarityBonus, getScientistDurationMod,
        getDisasterModifier, getLakeManagerSatisfactionBonus, getLakeBiodiversityBonus,
        ROLE_DEFINITIONS: ROLES
    };
})();
