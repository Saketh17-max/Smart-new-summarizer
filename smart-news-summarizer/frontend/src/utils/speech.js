export const speakText = (text, lang = 'en', onEnd) => {
    if (!('speechSynthesis' in window)) {
        alert("Sorry, your browser doesn't support text to speech!");
        if (onEnd) onEnd();
        return null;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Try to find a good voice matching the language code
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = lang.split('-')[0].toLowerCase();

    const exactVoice = voices.find(v => v.lang.toLowerCase() === lang.toLowerCase());
    const prefixVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    const targetVoice = exactVoice || prefixVoice;

    if (targetVoice) {
        utterance.voice = targetVoice;
    } else {
        console.warn(`No specific voice found for language: ${lang}. The browser will attempt to use its default voice engine, which may not support correct pronunciation for this language. You may need to install language packs in your OS.`);
        // Don't alert the user directly here to avoid annoying popups, but set the lang anyway
        // Some systems will download the language on-the-fly or use an online service.
    }

    utterance.lang = lang;
    utterance.rate = 0.95; // Slightly slower for better comprehension
    utterance.pitch = 1.0;

    if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
};

export const stopSpeech = () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};
