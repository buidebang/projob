<!--
name: "Data: Published model catalog seed guidance"
description: "Documents the compiled-in copy of the published model catalog: its role until the first fetch and as the version floor, its refresh from the CDN at release-branch cut time, the fixture copy on main, and not hand-editing rows"
ccVersion: "2.1.283"
-->
Compiled-in copy of the published Claude Code model catalog (https://downloads.claude.ai/model-catalog/v1/catalog.json): what a third-party session reads until its first fetch, and the version floor. Release branches refresh this file at cut time with anthropics/actions/refresh-model-catalog-seed (create-release-branch.yml), which writes the CDN's exact bytes and drops this note; the copy on main is a fixture (scripts/model-catalog/README.md, 'Refreshing the compiled seed'). Do not hand-edit rows.
