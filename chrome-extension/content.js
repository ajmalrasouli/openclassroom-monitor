// Check if current site is blocked
function checkIfBlocked() {
    chrome.runtime.sendMessage({
        type: 'BLOCKED_SITE_CHECK',
        url: window.location.hostname
    }, (response) => {
        if (response.isBlocked) {
            document.body.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #f8f9fa;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-family: Arial, sans-serif;
                    z-index: 999999;
                ">
                    <h1 style="color: #dc3545;">Access Blocked</h1>
                    <p style="color: #6c757d;">This website has been blocked by your teacher.</p>
                </div>
            `;
        }
    });
}

// Check when page loads
checkIfBlocked();

// Check when URL changes without page reload (SPA)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        checkIfBlocked();
    }
}).observe(document, { subtree: true, childList: true });
