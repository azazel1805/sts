// --- Configuration ---
// IMPORTANT: Replace with your ACTUAL backend URL when deployed
// For local dev with Flask running on port 5000:
const BACKEND_URL = 'http://127.0.0.1:8080/submit';
// Example for Render deployment (replace 'your-app-name' etc.)
// const BACKEND_URL = 'https://your-placement-test-app.onrender.com/submit';

// --- DOM Elements ---
const userInfoDiv = document.getElementById('user-info');
const nameInput = document.getElementById('name');
const surnameInput = document.getElementById('surname');
const startTestBtn = document.getElementById('start-test-btn');
const userInfoError = document.getElementById('user-info-error');

const testContainer = document.getElementById('test-container');
const questionPlaceholder = document.getElementById('question-placeholder');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const skipBtn = document.getElementById('skip-btn');
const submitBtn = document.getElementById('submit-btn');
const progressIndicator = document.getElementById('progress-indicator');

const resultsContainer = document.getElementById('results-container');
const resultsSummary = document.getElementById('results-summary');
const resultsDetailsList = document.getElementById('wrong-answers-list');
const aiFeedbackBox = document.getElementById('ai-feedback-box');
const aiFeedbackContent = document.getElementById('ai-feedback-content');
const loadingSpinner = document.getElementById('loading-spinner');
const submitError = document.getElementById('submit-error');

