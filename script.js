// ==========================================
// LAMP LOGIC - FIXED VERSION
// ==========================================

let isLightOn = false;
let isAnimating = false;

function initLamp() {
    const touchLamp = document.getElementById('touchLamp');
    const ropeSwitch = document.getElementById('ropeSwitch');
    const ropeContainer = document.getElementById('ropeSwitchContainer');
    const clickFeedback = document.getElementById('clickFeedback');
    const body = document.body;

    if (!touchLamp || !ropeSwitch || !ropeContainer) {
        console.error('Lamp elements not found');
        return;
    }

    function toggleLight(e) {
        // Prevent rapid clicking
        if (isAnimating) return;
        isAnimating = true;
        
        // Show click feedback animation
        if (clickFeedback) {
            clickFeedback.classList.remove('animate');
            void clickFeedback.offsetWidth; // Trigger reflow
            clickFeedback.classList.add('animate');
        }
        
        // Animate rope pull
        ropeSwitch.classList.add('pulled');
        
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
            ropeSwitch.classList.remove('pulled');
        }, 400);
        
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    // Click on lamp container
    touchLamp.addEventListener('click', toggleLight);
    
    // Click specifically on the rope
    ropeContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLight();
    });

    // Touch support for mobile
    touchLamp.addEventListener('touchstart', (e) => {
        e.preventDefault();
        toggleLight();
    }, { passive: false });
    
    ropeContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLight();
    }, { passive: false });
}

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
    const session = localStorage.getItem('afriConnect_session');
    if (session) {
        try {
            const saved = JSON.parse(session);
            if (window._firebaseReady) {
                const snapshot = await window._dbGet(window._dbRef(window._db, `users/${saved.username}`));
                if (snapshot.exists()) {
                    currentUser = snapshot.val();
                    enterApp();
                } else {
                    localStorage.removeItem('afriConnect_session');
                    currentUser = null;
                }
            } else {
                // Firebase not configured yet - fall back to localStorage
                const users = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
                if (users[saved.username]) {
                    currentUser = users[saved.username];
                    enterApp();
                } else {
                    localStorage.removeItem('afriConnect_session');
                    currentUser = null;
                }
            }
        } catch (e) {
            localStorage.removeItem('afriConnect_session');
            currentUser = null;
        }
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
    
    try {
        if (window._firebaseReady) {
            const snapshot = await window._dbGet(window._dbRef(window._db, `users/${username}`));
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
        enterApp();
        subscribeToIncomingMessages();
    } catch (err) {
        errorDiv.textContent = 'Login error. Please try again.';
        errorDiv.style.display = 'block';
        console.error(err);
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
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
        errorDiv.textContent = 'Username can only contain letters, numbers, and underscores.';
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
            // Check if username already exists in Firebase
            const snapshot = await window._dbGet(window._dbRef(window._db, `users/${username}`));
            if (snapshot.exists()) {
                errorDiv.textContent = 'Username already exists. Please choose another.';
                errorDiv.style.display = 'block';
                if (btn) { btn.disabled = false; btn.textContent = 'Sign Up'; }
                return;
            }
            // Save to Firebase
            await window._dbSet(window._dbRef(window._db, `users/${username}`), newUser);
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
        localStorage.setItem('afriConnect_session', JSON.stringify({ username: currentUser.username }));
        
        successDiv.textContent = 'Account created successfully! Redirecting...';
        successDiv.style.display = 'block';
        
        setTimeout(() => {
            showToast('Welcome to AfriConnect! 🎉');
            enterApp();
            subscribeToIncomingMessages();
        }, 1000);
    } catch (err) {
        errorDiv.textContent = 'Error creating account. Please try again.';
        errorDiv.style.display = 'block';
        console.error(err);
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Sign Up'; }
}

function enterApp() {
    document.getElementById('interface-container').style.display = 'none';
    document.getElementById('touchLamp').style.display = 'none';
    document.getElementById('africaMapBg').style.opacity = '0';
    document.getElementById('swipe-interface').classList.add('active');
    
    loadUserProfile();
    initDiscovery();
    initNearby();
    initGroups();
    initMatches();
    initChats();
    initMarket();
    updateNotificationBadge();
    
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
    if (!currentUser) return;
    
    const profile = currentUser.profile;
    
    document.getElementById('userAvatar').src = profile.photos[0] || AFRICA_MAP_URL;
    document.getElementById('menuUserAvatar').src = profile.photos[0] || AFRICA_MAP_URL;
    document.getElementById('menuUserName').textContent = profile.name;
    
    document.getElementById('profileName').value = profile.name || '';
    document.getElementById('profileAge').value = profile.age || '';
    document.getElementById('profileBio').value = profile.bio || '';
    document.getElementById('profileJob').value = profile.job || '';
    document.getElementById('profileCompany').value = profile.company || '';
    document.getElementById('profileSchool').value = profile.school || '';
    document.getElementById('profilePhone').value = profile.phone || '';
    document.getElementById('distanceSlider').value = profile.distance || 50;
    document.getElementById('distanceValue').textContent = (profile.distance || 50) + ' km';
    document.getElementById('ageMin').value = profile.ageMin || 22;
    document.getElementById('ageMax').value = profile.ageMax || 30;
    document.getElementById('ageValue').textContent = (profile.ageMin || 22) + ' - ' + (profile.ageMax || 30);
    document.getElementById('lookingFor').value = profile.lookingFor || 'everyone';
    
    renderPhotoGrid();
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
    nearbyActive: true,
    photos: [AFRICA_MAP_URL]
};

let chatHistories = {};
let groupChatHistories = {};
let currentChatUser = null;
let currentGroupRoom = null;
let myAdverts = [];
let notifications = [];

// All hardcoded bot/demo profiles have been removed.
// Only real registered users from Firebase/localStorage will appear.
const profiles = [];

// All hardcoded nearby people have been removed.
// Nearby section will only show real registered users.
let nearbyPeople = [];

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
// MAIN MENU FUNCTIONS
// ==========================================

function toggleMainMenu() {
    const overlay = document.getElementById('mainMenuOverlay');
    const panel = document.getElementById('mainMenuPanel');
    
    overlay.classList.toggle('active');
    panel.classList.toggle('active');
}

function showSectionFromMenu(section) {
    toggleMainMenu();
    showSection(section);
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (section === 'swipe') document.querySelectorAll('.nav-item')[0].classList.add('active');
    else if (section === 'nearby') document.querySelectorAll('.nav-item')[1].classList.add('active');
    else if (section === 'matches') document.querySelectorAll('.nav-item')[2].classList.add('active');
    else if (section === 'messages') document.querySelectorAll('.nav-item')[3].classList.add('active');
}

function showSection(section) {
    document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(`section-${section}`).classList.add('active');
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
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
            // Refresh discovery grid
            initDiscovery();
            initNearby();
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
        
        return `
        <div class="grid-profile-card" onclick="viewProfileDetails('${profile.name}', 'discover')">
            <img src="${profile.img}" class="grid-profile-image" alt="${profile.name}">
            <div class="grid-profile-info">
                <div class="flex items-center mb-1">
                    <h3 class="text-sm font-bold text-white">${profile.name}, ${profile.age}</h3>
                    ${verifiedBadge}
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

function likeProfile(name) {
    showToast(`Liked ${name}! 💛`);
    const card = event.target.closest('.grid-profile-card');
    card.style.border = '2px solid #22c55e';
    
    const allProfiles = getAllDiscoverableProfiles();
    const likedProfile = allProfiles.find(p => p.name === name);
    
    if (likedProfile && likedProfile.isRegisteredUser) {
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
// NEARBY FUNCTIONS
// ==========================================

function getAllNearbyPeople() {
    const users = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
    const allNearby = [...nearbyPeople];
    
    Object.values(users).forEach(user => {
        if (currentUser && user.username === currentUser.username) return;
        
        const exists = allNearby.some(p => p.name === (user.profile.name || user.username));
        if (!exists) {
            const distance = (Math.random() * 5).toFixed(1);
            const nearbyUser = {
                name: user.profile.name || user.username,
                age: user.profile.age || 24,
                distance: `${distance} km`,
                img: user.profile.photos && user.profile.photos.length > 0 ? user.profile.photos[0] : AFRICA_MAP_URL,
                online: Math.random() > 0.3,
                isRegisteredUser: true,
                username: user.username,
                isBot: false
            };
            allNearby.push(nearbyUser);
        }
    });
    
    return allNearby;
}

function initNearby() {
    const allNearby = getAllNearbyPeople();
    renderNearbyGrid(allNearby);
}

function renderNearbyGrid(peopleList) {
    const grid = document.getElementById('nearbyGrid');
    document.getElementById('nearbyCountText').textContent = `${peopleList.length} people within 5 km`;
    
    grid.innerHTML = peopleList.map(person => `
        <div class="nearby-card" onclick="viewNearbyProfile('${person.name}')">
            <img src="${person.img}" alt="${person.name}">
            <div class="nearby-distance">${person.distance}</div>
            ${person.online ? '<div class="nearby-online"></div>' : ''}
        </div>
    `).join('');
}

function toggleNearby(element) {
    element.classList.toggle('active');
    userProfile.nearbyActive = element.classList.contains('active');
    showToast(userProfile.nearbyActive ? "Nearby mode activated! 📍" : "Nearby mode disabled");
}

function filterNearby(distance) {
    showToast(`Showing people within ${distance} km`);
}

function viewNearbyProfile(name) {
    const allNearby = getAllNearbyPeople();
    const person = allNearby.find(p => p.name === name);
    if (!person) return;
    
    const users = JSON.parse(localStorage.getItem('afriConnect_users')) || {};
    const userData = Object.values(users).find(u => (u.profile.name || u.username) === name);
    
    const profile = userData ? {
        ...person,
        bio: userData.profile.bio || 'New to AfriConnect',
        job: userData.profile.job || 'Member',
        company: userData.profile.company || 'AfriConnect',
        school: userData.profile.school || '',
        phone: userData.profile.phone || 'Hidden',
        photos: userData.profile.photos || [person.img],
        isBot: false
    } : {
        ...person,
        bio: "Nearby user looking to connect!",
        job: "Unknown",
        company: "Unknown",
        school: "Unknown",
        phone: "Hidden",
        photos: [person.img],
        isBot: false
    };
    
    currentViewingProfile = profile;
    
    const modal = document.getElementById('profileModal');
    const content = document.getElementById('profileModalContent');
    const actions = document.getElementById('profileModalActions');
    
    content.innerHTML = `
        <div class="profile-hero">
            <img src="${profile.img}" alt="${profile.name}">
            <div class="profile-hero-info">
                <h2 class="text-3xl font-bold text-white mb-2">${profile.name}, ${profile.age}</h2>
                <p class="text-yellow-400 text-sm"><i class="fas fa-map-marker-alt mr-2"></i>${profile.distance} away</p>
            </div>
        </div>
        
        <div class="info-section">
            <h3 class="text-base font-bold text-yellow-500 mb-3">About</h3>
            <p class="text-gray-300 text-sm leading-relaxed">${profile.bio}</p>
        </div>
    `;
    
    actions.innerHTML = `
        <button class="action-bar-btn dislike" onclick="closeProfileModal()">
            <i class="fas fa-times"></i>
        </button>
        <button class="action-bar-btn like" onclick="closeProfileModal(); showToast('Like sent! 💛')">
            <i class="fas fa-heart"></i>
        </button>
    `;
    
    modal.classList.add('active');
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
    const messages = chatHistories[userName] || [];
    
    container.innerHTML = messages.map(msg => `
        <div class="message ${msg.sent ? 'sent' : 'received'}">
            <div>${msg.text}</div>
            <div class="message-time">${msg.time}</div>
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
            
            // Push message — onValue listener will update both sides instantly
            await window._dbPush(window._dbRef(window._db, `chats/${chatKey}/messages`), firebaseMsg);
            
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
    if (currentUser && currentUser.chats) {
        chats = currentUser.chats;
        initializeChatHistories();
    }
    
    const list = document.getElementById('chatList');
    
    if (chats.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: #888; padding: 40px;">No messages yet. Match with someone to start chatting!</div>';
        return;
    }
    
    list.innerHTML = chats.map(chat => `
        <div class="chat-item" onclick="openChat('${chat.name}')">
            <img src="${chat.img}" class="chat-avatar" alt="${chat.name}">
            <div class="chat-preview">
                <div class="chat-name">${chat.name}</div>
                <div class="chat-message">${chat.message}</div>
            </div>
            <div class="text-right">
                <div class="chat-time">${chat.time}</div>
                ${chat.unread > 0 ? `<div class="unread-badge">${chat.unread}</div>` : ''}
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
// INITIALIZE ON PAGE LOAD
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize lamp functionality
    initLamp();
    
    // Check online status
    checkOnlineStatus();

    // Show Firebase warning if not configured
    if (!window._firebaseReady) {
        const banner = document.getElementById('firebaseWarningBanner');
        if (banner) banner.style.display = 'block';
    }
    
    // Initialize auth — Firebase may or may not be ready
    if (window._firebaseReady) {
        initAuth();
    } else {
        // Listen for firebaseReady (real config provided)
        window.addEventListener('firebaseReady', () => {
            initAuth();
        });
        // If Firebase is not configured, init immediately with localStorage
        setTimeout(() => {
            if (!window._firebaseReady) {
                initAuth();
            }
        }, 500);
    }
    
    // Setup online/offline listeners
    window.addEventListener('online', () => {
        const offlineOverlay = document.getElementById('offlineOverlay');
        if (offlineOverlay) offlineOverlay.classList.remove('active');
        showToast("Back online! 🎉");
    });
    
    window.addEventListener('offline', () => {
        const offlineOverlay = document.getElementById('offlineOverlay');
        if (offlineOverlay) offlineOverlay.classList.add('active');
    });
});