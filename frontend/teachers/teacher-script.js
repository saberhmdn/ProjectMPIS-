import { fetchTeacherExams } from '../../assets/js/api.js';

// Vérification de session
if (!localStorage.getItem('authToken')) {
    window.location.href = '../auth/login.html';
}

// [Le reste du code existant...]
document.addEventListener('DOMContentLoaded', function() {
    // Toggle between question types
    const typeButtons = document.querySelectorAll('.question-type-btn');
    const questionForms = document.querySelectorAll('.question-form');
    
    typeButtons.forEach(button => {
        button.addEventListener('click', () => {
            typeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const type = button.dataset.type;
            questionForms.forEach(form => form.classList.add('hidden'));
            document.getElementById(`${type}-question-form`).classList.remove('hidden');
        });
    });
    
    // Add new QCM option
    const addOptionBtn = document.querySelector('.add-option-btn');
    if (addOptionBtn) {
        addOptionBtn.addEventListener('click', addNewQcmOption);
    }
    
    // Initialize existing remove buttons
    document.querySelectorAll('.remove-option-btn').forEach(btn => {
        btn.addEventListener('click', removeQcmOption);
    });
    
    // Copy exam link
    const copyBtn = document.querySelector('.copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyExamLink);
    }
    
    // Initialize question management buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', editQuestion);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteQuestion);
    });
    
    // Form submission handlers
    document.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', saveQuestion);
    });
    
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', resetQuestionForm);
    });
    
    // Exam action buttons
    const previewBtn = document.querySelector('.preview-btn');
    if (previewBtn) {
        previewBtn.addEventListener('click', previewExam);
    }
    
    const publishBtn = document.querySelector('.publish-btn');
    if (publishBtn) {
        publishBtn.addEventListener('click', publishExam);
    }
});

function addNewQcmOption() {
    const optionsContainer = document.querySelector('.qcm-options');
    const optionCount = optionsContainer.children.length + 1;
    
    const newOption = document.createElement('div');
    newOption.className = 'qcm-option';
    newOption.innerHTML = `
        <input type="checkbox" id="option${optionCount}-correct">
        <input type="text" id="option${optionCount}" placeholder="Option ${optionCount}">
        <button class="remove-option-btn">&times;</button>
    `;
    
    optionsContainer.appendChild(newOption);
    
    // Add event listener to new remove button
    newOption.querySelector('.remove-option-btn').addEventListener('click', removeQcmOption);
}

function removeQcmOption(event) {
    const optionToRemove = event.target.closest('.qcm-option');
    if (optionToRemove) {
        optionToRemove.remove();
    }
}

function copyExamLink() {
    const linkInput = document.getElementById('exam-link');
    linkInput.select();
    document.execCommand('copy');
    
    // Show copied feedback
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copié!';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}

function editQuestion(event) {
    const questionItem = event.target.closest('.question-item');
    // Implementation would depend on your data structure
    console.log('Edit question:', questionItem);
}

function deleteQuestion(event) {
    const questionItem = event.target.closest('.question-item');
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question?')) {
        questionItem.remove();
    }
}

function saveQuestion(event) {
    event.preventDefault();
    const form = event.target.closest('.question-form');
    // Implementation would depend on your data structure
    console.log('Save question from form:', form);
    resetQuestionForm();
}

function resetQuestionForm() {
    // Clear all form fields
    document.querySelectorAll('.question-form input, .question-form textarea').forEach(field => {
        field.value = '';
    });
    
    // Reset QCM options to default 2
    const qcmOptions = document.querySelector('.qcm-options');
    qcmOptions.innerHTML = `
        <div class="qcm-option">
            <input type="checkbox" id="option1-correct">
            <input type="text" id="option1" placeholder="Option 1">
            <button class="remove-option-btn">&times;</button>
        </div>
        <div class="qcm-option">
            <input type="checkbox" id="option2-correct">
            <input type="text" id="option2" placeholder="Option 2">
            <button class="remove-option-btn">&times;</button>
        </div>
    `;
    
    // Reinitialize remove buttons
    document.querySelectorAll('.remove-option-btn').forEach(btn => {
        btn.addEventListener('click', removeQcmOption);
    });
}

function previewExam() {
    // Implementation would depend on your application
    console.log('Preview exam');
}

function publishExam() {
    // Implementation would depend on your application
    if (confirm('Êtes-vous sûr de vouloir publier cet examen?')) {
        console.log('Publish exam');
    }
}
// Ajouter en haut du fichier
let currentExam = {
    title: '',
    description: '',
    targetAudience: '',
    link: 'https://educonnect.com/exam/' + generateRandomId(),
    questions: []
};