// --- Test Data ---
// Ideally, fetch this from backend or a JSON file for easier updates
// Structure: { id: string, text: string, options: { a: string, b: string, ... } }
const questions = [
    { id: '1', text: "1. She usually ______ to work by bus.", options: { a: 'go', b: 'goes', c: 'going', d: 'went' } },
    { id: '2', text: "2. I ______ watch TV in the evening.", options: { a: 'always', b: 'went', c: 'tomorrow', d: 'yesterday' } },
    { id: '3', text: "3. She ______ speak Spanish.", options: { a: 'love', b: 'can\'t', c: 'try', d: 'practice' } },
    { id: '4', text: "4. They ______ to the cinema last night.", options: { a: 'go', b: 'goes', c: 'went', d: 'going' } },
    { id: '5', text: "5. He ______ his homework right now.", options: { a: 'doing', b: 'do', c: 'does', d: 'is doing' } },
    { id: '6', text: "6. We are ______ to the beach tomorrow.", options: { a: 'go', b: 'goes', c: 'are going', d: 'going' } }, // Note: 'are going' is grammatically better contextually
    { id: '7', text: "7. I ______ eat vegetables.", options: { a: 'always', b: 'fast', c: 'last week', d: 'quickly' } },
    { id: '8', text: "8. There are ______ apples on the table.", options: { a: 'much', b: 'very', c: 'a lot', d: 'some' } }, // c or d could fit depending on quantity
    { id: '9', text: "9. Alternative word for: “dangerous”", options: { a: 'risky', b: 'difficult', c: 'safe', d: 'comfortable' } },
    { id: '10', text: "10. Gizem: Is there any sugar in the jar?\nCem: ______ (-)", options: { a: 'much', b: 'many', c: 'a lot', d: 'none' } },
    { id: '11', text: '11. Alternative word for: "baby cat"', options: { a: 'kitten', b: 'puppy', c: 'lion', d: 'calf' } },
    { id: '12', text: "12. Which of the following animals can fly?", options: { a: 'dog', b: 'cat', c: 'bird', d: 'fish' } },
    { id: '13', text: "13. Which one travels in the sea?", options: { a: 'car', b: 'boat', c: 'airplane', d: 'train' } },
    { id: '14', text: "14. Can you pass me the ______? I want to slice some bread.", options: { a: 'fork', b: 'spoon', c: 'knife', d: 'ladle' } },
    { id: '15', text: "15. Let's meet ______ 7 o'clock.", options: { a: 'on', b: 'in', c: 'at', d: 'under' } },
    { id: '16', text: "16. I will see you ______ Monday.", options: { a: 'on', b: 'in', c: 'at', d: 'above' } },
    { id: '17', text: "17. Opposite word for: “slow”", options: { a: 'dangerous', b: 'cool', c: 'fast', d: 'pretty' } },
    { id: '18', text: "18. What is your ______ name?", options: { a: 'sister\'s', b: 'sisters\'', c: 'sister', d: 'sisters' } },
    { id: '19', text: "19. She ______ as a teacher, but today she is ______ for her exam.", options: { a: 'work / study', b: 'works / is studying', c: 'works / study', /* d option missing in OCR */ } }, // Added '/' for clarity
    { id: '20', text: "20. She ______ her keys yesterday.", options: { a: 'find', b: 'found', c: 'finds', d: 'have found' } },
    { id: '21', text: "21. Whose ______ is this?", options: { a: 'book', b: 'books', c: 'book\'s', d: 'books\'' } },
    { id: '22', text: "22. You should stop ______ me while I am talking.", options: { a: 'gossiping', b: 'talking', c: 'interrupting', d: 'telling' } },
    { id: '23', text: "23. I don't want to be a shop assistant because I can't stand ______ customers.", options: { a: 'dealing with', b: 'working', c: 'listening', d: 'solving' } },
    { id: '24', text: "24. I have bought the tickets for the concert so we ______ see One Direction tomorrow.", options: { a: 'are going to', b: 'will', c: 'might', d: 'may' } },
    { id: '25', text: '25. Alternative word for: "hate"?', options: { a: 'Don\'t mind', b: 'Can\'t stand', c: 'Keen on', d: 'Dislike' } }, // B or D fit
    { id: '26', text: "26. Opposite word for: “tired\"", options: { a: 'Happy', b: 'Sleepy', c: 'Fit', d: 'Rested' } }, // A or D could fit
    { id: '27', text: "27. She enjoys ______ books in her free time.", options: { a: 'read', b: 'reading', c: 'to read', d: 'being read' } },
    { id: '28', text: "28. I avoid ______ spicy food.", options: { a: 'eat', b: 'eating', c: 'to eat', d: 'to be eaten' } },
    { id: '29', text: "29. I saw a small cat on the street while I ______ home.", options: { a: 'Was walking', b: 'Walked', c: 'Am walking', d: 'Walk' } },
    { id: '30', text: "30. I haven't seen my friends ______ I graduated", options: { a: 'for', b: 'since', c: 'when', d: 'but' } },
    { id: '31', text: "31. I would like to learn English ______ improve my speaking.", options: { a: 'In order to', b: 'because', c: 'so that', d: 'so' } },
    { id: '31b', text: "31. I think I should change this sofa. It is very big and it ______ too much space.", options: { a: 'takes up', b: 'takes over', c: 'turns down', d: 'gives up' } }, // Renamed duplicate
    { id: '32', text: "32. Movies which tell stories about the future, outer space, robots, or aliens. Are called", options: { a: 'Science fiction', b: 'Biopic', c: 'Cartoon', d: 'horror' } },
    { id: '33', text: "33. The book ______ you lent me, was fascinating.", options: { a: 'that', b: 'who', c: 'which', d: 'whose' } }, // 'that' or 'which'
    { id: '34', text: "34. The concert was ______ than I expected.", options: { a: 'better', b: 'good', c: 'more good', d: 'more excited' } },
    { id: '35', text: "35. After studying for hours, she felt ______", options: { a: 'tired', b: 'interested', c: 'exciting', d: 'nervous' } },
    { id: '36', text: "36. What do you call a vehicle with two wheels that you ride by pushing pedals?", options: { a: 'bike', b: 'boat', c: 'airplane', d: 'unicycle' } }, // Unicycle has one wheel usually
    { id: '37', text: "37. The report ______ yesterday.", options: { a: 'was written', b: 'writes', c: 'is writing', d: 'wrote' } }, // Active 'Someone wrote the report'
    { id: '38', text: "38. I ______ my homework yet.", options: { a: 'do', b: 'does', c: 'did', d: 'haven\'t done' } },
    { id: '39', text: "39. She promised ______ me later.", options: { a: 'call', b: 'calling', c: 'to call', d: 'to be called' } },
    { id: '40', text: "40. The road ______ outside my house now.", options: { a: 'is repairing', b: 'repairs', c: 'is being repaired', d: 'repairing' } },
    { id: '41', text: "41. The winner ______ tomorrow.", options: { a: 'will be announced', b: 'announces', c: 'is announcing', d: 'announced' } },
    { id: '42', text: "42. The house ______ already.", options: { a: 'has cleaned', b: 'cleaned', c: 'has been cleaned', d: 'cleans' } }, // Active or Passive possible
    { id: '43', text: '43. "I\'m going to visit my grandmother next weekend," Tom said that ______', options: { a: 'he will visit his grandmother next weekend.', b: 'he is going to visit his grandmother next weekend.', c: 'he was going to visit his grandmother the following weekend.', d: 'he was going to visit his grandmother next weekend.' } }, // c is best reported speech
    { id: '44', text: "44. While I ______ home, I saw a shooting star.", options: { a: 'was walking', b: 'walk', c: 'walked', d: 'have walked' } },
    { id: '45', text: '45. Alternative word for: “escape”?', options: { a: 'get away', b: 'run away', c: 'run out', d: 'a and b' } },
    { id: '46', text: "46. Which of the following adjectives is used to describe a person who has problems making a decision?", options: { a: 'competitive', b: 'a good leader', c: 'indecisive', d: 'risk taker' } },
    { id: '47', text: "47. When I was young, I ______ live in Canada.", options: { a: 'used to', b: 'use to', c: 'was used', d: 'would' } }, // 'would' also possible for past habits
    { id: '48', text: "48. If it ______ tomorrow, we will stay indoors.", options: { a: 'rains', b: 'will rain', c: 'rained', d: 'would rain' } },
    { id: '49', text: "49. If I ______ about the party, I would have gone.", options: { a: 'know', b: 'had known', c: 'knew', d: 'knows' } },
    { id: '50', text: "50. Which of the following multi-word verbs means “to wear clothes to see if you want to buy them”", options: { a: 'Dress down', b: 'Dress up', c: 'Wear', d: 'Try on' } },
    { id: '51', text: "51. The girl ______ I met yesterday is a talented artist.", options: { a: 'which', b: 'whom', c: 'whose', d: 'who' } }, // 'who' or 'whom' (formal object)
    { id: '52', text: "52. The house ______ I grew up was demolished last year.", options: { a: 'which', b: 'where', c: 'who', d: 'whose' } }, // 'where' or 'in which'
    { id: '53', text: "53. The car ______ owner is my friend needs to be repaired.", options: { a: 'who', b: 'which', c: 'that', d: 'whose' } },
    { id: '54', text: "54. The new bridge ______ next month.", options: { a: 'will build', b: 'is building', c: 'will be built', d: 'builds' } },
    { id: '55', text: '55. "Did you enjoy the concert?" she asked if ______', options: { a: 'I enjoyed the concert.', b: 'did I enjoy the concert.', c: 'had I enjoyed the concert.', d: 'I had enjoyed the concert.' } },
    { id: '56', text: '"56. We have been waiting for hours," they complained that ______', options: { a: 'they have been waiting for hours.', b: 'they had been waiting for hours.', c: 'they are waiting for hours.', d: 'they were waiting for hours.' } },
    { id: '57', text: "57. She ______ in Paris for three years before moving to London.", options: { a: 'lived', b: 'has lived', c: 'was living', d: 'had lived' } },
    { id: '58', text: "58. By the time I got to the party, everyone ______", options: { a: 'leaves', b: 'had left', c: 'leave', d: 'left' } },
    { id: '59', text: '59. What is the meaning of the word "disgusting"?', options: { a: 'Attractive', b: 'Enjoyable', c: 'Nauseating', d: 'Delicious' } },
    { id: '60', text: "60. She ______ English for years, but she still struggles.", options: { a: 'learns', b: 'has been learning', c: 'learnt', d: 'was learning' } },
    { id: '61', text: "61. Danyela ______ all morning.", options: { a: 'has been gardening', b: 'has gardened', c: 'has been gardened', d: 'has gardening' } },
    { id: '62', text: "62. By this time next year, I ______ my degree.", options: { a: 'will have finished', b: 'will finish', c: 'will be finishing', d: 'will have been finished' } },
    { id: '63', text: "63. By next Monday, she ______ all the documents.", options: { a: 'will have prepared', b: 'will prepare', c: 'will be preparing', d: 'will have been prepared' } }, // Active or Passive ok
    { id: '64', text: "64. She would have been here on time if she ______ the traffic jam.", options: { a: 'had avoided', b: 'would avoid', c: 'avoided', d: 'was avoiding' } },
    { id: '65', text: "65. my family ______ producing cheese on our ranch traditionally for years, and ______ technology has advanced...", options: { a: 'is/despite', b: 'has been/ although', c: 'had been/ however', d: 'are/ although' } }, // Needs 2 blanks - unclear choice
    { id: '66', text: "66. A university degree...should help graduates ______ better employment.", options: { a: 'take', b: 'comprehend', c: 'land', d: 'find' } }, // c or d
    { id: '67', text: "67. Ivy League universities...integrating science ______ innovations... ______ the lives of people", options: { a: 'in/ using', b: 'into/through', c: 'from/ beside', d: 'into/ upon' } }, // Needs 2 blanks - unclear choice
    { id: '68', text: "68. I shall never forget ______ the queen in her white dress.", options: { a: 'to see', b: 'to be seen', c: 'seeing', d: 'to seeing' } }, // 'seeing' for past event memory
    { id: '69', text: "69. lights are off, they ______ the house", options: { a: 'must have left', b: 'couldn\'t have left', c: 'must have leaved', d: 'could have leaved' } },
    { id: '70', text: "70. I regret ______ you that your application has been rejected...", options: { a: 'informing', b: 'telling', c: 'te tell', d: 'to inform' } }, // 'telling' (gerund for past regret) or 'to inform' (infinitive for regretting the act of informing now)
    { id: '71', text: "71. Traditional cultures will ultimately disappear ______ technology develops.", options: { a: 'as', b: 'like', c: 'albeit', d: 'despite' } },
    { id: '72', text: "72. On the heels of the announcement...", options: { a: 'Far behind', b: 'Following closely', c: 'Ahead', d: 'Before' } },
    { id: '73', text: "73. ...all people zeroed in on the words... synonym for the word in bold is:", options: { a: 'focus', b: 'skirt', c: 'circumvent', d: 'lag' } },
    { id: '74', text: "74. What is a synonym for the word “Voracious”", options: { a: 'Indifferent', b: 'Insatiable', c: 'Satisfied', d: 'Content' } },
    { id: '75', text: "75. What is an antonym for the word “Pernicious”", options: { a: 'Beneficial', b: 'Harmful', c: 'Unpleasant', d: 'Neutral' } },
    { id: '76', text: "76. Mandatory practices like donning masks...", options: { a: 'Discretionary', b: 'Dispensable', c: 'Voluntary', d: 'Compulsory' } }, // Antonym is needed, so A or C? Mandatory vs Voluntary = C. Vs Discretionary = A. Context implies choice vs no choice. A fits better.
    { id: '77', text: "77. The company had to cut ______ on expenses due to financial difficulties.", options: { a: 'off', b: 'back', c: 'up', d: 'down' } }, // 'back' or 'down'
    { id: '78', text: "78. She put ______ with her difficult boss for years before finally resigning.", options: { a: 'up', b: 'in', c: 'out', d: 'off' } }, // 'up with'
    { id: '79', text: "79. We need to get ______ with our work if we want to meet the deadline.", options: { a: 'over', b: 'on', c: 'up', d: 'through' } }, // 'on with'
    { id: '80', text: "80. The teacher asked the students to hand ______ their assignments by Friday.", options: { a: 'in', b: 'on', c: 'out', d: 'up' } }, // 'in' is standard
    { id: '81', text: "81. If only I ______ more time to travel.", options: { a: 'have', b: 'had', c: 'will have', d: 'having' } },
    { id: '82', text: "82. He wishes he'd ______ the opportunity to study abroad when he was younger.", options: { a: 'has', b: 'had', c: 'have', d: 'will have' } }, // he'd = he had -> wish + past perfect -> had had
    { id: '83', text: "83. It's time to face the music and ______ the consequences of your actions.", options: { a: 'pay the piper', b: 'beat around the bush', c: 'bite the bullet', d: 'let the cat out of the bag' } }, // Idiom: accept consequences (face the music, bite the bullet, pay the piper all related)
    { id: '84', text: "84. She's always on cloud nine... She loves them ______", options: { a: 'with all her heart', b: 'at the drop of a hat', c: 'for a song', d: 'until the cows come home' } },
    { id: '85', text: "85. Don't count your chickens before they hatch, meaning don't ______", options: { a: 'spend money before you have it', b: 'underestimate the situation', c: 'expect success before it happens', d: 'ignore the facts' } },
    { id: '86', text: "86. His success didn't come overnight; he had to ______ and persevere...", options: { a: 'burn the midnight oil', b: 'hit the nail on the head', c: 'jump on the bandwagon', d: 'cry over spilled milk' } },
    { id: '87', text: "87. ...do not opt for purchasing products produced in sweatshops due to the ______ conditions...", options: { a: 'Mild', b: 'Encouraging', c: 'Terrible', d: 'Good' } }, // 'dire' in text -> Terrible
    { id: '88', text: "88. ...his theory have gained seminal role...", options: { a: 'Groundbreaking', b: 'Negligible', c: 'Barren', d: 'Trifling' } }, // seminal -> groundbreaking/influential
    { id: '89', text: '89. The phrase "cast aspersions" implies:', options: { a: 'To express doubts or suspicions', b: 'To offer enthusiastic praise', c: 'provide a detailed explanation', d: 'To remain completely silent' } },
    { id: '90', text: "90. The burgeoning field of artificial intelligence necessitates:", options: { a: 'A rigid adherence to established protocols', b: 'A willingness to embrace novel approaches', c: 'An overreliance on human intuition', d: 'A complete disregard for ethical considerations' } }, // Contextual understanding
];
// --- State ---
let currentQuestionIndex = 0;
let userAnswers = {}; // Stores { qId: answerValue ('a', 'b', 'skipped', etc.) }
let studentName = '';
let studentSurname = '';

