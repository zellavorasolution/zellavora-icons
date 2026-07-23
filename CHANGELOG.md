# Changelog

All notable changes to `@zellavora/icons` are documented here. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Release entries below `Unreleased` are generated automatically by the release
workflow from the commit log between tags.

## [Unreleased]

### Added

- Initial ecosystem: deterministic SVG pipeline (scan → validate → optimize →
  normalize → generate), signal-first `<zv-icon>` component, in-memory registry,
  `provideZvIcons()` provider, `zv-icons` CLI, and the `@zellavora/icons/generated`
  tree-shakeable entry point.
- Sample icons across `outline` and `filled` variants.
- CI (lint · typecheck · test · build · determinism check) and an automated,
  provenance-signed npm + GitHub release workflow.
