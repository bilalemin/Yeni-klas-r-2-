(function() {
    function injectFloatingDroneButton() {
        if (document.getElementById('fpv-drone-shortcut-btn')) return;

        const btn = document.createElement('div');
        btn.id = 'fpv-drone-shortcut-btn';
        btn.innerHTML = '🛸';
        btn.title = 'ئىشچىلار باشقۇرغۇچىنى ئېچىش (FPV Drone)';

        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '25px',
            right: '25px',
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justify-content: center,
            fontSize: '28px',
            boxShadow: '0 8px 25px rgba(6, 182, 212, 0.6)',
            cursor: 'pointer',
            zIndex: '2147483647',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            userSelect: 'none',
            border: '2px solid #ffffff'
        });

        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.15) rotate(12deg)';
            btn.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.8)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1) rotate(0deg)';
            btn.style.boxShadow = '0 8px 25px rgba(6, 182, 212, 0.6)';
        });

        btn.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: "open_side_panel" });
        });

        if (document.body) {
            document.body.appendChild(btn);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectFloatingDroneButton);
    } else {
        injectFloatingDroneButton();
    }

    setInterval(injectFloatingDroneButton, 1500);
})();