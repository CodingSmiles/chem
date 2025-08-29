const ions = {
    // Metals (Cations)
    "Sodium": ["Na", "1"],
    "Potassium": ["K", "1"],
    "Silver": ["Ag", "1"],
    "Hydrogen": ["H", "1"],
    "Ammonium": ["NH4", "1"],
    "Copper (I)": ["Cu", "1"],
    "Magnesium": ["Mg", "2"],
    "Calcium": ["Ca", "2"],
    "Zinc": ["Zn", "2"],
    "Iron (II) (Ferrous)": ["Fe", "2"],
    "Copper (II)": ["Cu", "2"],
    "Lead (II)": ["Pb", "2"],
    "Barium": ["Ba", "2"],
    "Aluminium": ["Al", "3"],
    "Iron (III) (Ferric)": ["Fe", "3"],
    // Non-metallic and Polyatomic Ions (Anions)
    "Hydride": ["H", "-1"],
    "Chloride": ["Cl", "-1"],
    "Bromide": ["Br", "-1"],
    "Iodide": ["I", "-1"],
    "Hydroxide": ["OH", "-1"],
    "Nitrate": ["NO3", "-1"],
    "Hydrogen carbonate (Bicarbonate)": ["HCO3", "-1"],
    "Oxide": ["O", "-2"],
    "Sulphide": ["S", "-2"],
    "Carbonate": ["CO3", "-2"],
    "Sulphite": ["SO3", "-2"],
    "Sulphate": ["SO4", "-2"],
    "Nitride": ["N", "-3"],
    "Phosphate": ["PO4", "-3"],
};

const compounds = {
    // Important Acids
    "Hydrochloric acid": "HCl",
    "Sulphuric acid": "H2SO4",
    "Nitric acid": "HNO3",
    "Carbonic acid": "H2CO3",
    "Phosphoric acid": "H3PO4",
    "Acetic acid": "CH3COOH",
    // Important Bases
    "Sodium hydroxide": "NaOH",
    "Potassium hydroxide": "KOH",
    "Calcium hydroxide (Slaked lime)": "Ca(OH)2",
    "Ammonium hydroxide": "NH4OH",
    // Important Salts & Compounds
    "Sodium chloride (Common salt)": "NaCl",
    "Baking soda": "NaHCO3",
    "Washing soda": "Na2CO3.10H2O",
    "Bleaching powder": "CaOCl2",
    "Plaster of Paris": "CaSO4.1/2H2O",
    "Gypsum": "CaSO4.2H2O",
    "Quicklime": "CaO",
    "Lime water": "Ca(OH)2",
    "Ammonium chloride": "NH4Cl",
    "Copper sulphate": "CuSO4",
    "Ferrous sulphate": "FeSO4",
    "Zinc sulphate": "ZnSO4",
    "Copper sulphate (with water crystallization)": "CuSO4.5H2O",
    "Ferrous sulphate (with water crystallization)": "FeSO4.7H2O",
    "Zinc sulphate (with water crystallization)": "ZnSO4.7H2O"
};

function normalizeCompound(text) {
    return text.replace(/\s+/g, '').toLowerCase();
}

function parseIonAnswer(text) {
    if (!text) return null;
    let t = text.trim()
        .replace(/[()]/g, '')
        .replace(',', ' ')
        .replace(/\s+/g, ' ')
        .trim();
    let parts = t.split(' ');
    if (parts.length === 1) {
        let match = parts[0].match(/^([A-Za-z0-9]+)(\d+)$/);
        if (match) {
            let sym = match[1];
            let val = match[2];
            return [sym, val];
        }
        return null;
    } else {
        let sym = parts[0];
        let valMatch = parts[1].match(/\d+/);
        if (!valMatch) return null;
        let val = valMatch[0];
        return [sym, val];
    }
}

class QuizApp {
    constructor() {
        // Define metal and non-metal/polyatomic ions
        const metalIons = ["Sodium", "Potassium", "Silver", "Hydrogen", "Ammonium", "Copper (I)", "Magnesium", "Calcium", "Zinc", "Iron (II) (Ferrous)", "Copper (II)", "Lead (II)", "Barium", "Aluminium", "Iron (III) (Ferric)"];
        const nonMetalPolyIons = ["Hydride", "Chloride", "Bromide", "Iodide", "Hydroxide", "Nitrate", "Hydrogen carbonate (Bicarbonate)", "Oxide", "Sulphide", "Carbonate", "Sulphite", "Sulphate", "Nitride", "Phosphate"];

        // Create question pools for each section
        this.metalQuestions = metalIons.map(name => ['ion', name]).sort(() => Math.random() - 0.5);
        this.nonMetalPolyQuestions = nonMetalPolyIons.map(name => ['ion', name]).sort(() => Math.random() - 0.5);
        this.compoundQuestions = Object.keys(compounds).map(name => ['compound', name]).sort(() => Math.random() - 0.5);

        this.sections = [
            { name: "Metals", questions: this.metalQuestions, index: 0 },
            { name: "Non-metallic and Polyatomic Ions", questions: this.nonMetalPolyQuestions, index: 0 },
            { name: "Compounds", questions: this.compoundQuestions, index: 0 }
        ];
        this.currentSectionIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.wrongAnswers = [];
        this.totalQuestions = this.metalQuestions.length + this.nonMetalPolyQuestions.length + this.compoundQuestions.length;

        this.elements = {
            sectionTitle: document.getElementById('section-title'),
            question: document.getElementById('question'),
            answerInput: document.getElementById('answer-input'),
            submitButton: document.getElementById('submit-button'),
            feedback: document.getElementById('feedback'),
            score: document.getElementById('score'),
            streak: document.getElementById('streak'),
            progress: document.getElementById('progress'),
            quizContainer: document.getElementById('quiz-container'),
            resultContainer: document.getElementById('result-container'),
            finalScore: document.getElementById('final-score'),
            wrongTitle: document.getElementById('wrong-title'),
            wrongAnswersText: document.getElementById('wrong-answers')
        };
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
        this.elements.submitButton.addEventListener('click', () => this.checkAnswer());
        this.showQuestion();
    }

