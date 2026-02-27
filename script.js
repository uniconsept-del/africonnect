// ==========================================
// LAMP LOGIC - FIXED VERSION
// ==========================================

let isLightOn = false;
let isAnimating = false;

function initLamp() {
    console.log('🔧 Initializing lamp...');
    
    const touchLamp = document.getElementById('touchLamp');
    const ropeSwitch = document.getElementById('ropeSwitch');
    const ropeContainer = document.getElementById('ropeSwitchContainer');
    const clickFeedback = document.getElementById('clickFeedback');
    const body = document.body;

    // Debug log
    console.log('Lamp elements:', {
        touchLamp: !!touchLamp,
        ropeSwitch: !!ropeSwitch,
        ropeContainer: !!ropeContainer,
        clickFeedback: !!clickFeedback
    });

    if (!touchLamp || !ropeSwitch || !ropeContainer) {
        console.error('❌ Lamp elements not found', {
            touchLamp: !!touchLamp,
            ropeSwitch: !!ropeSwitch,
            ropeContainer: !!ropeContainer
        });
        return;
    }

    function toggleLight(e) {
        console.log('🔦 Toggle light clicked!');
        
        // Prevent default and stop propagation
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Prevent rapid clicking
        if (isAnimating) {
            console.log('⏳ Animation in progress, skipping...');
            return;
        }
        isAnimating = true;
        
        // Show click feedback animation
        if (clickFeedback) {
            clickFeedback.classList.remove('animate');
            void clickFeedback.offsetWidth; // Trigger reflow
            clickFeedback.classList.add('animate');
        }
        
        // Animate rope pull
        if (ropeSwitch) {
            ropeSwitch.classList.add('pulled');
        }
        
        // Toggle light state
        setTimeout(() => {
            isLightOn = !isLightOn;
            
            if (isLightOn) {
                body.classList.add('lights-on');
                console.log('💡 Light ON');
            } else {
                body.classList.remove('lights-on');
                console.log('💡 Light OFF');
            }
        }, 150);
        
        // Reset rope and animation lock
        setTimeout(() => {
            if (ropeSwitch) {
                ropeSwitch.classList.remove('pulled');
            }
        }, 400);
        
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    // Remove any existing listeners by cloning elements
    const newTouchLamp = touchLamp.cloneNode(true);
    touchLamp.parentNode.replaceChild(newTouchLamp, touchLamp);
    
    const newRopeContainer = newTouchLamp.querySelector('#ropeSwitchContainer');
    const newRopeSwitch = newTouchLamp.querySelector('#ropeSwitch');
    const newClickFeedback = newTouchLamp.querySelector('#clickFeedback');

    // Click on lamp container
    newTouchLamp.addEventListener('click', function(e) {
        console.log('🖱️ Lamp clicked');
        toggleLight(e);
    }, true);
    
    // Click specifically on the rope
    if (newRopeContainer) {
        newRopeContainer.addEventListener('click', function(e) {
            console.log('🪢 Rope clicked');
            e.stopPropagation();
            toggleLight(e);
        }, true);
    }

    // Touch support for mobile
    newTouchLamp.addEventListener('touchstart', function(e) {
        console.log('👆 Lamp touched');
        e.preventDefault();
        toggleLight(e);
    }, { passive: false, capture: true });
    
    if (newRopeContainer) {
        newRopeContainer.addEventListener('touchstart', function(e) {
            console.log('👆 Rope touched');
            e.preventDefault();
            e.stopPropagation();
            toggleLight(e);
        }, { passive: false, capture: true });
    }
    
    console.log('✅ Lamp initialized successfully');
}

// ==========================================
// VERIFICATION PURCHASE SYSTEM
// ==========================================

const VERIF_TIERS = {
    silver:  { icon: '🥈', name: 'Silver Verified',  price: '₦3,000', desc: 'Get the Silver trust badge visible on your profile and in Discovery.' },
    gold:    { icon: '🥇', name: 'Gold Verified',    price: '₦5,000', desc: 'Gold badge + appear higher in Discovery. More visibility, more matches.' },
    diamond: { icon: '💎', name: 'Diamond Verified', price: '₦10,000', desc: 'Diamond badge + top placement in Discovery + unlimited super likes.' }
};

let _pendingVerifTier = null;

function openVerifMenu() {
    toggleMainMenu();
    // Update current badge display
    const display = document.getElementById('verifMenuCurrentBadge');
    if (display && currentUser && currentUser.verificationBadge && currentUser.verificationBadge !== 'none') {
        const t = VERIF_TIERS[currentUser.verificationBadge];
        display.textContent = t ? `Current: ${t.icon} ${t.name}` : '';
    } else if (display) {
        display.textContent = 'No badge yet — choose a tier below';
    }
    document.getElementById('verifMenuModal').classList.add('active');
}

function closeVerifMenu() {
    document.getElementById('verifMenuModal').classList.remove('active');
}

function purchaseVerification(tier) {
    const t = VERIF_TIERS[tier];
    if (!t) return;
    _pendingVerifTier = tier;

    // Close the menu modal if open
    const menuModal = document.getElementById('verifMenuModal');
    if (menuModal) menuModal.classList.remove('active');

    document.getElementById('verifModalIcon').textContent = t.icon;
    document.getElementById('verifModalTitle').textContent = t.name;
    document.getElementById('verifModalDesc').textContent = t.desc;
    document.getElementById('verifModalPrice').textContent = t.price;
    // Update payment step amount
    const payStep = document.getElementById('payStepAmount');
    if (payStep) payStep.textContent = t.price;
    document.getElementById('verifPurchaseModal').classList.add('active');
}

function closeVerifModal() {
    document.getElementById('verifPurchaseModal').classList.remove('active');
    _pendingVerifTier = null;
}

// NOTE: Badge granting is done by admin only via admin.html panel.
// Users pay and notify admin via WhatsApp; admin grants badge from the backend.
async function confirmVerificationPurchase() {
    // This function is now only called by admin panel indirectly.
    // User flow: pay → WhatsApp → admin grants badge.
    closeVerifModal();
}

function updateCurrentBadgeDisplay() {
    const display = document.getElementById('currentBadgeDisplay');
    if (display && currentUser) {
        const tier = currentUser.verificationBadge;
        if (!tier || tier === 'none') {
            display.textContent = '';
        } else {
            display.textContent = VERIF_TIERS[tier]?.icon || '';
        }
    }
    // Also update hamburger menu badge display
    const menuBadge = document.getElementById('menuBadgeDisplay');
    if (menuBadge && currentUser) {
        const tier = currentUser.verificationBadge;
        menuBadge.textContent = (tier && tier !== 'none') ? (VERIF_TIERS[tier]?.icon || '') : '';
    }
}

// Close on overlay click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('verifPurchaseModal');
    if (modal && e.target === modal) closeVerifModal();
});

// ==========================================
// NETWORK STATUS CHECK
// ==========================================

function checkOnlineStatus() {
    const offlineOverlay = document.getElementById('offlineOverlay');
    if (!navigator.onLine) {
        offlineOverlay.classList.add('active');
        return false;
    } else {
        offlineOverlay.classList.remove('active');
        return true;
    }
}

// Accounts are preserved between sessions — do NOT clear on load.



let currentUser = null;
const AFRICA_MAP_URL = 'https://static.vecteezy.com/system/resources/previews/006/580/686/non_2x/map-of-africa-on-black-background-vector.jpg';

async function initAuth() {
    const sessionStr = localStorage.getItem('afriConnect_session');
    if (!sessionStr) return;

    let saved;
    try { saved = JSON.parse(sessionStr); } catch(e) { localStorage.removeItem('afriConnect_session'); return; }
    if (!saved || !saved.username) { localStorage.removeItem('afriConnect_session'); return; }

    const username = saved.username;
    const localUsers = JSON.parse(localStorage.getItem('afriConnect_users') || '{}');

    // ALWAYS restore from local cache first → user never gets logged out on refresh
    if (localUsers[username]) {
        currentUser = localUsers[username];
        if (!document.getElementById('swipe-interface').classList.contains('active')) {
            enterApp();
        }
    }

    // Then sync from Firebase in background
    if (window._firebaseReady) {
        try {
            const snap = await window._dbGet(window._dbRef(window._db, `users/${username}`));
            if (snap.exists()) {
                currentUser = snap.val();
                localUsers[username] = currentUser;
                localStorage.setItem('afriConnect_users', JSON.stringify(localUsers));
                if (document.getElementById('swipe-interface').classList.contains('active')) {
                    loadUserProfile(); // Refresh UI only
                    subscribeToIncomingMessages();
                } else {
                    enterApp();
                }
            } else if (!currentUser) {
                // Account not found anywhere
                localStorage.removeItem('afriConnect_session');
            }
        } catch(err) {
            // Firebase error — already restored from cache above, stay logged in
            console.warn('Firebase sync failed (staying logged in from cache):', err.message);
            if (currentUser && !document.getElementById('swipe-interface').classList.contains('active')) {
                enterApp();
            }
        }
    } else if (!currentUser) {
        // No Firebase and no local cache
        localStorage.removeItem('afriConnect_session');
    }
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        tabs[0].classList.add('active');
    } else {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
        tabs[1].classList.add('active');
    }
    
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('signupError').style.display = 'none';
    document.getElementById('signupSuccess').style.display = 'none';
}

async function handleLogin(e) {
    e.preventDefault();
    
    if (!checkOnlineStatus()) {
        showToast("You are offline. Please check your connection.");
        return;
    }
    
    const username = document.getElementById('loginUsername').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Logging in...'; }
    
    const withTimeout = (promise, ms) => Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ]);

    try {
        if (window._firebaseReady) {
            const snapshot = await withTimeout(
                window._dbGet(window._dbRef(window._db, `users/${username}`)), 8000
            );
            if (!snapshot.exists()) {
                errorDiv.textContent = 'Account does not exist. Please sign up first.';
                errorDiv.style.display = 'block';
                if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
                return;
            }
            const userData = snapshot.val();
            if (userData.password !== password) {
                errorDiv.textContent = 'Incorrect password. Please try again.';
                errorDiv.style.display = 'block';
                if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
                return;
            }
            currentUser = userData;
            // Cache locally for fast restore
            const localUsers = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
            localUsers[username] = userData;
            localStorage.setItem('afriConnect_users', JSON.stringify(localUsers));
        } else {
            // Fallback to localStorage
            const users = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
            if (!users[username]) {
                errorDiv.textContent = 'Account does not exist. Please sign up first.';
                errorDiv.style.display = 'block';
                if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
                return;
            }
            if (users[username].password !== password) {
                errorDiv.textContent = 'Incorrect password. Please try again.';
                errorDiv.style.display = 'block';
                if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
                return;
            }
            currentUser = users[username];
        }
        
        localStorage.setItem('afriConnect_session', JSON.stringify({ username: currentUser.username }));
        showToast('Welcome back! 🎉');
        if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
        enterApp();
        subscribeToIncomingMessages();
    } catch (err) {
        console.error('Login error:', err);
        if (err.message === 'timeout') {
            errorDiv.textContent = '⚠️ Connection timed out. Check your Firebase database rules — go to Firebase Console → Realtime Database → Rules → set read/write to true → Publish.';
        } else if (err.message && err.message.includes('permission')) {
            errorDiv.textContent = '⚠️ Permission denied. Go to Firebase Console → Realtime Database → Rules → set read/write to true → Publish.';
        } else {
            errorDiv.textContent = 'Login error: ' + (err.message || 'Please try again.');
        }
        errorDiv.style.display = 'block';
        if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    if (!checkOnlineStatus()) {
        showToast("You are offline. Please check your connection.");
        return;
    }
    
    const username = document.getElementById('signupUsername').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    const errorDiv = document.getElementById('signupError');
    const successDiv = document.getElementById('signupSuccess');
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }
    
    if (username.length < 3) {
        errorDiv.textContent = 'Username must be at least 3 characters.';
        errorDiv.style.display = 'block';
        if (btn) { btn.disabled = false; btn.textContent = 'Sign Up'; }
        return;
    }
    
    if (password.length < 4) {
        errorDiv.textContent = 'Password must be at least 4 characters.';
        errorDiv.style.display = 'block';
        if (btn) { btn.disabled = false; btn.textContent = 'Sign Up'; }
        return;
    }
    
    // Validate username (no special chars that break Firebase paths)
    if (!/^[a-z0-9_]+$/.test(username)) {
        errorDiv.textContent = 'Username can only contain letters, numbers, and underscores. No spaces or special characters.';
        errorDiv.style.display = 'block';
        if (btn) { btn.disabled = false; btn.textContent = 'Sign Up'; }
        return;
    }
    
    const newUser = {
        username: username,
        password: password,
        profile: {
            name: username.charAt(0).toUpperCase() + username.slice(1),
            age: 24,
            bio: 'New to AfriConnect',
            job: '',
            company: '',
            school: '',
            phone: '',
            gender: 'woman',
            lookingFor: 'everyone',
            distance: 50,
            ageMin: 22,
            ageMax: 30,
            photos: [AFRICA_MAP_URL]
        },
        matches: [],
        chats: [],
        adverts: [],
        notifications: [],
        friends: []
    };
    
    try {
        if (window._firebaseReady) {
            // Wrap Firebase calls with a timeout so it never hangs forever
            const withTimeout = (promise, ms) => Promise.race([
                promise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
            ]);

            // Check if username already exists in Firebase
            const snapshot = await withTimeout(
                window._dbGet(window._dbRef(window._db, `users/${username}`)), 8000
            );
            if (snapshot.exists()) {
                errorDiv.textContent = 'Username already exists. Please choose another.';
                errorDiv.style.display = 'block';
                if (btn) { btn.disabled = false; btn.textContent = 'Sign Up'; }
                return;
            }
            // Save to Firebase
            await withTimeout(
                window._dbSet(window._dbRef(window._db, `users/${username}`), newUser), 8000
            );
        } else {
            // Fallback to localStorage
            const users = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
            if (users[username]) {
                errorDiv.textContent = 'Username already exists. Please choose another.';
                errorDiv.style.display = 'block';
                if (btn) { btn.disabled = false; btn.textContent = 'Sign Up'; }
                return;
            }
            users[username] = newUser;
            localStorage.setItem('afriConnect_users', JSON.stringify(users));
        }
        
        currentUser = newUser;
        // Also cache in localStorage for fast session restore
        const localUsers = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
        localUsers[username] = newUser;
        localStorage.setItem('afriConnect_users', JSON.stringify(localUsers));
        localStorage.setItem('afriConnect_session', JSON.stringify({ username: currentUser.username }));
        
        successDiv.textContent = 'Account created successfully! Redirecting...';
        successDiv.style.display = 'block';
        if (btn) { btn.disabled = false; btn.textContent = 'Sign Up'; }
        
        setTimeout(() => {
            showToast('Welcome to AfriConnect! 🎉');
            enterApp();
            subscribeToIncomingMessages();
        }, 1000);
    } catch (err) {
        console.error('Signup error:', err);
        if (err.message === 'timeout') {
            errorDiv.textContent = '⚠️ Connection timed out. Check your Firebase database rules — go to Firebase Console → Realtime Database → Rules → set read/write to true → Publish.';
        } else if (err.code === 'PERMISSION_DENIED' || (err.message && err.message.includes('permission'))) {
            errorDiv.textContent = '⚠️ Permission denied. Go to Firebase Console → Realtime Database → Rules → set read/write to true → Publish.';
        } else {
            errorDiv.textContent = 'Error creating account: ' + (err.message || 'Please try again.');
        }
        errorDiv.style.display = 'block';
        if (btn) { btn.disabled = false; btn.textContent = 'Sign Up'; }
    }
}

