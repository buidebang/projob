<!--
name: "Tool Description: Artifact design skill loading guidance"
description: "Requires loading the artifact design skill before authoring while defining workshop and diagramming exceptions"
ccVersion: "2.1.268"
variables:
  - "ARTIFACT_DESIGN_SKILL_NAME"
  - "IS_WORKSHOP_SUPPORTED"
  - "WORKSHOP_SKILL_NAME"
  - "ARTIFACT_DIAGRAMMING_SKILL_NAME"
-->
**Before writing the file — a skill-instructed `.md` included — you MUST load the `${ARTIFACT_DESIGN_SKILL_NAME}` skill** to calibrate how much design investment this particular request warrants. Format is not part of that decision — the Format rule above settles it, and Markdown is never a shortcut past the design pass.${IS_WORKSHOP_SUPPORTED?` The one exception to loading it is a workshop document from the `${WORKSHOP_SKILL_NAME}` skill — both its lanes carry their own design: skip `${ARTIFACT_DESIGN_SKILL_NAME}` there, and load `${ARTIFACT_DIAGRAMMING_SKILL_NAME}` for a template page's diagrams instead.`:""} Then write the content to a file (via Write/Edit) and call Artifact with its path.
