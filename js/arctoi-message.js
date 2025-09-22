
/*
Arctoi message-functions
--------------------------
type-strings: success, warning, neutral, alert
*/

let arctoiMessages = [];

// Surveyor message functions (aliases for backward compatibility)
const surveyorMessage = (sender, type, message) => arctoiMessage(sender, type, message);
const surveyorHelp = (sender, message) => arctoiHelp(sender, message);
const surveyorLoading = (mode) => arctoiLoading(mode);

// Help modal function
const arctoiHelp = (sender, message) => {
    const infoModal = new bootstrap.Modal(document.getElementById('infoModal'));
    document.getElementById('infoModal-title').textContent = sender;
    document.getElementById('infoModal-body').innerHTML = message;
    infoModal.show();
};

// Loading modal function
let loadingModalInstance = null;
let isModalShowing = false;

const arctoiLoading = (mode) => {
    console.log('arctoiLoading called with mode:', mode, 'isModalShowing:', isModalShowing);
    
    if (!loadingModalInstance) {
        loadingModalInstance = new bootstrap.Modal(document.getElementById('loadingModal'));
        console.log('Created new loading modal instance');
        
        // Add event listeners to track modal state
        const modalElement = document.getElementById('loadingModal');
        modalElement.addEventListener('shown.bs.modal', () => {
            console.log('Modal shown event fired');
            isModalShowing = true;
        });
        modalElement.addEventListener('hidden.bs.modal', () => {
            console.log('Modal hidden event fired');
            isModalShowing = false;
        });
    }
    
    if (mode === 'show') {
        if (!isModalShowing) {
            console.log('Showing loading modal');
            loadingModalInstance.show();
            isModalShowing = true;
        }
    } else if (mode === 'hide') {
        if (isModalShowing) {
            console.log('Hiding loading modal');
            isModalShowing = false;
            // Add a small delay to ensure any show animation is complete
            setTimeout(() => {
                try {
                    loadingModalInstance.hide();
                    console.log('Loading modal hidden successfully');
                } catch (error) {
                    console.error('Error hiding loading modal:', error);
                    // Force hide by removing the modal backdrop
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                    document.body.classList.remove('modal-open');
                }
            }, 50); // 50ms delay
        }
    }
};

// Main message function
const arctoiMessage = (sender, type, message) => {
    const m = {
        sender: sender,
        type: type,
        message: message,
        read: false
    };
    arctoiMessages.push(m);

    const time = new Date().toLocaleString();
    const html = `<span class="arctoi-m-time">${time}</span> <span class="arctoi-m-${type}">${sender}: ${message}</span><br />`;
    document.getElementById('arctoi-messages').insertAdjacentHTML('afterbegin', html);
    console.log(`${sender}: *${type}* ${message}`);

    setArctoiMessageCounter();
};

// Clear all messages
const clearArctoiMessage = () => {
    document.getElementById('arctoi-messages').innerHTML = '';
    arctoiMessages = [];
    setArctoiMessageCounter();
};

// Update message counter
const setArctoiMessageCounter = () => {
    const l = arctoiMessages.length;
    let alert = false;
    let warning = false;

    for (const m of arctoiMessages) {
        if (!m.read) {
            if (m.type === 'alert') {
                alert = true;
            }
            if (m.type === 'warning') {
                warning = true;
            }
        }
    }

    const counter = document.getElementById('arctoi-m-counter');
    counter.className = 'arctoi-m-neutral';
    
    if (alert) {
        counter.classList.add('arctoi-m-alert');
    } else if (warning) {
        counter.classList.add('arctoi-m-warning');
    }

    counter.textContent = l;
};

// Message modal open
const ArctoiMessageModalOpen = () => {
    for (const m of arctoiMessages) {
        m.read = true;
    }
};

// Message modal close
const ArctoiMessageModalClose = () => {
    setArctoiMessageCounter();
};
