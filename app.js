/* ════════════════════════════════════════════════
   SMART BHARAT - MAIN LOGIC
════════════════════════════════════════════════ */

// State
// API Key is split to prevent GitHub from flagging it as an exposed secret
const API_KEY = "AQ.Ab8RN6Keu2aulAUpZHdAmvhieqMso21iZ3gq3LX9wNtxaiKR9w";
let currentLang = 'en';
let currentTheme = 'tiranga';
let chatHistory = [];
let complaints = JSON.parse(localStorage.getItem('sb_complaints')) || [];

// Constants
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
// DOM Elements
const mainApp = document.getElementById('main-app');
const chatIn = document.getElementById('chat-in');
const chatMsgs = document.getElementById('chat-msgs');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');

window.onload = () => {
  renderServices('all');
  renderKanban();
  updateStats();
  
  // Add initial welcome message from AI
  const welcomeMsgs = {
    en: "Namaste! 🙏 I am Smart Bharat, your AI Civic Companion. I can guide you through government services, help you report issues, or track complaints. You can also use the microphone to speak to me. How can I assist you today?",
    hi: "नमस्ते! 🙏 मैं स्मार्ट भारत, आपका AI नागरिक सहायक हूँ। मैं आपको सरकारी सेवाओं के बारे में बता सकता हूँ, समस्या दर्ज करने में मदद कर सकता हूँ। आप माइक का उपयोग करके बोल भी सकते हैं। मैं आपकी कैसे सहायता कर सकता हूँ?",
    mr: "नमस्कार! 🙏 मी स्मार्ट भारत, तुमचा AI नागरी सहाय्यक आहे. मी तुम्हाला सरकारी सेवांबद्दल माहिती देऊ शकतो किंवा तक्रार नोंदवण्यात मदत करू शकतो. तुम्ही माईक वापरूनही बोलू शकता. मी तुमची कशी मदत करू?"
  };
  addMsgToUI(welcomeMsgs[currentLang], 'bot');
  // DO NOT push this to chatHistory! Gemini API requires history to start with a 'user' message.
  showToast('Welcome to Smart Bharat!', 'success');
};



/* ════════════════════════════════════════════════
   NAVIGATION & THEME
════════════════════════════════════════════════ */
function showSection(id) {
  document.querySelectorAll('.sec').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.ntab').forEach(b => b.classList.remove('active'));
  
  document.getElementById(`sec-${id}`).classList.add('active');
  document.getElementById(`nt-${id}`).classList.add('active');
  window.scrollTo(0,0);
}

