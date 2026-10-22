import { CAREER_CATEGORIES, CAREER_DATA, SCORING_CONFIG, PANELISTS, buildInterviewQuestions, buildToughQuestions, mixToughQuestions } from "./career-data.js";
import { calculateAnswerScore, compareAttempts, scorePitch } from "./scoring-engine.js";

// Everything below stays in this browser. Nothing is sent to a server.
const STORAGE_KEY = "eff-interview-coach-session-v1";
const PREFS_KEY = "eff-interview-coach-prefs";
const STORIES_KEY = "eff-interview-coach-stories";
const PITCH_KEY = "eff-interview-coach-pitch";
const THINK_SECONDS = 20;
const PITCH_SECONDS = 30;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const screens = Object.fromEntries($$("[data-screen]").map((node) => [node.dataset.screen, node]));

function loadJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const synth = typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function" ? window.speechSynthesis : null;
let prefs = { style: "friendly", tough: true, speak: true, think: false, ...loadJSON(PREFS_KEY, {}) };
if (!["friendly", "panel", "rapid"].includes(prefs.style)) prefs.style = "friendly";

let state = {
  screen: "landing",
  category: CAREER_CATEGORIES[0].name,
  professionName: "",
  questions: [],
  currentIndex: 0,
  attempts: {},
  skipped: [],
  startedAt: null,
  style: prefs.style,
};
let mediaStream = null;
let mediaRecorder = null;
let recognition = null;
let recordedChunks = [];
let currentRecordingUrl = "";
let recordingStart = 0;
let timerId = null;
let finalTranscript = "";
let recordingFinalized = true;
let thinkTimer = null;
let pitchTimer = null;
let pitchStart = 0;
let pitchSeconds = 0;
let lastOpener = null;

/* ---------- Studio visuals (purely decorative, nothing leaves the page) ---------- */

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
const CATEGORY_TONES = ["#FF6F61", "#FFD35A", "#7FD3C7", "#6FB3FF", "#B799E3", "#FF9A8F", "#9BE3B5", "#FFB86B", "#8FC7FF", "#D7B8FF", "#FF7FA8", "#7FD3C7", "#FFD35A", "#6FB3FF"];
let onAirTimer = null;
let onAirStart = 0;

function setOnAir(on) {
  document.body.classList.toggle("on-air", Boolean(on));
  window.clearInterval(onAirTimer);
  onAirTimer = null;
  const tc = $("#vfTimecode");
  if (!on) {
    if (tc) tc.textContent = "00:00:00:00";
    return;
  }
  onAirStart = Date.now();
  const tick = () => {
    if (!tc) return;
    const ms = Date.now() - onAirStart;
    const total = Math.floor(ms / 1000);
    const frames = Math.floor((ms % 1000) / (1000 / 24));
    const pad = (value) => String(value).padStart(2, "0");
    tc.textContent = `${pad(Math.floor(total / 3600))}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}:${pad(frames)}`;
  };
  tick();
  onAirTimer = window.setInterval(tick, reducedMotion() ? 1000 : 125);
}

function setSpeaking(on) {
  document.body.classList.toggle("is-speaking", Boolean(on));
}

function countUp(node, value, suffix = "") {
  if (!node) return;
  const target = Number(value) || 0;
  window.cancelAnimationFrame(node._countFrame);
  if (reducedMotion() || target <= 0) {
    node.textContent = `${target}${suffix}`;
    return;
  }
  const started = performance.now();
  const duration = 900;
  const step = (now) => {
    const t = Math.min(1, (now - started) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = `${Math.round(target * eased)}${suffix}`;
    if (t < 1) node._countFrame = window.requestAnimationFrame(step);
  };
  node._countFrame = window.requestAnimationFrame(step);
}

function updateInterviewer() {
  const card = $("#interviewerCard");
  if (!card) return;
  let name = "Your interviewer";
  let title = CAREER_DATA[state.professionName]?.academic ? "Selection committee · Friendly round" : "Hiring team · Friendly round";
  let slot = 0;
  if (state.style === "panel") {
    const person = panelistFor(state.currentIndex);
    name = person.name;
    title = `${person.title} · Panel`;
    slot = person.slot;
  } else if (state.style === "rapid") {
    name = "Rapid-fire round";
    title = "Aim for about 60 seconds an answer";
    slot = 2;
  }
  $("#interviewerName").textContent = name;
  $("#interviewerTitle").textContent = title;
  card.dataset.slot = String(slot);
  card.dataset.style = state.style;
}

function replayPrompt() {
  const node = $("#questionText");
  if (!node) return;
  node.classList.remove("prompt-in");
  void node.offsetWidth;
  node.classList.add("prompt-in");
}

function bindTilt(container, selector, max) {
  if (!container) return;
  const reset = (target) => { if (target) { target.style.setProperty("--rx", "0deg"); target.style.setProperty("--ry", "0deg"); } };
  container.addEventListener("pointermove", (event) => {
    if (reducedMotion() || !finePointer()) return;
    const target = selector ? event.target.closest(selector) : container.querySelector(".monitor");
    if (!target) return;
    const box = (selector ? target : container).getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    target.style.setProperty("--ry", `${(x * max * 2).toFixed(2)}deg`);
    target.style.setProperty("--rx", `${(-y * max * 2).toFixed(2)}deg`);
  });
  container.addEventListener("pointerout", (event) => {
    const target = selector ? event.target.closest(selector) : container.querySelector(".monitor");
    if (target && !target.contains(event.relatedTarget)) reset(target);
  });
  container.addEventListener("pointerleave", () => { if (!selector) reset(container.querySelector(".monitor")); });
}

function showScreen(name) {
  stopSpeaking();
  setOnAir(false);
  Object.entries(screens).forEach(([key, node]) => {
    const active = key === name;
    node.setAttribute("aria-hidden", String(!active));
  });
  state.screen = name;
  window.scrollTo({ top: 0, behavior: "smooth" });
  const heading = screens[name]?.querySelector("h1, h2");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    setTimeout(() => heading.focus({ preventScroll: true }), 50);
  }
}

function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  window.clearTimeout(node._timer);
  node._timer = window.setTimeout(() => node.classList.remove("show"), 3200);
}

function serializableState() {
  const attempts = {};
  Object.entries(state.attempts).forEach(([key, list]) => {
    attempts[key] = list.map(({ videoUrl, ...attempt }) => ({ ...attempt, videoUrl: "" }));
  });
  return { ...state, attempts, screen: state.screen === "interview" ? "interview" : state.screen, savedAt: new Date().toISOString() };
}

function saveSession() {
  if (state.screen === "pitch" || !state.professionName) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableState()));
  } catch {
    toast("This browser could not save local progress, but your current session can continue.");
  }
}

function getSavedSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return saved?.professionName && Array.isArray(saved.questions) && CAREER_DATA[saved.professionName] ? saved : null;
  } catch {
    return null;
  }
}

function updateSessionBanner() {
  $("#sessionBanner").classList.toggle("visible", Boolean(getSavedSession()));
}

