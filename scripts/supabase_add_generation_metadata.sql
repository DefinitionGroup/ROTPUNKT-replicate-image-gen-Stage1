-- FLUX.1 V3 generation sets and best-of-three ratings.
-- Apply this migration before deploying the comparison flow.
-- Existing images and users remain unchanged; all new image columns are nullable
-- except for the backward-compatible `is_selected_best = false` flag.

begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

create table if not exists public.generation_sets (
  id uuid primary key,
  user_id text not null,
  prompt text not null,
  prompt_version text not null,
  seed bigint not null,
  model_version text not null,
  guidance_scale numeric(4, 2) not null,
  num_inference_steps smallint not null,
  requested_lora_scales jsonb not null default '[0.65, 0.75, 0.85]'::jsonb,
  quality_expectations jsonb,
  prediction_manifest jsonb not null default '[]'::jsonb,
  status text not null default 'starting'
    check (status in ('starting', 'processing', 'succeeded', 'failed', 'partial_failed')),
  selected_image_id uuid references public.images(id) on delete set null,
  selected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.images
  add column if not exists generation_metadata jsonb,
  add column if not exists generation_set_id uuid references public.generation_sets(id) on delete set null,
  add column if not exists lora_scale numeric(3, 2)
    check (lora_scale is null or lora_scale in (0.65, 0.75, 0.85)),
  add column if not exists candidate_index smallint
    check (candidate_index is null or candidate_index between 0 and 2),
  add column if not exists is_selected_best boolean not null default false,
  add column if not exists best_selected_at timestamptz;

comment on table public.generation_sets is
  'One controlled image-generation comparison using a shared prompt and seed.';

comment on column public.images.generation_set_id is
  'Links the three controlled LoRA variants that belong to one comparison.';

comment on column public.images.generation_metadata is
  'FLUX parameters, prompt version and expected image topology for this candidate.';

create index if not exists generation_sets_user_created_idx
  on public.generation_sets (user_id, created_at desc);

create index if not exists images_generation_set_idx
  on public.images (generation_set_id)
  where generation_set_id is not null;

create unique index if not exists images_generation_set_candidate_unique_idx
  on public.images (generation_set_id, candidate_index)
  where generation_set_id is not null;

create unique index if not exists images_generation_set_best_unique_idx
  on public.images (generation_set_id)
  where generation_set_id is not null and is_selected_best;

create index if not exists images_generation_prompt_version_idx
  on public.images ((generation_metadata ->> 'promptVersion'))
  where generation_metadata is not null;

alter table public.generation_sets enable row level security;

drop policy if exists generation_sets_select_own on public.generation_sets;
create policy generation_sets_select_own
  on public.generation_sets
  for select
  using ((auth.jwt() ->> 'sub') = user_id);

grant select on public.generation_sets to authenticated;

create or replace function public.select_generation_best(
  p_set_id uuid,
  p_image_id uuid,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_selected_at timestamptz := now();
begin
  if not exists (
    select 1
    from public.images
    where id = p_image_id
      and generation_set_id = p_set_id
      and user_id = p_user_id
      and coalesce(is_upscaled, false) = false
  ) then
    raise exception 'Image does not belong to this generation set and user'
      using errcode = 'P0002';
  end if;

  if not exists (
    select 1
    from public.generation_sets
    where id = p_set_id
      and user_id = p_user_id
  ) then
    raise exception 'Generation set not found for this user'
      using errcode = 'P0002';
  end if;

  if (
    select count(*)
    from public.images
    where generation_set_id = p_set_id
      and user_id = p_user_id
      and coalesce(is_upscaled, false) = false
  ) <> 3 then
    raise exception 'Generation set is not complete'
      using errcode = 'P0002';
  end if;

  update public.images
  set is_selected_best = false,
      best_selected_at = null
  where generation_set_id = p_set_id
    and user_id = p_user_id
    and is_selected_best;

  update public.images
  set is_selected_best = true,
      best_selected_at = v_selected_at
  where id = p_image_id
    and generation_set_id = p_set_id
    and user_id = p_user_id;

  update public.generation_sets
  set selected_image_id = p_image_id,
      selected_at = v_selected_at,
      updated_at = v_selected_at
  where id = p_set_id
    and user_id = p_user_id;

  return jsonb_build_object(
    'generationSetId', p_set_id,
    'selectedImageId', p_image_id,
    'selectedAt', v_selected_at
  );
end;
$$;

revoke all on function public.select_generation_best(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.select_generation_best(uuid, uuid, text)
  to service_role;

commit;
