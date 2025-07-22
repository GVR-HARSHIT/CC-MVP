/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type } from "@google/genai";
import { render } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { html } from 'htm/preact';

// --- MOCK DATA (to be replaced with Firebase) ---
const quizQuestions = [
    {
        question: "How do you prefer to solve problems?",
        options: [
            "With logical, step-by-step thinking.",
            "By imagining creative and new solutions.",
            "By collaborating and discussing with others.",
            "Through hands-on experimentation and building."
        ]
    },
    {
        question: "Which of these subjects interests you the most?",
        options: [
            "Mathematics or Physics",
            "Art, Music, or Literature",
            "Psychology or Sociology",
            "Biology or Chemistry"
        ]
    },
    {
        question: "What kind of work environment do you thrive in?",
        options: [
            "A structured, predictable environment.",
            "A dynamic, fast-paced, and changing one.",
            "A supportive, team-oriented setting.",
            "Working independently on my own tasks."
        ]
    },
    {
        question: "When you have free time, you're most likely to...",
        options: [
            "Play a strategy game or solve puzzles.",
            "Create something - write, draw, or code a small project.",
            "Hang out with friends or volunteer.",
            "Tinker with gadgets or work on a DIY project."
        ]
    },
    {
        question: "What motivates you the most?",
        options: [
            "Achieving difficult goals and being recognized as an expert.",
            "Expressing my creativity and making a unique impact.",
            "Helping people and improving society.",
            "Building tangible things and seeing them work."
        ]
    }
];

const mentors = [
    { name: 'Aditi Sharma', role: 'Software Engineer', company: 'Google', expertise: ['Web Dev', 'Algorithms', 'Java'], avatar: 'AS' },
    { name: 'Rohan Verma', role: 'Product Manager', company: 'Flipkart', expertise: ['Agile', 'User Research', 'Strategy'], avatar: 'RV' },
    { name: 'Priya Singh', role: 'Data Scientist', company: 'Swiggy', expertise: ['Python', 'ML', 'Analytics'], avatar: 'PS' },
    { name: 'Vikram Patel', role: 'UX/UI Designer', company: 'Zomato', expertise: ['Figma', 'Prototyping', 'Mobile UI'], avatar: 'VP' },
];

// --- API CONFIGURATION ---
let ai;
try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (e) {
    console.error("Failed to initialize GoogleGenAI. API_KEY might be missing.", e);
}

const careerSchema = {
    type: Type.OBJECT,
    properties: {
        careers: {
            type: Type.ARRAY,
            description: "A list of 3 diverse and personalized career path recommendations.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the career path, e.g., 'AI/ML Engineer'." },
                    description: { type: Type.STRING, description: "A brief, 2-sentence explanation of this career, tailored to the user's interests." },
                    skills: {
                        type: Type.ARRAY,
                        description: "A list of 3-5 essential skills for this career.",
                        items: { type: Type.STRING }
                    }
                },
                required: ["title", "description", "skills"]
            }
        }
    },
    required: ["careers"]
};

// --- COMPONENTS ---

const Header = ({ onNavigate, theme, toggleTheme }) => {
    const handleNavClick = (e, path) => {
        e.preventDefault();
        onNavigate(path);
    };

    return html`
    <header class="header">
        <div class="nav-container">
            <a href="#" onClick=${(e) => handleNavClick(e, '/')} class="logo">CareerCompass</a>
            <nav class="nav-links">
                <a href="#" onClick=${(e) => handleNavClick(e, '/')}>Home</a>
                <a href="#" onClick=${(e) => handleNavClick(e, '/mentors')}>Mentors</a>
                <button onClick=${toggleTheme} class="theme-toggle" aria-label="Toggle dark mode">
                    ${theme === 'dark' ? html`
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
                    ` : html`
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>
                    `}
                </button>
            </nav>
        </div>
    </header>
`};

const HomePage = ({ onNavigate }) => html`
    <div class="page-container home-hero">
        <h1>Find Your Future. Start Your Journey Today.</h1>
        <p>Confused about your career? Take our quick, insightful quiz to discover personalized career paths and skills that match your true potential.</p>
        <button class="cta-button" onClick=${() => onNavigate('/quiz')}>Start Your Discovery Quiz</button>
    </div>
`;

