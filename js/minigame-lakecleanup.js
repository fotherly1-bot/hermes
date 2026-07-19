var LakeCleanup = (function() {
    var active = false;
    var overlay, canvas, ctx;
    var items = [];
    var score = 0;
    var timeLeft = 30;
    var spawnTimer = null;
    var gameTimer = null;
    var animFrame = null;
    var width, height;
    var reward = 0;

    var ITEM_TYPES = [
        { id: 'trash',     label: '🗑️', points: 1, value: 25,  size: 36 },
        { id: 'bottle',    label: '🍾', points: 1, value: 30,  size: 30 },
        { id: 'net',       label: '🕸️', points: 2, value: 60,  size: 40 },
        { id: 'tire',      label: '⭕', points: 3, value: 100, size: 44 },
        { id: 'barrel',    label: '🛢️', points: 4, value: 150, size: 48 }
    ];

    function init() {
        overlay = document.createElement('div');
        overlay.id = 'lakecleanup-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(to bottom,#4aa3df 0%,#a9ddfc 45%,#87CEEB 45%,#3498db 100%);z-index:9999;overflow:hidden;';

        canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.display = 'block';
        canvas.style.cursor = 'pointer';
        overlay.appendChild(canvas);

        var ui = document.createElement('div');
        ui.style.cssText = 'position:absolute;top:10px;left:10px;color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:18px;text-shadow:1px 1px 2px #000;pointer-events:none;';
        ui.innerHTML = '<div>Items Cleaned: <span id="lc-score">0</span></div><div>Time: <span id="lc-time">30</span>s</div><div style="font-size:14px;opacity:0.9;">Tap/click trash to clean it up</div>';
        overlay.appendChild(ui);

        var endBtn = document.createElement('button');
        endBtn.textContent = 'End Cleanup';
        endBtn.style.cssText = 'position:absolute;top:10px;right:10px;padding:8px 16px;font-size:14px;z-index:10000;border-radius:4px;border:1px solid #fff;background:#27ae60;color:#fff;cursor:pointer;';
        endBtn.onclick = endGame;
        overlay.appendChild(endBtn);

        document.body.appendChild(overlay);
        ctx = canvas.getContext('2d');
        width = canvas.width;
        height = canvas.height;

        canvas.addEventListener('mousedown', onTap);
        canvas.addEventListener('touchstart', onTouch, { passive: false });
        window.addEventListener('resize', onResize);

        active = true;
        score = 0;
        timeLeft = 30;
        items = [];
        reward = 0;
        updateUI();

        spawnTimer = setInterval(spawnItem, 900);
        gameTimer = setInterval(function() {
            timeLeft--;
            updateUI();
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);

        gameLoop();
    }

    function onResize() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        width = canvas.width;
        height = canvas.height;
    }

    function spawnItem() {
        if (!active) return;
        var type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
        var x = 40 + Math.random() * (width - 80);
        var y = 80 + Math.random() * (height - 180);
        items.push({
            x: x,
            y: y,
            size: type.size,
            label: type.label,
            points: type.points,
            value: type.value,
            alive: true
        });
    }

    function update() {
        for (var i = items.length - 1; i >= 0; i--) {
            var it = items[i];
            if (!it.alive && it.fadeTimer) {
                it.fadeTimer--;
                if (it.fadeTimer <= 0) items.splice(i, 1);
            }
        }
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        // shore strip
        ctx.fillStyle = '#d4c89a';
        ctx.fillRect(0, height - 40, width, 40);
        ctx.fillStyle = '#bdb082';
        ctx.fillRect(0, height - 40, width, 6);

        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            ctx.font = it.size + 'px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = it.alive === false ? Math.max(0, it.fadeTimer / 15) : 1;
            ctx.fillText(it.label, it.x, it.y);
        }
        ctx.globalAlpha = 1;
    }

    function gameLoop() {
        if (!active) return;
        update();
        render();
        animFrame = requestAnimationFrame(gameLoop);
    }

    function handleHit(x, y) {
        if (!active) return;
        for (var i = items.length - 1; i >= 0; i--) {
            var it = items[i];
            if (!it.alive) continue;
            var dx = x - it.x;
            var dy = y - it.y;
            if (Math.sqrt(dx * dx + dy * dy) < it.size) {
                it.alive = false;
                it.fadeTimer = 15;
                score += it.points;
                reward += it.value;
                updateUI();
            }
        }
    }

    function onTap(e) {
        handleHit(e.clientX, e.clientY);
    }

    function onTouch(e) {
        if (!active) return;
        e.preventDefault();
        if (e.touches.length > 0) {
            handleHit(e.touches[0].clientX, e.touches[0].clientY);
        }
    }

    function updateUI() {
        var scoreEl = document.getElementById('lc-score');
        var timeEl = document.getElementById('lc-time');
        if (scoreEl) scoreEl.textContent = score;
        if (timeEl) timeEl.textContent = timeLeft;
    }

    function endGame() {
        active = false;
        clearInterval(spawnTimer);
        clearInterval(gameTimer);
        cancelAnimationFrame(animFrame);
        cleanup();

        var state = Game.getState();
        if (state) {
            state.lastLakeCleanupDay = state.day;
            state.lakeCleanupDone = true;
            Game.saveToStorage();
        }

        if (reward > 0) {
            Game.addMoney(reward);
            Game.addNotification('Lake Cleanup: £' + reward + ' earned (' + score + ' items).');
        } else {
            Game.addNotification('Lake Cleanup done. No rubbish removed.');
        }

        showFinishScreen();
    }

    function showFinishScreen() {
        var finishOverlay = document.createElement('div');
        finishOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10002;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1.5rem;';

        var heading = document.createElement('h2');
        heading.textContent = 'Game Finished';
        heading.style.cssText = 'color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:3rem;margin:0;text-shadow:2px 2px 4px #000;';

        var rewardText = document.createElement('div');
        rewardText.textContent = 'Rewards Earned: £' + reward;
        rewardText.style.cssText = 'color:#f1c40f;font-family:Arial,Helvetica,sans-serif;font-size:1.8rem;font-weight:bold;text-shadow:1px 1px 3px #000;';

        var scoreText = document.createElement('div');
        scoreText.textContent = 'Items Cleaned: ' + score;
        scoreText.style.cssText = 'color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:1.2rem;opacity:0.9;';

        var backBtn = document.createElement('button');
        backBtn.textContent = 'Return to Game';
        backBtn.style.cssText = 'padding:14px 32px;font-size:1.1rem;border-radius:6px;border:none;background:#27ae60;color:#fff;cursor:pointer;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.4);';
        backBtn.onclick = function() {
            if (finishOverlay.parentNode) finishOverlay.parentNode.removeChild(finishOverlay);
            cleanup();
            var s = Game.getState();
            if (s && typeof Dashboard !== 'undefined' && typeof Dashboard.renderDashboard === 'function') {
                Dashboard.renderDashboard();
            }
        };

        finishOverlay.appendChild(heading);
        finishOverlay.appendChild(rewardText);
        finishOverlay.appendChild(scoreText);
        finishOverlay.appendChild(backBtn);
        document.body.appendChild(finishOverlay);
    }

    function cleanup() {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        if (canvas) {
            canvas.removeEventListener('mousedown', onTap);
            canvas.removeEventListener('touchstart', onTouch);
        }
        window.removeEventListener('resize', onResize);
        active = false;
    }

    function checkTrigger() {
        var s = Game.getState();
        if (!s) return;

        // First offer on day 27, then every 100 days after
        var lastCleanup = s.lastLakeCleanupDay || 0;
        if (s.day === 27 || (!lastCleanup && s.day >= 27) || (lastCleanup && s.day - lastCleanup >= 100)) {
            showNotification();
        }
    }

    function showNotification() {
        var s = Game.getState();
        if (s && s.lastLakeCleanupDay && s.day - s.lastLakeCleanupDay < 100) return;

        var html = '<div style="display:flex;flex-direction:column;gap:1rem;max-width:420px;">' +
            '<div style="font-size:1.6rem;font-weight:800;">🧹 Lake Manager on Holiday</div>' +
            '<p style="color:var(--colour-text-muted);margin:0;">Your lake manager is away and the lakes need a cleanup. Clear as much rubbish as you can for cash.</p>' +
            '<div style="background:#f4f4f4;border-radius:8px;padding:10px;font-size:0.9rem;">' +
            '<div>🗑️ Trash — <strong>1 pt</strong> — £25</div>' +
            '<div>🍾 Bottle — <strong>1 pt</strong> — £30</div>' +
            '<div>🕸️ Net — <strong>2 pts</strong> — £60</div>' +
            '<div>⭕ Tire — <strong>3 pts</strong> — £100</div>' +
            '<div>🛢️ Barrel — <strong>4 pts</strong> — £150</div>' +
            '</div>' +
            '<div style="display:flex;gap:0.5rem;">' +
            '<button class="btn btn-primary" onclick="LakeCleanup.start();UI.hideModal();" style="flex:1;">Start Cleanup</button>' +
            '<button class="btn btn-secondary" onclick="LakeCleanup.decline();UI.hideModal();" style="flex:1;">Decline</button>' +
            '</div></div>';
        UI.showModal(html);
    }

    return {
        checkTrigger: checkTrigger,
        showNotification: showNotification,
        start: function() {
            var s = Game.getState();
            if (s) {
                s.lakeCleanupDone = true;
                s.lastLakeCleanupDay = s.day;
                Game.saveToStorage();
            }
            init();
        },
        decline: function() {
            var s = Game.getState();
            if (s) {
                s.lakeCleanupDone = true;
                s.lastLakeCleanupDay = s.day;
                Game.saveToStorage();
            }
        },
        isActive: function() { return active; }
    };
})();