// Fonction pour générer un ID aléatoire
function generateRandomId() {
    return Math.random().toString(36).substring(2, 10);
}

// Modifier la fonction saveQuestion
function saveQuestion(event) {
    event.preventDefault();
    const form = event.target.closest('.question-form');
    const isDirectQuestion = form.id === 'direct-question-form';
    
    const question = {
        id: Date.now().toString(),
        type: isDirectQuestion ? 'direct' : 'qcm',
        text: isDirectQuestion 
            ? document.getElementById('question-text').value
            : document.getElementById('qcm-question-text').value,
        points: isDirectQuestion
            ? parseInt(document.getElementById('question-points').value)
            : parseInt(document.getElementById('qcm-points').value),
        time: isDirectQuestion
            ? parseInt(document.getElementById('question-time').value)
            : parseInt(document.getElementById('qcm-time').value),
        media: [] // À implémenter pour les médias
    };

    if (isDirectQuestion) {
        question.correctAnswer = document.getElementById('correct-answer').value;
        question.tolerance = parseInt(document.getElementById('tolerance-rate').value);
    } else {
        question.options = [];
        document.querySelectorAll('.qcm-option').forEach((option, index) => {
            question.options.push({
                text: option.querySelector('input[type="text"]').value,
                isCorrect: option.querySelector('input[type="checkbox"]').checked
            });
        });
    }

    currentExam.questions.push(question);
    updateQuestionsList();
    resetQuestionForm();
    alert('Question enregistrée avec succès!');
}

// Nouvelle fonction pour mettre à jour la liste des questions
function updateQuestionsList() {
    const questionsList = document.querySelector('.questions-list');
    questionsList.innerHTML = '<h3>Questions ajoutées</h3>';
    
    currentExam.questions.forEach(question => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.dataset.id = question.id;
        
        let metaInfo = '';
        if (question.type === 'direct') {
            metaInfo = `
                <span>${question.points} points</span>
                <span>${question.time} secondes</span>
                <span>Tolérance: ${question.tolerance}%</span>
            `;
        } else {
            metaInfo = `
                <span>${question.points} points</span>
                <span>${question.time} secondes</span>
            `;
        }
        
        questionItem.innerHTML = `
            <div class="question-info">
                <span class="question-type">${question.type === 'direct' ? 'Directe' : 'QCM'}</span>
                <p>${question.text}</p>
                <div class="question-meta">
                    ${metaInfo}
                </div>
            </div>
            <div class="question-actions">
                <button class="edit-btn">Modifier</button>
                <button class="delete-btn">Supprimer</button>
            </div>
        `;
        
        questionsList.appendChild(questionItem);
        
        // Ajouter les écouteurs d'événements
        questionItem.querySelector('.edit-btn').addEventListener('click', editQuestion);
        questionItem.querySelector('.delete-btn').addEventListener('click', deleteQuestion);
    });
}

// Modifier la fonction publishExam
function publishExam() {
    // Mettre à jour les infos de l'examen
    currentExam.title = document.getElementById('exam-title').value;
    currentExam.description = document.getElementById('exam-description').value;
    currentExam.targetAudience = document.getElementById('target-audience').value;
    
    if (!currentExam.title || !currentExam.targetAudience) {
        alert('Veuillez remplir le titre et le public ciblé avant de publier.');
        return;
    }
    
    if (currentExam.questions.length === 0) {
        alert('Veuillez ajouter au moins une question avant de publier.');
        return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir publier cet examen?')) {
        // Ici, vous enverriez normalement les données au serveur
        console.log('Examen publié:', currentExam);
        
        // Réinitialiser pour un nouvel examen
        resetExamForm();
        alert('Examen publié avec succès! Un nouveau formulaire est prêt pour votre prochain examen.');
    }
}

// Nouvelle fonction pour réinitialiser le formulaire d'examen
function resetExamForm() {
    document.getElementById('exam-title').value = '';
    document.getElementById('exam-description').value = '';
    document.getElementById('target-audience').value = '';
    document.querySelector('.questions-list').innerHTML = '<h3>Questions ajoutées</h3>';
    
    // Générer un nouveau lien unique
    currentExam = {
        title: '',
        description: '',
        targetAudience: '',
        link: 'https://educonnect.com/exam/' + generateRandomId(),
        questions: []
    };
    document.getElementById('exam-link').value = currentExam.link;
}