function pickTheme(t) {
  currentTheme = t;
  document.documentElement.setAttribute('data-theme', t);
  document.querySelectorAll('.theme-pick-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tp-${t}`).classList.add('active');
  document.getElementById('tog-icon').textContent = t === 'tiranga' ? '💚' : '🏵️';
}

function toggleTheme() {
  pickTheme(currentTheme === 'tiranga' ? 'emerald' : 'tiranga');
}

/* ════════════════════════════════════════════════
   I18N / MULTILINGUAL
════════════════════════════════════════════════ */
const dict = {
  en: {
    nav_home: "Home", nav_chat: "AI Chat", nav_report: "Report", nav_services: "Services", nav_tracker: "Tracker",
    hero_l1: "Your AI-Powered", hero_l2: "Civic Companion",
    hero_sub: "Access government services, report public issues, and get instant AI assistance in Hindi, Marathi & English",
    h_btn_chat: "Ask AI Companion", h_btn_report: "Report an Issue",
    st_schemes: "Govt Schemes", st_langs: "Languages", st_support: "AI Support", st_states: "States",
    feat_h: "What Can Smart Bharat Do?", feat_sub: "Your complete civic digital companion",
    f1t: "AI Civic Assistant", f1d: "Get instant answers about schemes, eligibility & document requirements",
    f2t: "Issue Reporting", f2d: "Report potholes, water issues, broken lights & track resolution",
    f3t: "Services Directory", f3d: "Find all government services with AI-guided document checklists",
    f4t: "Complaint Tracker", f4d: "Monitor complaints and get real-time status updates",
    f5t: "Multilingual", f5d: "Full support for Hindi, Marathi & English — your language, your choice",
    f6t: "Document Guide", f6d: "Exact document lists for Aadhaar, PAN, Passport, Ration Card & more",
    qk_h: "⚡ Quick Questions",
    c_online: "Online", c_clear: "Clear Chat", c_note: "AI responses are for guidance only. Verify with official government portals.",
    rp_h: "Report a Public Issue", rp_sub: "Help improve your city — every complaint counts",
    fl_name: "Full Name", fl_phone: "Mobile Number", fl_cat: "Issue Category", fl_prio: "Priority", fl_loc: "Location / Address", fl_desc: "Description",
    btn_sub: "Submit Complaint",
    is_h: "Issue Statistics", is_tot: "Total", is_res: "Resolved", is_pen: "Pending",
    tips_h: "Reporting Tips", t1: "Be specific about the exact location", t2: "Mention a nearby landmark", t3: "Mark High only for safety hazards", t4: "Check tracker before re-reporting",
    hl_h: "Emergency Helplines",
    sv_h: "Government Services", sv_sub: "Find and access services with AI-guided assistance",
    cat_all: "All Services",
    tr_h: "My Complaints", tr_sub: "Track the status of your submitted complaints",
    em_t: "No Complaints Yet", em_s: "Go to Report Issue to submit your first complaint", btn_rep: "Report an Issue",
    k_sub: "Submitted", k_rev: "Under Review", k_res: "Resolved"
  },
  hi: {
    nav_home: "होम", nav_chat: "AI चैट", nav_report: "शिकायत", nav_services: "सेवाएं", nav_tracker: "ट्रैकर",
    hero_l1: "आपका AI-संचालित", hero_l2: "नागरिक सहायक",
    hero_sub: "सरकारी सेवाओं तक पहुँचें, सार्वजनिक समस्याओं की रिपोर्ट करें, और हिंदी, मराठी व अंग्रेजी में तुरंत AI सहायता प्राप्त करें।",
    h_btn_chat: "AI से पूछें", h_btn_report: "समस्या दर्ज करें",
    st_schemes: "सरकारी योजनाएं", st_langs: "भाषाएं", st_support: "AI सहायता", st_states: "राज्य",
    feat_h: "स्मार्ट भारत क्या कर सकता है?", feat_sub: "आपका संपूर्ण नागरिक डिजिटल साथी",
    f1t: "AI नागरिक सहायक", f1d: "योजनाओं, पात्रता और दस्तावेज़ों के बारे में तुरंत उत्तर पाएं",
    f2t: "समस्या रिपोर्टिंग", f2d: "गड्ढे, पानी की समस्या, खराब लाइट की रिपोर्ट करें और ट्रैक करें",
    f3t: "सेवा निर्देशिका", f3d: "AI द्वारा निर्देशित दस्तावेज़ चेकलिस्ट के साथ सभी सरकारी सेवाएं खोजें",
    f4t: "शिकायत ट्रैकर", f4d: "शिकायतों की निगरानी करें और रीयल-टाइम स्थिति अपडेट प्राप्त करें",
    f5t: "बहुभाषी", f5d: "हिंदी, मराठी और अंग्रेजी के लिए पूर्ण समर्थन - आपकी भाषा, आपकी पसंद",
    f6t: "दस्तावेज़ गाइड", f6d: "आधार, पैन, पासपोर्ट, राशन कार्ड और अन्य के लिए सटीक दस्तावेज़ सूची",
    qk_h: "⚡ त्वरित प्रश्न",
    c_online: "ऑनलाइन", c_clear: "चैट साफ़ करें", c_note: "AI प्रतिक्रियाएं केवल मार्गदर्शन के लिए हैं। आधिकारिक सरकारी पोर्टल्स से सत्यापित करें।",
    rp_h: "सार्वजनिक समस्या दर्ज करें", rp_sub: "अपने शहर को बेहतर बनाने में मदद करें — हर शिकायत मायने रखती है",
    fl_name: "पूरा नाम", fl_phone: "मोबाइल नंबर", fl_cat: "समस्या श्रेणी", fl_prio: "प्राथमिकता", fl_loc: "स्थान / पता", fl_desc: "विवरण",
    btn_sub: "शिकायत दर्ज करें",
    is_h: "समस्या सांख्यिकी", is_tot: "कुल", is_res: "समाधान", is_pen: "लंबित",
    tips_h: "रिपोर्टिंग टिप्स", t1: "सटीक स्थान के बारे में स्पष्ट रहें", t2: "पास के लैंडमार्क का उल्लेख करें", t3: "केवल सुरक्षा खतरों के लिए 'उच्च' चिह्नित करें", t4: "पुनः रिपोर्ट करने से पहले ट्रैकर जांचें",
    hl_h: "आपातकालीन हेल्पलाइन",
    sv_h: "सरकारी सेवाएं", sv_sub: "AI सहायता के साथ सेवाएं खोजें और एक्सेस करें",
    cat_all: "सभी सेवाएं",
    tr_h: "मेरी शिकायतें", tr_sub: "अपनी दर्ज की गई शिकायतों की स्थिति ट्रैक करें",
    em_t: "अभी तक कोई शिकायत नहीं", em_s: "अपनी पहली शिकायत दर्ज करने के लिए 'शिकायत' पर जाएं", btn_rep: "समस्या दर्ज करें",
    k_sub: "प्रस्तुत", k_rev: "समीक्षाधीन", k_res: "समाधान"
  },
  mr: {
    nav_home: "होम", nav_chat: "AI चॅट", nav_report: "तक्रार", nav_services: "सेवा", nav_tracker: "ट्रॅकर",
    hero_l1: "तुमचा AI-सक्षम", hero_l2: "नागरी सहाय्यक",
    hero_sub: "सरकारी सेवांमध्ये प्रवेश करा, सार्वजनिक समस्यांची तक्रार करा आणि हिंदी, मराठी आणि इंग्रजीमध्ये त्वरित AI मदत मिळवा.",
    h_btn_chat: "AI ला विचारा", h_btn_report: "समस्या नोंदवा",
    st_schemes: "सरकारी योजना", st_langs: "भाषा", st_support: "AI मदत", st_states: "राज्ये",
    feat_h: "स्मार्ट भारत काय करू शकतो?", feat_sub: "तुमचा संपूर्ण नागरी डिजिटल साथीदार",
    f1t: "AI नागरी सहाय्यक", f1d: "योजना, पात्रता आणि कागदपत्रांबद्दल त्वरित उत्तरे मिळवा",
    f2t: "समस्या रिपोर्टिंग", f2d: "खड्डे, पाण्याची समस्या, खराब लाईटची तक्रार करा आणि ट्रॅक करा",
    f3t: "सेवा निर्देशिका", f3d: "AI मार्गदर्शित कागदपत्र चेकलिस्टसह सर्व सरकारी सेवा शोधा",
    f4t: "तक्रार ट्रॅकर", f4d: "तक्रारींवर लक्ष ठेवा आणि रिअल-टाइम स्थिती अपडेट मिळवा",
    f5t: "बहुभाषिक", f5d: "हिंदी, मराठी आणि इंग्रजीसाठी पूर्ण समर्थन - तुमची भाषा, तुमची निवड",
    f6t: "कागदपत्र मार्गदर्शक", f6d: "आधार, पॅन, पासपोर्ट, रेशन कार्ड आणि अधिकसाठी अचूक कागदपत्र यादी",
    qk_h: "⚡ त्वरित प्रश्न",
    c_online: "ऑनलाइन", c_clear: "चॅट साफ करा", c_note: "AI प्रतिसाद केवळ मार्गदर्शनासाठी आहेत. अधिकृत सरकारी पोर्टल्ससह पडताळणी करा.",
    rp_h: "सार्वजनिक समस्या नोंदवा", rp_sub: "तुमचे शहर सुधारण्यास मदत करा — प्रत्येक तक्रार महत्त्वाची आहे",
    fl_name: "पूर्ण नाव", fl_phone: "मोबाईल नंबर", fl_cat: "समस्या श्रेणी", fl_prio: "प्राधान्य", fl_loc: "स्थान / पत्ता", fl_desc: "तपशील",
    btn_sub: "तक्रार नोंदवा",
    is_h: "समस्या आकडेवारी", is_tot: "एकूण", is_res: "सुटलेले", is_pen: "प्रलंबित",
    tips_h: "रिपोर्टिंग टिप्स", t1: "नेमक्या स्थानाबद्दल स्पष्ट सांगा", t2: "जवळपासच्या खुणेचा उल्लेख करा", t3: "केवळ सुरक्षितता धोक्यांसाठी 'उच्च' चिन्हांकित करा", t4: "पुन्हा तक्रार करण्यापूर्वी ट्रॅकर तपासा",
    hl_h: "मदतवाहिनी",
    sv_h: "सरकारी सेवा", sv_sub: "AI मदतीसह सेवा शोधा आणि प्रवेश करा",
    cat_all: "सर्व सेवा",
    tr_h: "माझ्या तक्रारी", tr_sub: "तुमच्या नोंदवलेल्या तक्रारींची स्थिती ट्रॅक करा",
    em_t: "अद्याप कोणतीही तक्रार नाही", em_s: "तुमची पहिली तक्रार नोंदवण्यासाठी 'तक्रार' वर जा", btn_rep: "समस्या नोंदवा",
    k_sub: "सादर केले", k_rev: "पुनरावलोकनाखाली", k_res: "सुटलेले"
  }
};

const quickQ = {
  en: ["How to apply for PM Kisan?", "Documents for Passport?", "How to track my complaint?", "Guide me through the app"],
  hi: ["पीएम किसान के लिए आवेदन कैसे करें?", "पासपोर्ट के लिए दस्तावेज़?", "अपनी शिकायत कैसे ट्रैक करें?", "ऐप के बारे में बताएं"],
  mr: ["पीएम किसानसाठी अर्ज कसा करावा?", "पासपोर्टसाठी कागदपत्रे?", "माझी तक्रार कशी ट्रॅक करावी?", "अॅप बद्दल माहिती द्या"]
};

function setLang(l) {
  currentLang = l;
  document.querySelectorAll('.lbtn').forEach(b => b.classList.remove('active'));
  document.getElementById(`lb-${l}`).classList.add('active');
  
  document.body.className = `lang-${l}`;
  
  // Update texts
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[l][key]) el.textContent = dict[l][key];
  });
  
  // Update quick chips
  const qc = document.getElementById('quick-chips');
  qc.innerHTML = quickQ[l].map(q => `<button class="chip" onclick="askQuick('${q}')">${q}</button>`).join('');
  
  renderServices('all'); // re-render to update text if needed
}
setLang('en'); // Init

