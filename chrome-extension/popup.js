document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('status');
    const studentNameInput = document.getElementById('studentName');
    const saveButton = document.getElementById('saveInfo');

    // Load saved student info
    chrome.storage.local.get(['studentName', 'studentId'], (data) => {
        if (data.studentName) {
            studentNameInput.value = data.studentName;
        }
    });

    // Save student information
    saveButton.addEventListener('click', () => {
        const studentName = studentNameInput.value.trim();
        if (studentName) {
            const studentId = 'student_' + Math.random().toString(36).substr(2, 9);
            chrome.storage.local.set({
                studentName,
                studentId
            }, () => {
                // Notify background script to reconnect with new info
                chrome.runtime.sendMessage({ type: 'RECONNECT' });
                statusDiv.textContent = 'Information saved!';
                statusDiv.className = 'status connected';
            });
        }
    });

    // Check connection status
    chrome.runtime.sendMessage({ type: 'CHECK_CONNECTION' }, (response) => {
        if (response && response.connected) {
            statusDiv.textContent = 'Connected';
            statusDiv.className = 'status connected';
        }
    });
});
