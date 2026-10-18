<!--
name: "Data: Cloud session folder sync consent dialog"
description: "UI copy for the consent dialog shown when opening a cloud session from a folder recognized as a checkout of that session's repository, explaining two-way sync, conflict handling, and answer persistence across future cloud sessions from the folder"
ccVersion: "2.1.282"
-->
This folder is a checkout of the repository the cloud session works in. If you allow it, Claude Code keeps the two in step while this computer is attached: your changes here (including uncommitted ones) are copied into the session's checkout, and Claude's changes there are copied into this folder. Your own edits are never overwritten: when both sides changed a file, yours keeps its name and Claude's version is saved beside it. Your answer is remembered for this folder, and it is the same answer asked for when you start a new cloud session from this folder (claude --cloud): after a Yes, those sessions sync this folder's files into the cloud too, without asking again.
