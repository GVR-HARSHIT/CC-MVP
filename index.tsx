/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchemaType } from "@google/generative-ai";
import { render } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { html } from 'htm/preact';
import { getGenAIClient } from './genaiClient';

// --- QUIZ DATA ---
const quizQuestions = [
    {
        question: "What type of activities do you enjoy most in your free time?",
        options: [
            "Building or creating things with my hands",
            "Reading books or researching topics online",
            "Organizing events or leading group activities",
            "Helping friends solve their problems",
            "Drawing, writing, or other creative pursuits"
        ]
    },
    {
        question: "Which subject did you find most interesting in school?",
        options: [
            "Mathematics and Physics",
            "Biology and Chemistry",
            "History and Social Studies",
            "English and Literature",
            "Computer Science and Technology"
        ]
    },
    {
        question: "What motivates you the most?",
        options: [
            "Solving complex problems and puzzles",
            "Making a positive impact on people's lives",
            "Creating something new and innovative",
            "Leading teams and achieving goals",
            "Understanding how things work"
        ]
    },
    {
        question: "In a group project, you usually:",
        options: [
            "Take charge and delegate tasks",
            "Focus on research and analysis",
            "Come up with creative ideas",
            "Ensure everyone gets along well",
            "Handle the technical implementation"
        ]
    },
    {
        question: "What kind of work environment appeals to you?",
        options: [
            "A quiet office where I can focus deeply",
            "A collaborative space with lots of interaction",
            "A dynamic environment with variety and travel",
            "A structured workplace with clear processes",
            "A creative studio or flexible workspace"
        ]
    },
    {
        question: "Which of these skills comes most naturally to you?",
        options: [
            "Logical reasoning and problem-solving",
            "Communication and public speaking",
            "Artistic and creative expression",
            "Organization and planning",
            "Technical and analytical thinking"
        ]
    },
    {
        question: "What type of impact do you want to make?",
        options: [
            "Advance scientific knowledge and innovation",
            "Improve people's health and wellbeing",
            "Create beautiful and meaningful experiences",
            "Build successful businesses and organizations",
            "Educate and inspire the next generation"
        ]
    },
    {
        question: "How do you prefer to learn new things?",
        options: [
            "Hands-on practice and experimentation",
            "Reading detailed explanations and theory",
            "Watching demonstrations and tutorials",
            "Discussing with others and asking questions",
            "Trial and error with immediate feedback"
        ]
    }
];

const mentors = [
    {
        name: "Priya Sharma",
        expertise: "Software Engineering",
        experience: "8 years at Google & Microsoft",
        skills: ["Full-Stack Development", "System Design", "Career Growth"],
        bio: "Helping aspiring developers navigate the tech industry and build successful careers."
    },
    {
        name: "Rajesh Kumar",
        expertise: "Data Science",
        experience: "10 years in Analytics",
        skills: ["Machine Learning", "Python", "Business Intelligence"],
        bio: "Passionate about turning data into insights and mentoring the next generation of data scientists."
    },
    {
        name: "Anita Desai",
        expertise: "Digital Marketing",
        experience: "12 years in Marketing",
        skills: ["SEO", "Content Strategy", "Brand Management"],
        bio: "Expert in digital marketing strategies with experience across startups and Fortune 500 companies."
    },
    {
        name: "Vikram Singh",
        expertise: "Product Management",
        experience: "15 years in Product",
        skills: ["Strategy", "User Research", "Agile"],
        bio: "Former product leader at top tech companies, now helping others build great products."
    }
];

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

// --- Components ---
const LoadingState = () => html`
    <div class="loading-container">
        <div class="spinner"></div>
        <p>Analyzing your responses and generating personalized recommendations...</p>
    </div>
`;

const ErrorState = ({ message }) => html`
    <div class="error-message">
        <h3>Oops! Something went wrong</h3>
        <p>${message}</p>
    </div>
`;

const Header = ({ onNavigate, theme, toggleTheme }) => html`
    <header class="header">
        <div class="nav-container">
            <a href="#/" class="logo" onClick=${(e) => { e.preventDefault(); onNavigate('/'); }}>
                Career Compass
            </a>
            <div class="nav-links">
                <a href="#/" onClick=${(e) => { e.preventDefault(); onNavigate('/'); }}>Home</a>
                <a href="#/quiz" onClick=${(e) => { e.preventDefault(); onNavigate('/quiz'); }}>Take Quiz</a>
                <a href="#/mentors" onClick=${(e) => { e.preventDefault(); onNavigate('/mentors'); }}>Mentors</a>
                <button class="theme-toggle" onClick=${toggleTheme} title="Toggle theme">
                    ${theme === 'light' ? 
                        html`<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>` :
                        html`<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`
                    }
                </button>
            </div>
        </div>
    </header>
`;

