import { CAREER_CATEGORIES, CAREER_DATA, SCORING_CONFIG, buildInterviewQuestions } from "./career-data.js";
import { calculateAnswerScore, compareAttempts } from "./scoring-engine.js";

const STORAGE_KEY = "eff-interview-coach-session-v1";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const screens = Object.fromEntries($$("[data-screen]").map((node) => [node.dataset.screen, node]));

let state = {
  screen: "landing",
  category: CAREER_CATEGORIES[0].name,
  professionName: "",
  questions: [],
  currentIndex: 0,
  attempts: {},
  skipped: [],
  startedAt: null,
};
let mediaStream = null;
let mediaRecorder = null;
let recognition = null;
let recordedChunks = [];
let currentRecordingUrl = "";
let recordingStart = 0;
let timerId = null;
let finalTranscript = "";

function showScreen(name) {
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableState()));
  } catch {
    toast("This browser could not save local progress, but your current session can continue.");
  }
}

function getSavedSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return saved?.professionName && Array.isArray(saved.questions) ? saved : null;
  } catch {
    return null;
  }
}

function updateSessionBanner() {
  $("#sessionBanner").classList.toggle("visible", Boolean(getSavedSession()));
}

function clearSession({ announce = true } = {}) {
  localStorage.removeItem(STORAGE_KEY);
  updateSessionBanner();
  if (announce) toast("Saved practice cleared from this device.");
}

function renderCategories() {
  const container = $("#categoryTabs");
  container.innerHTML = CAREER_CATEGORIES.map((category, index) => `
    <button class="category-tab ${category.name === state.category ? "active" : ""}" type="button" role="tab" aria-selected="${category.name === state.category}" data-category="${escapeHtml(category.name)}" tabindex="${index === 0 ? 0 : -1}">${escapeHtml(category.name)}</button>
  `).join("");
  container.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
    state.category = button.dataset.category;
    renderCategories();
    renderCareers();
  }));
}

function renderCareers() {
  const category = CAREER_CATEGORIES.find((item) => item.name === state.category) || CAREER_CATEGORIES[0];
  $("#careerGrid").innerHTML = category.professions.map((name) => {
    const profession = CAREER_DATA[name];
    return `<button class="career-card" type="button" data-profession="${escapeHtml(name)}"><small>${escapeHtml(category.name)}</small><h3>${escapeHtml(name)}</h3><p>${escapeHtml(profession.description)}</p></button>`;
  }).join("");
  $("#careerGrid").querySelectorAll("button").forEach((button) => button.addEventListener("click", () => selectProfession(button.dataset.profession)));
}

function selectProfession(name) {
  state.professionName = name;
  state.questions = buildInterviewQuestions(name, 8);
  state.currentIndex = 0;
  state.attempts = {};
  state.skipped = [];
  const profession = CAREER_DATA[name];
  $("#overviewCategory").textContent = profession.category;
  $("#overviewTitle").textContent = name;
  $("#overviewDescription").textContent = profession.description;
  $("#overviewCompetencies").innerHTML = profession.competencies.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  $("#overviewSignals").innerHTML = profession.competencies.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  showScreen("overview");
}