function clearSession({ announce = true } = {}) {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  updateSessionBanner();
  if (announce) toast("Saved practice cleared from this device.");
}

function savePrefs() { saveJSON(PREFS_KEY, prefs); }

/* ---------- Career selection ---------- */

function renderCategories() {
  const container = $("#categoryTabs");
  container.innerHTML = CAREER_CATEGORIES.map((category) => `
    <button class="category-tab ${category.name === state.category ? "active" : ""}" type="button" role="tab" aria-selected="${category.name === state.category}" data-category="${escapeHtml(category.name)}" tabindex="${category.name === state.category ? 0 : -1}">${escapeHtml(category.name)}</button>
  `).join("");
  const buttons = [...container.querySelectorAll("button")];
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.category;
      renderCategories();
      renderCareers();
      container.querySelector(`[data-category="${CSS.escape(state.category)}"]`)?.focus();
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const next = buttons[(index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length];
      next.click();
    });
  });
}

function renderCareers() {
  const category = CAREER_CATEGORIES.find((item) => item.name === state.category) || CAREER_CATEGORIES[0];
  const tone = CATEGORY_TONES[CAREER_CATEGORIES.indexOf(category) % CATEGORY_TONES.length];
  $("#careerGrid").style.setProperty("--tone", tone);
  $("#careerGrid").innerHTML = category.professions.map((name, index) => {
    const profession = CAREER_DATA[name];
    return `<button class="career-card" type="button" style="--i:${index}" data-profession="${escapeHtml(name)}"><span class="card-take" aria-hidden="true">Audition ${String(index + 1).padStart(2, "0")}</span><small>${escapeHtml(category.name)}</small><h3>${escapeHtml(name)}</h3><p>${escapeHtml(profession.description)}</p></button>`;
  }).join("");
  $("#careerGrid").querySelectorAll("button").forEach((button) => button.addEventListener("click", () => selectProfession(button.dataset.profession)));
}

function buildSessionQuestions(name) {
  const base = buildInterviewQuestions(name, 8);
  if (!prefs.tough) return base;
  return mixToughQuestions(base, buildToughQuestions(2, { academic: Boolean(CAREER_DATA[name]?.academic) }));
}

function updateFormatStat() {
  $("#formatCount").textContent = prefs.tough ? "10" : "8";
  $("#formatLabel").textContent = prefs.tough ? "questions, including 2 tough ones" : "balanced questions";
}

function selectProfession(name) {
  state.professionName = name;
  state.questions = buildSessionQuestions(name);
  state.currentIndex = 0;
  state.attempts = {};
  state.skipped = [];
  state.startedAt = null;
  const profession = CAREER_DATA[name];
  $("#overviewCategory").textContent = profession.category;
  $("#overviewTitle").textContent = name;
  $("#overviewDescription").textContent = profession.description;
  $("#overviewCompetencies").innerHTML = profession.competencies.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  $("#overviewSignals").innerHTML = profession.competencies.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  updateFormatStat();
  showScreen("overview");
}

/* ---------- Setup ---------- */

function detectSpeechSupport() {
  const supported = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  $("#speechSupport").textContent = supported ? "Supported" : "Manual fallback";
  $("#speechSupport").classList.toggle("ready", supported);
  return supported;
}

function renderOptions() {
  $$('input[name="interviewStyle"]').forEach((input) => { input.checked = input.value === prefs.style; });
  $("#optTough").checked = prefs.tough;
  $("#optSpeak").checked = Boolean(synth) && prefs.speak;
  $("#optThink").checked = prefs.think;
  $("#optSpeakRow").classList.toggle("hidden", !synth);
  $("#speakAgain").classList.toggle("hidden", !synth || !prefs.speak);
}

function bindOptions() {
  $$('input[name="interviewStyle"]').forEach((input) => input.addEventListener("change", () => {
    if (input.checked) { prefs.style = input.value; savePrefs(); }
  }));
  $("#optTough").addEventListener("change", (event) => { prefs.tough = event.target.checked; savePrefs(); updateFormatStat(); });
  $("#optSpeak").addEventListener("change", (event) => {
    prefs.speak = event.target.checked;
    savePrefs();
    if (!prefs.speak) stopSpeaking();
    $("#speakAgain").classList.toggle("hidden", !synth || !prefs.speak);
  });
  $("#optThink").addEventListener("change", (event) => { prefs.think = event.target.checked; savePrefs(); });
}

async function enableMedia() {
  if (!navigator.mediaDevices?.getUserMedia) {
    toast("This browser does not support camera recording. Continue without camera and type your transcript.");
    allowInterviewWithoutMedia();
    return;
  }
  try {
    stopMedia();
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true });
    $("#setupVideo").srcObject = mediaStream;
    $("#interviewVideo").srcObject = mediaStream;
    $("#setupPlaceholder").classList.add("hidden");
    $("#cameraFallback").classList.add("hidden");
    const hasVideo = mediaStream.getVideoTracks().some((track) => track.readyState === "live");
    const hasAudio = mediaStream.getAudioTracks().some((track) => track.readyState === "live");
    setDeviceStatus("#cameraStatus", hasVideo);
    setDeviceStatus("#micStatus", hasAudio);
    $("#startInterview").disabled = false;
    toast("Camera and microphone are ready.");
  } catch (error) {
    console.warn("Media permission unavailable", error);
    toast("Camera or microphone access was not granted. You can continue without camera and use the editable transcript.");
    allowInterviewWithoutMedia();
  }
}

function setDeviceStatus(selector, ready) {
  const node = $(selector);
  node.textContent = ready ? "Ready" : "Unavailable";
  node.classList.toggle("ready", ready);
}

function allowInterviewWithoutMedia() {
  setDeviceStatus("#cameraStatus", false);
  setDeviceStatus("#micStatus", false);
  $("#startInterview").disabled = false;
  $("#setupPlaceholder").classList.remove("hidden");
  $("#cameraFallback").classList.remove("hidden");
}

function stopMedia() {
  if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
  mediaStream = null;
  $("#setupVideo").srcObject = null;
  $("#interviewVideo").srcObject = null;
}

/* ---------- The interviewer's voice ---------- */

