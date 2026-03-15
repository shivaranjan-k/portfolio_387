// This file contains all the dynamic data for the portfolio.
// You can freely edit this file to add new skills or projects without touching the HTML.

window.portfolioData = {
    skills: [
        { name: "HTML", progress: 90 },
        { name: "CSS", progress: 85 },
        { name: "JavaScript", progress: 70 },
        { name: "Python", progress: 80 }
    ],
    projects: [
        {
            title: "Portfolio Website",
            description: "Responsive personal portfolio showcasing my skills and projects.",
            imageText: "Portfolio",
            imageClass: "", // e.g., 'dark' or empty
            tags: ["HTML", "CSS"],
            links: [
                { label: "Live Demo", url: "#", type: "primary" }, // type: primary or outline
                { label: "Code", url: "#", type: "outline" }
            ]
        },
        {
            title: "Task Manager",
            description: "Task management system with database integration for tracking tasks efficiently.",
            imageText: "SQL",
            imageClass: "dark",
            tags: ["Python", "MySQL"],
            links: [
                { label: "View App", url: "#", type: "primary" },
                { label: "Docs", url: "#", type: "outline" }
            ]
        }
    ]
};