const QuizPage = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});

    const handleAnswer = (option) => {
        setAnswers({ ...answers, [step]: option });
    };

    const handleNext = () => {
        if (answers[step] !== undefined) {
            if (step < quizQuestions.length - 1) {
                setStep(step + 1);
            } else {
                onComplete(answers);
            }
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const progress = ((step + 1) / quizQuestions.length) * 100;
    const currentQuestion = quizQuestions[step];

    return html`
        <div class="page-container">
            <div class="quiz-container">
                <div class="progress-bar">
                    <div class="progress-bar-inner" style=${{ width: `${progress}%` }}></div>
                </div>
                <div class="quiz-question">
                    <h2>${currentQuestion.question}</h2>
                    <div class="quiz-options">
                        ${currentQuestion.options.map(option => html`
                            <label>
                                <input type="radio" name="option" value=${option} checked=${answers[step] === option} onChange=${() => handleAnswer(option)} />
                                <span>${option}</span>
                            </label>
                        `)}
                    </div>
                </div>
                <div class="quiz-navigation">
                    <button class="quiz-button secondary" onClick=${handleBack} disabled=${step === 0}>Back</button>
                    <button class="quiz-button" onClick=${handleNext} disabled=${answers[step] === undefined}>
                        ${step === quizQuestions.length - 1 ? 'Finish & See Results' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    `;
};

const LoadingState = () => html`
    <div class="page-container loading-container">
        <div class="spinner"></div>
        <p>Analyzing your potential and charting your course...</p>
    </div>
`;

const ErrorState = ({ message }) => html`
    <div class="page-container">
        <div class="error-message">
            <h3>Oops! Something went wrong.</h3>
            <p>${message}</p>
        </div>
    </div>
`;

const DashboardPage = ({ quizAnswers }) => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const generateRecommendations = async () => {
            if (!ai) {
                setError("AI service is not available. Please check API key configuration.");
                setLoading(false);
                return;
            }

            const answersText = Object.entries(quizAnswers).map(([index, answer]) => {
                return `Q: ${quizQuestions[index].question}\nA: ${answer}`;
            }).join('\n\n');

            const prompt = `
A student from a Tier 2/3 city in India has answered a career interest quiz. Based on their answers below, act as an expert career counselor. 
Provide 3 diverse and actionable career path recommendations suitable for the Indian job market. For each career, provide a short, encouraging description and list key skills to learn.
The output MUST be a JSON object that strictly follows this schema. Do not add any extra text or markdown formatting.

Student's Answers:
${answersText}
`;
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: careerSchema,
                    },
                });
                const data = JSON.parse(response.text);
                setResults(data);
            } catch (err) {
                console.error("Gemini API Error:", err);
                setError("Could not generate recommendations. The AI model might be busy. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        generateRecommendations();
    }, [quizAnswers]);

    if (loading) return html`<${LoadingState} />`;
    if (error) return html`<${ErrorState} message=${error} />`;
    if (!results || !results.careers) return html`<${ErrorState} message="The AI returned an unexpected result. Please try the quiz again." />`;

    return html`
        <div class="page-container">
            <div class="page-header">
                <h1>Your Personalized Dashboard</h1>
                <p>Based on your answers, here are some career paths you might excel in.</p>
            </div>
            <div class="card-grid dashboard-grid">
                ${results.careers.map(career => html`
                    <div class="card">
                        <h3>${career.title}</h3>
                        <p>${career.description}</p>
                        <h4>Key Skills to Build:</h4>
                        <ul class="skills-list">
                            ${career.skills.map(skill => html`<li class="skill-tag">${skill}</li>`)}
                        </ul>
                    </div>
                `)}
            </div>
        </div>
    `;
};

const MentorsPage = () => html`
    <div class="page-container">
        <div class="page-header">
            <h1>Connect with Mentors</h1>
            <p>Learn from experienced professionals in your field of interest.</p>
        </div>
        <div class="card-grid">
            ${mentors.map(mentor => html`
                <div class="card mentor-card">
                    <div class="card-header">
                        <div class="mentor-avatar">${mentor.avatar}</div>
                        <div class="mentor-info">
                            <h3>${mentor.name}</h3>
                            <p>${mentor.role} at ${mentor.company}</p>
                        </div>
                    </div>
                    <h4>Areas of Expertise:</h4>
                    <ul class="skills-list">
                        ${mentor.expertise.map(skill => html`<li class="skill-tag">${skill}</li>`)}
                    </ul>
                </div>
            `)}
        </div>
    </div>
`;


const App = () => {
    const [route, setRoute] = useState(location.hash.slice(1) || '/');
    const [quizAnswers, setQuizAnswers] = useState(null);
    const [theme, setTheme] = useState('light');

    const handleNavigation = (path) => {
        // Setting hash will trigger the 'hashchange' event listener
        location.hash = path;
    };

    const handleQuizComplete = (answers) => {
        setQuizAnswers(answers);
        handleNavigation('/dashboard');
    };
    
    const handleThemeToggle = useCallback(() => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }, [theme]);

    useEffect(() => {
        // Setup theme on initial load
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Setup router
        const handleHashChange = () => setRoute(location.hash.slice(1) || '/');
        window.addEventListener('hashchange', handleHashChange);
        
        // Initial route check
        handleHashChange();

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // This effect protects the dashboard route
    useEffect(() => {
        if (route === '/dashboard' && !quizAnswers) {
            handleNavigation('/');
        }
    }, [route, quizAnswers]);


    const renderPage = () => {
        switch (route) {
            case '/quiz':
                return html`<${QuizPage} onComplete=${handleQuizComplete} />`;
            case '/dashboard':
                // Show a loading state or nothing while the redirect effect runs
                return quizAnswers ? html`<${DashboardPage} quizAnswers=${quizAnswers} />` : html`<${LoadingState} />`;
            case '/mentors':
                return html`<${MentorsPage} />`;
            case '/':
            default:
                return html`<${HomePage} onNavigate=${handleNavigation} />`;
        }
    };

    return html`
        <${Header} onNavigate=${handleNavigation} theme=${theme} toggleTheme=${handleThemeToggle} />
        <main>
            ${renderPage()}
        </main>
    `;
};

render(html`<${App} />`, document.getElementById('app'));