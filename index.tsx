/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchemaType } from "@google/generative-ai";
import { render } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { html } from 'htm/preact';
import { getGenAIClient } from './genaiClient'; // ✅ Importing the GenAI client from separate file

// --- MOCK DATA (to be replaced with Firebase) ---
const quizQuestions = [/* ... (same as yours) ... */];

const mentors = [/* ... (same as yours) ... */];

// --- Schema ---
const careerSchema = {
    type: SchemaType.OBJECT,
    properties: {
        careers: {
            type: SchemaType.ARRAY,
            description: "A list of 3 diverse and personalized career path recommendations.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    title: { type: SchemaType.STRING, description: "Career path title." },
                    description: { type: SchemaType.STRING, description: "Short description." },
                    skills: {
                        type: SchemaType.ARRAY,
                        description: "List of skills.",
                        items: { type: SchemaType.STRING }
                    }
                },
                required: ["title", "description", "skills"]
            }
        }
    },
    required: ["careers"]
};

// --- Components (Add your own Header, HomePage, QuizPage, etc.) ---
// Sample placeholder components below (replace with your own if needed)
const LoadingState = () => html`<div>Loading...</div>`;
const ErrorState = ({ message }) => html`<div style="color:red">${message}</div>`;
const Header = ({ onNavigate, theme, toggleTheme }) => html`
    <header>
        <nav>
            <button onClick=${() => onNavigate("/")}>Home</button>
            <button onClick=${() => onNavigate("/quiz")}>Quiz</button>
            <button onClick=${() => onNavigate("/mentors")}>Mentors</button>
            <button onClick=${toggleTheme}>Toggle Theme (${theme})</button>
        </nav>
    </header>
`;

const HomePage = ({ onNavigate }) => html`
    <div>
        <h1>Welcome to the Career AI Mentor</h1>
        <button onClick=${() => onNavigate("/quiz")}>Start Quiz</button>
    </div>
`;

const QuizPage = ({ onComplete }) => {
    const [answers, setAnswers] = useState({});

    const handleSubmit = () => {
        onComplete(answers);
    };

    return html`
        <div>
            <h2>Quiz</h2>
            <!-- Replace with actual questions -->
            <button onClick=${handleSubmit}>Submit</button>
        </div>
    `;
};

const MentorsPage = () => html`<div><h2>Mentors</h2><p>Mentor list goes here...</p></div>`;

// --- DashboardPage Component ---
const DashboardPage = ({ quizAnswers }) => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const generateRecommendations = async () => {
            const ai = getGenAIClient();
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
                setError("Could not generate recommendations. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        generateRecommendations();
    }, [quizAnswers]);

    if (loading) return html`<${LoadingState} />`;
    if (error) return html`<${ErrorState} message=${error} />`;
    if (!results || !results.careers) return html`<${ErrorState} message="Unexpected response from AI. Try again." />`;

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

// --- App Component ---
const App = () => {
    const [route, setRoute] = useState(location.hash.slice(1) || '/');
    const [quizAnswers, setQuizAnswers] = useState(null);
    const [theme, setTheme] = useState('light');

    const handleNavigation = (path) => location.hash = path;

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
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        const handleHashChange = () => setRoute(location.hash.slice(1) || '/');
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

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

// --- Render App ---
render(html`<${App} />`, document.getElementById('app'));
