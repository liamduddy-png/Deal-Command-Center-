import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Simple generation (no tools)
export async function generateWithClaude(prompt) {
  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.content[0].text;
}

// Agentic generation with tool use
// Claude calls tools (e.g. HubSpot), gets results, then generates final output
export async function generateWithTools({ system, prompt, tools, executeToolCall }) {
  const messages = [{ role: "user", content: prompt }];

  // Agentic loop — let Claude call tools until it produces a final text response
  let maxTurns = 5;
  while (maxTurns-- > 0) {
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      system,
      messages,
      tools,
    });

    // Check if Claude wants to use tools
    const toolUses = response.content.filter((b) => b.type === "tool_use");

    if (toolUses.length === 0 || response.stop_reason === "end_turn") {
      // No tool calls — extract final text
      const textBlock = response.content.find((b) => b.type === "text");
      return textBlock?.text || "";
    }

    // Add assistant message with tool use blocks
    messages.push({ role: "assistant", content: response.content });

    // Execute each tool call and collect results
    const toolResults = [];
    for (const toolUse of toolUses) {
      const result = await executeToolCall(toolUse.name, toolUse.input);
      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
    }

    // Send tool results back to Claude
    messages.push({ role: "user", content: toolResults });
  }

  // If we hit max turns, extract whatever text Claude last produced
  return "Generation reached maximum tool call depth.";
}
