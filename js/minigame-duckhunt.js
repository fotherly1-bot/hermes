var DuckHunt = (function() {
    var active = false;
    var canvas, ctx, overlay;
    var ducks = [];
    var score = 0;
    var timeLeft = 30;
    var spawnTimer = null;
    var gameTimer = null;
    var animFrame = null;
    var width, height;
    var reward = 0;

    var DUCK_TYPES = {
        mallard: { points: 1, speed: 3, size: 30, color: '#8B7355', headColor: '#2ecc71', value: 50 },
        teal:    { points: 3, speed: 5, size: 24, color: '#7f8c8d', headColor: '#3498db', value: 150 },
        golden:  { points: 5, speed: 7, size: 28, color: '#f1c40f', headColor: '#f39c12', value: 250 }
    };

    function init() {
        overlay = document.createElement('div');
        overlay.id = 'duckhunt-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(to bottom,#87CEEB 0%,#E0F6FF 60%,#3498db 60%,#2980b9 100%);z-index:9999;cursor:crosshair;overflow:hidden;';

        canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.display = 'block';
        overlay.appendChild(canvas);

        var ui = document.createElement('div');
        ui.style.cssText = 'position:absolute;top:10px;left:10px;color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:18px;text-shadow:1px 1px 2px #000;pointer-events:none;';
        ui.innerHTML = '<div>Score: <span id="dh-score">0</span></div><div>Time: <span id="dh-time">30</span>s</div><div style="font-size:14px;opacity:0.9;">Tap/click ducks to shoot</div>';
        overlay.appendChild(ui);

        var endBtn = document.createElement('button');
        endBtn.textContent = 'End Hunt';
        endBtn.style.cssText = 'position:absolute;top:10px;right:10px;padding:8px 16px;font-size:14px;z-index:10000;border-radius:4px;border:1px solid #fff;background:#e74c3c;color:#fff;cursor:pointer;';
        endBtn.onclick = endGame;
        overlay.appendChild(endBtn);

        document.body.appendChild(overlay);
        ctx = canvas.getContext('2d');
        width = canvas.width;
        height = canvas.height;

        canvas.addEventListener('mousedown', onShoot);
        canvas.addEventListener('touchstart', onTouch, {passive: false});
        window.addEventListener('resize', onResize);

        active = true;
        score = 0;
        timeLeft = 30;
        ducks = [];
        updateUI();

        spawnTimer = setInterval(spawnDuck, 1200);
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

    function spawnDuck() {
        if (!active) return;
        var rand = Math.random();
        var typeKey = 'mallard';
        if (rand < 0.08) typeKey = 'golden';
        else if (rand < 0.30) typeKey = 'teal';

        var type = DUCK_TYPES[typeKey];
        var fromLeft = Math.random() < 0.5;
        var speed = type.speed * (0.8 + Math.random() * 0.4);
        ducks.push({
            x: fromLeft ? -50 : width + 50,
            y: 60 + Math.random() * (height - 180),
            vx: speed * (fromLeft ? 1 : -1),
            vy: (Math.random() - 0.5) * 1.2,
            type: typeKey,
            points: type.points,
            value: type.value,
            size: type.size,
            color: type.color,
            headColor: type.headColor,
            alive: true
        });
    }

    function update() {
        for (var i = ducks.length - 1; i >= 0; i--) {
            var d = ducks[i];
            d.x += d.vx;
            d.y += d.vy;
            if (d.y < 50 || d.y > height - 80) d.vy *= -1;
            if ((d.vx > 0 && d.x > width + 80) || (d.vx < 0 && d.x < -80)) {
                ducks.splice(i, 1);
            }
        }
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        // Water
        ctx.fillStyle = '#3498db';
        ctx.fillRect(0, height - 80, width, 80);
        ctx.fillStyle = '#5dade2';
        ctx.fillRect(0, height - 80, width, 8);

        // Reeds
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 3;
        for (var rx = 20; rx < width; rx += 50) {
            ctx.beginPath();
            ctx.moveTo(rx, height - 80);
            ctx.quadraticCurveTo(rx + 6, height - 140, rx + 3, height - 190);
            ctx.stroke();
        }

        // Ducks
        ducks.forEach(function(d) {
            if (!d.alive) return;
            ctx.save();
            ctx.translate(d.x, d.y);
            if (d.vx < 0) ctx.scale(-1, 1);

            // Body
            ctx.fillStyle = d.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, d.size, d.size * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();

            // Head
            ctx.fillStyle = d.headColor;
            ctx.beginPath();
            ctx.arc(d.size * 0.55, -d.size * 0.35, d.size * 0.32, 0, Math.PI * 2);
            ctx.fill();

            // Beak
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.moveTo(d.size * 0.85, -d.size * 0.35);
            ctx.lineTo(d.size * 1.15, -d.size * 0.28);
            ctx.lineTo(d.size * 0.85, -d.size * 0.22);
            ctx.fill();

            ctx.restore();
        });
    }

    function gameLoop() {
        if (!active) return;
        update();
        render();
        animFrame = requestAnimationFrame(gameLoop);
    }

    function handleHit(x, y) {
        if (!active) return;
        for (var i = ducks.length - 1; i >= 0; i--) {
            var d = ducks[i];
            if (!d.alive) continue;
            var dist = Math.hypot(d.x - x, d.y - y);
            if (dist < d.size * 1.1) {
                d.alive = false;
                score += d.points;
                ducks.splice(i, 1);
                updateUI();

                // Floating +1
                showFloat(x, y, '+' + d.points);
                return;
            }
        }
    }

    function showFloat(x, y, text) {
        var el = document.createElement('div');
        el.textContent = text;
        el.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;text-shadow:1px 1px 2px #000;pointer-events:none;z-index:10001;transition:all 0.8s ease-out;opacity:1;';
        overlay.appendChild(el);
        requestAnimationFrame(function() {
            el.style.transform = 'translateY(-40px)';
            el.style.opacity = '0';
        });
        setTimeout(function() {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 800);
    }

    function onShoot(e) {
        if (!active) return;
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
        var scoreEl = document.getElementById('dh-score');
        var timeEl = document.getElementById('dh-time');
        if (scoreEl) scoreEl.textContent = score;
        if (timeEl) timeEl.textContent = timeLeft;
    }

    function endGame() {
        active = false;
        clearInterval(spawnTimer);
        clearInterval(gameTimer);
        cancelAnimationFrame(animFrame);

        reward = score * 50;
        var state = Game.getState();
        if (reward > 0) {
            Game.addMoney(reward);
            Game.addNotification('Duck Hunt: £' + reward + ' earned (score ' + score + ').');
        } else {
            Game.addNotification('Duck Hunt ended. No ducks were shot.');
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
        scoreText.textContent = 'Score: ' + score + ' ducks';
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
        window.removeEventListener('resize', onResize);
        active = false;
    }

    function checkTrigger() {
        var s = Game.getState();
        if (!s) return;

        // Every 30 days starting day 10
        var lastHunt = s.lastDuckHuntDay || 0;
        if (s.day >= 10 && (!lastHunt || s.day - lastHunt >= 30)) {
            showNotification();
        }
    }

    function showNotification() {
        var s = Game.getState();
        if (s && s.lastDuckHuntDay && s.day - s.lastDuckHuntDay < 30) return;

        var html = '<div style="display:flex;flex-direction:column;gap:1rem;max-width:420px;">' +
            '<div style="font-size:1.6rem;font-weight:800;">🦆 Migratory Ducks Spotted!</div>' +
            '<p style="color:var(--colour-text-muted);margin:0;">A flock has flown over Oakmere Lake. You can take aim for cash rewards.</p>' +
            '<div style="background:#f4f4f4;border-radius:8px;padding:10px;font-size:0.9rem;">' +
            '<div>Common Mallard — <strong>1 pt</strong> — £50</div>' +
            '<div>Rare Teal — <strong>3 pts</strong> — £150</div>' +
            '<div>Golden Duck — <strong>5 pts</strong> — £250</div>' +
            '</div>' +
            '<div style="display:flex;gap:0.5rem;">' +
            '<button class="btn btn-primary" onclick="DuckHunt.start();UI.hideModal();" style="flex:1;">Play Duck Hunt</button>' +
            '<button class="btn btn-secondary" onclick="DuckHunt.decline();UI.hideModal();" style="flex:1;">Decline</button>' +
            '</div></div>';
        UI.showModal(html);
    }

    return {
        checkTrigger: checkTrigger,
        showNotification: showNotification,
        start: function() {
            var s = Game.getState();
            if (s) {
                s.lastDuckHuntDay = s.day;
                s.duckHuntDone = true;
                Game.saveToStorage();
            }
            init();
        },
        decline: function() {
            var s = Game.getState();
            if (s) {
                s.lastDuckHuntDay = s.day;
                Game.saveToStorage();
            }
        },
        isActive: function() { return active; }
    };
})();
