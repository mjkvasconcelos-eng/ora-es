// Voz nativa aprimorada — Voz do Pai
(function () {
  let voices = [];
  let runId = 0;
  let stopTimer = null;

  function loadVoices() {
    if (!("speechSynthesis" in window)) return;
    voices = speechSynthesis.getVoices() || [];
  }

  loadVoices();
  if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = loadVoices;

  function pickVoice() {
    const pt = voices.filter((v) => /^pt(-|_)?BR$/i.test(v.lang) || /^pt/i.test(v.lang));
    const maleHints = ["male", "masculino", "homem", "antonio", "daniel", "lucas", "felipe", "ricardo", "thiago", "google português brasil"];
    const male = pt.find((v) => maleHints.some((hint) => v.name.toLowerCase().includes(hint)));
    return male || pt.find((v) => /natural|enhanced|google|microsoft/i.test(v.name)) || pt[0] || voices.find((v) => /^pt/i.test(v.lang)) || null;
  }

  window.speak = function (text) {
    if (!("speechSynthesis" in window)) {
      alert("Seu navegador não oferece leitura de voz.");
      return;
    }

    speechSynthesis.cancel();
    clearTimeout(stopTimer);

    const myRun = ++runId;
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    if (!clean) return;

    const parts = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
    let index = 0;
    const voice = pickVoice();

    function next() {
      if (myRun !== runId || index >= parts.length) return;
      const sentence = parts[index++].trim();
      if (!sentence) return next();

      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = voice?.lang || "pt-BR";
      if (voice) utterance.voice = voice;
      utterance.rate = sentence.length < 55 ? 0.78 : sentence.length < 110 ? 0.82 : 0.85;
      utterance.pitch = 0.88;
      utterance.volume = 1;
      utterance.onend = () => {
        if (myRun !== runId) return;
        stopTimer = setTimeout(next, sentence.length < 55 ? 420 : 600);
      };
      utterance.onerror = () => {
        if (myRun !== runId) return;
        stopTimer = setTimeout(next, 250);
      };
      speechSynthesis.speak(utterance);
    }

    next();
  };

  window.stopSpeak = function () {
    runId++;
    clearTimeout(stopTimer);
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  };

  window.addEventListener("beforeunload", () => window.stopSpeak());
})();
