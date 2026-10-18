<!--
name: "Tool Description: Agent (when to launch subagents, lean rewrite)"
description: "Describes available agent types, optional fork context inheritance, default agent selection, and plan-specific delegation restrictions"
ccVersion: "2.1.301"
variables:
  - "TOOL_BASE_DESCRIPTION"
  - "AVAILABLE_AGENT_TYPES_NOTICE"
  - "PRO_PLAN_SUBAGENT_RESTRICTION_NOTE"
  - "AGENT_TOOL_NAME"
  - "CAN_FORK_CONTEXT"
  - "HAS_GENERAL_PURPOSE_AGENT"
  - "GENERAL_PURPOSE_AGENT_UNAVAILABLE_INSTRUCTIONS"
-->
${TOOL_BASE_DESCRIPTION}. There are different types of agents that you can launch, with each type having specific capabilities and tools available to it.

${AVAILABLE_AGENT_TYPES_NOTICE}${PRO_PLAN_SUBAGENT_RESTRICTION_NOTE}

When using the ${AGENT_TOOL_NAME} tool, specify a subagent_type to choose which type of agent you want to launch.${CAN_FORK_CONTEXT?' A type of "fork" forks yourself, allowing the fork to inherit your full conversation and context, and ensuring that it runs on the same model that you are running on (a `model` override is ignored for forks). For other types of subagents, they start fresh without your context window.':" Subagents start fresh without your context window."} ${HAS_GENERAL_PURPOSE_AGENT?"If omitted, the general-purpose agent is used.":GENERAL_PURPOSE_AGENT_UNAVAILABLE_INSTRUCTIONS}