// ==========================================
// INITIALIZE STARTER CONTENT FOR NEW USERS
// ==========================================

function initializeStarterContent() {
    if (!currentUser) return;
    
    // If user already has matches and chats, don't override them
    if (currentUser.matches && currentUser.matches.length > 0) return;
    
    // Select 5-8 random bot profiles as initial matches
    const botProfiles = profiles.filter(p => p.isBot);
    const shuffled = botProfiles.sort(() => 0.5 - Math.random());
    const starterMatches = shuffled.slice(0, Math.floor(Math.random() * 4) + 5); // 5-8 matches
    
    currentUser.matches = starterMatches.map(profile => ({
        name: profile.name,
        age: profile.age,
        bio: profile.bio,
        distance: profile.distance,
        job: profile.job,
        company: profile.company,
        school: profile.school,
        phone: profile.phone,
        country: profile.country,
        gender: profile.gender,
        img: profile.img,
        photos: profile.photos,
        verified: profile.verified,
        verificationBadge: profile.verificationBadge,
        isBot: profile.isBot,
        lastActive: ['Just now', '5m ago', '2h ago', 'Today'][Math.floor(Math.random() * 4)]
    }));
    
    // Create 2-3 starter chat conversations
    const starterChats = starterMatches.slice(0, Math.floor(Math.random() * 2) + 2).map(profile => {
        const greetings = [
            "Hey! I saw your profile and thought we'd vibe 😊",
            "Hi there! You seem really interesting. How's your day going?",
            "Hello! I love your profile. What do you do for fun?",
            "Hey! Nice to match with you. Tell me something interesting about yourself!",
            "Hi! I'm excited to chat with you. What brought you to AfriConnect?"
        ];
        
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        
        return {
            name: profile.name,
            message: greeting,
            time: ['Just now', '5m ago', '1h ago', '2h ago'][Math.floor(Math.random() * 4)],
            unread: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : 0,
            img: profile.img,
            bio: profile.bio,
            job: profile.job,
            company: profile.company,
            school: profile.school,
            phone: profile.phone,
            age: profile.age,
            photos: profile.photos,
            isBot: profile.isBot
        };
    });
    
    currentUser.chats = starterChats;
    
    // Initialize chat histories with the greeting messages
    starterChats.forEach(chat => {
        chatHistories[chat.name] = [
            { text: "You matched! Say hello 👋", sent: false, time: "Earlier" },
            { text: chat.message, sent: false, time: chat.time }
        ];
    });
    
    // Save to storage
    if (window._firebaseReady) {
        window._dbSet(window._dbRef(window._db, `users/${currentUser.username}`), currentUser);
    }
    const users = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
    users[currentUser.username] = currentUser;
    localStorage.setItem('afriConnect_users', JSON.stringify(users));
    localStorage.setItem('afriConnect_session', JSON.stringify({ username: currentUser.username }));
}

function enterApp() {
    document.getElementById('interface-container').style.display = 'none';
    document.getElementById('touchLamp').style.display = 'none';
    document.getElementById('africaMapBg').style.opacity = '0';
    document.getElementById('swipe-interface').classList.add('active');
    
    // Re-apply the saved view mode now that the app is visible
    setTimeout(() => {
        if (typeof setViewMode === 'function') {
            const saved = localStorage.getItem('africonnect_viewmode') || 'mobile';
            setViewMode(saved);
        }
    }, 50);
    
    // Initialize starter matches and chats for new users
    initializeStarterContent();
    
    loadUserProfile();
    initDiscovery();
    initFlashView();
    initGroups();
    initMatches();
    initChats();
    initMarket();
    updateNotificationBadge();
    applySavedTheme();
    
    // Load all Firebase users and subscribe to real-time messages
    loadFirebaseUsers();
    subscribeToIncomingMessages();
    
    setTimeout(() => {
        if (Math.random() > 0.5) {
            showEniolaWelcome();
        }
    }, 3000);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('afriConnect_session');
    document.getElementById('swipe-interface').classList.remove('active');
    document.getElementById('interface-container').style.display = 'flex';
    document.getElementById('interface-container').style.opacity = '1';
    document.getElementById('touchLamp').style.display = 'flex';
    document.getElementById('africaMapBg').style.opacity = '0.4';
    
    document.getElementById('loginForm').reset();
    document.getElementById('signupForm').reset();
    switchAuthTab('login');
    
    toggleMainMenu();
}

function loadUserProfile() {
    if (!currentUser || !currentUser.profile) return;
    const p = currentUser.profile;
    const fallback = AFRICA_MAP_URL;
    const avatar = (p.photos && p.photos[0]) ? p.photos[0] : fallback;

    // Avatars
    ['userAvatar','menuUserAvatar'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.src = avatar;
        el.onerror = () => { el.src = fallback; };
    });

    // Name display in menu + profile header
    const menuName = document.getElementById('menuUserName');
    if (menuName) menuName.textContent = p.name || currentUser.username;

    const dispName = document.getElementById('profileDisplayName');
    const dispAge  = document.getElementById('profileDisplayAge');
    if (dispName) dispName.textContent = p.name || currentUser.username;
    if (dispAge)  dispAge.textContent  = p.age ? `${p.age} years old` : '';

    // Form fields
    const f = (id, val) => { const el = document.getElementById(id); if (el) el.value = (val !== undefined && val !== null) ? val : ''; };
    f('profileName',    p.name);
    f('profileAge',     p.age);
    f('profileBio',     p.bio);
    f('profileJob',     p.job);
    f('profileCompany', p.company);
    f('profileSchool',  p.school);
    f('profilePhone',   p.phone);
    f('lookingFor',     p.lookingFor || 'everyone');

    const dist = document.getElementById('distanceSlider');
    const distV = document.getElementById('distanceValue');
    if (dist)  dist.value = p.distance || 50;
    if (distV) distV.textContent = (p.distance || 50) + ' km';

    const amin = document.getElementById('ageMin');
    const amax = document.getElementById('ageMax');
    const aval = document.getElementById('ageValue');
    if (amin)  amin.value = p.ageMin || 22;
    if (amax)  amax.value = p.ageMax || 30;
    if (aval)  aval.textContent = (p.ageMin || 22) + ' - ' + (p.ageMax || 30);

    // Gender highlight
    document.querySelectorAll('.gender-option').forEach(opt => {
        opt.classList.remove('selected');
        const onclick = opt.getAttribute('onclick') || '';
        if (onclick.includes(`'${p.gender}'`)) opt.classList.add('selected');
    });

    renderPhotoGrid();
    updateCurrentBadgeDisplay();
}

async function saveProfile() {
    if (!currentUser) return;
    
    currentUser.profile.name = document.getElementById('profileName').value;
    currentUser.profile.age = document.getElementById('profileAge').value;
    currentUser.profile.bio = document.getElementById('profileBio').value;
    currentUser.profile.job = document.getElementById('profileJob').value;
    currentUser.profile.company = document.getElementById('profileCompany').value;
    currentUser.profile.school = document.getElementById('profileSchool').value;
    currentUser.profile.phone = document.getElementById('profilePhone').value;
    currentUser.profile.distance = document.getElementById('distanceSlider').value;
    currentUser.profile.ageMin = document.getElementById('ageMin').value;
    currentUser.profile.ageMax = document.getElementById('ageMax').value;
    currentUser.profile.lookingFor = document.getElementById('lookingFor').value;
    
    if (window._firebaseReady) {
        await window._dbSet(window._dbRef(window._db, `users/${currentUser.username}`), currentUser);
    }
    // Also keep localStorage as cache
    const users = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
    users[currentUser.username] = currentUser;
    localStorage.setItem('afriConnect_users', JSON.stringify(users));
    localStorage.setItem('afriConnect_session', JSON.stringify({ username: currentUser.username }));
    
    document.getElementById('menuUserName').textContent = currentUser.profile.name;
    
    showToast("Profile saved! ✓");
}

// ==========================================
// USER SEARCH
// ==========================================

function searchUsers(query) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (!query.trim()) {
        resultsContainer.classList.remove('active');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
    const allProfiles = getAllDiscoverableProfiles();
    
    const filteredUsers = allProfiles.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) && 
        user.name !== (currentUser ? currentUser.profile.name : '')
    );
    
    if (filteredUsers.length === 0) {
        resultsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">No users found</div>';
        resultsContainer.classList.add('active');
        return;
    }
    
    resultsContainer.innerHTML = filteredUsers.map(user => {
        const isFriend = currentUser && currentUser.friends && currentUser.friends.includes(user.name);
        return `
        <div class="search-result-item" onclick="viewProfileDetails('${user.name}', 'discover')">
            <img src="${user.img}" alt="${user.name}">
            <div class="search-result-info">
                <div class="search-result-name">${user.name}, ${user.age}</div>
                <div class="search-result-meta">${user.country || 'Africa'} • ${user.distance}</div>
            </div>
            <button class="add-friend-btn ${isFriend ? 'added' : ''}" onclick="event.stopPropagation(); toggleFriend('${user.name}', this)">
                ${isFriend ? '<i class="fas fa-check"></i> Added' : '<i class="fas fa-user-plus"></i> Add'}
            </button>
        </div>
    `}).join('');
    
    resultsContainer.classList.add('active');
}

function toggleFriend(userName, btn) {
    if (!currentUser) return;
    
    if (!currentUser.friends) currentUser.friends = [];
    
    const index = currentUser.friends.indexOf(userName);
    if (index > -1) {
        currentUser.friends.splice(index, 1);
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Add';
        btn.classList.remove('added');
        showToast(`Removed ${userName} from friends`);
    } else {
        currentUser.friends.push(userName);
        btn.innerHTML = '<i class="fas fa-check"></i> Added';
        btn.classList.add('added');
        showToast(`Added ${userName} as friend! 🎉`);
        
        addNotification({
            id: Date.now(),
            type: 'friend',
            user: userName,
            avatar: getUserAvatar(userName),
            text: `You added <strong>${userName}</strong> as a friend!`,
            time: 'Just now',
            read: false
        });
    }
    
    const users = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
    users[currentUser.username] = currentUser;
    localStorage.setItem('afriConnect_users', JSON.stringify(users));
    localStorage.setItem('afriConnect_session', JSON.stringify(currentUser));
}

function getUserAvatar(userName) {
    const allProfiles = getAllDiscoverableProfiles();
    const user = allProfiles.find(p => p.name === userName);
    return user ? user.img : AFRICA_MAP_URL;
}

// ==========================================
// ENIOLA BOT
// ==========================================

function toggleEniola() {
    const chat = document.getElementById('eniolaChat');
    chat.classList.toggle('active');
}

function showEniolaWelcome() {
    const chat = document.getElementById('eniolaChat');
    chat.classList.add('active');
    
    setTimeout(() => {
        addEniolaMessage(`Hello! I'm ENIOLA, your AfriConnect assistant. Welcome! How can I help you today?`);
    }, 500);
    
    setTimeout(() => {
        if (!document.getElementById('eniolaChat').matches(':hover')) {
            chat.classList.remove('active');
        }
    }, 10000);
}

function askEniola(topic) {
    const responses = {
        'how': 'AfriConnect is simple! Browse profiles in Discover, like those you\'re interested in. If they like you back, it\'s a match! You can then chat and connect.',
        'discover': 'In Discover, you\'ll see profiles from across Africa. Tap the heart to like, X to pass, or star to super like. Filter by gender using the dropdown!',
        'market': 'The African Market Zone is where you can buy and sell items. Create your own advert by clicking the + button. No food items allowed!',
        'groups': 'Community Groups let you chat with people from specific countries and regions. Join your home state or explore other regions!',
        'safety': 'Always meet in public places, tell a friend where you\'re going, and trust your instincts. Never share financial information. Stay safe!'
    };
    
    addEniolaMessage(responses[topic] || 'I\'m here to help! Try asking about Discover, Marketplace, Groups, or Safety.');
}

