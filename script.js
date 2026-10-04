"use strict";

/* =========================================================
   STUCKZ AI — WORKING FRONTEND ENGINE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     DOM
  ======================================================== */

  const $ = (id) => document.getElementById(id);

  const app = $("app");

  const aiCore = $("aiCore");
  const aiStatus = $("aiStatus");
  const aiStateTitle = $("aiStateTitle");
  const aiStateDescription = $("aiStateDescription");

  const welcomeState = $("welcomeState");
  const messages = $("messages");
  const thinkingState = $("thinkingState");

  const chatForm = $("chatForm");
  const messageInput = $("messageInput");
  const sendButton = $("sendButton");

  const voiceButton = $("voiceButton");
  const voiceState = $("voiceState");
  const voiceStateTitle = $("voiceStateTitle");
  const voiceStateSubtitle = $("voiceStateSubtitle");
  const stopVoiceButton = $("stopVoiceButton");

  const attachButton = $("attachButton");
  const uploadButton = $("uploadButton");
  const fileInput = $("fileInput");

  const attachments = $("attachments");
  const fileCount = $("fileCount");

  const sessionList = $("sessionList");
  const sessionSearch = $("sessionSearch");
  const newSessionButton = $("newSessionButton");
  const clearSessionsButton = $("clearSessionsButton");

  const settingsButton = $("settingsButton");
  const themeButton = $("themeButton");
  const profileButton = $("profileButton");

  const settingsModal = $("settingsModal");
  const profileModal = $("profileModal");
  const fileModal = $("fileModal");

  const closeSettingsButton = $("closeSettingsButton");
  const closeProfileButton = $("closeProfileButton");
  const closeFileButton = $("closeFileButton");

  const mobileSessionsButton = $("mobileSessionsButton");
  const mobileSettingsButton = $("mobileSettingsButton");

  const sessionsPanel = $("sessionsPanel");
  const mobileOverlay = $("mobileOverlay");

  const closeContextButton = $("closeContextButton");
  const contextPanel = $("contextPanel");

  const toast = $("toast");
  const toastMessage = $("toastMessage");

  const messageCount = $("messageCount");
  const currentMode = $("currentMode");
  const voiceStatus = $("voiceStatus");

  const enterToSend = $("enterToSend");
  const soundEffects = $("soundEffects");
  const autoSpeak = $("autoSpeak");
  const saveSessions = $("saveSessions");

  const filePreview = $("filePreview");


  /* =======================================================
     STATE
  ======================================================== */

  let totalMessages = 0;
  let uploadedFiles = [];

  let isListening = false;
  let isSpeaking = false;
  let isThinking = false;

  let recognition = null;
  let speechTimer = null;
  let toastTimer = null;

  let currentSessionId = "current";

  let settings = {
    enterToSend: true,
    soundEffects: true,
    autoSpeak: false,
    saveSessions: true
  };


  /* =======================================================
     DEMO AI RESPONSES
     Temporary frontend responses.
  ======================================================== */

  const demoResponses = {

    hello:
      "Hello! I'm STUCKZ AI. I'm ready to help you think, create, research, plan and build.",

    hi:
      "Hey! STUCKZ AI is online. Tell me what you'd like to work on.",

    help:
      "Absolutely. I can help you with ideas, writing, coding, explanations, planning, problem-solving and much more.",

    website:
      "For a premium website, I'd start with three things: a strong visual identity, a clear user journey and fast interactions. Then we can build the frontend and connect a secure AI/backend layer.",

    ai:
      "Artificial intelligence is software that can perform tasks that normally require human-like reasoning, such as understanding language, recognizing patterns and generating content.",

    day:
      "A simple productive day could be split into focused study/work blocks, a physical activity break, personal time and a short review at the end of the day.",

    content:
      "Sure. Give me the topic, target audience and tone, and I can structure the content into a polished, professional format.",

    code:
      "I can help you build it step by step. Send me the code or describe what you want the website or application to do.",

    thanks:
      "You're welcome! ✦",

    default:
      "I understand. This STUCKZ AI interface is currently running in frontend demo mode. Once we connect the secure AI backend, this command will be processed by a real AI model."
  };


  /* =======================================================
     INITIALIZATION
  ======================================================== */

  loadSettings();
  setupChat();
  setupSuggestions();
  setupVoice();
  setupFiles();
  setupSessions();
  setupModals();
  setupSettings();
  setupTools();
  setupTheme();
  setupKeyboard();
  setupMobile();
  setupContextPanel();

  updateUI();
  autoResizeTextarea();

  /* Make sure initial state is correct */
  setAIState("ready");


  /* =======================================================
     CHAT
  ======================================================== */

  function setupChat() {

    if (!chatForm || !messageInput) {
      console.error("STUCKZ AI: Chat elements not found.");
      return;
    }

    chatForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const text = messageInput.value.trim();

      if (!text && uploadedFiles.length === 0) {
        showToast("Type a message first.");
        messageInput.focus();
        return;
      }

      sendMessage(text);
    });


    messageInput.addEventListener("input", () => {
      autoResizeTextarea();
    });


    messageInput.addEventListener("keydown", (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        settings.enterToSend
      ) {

        event.preventDefault();

        chatForm.requestSubmit();
      }

    });


    /* Attach button */

    if (attachButton && fileInput) {
      attachButton.addEventListener("click", () => {
        fileInput.click();
      });
    }
}





  async function sendMessage(text) {

    if (isThinking) {
      return;
    }

    const cleanText = text.trim();

    const filesForMessage = [...uploadedFiles];

    if (!cleanText && filesForMessage.length === 0) {
      return;
    }


    /* User message */

    if (cleanText) {
      addMessage("user", cleanText);
    }


    if (filesForMessage.length > 0) {

      const fileNames = filesForMessage
        .map((file) => file.name)
        .join(", ");

      addMessage(
        "user",
        cleanText
          ? `${cleanText}\n\n📎 ${fileNames}`
          : `📎 ${fileNames}`
      );

    }


    messageInput.value = "";

    autoResizeTextarea();

    clearAttachments(false);

    closeMobileSessions();

    setAIState("thinking");

    showThinking(true);


    /* Small realistic delay */

    const delay = 700 + Math.random() * 900;

    await wait(delay);


    const response = await generateResponse(cleanText);


    showThinking(false);

    addMessage("ai", response);

    setAIState("ready");


    /* Auto voice */

    if (settings.autoSpeak) {
      speakText(response);
    }


    saveCurrentSession();

  }