    showQuestion() {
        const section = this.sections[this.currentSectionIndex];
        if (!section || section.index >= section.questions.length) {
            this.currentSectionIndex++;
            if (this.currentSectionIndex >= this.sections.length) {
                this.endQuiz();
                return;
            }
        }
        const currentSection = this.sections[this.currentSectionIndex];
        if (currentSection.index < currentSection.questions.length) {
            let [qtype, name] = currentSection.questions[currentSection.index];
            this.elements.sectionTitle.textContent = `${currentSection.name} Section`;
            this.elements.question.textContent = `Q${currentSection.index + 1}: ${name}`;
            this.elements.answerInput.value = '';
            this.elements.feedback.textContent = '';
            this.elements.progress.textContent = `Section Progress: ${currentSection.index + 1}/${currentSection.questions.length}`;
        } else {
            this.currentSectionIndex++;
            this.showQuestion();
        }
    }

    checkAnswer() {
        const section = this.sections[this.currentSectionIndex];
        if (!section || section.index >= section.questions.length) return;
        let [qtype, name] = section.questions[section.index];
        let userAnswer = this.elements.answerInput.value.trim();
        let displayCorrect;
        if (qtype === 'ion') {
            let [correctSymbol, correctValency] = ions[name];
            let parsed = parseIonAnswer(userAnswer);
            let isCorrect = false;
            displayCorrect = `${correctSymbol},${correctValency}`;
            if (parsed) {
                let [userSym, userVal] = parsed;
                try {
                    let expectedValency = correctValency.replace(/[-+]/g, '');
                    if (userSym.toLowerCase() === correctSymbol.toLowerCase() && userVal === expectedValency) {
                        isCorrect = true;
                    }
                } catch (e) {
                    isCorrect = false;
                }
            }
            this.feedback(isCorrect, displayCorrect, userAnswer, name);
        } else if (qtype === 'compound') {
            let correctFormula = compounds[name];
            let isCorrect = normalizeCompound(userAnswer) === normalizeCompound(correctFormula);
            displayCorrect = correctFormula;
            this.feedback(isCorrect, displayCorrect, userAnswer, name);
        }
        section.index++;
        setTimeout(() => this.showQuestion(), 800);
    }

    feedback(isCorrect, correctAnswer, userAnswer, qname) {
        if (isCorrect) {
            let emojis = ['✅ Correct!', '🎉 Well done!', '⭐ Right answer!', '👏 Nice!'];
            this.elements.feedback.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            this.elements.feedback.className = 'text-center mt-4 text-green-600';
            this.score++;
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);
        } else {
            this.elements.feedback.textContent = `❌ Wrong!\nCorrect: ${correctAnswer}`;
            this.elements.feedback.className = 'text-center mt-4 text-red-600';
            this.streak = 0;
            this.wrongAnswers.push([qname, userAnswer || '⟨blank⟩', correctAnswer]);
        }
        this.elements.score.textContent = `Score: ${this.score}`;
        this.elements.streak.textContent = `🔥 Streak: ${this.streak}`;
    }

    endQuiz() {
        this.elements.sectionTitle.classList.add('hidden');
        this.elements.question.classList.add('hidden');
        this.elements.answerInput.classList.add('hidden');
        this.elements.submitButton.classList.add('hidden');
        this.elements.feedback.classList.add('hidden');
        this.elements.progress.classList.add('hidden');
        this.elements.streak.classList.add('hidden');
        this.elements.resultContainer.classList.remove('hidden');
        this.elements.finalScore.textContent = `🏆 Final Score: ${this.score}/${this.totalQuestions}\n🔥 Best Streak: ${this.maxStreak}`;
        if (this.wrongAnswers.length) {
            this.elements.wrongTitle.textContent = 'Review of Wrong Answers:';
            this.elements.wrongAnswersText.textContent = this.wrongAnswers.map(([q, user, correct]) => `• ${q}\n   You wrote: ${user}\n   Correct: ${correct}\n`).join('\n');
        } else {
            this.elements.wrongTitle.textContent = '🎉 Perfect Score! No wrong answers!';
            this.elements.wrongAnswersText.textContent = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new QuizApp());
