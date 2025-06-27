document.addEventListener('DOMContentLoaded', () => {
    const colorPatch = document.getElementById('color-patch');
    const answerButtons = [
        document.getElementById('btn0'),
        document.getElementById('btn1'),
        document.getElementById('btn2'),
        document.getElementById('btn3')
    ];
    const feedbackText = document.getElementById('feedback-text');
    const nextButton = document.getElementById('next-btn');
    const scoreDisplay = document.getElementById('score');
    const totalQuestionsDisplay = document.getElementById('total-questions');
    
    const quizContainer = document.querySelector('.quiz-container');
    const resultsContainer = document.getElementById('results-container');
    const finalScoreDisplay = document.getElementById('final-score');
    const finalTotalDisplay = document.getElementById('final-total');
    const restartButton = document.getElementById('restart-btn');

    let allColors = [];
    let quizColors = [];
    let currentQuestionIndex = 0;
    let score = 0;
    const QUIZ_LENGTH = 100;
    let correctAnswer = null;
    let answered = false;

    async function loadColors() {
        try {
            const response = await fetch('colors.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allColors = await response.json();
            if (allColors.length === 0) {
                feedbackText.textContent = "Error: No colors loaded. Please check colors.json.";
                nextButton.disabled = true;
                return;
            }
            totalQuestionsDisplay.textContent = QUIZ_LENGTH;
            startGame();
        } catch (error) {
            console.error("Error loading colors:", error);
            feedbackText.textContent = "Failed to load colors. Please try refreshing.";
            nextButton.disabled = true;
        }
    }

    function startGame() {
        currentQuestionIndex = 0;
        score = 0;
        answered = false;
        scoreDisplay.textContent = score;
        quizColors = selectRandomColors(allColors, QUIZ_LENGTH);
        if (quizColors.length < QUIZ_LENGTH && quizColors.length < 4) { // Need at least 4 for options
             feedbackText.textContent = `Warning: Not enough unique colors loaded (${quizColors.length}) to run a full quiz of ${QUIZ_LENGTH} questions with 4 options. Please check colors.json.`;
             nextButton.disabled = true;
             return;
        }
        if (quizColors.length < QUIZ_LENGTH) {
            totalQuestionsDisplay.textContent = quizColors.length; // Adjust total if not enough colors
        } else {
            totalQuestionsDisplay.textContent = QUIZ_LENGTH;
        }
        resultsContainer.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        loadQuestion();
    }

    function selectRandomColors(sourceArray, count) {
        const shuffled = [...sourceArray].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    function loadQuestion() {
        if (currentQuestionIndex >= quizColors.length || currentQuestionIndex >= QUIZ_LENGTH) {
            endQuiz();
            return;
        }

        answered = false;
        feedbackText.textContent = '';
        nextButton.textContent = 'Next';
        nextButton.disabled = true; 

        correctAnswer = quizColors[currentQuestionIndex];
        colorPatch.style.backgroundColor = correctAnswer.hex;

        // Get three distractor color names
        const distractors = [];
        const tempColorList = allColors.filter(color => color.name !== correctAnswer.name);
        
        while (distractors.length < 3 && tempColorList.length > 0) {
            const randomIndex = Math.floor(Math.random() * tempColorList.length);
            const distractor = tempColorList.splice(randomIndex, 1)[0];
            if (distractor.name !== correctAnswer.name) { // Ensure distractor is not the same as correct answer
                distractors.push(distractor.name);
            }
        }
        // If not enough unique distractors from allColors, fill with placeholders or repeat (less ideal)
        while (distractors.length < 3) {
            distractors.push(`Placeholder ${distractors.length + 1}`); // Should ideally not happen with enough colors
        }

        const options = [correctAnswer.name, ...distractors];
        const shuffledOptions = options.sort(() => 0.5 - Math.random());

        answerButtons.forEach((button, index) => {
            button.textContent = shuffledOptions[index];
            button.disabled = false;
            button.classList.remove('correct', 'incorrect');
        });
    }

    function handleAnswer(selectedButton) {
        if (answered) return;
        answered = true;
        nextButton.disabled = false;

        const selectedAnswer = selectedButton.textContent;
        if (selectedAnswer === correctAnswer.name) {
            score++;
            scoreDisplay.textContent = score;
            selectedButton.classList.add('correct');
            feedbackText.textContent = "Correct!";
            feedbackText.style.color = 'green';
        } else {
            selectedButton.classList.add('incorrect');
            feedbackText.textContent = `Wrong! The correct answer was ${correctAnswer.name}.`;
            feedbackText.style.color = 'red';
            // Highlight the correct answer
            answerButtons.forEach(btn => {
                if (btn.textContent === correctAnswer.name) {
                    btn.classList.add('correct');
                }
            });
        }
        
        answerButtons.forEach(button => button.disabled = true); // Disable all buttons after an answer

        if (currentQuestionIndex === (Math.min(QUIZ_LENGTH, quizColors.length) - 1) ) {
            nextButton.textContent = 'Show Results';
        }
    }

    function endQuiz() {
        quizContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        finalScoreDisplay.textContent = score;
        finalTotalDisplay.textContent = Math.min(QUIZ_LENGTH, quizColors.length);
    }

    answerButtons.forEach(button => {
        button.addEventListener('click', () => handleAnswer(button));
    });

    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        loadQuestion();
    });
    
    restartButton.addEventListener('click', startGame);

    loadColors();
});
