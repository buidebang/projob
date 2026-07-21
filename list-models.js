const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI("AIzaSyBhsTDPryJ4jFq6gp5hPlCYXilrKhxQbR8");

// The v0.24.1 SDK doesn't natively expose listModels well sometimes. Wait, wait, this API key might be constrained. Let's see if we can do a manual HTTP request to list models.
async function run() {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyBhsTDPryJ4jFq6gp5hPlCYXilrKhxQbR8');
    const json = await res.json();
    console.log(json);
}
run();
