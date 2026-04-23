export type Era = 'industrial' | 'earth' | 'vibrant' | 'stark' | 'emotional';

export interface Record {
  id: string;
  title: string;
  subtitle: string;
  catalogNumber: string;
  era: Era;
  tracks: Track[];
}

export interface Track {
  title: string;
  description: string;
  tech?: string[];
  date?: string;
  impact?: string;
  links?: {
    repo?: string;
    demo?: string;
    case?: string;
  };
  featured?: boolean;
}

export const eraThemes = {
  industrial: {
    sleeveColor: 'linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%)',
    accentColor: '#DC2626',
    labelColor: '#EF4444',
    textColor: '#FFFFFF',
  },
  earth: {
    sleeveColor: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)',
    accentColor: '#000000',
    labelColor: '#F59E0B',
    textColor: '#000000',
  },
  vibrant: {
    sleeveColor: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
    accentColor: '#FBBF24',
    labelColor: '#F472B6',
    textColor: '#FFFFFF',
  },
  stark: {
    sleeveColor: '#FFFFFF',
    accentColor: '#10B981',
    labelColor: '#6EE7B7',
    textColor: '#000000',
  },
  emotional: {
    sleeveColor: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)',
    accentColor: '#06B6D4',
    labelColor: '#22D3EE',
    textColor: '#FFFFFF',
  },
};