// --- Functions ---

function startTest() {
    studentName = nameInput.value.trim();
    studentSurname = surnameInput.value.trim();
    userInfoError.textContent = ''; // Clear previous errors

    if (!studentName || !studentSurname) {
        userInfoError.textContent = 'Please enter both name and surname.';
        return;
    }

    userInfoDiv.classList.add('hidden');
    testContainer.classList.remove('hidden');
    displayQuestion(currentQuestionIndex);
}


function displayQuestion(index) {
    // Clear previous question
    questionPlaceholder.innerHTML = '';

    if (index < 0 || index >= questions.length) {
        console.error("Invalid question index:", index);
        return; // Should not happen in normal flow
    }

    const questionData = questions[index];
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');
    questionDiv.dataset.id = questionData.id; // Store question ID

    const questionText = document.createElement('p');
    questionText.textContent = questionData.text; // Already includes number
    questionDiv.appendChild(questionText);

    const optionsDiv = document.createElement('div');
    optionsDiv.classList.add('options');

    // Generate options dynamically
    for (const key in questionData.options) {
        const label = document.createElement('label');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `q${questionData.id}`; // Unique name for the radio group
        radio.value = key;
        radio.id = `q${questionData.id}_${key}`; // Unique ID for the radio button

        // Check if there's a stored answer for this question
        if (userAnswers[questionData.id] === key) {
            radio.checked = true;
        }

         // Add event listener to store answer immediately on change
        radio.addEventListener('change', storeCurrentAnswer);


        const span = document.createElement('span'); // Wrap text in span for better styling/clicking
        span.textContent = ` ${key}) ${questionData.options[key]}`; // Add space before option text

        label.appendChild(radio);
        label.appendChild(span); // Add the text span
        label.htmlFor = radio.id; // Associate label with radio

        optionsDiv.appendChild(label);
    }

    questionDiv.appendChild(optionsDiv);
    questionPlaceholder.appendChild(questionDiv);

    updateNavigationButtons(index);
    updateProgressIndicator(index);
}

