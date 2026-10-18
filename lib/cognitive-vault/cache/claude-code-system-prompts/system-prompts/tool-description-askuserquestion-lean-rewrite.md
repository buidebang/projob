<!--
name: "Tool Description: AskUserQuestion (lean rewrite)"
description: "Limits interactive questions to genuine user decisions and explains custom answers, multiple selection, and recommended options"
ccVersion: "2.1.301"
-->
You have the ability to ask the user a question, which will pop up a simple UI for them to select an option. You should only use this tool when you're blocked on a decision that the user should genuinely make on their own, for example one which you cannot easily determine the answer to based on sensible defaults, pre-existing code, or the user's own request.

Some notes about asking the user a question via this tool:
- Users will always have an 'Other' option, allowing them to provide custom text input
- Use multiSelect: true if you'd like to allow multiple answers to be selected for your question
- If you are suggesting a specific option, always make that option the first, and add "(Recommended)" at the end of the label.
