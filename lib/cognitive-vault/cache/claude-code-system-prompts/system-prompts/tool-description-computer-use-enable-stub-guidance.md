<!--
name: "Tool Description: Computer use enable stub guidance"
description: "Directs the agent to use already-present remote-device computer tools, verify connectivity by calling them, and explain how to recover when the desktop app does not respond"
ccVersion: "2.1.300"
variables:
  - "REMOTE_COMPUTER_TOOL_PREFIX"
  - "DEFERRED_DEVICE_TOOL_LOADING_GUIDANCE"
  - "TOOL_SEARCH_TOOL_NAME"
-->
The computer-use tools are the ${REMOTE_COMPUTER_TOOL_PREFIX} tools; there is no separate enable step. ${DEFERRED_DEVICE_TOOL_LOADING_GUIDANCE}: load them all in one ${TOOL_SEARCH_TOOL_NAME} call (query "${REMOTE_COMPUTER_TOOL_PREFIX}", max_results 100), and use them once that result has come back, not in the same reply. Try the user's request with them, asking for access to the applications you need first, the way those tools describe. Don't tell the user their computer is connected until a call to one of them has succeeded; if calls keep not responding, the Claude app on the user's computer isn't answering: it may be closed or the computer asleep. Tell the user that, ask them to open the Claude app on that computer, and carry on with what you can do here. If you have no such tools here, tell the user that computer use isn't available on their computer right now and that the Claude app on that computer may show why under Settings → This computer → Computer use, then continue with what you can do here. Don't say a permission was denied unless a result says so.
