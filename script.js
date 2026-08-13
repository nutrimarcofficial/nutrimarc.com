// Dynamic Time Greeting
document.addEventListener("DOMContentLoaded", () => {
    const greeting = document.getElementById("dynamic-greeting");
    const hour = new Date().getHours();
    let text = "Welcome to Nutrimarc";

    if (hour < 12) text = "Good Morning — Welcome to Nutrimarc";
    else if (hour < 18) text = "Good Afternoon — Welcome to Nutrimarc";
    else text = "Good Evening — Welcome to Nutrimarc";

    if (greeting) greeting.textContent = text;
    
    initCounters();
});

// Interactive Subscription Handling
function handleSubscribe(event) {
    event.preventDefault();
    const msg = document.getElementById("sub-msg");
    msg.textContent = "✓ Success! You're on Nutrimarc's update notification list.";
    event.target.reset();
}

// Counter Animation for Metrics
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = +entry.target.getAttribute('data-target');
                let count = 0;
                const update = () => {
                    count += Math.ceil(target / 100);
                    if (count < target) {
                        entry.target.innerText = count;
                        setTimeout(update, 20);
                    } else {
                        entry.target.innerText = target;
                    }
                };
                update();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}