function updateNavigationButtons(index) {
    prevBtn.disabled = index === 0;
    nextBtn.classList.toggle('hidden', index === questions.length - 1);
    submitBtn.classList.toggle('hidden', index !== questions.length - 1);
    skipBtn.classList.toggle('hidden', index === questions.length - 1); // Hide skip on last question
}

 function updateProgressIndicator(index) {
     progressIndicator.textContent = `Question ${index + 1} / ${questions.length}`;
 }

function storeCurrentAnswer() {
    const currentQuestionDiv = questionPlaceholder.querySelector('.question');
    if (!currentQuestionDiv) return;

    const questionId = currentQuestionDiv.dataset.id;
    const selectedOption = currentQuestionDiv.querySelector(`input[name="q${questionId}"]:checked`);

    if (selectedOption) {
        userAnswers[questionId] = selectedOption.value;
        // console.log("Stored answer:", questionId, userAnswers[questionId]);
    }
    // No need for an else here, if nothing is selected, nothing is stored yet.
    // Skipping handles the 'skipped' value explicitly.
}


function nextQuestion() {
    storeCurrentAnswer(); // Store answer before moving
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
    }
}

function prevQuestion() {
    storeCurrentAnswer(); // Store answer before moving
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(currentQuestionIndex);
    }
}

