import { drawSankeyChart } from './sankey-vis2.js';
import { drawWomenAndMenBarCharts } from './barchart-v1.js';
import { drawTreemap } from './treemap.js';

document.addEventListener("DOMContentLoaded", () => {
    //start drawing up all of our visualizations as soon as the page is ready
    drawSankeyChart();  //Draw the sankey
    drawWomenAndMenBarCharts();     //Draw the bar charts
    drawTreemap();      //Draw up the treemap

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
    
    // Options for when to trigger the fade-in animation
    // Fade-in effect on scroll
    const observerOptions = {
        // Trigger when 15% of the element is visible
        threshold: 0.15
    };

    // Callback for when a section scrolls into view
    const fadeInCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Reveal the section with a fade & a slide up
                entry.target.style.opacity = 1;
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    };

    // Set up the observer using the callback and options above
    const observer = new IntersectionObserver(fadeInCallback, observerOptions);

    // Start with sections hidden  and then slid down a bit
    document.querySelectorAll(".story-section").forEach(section => {
        section.style.opacity = 0;
        section.style.transform = "translateY(40px)";
        section.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";
        observer.observe(section);
    });

    // Update background position and custom CSS vars based on scroll
    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        document.body.style.setProperty('--scroll', scrollY);
        // A scaled version (optional)
        document.body.style.setProperty('--scrollFactor', scrollY * 0.1);
        // Gently move the background as you scroll
        document.body.style.backgroundPosition = `center ${scrollY * 0.1}px`;
    });
});