function detectSpeechSupport() {
  const supported = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  $("#speechSupport").textContent = supported ? "Supported" : "Manual fallback";
  $("#speechSupport").classList.toggle("ready", supported);
  return supported;
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

function startInterview() {
  if (!state.professionName) return;
  if (!state.questions.length) state.questions = buildInterviewQuestions(state.professionName, 8);
  state.startedAt ||= new Date().toISOString();
  $("#professionLabel").textContent = state.professionName;
  $("#welcomeTitle").textContent = `Welcome to your ${state.professionName} interview.`;
  $("#welcomeMessage").textContent = CAREER_DATA[state.professionName].welcome;
  showScreen("interview");
  $("#welcomeOverlay").classList.remove("hidden");
  $("#beginFirstQuestion").focus();
  saveSession();
}

function renderQuestion({ preserveTranscript = false } = {}) {
  const question = state.questions[state.currentIndex];
  if (!question) return finishInterview();
  $("#progressLabel").textContent = `Question ${state.currentIndex + 1} of ${state.questions.length}`;
  $("#progressBar").style.width = `${((state.currentIndex + 1) / state.questions.length) * 100}%`;
  $("#questionText").textContent = question.prompt;
  $("#questionCategory").textContent = question.star ? `${question.category} · STAR response recommended` : question.category;
  if (!preserveTranscript) $("#transcript").value = "";
  $("#scoreAnswer").disabled = !$("#transcript").value.trim();
  $("#speechStatus").textContent = detectSpeechSupport() ? "Ready for live transcription when you start." : "Live speech transcription is unavailable here. Record if supported, then type your answer.";
  $("#recordAnswer").classList.remove("hidden");
  $("#finishAnswer").classList.add("hidden");
  currentRecordingUrl = "";
  finalTranscript = "";
  saveSession();
}

function startAnswer() {
  recordedChunks = [];
  finalTranscript = $("#transcript").value.trim();
  currentRecordingUrl = "";
  if (mediaStream && window.MediaRecorder) {
    try {
      const preferred = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
      const mimeType = preferred.find((type) => MediaRecorder.isTypeSupported?.(type));
      mediaRecorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);
      mediaRecorder.ondataavailable = (event) => { if (event.data.size) recordedChunks.push(event.data); };
      mediaRecorder.onstop = () => {
        if (recordedChunks.length) currentRecordingUrl = URL.createObjectURL(new Blob(recordedChunks, { type: mediaRecorder.mimeType || "video/webm" }));
      };
      mediaRecorder.start(400);
    } catch (error) {
      console.warn("MediaRecorder unavailable", error);
      mediaRecorder = null;
      toast("Video recording is unavailable in this browser. Your transcript can still be coached.");
    }
  }
  startRecognition();
  recordingStart = Date.now();
  timerId = window.setInterval(updateRecordingClock, 500);
  updateRecordingClock();
  $("#recordingBadge").classList.add("active");
  $("#recordAnswer").classList.add("hidden");
  $("#finishAnswer").classList.remove("hidden");
  $("#speechStatus").textContent = recognition ? "Listening. Speak naturally and pause when you need to think." : "Recording started. Type or paste your answer into the transcript box when finished.";
}

function startRecognition() {
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
      $("#transcript").value = `${finalTranscript} ${interim}`.trim();
      $("#scoreAnswer").disabled = !$("#transcript").value.trim();
    };
    recognition.onerror = () => {
      $("#speechStatus").textContent = "Live transcription paused. Finish the recording and edit the transcript manually.";
    };
    recognition.start();
  } catch (error) {
    console.warn("Speech recognition unavailable", error);
    recognition = null;
  }
}

function updateRecordingClock() {
  const seconds = Math.floor((Date.now() - recordingStart) / 1000);
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");
  $("#recordingTime").textContent = `Recording ${minutes}:${remainder}`;
}

function finishAnswer() {
  if (mediaRecorder?.state === "recording") mediaRecorder.stop();
  if (recognition) {
    try { recognition.stop(); } catch {}
    recognition = null;
  }
  window.clearInterval(timerId);
  $("#recordingBadge").classList.remove("active");
  $("#recordAnswer").classList.remove("hidden");
  $("#recordAnswer").textContent = "Record again";
  $("#finishAnswer").classList.add("hidden");
  $("#speechStatus").textContent = "Recording finished. Review the transcript, make corrections, then score the answer.";
  $("#scoreAnswer").disabled = !$("#transcript").value.trim();
  $("#transcript").focus();
}

function scoreCurrentAnswer() {
  const transcript = $("#transcript").value.trim();
  if (!transcript) return toast("Add your answer transcript before scoring.");
  const question = state.questions[state.currentIndex];
  const profession = CAREER_DATA[state.professionName];
  const result = calculateAnswerScore({ transcript, question, profession });
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
  $("#answerScore").textContent = result.score;
  $("#masteryLabel").textContent = result.score >= 95 ? "QUESTION MASTERED ✓" : `${result.label} · You may retry or continue.`;
  $("#rubricGrid").innerHTML = Object.entries(SCORING_CONFIG.weights).map(([key, max]) => `<div class="rubric-item"><span>${escapeHtml(key)}</span><strong>${result.categoryScores[key]} / ${max}</strong></div>`).join("");
  $("#strengthList").innerHTML = result.feedback.strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  $("#improvementList").innerHTML = result.feedback.improvements.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  $("#nextGoal").textContent = result.feedback.nextGoal;
  $("#comparisonNote").textContent = attempts.length > 1 ? `${comparison.change >= 0 ? "+" : ""}${comparison.change} points from your previous attempt. ${comparison.improvements.join(" ")}` : "Attempt 1 establishes your baseline.";
  $("#attemptList").innerHTML = attempts.map((item, index) => {
    const change = index ? item.result.score - attempts[index - 1].result.score : 0;
    return `<article class="attempt"><strong>Attempt ${index + 1} · ${item.result.score}</strong><span>${index ? `${change >= 0 ? "+" : ""}${change} from prior attempt` : "Baseline"}</span>${item.videoUrl ? `<video controls src="${item.videoUrl}" aria-label="Replay attempt ${index + 1}"></video>` : `<span style="margin-top:8px">Video unavailable after a resumed session or when camera recording is off.</span>`}</article>`;
  }).join("");
  $("#retryQuestion").textContent = result.score >= 95 ? "Practice once more" : "Try this question again";
  $("#nextQuestion").textContent = state.currentIndex === state.questions.length - 1 ? "View final report" : "Continue to next question";
  $("#coachingOverlay").classList.remove("hidden");
  $("#coachingOverlay").querySelector(".coaching-sheet").scrollTop = 0;
  $("#retryQuestion").focus();
}

