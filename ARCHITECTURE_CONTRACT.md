# TheNahj Architecture Contract

## North Star
TheNahj is one unified wisdom knowledge system with multiple audience views.

One CMS.
One content source of truth.
One search engine.
One taxonomy system.

## Non-Negotiable Rules
1. Section comes first.
2. Themes belong to Sections.
3. Topics belong to Themes.
4. Audience mapping is independent from taxonomy.
5. Posts must not be duplicated across audience views.
6. Existing URLs and stored content must not be broken by taxonomy changes.
7. Publish logic must be deterministic and reversible.

## Canonical Content Flow
Section -> Theme -> Topic -> Audience Mapping -> Post

## Section Scoping Rules
- `Imam Ali Says`, `Nahjul Balagha`, `Ahlul Bayt (AS)`, `Khilafat`, `Important Events`, `Student Corner`, and `Youth Corner` must each own their own theme sets.
- Future sections must be added as new section-scoped taxonomy configs, not by expanding a single global theme list.
- Audience groups such as `Student`, `Youth`, `General`, `Researcher`, `Beginner`, `Advanced`, `Family`, `Teacher`, and `Scholar` remain visibility and discovery labels only.

## Compatibility Rules
- Existing Imam Ali content stays valid.
- Legacy content can keep its current taxonomy values.
- New sections can be introduced without schema-breaking migrations.

## CMS Publish Rules
1. Select section.
2. Load only that section's themes.
3. Load only the topics for the selected theme.
4. Validate the mapping before publish.
5. Generate projections, indexes, and related content from the canonical post.

## Change Safety
- No destructive rename of existing structures.
- No manual duplication workflow.
- No public release without taxonomy validation and QA checks.