async function generateResponse(text) {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text,
                history: []
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "AI request failed.");
        }

        return data.reply;

    } catch (error) {
        console.error("STUCKZ AI:", error);

        return "Sorry, STUCKZ AI could not connect to the AI server right now.";
    }
}


  /* =======================================================
     ADD MESSAGE
  ======================================================== */

  function addMessage(type, text) {

    if (!messages) {
      return;
    }


    welcomeState.hidden = true;


    const message = document.createElement("div");

    message.className = `message ${type}`;


    const avatar = document.createElement("div");

    avatar.className = "message-avatar";

    avatar.textContent =
      type === "ai"
        ? "✦"
        : "S";


    const body = document.createElement("div");

    body.className = "message-body";


    const label = document.createElement("span");

    label.className = "message-label";

    label.textContent =
      type === "ai"
        ? "STUCKZ AI"
        : "YOU";


    const textElement = document.createElement("div");

    textElement.className = "message-text";

    textElement.textContent = text;


    const actions = document.createElement("div");

    actions.className = "message-actions";


    if (type === "ai") {

      const copyButton = document.createElement("button");

      copyButton.type = "button";

      copyButton.textContent = "Copy";

      copyButton.addEventListener("click", () => {
        copyText(text);
      });


      const speakButton = document.createElement("button");

      speakButton.type = "button";

      speakButton.textContent = "Speak";

      speakButton.addEventListener("click", () => {
        speakText(text);
      });


      actions.appendChild(copyButton);
      actions.appendChild(speakButton);

    } else {

      const copyButton = document.createElement("button");

      copyButton.type = "button";

      copyButton.textContent = "Copy";

      copyButton.addEventListener("click", () => {
        copyText(text);
      });

      actions.appendChild(copyButton);
    }


    body.appendChild(label);
    body.appendChild(textElement);
    body.appendChild(actions);


    message.appendChild(avatar);
    message.appendChild(body);


    messages.appendChild(message);


    totalMessages++;

    updateMessageCount();


    requestAnimationFrame(() => {

      messages.parentElement.scrollTo({
        top: messages.parentElement.scrollHeight,
        behavior: "smooth"
      });

    });

  }


  /* =======================================================
     THINKING
  ======================================================== */

  function showThinking(show) {

    isThinking = show;

    if (!thinkingState) {
      return;
    }

    thinkingState.hidden = !show;

    if (show) {

      requestAnimationFrame(() => {

        const conversation = $("conversation");

        if (conversation) {
          conversation.scrollTo({
            top: conversation.scrollHeight,
            behavior: "smooth"
          });
        }

      });

    }
  }


  /* =======================================================
     AI STATE
  ======================================================== */

  function setAIState(state) {

    if (!aiCore) {
      return;
    }


    aiCore.classList.remove(
      "is-thinking",
      "is-listening",
      "is-speaking"
    );


    if (state === "thinking") {

      aiCore.classList.add("is-thinking");

      if (aiStatus) {
        aiStatus.textContent = "AI CORE THINKING";
      }

      if (aiStateTitle) {
        aiStateTitle.textContent = "Thinking";
      }

      if (aiStateDescription) {
        aiStateDescription.textContent =
          "Processing your request.";
      }

      return;
    }


    if (state === "listening") {

      aiCore.classList.add("is-listening");

      if (aiStatus) {
        aiStatus.textContent = "LISTENING";
      }

      if (aiStateTitle) {
        aiStateTitle.textContent = "Listening";
      }

      if (aiStateDescription) {
        aiStateDescription.textContent =
          "Listening for your voice.";
      }

      return;
    }


    if (state === "speaking") {

      aiCore.classList.add("is-speaking");

      if (aiStatus) {
        aiStatus.textContent = "AI CORE SPEAKING";
      }

      if (aiStateTitle) {
        aiStateTitle.textContent = "Speaking";
      }

      if (aiStateDescription) {
        aiStateDescription.textContent =
          "Reading the response aloud.";
      }

      return;
    }


    /* Ready */

    if (aiStatus) {
      aiStatus.textContent = "AI CORE ONLINE";
    }

    if (aiStateTitle) {
      aiStateTitle.textContent = "Ready";
    }

    if (aiStateDescription) {
      aiStateDescription.textContent =
        "Waiting for your command.";
    }

  }


  /* =======================================================
     SUGGESTIONS
  ======================================================== */

  function setupSuggestions() {

    const cards = document.querySelectorAll(
      ".suggestion-card"
    );


    cards.forEach((card) => {

      card.addEventListener("click", () => {

        const prompt = card.dataset.prompt || "";

        if (!prompt) {
          return;
        }

        messageInput.value = prompt;

        autoResizeTextarea();

        messageInput.focus();

        chatForm.requestSubmit();

      });

    });

  }


  /* =======================================================
     VOICE INPUT
  ======================================================== */

  function setupVoice() {

    if (!voiceButton) {
      return;
    }


    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      voiceButton.addEventListener("click", () => {

        showToast(
          "Voice input is not supported in this browser. Try Chrome or Edge."
        );

      });

      return;
    }


    recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = true;


    recognition.onstart = () => {

      isListening = true;

      voiceState.hidden = false;

      setAIState("listening");

      if (voiceStateTitle) {
        voiceStateTitle.textContent = "Listening...";
      }

      if (voiceStateSubtitle) {
        voiceStateSubtitle.textContent =
          "Speak naturally. STUCKZ AI is listening.";
      }

      if (voiceStatus) {
        voiceStatus.textContent = "Listening";
      }

      if (currentMode) {
        currentMode.textContent = "Voice";
      }

    };


    recognition.onresult = (event) => {

      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        transcript +=
          event.results[i][0].transcript;

      }


      if (messageInput) {
        messageInput.value = transcript;

        autoResizeTextarea();
      }

    };


    recognition.onerror = (event) => {

      console.warn(
        "Speech recognition error:",
        event.error
      );

      if (event.error === "not-allowed") {

        showToast(
          "Microphone permission was blocked."
        );

      } else if (event.error !== "aborted") {

        showToast(
          "Voice input could not start."
        );

      }

      stopListening();

    };


    recognition.onend = () => {

      const transcript =
        messageInput.value.trim();

      stopListening();


      if (transcript) {

        setTimeout(() => {

          chatForm.requestSubmit();

        }, 150);

      }

    };


    voiceButton.addEventListener(
      "click",
      () => {

        if (isListening) {
          stopListening();
        } else {
          startListening();
        }

      }
    );


    if (stopVoiceButton) {

      stopVoiceButton.addEventListener(
        "click",
        () => {
          stopListening();
        }
      );

    }

  }


  function startListening() {

    if (!recognition) {
      return;
    }


    if (isListening) {
      return;
    }


    try {

      recognition.start();

    } catch (error) {

      console.warn(
        "Voice start error:",
        error
      );

    }

  }


  function stopListening() {

    isListening = false;

    if (recognition) {

      try {
        recognition.stop();
      } catch (error) {
        /* already stopped */
      }

    }


    if (voiceState) {
      voiceState.hidden = true;
    }


    if (voiceStatus) {
      voiceStatus.textContent = "Ready";
    }

    if (currentMode) {
      currentMode.textContent = "Text";
    }


    if (!isThinking && !isSpeaking) {
      setAIState("ready");
    }

  }


  /* =======================================================
     TEXT TO SPEECH
  ======================================================== */

  function speakText(text) {

    if (!("speechSynthesis" in window)) {

      showToast(
        "Voice output is not supported in this browser."
      );

      return;
    }


    window.speechSynthesis.cancel();

    clearTimeout(speechTimer);


    const utterance =
      new SpeechSynthesisUtterance(text);


    utterance.rate = 1;

    utterance.pitch = 1;

    utterance.volume = 1;


    const voices =
      window.speechSynthesis.getVoices();


    const preferredVoice =
      voices.find((voice) =>
        /Google US English|Microsoft.*English|Samantha/i
          .test(voice.name)
      );


    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }


    utterance.onstart = () => {

      isSpeaking = true;

      setAIState("speaking");

      if (voiceStatus) {
        voiceStatus.textContent = "Speaking";
      }

    };


    utterance.onend = () => {

      isSpeaking = false;

      if (voiceStatus) {
        voiceStatus.textContent = "Ready";
      }

      if (!isListening && !isThinking) {
        setAIState("ready");
      }

    };


    utterance.onerror = () => {

      isSpeaking = false;

      if (voiceStatus) {
        voiceStatus.textContent = "Ready";
      }

      setAIState("ready");

    };


    window.speechSynthesis.speak(utterance);

  }


  /* =======================================================
     FILES
  ======================================================== */

  function setupFiles() {

    if (!fileInput) {
      return;
    }


    fileInput.addEventListener(
      "change",
      (event) => {

        const selected =
          Array.from(event.target.files || []);


        selected.forEach((file) => {

          const exists =
            uploadedFiles.some(
              (item) =>
                item.name === file.name &&
                item.size === file.size
            );


          if (!exists) {
            uploadedFiles.push(file);
          }

        });


        renderAttachments();

        fileInput.value = "";

      }
    );


    if (uploadButton) {

      uploadButton.addEventListener(
        "click",
        () => {
          fileInput.click();
        }
      );

    }

  }


  function renderAttachments() {

    if (!attachments) {
      return;
    }


    attachments.innerHTML = "";


    uploadedFiles.forEach((file, index) => {

      const chip =
        document.createElement("div");

      chip.className =
        "attachment-chip";


      const name =
        document.createElement("span");

      name.textContent =
        shortenFileName(file.name);


      const remove =
        document.createElement("button");

      remove.type = "button";

      remove.textContent = "×";

      remove.setAttribute(
        "aria-label",
        `Remove ${file.name}`
      );


      remove.addEventListener(
        "click",
        () => {

          uploadedFiles.splice(index, 1);

          renderAttachments();

        }
      );


      chip.appendChild(name);
      chip.appendChild(remove);

      attachments.appendChild(chip);

    });


    updateFileCount();

  }


  function clearAttachments(showToastMessage = true) {

    uploadedFiles = [];

    renderAttachments();

    if (fileInput) {
      fileInput.value = "";
    }

    if (showToastMessage) {
      showToast("Attachments cleared.");
    }

  }


  function shortenFileName(name) {

    if (name.length <= 22) {
      return name;
    }

    return (
      name.slice(0, 16) +
      "..." +
      name.slice(-5)
    );

  }


  function updateFileCount() {

    if (fileCount) {
      fileCount.textContent =
        uploadedFiles.length;
    }

  }


  /* =======================================================
     SESSIONS
  ======================================================== */

  function setupSessions() {

    if (newSessionButton) {

      newSessionButton.addEventListener(
        "click",
        newSession
      );

    }


    if (clearSessionsButton) {

      clearSessionsButton.addEventListener(
        "click",
        clearConversation
      );

    }


    if (sessionSearch) {

      sessionSearch.addEventListener(
        "input",
        filterSessions
      );

    }


    setupSessionButtons();

  }


  function setupSessionButtons() {

    const buttons =
      document.querySelectorAll(
        ".session-item"
      );


    buttons.forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(".session-item")
            .forEach((item) => {
              item.classList.remove("active");
            });


          button.classList.add("active");

          currentSessionId =
            button.dataset.session ||
            "current";


          closeMobileSessions();

          showToast(
            `${button.querySelector("strong")?.textContent || "Session"} selected.`
          );

        }
      );

    });

  }


  function filterSessions() {

    const query =
      sessionSearch.value
        .toLowerCase()
        .trim();


    const items =
      document.querySelectorAll(
        ".session-item"
      );


    items.forEach((item) => {

      const text =
        item.textContent
          .toLowerCase();


      item.style.display =
        !query || text.includes(query)
          ? ""
          : "none";

    });

  }


  function newSession() {

    clearConversation(false);

    currentSessionId =
      "session-" +
      Date.now();


    document
      .querySelectorAll(".session-item")
      .forEach((item) => {
        item.classList.remove("active");
      });


    const firstSession =
      document.querySelector(
        ".session-item"
      );


    if (firstSession) {
      firstSession.classList.add("active");
    }


    showToast("New session created.");

  }


  function clearConversation(showMessage = true) {

    if (messages) {
      messages.innerHTML = "";
    }


    welcomeState.hidden = false;

    showThinking(false);

    totalMessages = 0;

    updateMessageCount();

    clearAttachments(false);

    if (messageInput) {
      messageInput.value = "";
      autoResizeTextarea();
    }


    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }


    isSpeaking = false;

    stopListening();

    setAIState("ready");


    if (showMessage) {
      showToast("Conversation cleared.");
    }

  }


  function saveCurrentSession() {

    if (!settings.saveSessions) {
      return;
    }


    try {

      const sessionData = {
        id: currentSessionId,
        messages: messages
          ? messages.innerText
          : "",
        updatedAt: Date.now()
      };


      localStorage.setItem(
        "stuckzAI_currentSession",
        JSON.stringify(sessionData)
      );

    } catch (error) {

      console.warn(
        "Could not save session:",
        error
      );

    }

  }


  /* =======================================================
     MODALS
  ======================================================== */

  function setupModals() {

    if (settingsButton) {

      settingsButton.addEventListener(
        "click",
        () => {
          openModal(settingsModal);
        }
      );

    }


    if (profileButton) {

      profileButton.addEventListener(
        "click",
        () => {
          openModal(profileModal);
        }
      );

    }


    if (closeSettingsButton) {

      closeSettingsButton.addEventListener(
        "click",
        () => {
          closeModal(settingsModal);
        }
      );

    }


    if (closeProfileButton) {

      closeProfileButton.addEventListener(
        "click",
        () => {
          closeModal(profileModal);
        }
      );

    }


    if (closeFileButton) {

      closeFileButton.addEventListener(
        "click",
        () => {
          closeModal(fileModal);
        }
      );

    }


    [
      settingsModal,
      profileModal,
      fileModal
    ].forEach((modal) => {

      if (!modal) {
        return;
      }


      modal.addEventListener(
        "click",
        (event) => {

          if (event.target === modal) {
            closeModal(modal);
          }

        }
      );

    });

  }


  function openModal(modal) {

    if (!modal) {
      return;
    }

    modal.hidden = false;

    document.body.style.overflow = "hidden";

  }


  function closeModal(modal) {

    if (!modal) {
      return;
    }

    modal.hidden = true;

    if (
      settingsModal.hidden &&
      profileModal.hidden &&
      fileModal.hidden
    ) {
      document.body.style.overflow = "";
    }

  }


  /* =======================================================
     SETTINGS
  ======================================================== */

  function setupSettings() {

    if (enterToSend) {

      enterToSend.addEventListener(
        "change",
        () => {

          settings.enterToSend =
            enterToSend.checked;

          saveSettings();

          showToast(
            settings.enterToSend
              ? "Enter to send enabled."
              : "Enter to send disabled."
          );

        }
      );

    }


    if (soundEffects) {

      soundEffects.addEventListener(
        "change",
        () => {

          settings.soundEffects =
            soundEffects.checked;

          saveSettings();

        }
      );

    }


    if (autoSpeak) {

      autoSpeak.addEventListener(
        "change",
        () => {

          settings.autoSpeak =
            autoSpeak.checked;

          saveSettings();

          showToast(
            settings.autoSpeak
              ? "Auto voice enabled."
              : "Auto voice disabled."
          );

        }
      );

    }


    if (saveSessions) {

      saveSessions.addEventListener(
        "change",
        () => {

          settings.saveSessions =
            saveSessions.checked;

          saveSettings();

        }
      );

    }

  }


  function loadSettings() {

    try {

      const saved =
        localStorage.getItem(
          "stuckzAI_settings"
        );


      if (saved) {

        const parsed =
          JSON.parse(saved);

        settings = {
          ...settings,
          ...parsed
        };

      }

    } catch (error) {

      console.warn(
        "Could not load settings:",
        error
      );

    }


    if (enterToSend) {
      enterToSend.checked =
        settings.enterToSend;
    }

    if (soundEffects) {
      soundEffects.checked =
        settings.soundEffects;
    }

    if (autoSpeak) {
      autoSpeak.checked =
        settings.autoSpeak;
    }

    if (saveSessions) {
      saveSessions.checked =
        settings.saveSessions;
    }

  }


  function saveSettings() {

    try {

      localStorage.setItem(
        "stuckzAI_settings",
        JSON.stringify(settings)
      );

    } catch (error) {

      console.warn(
        "Could not save settings:",
        error
      );

    }

  }


  /* =======================================================
     TOOLS
  ======================================================== */

  function setupTools() {

    const tools =
      document.querySelectorAll(
        ".tool-card"
      );


    tools.forEach((tool) => {

      tool.addEventListener(
        "click",
        () => {

          const type =
            tool.dataset.tool;


          switch (type) {

            case "voice":
              startListening();
              break;


            case "text":
              messageInput.focus();
              showToast("Text mode active.");
              break;


            case "vision":
              fileInput.click();
              showToast("Select an image.");
              break;


            case "files":
              fileInput.click();
              break;


            case "tools":
              showToast(
                "Tools workspace is ready for backend integrations."
              );
              break;


            case "memory":
              showToast(
                "Session memory is currently stored locally."
              );
              break;


            default:
              showToast("Tool selected.");

          }

        }
      );

    });

  }


  /* =======================================================
     THEME
  ======================================================== */

  function setupTheme() {

    if (!themeButton) {
      return;
    }


    themeButton.addEventListener(
      "click",
      () => {

        app.classList.toggle(
          "soft-mode"
        );


        showToast(
          "STUCKZ visual mode updated."
        );

      }
    );

  }


  /* =======================================================
     MOBILE
  ======================================================== */

  function setupMobile() {

    if (mobileSessionsButton) {

      mobileSessionsButton.addEventListener(
        "click",
        () => {

          sessionsPanel.classList.add(
            "open"
          );

          mobileOverlay.hidden = false;

        }
      );

    }


    if (mobileOverlay) {

      mobileOverlay.addEventListener(
        "click",
        closeMobileSessions
      );

    }


    if (mobileSettingsButton) {

      mobileSettingsButton.addEventListener(
        "click",
        () => {
          openModal(settingsModal);
        }
      );

    }

  }


  function closeMobileSessions() {

    if (sessionsPanel) {
      sessionsPanel.classList.remove(
        "open"
      );
    }

    if (mobileOverlay) {
      mobileOverlay.hidden = true;
    }

  }


  /* =======================================================
     CONTEXT PANEL
  ======================================================== */

  function setupContextPanel() {

    if (!closeContextButton) {
      return;
    }


    closeContextButton.addEventListener(
      "click",
      () => {

        if (contextPanel) {

          contextPanel.style.display =
            "none";

        }

        showToast(
          "Workspace panel closed."
        );

      }
    );

  }


  /* =======================================================
     KEYBOARD
  ======================================================== */

  function setupKeyboard() {

    document.addEventListener(
      "keydown",
      (event) => {

        /* Escape */

        if (event.key === "Escape") {

          closeModal(settingsModal);
          closeModal(profileModal);
          closeModal(fileModal);

          closeMobileSessions();

          return;
        }


        /* Ctrl/Cmd + K */

        if (
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "k"
        ) {

          event.preventDefault();

          messageInput.focus();

          return;
        }


        /* Ctrl/Cmd + Shift + V */

        if (
          (event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          event.key.toLowerCase() === "v"
        ) {

          event.preventDefault();

          startListening();

        }

      }
    );

  }


  /* =======================================================
     UI HELPERS
  ======================================================== */

  function updateUI() {

    updateMessageCount();

    updateFileCount();

  }


  function updateMessageCount() {

    if (messageCount) {
      messageCount.textContent =
        totalMessages;
    }

  }


  function autoResizeTextarea() {

    if (!messageInput) {
      return;
    }


    messageInput.style.height =
      "auto";


    messageInput.style.height =
      Math.min(
        messageInput.scrollHeight,
        140
      ) + "px";

  }


  function copyText(text) {

    if (
      navigator.clipboard &&
      navigator.clipboard.writeText
    ) {

      navigator.clipboard
        .writeText(text)
        .then(() => {
          showToast("Copied to clipboard.");
        })
        .catch(() => {
          fallbackCopy(text);
        });

    } else {

      fallbackCopy(text);

    }

  }


  function fallbackCopy(text) {

    const textarea =
      document.createElement("textarea");

    textarea.value = text;

    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.select();

    try {

      document.execCommand("copy");

      showToast("Copied to clipboard.");

    } catch (error) {

      showToast("Could not copy text.");

    }

    textarea.remove();

  }


  function showToast(message) {

    if (!toast || !toastMessage) {
      return;
    }


    clearTimeout(toastTimer);


    toastMessage.textContent =
      message;


    toast.hidden = false;


    toastTimer = setTimeout(
      () => {
        toast.hidden = true;
      },
      2400
    );

  }


  function wait(ms) {

    return new Promise(
      (resolve) => {
        setTimeout(resolve, ms);
      }
    );

  }


  /* =======================================================
     LOAD VOICES
  ======================================================== */

  if ("speechSynthesis" in window) {

    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };

  }


  /* =======================================================
     BEFORE UNLOAD
  ======================================================== */

  window.addEventListener(
    "beforeunload",
    () => {

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      if (recognition) {

        try {
          recognition.stop();
        } catch (error) {
          /* ignore */
        }

      }

    }
  );


  /* =======================================================
     READY
  ======================================================== */

  console.log(
    "%c STUCKZ AI ",
    "background:#d6b56a;color:#0b0b0a;font-weight:bold;padding:6px 10px;border-radius:5px;",
    "Frontend initialized successfully."
  );

});