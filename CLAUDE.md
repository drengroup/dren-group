# CLAUDE.md

<!-- DREN-GUARDRAILS v1 — always-on top rules. Full: invoke the dren-guardrails skill / see tadr-platform/docs/LESSONS-LEARNED.md -->
## ⛔ Dren Guardrails — check before you build or ship
1. **Verify behavior, not a 200** — exercise the real path as the real user/anon before saying "done".
2. **No silent failures** — never swallow errors; if an expected log/row stops appearing, something broke.
3. **No `qual=true` RLS on tenant data** — scope every policy; test as anon (locked table → `[]`).
4. **Never guess a contract or money unit** — read the type defs; confirm decimal-DOP vs minor before any emit; dry-run + eyeball totals.
5. **merge ≠ deploy** — deploy the function/site separately, then smoke-test live.
6. **Don't assume at scale** — per-repo audit before portfolio rollouts; secrets never in git; `curl` not urllib for Supabase/Stripe mgmt; persist to disk before session end.

<!-- /DREN-GUARDRAILS v1 -->