function addEniolaMessage(text) {
    const container = document.getElementById('eniolaMessages');
    const msg = document.createElement('div');
    msg.className = 'eniola-message';
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

// ==========================================
// DATA STATE
// ==========================================

let userProfile = {
    name: "Amara",
    age: 24,
    bio: "Loves jazz, sunset walks, and deep conversations. Looking for someone who appreciates culture and authenticity.",
    job: "Marketing Manager",
    company: "Creative Arts Agency",
    school: "University of Lagos",
    phone: "801 234 5678",
    gender: "woman",
    lookingFor: "everyone",
    distance: 50,
    ageMin: 22,
    ageMax: 30,
    photos: [AFRICA_MAP_URL]
};

let chatHistories = {};
let groupChatHistories = {};
let currentChatUser = null;
let currentGroupRoom = null;
let myAdverts = [];
let notifications = [];

// African Bot Profiles — 20 diverse profiles across Africa
const profiles = [
    {
        name: "Amara Osei", age: 26,
        bio: "Graphic designer from Accra who loves Afrobeats, jollof rice debates, and late-night conversations. Looking for someone genuine.",
        distance: "2 km", job: "Graphic Designer", company: "Kente Creative Studio", school: "KNUST",
        phone: "+233 24 456 7890", country: "Ghana 🇬🇭", gender: "female",
        img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=500&fit=crop&crop=face"],
        verified: true, isBot: true
    },
    {
        name: "Kofi Mensah", age: 29,
        bio: "Civil engineer building bridges literally and figuratively. Football fanatic, Arsenal till I die. Based in Kumasi.",
        distance: "5 km", job: "Civil Engineer", company: "Ghana Infrastructure Co.", school: "University of Ghana",
        phone: "+233 20 123 4567", country: "Ghana 🇬🇭", gender: "male",
        img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face"],
        verified: false, isBot: true
    },
    {
        name: "Zara Bello", age: 24,
        bio: "Fashion blogger from Lagos. Aso-oke enthusiast. If you can't handle a woman who knows what she wants, move along 💅",
        distance: "1 km", job: "Content Creator", company: "ZaraStyleNG", school: "University of Lagos",
        phone: "+234 802 345 6789", country: "Nigeria 🇳🇬", gender: "female",
        img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop&crop=face"],
        verified: true, isBot: true
    },
    {
        name: "Emeka Okafor", age: 31,
        bio: "Naija doctor at Lagos Island General. I cook better than I prescribe. Looking for my partner in crime and jollof.",
        distance: "8 km", job: "Medical Doctor", company: "Lagos Island General Hospital", school: "University of Ibadan",
        phone: "+234 803 567 8901", country: "Nigeria 🇳🇬", gender: "male",
        img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face"],
        verified: true, isBot: true
    },
    {
        name: "Fatou Diallo", age: 27,
        bio: "Dakar-born, Nairobi-living. Journalist covering East Africa. Passionate about Pan-Africanism and good coffee.",
        distance: "3 km", job: "Journalist", company: "Africa Now Media", school: "Université Cheikh Anta Diop",
        phone: "+254 712 345 678", country: "Senegal 🇸🇳", gender: "female",
        img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&crop=face"],
        verified: true, isBot: true
    },
    {
        name: "Tendai Moyo", age: 28,
        bio: "Software developer from Harare, now in Joburg. I build apps by day and braai by night.",
        distance: "12 km", job: "Software Developer", company: "Takura Tech", school: "University of Zimbabwe",
        phone: "+263 77 234 5678", country: "Zimbabwe 🇿🇼", gender: "male",
        img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&crop=face"],
        verified: false, isBot: true
    },
    {
        name: "Akosua Agyeman", age: 23,
        bio: "Medical student in Accra, future paediatrician. I dance highlife in my kitchen. Serious inquiries only.",
        distance: "4 km", job: "Medical Student", company: "University of Ghana Medical School", school: "University of Ghana",
        phone: "+233 26 789 0123", country: "Ghana 🇬🇭", gender: "female",
        img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=500&fit=crop&crop=face"],
        verified: false, isBot: true
    },
    {
        name: "Chukwuemeka Eze", age: 33,
        bio: "Entrepreneur from Enugu, Lagos-based. Built 2 startups, failed at 1, learning from both. Suya connoisseur.",
        distance: "6 km", job: "Entrepreneur", company: "EzeVentures", school: "Enugu State University",
        phone: "+234 806 789 0123", country: "Nigeria 🇳🇬", gender: "male",
        img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face"],
        verified: true, isBot: true
    },
    {
        name: "Nadia Kamara", age: 25,
        bio: "Architect from Abidjan redesigning African cities one blueprint at a time. Lover of waakye and authentic people.",
        distance: "9 km", job: "Architect", company: "CI Urban Design Bureau", school: "INPHB Yamoussoukro",
        phone: "+225 07 123 4567", country: "Côte d'Ivoire 🇨🇮", gender: "female",
        img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=500&fit=crop&crop=face"],
        verified: false, isBot: true
    },
    {
        name: "Segun Adeyemi", age: 30,
        bio: "Music producer from Lagos working with top Afrobeats artists. Studio life is real life.",
        distance: "7 km", job: "Music Producer", company: "Afrowave Studios", school: "University of Lagos",
        phone: "+234 801 234 5678", country: "Nigeria 🇳🇬", gender: "male",
        img: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=500&fit=crop&crop=face"],
        verified: true, isBot: true
    },
    {
        name: "Nia Omondi", age: 25,
        bio: "Marine biologist from Mombasa studying coral reefs. Ocean lover, beach girl, terrible cook but great at ordering food 😂",
        distance: "11 km", job: "Marine Biologist", company: "Kenya Marine Research Institute", school: "University of Nairobi",
        phone: "+254 722 456 789", country: "Kenya 🇰🇪", gender: "female",
        img: "https://images.unsplash.com/photo-1502764613149-7f1d229e230f?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1502764613149-7f1d229e230f?w=400&h=500&fit=crop&crop=face"],
        verified: true, isBot: true
    },
    {
        name: "Kwame Asante", age: 34,
        bio: "Investment banker, Accra. I work hard and play harder. Weekend hiker, jollof judge, and your next favourite conversation.",
        distance: "15 km", job: "Investment Banker", company: "Accra Capital Partners", school: "Ashesi University",
        phone: "+233 24 987 6543", country: "Ghana 🇬🇭", gender: "male",
        img: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=500&fit=crop&crop=face"],
        verified: true, isBot: true
    },
    {
        name: "Amira Hassan", age: 26,
        bio: "Fashion designer in Cairo blending ancient Egyptian motifs with modern streetwear. I travel with my sketchbook everywhere.",
        distance: "10 km", job: "Fashion Designer", company: "Nile Stitch Studio", school: "Cairo University",
        phone: "+20 100 234 5678", country: "Egypt 🇪🇬", gender: "female",
        img: "https://images.unsplash.com/photo-1519419691348-3b3433c4c20e?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1519419691348-3b3433c4c20e?w=400&h=500&fit=crop&crop=face"],
        verified: true, isBot: true
    },
    {
        name: "Tariq Ndiaye", age: 29,
        bio: "Footballer turned sports journalist in Dakar. Fluent in Wolof, French and football. Life is a beautiful game.",
        distance: "18 km", job: "Sports Journalist", company: "Dakar Sports Network", school: "UCAD",
        phone: "+221 77 345 6789", country: "Senegal 🇸🇳", gender: "male",
        img: "https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=400&h=500&fit=crop&crop=face"],
        verified: false, isBot: true
    },
    {
        name: "Lerato Dlamini", age: 27,
        bio: "Human rights lawyer in Johannesburg fighting for justice one case at a time. I'm fluent in three languages and sarcasm.",
        distance: "5 km", job: "Human Rights Lawyer", company: "Ubuntu Legal Aid", school: "University of Cape Town",
        phone: "+27 82 345 6789", country: "South Africa 🇿🇦", gender: "female",
        img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop&crop=face"],
        verified: true, isBot: true
    },
    {
        name: "Sipho Zulu", age: 32,
        bio: "Game ranger and wildlife photographer in Kruger. I speak lion. Looking for someone wild enough to keep up.",
        distance: "22 km", job: "Wildlife Photographer", company: "Kruger Nature Reserve", school: "Nelson Mandela University",
        phone: "+27 83 456 7890", country: "South Africa 🇿🇦", gender: "male",
        img: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=500&fit=crop&crop=face"],
        verified: false, isBot: true
    },
    {
        name: "Yetunde Adewale", age: 28,
        bio: "Yoruba princess turned software engineer. I build fintech solutions by day and watch Nollywood by night. #TechAfrika",
        distance: "3 km", job: "Software Engineer", company: "Flutterwave", school: "Covenant University",
        phone: "+234 807 890 1234", country: "Nigeria 🇳🇬", gender: "female",
        img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop&crop=face"],
        verified: true, isBot: true
    },
    {
        name: "Abebe Girma", age: 30,
        bio: "Marathon runner and coffee farmer from Addis Ababa. Ethiopia gave the world coffee and I'm its proudest ambassador.",
        distance: "13 km", job: "Coffee Farmer & Athlete", company: "Girma Coffee Estate", school: "Addis Ababa University",
        phone: "+251 91 234 5678", country: "Ethiopia 🇪🇹", gender: "male",
        img: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=500&fit=crop&crop=face"],
        verified: false, isBot: true
    },
    {
        name: "Adaeze Nwosu", age: 22,
        bio: "Final year law student at UNILAG. Passionate about constitutional law, Afropop and making the best egusi soup in Lagos.",
        distance: "2 km", job: "Law Student", company: "University of Lagos", school: "University of Lagos",
        phone: "+234 808 901 2345", country: "Nigeria 🇳🇬", gender: "female",
        img: "https://images.unsplash.com/photo-1596215143317-eb7c7e8eb5fc?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1596215143317-eb7c7e8eb5fc?w=400&h=500&fit=crop&crop=face"],
        verified: false, isBot: true
    },
    {
        name: "Musa Traore", age: 31,
        bio: "Chef and restaurateur in Bamako. My restaurant fuses Malian and French cuisine. Food is love made visible — come dine with me.",
        distance: "8 km", job: "Chef & Restaurateur", company: "Bamako Fusion Kitchen", school: "Institut Paul Bocuse",
        phone: "+223 76 234 5678", country: "Mali 🇲🇱", gender: "male",
        img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=face"],
        verified: true, isBot: true
    }
];

let matches = [];
let chats = [];

const africanCountries = [
    {
        name: "Nigeria",
        flag: "🇳🇬",
        code: "+234",
        rooms: [
            "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
            "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
            "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
            "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
            "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT Abuja"
        ]
    },
    {
        name: "Ghana",
        flag: "🇬🇭",
        code: "+233",
        rooms: [
            "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra",
            "North East", "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North"
        ]
    },
    {
        name: "Kenya",
        flag: "🇰🇪",
        code: "+254",
        rooms: [
            "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa",
            "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
            "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos",
            "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a",
            "Nairobi City", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri",
            "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi", "Trans Nzoia",
            "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
        ]
    },
    {
        name: "South Africa",
        flag: "🇿🇦",
        code: "+27",
        rooms: [
            "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga",
            "North West", "Northern Cape", "Western Cape"
        ]
    },
    {
        name: "Uganda",
        flag: "🇺🇬",
        code: "+256",
        rooms: [
            "Abim", "Adjumani", "Agago", "Alebtong", "Amolatar", "Amudat", "Amuria", "Amuru",
            "Apac", "Arua", "Budaka", "Bududa", "Bugiri", "Buhweju", "Buikwe", "Bukedea",
            "Bukomansimbi", "Bukwo", "Bulambuli", "Buliisa", "Bundibugyo", "Bunyangabu",
            "Bushenyi", "Busia", "Butaleja", "Butambala", "Butebo", "Buvuma", "Buyende",
            "Dokolo", "Gomba", "Gulu", "Hoima", "Ibanda", "Iganga", "Isingiro", "Jinja",
            "Kaabong", "Kabale", "Kabarole", "Kaberamaido", "Kagadi", "Kakumiro", "Kalangala",
            "Kaliro", "Kalungu", "Kampala", "Kamuli", "Kamwenge", "Kanungu", "Kapchorwa",
            "Kapelebyong", "Karenga", "Kasanda", "Kasese", "Katakwi", "Kayunga", "Kazo",
            "Kibaale", "Kiboga", "Kibuku", "Kigulu", "Kiruhura", "Kiryandongo", "Kisoro",
            "Kitagwenda", "Kitgum", "Koboko", "Kole", "Kotido", "Kumi", "Kwania", "Kween",
            "Kyankwanzi", "Kyegegwa", "Kyenjojo", "Kyotera", "Lamwo", "Lira", "Luuka", "Luwero",
            "Lwengo", "Lyantonde", "Manafwa", "Maracha", "Masaka", "Masindi", "Mayuge", "Mbale",
            "Mbarara", "Mitooma", "Mityana", "Moroto", "Moyo", "Mpigi", "Mubende", "Mukono",
            "Nabilatuk", "Nakapiripirit", "Nakaseke", "Nakasongola", "Namayingo", "Namisindwa",
            "Namutumba", "Napak", "Nebbi", "Ngora", "Ntoroko", "Ntungamo", "Nwoya", "Omoro",
            "Otuke", "Oyam", "Pader", "Pakwach", "Pallisa", "Rakai", "Rubanda", "Rubirizi",
            "Rukiga", "Rukungiri", "Rwampara", "Serere", "Sheema", "Sironko", "Soroti", "Tororo",
            "Wakiso", "Yumbe", "Zombo"
        ]
    },
    {
        name: "Tanzania",
        flag: "🇹🇿",
        code: "+255",
        rooms: [
            "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera", "Katavi",
            "Kigoma", "Kilimanjaro", "Lindi", "Manyara", "Mara", "Mbeya", "Mjini Magharibi",
            "Morogoro", "Mtwara", "Mwanza", "Njombe", "Pemba North", "Pemba South", "Pwani",
            "Rukwa", "Ruvuma", "Shinyanga", "Simiyu", "Singida", "Songwe", "Tabora", "Tanga"
        ]
    }
];

