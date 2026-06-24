---
type: skill
id: work-item-refinement
title: Work Item Refinement Skill
version: 1
group: delivery
applies_to:
  - work-item-agent
  - backlog-agent
  - roadmap-agent
---
# Work Item Refinement Skill

## Purpose

Standardize how a Work Item is sharpened from a rough idea into a ready, implementable item.

## When to use

When improving a draft Work Item, or turning a backlog idea / roadmap candidate into a ready item.

## Inputs

The context pack and the Work Item (draft or candidate).

## Output

An improved Work Item with: problem, expected result, scope, out of scope, acceptance criteria,
validation (how to test it), definition of done, open questions and dependencies.

## Rules

- Do not implement code.
- Do not expand scope without explicit confirmation.
- Do not create mega Work Items — split when it covers multiple outcomes.
- Keep acceptance criteria testable.

## Quality checklist

- Problem and expected result are unambiguous.
- Scope and out-of-scope are explicit.
- Acceptance criteria and validation are present and testable.
- Open questions and dependencies are surfaced, not hidden.

## Example output

A Work Item markdown with the sections above filled in, ready for the implementation-agent.