const HomePage = ({ onNavigate }) => html`
    <div class="page-container">
        <div class="home-hero">
            <h1>Discover Your Perfect Career Path</h1>
            <p>Take our AI-powered quiz to get personalized career recommendations tailored for students in India. Connect with industry mentors and start building your future today.</p>
            <button class="cta-button" onClick=${() => onNavigate('/quiz')}>
                Start Your Journey
            </button>
        </div>
        
        <div class="features-section">
            <div class="card-grid">
                <div class="card">
                    <div class="feature-icon">🎯</div>
                    <h3>Personalized Recommendations</h3>
                    <p>Our AI analyzes your interests and strengths to suggest careers that match your unique profile.</p>
                </div>
                <div class="card">
                    <div class="feature-icon">🧠</div>
                    <h3>AI-Powered Insights</h3>
                    <p>Leveraging advanced AI to provide intelligent career guidance based on current market trends.</p>
                </div>
                <div class="card">
                    <div class="feature-icon">👥</div>
                    <h3>Expert Mentors</h3>
                    <p>Connect with industry professionals who can guide you on your chosen career path.</p>
                </div>
            </div>
        </div>
    </div>
`;

const QuizPage = ({ onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedOption, setSelectedOption] = useState('');

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    const handleNext = () => {
        if (selectedOption) {
            const newAnswers = { ...answers, [currentQuestion]: selectedOption };
            setAnswers(newAnswers);
            
            if (currentQuestion < quizQuestions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedOption('');
            } else {
                onComplete(newAnswers);
            }
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setSelectedOption(answers[currentQuestion - 1] || '');
        }
    };

    const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

    return html`
        <div class="page-container">
            <div class="quiz-container">
                <div class="progress-bar">
                    <div class="progress-bar-inner" style="width: ${progress}%"></div>
                </div>
                
                <div class="quiz-question">
                    <h2>Question ${currentQuestion + 1} of ${quizQuestions.length}</h2>
                    <p>${quizQuestions[currentQuestion].question}</p>
                </div>
                
                <div class="quiz-options">
                    ${quizQuestions[currentQuestion].options.map(option => html`
                        <label class=${selectedOption === option ? 'selected' : ''}>
                            <input 
                                type="radio" 
                                name="option" 
                                value=${option}
                                checked=${selectedOption === option}
                                onChange=${() => handleOptionSelect(option)}
                            />
                            <span>${option}</span>
                        </label>
                    `)}
                </div>
                
                <div class="quiz-navigation">
                    <button 
                        class="quiz-button secondary" 
                        onClick=${handlePrevious}
                        disabled=${currentQuestion === 0}
                    >
                        Previous
                    </button>
                    <button 
                        class="quiz-button" 
                        onClick=${handleNext}
                        disabled=${!selectedOption}
                    >
                        ${currentQuestion === quizQuestions.length - 1 ? 'Get Results' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    `;
};

const MentorsPage = () => html`
    <div class="page-container">
        <div class="page-header">
            <h1>Connect with Industry Mentors</h1>
            <p>Learn from experienced professionals who can guide you on your career journey.</p>
        </div>
        
        <div class="card-grid">
            ${mentors.map(mentor => html`
                <div class="card mentor-card">
                    <div class="card-header">
                        <div class="mentor-avatar">
                            ${mentor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div class="mentor-info">
                            <h3>${mentor.name}</h3>
                            <p>${mentor.expertise}</p>
                            <p class="experience">${mentor.experience}</p>
                        </div>
                    </div>
                    <p>${mentor.bio}</p>
                    <div class="skills-section">
                        <h4>Expertise:</h4>
                        <ul class="skills-list">
                            ${mentor.skills.map(skill => html`<li class="skill-tag">${skill}</li>`)}
                        </ul>
                    </div>
                </div>
            `)}
        </div>
    </div>
`;

const DashboardPage = ({ quizAnswers }) => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const generateRecommendations = async () => {
            try {
                const ai = getGenAIClient();
                
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

                const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: careerSchema,
                    },
                });

                const response = await result.response;
                const data = JSON.parse(response.text());
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
                <h1>Your Personalized Career Dashboard</h1>
                <p>Based on your quiz responses, here are career paths that align with your interests and strengths.</p>
            </div>
            
            <div class="card-grid dashboard-grid">
                ${results.careers.map((career, index) => html`
                    <div class="card career-card">
                        <div class="career-rank">#${index + 1}</div>
                        <h3>${career.title}</h3>
                        <p>${career.description}</p>
                        <div class="skills-section">
                            <h4>Key Skills to Develop:</h4>
                            <ul class="skills-list">
                                ${career.skills.map(skill => html`<li class="skill-tag">${skill}</li>`)}
                            </ul>
                        </div>
                    </div>
                `)}
            </div>
            
            <div class="next-steps">
                <div class="card">
                    <h3>Ready to take the next step?</h3>
                    <p>Connect with our mentors to get personalized guidance for your chosen career path.</p>
                    <button class="cta-button" onClick=${() => location.hash = '/mentors'}>
                        Find a Mentor
                    </button>
                </div>
            </div>
        </div>
    `;
};

// --- App Component ---
const App = () => {
    const [route, setRoute] = useState(location.hash.slice(1) || '/');
    const [quizAnswers, setQuizAnswers] = useState(null);
    const [theme, setTheme] = useState('light');

    const handleNavigation = (path) => {
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
        <div id="app">
            <${Header} onNavigate=${handleNavigation} theme=${theme} toggleTheme=${handleThemeToggle} />
            <main>
                ${renderPage()}
            </main>
        </div>
    `;
};

// --- Render App ---
render(html`<${App} />`, document.getElementById('app'));