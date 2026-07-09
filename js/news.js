/**
 * Carp Fishing Tycoon — News System
 * Multi-source feed: Weekly newspaper, FishGram, CarpTok, Blogs, CarpTube
 * Features: deduplication, viral stories, stocking & upgrade hooks
 */
'use strict';

const News = (function () {

    const BLOG_NAMES = [
        'The Weed Bed Chronicles', 'Bankside Diaries', 'Carp Corner',
        'The Specimen Seeker', 'Big Fish Theory', 'Margin Talk', 'The Bite Alarm'
    ];
    const FG_ACCOUNTS  = ['@CarpLover88', '@BigFishBrad', '@LakeSideLife', '@CarpQueen', '@TheSpecimenHunter', '@NightFisher'];
    const YT_CHANNELS  = ['CarpMaster UK', 'BigFishTV', 'LakeSide Angling', 'SpecimenCarpTV', 'The Anglers Den'];
    const BYLINES      = ['By Our Fishing Correspondent', 'By Staff Reporter', 'By the Lake Desk', 'Special Report'];

    function pick(arr)    { return arr[Math.floor(Math.random() * arr.length)]; }
    function fmtOz(oz)    { var lb=Math.floor(oz/16),rm=oz%16; return lb+'lb '+(rm>0?rm+'oz':''); }
    function fmtV(n)      { return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1000?(n/1000).toFixed(1)+'K':String(n||0); }
    function getLakeName(id) {
        if (!id) return 'the fishery';
        var l = typeof Lakes!=='undefined' ? Lakes.getLakeById(id) : null;
        return l ? l.name : 'the fishery';
    }
    function seedRand(day, salt) { return ((day*1664525+(salt||0)+1013904223)>>>0)%100; }

    function initState() {
        var s = Game.getState();
        if (!s.newsStories)    s.newsStories    = [];
        if (!s.nextNewsId)     s.nextNewsId      = 1;
        if (!s.lastDeathCount) s.lastDeathCount  = 0;
        if (!s.newsRecentTags) s.newsRecentTags  = {}; // tag -> lastDay
    }

    // ── Dedup helper ─────────────────────────────────────────────────────────
    function canPublish(state, tag, cooldown) {
        var last = state.newsRecentTags[tag] || 0;
        return (state.day - last) >= (cooldown || 3);
    }
    function markPublished(state, tag) {
        state.newsRecentTags[tag] = state.day;
    }

    // ── Push story + optional viral spread ───────────────────────────────────
    function pushStory(state, story) {
        story.id = state.nextNewsId++;
        state.newsStories.unshift(story);
    }

    function makeViralBurst(state, baseStory) {
        var viralSources = ['fishgram','carptok','blog','carptube'].filter(function(s){ return s !== baseStory.source; });
        var fish = baseStory.fishName || '';
        var wt   = baseStory.weight   || '';
        viralSources.forEach(function(src) {
            var h, extra={};
            if (src==='fishgram') {
                h = '\uD83D\uDD25 GOING VIRAL: ' + (wt?wt+' ':'')+fish+' — everyone\'s talking about this one! #viral #carpfishing';
                extra = { account: pick(FG_ACCOUNTS), likes: 500+Math.floor(Math.random()*5000), viral:true };
            } else if (src==='carptok') {
                h = '\uD83D\uDD25 This is EVERYWHERE right now!! ' + (wt||'') + ' ' + fish + ' #viral #fyp #carpfishing';
                extra = { views: 50000+Math.floor(Math.random()*500000), likes: 5000+Math.floor(Math.random()*50000), viral:true };
            } else if (src==='blog') {
                h = 'Everybody\'s Talking About ' + fish;
                extra = { blogName: pick(BLOG_NAMES), author: 'Trending Desk',
                    body: 'By now you\'ve probably seen it. The '+(wt||'')+(fish?' "'+fish+'"':'')+' story has taken social media by storm. Here\'s our take on why it matters and what it means for the fishery.', viral:true };
            } else if (src==='carptube') {
                h = '\uD83D\uDD25 THE VIRAL CARP EVERYONE IS TALKING ABOUT' + (wt?' | '+wt:'') + ' | ' + baseStory.lakeName;
                extra = { channel: pick(YT_CHANNELS), views: 100000+Math.floor(Math.random()*2000000), thumbnail: baseStory.thumbnail||'rare', viral:true };
            }
            pushStory(state, { day: state.day, source: src, category: baseStory.category,
                headline: h, body: extra.body||'', timestamp: baseStory.timestamp||Date.now(), ...extra });
        });
    }

    // ── Daily story generation ────────────────────────────────────────────────
    function generateDailyStories() {
        initState();
        var state = Game.getState();
        var RCOLS = { common:'#aaa', uncommon:'#2ecc71', rare:'#3498db', epic:'#9b59b6', legendary:'#f1c40f', mythic:'#e74c3c' };
        var now   = Date.now();

        // ── Disasters ─────────────────────────────────────────────────────────
        var todayDis = (state.disasterLog||[]).filter(function(d){ return d.day===state.day; });
        todayDis.forEach(function(d) {
            var tag = 'disaster_' + (d.lakeId||d.lake||'unknown');
            if (!canPublish(state, tag, 1)) return;
            markPublished(state, tag);
            var ln = d.lake || 'the fishery';
            var weeklyHdls = [
                d.name.toUpperCase()+' STRIKES AT '+ln.toUpperCase(),
                'EMERGENCY: '+d.name.toUpperCase()+' HITS '+ln.toUpperCase(),
                'CRISIS AT '+ln.toUpperCase()+' AS '+d.name.toUpperCase()+' TAKES HOLD'
            ];
            var story = { day: state.day, source: 'weekly', category: 'disaster',
                headline: weeklyHdls[seedRand(state.day,1)%weeklyHdls.length],
                body: 'Anglers and staff were left reeling as a '+d.name.toLowerCase()+' event unfolded at '+ln+'. '+
                      (d.result||'Significant damage was reported.')+' Management is working around the clock to restore conditions.',
                byline: pick(BYLINES), lakeName: ln, timestamp: now, viral: d.severity==='high' };
            pushStory(state, story);
            pushStory(state, { day: state.day, source: 'fishgram', category: 'disaster',
                headline: 'Not what we wanted \uD83D\uDE30 '+d.name+' at '+ln+'... hoping for a quick recovery #disaster #carpfishing',
                account: pick(FG_ACCOUNTS), likes: 30+Math.floor(Math.random()*180), timestamp: now });
            if (story.viral) makeViralBurst(state, story);
        });

        // ── Big / Target fish ─────────────────────────────────────────────────
        var bigFish = state.fish.filter(function(f){ return f.alive && f.weight_oz>=480; });
        if (bigFish.length > 0 && seedRand(state.day,2) < 45) {
            var f = bigFish[state.day % bigFish.length];
            var ftag = 'bigfish_'+f.id;
            if (canPublish(state, ftag, 5)) {
                markPublished(state, ftag);
                var ln2    = getLakeName(f.lake_id);
                var wt     = fmtOz(f.weight_oz);
                var sp     = (typeof Fish!=='undefined'&&Fish.SPECIES[f.species]) ? Fish.SPECIES[f.species].name : 'Carp';
                var isT    = f.weight_oz >= 640;
                var rc     = RCOLS[f.rarity]||'#888';
                var views  = Math.floor(f.weight_oz*(80+Math.random()*600));
                var isViral= isT || f.rarity==='legendary' || f.rarity==='mythic' || f.weight_oz>=800;
                var hdls = [
                    (isT?'TARGET FISH ALERT: ':'')+wt.toUpperCase()+' '+sp.toUpperCase()+' LANDED AT '+ln2.toUpperCase(),
                    'SPECIMEN '+sp.toUpperCase()+' OF '+wt.toUpperCase()+' CAUGHT AT '+ln2.toUpperCase(),
                    '"'+f.name.toUpperCase()+'" — '+wt.toUpperCase()+' '+sp.toUpperCase()+' WOWS ANGLERS'
                ];
                var story2 = { day: state.day, source: 'weekly', category: 'bigFish',
                    headline: hdls[seedRand(state.day,3)%hdls.length],
                    body: 'A magnificent '+wt+' '+sp.toLowerCase()+' known as "'+f.name+'" was the talk of the banks this week at '+ln2+'. '+
                          (isT?'This coveted target fish is known to every serious angler in the region. ':'The fish is a fine specimen and a testament to the quality of the fishery. ')+
                          'It was returned safely after being photographed by delighted onlookers.',
                    byline: pick(BYLINES), fishName: f.name, weight: wt, lakeName: ln2,
                    rarityColor: rc, thumbnail: f.rarity, timestamp: now, viral: isViral };
                pushStory(state, story2);
                pushStory(state, { day: state.day, source: 'carptube', category: 'bigFish',
                    headline: (isT?'\uD83C\uDFAF TARGET FISH! ':'')+wt.toUpperCase()+' '+sp.toUpperCase()+' — You Won\'t Believe This! | '+ln2,
                    channel: pick(YT_CHANNELS), views: views, thumbnail: f.rarity, timestamp: now });
                pushStory(state, { day: state.day, source: 'carptok', category: 'bigFish',
                    headline: wt+' '+sp+' caught!! \uD83D\uDE31\uD83D\uDE31 #carpfishing #bigfish #'+(isT?'targetfish':'specimen'),
                    views: Math.floor(views*0.6), likes: Math.floor(views*0.08), timestamp: now });
                if (isViral) makeViralBurst(state, story2);
            }
        }

        // ── Anglers arriving ──────────────────────────────────────────────────
        var arriving = (state.anglerBookings||[]).filter(function(b){ return b.startDay===state.day; });
        if (arriving.length >= 2 && canPublish(state, 'anglers_arrive', 2)) {
            markPublished(state, 'anglers_arrive');
            var ln3  = getLakeName(arriving[0].lakeId);
            var hdls3= ['A Packed Session at '+ln3,'The Banks Are Full at '+ln3,'Busy Times at '+ln3];
            pushStory(state, { day: state.day, source: 'blog', category: 'anglers',
                headline: hdls3[seedRand(state.day,4)%hdls3.length],
                body: 'Rods were out from first light as '+arriving.length+' anglers descended on '+ln3+' today. The buzz was electric and the fish were certainly playing ball. A few personal bests were reported before lunchtime.',
                blogName: pick(BLOG_NAMES), author: 'Guest Blogger', timestamp: now });
            pushStory(state, { day: state.day, source: 'fishgram', category: 'anglers',
                headline: 'Busy day on the banks! \uD83C\uDFA3 '+arriving.length+' anglers fishing at '+ln3+' — love seeing the place alive like this #carplife #banklife',
                account: pick(FG_ACCOUNTS), likes: 40+Math.floor(Math.random()*300), timestamp: now });
        }

        // ── Fish deaths ───────────────────────────────────────────────────────
        var totalDead = state.fish.filter(function(f){ return !f.alive; }).length;
        var newDeaths = totalDead - (state.lastDeathCount||0);
        if (newDeaths > 0 && canPublish(state, 'fish_deaths', 2)) {
            markPublished(state, 'fish_deaths');
            pushStory(state, { day: state.day, source: 'weekly', category: 'fishDeath',
                headline: 'FISH LOSSES REPORTED AT THE FISHERY',
                body: newDeaths+' fish '+(newDeaths===1?'has':'have')+' been reported deceased at the fishery. Investigations are underway and measures are being taken to protect the remaining stock.',
                byline: pick(BYLINES), timestamp: now });
            pushStory(state, { day: state.day, source: 'blog', category: 'fishDeath',
                headline: 'A Sad Day at the Fishery',
                body: 'It\'s never easy writing posts like this. We lost '+newDeaths+' fish. We\'re looking into the cause and will update you all as soon as we know more. Rest easy, little ones.',
                blogName: pick(BLOG_NAMES), author: 'Fishery Owner', timestamp: now });
        }
        state.lastDeathCount = totalDead;

        // ── Breeding success ──────────────────────────────────────────────────
        var lbo = state.lastBreedingOutcome;
        if (lbo && lbo.day===state.day && lbo.offspring && lbo.offspring.length>0) {
            var ro={common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5};
            var best=lbo.offspring.reduce(function(b,o){return(ro[o.rarity]||0)>(ro[b.rarity]||0)?o:b;});
            var rn=best.rarity.charAt(0).toUpperCase()+best.rarity.slice(1);
            var isViral2 = best.rarity==='legendary'||best.rarity==='mythic'||best.rarity==='epic';
            var storyB = { day: state.day, source: 'blog', category: 'breeding',
                headline: 'Breeding Success: '+lbo.offspring.length+' New Offspring!',
                body: 'The breeding pond has delivered! Today '+lbo.offspring.length+' healthy fry emerged, offspring of '+lbo.parent1.name+' and '+lbo.parent2.name+'. The star of the batch is a '+rn+'-grade fish — remarkable work from our team.',
                blogName: 'Breeding Pond Journal', author: 'Head Scientist',
                fishName: best.name||rn, weight:'', lakeName:'breeding pond', thumbnail: best.rarity,
                timestamp: now, viral: isViral2 };
            pushStory(state, storyB);
            pushStory(state, { day: state.day, source: 'carptube', category: 'breeding',
                headline: rn.toUpperCase()+' OFFSPRING FROM BREEDING! '+lbo.offspring.length+' FRY PRODUCED \uD83E\uDD5A',
                channel: pick(YT_CHANNELS), views: 500+Math.floor(Math.random()*8000), thumbnail: best.rarity, timestamp: now });
            if (isViral2) makeViralBurst(state, storyB);
        }

        state.newsStories = state.newsStories.slice(0, 80);
        Game.saveToStorage();
    }

    // ── Manual triggers (called from Shop) ────────────────────────────────────
    function addStockingStory(fishLabel, rarity, lakeId) {
        initState();
        var state = Game.getState();
        var ln    = getLakeName(lakeId);
        var tag   = 'stocking_'+lakeId;
        if (!canPublish(state, tag, 2)) return;
        markPublished(state, tag);
        var now   = Date.now();
        var hdls  = [ln.toUpperCase()+' RECEIVES NEW STOCK', 'FRESH FISH ARRIVE AT '+ln.toUpperCase(), 'NEW ADDITIONS JOIN THE STOCK AT '+ln.toUpperCase()];
        var rar   = rarity||'common';
        var rarTitle = rar.charAt(0).toUpperCase()+rar.slice(1);
        pushStory(state, { day: state.day, source: 'weekly', category: 'stocking',
            headline: hdls[state.nextNewsId%hdls.length],
            body: 'Fishery management at '+ln+' has announced the arrival of new stock. A fresh intake of '+fishLabel+' — including some fine '+rarTitle+'-grade specimens — has bolstered the lake\'s population and is expected to attract additional interest from anglers across the region.',
            byline: pick(BYLINES), lakeName: ln, timestamp: now });
        pushStory(state, { day: state.day, source: 'fishgram', category: 'stocking',
            headline: 'New stock day at '+ln+'! \uD83D\uDC1F Can\'t wait to see how these beauties settle in. #newfish #stockday #carpfishing',
            account: pick(FG_ACCOUNTS), likes: 55+Math.floor(Math.random()*250), timestamp: now });
        pushStory(state, { day: state.day, source: 'carptok', category: 'stocking',
            headline: 'NEW FISH JUST DROPPED at '+ln+' \uD83D\uDE0D #stockday #carpfishing #newfish',
            views: 800+Math.floor(Math.random()*12000), likes: 100+Math.floor(Math.random()*1500), timestamp: now });
        state.newsStories = state.newsStories.slice(0, 80);
        Game.saveToStorage();
    }

    function addUpgradeStory(upgradeName, lakeId) {
        initState();
        var state = Game.getState();
        var ln    = getLakeName(lakeId);
        var tag   = 'upgrade_'+lakeId+'_'+upgradeName;
        if (!canPublish(state, tag, 3)) return;
        markPublished(state, tag);
        var now   = Date.now();
        pushStory(state, { day: state.day, source: 'weekly', category: 'upgrade',
            headline: ln.toUpperCase()+' INVESTS IN '+upgradeName.toUpperCase(),
            body: 'In a clear signal of ambition, '+ln+' has completed installation of a new '+upgradeName+'. This investment is expected to significantly improve conditions for both fish and visiting anglers, reinforcing the fishery\'s position as a premier destination.',
            byline: pick(BYLINES), lakeName: ln, timestamp: now });
        pushStory(state, { day: state.day, source: 'blog', category: 'upgrade',
            headline: upgradeName+' Installed at '+ln+' — What It Means for Anglers',
            body: 'Great news for anyone planning a visit to '+ln+'. The new '+upgradeName+' has just been fitted and the early results look promising. This is exactly the kind of investment that sets a fishery apart from the competition.',
            blogName: pick(BLOG_NAMES), author: 'Fishery Reviewer', timestamp: now });
        state.newsStories = state.newsStories.slice(0, 80);
        Game.saveToStorage();
    }

    // ── Render ────────────────────────────────────────────────────────────────
    function renderNews() {
        var container = document.getElementById('panel-news');
        if (!container) return;
        initState();
        var state   = Game.getState();
        var stories = state.newsStories || [];
        var html    = '<h2>\uD83D\uDCF0 News</h2>';

        if (stories.length === 0) {
            html += '<p class="empty-state">No news yet \u2014 advance a few days for stories to appear.</p>';
            container.innerHTML = html; return;
        }

        var src = { weekly:[], fishgram:[], carptok:[], blog:[], carptube:[] };
        stories.forEach(function(s){ if (src[s.source]) src[s.source].push(s); });

        html += '<div class="news-weekly-full">';

        // ── Weekly newspaper — featured full-width ──────────────────────────────
        html += '<div class="news-paper">';
        html += '<div class="news-paper-masthead"><div class="news-paper-title">Carp Fishing Tycoon Weekly</div>';
        html += '<div class="news-paper-sub">The Voice of British Carp Angling \u00b7 Est. Year 1 \u00b7 Day '+state.day+' Edition</div>';
        html += '<div class="news-paper-rule"></div></div>';
        if (!src.weekly.length) { html += '<p class="news-empty-col">No stories yet.</p>'; }
        else {
            src.weekly.slice(0,5).forEach(function(s,i){
                html += '<div class="news-story'+(i===0?' news-story-lead':'')+'">';
                if (s.viral) html += '<span class="news-viral-badge">\uD83D\uDD25 VIRAL</span>';
                html += '<div class="news-category-tag">'+s.category.replace(/([A-Z])/g,' $1').trim().toUpperCase()+'</div>';
                html += '<div class="news-headline">'+s.headline+'</div>';
                html += '<div class="news-paper-divider"></div>';
                if (s.body) html += '<div class="news-body">'+s.body+'</div>';
                html += '<div class="news-byline">Day '+s.day+' \u00b7 '+(s.byline||'By Our Correspondent')+'</div>';
                html += '</div>';
            });
        }
        html += '</div>';

        html += '</div>';

        html += '<div class="news-social-grid">';

        // ── FishGram ──────────────────────────────────────────────────────────
        html += '<div class="news-col"><div class="news-social-panel news-fishgram">';
        html += '<div class="news-social-header"><span class="news-social-logo">\uD83D\uDC1F</span>FishGram</div>';
        src.fishgram.slice(0,5).forEach(function(s){
            html += '<div class="news-fishgram-post">';
            if (s.viral) html += '<span class="news-viral-badge">\uD83D\uDD25 Viral</span>';
            html += '<div class="news-fg-top"><span class="news-fg-avatar">\uD83C\uDFA3</span><span class="news-fg-user">'+(s.account||'@Fishery')+'</span><span class="news-fg-day">D'+s.day+'</span></div>';
            html += '<div class="news-fg-photo">'+(s.category==='disaster'?'\uD83D\uDE30':s.category==='fishDeath'?'\uD83D\uDC94':s.category==='stocking'?'\uD83D\uDC1F':'\uD83D\uDC20')+'</div>';
            html += '<div class="news-fg-caption">'+s.headline+'</div>';
            html += '<div class="news-fg-likes">\u2764\uFE0F '+(s.likes||42)+' likes</div>';
            html += '</div>';
        });
        if (!src.fishgram.length) html += '<p class="news-empty-col">No posts yet.</p>';
        html += '</div></div>';

        // ── CarpTok ───────────────────────────────────────────────────────────
        html += '<div class="news-col"><div class="news-social-panel news-carptok">';
        html += '<div class="news-social-header"><span class="news-social-logo">\uD83C\uDFAC</span>CarpTok</div>';
        src.carptok.slice(0,5).forEach(function(s){
            html += '<div class="news-carptok-post">';
            if (s.viral) html += '<span class="news-viral-badge">\uD83D\uDD25 Trending</span>';
            html += '<div class="news-ct-thumb">'+(s.category==='bigFish'?'\uD83D\uDC1F':s.category==='disaster'?'\uD83D\uDE31':'\uD83C\uDFA3')+'</div>';
            html += '<div class="news-ct-caption">'+s.headline+'</div>';
            html += '<div class="news-ct-stats"><span>\uD83D\uDC41 '+fmtV(s.views)+'</span><span>\u2764\uFE0F '+fmtV(s.likes)+'</span></div>';
            html += '<div class="news-ct-day">Day '+s.day+'</div>';
            html += '</div>';
        });
        if (!src.carptok.length) html += '<p class="news-empty-col">No videos yet.</p>';
        html += '</div></div>';

        // ── Blogs ─────────────────────────────────────────────────────────────
        html += '<div class="news-col"><div class="news-social-panel news-blogs">';
        html += '<div class="news-social-header"><span class="news-social-logo">\u270D\uFE0F</span>Blogs</div>';
        src.blog.slice(0,5).forEach(function(s){
            html += '<div class="news-blog-post">';
            if (s.viral) html += '<span class="news-viral-badge">\uD83D\uDD25 Trending</span>';
            html += '<div class="news-blog-name">'+(s.blogName||'Bankside Diaries')+'</div>';
            html += '<div class="news-blog-headline">'+s.headline+'</div>';
            html += '<div class="news-blog-meta">Day '+s.day+' \u00b7 '+(s.author||'Anon')+'</div>';
            if (s.body) html += '<div class="news-blog-body">'+s.body+'</div>';
            html += '</div>';
        });
        if (!src.blog.length) html += '<p class="news-empty-col">No posts yet.</p>';
        html += '</div></div>';

        // ── CarpTube ──────────────────────────────────────────────────────────
        var RCOLS2 = { common:'#555', uncommon:'#2ecc71', rare:'#3498db', epic:'#9b59b6', legendary:'#f1c40f', mythic:'#e74c3c' };
        html += '<div class="news-col"><div class="news-social-panel news-carptube">';
        html += '<div class="news-social-header"><span class="news-social-logo">\uD83C\uDFF3\uFE0F</span>CarpTube</div>';
        src.carptube.slice(0,5).forEach(function(s){
            var tc=RCOLS2[s.thumbnail]||'#333';
            html += '<div class="news-yt-post">';
            if (s.viral) html += '<span class="news-viral-badge">\uD83D\uDD25 Viral</span>';
            html += '<div class="news-yt-thumb" style="background:linear-gradient(135deg,'+tc+'55 0%,#0a0a0a 100%);">'+(s.category==='bigFish'?'\uD83D\uDC1F':'\uD83C\uDFA3')+'<span class="news-yt-play">\u25B6</span></div>';
            html += '<div class="news-yt-title">'+s.headline+'</div>';
            html += '<div class="news-yt-meta">'+(s.channel||'CarpTuber')+' \u00b7 '+fmtV(s.views)+' views \u00b7 Day '+s.day+'</div>';
            html += '</div>';
        });
        if (!src.carptube.length) html += '<p class="news-empty-col">No videos yet.</p>';
        html += '</div></div>';

        html += '</div>';

        container.innerHTML = html;
    }

    return { generateDailyStories, renderNews, initState, addStockingStory, addUpgradeStory };
})();
