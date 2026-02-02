(function() {
  let tasks = [];
  
  let timerInterval;
  let timerTime = 0; 
  let isTimerRunning = false;
  let timerSessionCount = 0;
  let focusTime = 0;
  let completedTasksCount = 0;
  let currentSessionStartTime = 0;
  let userName = "";
  let waterIntake = 0; 
  let waterGoal = 12; 
  const quotes = [{
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
    },
    {
      text: "Innovation distinguishes between a leader and a follower.",
      author: "Steve Jobs",
    },
    {
      text: "Life is what happens to you while you're busy making other plans.",
      author: "John Lennon",
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
    },
    {
      text: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson",
    },
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
    },
    {
      text: "Life is 10% what happens to you and 90% how you react to it.",
      author: "Charles R. Swindoll",
    },
    {
      text: "Your time is limited, don't waste it living someone else's life.",
      author: "Steve Jobs",
    },
    {
      text: "The best time to plant a tree was 20 years ago. The second best time is now.",
      author: "Chinese Proverb",
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
    },
    {
      text: "It does not matter how slowly you go as long as you do not stop.",
      author: "Confucius",
    },
    {
      text: "Everything you've ever wanted is on the other side of fear.",
      author: "George Addair",
    },
    {
      text: "Success is not how high you have climbed, but how you make a positive difference to the world.",
      author: "Roy T. Bennett",
    },
    {
      text: "Don't be afraid to give up the good to go for the great.",
      author: "John D. Rockefeller",
    },
  ];

  
  document.addEventListener("DOMContentLoaded", function() {
    
    loadSettings();
    loadTasks();
    loadNotes();

    checkUserName(); 
    updateClock();
    updateGreeting();
    displayRandomQuote();
    generateCalendar();
    updateStats();
    updateTimerDisplay();
    initWaterTracker();

    setupEventListeners();

    setInterval(updateCountdown, 1000);
    setInterval(updateClock, 1000);
    setInterval(updateGreeting, 60000);
  });

  // --- LOGIN LOGIC START ---
  function handleLogin() {
    // Get values from input fields
    const userInput = document.getElementById('username').value.trim();
    // Password is now optional/ignored for validation as per request
    const errorMsg = document.getElementById('login-error');

    // Check if username is provided (validation: strictly non-empty)
    if (userInput.length > 0) {
        // Update the global userName variable with the input
        userName = userInput;
        
        // Save the new name and update the dashboard greeting
        saveSettings();
        updateGreeting();

        // UI Logic: Hide Login, Show Dashboard
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('main-dashboard').style.display = 'block';
        
        // Re-trigger animations for the header
        const header = document.querySelector('.header');
        if(header) {
            header.style.animation = 'none';
            header.offsetHeight; /* trigger reflow */
            header.style.animation = 'slideInDown 0.8s ease-out';
        }
    } else {
        // Show Error if name is empty
        errorMsg.style.display = 'block';
        errorMsg.innerText = "Please enter your name"; // Customized error message
        
        // Shake animation for login card
        const card = document.querySelector('.login-card');
        if(card) {
            card.style.animation = 'none';
            card.offsetHeight; 
            card.style.animation = 'shake 0.4s ease-in-out';
        }
    }
  }
  // --- LOGIN LOGIC END ---
  
  
  function checkUserName() {
    if (!userName) {
      showNameModal();
    }
  }

  // New function to show name input modal
  function showNameModal() {
    // Create modal overlay
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.innerHTML = `
              <div class="modal-content">
                  <h2>Welcome to Your Productivity Dashboard!</h2>
                  <p>Please enter your name to get started:</p>
                  <input type="text" id="nameInput" placeholder="Enter your name..." maxlength="30">
                  <button class="btn modal-btn" id="saveNameBtn">Get Started</button>
              </div>
          `;
    document.body.appendChild(modalOverlay);

    setTimeout(() => {
      document.getElementById("nameInput").focus();
    }, 100);

    document
      .getElementById("nameInput")
      .addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
          saveName();
        }
      });

    document.getElementById("saveNameBtn").addEventListener("click", saveName);
  }

  // New function to save username
  function saveName() {
    const nameInput = document.getElementById("nameInput");
    const name = nameInput.value.trim();

    if (name) {
      userName = name;
      // Remove modal
      const modalOverlay = document.querySelector(".modal-overlay");
      if (modalOverlay) {
        modalOverlay.remove();
      }
      updateGreeting();
      saveSettings();
    } else {
      // Show error styling
      nameInput.style.borderColor = "#e74c3c";
      nameInput.placeholder = "Please enter your name";
      setTimeout(() => {
        nameInput.style.borderColor = "";
        nameInput.placeholder = "Enter your name...";
      }, 2000);
    }
  }

  // New function to change username
  function changeUserName() {
    // Using custom prompt
    showCustomPrompt("Enter your new name:", userName, (newName) => {
        if (newName && newName.trim()) {
            userName = newName.trim();
            updateGreeting();
            saveSettings();
        }
    });
  }

  function setupEventListeners() {
    // --- Login Event Listeners ---
    const passField = document.getElementById('password');
    if (passField) {
        passField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    
    // Add listener for Username field as well (Enter key support)
    const userField = document.getElementById('username');
    if (userField) {
        userField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }

    // Dark mode toggle
    document
      .getElementById("darkModeToggle")
      .addEventListener("click", toggleDarkMode);

    // Quote refresh
    document
      .getElementById("refreshQuote")
      .addEventListener("click", displayRandomQuote);

    // Save all
    document.getElementById("saveAll").addEventListener("click", saveAll);

    // Timer controls
    document
      .getElementById("startTimer")
      .addEventListener("click", startTimer);
    document
      .getElementById("pauseTimer")
      .addEventListener("click", pauseTimer);
    document
      .getElementById("resetTimer")
      .addEventListener("click", resetTimer);

    // Task management
    document.getElementById("addTask").addEventListener("click", addTask);
    document
      .getElementById("taskInput")
      .addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
          addTask();
        }
      });

    // Notes auto-save (debounce for performance)
    let notesTimeout;
    document
      .getElementById("notesArea")
      .addEventListener("input", () => {
        clearTimeout(notesTimeout);
        notesTimeout = setTimeout(saveNotes, 500); // Save 500ms after user stops typing
      });

    // Event countdown
    document
      .getElementById("eventDate")
      .addEventListener("change", updateCountdown);

    // Username change (click on greeting)
    document
      .getElementById("greeting")
      .addEventListener("click", changeUserName);
    document.getElementById("greeting").style.cursor = "pointer";
    document.getElementById("greeting").title = "Click to change name";

    // Water tracker controls
    document.getElementById("addWater").addEventListener("click", addWater);
    document
      .getElementById("resetWater")
      .addEventListener("click", resetWater);
  }

  // Clock functionality
  function updateClock() {
    const now = new Date();
    // Using toLocaleTimeString for proper formatting
    const time = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    document.getElementById("clock").textContent = time;
  }

  function updateGreeting() {
    const hour = new Date().getHours();
    const greetingEl = document.getElementById("greeting");
    const displayName = userName || "User";

    if (hour < 12) {
      greetingEl.textContent = `Good Morning, ${displayName}!`;
    } else if (hour < 17) {
      greetingEl.textContent = `Good Afternoon, ${displayName}!`;
    } else {
      greetingEl.textContent = `Good Evening, ${displayName}!`;
    }
  }

  // Dark mode toggle
  function toggleDarkMode() {
    document.body.classList.toggle("light-mode"); // We toggle 'light-mode' class
    const isLight = document.body.classList.contains("light-mode");
    const button = document.getElementById("darkModeToggle");
    button.textContent = isLight ? "🌙 Dark Mode" : "☀️ Light Mode"; // Icons reversed
    saveSettings();
  }

  // Quote functionality
  function displayRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    document.getElementById("quoteText").textContent = `"${quote.text}"`;
    document.getElementById(
      "quoteAuthor"
    ).textContent = `- ${quote.author}`;
  }

  // Task management
  function addTask() {
    const taskInput = document.getElementById("taskInput");
    const taskPriority = document.getElementById("taskPriority");
    const taskText = taskInput.value.trim();

    if (taskText) {
      const task = {
        id: Date.now(),
        text: taskText,
        priority: taskPriority.value,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      tasks.push(task);
      taskInput.value = "";
      saveTasks();
      renderTasks();
      updateProgress();
      updateStats();
    }
  }

  function toggleTask(id) {
    tasks = tasks.map((task) => {
      if (task.id === id) {
        // Note: completedTasksCount is recalculated in updateStats(), so no need to increment/decrement here
        return { ...task,
          completed: !task.completed
        };
      }
      return task;
    });
    saveTasks();
    renderTasks();
    updateProgress();
    updateStats();
  }

  function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
    updateProgress();
    updateStats();
  }

  function renderTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    // Sort tasks: incomplete high -> medium -> low, then completed
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;

      const priorityOrder = {
        high: 0,
        medium: 1,
        low: 2
      };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return new Date(a.createdAt) - new Date(b.createdAt); // Oldest first
    });


    sortedTasks.forEach((task) => {
      const taskItem = document.createElement("div");
      taskItem.className = `task-item ${task.completed ? "completed" : ""
          } ${task.priority}-priority`;
      taskItem.innerHTML = `
                    <div style="display: flex; align-items: center; overflow: hidden; margin-right: 10px; flex: 1;">
                        <input type="checkbox" ${task.completed ? "checked" : ""
          } 
                               onchange="toggleTask(${task.id})">
                        <span style="margin-left: 10px; word-break: break-word;">${task.text}</span>
                    </div>
                    <div class="task-actions">
                        <button class="btn" style="background: #e74c3c; color: white; padding: 5px 10px; font-size: 12px; box-shadow: none;" 
                                onclick="deleteTask(${task.id})">Delete</button>
                    </div>
                `;
      taskList.appendChild(taskItem);
    });
  }

  function updateProgress() {
    const completed = tasks.filter((task) => task.completed).length;
    const total = tasks.length;
    const progress =
      total > 0 ? (completed / total) * 100 : 0;
    const progressFill = document.getElementById("progressFill");
    progressFill.style.width = `${progress}%`;
    progressFill.textContent = total > 0 ? `${Math.round(progress)}%` : "";
  }

  // Stopwatch functionality
  function startTimer() {
    if (!isTimerRunning) {
      isTimerRunning = true;
      document.getElementById("startTimer").textContent = "▶️ Running...";
      document.getElementById("pauseTimer").textContent = "⏸️ Pause";
      currentSessionStartTime = timerTime;
      timerInterval = setInterval(() => {
        timerTime++;
        updateTimerDisplay();
      }, 1000);
    }
  }

  function pauseTimer() {
    if (isTimerRunning) {
      clearInterval(timerInterval);
      isTimerRunning = false;
      document.getElementById("startTimer").textContent = "▶️ Resume";
      document.getElementById("pauseTimer").textContent = "⏸️ Paused";


      // Add the session time to total focus time
      const sessionTime = timerTime - currentSessionStartTime;
      if (sessionTime > 0) {
        focusTime += Math.floor(sessionTime / 60); // Convert to minutes
        timerSessionCount++;
        updateStats();
        saveSettings();
      }
    }
  }

  function resetTimer() {
    // Pause first to save session data if it was running
    if (isTimerRunning) {
      pauseTimer();
    }

    clearInterval(timerInterval);
    isTimerRunning = false;
    timerTime = 0;
    updateTimerDisplay();
    document.getElementById("startTimer").textContent = "▶️ Start";
    document.getElementById("pauseTimer").textContent = "⏸️ Pause";
  }

  function updateTimerDisplay() {
    const hours = Math.floor(timerTime / 3600);
    const minutes = Math.floor((timerTime % 3600) / 60);
    const seconds = timerTime % 60;

    document.getElementById("timerDisplay").textContent = `${hours
        .toString()
        .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
  }

  // Water Tracker functionality
  function initWaterTracker() {
    updateWaterDisplay();
    renderWaterGlasses();
  }

  function addWater() {
    if (waterIntake < waterGoal) {
      waterIntake++;
      updateWaterDisplay();
      renderWaterGlasses();

      // Check if goal is reached
      if (waterIntake >= waterGoal) {
        const waterTracker = document.querySelector(".water-tracker");
        if (waterTracker) {
          waterTracker.classList.add("completed");
          setTimeout(() => {
            waterTracker.classList.remove("completed");
          }, 1000);
        }
      }

      saveSettings();
    }
  }

  function resetWater() {
    waterIntake = 0;
    updateWaterDisplay();
    renderWaterGlasses();
    saveSettings();
  }

  function updateWaterDisplay() {
    const waterCount = document.getElementById("waterCount");
    const waterMl = document.getElementById("waterMl");
    const waterGoalText = document.querySelector(".water-goal span");

    if (waterCount) {
      waterCount.textContent = waterIntake;
    }

    if (waterMl) {
      waterMl.textContent = `(${waterIntake * 250}ml / ${waterGoal * 250}ml)`;
    }

    if (waterGoalText) {
      if (waterIntake >= waterGoal) {
        waterGoalText.textContent = `🎉 Daily Goal Achieved! ${waterGoal} glasses`;
      } else {
        waterGoalText.textContent = `Goal: ${waterGoal} glasses (${waterGoal * 250}ml)`;
      }
    }
  }

  function renderWaterGlasses() {
    const waterGlasses = document.querySelector(".water-glasses");
    if (waterGlasses) {
      waterGlasses.innerHTML = "";

      for (let i = 0; i < waterGoal; i++) {
        const glass = document.createElement("div");
        glass.className = `glass ${i < waterIntake ? "filled" : ""}`;
        glass.textContent = "🥛";
        glass.title = `${i + 1} glass(es)`;
        glass.onclick = () => {
          // Set intake to the level clicked
          waterIntake = i + 1;
          updateWaterDisplay();
          renderWaterGlasses();
          saveSettings();
        };
        waterGlasses.appendChild(glass);
      }
    }
  }

  // Calendar functionality
  function generateCalendar() {
    const calendar = document.getElementById("calendar");
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Clear calendar
    calendar.innerHTML = "";

    // Create header
    const headerRow = calendar.insertRow();
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    daysOfWeek.forEach((day) => {
      const th = document.createElement("th");
      th.textContent = day;
      headerRow.appendChild(th);
    });

    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();

    let date = 1;
    for (let i = 0; i < 6; i++) {
      const row = calendar.insertRow();
      for (let j = 0; j < 7; j++) {
        const cell = row.insertCell();
        if (i === 0 && j < firstDay) {
          cell.textContent = "";
          cell.classList.add("other-month");
        } else if (date > daysInMonth) {
          cell.textContent = "";
          cell.classList.add("other-month");
        } else {
          cell.textContent = date;
          if (date === today.getDate()) {
            cell.classList.add("today");
          }
          date++;
        }
      }
      if (date > daysInMonth) break; // Stop adding rows if month is done
    }
  }

  // Countdown functionality
  function updateCountdown() {
    const eventDateInput = document.getElementById("eventDate");
    const countdownDisplay = document.getElementById("countdownDisplay");

    if (!eventDateInput.value) {
      countdownDisplay.textContent = "Select an event date";
      return;
    }

    const eventDate = new Date(eventDateInput.value);
    const now = new Date();
    const difference = eventDate - now;

    if (difference <= 0) {
      countdownDisplay.textContent = "Event has passed!";
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (difference % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    countdownDisplay.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  // Statistics
  function updateStats() {
    // Recalculate completed tasks count from the source of truth
    completedTasksCount = tasks.filter(task => task.completed).length;

    document.getElementById("completedTasks").textContent =
      completedTasksCount;
    document.getElementById("timerSessions").textContent =
      timerSessionCount;
    document.getElementById("focusTime").textContent = focusTime;
    document.getElementById("totalTasks").textContent = tasks.length;
  }

  // --- LocalStorage Functions ---
  function saveTasks() {
    localStorage.setItem("productivityTasks", JSON.stringify(tasks));
  }

  function loadTasks() {
    const savedTasks = localStorage.getItem("productivityTasks");
    if (savedTasks) {
      tasks = JSON.parse(savedTasks);
    }
    renderTasks();
    updateProgress();
    updateStats(); // Ensure stats are correct on load
  }

  function saveNotes() {
    const notes = document.getElementById("notesArea").value;
    localStorage.setItem("productivityNotes", notes);
  }

  function loadNotes() {
    const savedNotes = localStorage.getItem("productivityNotes");
    if (savedNotes) {
      document.getElementById("notesArea").value = savedNotes;
    }
  }

  function saveSettings() {
    const settings = {
      lightMode: document.body.classList.contains("light-mode"),
      userName: userName,
      timerSessionCount: timerSessionCount,
      focusTime: focusTime,
      waterIntake: waterIntake,
      eventDate: document.getElementById("eventDate").value
    };
    localStorage.setItem("productivitySettings", JSON.stringify(settings));
  }

  function loadSettings() {
    const savedSettings = localStorage.getItem("productivitySettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);

      if (settings.lightMode) { // Check for lightMode
        document.body.classList.add("light-mode");
        document.getElementById("darkModeToggle").textContent = "🌙 Dark Mode";
      } else {
        document.getElementById("darkModeToggle").textContent = "☀️ Light Mode";
      }

      userName = settings.userName || "";
      timerSessionCount = settings.timerSessionCount || 0;
      focusTime = settings.focusTime || 0;
      waterIntake = settings.waterIntake || 0;

      if (settings.eventDate) {
        document.getElementById("eventDate").value = settings.eventDate;
      }
    } else {
        // Default to dark mode if no settings
        document.getElementById("darkModeToggle").textContent = "☀️ Light Mode";
    }
  }

  function saveAll() {
    saveTasks();
    saveNotes();
    saveSettings();
    // Using a custom modal instead of alert
    showCustomAlert("All data saved successfully!");
  }

  // Custom alert function to avoid using window.alert()
  function showCustomAlert(message) {
    let alertOverlay = document.querySelector(".alert-overlay");
    if (alertOverlay) alertOverlay.remove(); // Remove old one if exists

    alertOverlay = document.createElement("div");
    alertOverlay.className = "modal-overlay alert-overlay"; // Reuse modal styles
    alertOverlay.style.zIndex = "2000";

    alertOverlay.innerHTML = `
            <div class="modal-content">
                <p style="font-size: 1.2rem; margin-bottom: 20px;">${message}</p>
                <button class="btn modal-btn" id="alertOkBtn">OK</button>
            </div>
        `;

    document.body.appendChild(alertOverlay);

    document.getElementById("alertOkBtn").addEventListener("click", () => {
      alertOverlay.remove();
    });
  }

  // Custom prompt function to avoid using window.prompt()
  function showCustomPrompt(message, defaultValue = "", callback) {
      let promptOverlay = document.querySelector(".prompt-overlay");
      if(promptOverlay) promptOverlay.remove();

      promptOverlay = document.createElement("div");
      promptOverlay.className = "modal-overlay prompt-overlay";
      promptOverlay.style.zIndex = "2000";

      promptOverlay.innerHTML = `
            <div class="modal-content">
                <p style="font-size: 1.2rem; margin-bottom: 20px;">${message}</p>
                <input type="text" id="promptInput" class="modal-input" value="${defaultValue}" style="color-scheme: light;">
                <button class="btn modal-btn" id="promptOkBtn">OK</button>
                <button class="btn modal-btn" id="promptCancelBtn" style="background: #777;">Cancel</button>
            </div>
      `;
      // Fix input style for light mode
      if (document.body.classList.contains('light-mode')) {
          const input = promptOverlay.querySelector('#promptInput');
          input.style.background = 'rgba(0,0,0,0.1)';
          input.style.color = '#1f2937';
          input.style.borderColor = '#ddd';
      }


      document.body.appendChild(promptOverlay);
      
      const inputEl = document.getElementById("promptInput");
      inputEl.focus();
      inputEl.select();

      document.getElementById("promptOkBtn").addEventListener("click", () => {
          callback(inputEl.value);
          promptOverlay.remove();
      });
      
      document.getElementById("promptCancelBtn").addEventListener("click", () => {
          callback(null); // Pass null on cancel
          promptOverlay.remove();
      });
      
      inputEl.addEventListener("keypress", (e) => {
          if (e.key === 'Enter') {
              callback(inputEl.value);
              promptOverlay.remove();
          }
      });
  }

  // --- FIX ---
  // Expose functions to global scope for inline event handlers
  // This makes them accessible from the `onclick` and `onchange` attributes
  window.toggleTask = toggleTask;
  window.deleteTask = deleteTask;
  // EXPOSE LOGIN FUNCTION
  window.handleLogin = handleLogin;
  
})();
// --- End of IIFE ---


// --- PART 2: NEW 3D PLEXUS ANIMATION ---
(function() {
  // Ensure Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.error("Three.js library not loaded. 3D background will not work.");
    return;
  }

  let scene, camera, renderer;
  let particles, lineMesh;
  const particlesCount = 300; // Number of particles
  const maxDistance = 100; // Max distance to draw a line
  const particlesData = [];
  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);

  const colorPalette = [
      new THREE.Color(0x3b82f6), // blue-500
      new THREE.Color(0x6366f1), // indigo-500
      new THREE.Color(0x8b5cf6), // purple-500
      new THREE.Color(0xa855f7)  // fuchsia-500
  ];

  let mouse = new THREE.Vector2(10000, 10000); // Start off-screen
  let mouseRadius = 60; // Interaction radius

  function init() {
    try {
      // --- Scene ---
      scene = new THREE.Scene();

      // --- Camera ---
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.z = 300;

      // --- Renderer ---
      const canvas = document.getElementById('bg-canvas');
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true // Make canvas transparent
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0); // Transparent background

      // --- Particles ---
      const particleGeometry = new THREE.BufferGeometry();
      const area = 500; // Spread area

      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        positions[i3] = (Math.random() - 0.5) * area * 2; // x
        positions[i3 + 1] = (Math.random() - 0.5) * area * 2; // y
        positions[i3 + 2] = (Math.random() - 0.5) * area * 2; // z

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        particlesData.push({
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            ),
            baseVelocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            ),
            numConnections: 0
        });
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const particleMaterial = new THREE.PointsMaterial({
          size: 4,
          vertexColors: true,
          blending: THREE.AdditiveBlending,
          transparent: true,
          sizeAttenuation: true,
          depthWrite: false
      });

      particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);
      
      // --- Lines ---
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = new Float32Array(particlesCount * particlesCount * 3); // Max possible lines
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
      
      const lineMaterial = new THREE.LineBasicMaterial({
          vertexColors: true,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.5,
          depthWrite: false
      });
      
      lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lineMesh);


      // --- Event Listeners ---
      window.addEventListener('resize', onWindowResize, false);
      document.addEventListener('mousemove', onMouseMove, false);
      document.addEventListener('mouseout', onMouseOut, false);


      // --- Start Animation ---
      animate();

    } catch (error) {
      console.error("Error initializing 3D background:", error);
      const canvas = document.getElementById('bg-canvas');
      if (canvas) canvas.style.display = 'none';
    }
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  
  function onMouseOut() {
    mouse.x = 10000;
    mouse.y = 10000;
  }


  function animate() {
    requestAnimationFrame(animate);

    let vertexpos = 0;
    let linepos = 0;
    
    const posAttribute = particles.geometry.getAttribute('position');
    const linePosAttribute = lineMesh.geometry.getAttribute('position');
    
    const mouseVec = new THREE.Vector3(
        (mouse.x * camera.aspect * (camera.position.z - 1)), 
        (mouse.y * (camera.position.z - 1)), 
        0
    );
    
    // Project mouse position into 3D space at z=0
    mouseVec.unproject(camera);
    mouseVec.z = 0; // We only care about x, y plane for interaction

    for (let i = 0; i < particlesCount; i++) {
        particlesData[i].numConnections = 0;
        
        const i3 = i * 3;
        
        const particlePos = new THREE.Vector3(posAttribute.array[i3], posAttribute.array[i3+1], posAttribute.array[i3+2]);
        
        // Mouse interaction (repulsion)
        const distToMouse = particlePos.distanceTo(mouseVec);
        if (distToMouse < mouseRadius) {
            const repel = new THREE.Vector3().subVectors(particlePos, mouseVec).normalize();
            repel.multiplyScalar((mouseRadius - distToMouse) * 0.05);
            particlesData[i].velocity.add( repel );
        } else {
            // Apply damping to return to base velocity
            particlesData[i].velocity.lerp(particlesData[i].baseVelocity, 0.01);
        }

        posAttribute.array[i3] += particlesData[i].velocity.x;
        posAttribute.array[i3 + 1] += particlesData[i].velocity.y;
        posAttribute.array[i3 + 2] += particlesData[i].velocity.z;

        // Keep particles within a boundary
        if (particlePos.x < -500 || particlePos.x > 500) particlesData[i].velocity.x *= -1;
        if (particlePos.y < -500 || particlePos.y > 500) particlesData[i].velocity.y *= -1;
        if (particlePos.z < -500 || particlePos.z > 500) particlesData[i].velocity.z *= -1;

    }

    // Update lines
    for (let i = 0; i < particlesCount; i++) {
        for (let j = i + 1; j < particlesCount; j++) {
            const i3 = i * 3;
            const j3 = j * 3;

            const dx = posAttribute.array[i3] - posAttribute.array[j3];
            const dy = posAttribute.array[i3 + 1] - posAttribute.array[j3 + 1];
            const dz = posAttribute.array[i3 + 2] - posAttribute.array[j3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < maxDistance) {
                particlesData[i].numConnections++;
                particlesData[j].numConnections++;

                const alpha = 1.0 - dist / maxDistance;

                linePosAttribute.array[linepos++] = posAttribute.array[i3];
                linePosAttribute.array[linepos++] = posAttribute.array[i3+1];
                linePosAttribute.array[linepos++] = posAttribute.array[i3+2];
                
                linePosAttribute.array[linepos++] = posAttribute.array[j3];
                linePosAttribute.array[linepos++] = posAttribute.array[j3+1];
                linePosAttribute.array[linepos++] = posAttribute.array[j3+2];
            }
        }
    }
    
    // Update buffer attributes
    posAttribute.needsUpdate = true;
    linePosAttribute.needsUpdate = true;
    lineMesh.geometry.setDrawRange(0, linepos / 3); // Only draw vertices we've used

    // Rotate the whole scene
    scene.rotation.y += 0.0001;
    scene.rotation.x += 0.0002;

    renderer.render(scene, camera);
  }

  // Run the init function only when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
// --- End of 3D Animation ---