function rankedVoices() {
  if (!synth) return [];
  const english = synth.getVoices().filter((voice) => /^en([-_]|$)/i.test(voice.lang));
  const scoreVoice = (voice) => {
    const name = voice.name.toLowerCase();
    let score = 0;
    if (/natural|neural|enhanced|premium/.test(name)) score += 6;
    if (/google us english|samantha|aria|jenny|ava|allison|guy|davis|michelle|zira|karen|daniel/.test(name)) score += 3;
    if (/en[-_]us/i.test(voice.lang)) score += 2;
    if (/novelty|whisper|bells|bad news|good news|bubbles|cellos|organ|zarvox|trinoids|jester|albert|boing|wobble/.test(name)) score -= 20;
    return score;
  };
  return english.sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

function speak(text, { voiceIndex = 0, pitch = 1 } = {}) {
  if (!synth || !prefs.speak || !text) return;
  try {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = rankedVoices();
    if (voices.length) utterance.voice = voices[voiceIndex % Math.min(voices.length, 4)];
    utterance.lang = utterance.voice?.lang || "en-US";
    utterance.rate = 0.97;
    utterance.pitch = pitch;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.speak(utterance);
  } catch (error) {
    console.warn("Speech synthesis unavailable", error);
  }
}

function stopSpeaking() {
  try { synth?.cancel(); } catch {}
  setSpeaking(false);
}

function panelistFor(index) {
  const list = CAREER_DATA[state.professionName]?.academic ? PANELISTS.academic : PANELISTS.job;
  return { ...list[index % list.length], slot: index % list.length };
}

function speakQuestion() {
  const question = state.questions[state.currentIndex];
  if (!question) return;
  if (state.style === "panel") {
    const person = panelistFor(state.currentIndex);
    const firstTime = state.currentIndex < 4;
    const intro = firstTime ? `Hello, I'm ${person.name}, ${person.title}. ` : "";
    speak(`${intro}${question.prompt}`, { voiceIndex: person.slot, pitch: [1, 0.9, 1.08, 0.96][person.slot] });
  } else if (state.style === "rapid") {
    speak(question.prompt);
  } else {
    speak(`Question ${state.currentIndex + 1}. ${question.prompt}`);
  }
}

/* ---------- The interview ---------- */

function startInterview() {
  if (!state.professionName) return;
  const fresh = !Object.keys(state.attempts).length && state.currentIndex === 0;
  if (fresh || !state.questions.length) {
    state.style = prefs.style;
    state.questions = buildSessionQuestions(state.professionName);
  }
  state.startedAt ||= new Date().toISOString();
  const profession = CAREER_DATA[state.professionName];
  $("#professionLabel").textContent = state.professionName;
  $("#welcomeTitle").textContent = `Welcome to your ${profession.interviewTitle || `${state.professionName} interview`}.`;
  let message = profession.welcome;
  if (state.style === "panel") {
    const list = profession.academic ? PANELISTS.academic : PANELISTS.job;
    message += ` Today you will meet a panel: ${list.map((person) => `${person.name}, ${person.title}`).join("; ")}. Look at the person asking, and keep your answers addressed to the whole room.`;
  } else if (state.style === "rapid") {
    message += " This is a rapid-fire round. Aim to answer each question in about 60 seconds. Short, clear, and specific wins.";
  }
  if (state.questions.some((item) => item.tough)) message += " Two tough questions are mixed in. Tap \"How to approach this\" when you see one.";
  $("#welcomeMessage").textContent = message;
  showScreen("interview");
  $("#welcomeOverlay").classList.remove("hidden");
  $("#beginFirstQuestion").focus();
  saveSession();
}

function renderQuestion({ preserveTranscript = false, speakIt = true } = {}) {
  const question = state.questions[state.currentIndex];
  if (!question) return finishInterview();
  cancelThink();
  $("#progressLabel").textContent = `Question ${state.currentIndex + 1} of ${state.questions.length}`;
  $("#progressBar").style.width = `${((state.currentIndex + 1) / state.questions.length) * 100}%`;
  $("#questionText").textContent = question.prompt;
  replayPrompt();
  updateInterviewer();
  setOnAir(false);
  const panelLine = $("#panelistLine");
  if (state.style === "panel") {
    const person = panelistFor(state.currentIndex);
    panelLine.innerHTML = `${escapeHtml(person.name)} <span>· ${escapeHtml(person.title)}, asks</span>`;
    panelLine.classList.remove("hidden");
  } else if (state.style === "rapid") {
    panelLine.innerHTML = `Rapid-fire <span>· aim for about 60 seconds</span>`;
    panelLine.classList.remove("hidden");
  } else {
    panelLine.classList.add("hidden");
  }
  const categoryText = question.star ? `${question.category} · STAR response recommended` : question.category;
  $("#questionCategory").textContent = categoryText;
  const tipToggle = $("#approachToggle");
  tipToggle.classList.toggle("hidden", !question.tip);
  tipToggle.setAttribute("aria-expanded", "false");
  tipToggle.textContent = "How to approach this";
  $("#approachTip").classList.add("hidden");
  $("#approachTip").textContent = question.tip || "";
  $("#speakAgain").classList.toggle("hidden", !synth || !prefs.speak);
  if (!preserveTranscript) $("#transcript").value = "";
  $("#scoreAnswer").disabled = !$("#transcript").value.trim();
  $("#speechStatus").textContent = detectSpeechSupport() ? "Ready for live transcription when you start." : "Live speech transcription is unavailable here. Record if supported, then type your answer.";
  $("#recordAnswer").classList.remove("hidden");
  $("#recordAnswer").textContent = "Start answer";
  $("#finishAnswer").classList.add("hidden");
  $("#targetClock").classList.add("hidden");
  currentRecordingUrl = "";
  recordingStart = 0;
  recordingFinalized = true;
  finalTranscript = "";
  saveSession();
  if (speakIt) speakQuestion();
}

function toggleApproach() {
  const open = $("#approachTip").classList.toggle("hidden") === false;
  $("#approachToggle").setAttribute("aria-expanded", String(open));
  $("#approachToggle").textContent = open ? "Hide the tip" : "How to approach this";
}

/* Think time: an optional countdown before recording starts. */
function beginAnswerFlow() {
  stopSpeaking();
  if (!prefs.think) return startAnswer();
  const layer = $("#thinkLayer");
  const arc = $("#thinkArc");
  const circumference = 2 * Math.PI * 52;
  const started = Date.now();
  layer.classList.remove("hidden");
  $("#recordAnswer").classList.add("hidden");
  $("#skipThink").focus();
  const tick = () => {
    const elapsed = (Date.now() - started) / 1000;
    const left = Math.max(0, THINK_SECONDS - elapsed);
    $("#thinkCount").textContent = String(Math.ceil(left));
    arc.style.strokeDashoffset = String(circumference * (1 - left / THINK_SECONDS));
    if (left <= 0) endThink();
  };
  tick();
  thinkTimer = window.setInterval(tick, 250);
}

function cancelThink() {
  window.clearInterval(thinkTimer);
  thinkTimer = null;
  $("#thinkLayer").classList.add("hidden");
}

function endThink() {
  if (!thinkTimer && $("#thinkLayer").classList.contains("hidden")) return;
  cancelThink();
  startAnswer();
  $("#finishAnswer").focus();
}

function startAnswer() {
  stopSpeaking();
  recordedChunks = [];
  finalTranscript = $("#transcript").value.trim();
  currentRecordingUrl = "";
  if (mediaStream && window.MediaRecorder) {
    try {
      const preferred = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
      const mimeType = preferred.find((type) => MediaRecorder.isTypeSupported?.(type));
      mediaRecorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);
      recordingFinalized = false;
      mediaRecorder.ondataavailable = (event) => { if (event.data.size) recordedChunks.push(event.data); };
      mediaRecorder.onstop = () => {
        if (recordedChunks.length) currentRecordingUrl = URL.createObjectURL(new Blob(recordedChunks, { type: mediaRecorder.mimeType || "video/webm" }));
        recordingFinalized = true;
        $("#scoreAnswer").disabled = !$("#transcript").value.trim();
        $("#speechStatus").textContent = "Recording ready. Review the transcript, make corrections, then score the answer.";
      };
      mediaRecorder.start(400);
    } catch (error) {
      console.warn("MediaRecorder unavailable", error);
      mediaRecorder = null;
      toast("Video recording is unavailable in this browser. Your transcript can still be coached.");
    }
  }
  startRecognition($("#transcript"), () => { $("#scoreAnswer").disabled = !$("#transcript").value.trim(); });
  recordingStart = Date.now();
  timerId = window.setInterval(updateRecordingClock, 500);
  $("#targetClock").classList.remove("hidden");
  updateRecordingClock();
  $("#recordingBadge").classList.add("active");
  setOnAir(true);
  $("#recordAnswer").classList.add("hidden");
  $("#finishAnswer").classList.remove("hidden");
  $("#speechStatus").textContent = recognition ? "Listening. Speak naturally and pause when you need to think." : "Recording started. Type or paste your answer into the transcript box when finished.";
}

