async function testEnvironment() {
  console.log("--- THE SERVER TEST ---");
  try {
    const res = await fetch("http://localhost:3000/");
    console.log("Local Server check: " + res.status);
  } catch (err: any) {
    console.log("Local Server check failed: " + err.message);
  }

  console.log("\n--- THE HEADLESS UI TEST ---");
  console.log("Skipping actual install of puppeteer in this script, but recording environment limits.");

  console.log("\n--- THE NETWORK TEST ---");
  try {
    const res = await fetch("https://httpbin.org/status/429");
    console.log("Outbound Network check: " + res.status);
  } catch (err: any) {
    console.log("Outbound Network check failed: " + err.message);
  }
}
testEnvironment();
