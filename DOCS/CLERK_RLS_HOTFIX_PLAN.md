# Clerk RLS hotfix plan

## Decision

Keep the existing Clerk `supabase` JWT template. Do not require a Supabase
service-role or secret key for the comparison and rating flow. All user-owned
Supabase writes in that flow use the existing anon key plus the authenticated
Clerk token and are constrained by RLS and narrow database permissions. The
existing Clerk user webhook is outside this hotfix and remains unchanged.

## Scope

1. Add a request-scoped Supabase client that injects the existing Clerk
   `supabase` JWT.
2. Use that client in generation start, polling/finalization and best-image
   selection routes.
3. Add RLS policies and grants for user-owned generation sets and images.
4. Add a two-argument `select_generation_best` overload that derives ownership
   from `auth.jwt()->>'sub'`; the hotfix caller can no longer provide a user
   ID. Keep the existing service-role overload for rollout compatibility.
5. Exclude `.lottie` and `.webm` assets from locale middleware redirects.

## Security contract

- A request must have a valid Clerk session.
- Supabase must see the Clerk JWT as the authenticated role.
- Every table policy compares `auth.jwt()->>'sub'` with `user_id`.
- A user can read, insert and update only their own generation sets.
- A user can read and insert only their own images.
- Best-image selection remains atomic and validates set ownership, image
  membership and the complete three-candidate set inside PostgreSQL.
- Replicate and MinIO credentials remain server-only.
- The existing Clerk user webhook and its current server credentials are not
  changed by this hotfix.

## Rollout order

1. Apply `scripts/supabase_enable_clerk_generation_rls.sql` in Supabase.
2. Verify the new policies and two-argument rating RPC.
3. Deploy the application hotfix.
4. Run one authenticated three-image generation and select a winner.
5. Verify one set, three LoRA candidates and exactly one selected image.

Deploying the application before the SQL migration is not supported.

## Verification

- TypeScript check
- prompt contract audit
- production build
- middleware check for `/UI/LoadingImageAnimation.lottie`
- read-only live schema verification after the user applies the SQL migration

## Rollback

Roll back the application first. The SQL change is additive except for the
RLS policy definitions; leaving those policies installed does not alter
existing rows. The existing three-argument, service-role-only rating function
remains available, so the schema stays compatible with the prior application
version.
