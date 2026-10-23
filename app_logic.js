document.addEventListener('DOMContentLoaded', () => {
    try {
        const inputFirstName = document.getElementById('inputFirstName');
        const inputLastName = document.getElementById('inputLastName');
        const inputPreviousJob = document.getElementById('inputPreviousJob');
        const btnRegisterWorker = document.getElementById('btnRegisterWorker');
        const displayWorkersList = document.getElementById('displayWorkersList');
        const btnToggleTheme = document.getElementById('btnToggleTheme');
        const btnToggleZoom = document.getElementById('btnToggleZoom');
        const filterDateInput = document.getElementById('filterDate');
        const rootBody = document.body;

        const todayStr = new Date().toISOString().split('T')[0];
        filterDateInput.value = todayStr;

        chrome.storage.local.get(['isDarkStyle', 'isZoomedState'], (stored) => {
            if (stored.isDarkStyle) {
                rootBody.classList.add('dark-mode-active');
                btnToggleTheme.textContent = '☀️';
            }
            if (stored.isZoomedState) {
                rootBody.classList.add('expanded-screen');
            }
            refreshWorkerData();
        });

        filterDateInput.addEventListener('change', refreshWorkerData);

        btnToggleTheme.addEventListener('click', () => {
            rootBody.classList.toggle('dark-mode-active');
            const currentDark = rootBody.classList.contains('dark-mode-active');
            btnToggleTheme.textContent = currentDark ? '☀️' : '🌙';
            chrome.storage.local.set({ isDarkStyle: currentDark });
        });

        btnToggleZoom.addEventListener('click', () => {
            rootBody.classList.toggle('expanded-screen');
            const currentZoom = rootBody.classList.contains('expanded-screen');
            chrome.storage.local.set({ isZoomedState: currentZoom });
        });

        btnRegisterWorker.addEventListener('click', () => {
            const fName = inputFirstName.value.trim();
            const lName = inputLastName.value.trim();
            const pJob = inputPreviousJob.value.trim();

            if (!fName || !lName) {
                alert('ئىسمى ۋە سويى قۇرۇق قالماسلىقى كېرەك!');
                return;
            }

            const newEntry = {
                uid: 'worker_' + Date.now().toString(),
                firstName: fName,
                lastName: lName,
                prevJob: pJob || 'بەلگىلەنمىگەن',
                attendance: {}
            };

            chrome.storage.local.get(['registeredWorkers'], (res) => {
                const currentWorkers = res.registeredWorkers || [];
                currentWorkers.push(newEntry);
                chrome.storage.local.set({ registeredWorkers: currentWorkers }, () => {
                    inputFirstName.value = '';
                    inputLastName.value = '';
                    inputPreviousJob.value = '';
                    refreshWorkerData();
                });
            });
        });

        function refreshWorkerData() {
            const selectedDate = filterDateInput.value || todayStr;

            chrome.storage.local.get(['registeredWorkers'], (res) => {
                const currentWorkers = res.registeredWorkers || [];
                displayWorkersList.innerHTML = '';

                if (currentWorkers.length === 0) {
                    displayWorkersList.innerHTML = '<div class="empty-list-notice">ھازىرچە قوشۇلغان ئىشچىلار يوق. يۇقىرىدىكى فورما ئارقىلىق تىزىملاتسىڭىز بۇ يەردە كۆرۈنىدۇ.</div>';
                    return;
                }

                currentWorkers.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'item-worker-card';

                    const topRow = document.createElement('div');
                    topRow.className = 'card-top-row';

                    const infoBox = document.createElement('div');
                    infoBox.className = 'worker-text-info';

                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'worker-full-name';
                    nameSpan.textContent = `${item.firstName} ${item.lastName}`;

                    const metaSpan = document.createElement('span');
                    metaSpan.className = 'worker-sub-meta';
                    metaSpan.textContent = `بۇرۇنقى خىزمىتى: ${item.prevJob}`;

                    infoBox.appendChild(nameSpan);
                    infoBox.appendChild(metaSpan);

                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn-remove-item';
                    deleteBtn.textContent = '✕';
                    deleteBtn.title = 'ئۆچۈرۈش';
                    deleteBtn.addEventListener('click', () => {
                        removeWorkerById(item.uid);
                    });

                    topRow.appendChild(infoBox);
                    topRow.appendChild(deleteBtn);

                    const actionsRow = document.createElement('div');
                    actionsRow.className = 'card-actions-row';

                    const attendanceMap = item.attendance || {};
                    const currentStatus = attendanceMap[selectedDate] || 'absent';

                    const badge = document.createElement('span');
                    badge.className = `status-badge ${currentStatus}`;
                    badge.textContent = currentStatus === 'present' ? '✓ كەلدى' : '✗ كەلمىدى';

                    const toggleAttendanceBtn = document.createElement('button');
                    toggleAttendanceBtn.className = `btn-toggle-attendance ${currentStatus === 'present' ? 'btn-absent' : ''}`;
                    toggleAttendanceBtn.innerHTML = currentStatus === 'present' ? '✗ كەلمىدى قىلىش' : '✓ كەلدى قىلىش';

                    toggleAttendanceBtn.addEventListener('click', () => {
                        const newStatus = currentStatus === 'present' ? 'absent' : 'present';
                        updateAttendance(item.uid, selectedDate, newStatus);
                    });

                    actionsRow.appendChild(badge);
                    actionsRow.appendChild(toggleAttendanceBtn);

                    card.appendChild(topRow);
                    card.appendChild(actionsRow);

                    displayWorkersList.appendChild(card);
                });
            });
        }

        function updateAttendance(uid, dateStr, status) {
            chrome.storage.local.get(['registeredWorkers'], (res) => {
                let currentWorkers = res.registeredWorkers || [];
                const worker = currentWorkers.find(w => w.uid === uid);
                if (worker) {
                    if (!worker.attendance) worker.attendance = {};
                    worker.attendance[dateStr] = status;
                    chrome.storage.local.set({ registeredWorkers: currentWorkers }, refreshWorkerData);
                }
            });
        }

        function removeWorkerById(uid) {
            chrome.storage.local.get(['registeredWorkers'], (res) => {
                let currentWorkers = res.registeredWorkers || [];
                currentWorkers = currentWorkers.filter(w => w.uid !== uid);
                chrome.storage.local.set({ registeredWorkers: currentWorkers }, refreshWorkerData);
            });
        }

    } catch (err) {
        console.error('خاتالىق يۈز بەردى:', err);
    }
});