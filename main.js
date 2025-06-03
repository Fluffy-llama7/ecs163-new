import { drawSankeyChart } from './sankey-vis2.js';
import { drawWomenAndMenBarCharts } from './barchart-v1.js';
import { drawTreemap } from './treemap.js';

document.addEventListener("DOMContentLoaded", () => {
    drawSankeyChart();
    drawWomenAndMenBarCharts();
    drawTreemap();
    // Smooth scroll for navigation
    const navLinks = document.querySelectorAll("nav a[href^='#']");
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href").substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
    
    // Fade-in effect on scroll
    const observerOptions = {
        threshold: 0.15
    };

    const fadeInCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(fadeInCallback, observerOptions);

    document.querySelectorAll(".story-section").forEach(section => {
        section.style.opacity = 0;
        section.style.transform = "translateY(40px)";
        section.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";
        observer.observe(section);
    });

    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        document.body.style.setProperty('--scroll', scrollY);
        document.body.style.setProperty('--scrollFactor', scrollY * 0.1);
        document.body.style.backgroundPosition = `center ${scrollY * 0.1}px`;
    });
});
