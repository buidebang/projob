<!--
name: "System Reminder: Artifact capabilities contract unavailable"
description: "Explains a refused capability declaration and prevents publishing a page without needed new grants unless the user asks"
ccVersion: "2.1.299"
variables:
  - "CONTRACT_FETCH_ALLOWED_SESSION_GUIDANCE"
-->
Nothing was published: a publish that declares capabilities needs the current contract from the server. Tell the user that the declaration has to be published from ${CONTRACT_FETCH_ALLOWED_SESSION_GUIDANCE}. Do not publish without the capabilities field unless every capability the page needs is already stored or the user asks: a declaration already stored carries forward unchanged, but capabilities declared for the first time are not granted, so a page that depends on them will not work. If you do publish without the field (and without contract: 'latest' if you passed it), tell the user which capabilities were not granted.