function skipQuestion() {
     const currentQuestionDiv = questionPlaceholder.querySelector('.question');
     if (!currentQuestionDiv) return;
     const questionId = currentQuestionDiv.dataset.id;

     // Mark as skipped
     userAnswers[questionId] = 'skipped';
     console.log("Skipped question:", questionId);

     // Uncheck radio buttons for skipped question visually
     const radioButtons = currentQuestionDiv.querySelectorAll(`input[name="q${questionId}"]`);
     radioButtons.forEach(radio => radio.checked = false);


     // Move to next question
     if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
    } else {
        // If skipping the last question, trigger submit (or maybe just show submit button?)
         handleSubmit(); // Or just update buttons: updateNavigationButtons(currentQuestionIndex);
    }
}


async function handleSubmit() {
    storeCurrentAnswer(); // Ensure last answer is stored

    console.log("Submitting answers:", userAnswers);
    loadingSpinner.classList.remove('hidden');
    submitBtn.disabled = true;
    prevBtn.disabled = true; // Disable all nav during submit
    testContainer.classList.add('hidden'); // Hide questions
    submitError.textContent = ''; // Clear previous errors

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: studentName,
                surname: studentSurname,
                answers: userAnswers,
            }),
        });

        loadingSpinner.classList.add('hidden');
        resultsContainer.classList.remove('hidden');

        if (!response.ok) {
            let errorMsg = `Error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorMsg;
            } catch (e) { /* Ignore if response is not JSON */ }
            throw new Error(errorMsg);
        }

        const results = await response.json();
        displayResults(results);

    } catch (error) {
        console.error('Submission failed:', error);
        loadingSpinner.classList.add('hidden');
        resultsContainer.classList.remove('hidden'); // Show results container to display error
        resultsSummary.innerHTML = '<p>Could not submit results.</p>';
        submitError.textContent = `Submission Failed: ${error.message}. Please try again later or contact support.`;
         // Maybe re-enable submit button after a delay? Or provide refresh option.
         // submitBtn.disabled = false;
         // prevBtn.disabled = false; // Re-enable if needed
    }
}

function displayResults(results) {
    console.log("Results received:", results);
    resultsSummary.innerHTML = `
        <p><strong>Total Questions:</strong> ${results.total_questions}</p>
        <p><strong>Correct Answers:</strong> ${results.correct}</p>
        <p><strong>Incorrect Answers:</strong> ${results.wrong}</p>
        <p><strong>Skipped Questions:</strong> ${results.skipped}</p>
        <p><strong>Score:</strong> ${results.total_questions > 0 ? ((results.correct / results.total_questions) * 100).toFixed(1) : 0}%</p>
        ${results.sheet_error ? `<p class="error-message">${results.sheet_error}</p>` : ''}
    `;

    resultsDetailsList.innerHTML = ''; // Clear previous details
    if (results.details && results.details.length > 0) {
        results.details.forEach(detail => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>Q${detail.question} (Topic: ${detail.topic})</strong><br>
                <span>Your Answer: ${detail.your_answer}</span>
                <span>Correct Answer: ${detail.correct_answer}</span>
            `;
            resultsDetailsList.appendChild(li);
        });
    } else {
        resultsDetailsList.innerHTML = '<li>No incorrect answers!</li>';
    }

     // Display AI Feedback if available
    if (results.ai_feedback && results.ai_feedback !== "Gemini analysis not available." && results.ai_feedback !== "Error generating AI feedback.") {
        aiFeedbackContent.textContent = results.ai_feedback;
        aiFeedbackBox.classList.remove('hidden');
    } else {
        aiFeedbackBox.classList.add('hidden');
         if (results.ai_feedback === "Error generating AI feedback.") {
              // Optionally show a message that AI feedback failed
               aiFeedbackContent.textContent = "Could not generate AI feedback at this time.";
               aiFeedbackBox.classList.remove('hidden'); // Show the box with the error message
         }
    }

}


// --- Event Listeners ---
startTestBtn.addEventListener('click', startTest);
nextBtn.addEventListener('click', nextQuestion);
prevBtn.addEventListener('click', prevQuestion);
skipBtn.addEventListener('click', skipQuestion);
submitBtn.addEventListener('click', handleSubmit);

// --- Initial State ---
// Hide test and results initially, show user info form
testContainer.classList.add('hidden');
resultsContainer.classList.add('hidden');
userInfoDiv.classList.remove('hidden');