function initializeChatHistories() {
    chatHistories = {};
    chats.forEach(chat => {
        chatHistories[chat.name] = [
            { text: chat.message, sent: false, time: chat.time }
        ];
    });
}

// ==========================================
// NAVIGATION & BACK BUTTON SYSTEM
// ==========================================

// Stack of navigation states for back button support
const _navHistory = [];
let _ignorePopState = false;

function _pushNav(state) {
    _navHistory.push(state);
    history.pushState(state, '');
}

// Master "go back" — closes the topmost thing open
function navigateBack() {
    // Priority: close modals/panels before going between sections
    if (_isVisible('chatBox')) { closeChat(); return; }
    if (_isVisible('groupChatBox')) { closeGroupChat(); return; }
    if (_isVisible('profileModal')) { closeProfileModal(); return; }
    if (_isVisible('marketDetailModal')) { closeMarketDetail(); return; }
    if (_isVisible('createAdvertModal')) { closeCreateAdvert(); return; }
    if (_isVisible('notificationPanel')) {
        document.getElementById('notificationPanel').classList.remove('active');
        return;
    }
    if (_isVisible('mainMenuPanel')) { toggleMainMenu(); return; }
    // If on a section other than Discover, go back to Discover
    const active = document.querySelector('.app-section.active');
    if (active && active.id !== 'section-swipe') {
        showSection('swipe', true);
        return;
    }
    // Nothing else to close — let the browser handle it
    history.back();
}

function _isVisible(id) {
    const el = document.getElementById(id);
    return el && (el.classList.contains('active') || el.style.display === 'flex');
}

// Browser back/forward button handler
window.addEventListener('popstate', () => {
    if (_ignorePopState) return;
    _ignorePopState = true;
    navigateBack();
    setTimeout(() => { _ignorePopState = false; }, 50);
});

// ==========================================
// MAIN MENU FUNCTIONS
// ==========================================

function toggleMainMenu() {
    const overlay = document.getElementById('mainMenuOverlay');
    const panel = document.getElementById('mainMenuPanel');
    const opening = !panel.classList.contains('active');
    overlay.classList.toggle('active');
    panel.classList.toggle('active');
    if (opening) _pushNav({ type: 'menu' });
}

function showSectionFromMenu(section) {
    toggleMainMenu();
    showSection(section, true);
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (section === 'swipe') document.querySelectorAll('.nav-item')[0].classList.add('active');
    else if (section === 'flashview') document.querySelectorAll('.nav-item')[1].classList.add('active');
    else if (section === 'matches') document.querySelectorAll('.nav-item')[2].classList.add('active');
    else if (section === 'messages') document.querySelectorAll('.nav-item')[3].classList.add('active');
}

function showSection(section, pushState = true) {
    document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`section-${section}`).classList.add('active');
    if (typeof event !== 'undefined' && event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    if (pushState) _pushNav({ type: 'section', section });
}

// ==========================================
// VERIFICATION BADGE HELPER
// ==========================================

function getVerificationBadge(profile) {
    const tier = profile.verificationBadge || (profile.verified ? 'silver' : null);
    if (!tier || tier === 'none') return '';
    const badges = {
        silver:  { icon: '🥈', label: 'Silver Verified',  color: '#94a3b8' },
        gold:    { icon: '🥇', label: 'Gold Verified',    color: '#fbbf24' },
        diamond: { icon: '💎', label: 'Diamond Verified', color: '#67e8f9' }
    };
    const b = badges[tier];
    if (!b) return '';
    return `<span title="${b.label}" style="font-size:12px; cursor:default;">${b.icon}</span>`;
}

function getVerificationBadgeFull(profile) {
    const tier = profile.verificationBadge || (profile.verified ? 'silver' : null);
    if (!tier || tier === 'none') return '';
    const badges = {
        silver:  { icon: '🥈', label: 'Silver Verified',  color: '#94a3b8' },
        gold:    { icon: '🥇', label: 'Gold Verified',    color: '#fbbf24' },
        diamond: { icon: '💎', label: 'Diamond Verified', color: '#67e8f9' }
    };
    const b = badges[tier];
    if (!b) return '';
    return `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(0,0,0,0.4);border:1px solid ${b.color}40;border-radius:20px;padding:2px 8px;font-size:11px;color:${b.color};">${b.icon} ${b.label}</span>`;
}

// ==========================================
// DISCOVERY FUNCTIONS
// ==========================================

function getAllDiscoverableProfiles() {
    // Combine hardcoded profiles with registered users from localStorage
    const users = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
    const allProfiles = [...profiles];
    
    // Add users from _firebaseUsersCache if available (populated by loadFirebaseUsers)
    const firebaseUsers = window._firebaseUsersCache || {};
    const mergedUsers = Object.assign({}, users, firebaseUsers);
    
    Object.values(mergedUsers).forEach(user => {
        if (currentUser && user.username === currentUser.username) return;
        
        const exists = allProfiles.some(p => p.name === (user.profile && user.profile.name ? user.profile.name : user.username));
        if (!exists) {
            const userProfile = {
                name: user.profile.name || user.username,
                age: user.profile.age || 24,
                bio: user.profile.bio || 'New to AfriConnect',
                distance: `${Math.floor(Math.random() * 20) + 1} km`,
                job: user.profile.job || 'Member',
                company: user.profile.company || 'AfriConnect',
                school: user.profile.school || '',
                phone: user.profile.phone || '',
                country: 'Africa',
                gender: user.profile.gender === 'man' ? 'male' : (user.profile.gender === 'woman' ? 'female' : 'other'),
                img: user.profile.photos && user.profile.photos.length > 0 ? user.profile.photos[0] : AFRICA_MAP_URL,
                photos: user.profile.photos && user.profile.photos.length > 0 ? user.profile.photos : [AFRICA_MAP_URL],
                verified: false,
                verificationBadge: user.verificationBadge || null,
                isRegisteredUser: true,
                username: user.username,
                isBot: false
            };
            allProfiles.push(userProfile);
        }
    });
    
    return allProfiles;
}

async function loadFirebaseUsers() {
    if (!window._firebaseReady) return;
    try {
        const snapshot = await window._dbGet(window._dbRef(window._db, 'users'));
        if (snapshot.exists()) {
            window._firebaseUsersCache = snapshot.val();
            // Also merge into localStorage for offline use
            const localUsers = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
            Object.assign(localUsers, window._firebaseUsersCache);
            localStorage.setItem('afriConnect_users', JSON.stringify(localUsers));
            // Refresh discovery grid and flash view
            initDiscovery();
            initFlashView();
        }
    } catch (err) {
        console.warn('Could not load Firebase users:', err);
    }
}

function initDiscovery() {
    const allProfiles = getAllDiscoverableProfiles();
    renderDiscoveryGrid(allProfiles);
}

function renderDiscoveryGrid(profileList) {
    const grid = document.getElementById('discoveryGrid');
    grid.innerHTML = profileList.map(profile => {
        const verifiedBadge = profile.verified ? 
            `<span class="verification-badge"><i class="fas fa-check-circle"></i></span>` : '';
        
        const badgeIcon = getVerificationBadge(profile);
        return `
        <div class="grid-profile-card" onclick="viewProfileDetails('${profile.name}', 'discover')">
            <img src="${profile.img}" class="grid-profile-image" alt="${profile.name}">
            ${badgeIcon ? `<div style="position:absolute;top:4px;left:4px;z-index:2;">${badgeIcon}</div>` : ''}
            <div class="grid-profile-info">
                <div class="flex items-center mb-1">
                    <h3 class="text-sm font-bold text-white">${profile.name}, ${profile.age}</h3>
                </div>
                <p class="text-yellow-500 text-xs mb-1"><i class="fas fa-map-marker-alt mr-1"></i>${profile.distance}</p>
                <p class="text-gray-400 text-xs">${profile.country}</p>
            </div>
            <div class="grid-profile-actions">
                <button class="grid-action-btn pass" onclick="event.stopPropagation(); passProfile('${profile.name}')">
                    <i class="fas fa-times"></i>
                </button>
                <button class="grid-action-btn like" onclick="event.stopPropagation(); likeProfile('${profile.name}')">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="grid-action-btn super" onclick="event.stopPropagation(); superLikeProfile('${profile.name}')">
                    <i class="fas fa-star"></i>
                </button>
            </div>
        </div>
    `}).join('');
}

function filterDiscovery(filter) {
    const allProfiles = getAllDiscoverableProfiles();
    let filtered = allProfiles;
    
    if (filter === 'male') {
        filtered = allProfiles.filter(p => p.gender === 'male');
    } else if (filter === 'female') {
        filtered = allProfiles.filter(p => p.gender === 'female');
    } else if (filter === 'verified') {
        filtered = allProfiles.filter(p => p.verified);
    }
    
    renderDiscoveryGrid(filtered);
}

function passProfile(name) {
    showToast(`Passed on ${name}`);
    const card = event.target.closest('.grid-profile-card');
    card.style.opacity = '0.5';
}


// Enhanced notification system with browser notifications
async function sendLikeNotification(likedProfile, type = 'like') {
    try {
        const notificationText = type === 'superlike' 
            ? `${currentUser.name} super liked you! ⭐` 
            : `${currentUser.name} liked you! ❤️`;
        
        // Add to in-app notifications
        const notification = {
            id: Date.now(),
            user: currentUser.name,
            avatar: currentUser.photos[0] || 'https://via.placeholder.com/150',
            text: notificationText,
            time: 'Just now',
            read: false,
            type: type
        };
        addNotification(notification);
        
        // Request browser notification permission and show notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('AfriConnect', {
                body: notificationText,
                icon: currentUser.photos[0] || '/africonnect-logo.jpg',
                badge: '/africonnect-logo.jpg'
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('AfriConnect', {
                        body: notificationText,
                        icon: currentUser.photos[0] || '/africonnect-logo.jpg',
                        badge: '/africonnect-logo.jpg'
                    });
                }
            });
        }
        
        console.log('✅ Like notification sent:', notificationText);
    } catch (e) {
        console.warn('Could not send like notification:', e);
    }
}

// Function to notify user when they like someone
function sendOutgoingLikeNotification(likedProfile, type = 'like') {
    const notificationText = type === 'superlike' 
        ? `You super liked ${likedProfile.name}! ⭐` 
        : `You liked ${likedProfile.name}! ❤️`;
    
    const notification = {
        id: Date.now(),
        user: likedProfile.name,
        avatar: likedProfile.photos[0] || likedProfile.img,
        text: notificationText,
        time: 'Just now',
        read: false,
        type: 'outgoing_' + type
    };
    addNotification(notification);
        await window._dbPush(
            window._dbRef(window._db, `users/${likedProfile.username}/likeNotifications`),
            notifPayload
        );
    } catch(e) {
        console.warn('Could not send like notification:', e);
    }
}

function subscribeToLikeNotifications() {
    if (!window._firebaseReady || !currentUser) return;
    const ref = window._dbRef(window._db, `users/${currentUser.username}/likeNotifications`);
    window._dbOnValue(ref, async (snapshot) => {
        if (!snapshot.exists()) return;
        const notifs = snapshot.val();
        for (const [key, notif] of Object.entries(notifs)) {
            if (notif.read) continue;
            // Add to in-app notifications
            addNotification({
                id: notif.timestamp || Date.now(),
                type: notif.type === 'superlike' ? 'superlike' : 'like',
                user: notif.fromName,
                avatar: notif.fromAvatar || AFRICA_MAP_URL,
                text: notif.type === 'superlike'
                    ? `<strong>${notif.fromName}</strong> Super Liked your profile! ⭐ <span style="color:#fbbf24;cursor:pointer;" onclick="viewLikerProfile('${notif.from}','${notif.fromName}','${notif.fromAvatar}')">View profile →</span>`
                    : `<strong>${notif.fromName}</strong> liked your profile! 💛 <span style="color:#fbbf24;cursor:pointer;" onclick="viewLikerProfile('${notif.from}','${notif.fromName}','${notif.fromAvatar}')">View profile →</span>`,
                time: notif.time || 'Just now',
                read: false
            });
            // Show toast
            showToast(`💛 ${notif.fromName} ${notif.type === 'superlike' ? 'Super Liked' : 'liked'} your profile!`);
            // Mark as read
            await window._dbSet(
                window._dbRef(window._db, `users/${currentUser.username}/likeNotifications/${key}/read`), true
            );
        }
    });
}

function viewLikerProfile(username, name, avatar) {
    // Find in all profiles or build a minimal one
    const allProfiles = getAllDiscoverableProfiles();
    let profile = allProfiles.find(p => p.username === username || p.name === name);
    if (!profile) {
        profile = {
            name: name,
            age: '?',
            img: avatar || AFRICA_MAP_URL,
            photos: [avatar || AFRICA_MAP_URL],
            bio: 'Liked your profile!',
            job: '', company: '', school: '', phone: '',
            distance: 'Nearby', country: 'Africa',
            isRegisteredUser: true, username: username
        };
    }
    currentViewingProfile = profile;
    viewProfileDetails(profile.name, 'discover');
}