function retryQuestion() {
  $("#coachingOverlay").classList.add("hidden");
  renderQuestion();
  $("#recordAnswer").focus();
}

function goNext() {
  $("#coachingOverlay").classList.add("hidden");
  state.currentIndex += 1;
  if (state.currentIndex >= state.questions.length) finishInterview();
  else renderQuestion();
}

function skipQuestion() {
  if (!state.skipped.includes(state.currentIndex)) state.skipped.push(state.currentIndex);
  state.currentIndex += 1;
  if (state.currentIndex >= state.questions.length) finishInterview();
  else renderQuestion();
}

function finishInterview() {
  stopActiveRecording();
  renderReport();
  showScreen("report");
  saveSession();
}

function stopActiveRecording() {
  if (mediaRecorder?.state === "recording") mediaRecorder.stop();
  if (recognition) { try { recognition.stop(); } catch {} }
  recognition = null;
  window.clearInterval(timerId);
  $("#recordingBadge").classList.remove("active");
}

function allAttempts() {
  return Object.entries(state.attempts).flatMap(([questionIndex, attempts]) => attempts.map((attempt) => ({ ...attempt, questionIndex: Number(questionIndex), question: state.questions[Number(questionIndex)] })));
}

function finalAttempts() {
  return Object.entries(state.attempts).map(([questionIndex, attempts]) => ({ ...attempts.at(-1), questionIndex: Number(questionIndex), question: state.questions[Number(questionIndex)] })).filter((item) => item.result);
}

