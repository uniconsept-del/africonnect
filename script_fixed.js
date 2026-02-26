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

    // Save to server DB
    if (currentUser) {
        currentUser.adverts = myAdverts;
        const db = getServerDB();
        db.users[currentUser.username] = currentUser;
        saveServerDB(db);
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

        // Save to server DB
        if (currentUser) {
            currentUser.adverts = myAdverts;
            const db = getServerDB();
            db.users[currentUser.username] = currentUser;
            saveServerDB(db);
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

        // Save to server DB
        if (currentUser) {
            currentUser.matches = matches;
            currentUser.chats = chats;
            const db = getServerDB();
            db.users[currentUser.username] = currentUser;
            saveServerDB(db);
        }

        initMatches();
        initChats();
    }
}

// ==========================================
// CHAT FUNCTIONS - FIXED WITH MESSAGE SYNC
// ==========================================

function openChat(name) {
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

        // Save to server DB
        if (currentUser) {
            currentUser.chats = chats;
            const db = getServerDB();
            db.users[currentUser.username] = currentUser;
            saveServerDB(db);
        }

        initChats();
    }

    if (!chat) {
        showToast("Cannot start chat with this user");
        return;
    }

    currentChatUser = chat;

    document.getElementById('chatName').textContent = chat.name;
    document.getElementById('chatAvatar').src = chat.img;
    document.getElementById('chatBox').classList.add('active');

    renderMessages(name);

    chat.unread = 0;
    initChats();
}

function openChatFromProfile(name) {
    closeProfileModal();
    setTimeout(() => openChat(name), 300);
}

function closeChat() {
    document.getElementById('chatBox').classList.remove('active');
    currentChatUser = null;
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

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();

    if (!text || !currentChatUser) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!chatHistories[currentChatUser.name]) {
        chatHistories[currentChatUser.name] = [];
    }

    chatHistories[currentChatUser.name].push({
        text: text,
        sent: true,
        time: time
    });

    const chat = chats.find(c => c.name === currentChatUser.name);
    if (chat) {
        chat.message = text;
        chat.time = "Just now";
        initChats();

        // Save to server DB
        if (currentUser) {
            currentUser.chats = chats;
            const db = getServerDB();
            db.users[currentUser.username] = currentUser;

            // Also store message in global messages for recipient to access
            if (!db.messages[currentChatUser.name]) {
                db.messages[currentChatUser.name] = [];
            }
            db.messages[currentChatUser.name].push({
                from: currentUser.profile.name,
                to: currentChatUser.name,
                text: text,
                time: time,
                read: false,
                timestamp: Date.now()
            });

            saveServerDB(db);
        }
    }

    input.value = '';
    renderMessages(currentChatUser.name);
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
    // Load from currentUser which is synced with server DB
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
    // Load from currentUser which is synced with server DB
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
                // Save to server DB
                const db = getServerDB();
                db.users[currentUser.username] = currentUser;
                saveServerDB(db);
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

    // Initialize auth
    initAuth();

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