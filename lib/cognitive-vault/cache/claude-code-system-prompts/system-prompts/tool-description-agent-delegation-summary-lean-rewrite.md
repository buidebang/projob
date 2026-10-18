<!--
name: "Tool Description: Agent delegation summary (lean rewrite)"
description: "Recommends subagents for substantial parallel work and nonblocking side tasks while discouraging trivial or duplicated lookups"
ccVersion: "2.1.301"
-->
In conclusion, it is best to use subagents for parallelizing your intelligence, for saving time, and for completing side-quests which do not block the main goal that you're actively working on. It is best to provide them with broad amounts of high-level context as well as their specific goals when you do use them. If the amount of work to be done is small (for example, just making a few file reads or searches or tool calls), that is probably not enough to warrant using a subagent.

For a single-fact lookup where you already know the file, symbol, or value, search directly. And once you've delegated a search, wait for the result to return rather than also running it yourself.
