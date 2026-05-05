// ═══════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════

function goTo(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');
}


// ═══════════════════════════════════════
//  PROFILE SELECTION
// ═══════════════════════════════════════

let activeFamily = null;
let activeProfile = null;

function selectFamily(familyName) {
  activeFamily = familyName;
  document.getElementById('family-label').textContent = familyName + ' Family';
  document.querySelectorAll('.profile-card[data-family]').forEach(card => {
    card.style.display = card.dataset.family === familyName ? 'flex' : 'none';
  });
  goTo('profiles');
}

function selectProfile(profile) {
  activeProfile = profile;
  resetConversation();

  // update home screen
  document.getElementById('home-greeting-name').textContent = profile.name;
  document.getElementById('home-profile-emoji').textContent = profile.emoji;
  document.getElementById('home-profile-name').textContent = profile.name;

  // personalise Luna's opening message
  const greeting = profile.type === 'child'
    ? `Hey ${profile.name}! 🌙 I'm so happy you're here. How are you feeling today? I'm all yours! 💜`
    : `Hi ${profile.name} 😊 I'm Luna. I'm here to help with anything you need — questions about the house, schedules, or just a chat.`;

  // reset Luna chat
  document.getElementById('chat-msgs').innerHTML = `
    <div class="msg luna">
      <div class="msg-who">Luna</div>
      <div class="bubble" id="luna-greeting-bubble">${greeting}</div>
      <div class="msg-ts">Just now</div>
    </div>
  `;

  // reset front desk chat
  document.getElementById('contact-msgs').innerHTML = `
    <div class="msg desk">
      <div class="msg-who">Front Desk</div>
      <div class="bubble">Hi there! 👋 Welcome to RMHC Westmead. How can we help you today?</div>
      <div class="msg-ts">7:30 PM</div>
    </div>
  `;

  goTo('home');
}


// ═══════════════════════════════════════
//  CHAT
// ═══════════════════════════════════════

function sendQ(text) {
  submitMessage(text);
}

function sendTyped() {
  const inp = document.getElementById('txt-input');
  const txt = inp.value.trim();
  if (!txt) return;
  inp.value = '';
  submitMessage(txt);
}

function submitMessage(text) {
  appendMsg('user', text);
  const box = document.getElementById('chat-msgs');
  const t = document.createElement('div');
  t.className = 'typing-row';
  t.id = 'typing-indicator';
  t.innerHTML = `
    <div class="msg-who">Luna</div>
    <div class="typing-bub">
      <div class="tdot"></div>
      <div class="tdot"></div>
      <div class="tdot"></div>
    </div>
  `;
  box.appendChild(t);
  box.scrollTop = box.scrollHeight;
  askLuna(text).then(reply => { t.remove(); appendMsg('luna', reply); });
}

function appendMsg(who, text) {
  const box = document.getElementById('chat-msgs');
  const d = document.createElement('div');
  d.className = 'msg ' + who;
  d.innerHTML = `
    <div class="msg-who">${who === 'user' ? activeProfile?.name || 'You' : 'Luna'}</div>
    <div class="bubble">${text}</div>
    <div class="msg-ts">Just now</div>
  `;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}

// ═══════════════════════════════════════
//  MUSIC
// ═══════════════════════════════════════

let playing = true;
let currentSong = 0;

const songs = [
  { emoji: '🌙', title: 'Moonbeam Lullaby', artist: 'Calming Collection', dur: '2:18' },
  { emoji: '🌊', title: 'Ocean Breeze Dreams', artist: 'Sleep Sounds', dur: '3:12' },
  { emoji: '⭐', title: 'Starlight Journey', artist: 'Adventure Stories', dur: '4:05' },
  { emoji: '🌸', title: 'Gentle Garden Rain', artist: 'Nature Sounds', dur: '5:30' },
  { emoji: '🦋', title: 'Butterfly Waltz', artist: 'Soft Classical', dur: '2:55' },
  { emoji: '🌿', title: 'Whispering Willows', artist: 'Nature Sounds', dur: '6:10' },
];

function togglePlay() {
  playing = !playing;
  document.getElementById('play-btn').textContent = playing ? '⏸' : '▶';
  document.getElementById('np-disc').classList.toggle('paused', !playing);
}

function selectSong(index) {
  currentSong = index;
  const song = songs[index];

  // update now playing panel
  document.getElementById('np-disc').textContent = song.emoji;
  document.getElementById('np-title').textContent = song.title;
  document.getElementById('np-artist').textContent = song.artist;

  // reset progress bar
  document.querySelector('.prog-fill').style.width = '0%';
  document.querySelector('.prog-dot').style.left = '0%';
  document.querySelector('.prog-times span:first-child').textContent = '0:00';
  document.querySelector('.prog-times span:last-child').textContent = song.dur;

  // update playlist — highlight selected, swap waves/duration
  document.querySelectorAll('.pl-item').forEach((el, i) => {
    el.classList.toggle('now', i === index);

    const waves = el.querySelector('.pl-waves');
    const dur = el.querySelector('.pl-dur');

    if (i === index && !waves) {
      const w = document.createElement('div');
      w.className = 'pl-waves';
      w.innerHTML = '<div class="pw"></div><div class="pw"></div><div class="pw"></div>';
      if (dur) el.replaceChild(w, dur);
    }

    if (i !== index && waves) {
      const d = document.createElement('div');
      d.className = 'pl-dur';
      d.textContent = songs[i].dur;
      el.replaceChild(d, waves);
    }
  });

  // auto play on selection
  playing = true;
  document.getElementById('play-btn').textContent = '⏸';
  document.getElementById('np-disc').classList.remove('paused');
}


// ═══════════════════════════════════════
//  CONTACT FRONT DESK
// ═══════════════════════════════════════

let calling = false;

function sendContactMsg() {
  const inp = document.getElementById('contact-input');
  const txt = inp.value.trim();
  if (!txt) return;
  inp.value = '';

  const box = document.getElementById('contact-msgs');

  // user message
  const d = document.createElement('div');
  d.className = 'msg user';
  d.innerHTML = `
    <div class="msg-who">${activeProfile?.name || 'You'}</div>
    <div class="bubble">${txt}</div>
    <div class="msg-ts">Just now</div>
  `;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;

  // simulated front desk reply
  setTimeout(() => {
    const r = document.createElement('div');
    r.className = 'msg desk';
    r.innerHTML = `
      <div class="msg-who">Front Desk</div>
      <div class="bubble">Thanks for your message! We'll be right with you. If it's urgent please call us or come to the lobby. 😊</div>
      <div class="msg-ts">Just now</div>
    `;
    box.appendChild(r);
    box.scrollTop = box.scrollHeight;
  }, 1500);
}

function startCall() {
  calling = true;
  document.getElementById('calling-overlay').classList.add('active');
  document.getElementById('calling-status').textContent = 'Calling...';

  // simulate connection after 2s
  setTimeout(() => {
    if (calling) document.getElementById('calling-status').textContent = 'Connected ✓';
  }, 2000);
}

function endCall() {
  calling = false;
  document.getElementById('calling-overlay').classList.remove('active');
}
