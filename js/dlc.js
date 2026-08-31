const DLC = (function () {
    'use strict';

    function render() {
        var html = '<p class="empty-state">No DLC installed yet.</p>';
        html += '<div class="dlc-grid">';
        html += '<div class="dlc-card"><h3>Example DLC 1</h3><p>Coming soon.</p></div>';
        html += '<div class="dlc-card"><h3>Example DLC 2</h3><p>Coming soon.</p></div>';
        html += '</div>';
        return html;
    }

    function open() {
        var container = document.getElementById('dlc-content');
        if (!container) return;
        container.innerHTML = render();
    }

    return { render: render, open: open };
})();