export const records: Record[] = [
  {
    id: "projects",
    title: "Projects",
    subtitle: "Personal Builds & Systems",
    catalogNumber: "ST-001",
    era: 'vibrant',
    tracks: [
      {
        title: "OrderBook",
        description: "High-performance, thread-safe C++20 limit order book with 5 order types, FIFO matching, and real-time microstructure queries",
        tech: ["C++20", "Systems Programming", "Low-latency", "Trading Systems"],
        date: "March 2026",
        impact: "Thread-safe design • FIFO matching engine • Microstructure analytics",
        links: { repo: "https://github.com/shlok1806/OrderBook" },
        featured: true,
      },
      {
        title: "ScrollClash (Scroll Royale)",
        description: "1v1 competitive doomscrolling iOS game with real-time scoring — built at HackIllinois",
        tech: ["Swift", "SwiftUI", "Supabase", "Real-time"],
        date: "February 2026",
        impact: "Real-time matchmaking • Live leaderboard • Low-latency UX",
        links: { repo: "https://github.com/shlok1806/ScrollClash" },
        featured: true,
      },
      {
        title: "blueprint-qa",
        description: "AI-powered construction drawing QA using Claude Opus 4 + OCR",
        tech: ["Python", "FastAPI", "Claude AI", "OCR", "PostgreSQL", "SvelteKit"],
        date: "March 2026",
        impact: "AI document analysis • OCR integration • Full-stack implementation",
        links: { repo: "https://github.com/shlok1806/blueprint-qa" },
        featured: true,
      },
      {
        title: "Options-Pricing-Risk-Management-Suite",
        description: "Options pricing and risk management suite — Black-Scholes, Monte Carlo simulation, and Greeks",
        tech: ["Python", "Black-Scholes", "Monte Carlo", "Streamlit"],
        date: "August 2025",
        impact: "Multiple pricing models • Greeks calculation • Interactive parameter exploration",
        links: { repo: "https://github.com/shlok1806/Options-Pricing-Risk-Management-Suite" },
        featured: true,
      },
      {
        title: "feelens",
        description: "Stripe Fee Intelligence Dashboard — see exactly where your Stripe fees go",
        tech: ["TypeScript", "Stripe API", "React"],
        date: "April 2026",
        impact: "Fee breakdown visualization • Cost analysis • Interactive dashboard",
        links: { repo: "https://github.com/shlok1806/feelens" },
        featured: true,
      },
      {
        title: "autodock",
        description: "Automated docking simulation tool for molecular modeling",
        tech: ["Python", "Molecular Modeling", "Simulation"],
        date: "November 2025",
        impact: "Automated workflow • Simulation optimization",
        links: { repo: "https://github.com/shlok1806/autodock" },
      },
      {
        title: "EuropeanOptionPricer",
        description: "European option pricer implementing the Black-Scholes model in C++",
        tech: ["C++", "Black-Scholes", "Quantitative Finance"],
        date: "July 2025",
        impact: "Efficient C++ implementation • Analytical solutions",
        links: { repo: "https://github.com/shlok1806/EuropeanOptionPricer" },
      },
      {
        title: "illinois-wage-gap-analysis",
        description: "Data analysis of the wage gap across industries in Illinois",
        tech: ["Python", "Econometrics", "Streamlit"],
        date: "June 2025",
        impact: "Mincer equation • Oaxaca-Blinder decomposition • Policy simulation",
        links: { repo: "https://github.com/shlok1806/illinois-wage-gap-analysis" },
      },
      {
        title: "PolicyAnalyser",
        description: "Policy analysis tool for economic and legislative data exploration",
        tech: ["Python", "Data Analysis"],
        date: "June 2025",
        impact: "Legislative impact modeling • Data-driven insights",
        links: { repo: "https://github.com/shlok1806/PolicyAnalyser" },
      },
      {
        title: "LendingPrediction",
        description: "ML model for predicting lending outcomes with evaluation metrics and interactive demo",
        tech: ["Python", "Jupyter", "Scikit-learn", "Machine Learning"],
        date: "May 2025",
        impact: "ROC curve analysis • Confusion matrix • Persisted model deployment",
        links: { repo: "https://github.com/shlok1806/LendingPrediction" },
      },
      {
        title: "MonteCarlo-Simulation",
        description: "Monte Carlo simulation framework for financial modeling",
        tech: ["Python", "Monte Carlo", "Quantitative Finance"],
        date: "May 2025",
        impact: "Flexible simulation engine • Financial applications",
        links: { repo: "https://github.com/shlok1806/MonteCarlo-Simulation" },
      },
      {
        title: "Macro-Insight",
        description: "Interactive macroeconomic dashboard with live Fed data and policy analysis",
        tech: ["Python", "Streamlit", "Data Visualization"],
        date: "May 2025",
        impact: "Live Fed data integration • Policy analysis visualization",
        links: { repo: "https://github.com/shlok1806/Macro-Insight" },
      },
      {
        title: "MontyHallProblem",
        description: "Monte Carlo simulation exploring the Monty Hall probability paradox",
        tech: ["Jupyter Notebook", "Python"],
        date: "May 2025",
        impact: "Empirical validation • Probabilistic reasoning",
        links: { repo: "https://github.com/shlok1806/MontyHallProblem" },
      },
      {
        title: "Minti",
        description: "Calendar-integrated AI financial advisor with smart spending logic",
        tech: ["JavaScript", "HTML", "Python", "AI/ML"],
        date: "March 2025",
        impact: "Next-step decision framework • Calendar + spending integration",
        links: { repo: "https://github.com/shlok1806/Minti" },
      },
      {
        title: "PersonalWebsite",
        description: "Deployed personal portfolio site built with Vite and hosted on Vercel",
        tech: ["CSS", "Vite", "Vercel"],
        date: "July 2025",
        impact: "Live deployment • Contact form integration",
        links: { repo: "https://github.com/shlok1806/PersonalWebsite", demo: "https://shlokthakkar.vercel.app" },
      },
    ],
  },
  {
    id: "experience",
    title: "Experience",
    subtitle: "Work & Research",
    catalogNumber: "ST-002",
    era: 'stark',
    tracks: [
      {
        title: "Undergraduate Researcher @ Parallel Programming Lab",
        date: "Jan 2026 - Present",
        description: "Conducting research at the Parallel Programming Lab at UIUC, focused on parallel computing systems and high-performance software infrastructure",
        tech: ["C++", "Parallel Computing", "Systems Programming"],
        impact: "UIUC Parallel Programming Lab",
      },
      {
        title: "Software Engineer @ Disruption Lab",
        date: "Sep 2025 - Present",
        description: "Built and optimized backend services for a Neo4j-backed web app used in production by 40+ researchers for DSRS project tracking",
        tech: ["Neo4j", "REST APIs"],
        impact: "Production backend for 40+ researchers",
      },
      {
        title: "Research Assistant @ Department of Finance",
        date: "Jun 2025 - Present",
        description: "Built an entity-matching pipeline across 10M+ procurement vendor records using Levenshtein distance and TF-IDF similarity",
        tech: ["Python", "TF-IDF", "Levenshtein", "Parallel processing"],
        impact: "73% runtime reduction (48 → 13 hours)",
      },
      {
        title: "Software Engineering Intern @ IQM Corporation",
        date: "Jun 2025 - Aug 2025",
        description: "Built a personality-matching API using Amazon Bedrock + FastAPI for 10,000 profiles; deployed on AWS EC2 for 40+ internal users",
        tech: ["Amazon Bedrock", "FastAPI", "AWS EC2", "AWS S3"],
        impact: "S3 ingestion pipeline (<30s results)",
      },
    ],
  },
  {
    id: "skills",
    title: "Skills",
    subtitle: "Technical Proficiencies",
    catalogNumber: "ST-003",
    era: 'earth',
    tracks: [
      { title: "Languages", description: "C++, C, Python, Java, SQL, JavaScript" },
      { title: "Systems & Tools", description: "Linux/Unix, Bash, Git/GitHub, Perforce, GDB, Valgrind" },
      { title: "Backend & Web", description: "REST APIs, Flask, FastAPI, Django, Spring Boot" },
      { title: "Databases", description: "PostgreSQL, MySQL, MongoDB, Neo4j" },
      { title: "Cloud & DevOps", description: "Azure, AWS (EC2, S3), Docker, Kubernetes, CI/CD" },
      { title: "Testing & Security", description: "PyTest, JUnit, GoogleTest, OAuth2, TLS/SSL" },
    ],
  },
  {
    id: "education",
    title: "Education",
    subtitle: "Academic Background",
    catalogNumber: "ST-004",
    era: 'industrial',
    tracks: [
      {
        title: "University of Illinois Urbana-Champaign",
        description: "B.S. Computer Science + Economics • Statistics minor",
        date: "Expected May 2028",
        impact: "GPA: 3.97/4.0",
      },
      {
        title: "Relevant Coursework",
        description: "Data Structures & Algorithms, Computer Architecture, Statistical Analysis I & II, Algorithms & Models of Computation",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    subtitle: "Let's Connect",
    catalogNumber: "ST-005",
    era: 'vibrant',
    tracks: [
      { title: "Email", description: "shlokthakkar1806@gmail.com", links: { demo: "mailto:shlokthakkar1806@gmail.com" } },
      { title: "Phone", description: "+1 217-255-3034", links: { demo: "tel:+12172553034" } },
      { title: "LinkedIn", description: "Connect with me professionally", links: { demo: "https://www.linkedin.com/in/shlok-thakkar/" } },
      { title: "GitHub", description: "Check out my code", links: { demo: "https://github.com/shlok1806" } },
      { title: "Location", description: "Champaign, IL • Open to opportunities nationwide" },
    ],
  },
  {
    id: "blog",
    title: "Awards",
    subtitle: "Hackathons & Recognition",
    catalogNumber: "ST-006",
    era: 'emotional',
    tracks: [
      {
        title: "🥈 2nd Place — HERE Chicago Hackathon",
        description: "Placed 2nd out of competing teams at the HERE Chicago Hackathon, building a location-intelligence powered application leveraging HERE Maps APIs",
        date: "2025",
        impact: "Top 2 finish • HERE Technologies sponsorship",
        tech: ["HERE Maps API", "Location Intelligence"],
        featured: true,
      },
      {
        title: "HackIllinois — ScrollClash",
        description: "Built ScrollClash (Scroll Royale), a 1v1 competitive doomscrolling iOS game with real-time matchmaking at HackIllinois",
        date: "February 2026",
        impact: "Real-time multiplayer • Live leaderboard",
        tech: ["Swift", "SwiftUI", "Supabase"],
      },
    ],
  },
];
