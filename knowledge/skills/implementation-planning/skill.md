---
type: skill
id: implementation-planning
title: Implementation Planning Skill
version: 1
group: delivery
applies_to:
  - implementation-agent
  - work-item-agent
---
# Implementation Planning Skill

## Purpose

Standardize the plan produced before implementation starts.

## When to use

Before writing code for a ready Work Item.

## Inputs

The context pack and the ready Work Item.

## Output

A plan with: technical scope, expected files, risks, validations, out of scope, implementation
steps, and stop criteria (when to pause and ask).

## Rules

- Do not start coding without confirmation.
- Do not expand scope.
- Never make commits or push — suggest only.

## Quality checklist

- Scope and expected files are explicit.
- Risks and validations are listed.
- Stop criteria are defined.

## Example output

A numbered plan covering the sections above, ending with a request to confirm before coding.
