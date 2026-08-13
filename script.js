// Dynamic Greeting based on visitor's time of day
document.addEventListener("DOMContentLoaded", () => {
    const greetingElement = document.getElementById("dynamic-greeting");
    const hour = new Date().getHours();
    let timeGreeting = "Welcome to Nutrimarc";

    if (hour < 12) {
        timeGreeting = "Good Morning! Welcome to Nutrimarc";
    } else if (hour < 18) {
        timeGreeting = "Good Afternoon! Welcome to Nutrimarc";
    } else {
        timeGreeting = "Good Evening! Welcome to Nutrimarc";
    }

    greetingElement.textContent = timeGreeting;
});

// Subscription Form Interactivity
function handleSubscribe(event) {
    event.preventDefault();
    const msg = document.getElementById("sub-msg");
    msg.textContent = "Thank you! You have been added to our priority update list.";
    event.target.reset();
}