function likeProfile(name) {
    showToast(`Liked ${name}! 💛`);
    const card = event.target.closest('.grid-profile-card');
    card.style.border = '2px solid #22c55e';
    
    const allProfiles = getAllDiscoverableProfiles();
    const likedProfile = allProfiles.find(p => p.name === name);
    
    if (likedProfile && likedProfile.isRegisteredUser) {
        // Send real-time like notification to the liked user
        sendLikeNotification(likedProfile, 'like');
        setTimeout(() => {
            addMatch(likedProfile);
        }, 2000);
    }
    
    setTimeout(() => {
        card.style.display = 'none';
    }, 500);
}

function superLikeProfile(name) {
    showToast(`Super Liked ${name}! ⭐`);
    const card = event.target.closest('.grid-profile-card');
    card.style.border = '2px solid #3b82f6';
    
    const allProfiles = getAllDiscoverableProfiles();
    const likedProfile = allProfiles.find(p => p.name === name);
    
    if (likedProfile) {
        if (likedProfile.isRegisteredUser) {
            sendLikeNotification(likedProfile, 'superlike');
            sendOutgoingLikeNotification(likedProfile, \'superlike\');
        }
        addMatch(likedProfile);
    }
    
    setTimeout(() => {
        card.style.display = 'none';
    }, 500);
}

function addMatch(profile) {
    const exists = matches.some(m => m.name === profile.name);
    if (exists) return;
    
    const newMatch = {
        name: profile.name,
        age: profile.age,
        img: profile.img,
        lastActive: "Active now",
        bio: profile.bio,
        job: profile.job,
        company: profile.company,
        school: profile.school,
        phone: profile.phone,
        photos: profile.photos,
        isBot: profile.isBot || false
    };
    
    matches.unshift(newMatch);
    
    const newChat = {
        name: profile.name,
        message: "You matched! Say hello 👋",
        time: "Just now",
        unread: 1,
        img: profile.img,
        bio: profile.bio,
        job: profile.job,
        company: profile.company,
        school: profile.school,
        phone: profile.phone,
        age: profile.age,
        photos: profile.photos,
        isBot: profile.isBot || false
    };
    
    const existingChat = chats.find(c => c.name === profile.name);
    if (!existingChat) {
        chats.unshift(newChat);
        chatHistories[profile.name] = [
            { text: "You matched! Say hello 👋", sent: false, time: "Just now" }
        ];
    }
    
    if (currentUser) {
        currentUser.matches = matches;
        currentUser.chats = chats;
        const users = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
        users[currentUser.username] = currentUser;
        localStorage.setItem('afriConnect_users', JSON.stringify(users));
        localStorage.setItem('afriConnect_session', JSON.stringify(currentUser));
    }
    
    initMatches();
    initChats();
    
    addNotification({
        id: Date.now(),
        type: 'match',
        user: profile.name,
        avatar: profile.img,
        text: `You matched with <strong>${profile.name}</strong>! Start chatting now.`,
        time: 'Just now',
        read: false
    });
    
    showToast(`It's a Match with ${profile.name}! 🎉`);
}

// ==========================================
// NOTIFICATION FUNCTIONS
// ==========================================

function toggleNotifications() {
    const panel = document.getElementById('notificationPanel');
    panel.classList.toggle('active');
    
    if (panel.classList.contains('active')) {
        renderNotifications();
    }
}

function renderNotifications() {
    const list = document.getElementById('notificationList');
    const unreadCount = notifications.filter(n => !n.read).length;
    
    document.getElementById('notifCount').textContent = unreadCount > 0 ? `${unreadCount} new` : '0 new';
    const badge = document.getElementById('notifBadge');
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
    
    if (notifications.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 40px; color: #888;">No notifications yet</div>';
        return;
    }
    
    list.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.read ? '' : 'unread'}" onclick="handleNotificationClick(${notif.id})">
            <img src="${notif.avatar}" class="notification-avatar" alt="${notif.user}">
            <div class="notification-content">
                <div class="notification-text">${notif.text}</div>
                <div class="notification-time">${notif.time}</div>
            </div>
            <i class="fas fa-times notification-delete" onclick="event.stopPropagation(); deleteNotification(${notif.id})"></i>
        </div>
    `).join('');
}

function addNotification(notification) {
    notifications.unshift(notification);
    updateNotificationBadge();
}

function handleNotificationClick(id) {
    const notif = notifications.find(n => n.id === id);
    if (!notif) return;
    
    notif.read = true;
    updateNotificationBadge();
    renderNotifications();
    
    if (notif.type === 'match' || notif.type === 'message' || notif.type === 'friend') {
        const userName = notif.user;
        
        const match = matches.find(m => m.name === userName);
        if (match) {
            toggleNotifications();
            openChat(userName);
            return;
        }
        
        const chat = chats.find(c => c.name === userName);
        if (chat) {
            toggleNotifications();
            openChat(userName);
            return;
        }
        
        const allProfiles = getAllDiscoverableProfiles();
        const profile = allProfiles.find(p => p.name === userName);
        if (profile) {
            addMatch(profile);
            toggleNotifications();
            setTimeout(() => openChat(userName), 500);
        }
    } else {
        toggleNotifications();
        showSection('swipe');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.nav-item')[0].classList.add('active');
    }
}

function deleteNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    renderNotifications();
    updateNotificationBadge();
}

function markAllNotificationsRead() {
    notifications.forEach(n => n.read = true);
    renderNotifications();
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notifBadge');
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// ==========================================
// GROUP CHAT FUNCTIONS
// ==========================================

function initGroups() {
    const container = document.getElementById('groupsContainer');
    container.innerHTML = africanCountries.map(country => `
        <div class="country-group">
            <div class="country-header" onclick="toggleCountry('${country.name}')">
                <div class="country-name">
                    <span class="country-flag">${country.flag}</span>
                    <span>${country.name}</span>
                </div>
                <span class="room-count">${country.rooms.length} rooms</span>
            </div>
            <div class="rooms-container" id="rooms-${country.name}">
                <div class="rooms-grid">
                    ${country.rooms.map(room => `
                        <div class="room-card" onclick="openGroupChat('${country.name}', '${room}')">
                            <div class="room-name">${room}</div>
                            <div class="room-users">
                                <span class="online-dot"></span>
                                ${Math.floor(Math.random() * 50) + 5} online
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function toggleCountry(countryName) {
    const container = document.getElementById(`rooms-${countryName}`);
    container.classList.toggle('expanded');
}

function openGroupChat(country, room) {
    currentGroupRoom = { country, room };
    const chatBox = document.getElementById('groupChatBox');
    
    document.getElementById('groupChatName').textContent = `${room}, ${country}`;
    document.getElementById('groupChatMeta').textContent = `${Math.floor(Math.random() * 100) + 20} members • Community Chat Room`;
    
    const membersContainer = document.getElementById('groupMembersPreview');
    const avatars = [
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    ];
    
    membersContainer.innerHTML = avatars.map(src => `
        <img src="${src}" class="member-avatar" alt="Member">
    `).join('') + `<div class="member-count">+${Math.floor(Math.random() * 50) + 10}</div>`;
    
    chatBox.classList.add('active');
    renderGroupMessages(country, room);
    _pushNav({ type: 'groupChat' });
}

function closeGroupChat() {
    document.getElementById('groupChatBox').classList.remove('active');
    currentGroupRoom = null;
}

function renderGroupMessages(country, room) {
    const container = document.getElementById('groupChatMessages');
    const key = `${country}-${room}`;
    
    if (!groupChatHistories[key]) {
        groupChatHistories[key] = [
            { text: `Welcome to ${room} chat room! Connect with people from this region.`, sent: false, time: 'Now', user: 'Admin' }
        ];
    }
    
    const messages = groupChatHistories[key];
    container.innerHTML = messages.map(msg => `
        <div class="message ${msg.sent ? 'sent' : 'received'}">
            ${!msg.sent ? `<div style="font-size: 10px; color: #fbbf24; margin-bottom: 2px;">${msg.user}</div>` : ''}
            <div>${msg.text}</div>
            <div class="message-time">${msg.time}</div>
        </div>
    `).join('');
    
    container.scrollTop = container.scrollHeight;
}

function sendGroupMessage() {
    const input = document.getElementById('groupChatInput');
    const text = input.value.trim();
    
    if (!text || !currentGroupRoom) return;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const key = `${currentGroupRoom.country}-${currentGroupRoom.room}`;
    
    if (!groupChatHistories[key]) {
        groupChatHistories[key] = [];
    }
    
    groupChatHistories[key].push({
        text: text,
        sent: true,
        time: time,
        user: 'You'
    });
    
    input.value = '';
    renderGroupMessages(currentGroupRoom.country, currentGroupRoom.room);
}

function handleGroupChatKeypress(e) {
    if (e.key === 'Enter') {
        sendGroupMessage();
    }
}

// ==========================================
// MARKET FUNCTIONS
// ==========================================

let marketItems = [];
let currentViewingItem = null;

function initMarket() {
    if (currentUser && currentUser.adverts) {
        myAdverts = currentUser.adverts;
    }
    renderMarketItems();
}

function renderMarketItems() {
    const grid = document.getElementById('marketGrid');
    const allItems = [...marketItems, ...myAdverts];
    
    if (allItems.length === 0) {
        grid.innerHTML = '<div style="text-align: center; color: #888; padding: 40px; grid-column: 1/-1;">No items available. Be the first to sell something!</div>';
        return;
    }
    
    grid.innerHTML = allItems.map(item => `
        <div class="market-item" onclick="viewMarketItem(${item.id})">
            <img src="${item.image}" class="market-item-image" alt="${item.title}">
            <div class="market-item-info">
                <div class="market-item-price">${item.price}</div>
                <div class="market-item-title">${item.title}</div>
                <div class="market-item-location">
                    <i class="fas fa-map-marker-alt"></i> ${item.location}
                </div>
                <div class="market-item-seller">
                    <img src="${item.seller.avatar}" class="seller-avatar" alt="${item.seller.name}">
                    <span class="seller-name">${item.seller.name}</span>
                    <span style="color: #fbbf24; margin-left: auto;"><i class="fas fa-star"></i> ${item.seller.rating}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function filterMarket(category, element) {
    document.querySelectorAll('.market-category').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
    
    const allItems = [...marketItems, ...myAdverts];
    
    if (category === 'all') {
        renderMarketItems();
    } else {
        const filtered = allItems.filter(item => item.category === category);
        const grid = document.getElementById('marketGrid');
        
        if (filtered.length === 0) {
            grid.innerHTML = '<div style="text-align: center; color: #888; padding: 40px; grid-column: 1/-1;">No items in this category</div>';
            return;
        }
        
        grid.innerHTML = filtered.map(item => `
            <div class="market-item" onclick="viewMarketItem(${item.id})">
                <img src="${item.image}" class="market-item-image" alt="${item.title}">
                <div class="market-item-info">
                    <div class="market-item-price">${item.price}</div>
                    <div class="market-item-title">${item.title}</div>
                    <div class="market-item-location">
                        <i class="fas fa-map-marker-alt"></i> ${item.location}
                    </div>
                    <div class="market-item-seller">
                        <img src="${item.seller.avatar}" class="seller-avatar" alt="${item.seller.name}">
                        <span class="seller-name">${item.seller.name}</span>
                        <span style="color: #fbbf24; margin-left: auto;"><i class="fas fa-star"></i> ${item.seller.rating}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function searchMarket(query) {
    const allItems = [...marketItems, ...myAdverts];
    const filtered = allItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.location.toLowerCase().includes(query.toLowerCase())
    );
    
    const grid = document.getElementById('marketGrid');
    if (filtered.length === 0) {
        grid.innerHTML = '<div style="text-align: center; color: #888; padding: 40px; grid-column: 1/-1;">No items found</div>';
        return;
    }
    
    grid.innerHTML = filtered.map(item => `
        <div class="market-item" onclick="viewMarketItem(${item.id})">
            <img src="${item.image}" class="market-item-image" alt="${item.title}">
            <div class="market-item-info">
                <div class="market-item-price">${item.price}</div>
                <div class="market-item-title">${item.title}</div>
                <div class="market-item-location">
                    <i class="fas fa-map-marker-alt"></i> ${item.location}
                </div>
                <div class="market-item-seller">
                    <img src="${item.seller.avatar}" class="seller-avatar" alt="${item.seller.name}">
                    <span class="seller-name">${item.seller.name}</span>
                    <span style="color: #fbbf24; margin-left: auto;"><i class="fas fa-star"></i> ${item.seller.rating}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function viewMarketItem(id) {
    const allItems = [...marketItems, ...myAdverts];
    const item = allItems.find(i => i.id === id);
    if (!item) return;
    
    currentViewingItem = item;
    
    const modal = document.getElementById('marketDetailModal');
    const content = document.getElementById('marketDetailContent');
    
    content.innerHTML = `
        <img src="${item.image}" class="market-detail-image" alt="${item.title}">
        <div class="market-detail-info">
            <div class="market-detail-price">${item.price}</div>
            <div class="market-detail-title">${item.title}</div>
            
            <div class="market-detail-meta">
                <div class="market-meta-row">
                    <span style="color: #888; font-size: 13px;">Condition</span>
                    <span style="color: white; font-weight: bold; font-size: 13px;">${item.condition}</span>
                </div>
                <div class="market-meta-row">
                    <span style="color: #888; font-size: 13px;">Posted</span>
                    <span style="color: white; font-size: 13px;">${item.posted}</span>
                </div>
                <div class="market-meta-row">
                    <span style="color: #888; font-size: 13px;">Location</span>
                    <span style="color: white; font-size: 13px;"><i class="fas fa-map-marker-alt" style="color: #fbbf24;"></i> ${item.location}</span>
                </div>
            </div>
            
            <div class="market-detail-description">
                <h4 style="color: #fbbf24; margin-bottom: 8px; font-size: 14px;">Description</h4>
                <p style="font-size: 13px;">${item.description}</p>
            </div>
            
            <div class="market-seller-card">
                <img src="${item.seller.avatar}" class="market-seller-avatar" alt="${item.seller.name}">
                <div class="market-seller-info">
                    <div class="market-seller-name">${item.seller.name}</div>
                    <div class="market-seller-rating"><i class="fas fa-star"></i> ${item.seller.rating} rating</div>
                </div>
            </div>
            
            <button class="market-contact-btn" onclick="contactSeller()">
                <i class="fas fa-comment-dots"></i> Contact Seller
            </button>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    _pushNav({ type: 'marketDetail' });
}

function closeMarketDetail() {
    document.getElementById('marketDetailModal').classList.remove('active');
    document.body.style.overflow = '';
}

function contactSeller() {
    showToast(`Message sent to ${currentViewingItem.seller.name}! 📨`);
    closeMarketDetail();
}

// ==========================================
// CREATE ADVERT FUNCTIONS
// ==========================================

let advertImages = [];

function openCreateAdvert() {
    document.getElementById('createAdvertModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    advertImages = [];
    document.getElementById('advertForm').reset();
    document.getElementById('advertImagePreview').innerHTML = '';
    _pushNav({ type: 'createAdvert' });
}

function closeCreateAdvert() {
    document.getElementById('createAdvertModal').classList.remove('active');
    document.body.style.overflow = '';
}

function previewAdvertImages(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('advertImagePreview');
    
    for (let i = 0; i < files.length && i < 5; i++) {
        const reader = new FileReader();
        reader.onload = function(e) {
            advertImages.push(e.target.result);
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '60px';
            img.style.height = '60px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';
            previewContainer.appendChild(img);
        };
        reader.readAsDataURL(files[i]);
    }
}

function submitAdvert(event) {
    event.preventDefault();
    
    const title = document.getElementById('advertTitle').value;
    const category = document.getElementById('advertCategory').value;
    const price = document.getElementById('advertPrice').value;
    const location = document.getElementById('advertLocation').value;
    const condition = document.getElementById('advertCondition').value;
    const description = document.getElementById('advertDescription').value;
    
    const newAdvert = {
        id: Date.now(),
        title: title,
        price: price,
        category: category,
        location: location,
        image: advertImages.length > 0 ? advertImages[0] : AFRICA_MAP_URL,
        seller: {
            name: currentUser ? currentUser.profile.name : 'User',
            avatar: currentUser ? (currentUser.profile.photos[0] || AFRICA_MAP_URL) : AFRICA_MAP_URL,
            rating: "5.0"
        },
        description: description,
        condition: condition,
        posted: "Just now"
    };
    
    myAdverts.unshift(newAdvert);
    
    if (currentUser) {
        currentUser.adverts = myAdverts;
        const users = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
        users[currentUser.username] = currentUser;
        localStorage.setItem('afriConnect_users', JSON.stringify(users));
        localStorage.setItem('afriConnect_session', JSON.stringify(currentUser));
    }
    
    showToast('Advert posted successfully! 🎉');
    closeCreateAdvert();
    initMarket();
}

function showMyAdverts() {
    toggleMainMenu();
    document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
    document.getElementById('section-myadverts').classList.add('active');
    renderMyAdverts();
}

function renderMyAdverts() {
    const container = document.getElementById('myAdvertsContainer');
    
    if (myAdverts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888; padding: 40px;">You haven\'t created any adverts yet.</p>';
        return;
    }
    
    container.innerHTML = myAdverts.map(advert => `
        <div class="my-advert-card">
            <img src="${advert.image}" class="my-advert-image" alt="${advert.title}">
            <div class="my-advert-info">
                <span class="my-advert-status status-active">Active</span>
                <h3 style="color: white; margin-bottom: 5px; font-size: 16px;">${advert.title}</h3>
                <p style="color: #fbbf24; font-size: 16px; font-weight: bold; margin-bottom: 5px;">${advert.price}</p>
                <p style="color: #888; font-size: 12px;"><i class="fas fa-map-marker-alt"></i> ${advert.location}</p>
                <button class="delete-advert-btn" onclick="deleteAdvert(${advert.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function deleteAdvert(id) {
    if (confirm('Are you sure you want to delete this advert?')) {
        myAdverts = myAdverts.filter(a => a.id !== id);
        
        if (currentUser) {
            currentUser.adverts = myAdverts;
            const users = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
            users[currentUser.username] = currentUser;
            localStorage.setItem('afriConnect_users', JSON.stringify(users));
            localStorage.setItem('afriConnect_session', JSON.stringify(currentUser));
        }
        
        renderMyAdverts();
        initMarket();
        showToast('Advert deleted');
    }
}

// ==========================================
// PROFILE DETAIL FUNCTIONS
// ==========================================

let currentViewingProfile = null;

function viewProfileDetails(name, source) {
    const allProfiles = getAllDiscoverableProfiles();
    let profile = allProfiles.find(p => p.name === name);
    
    if (!profile) {
        profile = matches.find(m => m.name === name);
    }
    if (!profile) {
        profile = chats.find(c => c.name === name);
    }
    
    if (!profile) return;
    
    currentViewingProfile = profile;
    
    const modal = document.getElementById('profileModal');
    const content = document.getElementById('profileModalContent');
    const actions = document.getElementById('profileModalActions');
    
    const galleryHtml = profile.photos.slice(1).map(photo => `
        <div class="gallery-photo" onclick="window.open('${photo}', '_blank')">
            <img src="${photo}" alt="Photo">
        </div>
    `).join('');
    
    const showPhone = source !== 'discover';
    const phoneHtml = showPhone ? `
        <div class="info-row">
            <div class="info-icon"><i class="fas fa-phone"></i></div>
            <div>
                <div class="text-white font-bold text-sm">${profile.phone}</div>
                <div class="text-gray-400 text-xs">Phone Number</div>
            </div>
            <button class="ml-auto text-green-500 hover:text-green-400" onclick="window.location.href='tel:${profile.phone}'">
                <i class="fas fa-phone-alt"></i>
            </button>
        </div>
    ` : '';
    
    content.innerHTML = `
        <div class="profile-hero">
            <img src="${profile.img}" alt="${profile.name}">
            <div class="profile-hero-info">
                <h2 class="text-3xl font-bold text-white mb-2">${profile.name}, ${profile.age}</h2>
                <p class="text-yellow-400 text-sm"><i class="fas fa-map-marker-alt mr-2"></i>${profile.distance || 'Nearby'} • ${profile.job}</p>
                ${getVerificationBadgeFull(profile)}
            </div>
        </div>
        
        <div class="photo-gallery">
            ${galleryHtml}
        </div>
        
        <div class="info-section">
            <h3 class="text-base font-bold text-yellow-500 mb-3">About</h3>
            <p class="text-gray-300 text-sm leading-relaxed">${profile.bio}</p>
        </div>
        
        <div class="info-section">
            <h3 class="text-base font-bold text-yellow-500 mb-3">Info</h3>
            
            <div class="info-row">
                <div class="info-icon"><i class="fas fa-briefcase"></i></div>
                <div>
                    <div class="text-white font-bold text-sm">${profile.job}</div>
                    <div class="text-gray-400 text-xs">${profile.company}</div>
                </div>
            </div>
            
            <div class="info-row">
                <div class="info-icon"><i class="fas fa-graduation-cap"></i></div>
                <div>
                    <div class="text-white font-bold text-sm">${profile.school}</div>
                    <div class="text-gray-400 text-xs">Education</div>
                </div>
            </div>
            
            <div class="info-row">
                <div class="info-icon"><i class="fas fa-map-marker-alt"></i></div>
                <div>
                    <div class="text-white font-bold text-sm">${profile.distance || 'Nearby'}</div>
                    <div class="text-gray-400 text-xs">Distance</div>
                </div>
            </div>
            
            ${profile.country ? `
            <div class="info-row">
                <div class="info-icon"><i class="fas fa-globe"></i></div>
                <div>
                    <div class="text-white font-bold text-sm">${profile.country}</div>
                    <div class="text-gray-400 text-xs">Country</div>
                </div>
            </div>
            ` : ''}
            
            ${phoneHtml}
        </div>
        
        <div class="info-section">
            <h3 class="text-base font-bold text-yellow-500 mb-3">Interests</h3>
            <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 bg-white/10 rounded-full text-xs">Music</span>
                <span class="px-3 py-1 bg-white/10 rounded-full text-xs">Travel</span>
                <span class="px-3 py-1 bg-white/10 rounded-full text-xs">Food</span>
                <span class="px-3 py-1 bg-white/10 rounded-full text-xs">Art</span>
                <span class="px-3 py-1 bg-white/10 rounded-full text-xs">Dancing</span>
            </div>
        </div>
    `;
    
    if (source === 'discover') {
        actions.innerHTML = `
            <button class="action-bar-btn dislike" onclick="closeProfileModal()">
                <i class="fas fa-times"></i>
            </button>
            <button class="action-bar-btn superlike" onclick="closeProfileModal(); showToast('Super Liked! ⭐')">
                <i class="fas fa-star"></i>
            </button>
            <button class="action-bar-btn like" onclick="closeProfileModal(); showToast('Liked! 💛')">
                <i class="fas fa-heart"></i>
            </button>
        `;
    } else {
        actions.innerHTML = `
            <button class="action-bar-btn dislike" onclick="unmatch('${profile.name}')">
                <i class="fas fa-user-slash"></i>
            </button>
            <button class="action-bar-btn message" onclick="openChatFromProfile('${profile.name}')">
                <i class="fas fa-comment"></i>
            </button>
        `;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    _pushNav({ type: 'profileModal' });
}

function closeProfileModal() {
    document.getElementById('profileModal').classList.remove('active');
    document.body.style.overflow = '';
}

function unmatch(name) {
    if (confirm(`Are you sure you want to unmatch with ${name}?`)) {
        showToast(`Unmatched with ${name}`);
        closeProfileModal();
        const index = matches.findIndex(m => m.name === name);
        if (index > -1) matches.splice(index, 1);
        
        const chatIndex = chats.findIndex(c => c.name === name);
        if (chatIndex > -1) chats.splice(chatIndex, 1);
        
        if (currentUser) {
            currentUser.matches = matches;
            currentUser.chats = chats;
            const users = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
            users[currentUser.username] = currentUser;
            localStorage.setItem('afriConnect_users', JSON.stringify(users));
            localStorage.setItem('afriConnect_session', JSON.stringify(currentUser));
        }
        
        initMatches();
        initChats();
    }
}

// ==========================================
// CHAT FUNCTIONS
// ==========================================

// ==========================================
// REAL-TIME CHAT ENGINE
// ==========================================

// Cache: partnerDisplayName → partnerUsername
const _partnerUsernameCache = {};
// Active onValue unsubscribers: chatKey → unsubscribe fn
const _chatListeners = {};
// Global chats-list listener unsubscriber
let _chatsListUnsubscribe = null;
// Current active chat key
let _activeChatKey = null;

// Resolve a display name → Firebase username
async function resolvePartnerUsername(displayName) {
    if (_partnerUsernameCache[displayName]) return _partnerUsernameCache[displayName];
    if (!window._firebaseReady) return null;
    try {
        const snap = await window._dbGet(window._dbRef(window._db, 'users'));
        if (!snap.exists()) return null;
        const all = snap.val();
        for (const [uname, udata] of Object.entries(all)) {
            if (uname === currentUser.username) continue;
            if (
                (udata.profile && udata.profile.name === displayName) ||
                uname === displayName.toLowerCase()
            ) {
                _partnerUsernameCache[displayName] = uname;
                return uname;
            }
        }
    } catch (e) { console.warn('resolvePartnerUsername error:', e); }
    return null;
}

// Build deterministic chatKey from two usernames
function makeChatKey(a, b) {
    return [a, b].sort().join('__');
}

// Subscribe to a specific chat thread — fires instantly on every new message
function subscribeToChatThread(chatKey, partnerDisplayName) {
    if (_chatListeners[chatKey]) return; // already subscribed
    const msgRef = window._dbRef(window._db, `chats/${chatKey}/messages`);
    const unsub = window._dbOnValue(msgRef, (snapshot) => {
        if (!snapshot.exists()) return;
        const raw = snapshot.val();
        const msgs = Object.values(raw).sort((a, b) => a.timestamp - b.timestamp);
        // Rebuild chatHistory for this thread from Firebase source of truth
        chatHistories[partnerDisplayName] = msgs.map(msg => ({
            text: msg.text,
            sent: msg.from === currentUser.username,
            time: msg.time,
            timestamp: msg.timestamp
        }));
        // Update the chat list preview
        const lastMsg = msgs[msgs.length - 1];
        const existingChat = chats.find(c => c.name === partnerDisplayName);
        if (existingChat) {
            existingChat.message = lastMsg.text;
            existingChat.time = lastMsg.time;
            // Only count as unread if we didn't send it and chat isn't open
            if (lastMsg.from !== currentUser.username &&
                (!currentChatUser || currentChatUser.name !== partnerDisplayName)) {
                existingChat.unread = (existingChat.unread || 0) + 1;
                showToast(`💬 New message from ${partnerDisplayName}`);
                addNotification({
                    id: Date.now(),
                    type: 'message',
                    user: partnerDisplayName,
                    avatar: existingChat.img,
                    text: `<strong>${partnerDisplayName}</strong>: ${lastMsg.text}`,
                    time: lastMsg.time,
                    read: false
                });
            }
        }
        // Re-render open chat immediately
        if (currentChatUser && currentChatUser.name === partnerDisplayName) {
            renderMessages(partnerDisplayName);
        }
        initChats();
    });
    _chatListeners[chatKey] = unsub;
}

// Subscribe to the user's chat list in Firebase — so new conversations appear instantly
function subscribeToUserChatList() {
    if (!window._firebaseReady || !currentUser) return;
    const ref = window._dbRef(window._db, `users/${currentUser.username}/chatList`);
    _chatsListUnsubscribe = window._dbOnValue(ref, async (snapshot) => {
        if (!snapshot.exists()) return;
        const chatList = snapshot.val();
        for (const [chatKey, meta] of Object.entries(chatList)) {
            // Determine partner
            const partnerUsername = meta.participants.find(p => p !== currentUser.username);
            if (!partnerUsername) continue;
            // Get display name
            let partnerName = meta.partnerName || partnerUsername;
            let partnerAvatar = meta.partnerAvatar || AFRICA_MAP_URL;
            // Add to chats list if missing
            const existing = chats.find(c => c.name === partnerName);
            if (!existing) {
                chats.unshift({
                    name: partnerName,
                    message: meta.lastMessage || '',
                    time: meta.lastTime || 'Now',
                    unread: 0,
                    img: partnerAvatar,
                    bio: '', job: '', company: '', school: '', phone: '', age: '',
                    photos: [partnerAvatar],
                    isBot: false
                });
                _partnerUsernameCache[partnerName] = partnerUsername;
            }
            // Subscribe to the thread for real-time updates
            subscribeToChatThread(chatKey, partnerName);
        }
        initChats();
    });
}

async function openChat(name) {
    let chat = chats.find(c => c.name === name);
    let match = matches.find(m => m.name === name);
    
    if (!chat && match) {
        chat = {
            name: match.name,
            message: "You matched! Say hello 👋",
            time: "Just now",
            unread: 0,
            img: match.img,
            bio: match.bio,
            job: match.job,
            company: match.company,
            school: match.school,
            phone: match.phone,
            age: match.age,
            photos: match.photos,
            isBot: match.isBot || false
        };
        chats.unshift(chat);
        chatHistories[name] = [
            { text: "You matched! Say hello 👋", sent: false, time: "Just now" }
        ];
        if (currentUser) {
            currentUser.chats = chats;
            const localUsers = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
            localUsers[currentUser.username] = currentUser;
            localStorage.setItem('afriConnect_users', JSON.stringify(localUsers));
            localStorage.setItem('afriConnect_session', JSON.stringify({ username: currentUser.username }));
        }
        initChats();
    }
    
    if (!chat) {
        showToast("Cannot start chat with this user");
        return;
    }
    
    currentChatUser = chat;
    chat.unread = 0;
    
    document.getElementById('chatName').textContent = chat.name;
    document.getElementById('chatAvatar').src = chat.img;
    document.getElementById('chatBox').classList.add('active');
    _pushNav({ type: 'chat', name });
    
    renderMessages(name);
    
    // Hook up real-time listener for this thread
    if (window._firebaseReady && currentUser) {
        const partnerUsername = await resolvePartnerUsername(name);
        if (partnerUsername) {
            const chatKey = makeChatKey(currentUser.username, partnerUsername);
            _activeChatKey = chatKey;
            subscribeToChatThread(chatKey, name);
        }
    }
    
    initChats();
}

function openChatFromProfile(name) {
    closeProfileModal();
    setTimeout(() => openChat(name), 300);
}

function closeChat() {
    document.getElementById('chatBox').classList.remove('active');
    currentChatUser = null;
    _activeChatKey = null;
}

function renderMessages(userName) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const messages = chatHistories[userName] || [];

    const myAvatar = (currentUser && currentUser.profile && currentUser.profile.photos && currentUser.profile.photos[0])
        ? currentUser.profile.photos[0] : AFRICA_MAP_URL;
    const partnerAvatar = (currentChatUser && currentChatUser.img) ? currentChatUser.img : AFRICA_MAP_URL;

    if (messages.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#666;padding:40px;font-size:13px;">No messages yet — say hello! 👋</div>';
        return;
    }

    container.innerHTML = messages.map(msg => `
        <div class="message ${msg.sent ? 'sent' : 'received'}">
            ${!msg.sent ? `<img class="msg-avatar" src="${partnerAvatar}" onerror="this.src='${AFRICA_MAP_URL}'" alt="">` : ''}
            <div class="msg-bubble">
                <div>${msg.text}</div>
                <div class="message-time">${msg.time || ''}</div>
            </div>
            ${msg.sent ? `<img class="msg-avatar" src="${myAvatar}" onerror="this.src='${AFRICA_MAP_URL}'" alt="">` : ''}
        </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (!text || !currentChatUser) return;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    input.value = '';
    
    if (window._firebaseReady && currentUser) {
        try {
            const recipientUsername = await resolvePartnerUsername(currentChatUser.name);
            if (!recipientUsername) {
                showToast("Could not find recipient — are they a registered user?");
                return;
            }
            
            const chatKey = makeChatKey(currentUser.username, recipientUsername);
            _activeChatKey = chatKey;
            
            // Subscribe to thread if not already (covers sender's view too)
            subscribeToChatThread(chatKey, currentChatUser.name);
            
            const firebaseMsg = {
                text: text,
                from: currentUser.username,
                fromName: currentUser.profile.name,
                fromAvatar: currentUser.profile.photos[0] || AFRICA_MAP_URL,
                time: time,
                timestamp: Date.now()
            };
            
            // Push message to Firebase — onValue listener updates both sides
            await window._dbPush(window._dbRef(window._db, `chats/${chatKey}/messages`), firebaseMsg);

            // Write meta node so admin panel can display last message/time
            await window._dbSet(window._dbRef(window._db, `chats/${chatKey}/meta`), {
                lastMessage: text,
                lastTime: time,
                lastFrom: currentUser.username,
                timestamp: Date.now()
            });
            
            // Update chatList for BOTH participants so the conversation appears in both inboxes
            const chatListMeta = {
                participants: [currentUser.username, recipientUsername],
                lastMessage: text,
                lastTime: time,
                lastFrom: currentUser.username,
                partnerName: currentUser.profile.name,
                partnerAvatar: currentUser.profile.photos[0] || AFRICA_MAP_URL,
                timestamp: Date.now()
            };
            // For sender: store partner's name/avatar
            await window._dbSet(
                window._dbRef(window._db, `users/${currentUser.username}/chatList/${chatKey}`),
                { ...chatListMeta, partnerName: currentChatUser.name, partnerAvatar: currentChatUser.img }
            );
            // For recipient: store sender's name/avatar
            await window._dbSet(
                window._dbRef(window._db, `users/${recipientUsername}/chatList/${chatKey}`),
                chatListMeta
            );
        } catch (err) {
            console.warn('Firebase message send error:', err);
            // Fallback: add locally
            if (!chatHistories[currentChatUser.name]) chatHistories[currentChatUser.name] = [];
            chatHistories[currentChatUser.name].push({ text, sent: true, time });
            renderMessages(currentChatUser.name);
        }
    } else {
        // localStorage fallback (same device only)
        if (!chatHistories[currentChatUser.name]) chatHistories[currentChatUser.name] = [];
        chatHistories[currentChatUser.name].push({ text, sent: true, time });
        const chat = chats.find(c => c.name === currentChatUser.name);
        if (chat) { chat.message = text; chat.time = 'Just now'; }
        renderMessages(currentChatUser.name);
        initChats();
        if (currentUser) {
            currentUser.chats = chats;
            const localUsers = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
            localUsers[currentUser.username] = currentUser;
            localStorage.setItem('afriConnect_users', JSON.stringify(localUsers));
        }
    }
}

// ==========================================
// REAL-TIME INCOMING MESSAGE SUBSCRIPTION
// ==========================================

function subscribeToIncomingMessages() {
    if (!window._firebaseReady || !currentUser) return;
    // Subscribe to the user's chat list — picks up new conversations in real-time
    subscribeToUserChatList();
    // Subscribe to like notifications
    subscribeToLikeNotifications();
}

function handleChatKeypress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

function viewProfileFromChat() {
    if (currentChatUser) {
        viewProfileDetails(currentChatUser.name, 'messages');
    }
}

// ==========================================
// MATCHES & CHATS INITIALIZATION
// ==========================================

function initMatches() {
    if (currentUser && currentUser.matches) {
        matches = currentUser.matches;
    }
    
    const grid = document.getElementById('matchesGrid');
    
    if (matches.length === 0) {
        grid.innerHTML = '<div style="text-align: center; color: #888; padding: 40px; grid-column: 1/-1;">No matches yet. Start liking profiles!</div>';
        return;
    }
    
    grid.innerHTML = matches.map(match => `
        <div class="match-card" onclick="viewProfileDetails('${match.name}', 'matches')">
            <img src="${match.img}" alt="${match.name}">
            <div class="match-overlay">
                <h4 class="font-bold text-white text-sm">${match.name}, ${match.age}</h4>
                <p class="text-xs text-green-400">${match.lastActive}</p>
            </div>
        </div>
    `).join('');
}

function initChats() {
    // Merge saved chats into live array — never overwrite real-time messages
    if (currentUser && currentUser.chats) {
        currentUser.chats.forEach(saved => {
            if (!chats.find(c => c.name === saved.name)) {
                chats.push(saved);
                if (!chatHistories[saved.name] || chatHistories[saved.name].length === 0) {
                    chatHistories[saved.name] = [
                        { text: saved.message || 'Say hello 👋', sent: false, time: saved.time || '' }
                    ];
                }
            }
        });
    }

    const list = document.getElementById('chatList');
    if (!list) return;

    if (chats.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:#888;padding:40px;">No messages yet. Match with someone to start chatting!</div>';
        return;
    }

    list.innerHTML = chats.map(chat => `
        <div class="chat-item" onclick="openChat('${chat.name}')">
            <img src="${chat.img || AFRICA_MAP_URL}" class="chat-avatar" alt="${chat.name}"
                 onerror="this.src='${AFRICA_MAP_URL}'">
            <div class="chat-preview">
                <div class="chat-name">${chat.name}</div>
                <div class="chat-message">${chat.message || ''}</div>
            </div>
            <div class="text-right">
                <div class="chat-time">${chat.time || ''}</div>
                ${(chat.unread || 0) > 0 ? `<div class="unread-badge">${chat.unread}</div>` : ''}
            </div>
        </div>
    `).join('');
}

// ==========================================
// TOAST NOTIFICATION
// ==========================================

function showToast(message = "It's a Match! 🎉") {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ==========================================
// PROFILE SETTINGS FUNCTIONS
// ==========================================

function renderPhotoGrid() {
    const grid = document.getElementById('photoGrid');
    grid.innerHTML = '';
    
    const photos = currentUser ? (currentUser.profile.photos || [AFRICA_MAP_URL]) : userProfile.photos;
    
    photos.forEach((photo, index) => {
        const slot = document.createElement('div');
        slot.className = 'photo-slot';
        slot.innerHTML = `
            <img src="${photo}" alt="Photo ${index + 1}">
            ${index === 0 ? '<span class="main-photo-badge">MAIN</span>' : ''}
            <div class="delete-photo" onclick="deletePhoto(${index})">
                <i class="fas fa-times"></i>
            </div>
        `;
        grid.appendChild(slot);
    });
    
    const emptySlots = 6 - photos.length;
    for (let i = 0; i < emptySlots; i++) {
        const slot = document.createElement('div');
        slot.className = 'photo-slot empty';
        slot.onclick = () => document.getElementById('photoUpload').click();
        slot.innerHTML = '<i class="fas fa-plus text-xl text-gray-500"></i>';
        grid.appendChild(slot);
    }
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (currentUser) {
                if (!currentUser.profile.photos) currentUser.profile.photos = [];
                currentUser.profile.photos.push(e.target.result);
            } else {
                userProfile.photos.push(e.target.result);
            }
            renderPhotoGrid();
            showToast("Photo added! 📸");
        };
        reader.readAsDataURL(file);
    }
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('userAvatar').src = e.target.result;
            if (currentUser) {
                if (!currentUser.profile.photos) currentUser.profile.photos = [];
                if (currentUser.profile.photos.length > 0) {
                    currentUser.profile.photos[0] = e.target.result;
                } else {
                    currentUser.profile.photos.unshift(e.target.result);
                }
                const users = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
                users[currentUser.username] = currentUser;
                localStorage.setItem('afriConnect_users', JSON.stringify(users));
                localStorage.setItem('afriConnect_session', JSON.stringify(currentUser));
            } else {
                if (userProfile.photos.length > 0) {
                    userProfile.photos[0] = e.target.result;
                } else {
                    userProfile.photos.unshift(e.target.result);
                }
            }
            renderPhotoGrid();
            showToast("Profile photo updated! 📸");
        };
        reader.readAsDataURL(file);
    }
}

function deletePhoto(index) {
    event.stopPropagation();
    if (currentUser) {
        if (!currentUser.profile.photos) currentUser.profile.photos = [];
        currentUser.profile.photos.splice(index, 1);
    } else {
        userProfile.photos.splice(index, 1);
    }
    renderPhotoGrid();
    showToast("Photo removed");
}

function selectGender(element, gender) {
    document.querySelectorAll('.gender-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    if (currentUser) {
        currentUser.profile.gender = gender;
    } else {
        userProfile.gender = gender;
    }
}

function updateSetting(key, value) {
    if (currentUser) {
        currentUser.profile[key] = value;
    } else {
        userProfile[key] = value;
    }
}

function updateDistance(value) {
    document.getElementById('distanceValue').textContent = value + ' km';
    if (currentUser) {
        currentUser.profile.distance = value;
    } else {
        userProfile.distance = value;
    }
}

function updateAgeRange() {
    const min = document.getElementById('ageMin').value;
    const max = document.getElementById('ageMax').value;
    
    if (parseInt(min) > parseInt(max)) {
        document.getElementById('ageMin').value = max;
    }
    
    const finalMin = document.getElementById('ageMin').value;
    document.getElementById('ageValue').textContent = finalMin + ' - ' + max;
    
    if (currentUser) {
        currentUser.profile.ageMin = finalMin;
        currentUser.profile.ageMax = max;
    } else {
        userProfile.ageMin = finalMin;
        userProfile.ageMax = max;
    }
}

function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('active');
}

function showProfileSettings() {
    document.getElementById('profileSettingsSection').scrollIntoView({ behavior: 'smooth' });
}

function showPrivacySettings() {
    showToast("Privacy settings - Coming soon!");
}

function showHelp() {
    toggleMainMenu();
    showToast("Help & Support - Contact us at support@africonnect.com");
}

function showAbout() {
    showToast("AfriConnect - Connecting Africa, One Heart at a Time!");
}

// ==========================================
// EVENT LISTENERS & INITIALIZATION
// ==========================================

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('profileDropdown');
    const menuBtn = document.querySelector('.profile-menu-btn');
    
    if (dropdown && dropdown.classList.contains('active') && 
        !dropdown.contains(e.target) && 
        !menuBtn.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

document.addEventListener('click', (e) => {
    const panel = document.getElementById('notificationPanel');
    
    if (panel && panel.classList.contains('active') && 
        !panel.contains(e.target) && 
        !e.target.closest('button[onclick="toggleNotifications()"]')) {
        panel.classList.remove('active');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProfileModal();
        closeChat();
        closeGroupChat();
        closeMarketDetail();
        closeCreateAdvert();
        
        const notifPanel = document.getElementById('notificationPanel');
        const profileDropdown = document.getElementById('profileDropdown');
        const eniolaChat = document.getElementById('eniolaChat');
        const mainMenuPanel = document.getElementById('mainMenuPanel');
        const mainMenuOverlay = document.getElementById('mainMenuOverlay');
        
        if (notifPanel) notifPanel.classList.remove('active');
        if (profileDropdown) profileDropdown.classList.remove('active');
        if (eniolaChat) eniolaChat.classList.remove('active');
        if (mainMenuPanel && mainMenuPanel.classList.contains('active')) {
            mainMenuPanel.classList.remove('active');
            mainMenuOverlay.classList.remove('active');
        }
    }
});

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    const searchContainer = document.querySelector('.search-container');
    const resultsContainer = document.getElementById('searchResults');
    
    if (searchContainer && resultsContainer && !searchContainer.contains(e.target)) {
        resultsContainer.classList.remove('active');
    }
});

// ==========================================
// FLASH-VIEW FUNCTIONALITY
// ==========================================

let flashPosts = [];
let currentFlashPost = null;

// Load flash posts from localStorage
function loadFlashPosts() {
    const saved = localStorage.getItem('africonnect_flash_posts');
    if (saved) {
        flashPosts = JSON.parse(saved);
        // Remove expired posts (older than 48 hours)
        const now = Date.now();
        flashPosts = flashPosts.filter(post => (now - post.timestamp) < 48 * 60 * 60 * 1000);
        localStorage.setItem('africonnect_flash_posts', JSON.stringify(flashPosts));
    }
}

// Save flash posts to localStorage
function saveFlashPosts() {
    localStorage.setItem('africonnect_flash_posts', JSON.stringify(flashPosts));
}

// Initialize Flash-View section
function initFlashView() {
    loadFlashPosts();
    renderFlashFeed();
}

// Render flash feed
function renderFlashFeed() {
    const feed = document.getElementById('flashFeed');
    if (!feed) return;
    
    if (flashPosts.length === 0) {
        feed.innerHTML = `
            <div class="p-8 text-center">
                <i class="fas fa-bolt text-6xl text-gray-600 mb-4"></i>
                <p class="text-gray-400">No flash posts yet</p>
                <p class="text-xs text-gray-500 mt-2">Be the first to share a moment!</p>
            </div>
        `;
        return;
    }
    
    // Sort by timestamp (newest first)
    const sortedPosts = [...flashPosts].sort((a, b) => b.timestamp - a.timestamp);
    
    feed.innerHTML = sortedPosts.map(post => {
        const timeAgo = getTimeAgo(post.timestamp);
        const timeLeft = getTimeLeft(post.timestamp);
        const liked = post.likes && post.likes.includes(currentUser?.username);
        
        return `
            <div class="flash-post">
                <div class="flash-post-header">
                    <img src="${post.userAvatar}" alt="${post.username}" class="flash-avatar">
                    <div class="flex-1">
                        <div class="font-bold text-white text-sm">${post.userName}</div>
                        <div class="text-xs text-gray-400">${timeAgo} • ${timeLeft} left</div>
                    </div>
                </div>
                <div class="flash-post-image" onclick="openFlashDetail('${post.id}')">
                    <img src="${post.image}" alt="Flash post">
                </div>
                ${post.caption ? `<div class="flash-post-caption">${post.caption}</div>` : ''}
                <div class="flash-post-actions">
                    <button class="flash-action-btn ${liked ? 'liked' : ''}" onclick="toggleFlashLike('${post.id}')">
                        <i class="fas fa-heart"></i>
                        <span>${post.likes?.length || 0}</span>
                    </button>
                    <button class="flash-action-btn" onclick="openFlashDetail('${post.id}')">
                        <i class="fas fa-comment"></i>
                        <span>${post.comments?.length || 0}</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Get time ago
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

// Get time left before expiry
function getTimeLeft(timestamp) {
    const expiryTime = timestamp + (48 * 60 * 60 * 1000);
    const now = Date.now();
    const diff = expiryTime - now;
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return '<1h';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
}

// Open create flash modal
function openCreateFlash() {
    document.getElementById('createFlashModal').classList.add('active');
    document.getElementById('flashImageInput').value = '';
    document.getElementById('flashCaption').value = '';
    document.getElementById('flashImagePreview').classList.add('hidden');
}

// Close create flash modal
function closeCreateFlash() {
    document.getElementById('createFlashModal').classList.remove('active');
}

// Preview flash image
document.addEventListener('DOMContentLoaded', function() {
    const flashInput = document.getElementById('flashImageInput');
    if (flashInput) {
        flashInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('flashPreviewImg').src = event.target.result;
                    document.getElementById('flashImagePreview').classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// Create flash post
function createFlashPost() {
    const input = document.getElementById('flashImageInput');
    const caption = document.getElementById('flashCaption').value;
    
    if (!input.files || !input.files[0]) {
        showToast('Please select an image');
        return;
    }
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const post = {
            id: 'flash_' + Date.now(),
            username: currentUser.username,
            userName: currentUser.profile.name || currentUser.username,
            userAvatar: currentUser.profile.photos[0] || AFRICA_MAP_URL,
            image: e.target.result,
            caption: caption,
            timestamp: Date.now(),
            likes: [],
            comments: []
        };
        
        flashPosts.unshift(post);
        saveFlashPosts();
        renderFlashFeed();
        closeCreateFlash();
        showToast('Flash posted! 🎉');
    };
    
    reader.readAsDataURL(file);
}

// Toggle flash like
function toggleFlashLike(postId) {
    const post = flashPosts.find(p => p.id === postId);
    if (!post) return;
    
    if (!post.likes) post.likes = [];
    
    const index = post.likes.indexOf(currentUser.username);
    if (index > -1) {
        post.likes.splice(index, 1);
    } else {
        post.likes.push(currentUser.username);
    }
    
    saveFlashPosts();
    renderFlashFeed();
    
    if (currentFlashPost && currentFlashPost.id === postId) {
        currentFlashPost = post;
        renderFlashDetail();
    }
}

// Open flash detail
function openFlashDetail(postId) {
    const post = flashPosts.find(p => p.id === postId);
    if (!post) return;
    
    currentFlashPost = post;
    document.getElementById('flashDetailModal').classList.add('active');
    document.getElementById('flashDetailUsername').textContent = post.userName;
    renderFlashDetail();
}

// Close flash detail
function closeFlashDetail() {
    document.getElementById('flashDetailModal').classList.remove('active');
    currentFlashPost = null;
}

// Render flash detail
function renderFlashDetail() {
    if (!currentFlashPost) return;
    
    const content = document.getElementById('flashDetailContent');
    const liked = currentFlashPost.likes && currentFlashPost.likes.includes(currentUser?.username);
    const timeAgo = getTimeAgo(currentFlashPost.timestamp);
    
    content.innerHTML = `
        <div class="flash-detail-image">
            <img src="${currentFlashPost.image}" alt="Flash post">
        </div>
        ${currentFlashPost.caption ? `<div class="p-4 border-b border-white/10">
            <p class="text-white">${currentFlashPost.caption}</p>
        </div>` : ''}
        <div class="flash-detail-actions">
            <button class="flash-action-btn ${liked ? 'liked' : ''}" onclick="toggleFlashLike('${currentFlashPost.id}')">
                <i class="fas fa-heart"></i>
                <span>${currentFlashPost.likes?.length || 0} likes</span>
            </button>
        </div>
        <div class="flash-comments">
            <div class="flash-comments-header">
                <h4 class="text-sm font-bold text-white">Comments</h4>
            </div>
            <div class="flash-comments-list" id="flashCommentsList">
                ${renderFlashComments()}
            </div>
            <div class="flash-comment-input">
                <input type="text" id="flashCommentInput" placeholder="Add a comment..." class="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white text-sm">
                <button onclick="addFlashComment()" class="ml-2 bg-yellow-500 text-black rounded-full w-10 h-10 flex items-center justify-center">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
}

// Render flash comments
function renderFlashComments() {
    if (!currentFlashPost.comments || currentFlashPost.comments.length === 0) {
        return '<div class="p-4 text-center text-gray-500 text-sm">No comments yet</div>';
    }
    
    return currentFlashPost.comments.map(comment => `
        <div class="flash-comment">
            <img src="${comment.userAvatar}" alt="${comment.userName}" class="flash-comment-avatar">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-white text-sm">${comment.userName}</span>
                    <span class="text-xs text-gray-500">${getTimeAgo(comment.timestamp)}</span>
                </div>
                <p class="text-gray-300 text-sm">${comment.text}</p>
            </div>
        </div>
    `).join('');
}

// Add flash comment
function addFlashComment() {
    const input = document.getElementById('flashCommentInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    if (!currentFlashPost.comments) currentFlashPost.comments = [];
    
    const comment = {
        id: 'comment_' + Date.now(),
        username: currentUser.username,
        userName: currentUser.profile.name || currentUser.username,
        userAvatar: currentUser.profile.photos[0] || AFRICA_MAP_URL,
        text: text,
        timestamp: Date.now()
    };
    
    currentFlashPost.comments.push(comment);
    saveFlashPosts();
    renderFlashDetail();
    renderFlashFeed();
    input.value = '';
}

// Save flash image
function saveFlashImage() {
    if (!currentFlashPost) return;
    
    const link = document.createElement('a');
    link.href = currentFlashPost.image;
    link.download = `flash_${currentFlashPost.id}.jpg`;
    link.click();
    showToast('Image saved! 📥');
}

// ==========================================
// THEME MODE FUNCTIONALITY
// ==========================================

// Set theme mode
function setThemeMode(mode) {
    const body = document.body;
    const lightTick = document.getElementById('menuLightTick');
    const darkTick = document.getElementById('menuDarkTick');
    
    if (mode === 'light') {
        body.classList.add('light-mode');
        if (lightTick) lightTick.style.display = 'inline';
        if (darkTick) darkTick.style.display = 'none';
        localStorage.setItem('africonnect_theme', 'light');
    } else {
        body.classList.remove('light-mode');
        if (lightTick) lightTick.style.display = 'none';
        if (darkTick) darkTick.style.display = 'inline';
        localStorage.setItem('africonnect_theme', 'dark');
    }
}

// Apply saved theme on page load
function applySavedTheme() {
    const saved = localStorage.getItem('africonnect_theme') || 'dark';
    setThemeMode(saved);
}

// ==========================================
// FIX PROFILE VIEWING IN DISCOVER
// ==========================================

// Make viewProfileDetails globally accessible
window.viewProfileDetails = viewProfileDetails;

// ==========================================
// INITIALIZE ON PAGE LOAD
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initLamp();
    checkOnlineStatus();

    // Firebase compat scripts load before this runs, so _firebaseReady is already set
    if (!window._firebaseReady) {
        const banner = document.getElementById('firebaseWarningBanner');
        if (banner) banner.style.display = 'block';
    }

    // initAuth is safe to call immediately — localStorage restore is synchronous
    initAuth();

    window.addEventListener('online', () => {
        const o = document.getElementById('offlineOverlay');
        if (o) o.classList.remove('active');
        showToast('Back online! 🎉');
    });
    window.addEventListener('offline', () => {
        const o = document.getElementById('offlineOverlay');
        if (o) o.classList.add('active');
    });
});