function startRecognition(target, onChange = () => {}) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return;
  try {
    recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const phrase = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript = `${finalTranscript} ${phrase}`.trim();
        else interim += phrase;
      }
      target.value = `${finalTranscript} ${interim}`.trim();
      onChange();
    };
    recognition.onerror = () => {
      const status = target.id === "pitchTranscript" ? $("#pitchStatus") : $("#speechStatus");
      status.textContent = "Live transcription paused. Finish the recording and edit the transcript yourself.";
    };
    recognition.start();
  } catch (error) {
    console.warn("Speech recognition unavailable", error);
    recognition = null;
  }
}

function stopRecognition() {
  if (recognition) {
    try { recognition.stop(); } catch {}
  }
  recognition = null;
}

const mmss = (total) => {
  const value = Math.max(0, Math.round(total));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
};

function updateRecordingClock() {
  const seconds = Math.floor((Date.now() - recordingStart) / 1000);
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");
  $("#recordingTime").textContent = `Recording ${minutes}:${remainder}`;
  const clock = $("#targetClock");
  const rapid = state.style === "rapid";
  const target = rapid ? 60 : 120;
  const low = rapid ? 30 : 60;
  let labelText;
  if (rapid) {
    const left = target - seconds;
    labelText = left >= 0 ? `${mmss(left)} left · aim for 60 seconds` : `Over by ${mmss(-left)} · wrap it up`;
  } else if (seconds < low) {
    labelText = "Building your answer · aim for 1 to 2 minutes";
  } else if (seconds <= target) {
    labelText = "Right in the zone · 1 to 2 minutes";
  } else {
    labelText = "Getting long · bring it to your result";
  }
  $("#targetLabel").textContent = labelText;
  $("#targetFill").style.width = `${Math.min(100, (seconds / target) * 100)}%`;
  clock.classList.toggle("zone", seconds >= low && seconds <= target);
  clock.classList.toggle("long", seconds > target);
}

function finishAnswer() {
  if (mediaRecorder?.state === "recording") mediaRecorder.stop();
  stopRecognition();
  window.clearInterval(timerId);
  $("#recordingBadge").classList.remove("active");
  setOnAir(false);
  $("#recordAnswer").classList.remove("hidden");
  $("#recordAnswer").textContent = "Record again";
  $("#finishAnswer").classList.add("hidden");
  $("#speechStatus").textContent = recordingFinalized ? "Recording ready. Review the transcript, make corrections, then score the answer." : "Finalizing your local recording…";
  $("#scoreAnswer").disabled = !recordingFinalized || !$("#transcript").value.trim();
  $("#transcript").focus();
}

function scoreCurrentAnswer() {
  if (!recordingFinalized) return toast("Your browser is still finalizing the recording. Try again in a moment.");
  const transcript = $("#transcript").value.trim();
  if (!transcript) return toast("Add your answer transcript before scoring.");
  stopSpeaking();
  cancelThink();
  if (recognition) finishAnswer();
  const question = state.questions[state.currentIndex];
  const profession = CAREER_DATA[state.professionName];
  const result = calculateAnswerScore({ transcript, question, profession, options: { maxWords: state.style === "rapid" ? 170 : 260 } });
  const attempts = state.attempts[state.currentIndex] || [];
  const previous = attempts.at(-1)?.result;
  const comparison = compareAttempts(previous, result);
  const durationSeconds = recordingStart ? Math.max(0, Math.round((Date.now() - recordingStart) / 1000)) : 0;
  attempts.push({ transcript, result, comparison, videoUrl: currentRecordingUrl, durationSeconds, createdAt: new Date().toISOString() });
  state.attempts[state.currentIndex] = attempts;
  renderCoaching(attempts.at(-1), attempts);
  saveSession();
}

function renderCoaching(attempt, attempts) {
  const { result, comparison } = attempt;
  const question = state.questions[state.currentIndex];
  lastOpener = document.activeElement;
  countUp($("#answerScore"), result.score);
  const sheet = $("#coachingOverlay").querySelector(".coaching-sheet");
  sheet.dataset.band = result.score >= 95 ? "mastered" : result.score >= 85 ? "ready" : result.score >= 70 ? "developing" : "building";
  $("#masteryLabel").textContent = result.score >= 95 ? "QUESTION MASTERED ✓" : `${result.label} · You may retry or continue.`;
  $("#rubricGrid").innerHTML = Object.entries(SCORING_CONFIG.weights).map(([key, max]) => `<div class="rubric-item"><span>${escapeHtml(key)}</span><strong>${result.categoryScores[key]} / ${max}</strong><i class="rubric-bar" aria-hidden="true"><b style="--w:${Math.round((result.categoryScores[key] / max) * 100)}%"></b></i></div>`).join("");
  $("#strengthList").innerHTML = result.feedback.strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  $("#improvementList").innerHTML = result.feedback.improvements.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  $("#nextGoal").textContent = result.feedback.nextGoal;
  $("#toughCard").classList.toggle("hidden", !question?.tip);
  $("#toughTip").textContent = question?.tip || "";
  $("#storySave").classList.toggle("hidden", !question?.star);
  $("#storyForm").classList.add("hidden");
  $("#saveStoryBtn").classList.remove("hidden");
  $("#comparisonNote").textContent = attempts.length > 1 ? `${comparison.change >= 0 ? "+" : ""}${comparison.change} points from your previous attempt. ${comparison.improvements.join(" ")}` : "Attempt 1 establishes your baseline.";
  $("#attemptList").innerHTML = attempts.map((item, index) => {
    const change = index ? item.result.score - attempts[index - 1].result.score : 0;
    return `<article class="attempt"><strong>Attempt ${index + 1} · ${item.result.score}</strong><span>${index ? `${change >= 0 ? "+" : ""}${change} from prior attempt` : "Baseline"}</span>${item.videoUrl ? `<video controls src="${item.videoUrl}" aria-label="Replay attempt ${index + 1}"></video>` : `<span style="margin-top:8px">Video unavailable after a resumed session or when camera recording is off.</span>`}</article>`;
  }).join("");
  $("#retryQuestion").textContent = result.score >= 95 ? "Practice once more" : "Try this question again";
  $("#nextQuestion").textContent = state.currentIndex === state.questions.length - 1 ? "View final report" : "Continue to next question";
  $("#coachingOverlay").classList.remove("hidden");
  $("#coachingOverlay").querySelector(".coaching-sheet").scrollTop = 0;
  $("#retryQuestion").focus({ preventScroll: true });
}

