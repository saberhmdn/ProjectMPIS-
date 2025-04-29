document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const loginStep = document.getElementById('login-step');
    const geolocationStep = document.getElementById('geolocation-step');
    const examStep = document.getElementById('exam-step');
    const resultsStep = document.getElementById('results-step');
    
    const loginBtn = document.getElementById('login-btn');
    const proceedBtn = document.getElementById('proceed-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitExamBtn = document.getElementById('submit-exam');
    const finishBtn = document.getElementById('finish-btn');
    
    const geolocationStatus = document.getElementById('geolocation-status');
    
    // Données de l'examen (simulées)
    let examData = {
        title: "Examen de Mathématiques",
        description: "Examen final du semestre - 2ème année MIP",
        questions: [
            {
                id: 1,
                type: "direct",
                text: "Quelle est la dérivée de f(x) = x² + 3x - 5?",
                correctAnswer: "2x + 3",
                tolerance: 10,
                points: 10,
                time: 120
            },
            {
                id: 2,
                type: "qcm",
                text: "Quelle est la capitale de la France?",
                options: [
                    { text: "Lyon", correct: false },
                    { text: "Marseille", correct: false },
                    { text: "Paris", correct: true },
                    { text: "Toulouse", correct: false }
                ],
                points: 5,
                time: 60
            }
        ]
    };
    
    // État de l'application
    let currentState = {
        currentQuestionIndex: 0,
        studentAnswers: [],
        startTime: null,
        endTime: null,
        location: null
    };
    
    // Initialisation
    document.getElementById('exam-title').textContent = examData.title;
    document.getElementById('exam-description').textContent = examData.description;
    document.getElementById('total-questions').textContent = examData.questions.length;
    
    // Gestion de la connexion
    loginBtn.addEventListener('click', function() {
        const email = document.getElementById('student-email').value;
        const password = document.getElementById('student-password').value;
        
        if (email && password) {
            loginStep.classList.add('hidden');
            geolocationStep.classList.remove('hidden');
            requestGeolocation();
        } else {
            alert("Veuillez entrer votre email et mot de passe");
        }
    });
    
    // Gestion de la géolocalisation
    function requestGeolocation() {
        if ("geolocation" in navigator) {
            geolocationStatus.innerHTML = "<p>Demande d'autorisation en cours...</p>";
            
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    currentState.location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    
                    geolocationStatus.innerHTML = `
                        <p>Localisation confirmée:</p>
                        <p>Latitude: ${currentState.location.latitude.toFixed(4)}</p>
                        <p>Longitude: ${currentState.location.longitude.toFixed(4)}</p>
                    `;
                    
                    proceedBtn.disabled = false;
                },
                function(error) {
                    let errorMessage = "Erreur de géolocalisation: ";
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += "Vous avez refusé la demande de géolocalisation.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += "Les informations de localisation ne sont pas disponibles.";
                            break;
                        case error.TIMEOUT:
                            errorMessage += "La demande de localisation a expiré.";
                            break;
                        default:
                            errorMessage += "Une erreur inconnue s'est produite.";
                    }
                    
                    geolocationStatus.innerHTML = `<p style="color: red;">${errorMessage}</p>`;
                    proceedBtn.disabled = true;
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            geolocationStatus.innerHTML = "<p style='color: red;'>La géolocalisation n'est pas supportée par votre navigateur.</p>";
            proceedBtn.disabled = false; // Permettre de continuer malgré tout
        }
    }
    
    // Commencer l'examen
    proceedBtn.addEventListener('click', function() {
        geolocationStep.classList.add('hidden');
        examStep.classList.remove('hidden');
        currentState.startTime = new Date();
        loadQuestion(0);
        startTimer();
    });
    
    // Charger une question
    function loadQuestion(index) {
        if (index < 0 || index >= examData.questions.length) return;
        
        currentState.currentQuestionIndex = index;
        const question = examData.questions[index];
        
        // Mettre à jour l'interface
        document.getElementById('current-question').textContent = index + 1;
        document.getElementById('question-text').textContent = question.text;
        
        // Masquer tous les types de réponses
        document.getElementById('direct-answer-container').classList.add('hidden');
        document.getElementById('qcm-options-container').classList.add('hidden');
        
        // Afficher le bon type de réponse
        if (question.type === "direct") {
            const directAnswerContainer = document.getElementById('direct-answer-container');
            directAnswerContainer.classList.remove('hidden');
            document.getElementById('student-answer').value = 
                currentState.studentAnswers[index]?.answer || "";
        } else {
            const qcmContainer = document.getElementById('qcm-options-container');
            qcmContainer.classList.remove('hidden');
            qcmContainer.innerHTML = "";
            
            question.options.forEach((option, i) => {
                const optionElement = document.createElement('div');
                optionElement.className = "qcm-option";
                optionElement.innerHTML = `
                    <input type="checkbox" id="option-${index}-${i}" 
                        ${currentState.studentAnswers[index]?.selectedOptions?.includes(i) ? "checked" : ""}>
                    <label for="option-${index}-${i}">${option.text}</label>
                `;
                qcmContainer.appendChild(optionElement);
            });
        }
        
        // Gérer les boutons de navigation
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === examData.questions.length - 1;
        submitExamBtn.classList.toggle('hidden', index !== examData.questions.length - 1);
    }
    
    // Navigation entre les questions
    prevBtn.addEventListener('click', function() {
        saveCurrentAnswer();
        loadQuestion(currentState.currentQuestionIndex - 1);
    });
    
    nextBtn.addEventListener('click', function() {
        saveCurrentAnswer();
        loadQuestion(currentState.currentQuestionIndex + 1);
    });
    
    // Sauvegarder la réponse courante
    function saveCurrentAnswer() {
        const index = currentState.currentQuestionIndex;
        const question = examData.questions[index];
        
        if (question.type === "direct") {
            const answer = document.getElementById('student-answer').value;
            currentState.studentAnswers[index] = { answer };
        } else {
            const options = Array.from(document.querySelectorAll(`#qcm-options-container input[type="checkbox"]`));
            const selectedOptions = options
                .map((option, i) => option.checked ? i : null)
                .filter(i => i !== null);
            
            currentState.studentAnswers[index] = { selectedOptions };
        }
    }
    
    // Timer
    let timerInterval;
    function startTimer() {
        let seconds = 0;
        updateTimerDisplay(seconds);
        
        timerInterval = setInterval(function() {
            seconds++;
            updateTimerDisplay(seconds);
        }, 1000);
    }
    
    function updateTimerDisplay(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('timer').textContent = 
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Soumettre l'examen
    submitExamBtn.addEventListener('click', function() {
        saveCurrentAnswer();
        currentState.endTime = new Date();
        clearInterval(timerInterval);
        showResults();
    });
    
    // Afficher les résultats
    function showResults() {
        examStep.classList.add('hidden');
        resultsStep.classList.remove('hidden');
        
        // Calculer le score
        let correctCount = 0;
        examData.questions.forEach((question, index) => {
            const studentAnswer = currentState.studentAnswers[index];
            
            if (question.type === "direct" && studentAnswer?.answer) {
                // Comparaison avec tolérance (simplifiée)
                const normalizedCorrect = question.correctAnswer.toLowerCase().trim();
                const normalizedStudent = studentAnswer.answer.toLowerCase().trim();
                
                if (normalizedStudent === normalizedCorrect) {
                    correctCount++;
                }
            } else if (question.type === "qcm" && studentAnswer?.selectedOptions) {
                // Vérifier si toutes les bonnes réponses sont sélectionnées et pas de mauvaises
                const correctOptions = question.options
                    .map((option, i) => option.correct ? i : null)
                    .filter(i => i !== null);
                
                const isCorrect = correctOptions.length === studentAnswer.selectedOptions.length &&
                    correctOptions.every(i => studentAnswer.selectedOptions.includes(i));
                
                if (isCorrect) correctCount++;
            }
        });
        
        const score = Math.round((correctCount / examData.questions.length) * 100);
        
        // Afficher les résultats
        document.getElementById('total-questions-result').textContent = examData.questions.length;
        document.getElementById('correct-answers').textContent = correctCount;
        
        const timeTaken = Math.floor((currentState.endTime - currentState.startTime) / 1000);
        const mins = Math.floor(timeTaken / 60);
        const secs = timeTaken % 60;
        document.getElementById('time-taken').textContent = 
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        // Animation du score
        animateScore(score);
    }
    
    // Animation du cercle de score
    function animateScore(score) {
        const circle = document.getElementById('score-circle');
        const text = document.getElementById('score-text');
        
        let current = 0;
        const interval = setInterval(() => {
            if (current >= score) {
                clearInterval(interval);
                return;
            }
            
            current++;
            circle.setAttribute('stroke-dasharray', `${current}, 100`);
            text.textContent = current;
            
            // Changer le message en fonction du score
            let message = "Examen terminé!";
            if (current >= 80) message = "Excellent travail!";
            else if (current >= 50) message = "Bon travail!";
            else message = "Vous pouvez faire mieux!";
            
            document.getElementById('result-message').textContent = message;
        }, 20);
    }
    
    // Terminer l'examen
    finishBtn.addEventListener('click', function() {
        // Ici, vous pourriez rediriger vers la page d'accueil
        alert("Examen terminé. Vous allez être redirigé vers l'accueil.");
        // window.location.href = "index.html";
    });
    
    // Simuler un lien d'inscription
    document.getElementById('signup-link').addEventListener('click', function(e) {
        e.preventDefault();
        alert("Fonctionnalité d'inscription non implémentée dans cette démo");
    });
});