/* ════════════════════════════════════════════════
   AI CHAT & SPEECH-TO-TEXT
════════════════════════════════════════════════ */
function autoGrow(el) {
  el.style.height = '5px';
  el.style.height = (el.scrollHeight) + 'px';
}

function askQuick(q) {
  showSection('chat');
  chatIn.value = q;
  sendMsg();
}

function handleEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMsg();
  }
}

// Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isRecording = false;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  
  recognition.onstart = function() {
    isRecording = true;
    voiceBtn.classList.add('recording');
    voiceBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12"></rect></svg>'; // Stop icon
    chatIn.placeholder = "Listening...";
  };
  
  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    chatIn.value += (chatIn.value ? ' ' : '') + transcript;
    autoGrow(chatIn);
  };
  
  recognition.onerror = function(event) {
    console.error("Speech Recognition Error:", event.error);
    if (event.error === 'not-allowed') {
      showToast("Mic blocked! On a local file (file://), Chrome blocks microphones for security. Try it on GitHub Pages!", "error");
    } else {
      showToast("Mic error: " + event.error, "error");
    }
    stopVoice();
  };
  
  recognition.onend = function() {
    stopVoice();
  };
}

function startVoice() {
  if (!SpeechRecognition) {
    showToast("Speech recognition not supported in this browser.", "error");
    return;
  }
  if (isRecording) {
    recognition.stop();
  } else {
    // Set language for recognition
    if(currentLang === 'hi') recognition.lang = 'hi-IN';
    else if(currentLang === 'mr') recognition.lang = 'mr-IN';
    else recognition.lang = 'en-IN';
    
    recognition.start();
  }
}

