-- Quality gate, shadow mode: one immutable validation record per generated candidate.
-- Additive migration: no existing table or column is changed.
-- Apply before setting QUALITY_GATE_MODE=shadow.

begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

create table if not exists public.generation_validation_attempts (
  id uuid primary key default gen_random_uuid(),
  generation_set_id uuid not null references public.generation_sets(id) on delete cascade,
  image_id uuid references public.images(id) on delete set null,
  user_id text not null,
  attempt_number smallint not null default 1
    check (attempt_number between 1 and 10),
  candidate_index smallint not null
    check (candidate_index between 0 and 2),
  seed bigint not null,
  prediction_id text not null,
  candidate_url text,
  gate_mode text not null
    check (gate_mode in ('shadow', 'enforce')),
  prompt_version text not null,
  validator_model text not null,
  validator_prompt_version text not null,
  quality_expectations jsonb not null,
  verdict text
    check (verdict is null or verdict in ('pass', 'fail', 'uncertain', 'error')),
  confidence numeric(4, 3)
    check (confidence is null or (confidence >= 0 and confidence <= 1)),
  report jsonb,
  reasons text[] not null default '{}',
  duration_ms integer,
  error text,
  human_verdict text
    check (human_verdict is null or human_verdict in ('validator_correct', 'validator_wrong')),
  human_note text,
  human_reviewed_by text,
  human_reviewed_at timestamptz,
  claimed_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.generation_validation_attempts is
  'One vision-validator verdict per generated candidate. Shadow mode records verdicts without affecting delivery; human_* columns collect the labelled calibration set.';

comment on column public.generation_validation_attempts.verdict is
  'pass/fail/uncertain derived server-side from the hard checks; error when the validator call failed.';

-- The claim: only one attempt per candidate and attempt number can exist, so
-- concurrent status polls cannot validate (and pay for) the same image twice.
create unique index if not exists generation_validation_attempts_candidate_unique_idx
  on public.generation_validation_attempts (generation_set_id, candidate_index, attempt_number);

create index if not exists generation_validation_attempts_user_created_idx
  on public.generation_validation_attempts (user_id, created_at desc);

create index if not exists generation_validation_attempts_created_idx
  on public.generation_validation_attempts (created_at desc);

create index if not exists generation_validation_attempts_verdict_idx
  on public.generation_validation_attempts (verdict)
  where verdict is not null;

alter table public.generation_validation_attempts enable row level security;

drop policy if exists generation_validation_attempts_select_own on public.generation_validation_attempts;
create policy generation_validation_attempts_select_own
  on public.generation_validation_attempts
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

-- Attempts are written by the server with the service role; users only read their own.
revoke all on public.generation_validation_attempts from anon, authenticated;
grant select on public.generation_validation_attempts to authenticated;

commit;
