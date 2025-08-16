# Change Log — Automated Fix Pass
Date: 2025-08-15T22:05:52

## Summary
Applied the agreed fix plan to unblock builds and repaired import-line artifacts.

## Files updated
- components/InfoSidebar.tsx — rewrote component signature, added optional icon size and className, ensured client component.
- components/TwoCol.tsx — marked as client, added children-compatible API while retaining left/right props.
- app/quick-overview/page.tsx — replaced corrupted file; removed stray `\n` artifacts and nonexistent selector usage.
- app/page.tsx — normalized stray `\n` between import lines.
- components/Wizard.tsx — normalized stray `\n` in import and code lines.

## Notes
- Intentionally did not alter `lib/extract.ts` string/regex literals. Restored after an initial test to avoid breaking `\n` and `/\n+/` semantics in parsing.
- No other code paths changed.

## Next steps
1. Run `npm run lint` then `npx tsc --noEmit`.
2. Run `npm run dev` and validate `/quick-overview`, `/wizard`, and each `/sections/*` route.
3. If any page still references the old `<TwoCol children>` variant oddly, the updated component supports both APIs.