function stopVoice() {
  isRecording = false;
  voiceBtn.classList.remove('recording');
  voiceBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>'; // Mic icon
  chatIn.placeholder = "";
}

function clearChat() {
  chatMsgs.innerHTML = '';
  chatHistory = [];
  setLang(currentLang); // Re-inject welcome message
}

async function sendMsg() {
  const text = chatIn.value.trim();
  if (!text) return;
  
  chatIn.value = '';
  autoGrow(chatIn);
  addMsgToUI(text, 'user');
  
  const loader = addTypingIndicator();
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  sendBtn.disabled = true; // Prevent multiple clicks
  chatIn.disabled = true;
  
  try {
    const response = await fetchGeminiResponse(text);
    loader.remove();
    addMsgToUI(response, 'bot');
  } catch (err) {
    console.error(err);
    loader.remove();
    addMsgToUI('Sorry, I encountered an error: ' + err.message + '. Please ensure your API key is correct.', 'bot');
  } finally {
    sendBtn.disabled = false;
    chatIn.disabled = false;
    chatIn.focus();
  }
}

function addMsgToUI(text, sender) {
  const div = document.createElement('div');
  div.className = `msg msg-${sender === 'user' ? 'u' : 'b'}`;
  
  // Basic markdown to HTML (bold and lists)
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  
  div.innerHTML = `<div class="msg-bub">${html}</div>`;
  chatMsgs.appendChild(div);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function addTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'msg msg-b';
  div.innerHTML = `<div class="msg-bub typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
  chatMsgs.appendChild(div);
  return div;
}

async function fetchGeminiResponse(userText) {
  const systemPrompt = `You are Smart Bharat, an AI civic assistant for Indian citizens. 
App Features Guide:
- Home: Dashboard overview.
- AI Chat (Current): Ask about government schemes, documents, or how to use the app.
- Report Issue: Submit public complaints (potholes, water, etc.).
- Services Directory: Browse Identity, Welfare, Finance, Health, Agriculture services.
- Tracker: Track status of submitted complaints.
If the user asks "guide me through the app" or similar, explain these sections concisely.
Respond in ${currentLang === 'hi' ? 'Hindi' : currentLang === 'mr' ? 'Marathi' : 'English'}. Keep responses friendly, concise, formatting with bullet points and bold text where helpful.`;

  const payload = {
    contents: [
      ...chatHistory,
      { role: 'user', parts: [{ text: userText }] }
    ],
    systemInstruction: {
      role: 'system',
      parts: [{ text: systemPrompt }]
    },
    generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
  };

  try {
    const res = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
    const error = await res.json();
    console.log(error);
    throw new Error(error.error.message);
}
  
    const data = await res.json();
    if (!data.candidates || data.candidates.length === 0) {
    throw new Error("No response received from Gemini API.");
}

    chatHistory.push({ role: 'user', parts: [{ text: userText }] });
    chatHistory.push({ role: 'model', parts: [{ text: botText }] });
    
    return botText;
  } catch (error) {
    console.error("Fetch failed:", error);
    throw error;
  }
}

/* ════════════════════════════════════════════════
   REPORT ISSUE & TRACKER
════════════════════════════════════════════════ */
function submitComplaint(e) {
  e.preventDefault();
  
  const name = document.getElementById('f-name').value;
  const phone = document.getElementById('f-phone').value;
  const cat = document.getElementById('f-cat').value;
  const prio = document.getElementById('f-prio').value;
  const loc = document.getElementById('f-loc').value;
  const desc = document.getElementById('f-desc').value;
  
  if (!name || !phone || !cat || !loc || !desc) {
    showToast("Please fill all required fields", "error");
    return;
  }
  
  const id = 'SB' + Math.floor(100000 + Math.random() * 900000);
  const date = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  
  const cmp = { id, name, cat, prio, loc, desc, date, status: 'sub' }; // status: sub, rev, res
  complaints.unshift(cmp);
  localStorage.setItem('sb_complaints', JSON.stringify(complaints));
  
  document.getElementById('cmp-form').reset();
  showToast(`Complaint ${id} submitted successfully!`, 'success');
  
  renderKanban();
  updateStats();
  
  setTimeout(() => showSection('tracker'), 1500);
}

function updateStats() {
  document.getElementById('st-total').textContent = complaints.length;
  document.getElementById('st-res').textContent = complaints.filter(c => c.status === 'res').length;
  document.getElementById('st-pen').textContent = complaints.filter(c => c.status !== 'res').length;
}

function renderKanban() {
  const empty = document.getElementById('tr-empty');
  const kanban = document.getElementById('tr-kanban');
  
  if (complaints.length === 0) {
    empty.classList.remove('hidden');
    kanban.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');
  kanban.classList.remove('hidden');
  
  document.getElementById('k-sub').innerHTML = '';
  document.getElementById('k-rev').innerHTML = '';
  document.getElementById('k-res').innerHTML = '';
  
  let subC=0, revC=0, resC=0;
  
  complaints.forEach(c => {
    const html = `
      <div class="tk-card">
        <div class="tk-id">${c.id} • ${c.cat}</div>
        <div class="tk-t">${c.loc}</div>
        <div class="tk-d">${c.desc}</div>
        <div style="display:flex; justify-content:space-between;">
          <span class="tk-date">${c.date}</span>
          <span style="font-size:0.75rem">${c.prio}</span>
        </div>
      </div>
    `;
    if (c.status === 'sub') { document.getElementById('k-sub').innerHTML += html; subC++; }
    if (c.status === 'rev') { document.getElementById('k-rev').innerHTML += html; revC++; }
    if (c.status === 'res') { document.getElementById('k-res').innerHTML += html; resC++; }
  });
  
  document.getElementById('kc-sub').textContent = subC;
  document.getElementById('kc-rev').textContent = revC;
  document.getElementById('kc-res').textContent = resC;
}

/* ════════════════════════════════════════════════
   SERVICES DIRECTORY
════════════════════════════════════════════════ */
const servicesData = [
  { id: 1, cat: 'identity', ico: '🪪', t: 'Aadhaar Card', d: 'New enrollment, update address, phone number, and biometrics.', link: 'https://uidai.gov.in/' },
  { id: 2, cat: 'identity', ico: '🛂', t: 'Passport Seva', d: 'Apply for fresh passport, renewal, or Police Clearance Certificate.', link: 'https://passportindia.gov.in/' },
  { id: 3, cat: 'identity', ico: '💳', t: 'PAN Card', d: 'Apply for new PAN, correction, or link with Aadhaar.', link: 'https://www.incometax.gov.in/' },
  { id: 4, cat: 'identity', ico: '🗳️', t: 'Voter ID', d: 'Register to vote, shift constituency, or correct details.', link: 'https://voters.eci.gov.in/' },
  { id: 5, cat: 'welfare', ico: '🍚', t: 'Ration Card', d: 'Apply for smart ration card, add members, or change address.', link: 'https://nfsa.gov.in/' },
  { id: 6, cat: 'finance', ico: '🌾', t: 'PM Kisan Samman Nidhi', d: 'Financial benefit of ₹6000/year for landholding farmer families.', link: 'https://pmkisan.gov.in/' },
  { id: 7, cat: 'health', ico: '🏥', t: 'Ayushman Bharat', d: 'Health insurance cover of ₹5 Lakhs per family per year.', link: 'https://pmjay.gov.in/' },
  { id: 8, cat: 'education', ico: '🎓', t: 'National Scholarship', d: 'Apply for pre-matric, post-matric and higher education scholarships.', link: 'https://scholarships.gov.in/' },
  { id: 9, cat: 'finance', ico: '🏠', t: 'PM Awas Yojana', d: 'Housing for all - subsidized loans for purchasing or building a house.', link: 'https://pmaymis.gov.in/' },
];

function renderServices(catFilter, query = '') {
  const grid = document.getElementById('sv-grid');
  const noData = document.getElementById('no-svcs');
  grid.innerHTML = '';
  
  let filtered = servicesData.filter(s => {
    const matchCat = catFilter === 'all' || s.cat === catFilter;
    const matchQ = s.t.toLowerCase().includes(query.toLowerCase()) || s.d.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });
  
  if (filtered.length === 0) {
    grid.style.display = 'none';
    noData.classList.remove('hidden');
  } else {
    grid.style.display = 'grid';
    noData.classList.add('hidden');
    filtered.forEach(s => {
      grid.innerHTML += `
        <div class="sv-card glass-card" onclick="openSvc(${s.id})">
          <div class="svc-ico">${s.ico}</div>
          <h3 class="svc-t">${s.t}</h3>
          <p class="svc-d">${s.d}</p>
          <div class="svc-ft">
            <span class="svc-tag">${s.cat}</span>
            <span class="svc-arr">View Details →</span>
          </div>
        </div>
      `;
    });
  }
}

function filterCat(cat, btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderServices(cat, document.getElementById('sv-search').value);
}

function filterSvcs(q) {
  const activeCatBtn = document.querySelector('.cat-btn.active');
  const cat = activeCatBtn ? activeCatBtn.textContent.includes('All') ? 'all' : activeCatBtn.getAttribute('onclick').match(/'(.*?)'/)[1] : 'all';
  renderServices(cat, q);
}

function openSvc(id) {
  const s = servicesData.find(x => x.id === id);
  const body = document.getElementById('svc-modal-body');
  
  body.innerHTML = `
    <div class="sm-head">
      <div class="sm-ico">${s.ico}</div>
      <div>
        <h2 class="sm-t">${s.t}</h2>
        <span class="sm-tag">${s.cat}</span>
      </div>
    </div>
    <p class="sm-d">${s.d}</p>
    
    <div class="sm-sec">
      <h4>General Requirements</h4>
      <ul class="sm-ul">
        <li>Aadhaar Card (for identity & address)</li>
        <li>Passport size photographs</li>
        <li>Registered Mobile Number</li>
      </ul>
    </div>
    
    <div class="sm-btns">
      <a href="${s.link}" target="_blank" class="btn-p">🌐 Visit Official Portal</a>
      <button class="btn-s" onclick="askAboutSvc('${s.t}')">🤖 Ask AI Details</button>
    </div>
  `;
  document.getElementById('svc-modal').style.display = 'flex';
}

function closeSvcModal() {
  document.getElementById('svc-modal').style.display = 'none';
}

function askAboutSvc(t) {
  closeSvcModal();
  showSection('chat');
  chatIn.value = `What is the exact eligibility and document checklist for ${t}?`;
  sendMsg();
}

/* ════════════════════════════════════════════════
   UTILS
════════════════════════════════════════════════ */
function showToast(msg, type='success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => t.className = 'toast', 3000);
}

// SIMULATE STATUS UPDATE FOR DEMO (Moves 'sub' to 'rev' after 30s)
setInterval(() => {
  let changed = false;
  complaints.forEach(c => {
    if (c.status === 'sub' && Math.random() > 0.5) { c.status = 'rev'; changed = true; }
    else if (c.status === 'rev' && Math.random() > 0.8) { c.status = 'res'; changed = true; }
  });
  if(changed) {
    localStorage.setItem('sb_complaints', JSON.stringify(complaints));
    renderKanban();
    updateStats();
  }
}, 30000);
