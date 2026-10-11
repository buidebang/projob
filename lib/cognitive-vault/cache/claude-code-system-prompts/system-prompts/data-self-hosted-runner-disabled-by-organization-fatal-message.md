<!--
name: "Data: Self-hosted runner disabled-by-organization fatal message"
description: "Runner fatal message printed when RegisterRunner is refused because self-hosted environments are not enabled for the organization, pointing to the Allow self-hosted environments admin setting and Team or Enterprise plan requirement, and noting the environment secret was accepted and should not be rotated"
ccVersion: "2.1.296"
variables:
  - "REGISTER_RUNNER_ERROR_MESSAGE"
-->
[runner:fatal] RegisterRunner refused because self-hosted environments are not enabled for this organization. Usually the 'Allow self-hosted environments' setting on the Cloud environments admin page (claude.ai/admin-settings/cloud-environments) is off, and an organization Owner can turn it on. Self-hosted environments also need a Team or Enterprise plan, and the setting usually applies within a few minutes. If this message still appears after that, contact your Anthropic account team. The environment secret was accepted, so do not rotate it. (${REGISTER_RUNNER_ERROR_MESSAGE})