function retryQuestion() {
  $("#coachingOverlay").classList.add("hidden");
  renderQuestion({ speakIt: false });
  $("#recordAnswer").focus();
}

function goNext() {
  stopSpeaking();
  $("#coachingOverlay").classList.add("hidden");
  state.currentIndex += 1;
  if (state.currentIndex >= state.questions.length) finishInterview();
  else renderQuestion();
}

function skipQuestion() {
  stopSpeaking();
  if (recognition || mediaRecorder?.state === "recording") stopActiveRecording();
  if (!state.skipped.includes(state.currentIndex)) state.skipped.push(state.currentIndex);
  state.currentIndex += 1;
  if (state.currentIndex >= state.questions.length) finishInterview();
  else renderQuestion();
}

function finishInterview() {
  stopActiveRecording();
  stopMedia();
  renderReport();
  showScreen("report");
  saveSession();
}

function stopActiveRecording() {
  cancelThink();
  stopSpeaking();
  if (mediaRecorder?.state === "recording") mediaRecorder.stop();
  stopRecognition();
  window.clearInterval(timerId);
  $("#recordingBadge").classList.remove("active");
  setOnAir(false);
  $("#targetClock").classList.add("hidden");
}

/* ---------- Story bank ---------- */

function loadStories() {
  const list = loadJSON(STORIES_KEY, []);
  return Array.isArray(list) ? list : [];
}
function saveStories(list) {
  if (!saveJSON(STORIES_KEY, list)) toast("This browser could not save your story bank.");
}

function openStoryForm() {
  const question = state.questions[state.currentIndex];
  const transcript = state.attempts[state.currentIndex]?.at(-1)?.transcript || "";
  const opening = transcript.split(/\s+/).slice(0, 7).join(" ");
  $("#storyTitle").value = `${question?.category || "Story"}: ${opening}${transcript.split(/\s+/).length > 7 ? "…" : ""}`.slice(0, 90);
  $("#storyTags").value = [question?.category, CAREER_DATA[state.professionName]?.competencies?.[0]].filter(Boolean).join(", ").toLowerCase();
  $("#storyForm").classList.remove("hidden");
  $("#saveStoryBtn").classList.add("hidden");
  $("#storyTitle").focus();
}

