const BACKBOARD_BASE_URL = "https://app.backboard.io/api";

async function backboardRequest(endpoint, method = "GET", body = null, isForm = false) {
    const url = `${BACKBOARD_BASE_URL}${endpoint}`;
    console.log(`Calling: ${method} ${url}`);

    const headers = {
        "x-api-key": process.env.BACKBOARD_API_KEY,
    };

    let fetchBody = undefined;
    if (body) {
        if (isForm) {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(body)) {
                params.append(key, value);
            }
            fetchBody = params;
        } else {
            headers["Content-Type"] = "application/json";
            fetchBody = JSON.stringify(body);
        }
    }

    const res = await fetch(url, { method, headers, body: fetchBody });

    if (!res.ok) {
        const err = await res.text();
        console.log(`Failed URL: ${url}`);
        throw new Error(`Backboard API error ${res.status}: ${err}`);
    }
    return res.json();
}

let auditorAssistantId = null;

async function getOrCreateAssistant() {
    if (auditorAssistantId) return auditorAssistantId;

    console.log("🔄 Creating assistant...");
    const assistant = await backboardRequest("/assistants", "POST", {
        name: "Parliamentary Auditor",
        system_prompt: `You are a strict, objective Parliamentary Auditor.
        Evaluate whether political promises are Pending, In Progress, Fulfilled, or Broken.
        Calculate a completion percentage (0-100%) and write a 2-sentence rationale.
        Always respond in valid JSON only. Never use markdown or backticks.`
    });

    console.log("Assistant response:", assistant);
    auditorAssistantId = assistant.assistant_id;
    return auditorAssistantId;
}

// Helper to strip markdown code blocks from AI response
function cleanJSON(text) {
    return text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
}

async function verifyPromises(promises) {
    const assistantId = await getOrCreateAssistant();
    console.log(`Using assistant: ${assistantId}`);

    const thread = await backboardRequest(`/assistants/${assistantId}/threads`, "POST", {});
    console.log(`Thread created: ${thread.thread_id}`);

    const results = [];

    for (const promise of promises) {
        const response = await backboardRequest(`/threads/${thread.thread_id}/messages`, "POST", {
            content: `Evaluate this promise: "${promise.original_quote}"
            Respond in pure JSON only, no markdown, no backticks:
            {
                "status": "In Progress or Fulfilled or Broken or Pending",
                "completion_percentage": 60,
                "rationale": "2 sentence explanation."
            }`,
            stream: "false"
        }, true);

        console.log(`Raw AI response:`, response.content);
        const cleaned = cleanJSON(response.content);
        console.log(`Cleaned response:`, cleaned);
        const auditResult = JSON.parse(cleaned);
        results.push({ promise_id: promise._id, ...auditResult });
    }

    return results;
}

module.exports = { verifyPromises };