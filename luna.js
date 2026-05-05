const GROQ_API_KEY = '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';

const MODEL = 'llama-3.1-8b-instant';
let conversationHistory = [];


// ═══════════════════════════════════════
//  SYSTEM PROMPT
// ═══════════════════════════════════════

function buildSystemPrompt(profile) {
  const base = `You are Luna, a warm and gentle AI companion living inside a tablet at Ronald McDonald House Charities (RMHC) Westmead in Sydney, Australia. RMHC provides free accommodation for families with seriously ill children receiving hospital treatment nearby. Families stay for days or weeks, far from home, often under enormous stress.

Your role is to provide comfort, companionship, and support during the "in-between moments" — when parents or staff aren't immediately available. You are never a replacement for human care. You are a gentle, always-available presence.

Rules:
- Always be warm, kind and patient
- Keep responses concise — this is a tablet UI, not a long chat
- Never discuss anything inappropriate, scary or upsetting
- If someone seems distressed, gently suggest they talk to a parent or staff member
- Use the user's name naturally, but not in every message
- Never make up medical information
- If asked about hospital or medical things, suggest talking to a doctor or nurse`;

  if (profile.type === 'child') {
    const age = parseInt(profile.age);
    if (age <= 6) {
      return base + `\n\nYou are talking to ${profile.name}, who is ${profile.age} years old. Use very simple words and short sentences. Be very playful and silly. Use lots of emojis. Suggest simple games and stories. Be extra gentle and reassuring.`;
    } else if (age <= 10) {
      return base + `\n\nYou are talking to ${profile.name}, who is ${profile.age} years old. Be fun and friendly. Tell jokes, riddles and stories. Use some emojis. Be encouraging and positive.`;
    } else {
      return base + `\n\nYou are talking to ${profile.name}, who is ${profile.age} years old. Be conversational and relatable — not babyish. Have deeper conversations about feelings if needed. Use minimal emojis.`;
    }
  }

  return base + `\n\nYou are talking to ${profile.name}, a parent staying at RMHC Westmead. Be calm, warm and informative. They may be exhausted and stressed — be understanding. Help with questions about RMHC facilities, meal times, schedules and local services. Suggest speaking to RMHC staff for anything requiring human help.`;
}


// ═══════════════════════════════════════
//  API CALL
// ═══════════════════════════════════════

async function askLuna(userMessage) {
  conversationHistory.push({
    role: 'user',
    content: userMessage
  });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [
          { role: 'system', content: buildSystemPrompt(activeProfile) },
          ...conversationHistory
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;

    conversationHistory.push({
      role: 'assistant',
      content: reply
    });

    return reply;

  } catch (error) {
    console.error('Luna API error:', error);
    return "Sorry, I'm having a little trouble right now 🌙 Try again in a moment!";
  }
}


// ═══════════════════════════════════════
//  RESET CONVERSATION
// ═══════════════════════════════════════

function resetConversation() {
  conversationHistory = [];
}
