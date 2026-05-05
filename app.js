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

  document.getElementById('np-disc').textContent = song.emoji;
  document.getElementById('np-title').textContent = song.title;
  document.getElementById('np-artist').textContent = song.artist;

  document.querySelector('.prog-fill').style.width = '0%';
  document.querySelector('.prog-dot').style.left = '0%';
  document.querySelector('.prog-times span:first-child').textContent = '0:00';
  document.querySelector('.prog-times span:last-child').textContent = song.dur;

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

  const d = document.createElement('div');
  d.className = 'msg user';
  d.innerHTML = `
    <div class="msg-who">${activeProfile?.name || 'You'}</div>
    <div class="bubble">${txt}</div>
    <div class="msg-ts">Just now</div>
  `;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;

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

  setTimeout(() => {
    if (calling) document.getElementById('calling-status').textContent = 'Connected ✓';
  }, 2000);
}

function endCall() {
  calling = false;
  document.getElementById('calling-overlay').classList.remove('active');
}


// ═══════════════════════════════════════
//  STORY BUILDER
// ═══════════════════════════════════════

let storyHistory = [];
let storyStep = 0;
let STORY_STEPS = 4;
let lastStorySteps = 4;

function buildStoryPrompt() {
  const name = activeProfile?.name || 'friend';
  const age = activeProfile?.age || 8;
  return `You are Luna, a warm storyteller for a child named ${name} (age ${age}) staying at Ronald McDonald House.
You are telling an interactive adventure story together.

Rules:
- Keep each story segment to 3-5 sentences maximum — short and vivid
- Always end your response with exactly 3 choices for what happens next, formatted like this:
  CHOICE_A: [emoji] [short fun option]
  CHOICE_B: [emoji] [short fun option]
  CHOICE_C: [emoji] [short fun option]
- Make the story magical, fun and age appropriate
- Remember what happened earlier in the story
- On the FINAL chapter (chapter ${STORY_STEPS} of ${STORY_STEPS}), write a satisfying ending and do NOT include any choices. End with THE_END.`;
}

function showStoryLengthPicker() {
  goTo('story');
  document.getElementById('story-length-picker').classList.add('active');
}

async function startStory(steps) {
  if (steps) lastStorySteps = steps; // ← save it
  STORY_STEPS = lastStorySteps;     // ← use saved value
  storyHistory = [];
  storyStep = 0;

  document.getElementById('story-length-picker').classList.remove('active');
  document.getElementById('story-end-wrap').style.display = 'none';
  document.getElementById('story-choices').style.display = '';
  document.getElementById('story-choices').innerHTML = '';
  document.getElementById('story-text').textContent = '';
  updateStoryProgress();
  showStoryTyping();

  const opening = `Start an exciting adventure story for ${activeProfile?.name || 'a child'}. Set the scene in 3-4 sentences, then give 3 choices for what happens next.`;
  await advanceStory(opening);
}

async function pickChoice(choice) {
  disableChoices();
  showStoryTyping();
  await advanceStory(`The child chose: ${choice}. Continue the story from this choice.`);
}

async function advanceStory(userMsg) {
  storyStep++;
  updateStoryProgress();

  storyHistory.push({ role: 'user', content: userMsg });

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 400,
        messages: [
          { role: 'system', content: buildStoryPrompt() },
          ...storyHistory
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    storyHistory.push({ role: 'assistant', content: reply });

    hideStoryTyping();
    renderStoryResponse(reply);

  } catch (e) {
    hideStoryTyping();
    document.getElementById('story-text').textContent = "Oops, Luna lost her place in the story! Try again 🌙";
  }
}

function renderStoryResponse(reply) {
  const isEnd = reply.includes('THE_END');

  const lines = reply.split('\n').map(l => l.trim()).filter(Boolean);
  const choiceLines = lines.filter(l => l.startsWith('CHOICE_'));
  const storyLines = lines.filter(l => !l.startsWith('CHOICE_') && l !== 'THE_END');

  document.getElementById('story-text').textContent = storyLines.join('\n\n');

  const choicesEl = document.getElementById('story-choices');
  const endEl = document.getElementById('story-end-wrap');

  if (isEnd || storyStep >= STORY_STEPS) {
    choicesEl.style.display = 'none';
    endEl.style.display = 'flex';
  } else {
    choicesEl.innerHTML = '';
    choiceLines.forEach(line => {
      const text = line.replace(/^CHOICE_[ABC]:\s*/, '').trim();
      const btn = document.createElement('button');
      btn.className = 'story-choice-btn';
      btn.textContent = text;
      btn.onclick = () => pickChoice(text);
      choicesEl.appendChild(btn);
    });
  }
}

function updateStoryProgress() {
  const pct = Math.min((storyStep / STORY_STEPS) * 100, 100);
  document.getElementById('story-progress-fill').style.width = pct + '%';
  document.getElementById('story-progress-step').textContent =
    storyStep >= STORY_STEPS ? 'The End! 🌟' : `Chapter ${storyStep} of ${STORY_STEPS}`;
}

function showStoryTyping() {
  document.getElementById('story-typing').style.display = 'flex';
  document.getElementById('story-choices').innerHTML = '';
}

function hideStoryTyping() {
  document.getElementById('story-typing').style.display = 'none';
}

function disableChoices() {
  document.querySelectorAll('.story-choice-btn').forEach(b => b.disabled = true);
}

function endStory() {
  storyHistory = [];
  storyStep = 0;
  document.getElementById('story-length-picker').classList.remove('active');
  goTo('home');
}
