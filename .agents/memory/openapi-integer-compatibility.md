---
name: OpenAPI integer compatibility
description: Compatibility constraint between the current OpenAPI generator output and the workspace validation package.
---

Use `type: number` for API contract fields that are logically whole numbers in this workspace's current OpenAPI/Zod pipeline. The generator emits `z.int()` for OpenAPI `integer`, but the installed Zod 3 package does not expose that API, which breaks the shared library typecheck.

**Why:** The generated client/server types remain usable for counts, ages, scores, and day values, while avoiding a toolchain-wide dependency upgrade for a small demo product.

**How to apply:** If the validation package is upgraded to a Zod version supporting `z.int()`, revisit these schemas together rather than changing individual generated files.