function renderReport() {
  const finals = finalAttempts();
  const every = allAttempts();
  const average = finals.length ? Math.round(finals.reduce((sum, item) => sum + item.result.score, 0) / finals.length) : 0;
  const mastered = finals.filter((item) => item.result.score >= 95).length;
  const growthValues = Object.values(state.attempts).filter((items) => items.length > 1).map((items) => items.at(-1).result.score - items[0].result.score);
  const averageGrowth = growthValues.length ? Math.round(growthValues.reduce((sum, value) => sum + value, 0) / growthValues.length) : 0;
  const firstFillers = Object.values(state.attempts).reduce((sum, items) => sum + (items[0]?.result.analysis.fillerCount || 0), 0);
  const lastFillers = Object.values(state.attempts).reduce((sum, items) => sum + (items.at(-1)?.result.analysis.fillerCount || 0), 0);
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
  $("#overallScore").textContent = average;
  $("#reportSummary").textContent = `You demonstrated ${average >= 85 ? "strong" : average >= 70 ? "developing" : "foundational"} performance against the EFF Interview Coach rubric. This is a practice score, not a prediction of an employment decision.`;
  $("#masteredCount").textContent = `${mastered}/${state.questions.length}`;
  $("#attemptCount").textContent = every.length;
  $("#improvementAverage").textContent = `${averageGrowth >= 0 ? "+" : ""}${averageGrowth}`;
  $("#fillerChange").textContent = firstFillers ? `${fillerChange > 0 ? "+" : ""}${fillerChange}%` : "0";
  $("#strongestAreas").textContent = finals.length ? `Your strongest rubric areas were ${label(categoryAverages[0]?.key)} and ${label(categoryAverages[1]?.key)}.` : "Complete at least one answer to identify your strongest areas.";
  $("#practiceAreas").textContent = finals.length ? `Continue practicing ${label(categoryAverages.at(-1)?.key)} and ${label(categoryAverages.at(-2)?.key)}. Use the question-level feedback to guide each retry.` : "No scored answers were completed in this session.";
  $("#starPerformance").textContent = starItems.length ? `Your STAR-style answers averaged ${starAverage.toFixed(1)} of 4 detected story components. Strong answers establish context, responsibility, personal action, and a result.` : "No STAR-style answers were scored in this session.";
  $("#careerAlignment").textContent = finals.length ? `Your answers used an average of ${alignmentAverage.toFixed(1)} profession-specific terms. Use relevant language naturally and only when it truthfully describes your experience.` : "Complete an answer to calculate career alignment.";
  $("#strongestAnswer").textContent = strongest ? `“${strongest.question.prompt}” — ${strongest.result.score}/100.` : "No scored answer available.";
  $("#weakestAnswer").textContent = weakest ? `“${weakest.question.prompt}” — ${weakest.result.score}/100. ${weakest.result.feedback.nextGoal}` : "No scored answer available.";
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

function reviewAnswers() {
  const finals = finalAttempts();
  const overlay = document.createElement("div");
  overlay.className = "coaching-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `<article class="coaching-sheet"><p class="eyebrow">Session review</p><h2>My answers</h2><div class="report-grid">${state.questions.map((question, index) => {
    const answer = finals.find((item) => item.questionIndex === index);
    return `<section class="report-card"><h3>Question ${index + 1} · ${escapeHtml(question.category)}</h3><p><strong>${escapeHtml(question.prompt)}</strong></p><p>${answer ? escapeHtml(answer.transcript) : "No scored answer."}</p><p>${answer ? `Final rubric score: ${answer.result.score}/100` : ""}</p></section>`;
  }).join("")}</div><div class="button-row"><button class="button" type="button" id="closeReview">Close review</button></div></article>`;
  document.body.appendChild(overlay);
  overlay.querySelector("#closeReview").addEventListener("click", () => overlay.remove());
  overlay.querySelector("#closeReview").focus();
}

function resumeSavedSession() {
  const saved = getSavedSession();
  if (!saved) return updateSessionBanner();
  state = { ...state, ...saved };
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
    state.questions = buildInterviewQuestions(state.professionName, 8);
    state.currentIndex = 0;
    state.attempts = {};
    state.skipped = [];
    state.startedAt = null;
    showScreen("setup");
    detectSpeechSupport();
  } else {
    state = { screen: "career", category: CAREER_CATEGORIES[0].name, professionName: "", questions: [], currentIndex: 0, attempts: {}, skipped: [], startedAt: null };
    stopMedia();
    clearSession({ announce: false });
    renderCategories();
    renderCareers();
    showScreen("career");
  }
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function label(value = "") { return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase()); }

function bindEvents() {
  $("#startCoach").addEventListener("click", () => { renderCategories(); renderCareers(); showScreen("career"); });
  $("#backToCareers").addEventListener("click", () => showScreen("career"));
  $("#beginSetup").addEventListener("click", () => { detectSpeechSupport(); showScreen("setup"); });
  $("#enableMedia").addEventListener("click", enableMedia);
  $("#continueNoCamera").addEventListener("click", allowInterviewWithoutMedia);
  $("#startInterview").addEventListener("click", startInterview);
  $("#beginFirstQuestion").addEventListener("click", () => { $("#welcomeOverlay").classList.add("hidden"); renderQuestion(); });
  $("#recordAnswer").addEventListener("click", startAnswer);
  $("#finishAnswer").addEventListener("click", finishAnswer);
  $("#transcript").addEventListener("input", () => { $("#scoreAnswer").disabled = !$("#transcript").value.trim(); });
  $("#scoreAnswer").addEventListener("click", scoreCurrentAnswer);
  $("#skipQuestion").addEventListener("click", skipQuestion);
  $("#retryQuestion").addEventListener("click", retryQuestion);
  $("#nextQuestion").addEventListener("click", goNext);
  $("#practiceAgain").addEventListener("click", () => resetForPractice({ sameProfession: true }));
  $("#newProfession").addEventListener("click", () => resetForPractice({ sameProfession: false }));
  $("#reviewAnswers").addEventListener("click", reviewAnswers);
  $("#printReport").addEventListener("click", () => window.print());
  $("#resumeSession").addEventListener("click", resumeSavedSession);
  $("#clearSession").addEventListener("click", () => clearSession());
  $("#restartTop").addEventListener("click", () => {
    if (confirm("Start a new practice session? This clears saved transcripts and scores from this device.")) resetForPractice({ sameProfession: false });
  });
  window.addEventListener("beforeunload", () => { stopActiveRecording(); stopMedia(); });
}

bindEvents();
renderCategories();
renderCareers();
detectSpeechSupport();
updateSessionBanner();