function saveStoryFromForm(event) {
  event.preventDefault();
  const attempt = state.attempts[state.currentIndex]?.at(-1);
  const question = state.questions[state.currentIndex];
  if (!attempt) return;
  const now = new Date().toISOString();
  const stories = loadStories();
  stories.unshift({
    id: `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    title: $("#storyTitle").value.trim() || "My story",
    tags: splitTags($("#storyTags").value),
    text: attempt.transcript,
    question: question?.prompt || "",
    profession: state.professionName,
    score: attempt.result.score,
    createdAt: now,
    updatedAt: now,
  });
  saveStories(stories);
  $("#storyForm").classList.add("hidden");
  $("#saveStoryBtn").classList.remove("hidden");
  $("#saveStoryBtn").textContent = "Saved. Save another version";
  toast("Saved to your story bank on this device.");
}

const splitTags = (value = "") => [...new Set(value.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 8);

function storiesAsText(stories) {
  const lines = ["EFF Interview Coach: My story bank", `Downloaded ${new Date().toLocaleString()}`, "", "Reuse these stories across questions. One strong story can answer a challenge, teamwork, leadership, or a time you failed.", ""];
  stories.forEach((story, index) => {
    lines.push(`${index + 1}. ${story.title}`);
    if (story.tags?.length) lines.push(`Tags: ${story.tags.join(", ")}`);
    if (story.question) lines.push(`First told for: ${story.question}${story.profession ? ` (${story.profession})` : ""}`);
    lines.push("", story.text, "", "----------------------------------------", "");
  });
  return lines.join("\n");
}

function openStoryBank() {
  stopSpeaking();
  lastOpener = document.activeElement;
  closeOverlay("#storyBank");
  const overlay = document.createElement("div");
  overlay.className = "coaching-overlay";
  overlay.id = "storyBank";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "storyBankTitle");
  document.body.appendChild(overlay);
  renderStoryBank(overlay);
}

function renderStoryBank(overlay) {
  const stories = loadStories();
  overlay.innerHTML = `<article class="coaching-sheet">
    <p class="eyebrow">Your stories stay on this device</p>
    <h2 id="storyBankTitle">My story bank</h2>
    <p>These are the true stories you have told well. Most interviews come back to the same handful of moments: a challenge, a team, a time you led, a time you failed. Practice each story until you can tell it in about two minutes, then reuse it for any question it fits.</p>
    <div class="button-row">
      <button class="button" type="button" data-action="download" ${stories.length ? "" : "disabled"}>Download all as text</button>
      <button class="button ghost" type="button" data-action="close">Close</button>
    </div>
    <div class="story-list">${stories.length ? stories.map((story) => `
      <section class="story-item" data-id="${escapeHtml(story.id)}">
        <label>Title<input type="text" maxlength="90" data-field="title" value="${escapeHtml(story.title)}" /></label>
        <label>Tags<input type="text" maxlength="160" data-field="tags" value="${escapeHtml((story.tags || []).join(", "))}" /></label>
        <label>Your story<textarea data-field="text">${escapeHtml(story.text)}</textarea></label>
        <p class="meta">${story.question ? `First told for “${escapeHtml(story.question)}”` : ""}${story.profession ? ` · ${escapeHtml(story.profession)}` : ""}${story.score ? ` · scored ${story.score}/100` : ""}</p>
        <div class="button-row">
          <button class="button secondary" type="button" data-action="save">Save changes</button>
          <button class="button ghost" type="button" data-action="copy">Copy</button>
          <button class="button danger" type="button" data-action="delete">Delete</button>
        </div>
      </section>`).join("") : `<div class="story-empty"><strong>No stories yet.</strong> After you score an answer to a question marked "STAR response recommended", choose "Save this story" and it will live here.</div>`}</div>
  </article>`;
  overlay.querySelector('[data-action="close"]').focus();
  overlay.onclick = async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      if (event.target === overlay) closeOverlay("#storyBank");
      return;
    }
    const action = button.dataset.action;
    if (action === "close") return closeOverlay("#storyBank");
    if (action === "download") return downloadText(`eff-story-bank-${dateStamp()}.txt`, storiesAsText(loadStories()));
    const item = button.closest(".story-item");
    const id = item?.dataset.id;
    const list = loadStories();
    const index = list.findIndex((story) => story.id === id);
    if (index < 0) return;
    if (action === "save") {
      list[index] = { ...list[index], title: item.querySelector('[data-field="title"]').value.trim() || "My story", tags: splitTags(item.querySelector('[data-field="tags"]').value), text: item.querySelector('[data-field="text"]').value.trim(), updatedAt: new Date().toISOString() };
      saveStories(list);
      toast("Story updated.");
    } else if (action === "copy") {
      await copyText(item.querySelector('[data-field="text"]').value);
    } else if (action === "delete") {
      if (!confirm("Delete this story from your story bank? This cannot be undone.")) return;
      list.splice(index, 1);
      saveStories(list);
      renderStoryBank(overlay);
      toast("Story deleted.");
    }
  };
}

function closeOverlay(selector) {
  const node = document.querySelector(selector);
  if (!node) return;
  node.remove();
  if (lastOpener && document.contains(lastOpener)) lastOpener.focus();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Copied.");
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); toast("Copied."); } catch { toast("Copy is not available here. Select the text and copy it yourself."); }
    area.remove();
  }
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const dateStamp = () => new Date().toISOString().slice(0, 10);

/* ---------- Report ---------- */

function allAttempts() {
  return Object.entries(state.attempts).flatMap(([questionIndex, attempts]) => attempts.map((attempt) => ({ ...attempt, questionIndex: Number(questionIndex), question: state.questions[Number(questionIndex)] })));
}

function finalAttempts() {
  return Object.entries(state.attempts).map(([questionIndex, attempts]) => ({ ...attempts.at(-1), questionIndex: Number(questionIndex), question: state.questions[Number(questionIndex)] })).filter((item) => item.result && item.question);
}

function reportNumbers() {
  const finals = finalAttempts();
  const every = allAttempts();
  const average = finals.length ? Math.round(finals.reduce((sum, item) => sum + item.result.score, 0) / finals.length) : 0;
  const mastered = finals.filter((item) => item.result.score >= 95).length;
  const growthValues = Object.values(state.attempts).filter((items) => items.length > 1).map((items) => items.at(-1).result.score - items[0].result.score);
  const averageGrowth = growthValues.length ? Math.round(growthValues.reduce((sum, value) => sum + value, 0) / growthValues.length) : 0;
  const firstFillers = Object.values(state.attempts).reduce((sum, items) => sum + (items[0]?.result.analysis.fillerCount || 0), 0);
  const lastFillers = Object.values(state.attempts).reduce((sum, items) => sum + (items.at(-1)?.result.analysis.fillerCount || 0), 0);
  return { finals, every, average, mastered, averageGrowth, firstFillers, lastFillers };
}

function renderReport() {
  const { finals, every, average, mastered, averageGrowth, firstFillers, lastFillers } = reportNumbers();
  const fillerChange = firstFillers ? Math.round(((lastFillers - firstFillers) / firstFillers) * 100) : 0;
  const strongest = [...finals].sort((a, b) => b.result.score - a.result.score)[0];
  const weakest = [...finals].sort((a, b) => a.result.score - b.result.score)[0];
  const categoryAverages = Object.keys(SCORING_CONFIG.weights).map((key) => ({
    key,
    value: finals.length ? finals.reduce((sum, item) => sum + item.result.categoryScores[key] / SCORING_CONFIG.weights[key], 0) / finals.length : 0,
  })).sort((a, b) => b.value - a.value);
  const starItems = finals.filter((item) => item.question.star);
  const starAverage = starItems.length ? starItems.reduce((sum, item) => sum + item.result.analysis.star.count, 0) / starItems.length : 0;
  const alignmentAverage = finals.length ? finals.reduce((sum, item) => sum + item.result.analysis.career.count, 0) / finals.length : 0;

  $("#reportProfession").textContent = `${state.professionName} practice report`;
  countUp($("#overallScore"), average);
  $("#reportSummary").textContent = `You demonstrated ${average >= 85 ? "strong" : average >= 70 ? "developing" : "foundational"} performance against the EFF Interview Coach rubric. This is a practice score, not a prediction of an employment decision.`;
  $("#masteredCount").textContent = `${mastered}/${state.questions.length}`;
  $("#attemptCount").textContent = every.length;
  $("#improvementAverage").textContent = `${averageGrowth >= 0 ? "+" : ""}${averageGrowth}`;
  $("#fillerChange").textContent = firstFillers ? `${fillerChange > 0 ? "+" : ""}${fillerChange}%` : "0";
  $("#strongestAreas").textContent = finals.length ? `Your strongest rubric areas were ${label(categoryAverages[0]?.key)} and ${label(categoryAverages[1]?.key)}.` : "Complete at least one answer to identify your strongest areas.";
  $("#practiceAreas").textContent = finals.length ? `Continue practicing ${label(categoryAverages.at(-1)?.key)} and ${label(categoryAverages.at(-2)?.key)}. Use the question-level feedback to guide each retry.` : "No scored answers were completed in this session.";
  $("#starPerformance").textContent = starItems.length ? `Your STAR-style answers averaged ${starAverage.toFixed(1)} of 4 detected story components. Strong answers establish context, responsibility, personal action, and a result.` : "No STAR-style answers were scored in this session.";
  $("#careerAlignment").textContent = finals.length ? `Your answers used an average of ${alignmentAverage.toFixed(1)} profession-specific terms. Use relevant language naturally and only when it truthfully describes your experience.` : "Complete an answer to calculate career alignment.";
  $("#strongestAnswer").textContent = strongest ? `“${strongest.question.prompt}” scored ${strongest.result.score}/100.` : "No scored answer available.";
  $("#weakestAnswer").textContent = weakest ? `“${weakest.question.prompt}” scored ${weakest.result.score}/100. ${weakest.result.feedback.nextGoal}` : "No scored answer available.";
  $("#reportRecommendations").textContent = buildReportRecommendation({ average, averageGrowth, firstFillers, lastFillers, weakest, skipped: state.skipped.length });
}

function buildReportRecommendation({ average, averageGrowth, firstFillers, lastFillers, weakest, skipped }) {
  const parts = [];
  if (weakest) parts.push(weakest.result.feedback.nextGoal);
  if (averageGrowth > 0) parts.push(`Your repeated answers improved by an average of ${averageGrowth} points, so continue using short retry rounds.`);
  if (lastFillers < firstFillers) parts.push("Your tracked filler language decreased; keep replacing filler words with a deliberate pause.");
  if (skipped) parts.push(`Return to the ${skipped} skipped question${skipped === 1 ? "" : "s"} before your real interview.`);
  if (average >= 95) parts.push("You reached the Mastered range overall. Practice once more for natural delivery rather than memorization.");
  else if (average >= 85) parts.push("You are in the Interview Ready range. Strengthen the lowest-scoring answer and rehearse your closing questions.");
  else parts.push("Practice one question at a time. Focus on one truthful example, your personal action, and the final outcome.");
  return parts.join(" ");
}

const STYLE_NAMES = { friendly: "Friendly", panel: "Panel", rapid: "Rapid-fire" };

function reportAsText() {
  const { finals, every, average, mastered, averageGrowth } = reportNumbers();
  const lines = [
    "EFF Interview Coach: practice report",
    "Esther Funds Foundation · Career Studio",
    "",
    `Profession: ${state.professionName}`,
    `Interview style: ${STYLE_NAMES[state.style] || "Friendly"}`,
    `Date: ${new Date().toLocaleString()}`,
    `Overall rubric score: ${average}/100`,
    `Questions mastered: ${mastered} of ${state.questions.length}`,
    `Total attempts: ${every.length}`,
    `Average point growth on retries: ${averageGrowth >= 0 ? "+" : ""}${averageGrowth}`,
    "",
    "This is a practice score against the EFF coaching rubric. It does not predict an employment or admissions decision.",
    "",
    "========================================",
    "",
  ];
  state.questions.forEach((question, index) => {
    const answer = finals.find((item) => item.questionIndex === index);
    const tries = state.attempts[index]?.length || 0;
    lines.push(`Question ${index + 1} of ${state.questions.length} · ${question.category}${question.star ? " · STAR" : ""}`);
    lines.push(question.prompt, "");
    if (!answer) {
      lines.push(state.skipped.includes(index) ? "Skipped. Come back to this one before the real interview." : "Not answered in this session.");
    } else {
      lines.push("Your final answer:", answer.transcript, "");
      lines.push(`Score: ${answer.result.score}/100 (${answer.result.label}) after ${tries} attempt${tries === 1 ? "" : "s"}`);
      lines.push("", "What you did well:", ...answer.result.feedback.strengths.map((item) => `- ${item}`));
      lines.push("", "What to improve:", ...answer.result.feedback.improvements.map((item) => `- ${item}`));
      lines.push("", `Next goal: ${answer.result.feedback.nextGoal}`);
    }
    if (question.tip) lines.push("", `How to approach this question: ${question.tip}`);
    lines.push("", "----------------------------------------", "");
  });
  lines.push("Created on your device by the EFF Interview Coach. Nothing was sent anywhere.");
  return lines.join("\n");
}

function downloadReport() {
  const slug = state.professionName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "practice";
  downloadText(`eff-interview-report-${slug}-${dateStamp()}.txt`, reportAsText());
  toast("Your report is downloading.");
}

function reviewAnswers() {
  const finals = finalAttempts();
  lastOpener = document.activeElement;
  const overlay = document.createElement("div");
  overlay.className = "coaching-overlay";
  overlay.id = "reviewOverlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `<article class="coaching-sheet"><p class="eyebrow">Session review</p><h2>My answers</h2><div class="report-grid">${state.questions.map((question, index) => {
    const answer = finals.find((item) => item.questionIndex === index);
    return `<section class="report-card"><h3>Question ${index + 1} · ${escapeHtml(question.category)}</h3><p><strong>${escapeHtml(question.prompt)}</strong></p><p>${answer ? escapeHtml(answer.transcript) : "No scored answer."}</p><p>${answer ? `Final rubric score: ${answer.result.score}/100` : ""}</p>${question.tip ? `<p class="disclaimer"><strong>How to approach this:</strong> ${escapeHtml(question.tip)}</p>` : ""}</section>`;
  }).join("")}</div><div class="button-row"><button class="button" type="button" id="closeReview">Close review</button></div></article>`;
  document.body.appendChild(overlay);
  overlay.querySelector("#closeReview").addEventListener("click", () => closeOverlay("#reviewOverlay"));
  overlay.querySelector("#closeReview").focus();
}

function resumeSavedSession() {
  const saved = getSavedSession();
  if (!saved) return updateSessionBanner();
  state = { ...state, style: "friendly", ...saved };
  $("#sessionBanner").classList.remove("visible");
  if (state.screen === "report") {
    renderReport();
    showScreen("report");
  } else {
    allowInterviewWithoutMedia();
    $("#professionLabel").textContent = state.professionName;
    showScreen("interview");
    renderQuestion();
    toast("Session restored. Saved video is not retained; transcripts and rubric scores are available.");
  }
}

function resetForPractice({ sameProfession = false } = {}) {
  stopActiveRecording();
  Object.values(state.attempts).flat().forEach((attempt) => { if (attempt.videoUrl) URL.revokeObjectURL(attempt.videoUrl); });
  if (sameProfession && state.professionName) {
    state.questions = buildSessionQuestions(state.professionName);
    state.currentIndex = 0;
    state.attempts = {};
    state.skipped = [];
    state.startedAt = null;
    renderOptions();
    showScreen("setup");
    detectSpeechSupport();
  } else {
    state = { screen: "career", category: CAREER_CATEGORIES[0].name, professionName: "", questions: [], currentIndex: 0, attempts: {}, skipped: [], startedAt: null, style: prefs.style };
    stopMedia();
    clearSession({ announce: false });
    renderCategories();
    renderCareers();
    showScreen("career");
  }
}

/* ---------- Elevator pitch ---------- */

const PITCH_FIELDS = ["pitchWho", "pitchStudy", "pitchStrength", "pitchAsk"];

function openPitch() {
  const draft = loadJSON(PITCH_KEY, {});
  PITCH_FIELDS.forEach((id) => { $(`#${id}`).value = draft[id] || ""; });
  $("#pitchScript").value = draft.script || "";
  updatePitchCount();
  resetPitchTimer();
  showScreen("pitch");
}

function savePitchDraft() {
  const draft = Object.fromEntries(PITCH_FIELDS.map((id) => [id, $(`#${id}`).value]));
  draft.script = $("#pitchScript").value;
  saveJSON(PITCH_KEY, draft);
}

const asSentence = (value = "") => {
  const text = value.trim().replace(/\s+/g, " ");
  if (!text) return "";
  const capped = text.charAt(0).toUpperCase() + text.slice(1);
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
};

function buildPitch() {
  const parts = PITCH_FIELDS.map((id) => asSentence($(`#${id}`).value)).filter(Boolean);
  if (!parts.length) return toast("Fill in at least one part to build your pitch.");
  $("#pitchScript").value = parts.join(" ");
  updatePitchCount();
  savePitchDraft();
  $("#pitchScript").focus();
  toast("Your pitch is ready. Read it a few times, then practice it without looking.");
}

function updatePitchCount() {
  const count = $("#pitchScript").value.trim().split(/\s+/).filter(Boolean).length;
  const seconds = Math.round(count / 2.5);
  $("#pitchCount").textContent = `${count} word${count === 1 ? "" : "s"} · about ${seconds} seconds spoken${count ? count < 65 ? " · a little short" : count > 95 ? " · trim a little for 30 seconds" : " · a good length" : ""}`;
}

function resetPitchTimer() {
  window.clearInterval(pitchTimer);
  pitchTimer = null;
  $("#pitchTime").textContent = mmss(PITCH_SECONDS);
  $("#pitchTime").classList.remove("over");
  $("#pitchRecord").classList.remove("hidden");
  $("#pitchStop").classList.add("hidden");
}

function startPitch() {
  stopSpeaking();
  finalTranscript = "";
  $("#pitchTranscript").value = "";
  $("#pitchFeedback").innerHTML = "";
  pitchStart = Date.now();
  pitchSeconds = 0;
  startRecognition($("#pitchTranscript"));
  $("#pitchStatus").textContent = recognition ? "Listening. Say your pitch like you are meeting someone new." : "The clock is running. Say your pitch out loud, then type what you said below.";
  $("#pitchRecord").classList.add("hidden");
  $("#pitchStop").classList.remove("hidden");
  setOnAir(true);
  $("#pitchStop").focus();
  const tick = () => {
    const elapsed = (Date.now() - pitchStart) / 1000;
    const left = PITCH_SECONDS - elapsed;
    $("#pitchTime").textContent = left >= 0 ? mmss(Math.ceil(left)) : `+${mmss(-left)}`;
    $("#pitchTime").classList.toggle("over", left < 0);
    if (elapsed >= PITCH_SECONDS + 15) stopPitch();
  };
  tick();
  pitchTimer = window.setInterval(tick, 250);
}

function stopPitch() {
  if (!pitchStart) return;
  pitchSeconds = Math.round((Date.now() - pitchStart) / 1000);
  pitchStart = 0;
  stopRecognition();
  window.clearInterval(pitchTimer);
  pitchTimer = null;
  setOnAir(false);
  $("#pitchRecord").classList.remove("hidden");
  $("#pitchRecord").textContent = "Practice again";
  $("#pitchStop").classList.add("hidden");
  $("#pitchStatus").textContent = `You spoke for ${pitchSeconds} seconds. Fix anything the transcript missed, then check your pitch.`;
  $("#pitchCheck").focus();
}

function checkPitch() {
  if (pitchStart) stopPitch();
  const spoken = $("#pitchTranscript").value.trim();
  const text = spoken || $("#pitchScript").value.trim();
  if (!text) return toast("Say or type your pitch first.");
  const result = scorePitch(text, spoken ? pitchSeconds : 0);
  const headline = result.passed === result.total ? "That pitch is ready to use." : result.passed >= result.total - 1 ? "Almost there. One thing to tighten." : "A good start. Here is what to work on.";
  $("#pitchFeedback").innerHTML = `<h3>${escapeHtml(headline)}</h3>
    <p class="disclaimer">${result.passed} of ${result.total} checks met${spoken ? "" : ". These checks used your written pitch because there is no transcript yet"}.</p>
    <ul>${result.checks.map((item) => `<li class="${item.ok ? "ok" : ""}">${escapeHtml(item.ok ? item.good : item.fix)}</li>`).join("")}</ul>`;
}

/* ---------- Helpers and events ---------- */

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function label(value = "") { return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase()); }

function bindEvents() {
  $("#startCoach").addEventListener("click", () => { renderCategories(); renderCareers(); showScreen("career"); });
  $("#startPitch").addEventListener("click", openPitch);
  $("#pitchBack").addEventListener("click", () => { stopPitch(); savePitchDraft(); showScreen("landing"); });
  $("#backToCareers").addEventListener("click", () => showScreen("career"));
  $("#beginSetup").addEventListener("click", () => { detectSpeechSupport(); renderOptions(); showScreen("setup"); });
  $("#enableMedia").addEventListener("click", enableMedia);
  $("#continueNoCamera").addEventListener("click", allowInterviewWithoutMedia);
  $("#startInterview").addEventListener("click", startInterview);
  $("#beginFirstQuestion").addEventListener("click", () => { $("#welcomeOverlay").classList.add("hidden"); renderQuestion(); });
  $("#recordAnswer").addEventListener("click", beginAnswerFlow);
  $("#skipThink").addEventListener("click", endThink);
  $("#finishAnswer").addEventListener("click", finishAnswer);
  $("#speakAgain").addEventListener("click", speakQuestion);
  $("#approachToggle").addEventListener("click", toggleApproach);
  $("#transcript").addEventListener("input", () => { stopSpeaking(); $("#scoreAnswer").disabled = !recordingFinalized || !$("#transcript").value.trim(); });
  $("#scoreAnswer").addEventListener("click", scoreCurrentAnswer);
  $("#skipQuestion").addEventListener("click", skipQuestion);
  $("#retryQuestion").addEventListener("click", retryQuestion);
  $("#nextQuestion").addEventListener("click", goNext);
  $("#saveStoryBtn").addEventListener("click", openStoryForm);
  $("#cancelStory").addEventListener("click", () => { $("#storyForm").classList.add("hidden"); $("#saveStoryBtn").classList.remove("hidden"); $("#saveStoryBtn").focus(); });
  $("#storyForm").addEventListener("submit", saveStoryFromForm);
  $("#openStories").addEventListener("click", openStoryBank);
  $("#practiceAgain").addEventListener("click", () => resetForPractice({ sameProfession: true }));
  $("#newProfession").addEventListener("click", () => resetForPractice({ sameProfession: false }));
  $("#reviewAnswers").addEventListener("click", reviewAnswers);
  $("#printReport").addEventListener("click", () => window.print());
  $("#downloadReport").addEventListener("click", downloadReport);
  $("#resumeSession").addEventListener("click", resumeSavedSession);
  $("#clearSession").addEventListener("click", () => clearSession());
  $("#restartTop").addEventListener("click", () => {
    if (confirm("Start a new practice session? This clears saved transcripts and scores from this device. Your story bank stays.")) resetForPractice({ sameProfession: false });
  });
  PITCH_FIELDS.forEach((id) => $(`#${id}`).addEventListener("input", savePitchDraft));
  $("#pitchScript").addEventListener("input", () => { updatePitchCount(); savePitchDraft(); });
  $("#buildPitch").addEventListener("click", buildPitch);
  $("#pitchRecord").addEventListener("click", startPitch);
  $("#pitchStop").addEventListener("click", stopPitch);
  $("#pitchCheck").addEventListener("click", checkPitch);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (document.querySelector("#storyBank")) return closeOverlay("#storyBank");
    if (document.querySelector("#reviewOverlay")) return closeOverlay("#reviewOverlay");
    if (!$("#thinkLayer").classList.contains("hidden")) return endThink();
  });
  window.addEventListener("beforeunload", () => { stopActiveRecording(); stopMedia(); });
  if (synth && typeof synth.addEventListener === "function") synth.addEventListener("voiceschanged", () => {});
}

bindOptions();
bindEvents();
bindTilt($("#heroStage"), null, 10);
bindTilt($("#careerGrid"), ".career-card", 7);
renderOptions();
renderCategories();
renderCareers();
detectSpeechSupport();
updateSessionBanner();
updateFormatStat();
