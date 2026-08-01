-- Allow the comparison flow to use the existing Clerk `supabase` JWT
-- instead of a Supabase service-role key in the application runtime.
-- Apply this migration before deploying the Clerk RLS hotfix.

begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

alter table public.generation_sets enable row level security;
alter table public.images enable row level security;

drop policy if exists generation_sets_select_own on public.generation_sets;
drop policy if exists generation_sets_insert_own on public.generation_sets;
drop policy if exists generation_sets_update_own on public.generation_sets;

create policy generation_sets_select_own
  on public.generation_sets
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create policy generation_sets_insert_own
  on public.generation_sets
  for insert
  to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy generation_sets_update_own
  on public.generation_sets
  for update
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);

revoke insert, update on public.generation_sets from authenticated;
grant select on public.generation_sets to authenticated;
grant insert (
  id,
  user_id,
  prompt,
  prompt_version,
  seed,
  model_version,
  guidance_scale,
  num_inference_steps,
  requested_lora_scales,
  quality_expectations,
  prediction_manifest,
  status,
  created_at,
  updated_at
) on public.generation_sets to authenticated;
grant update (
  prediction_manifest,
  status,
  updated_at
) on public.generation_sets to authenticated;

drop policy if exists "images_select_own" on public.images;
drop policy if exists "images_insert_own" on public.images;
drop policy if exists images_select_own on public.images;
drop policy if exists images_insert_own on public.images;

create policy images_select_own
  on public.images
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create policy images_insert_own
  on public.images
  for insert
  to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);

revoke insert, update on public.images from authenticated;
grant select on public.images to authenticated;
grant insert (
  url,
  imageprompt,
  is_upscaled,
  original_image_url,
  user_id,
  generation_metadata,
  generation_set_id,
  lora_scale,
  candidate_index
) on public.images to authenticated;

create or replace function public.select_generation_best(
  p_set_id uuid,
  p_image_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id text := auth.jwt() ->> 'sub';
  v_selected_at timestamptz := now();
begin
  if v_user_id is null or v_user_id = '' then
    raise exception 'Authenticated user is required'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.images
    where id = p_image_id
      and generation_set_id = p_set_id
      and user_id = v_user_id
      and coalesce(is_upscaled, false) = false
  ) then
    raise exception 'Image does not belong to this generation set and user'
      using errcode = 'P0002';
  end if;

  if not exists (
    select 1
    from public.generation_sets
    where id = p_set_id
      and user_id = v_user_id
  ) then
    raise exception 'Generation set not found for this user'
      using errcode = 'P0002';
  end if;

  if (
    select count(*)
    from public.images
    where generation_set_id = p_set_id
      and user_id = v_user_id
      and coalesce(is_upscaled, false) = false
  ) <> 3 then
    raise exception 'Generation set is not complete'
      using errcode = 'P0002';
  end if;

  update public.images
  set is_selected_best = false,
      best_selected_at = null
  where generation_set_id = p_set_id
    and user_id = v_user_id
    and is_selected_best;

  update public.images
  set is_selected_best = true,
      best_selected_at = v_selected_at
  where id = p_image_id
    and generation_set_id = p_set_id
    and user_id = v_user_id;

  update public.generation_sets
  set selected_image_id = p_image_id,
      selected_at = v_selected_at,
      updated_at = v_selected_at
  where id = p_set_id
    and user_id = v_user_id;

  return jsonb_build_object(
    'generationSetId', p_set_id,
    'selectedImageId', p_image_id,
    'selectedAt', v_selected_at
  );
end;
$$;

revoke all on function public.select_generation_best(uuid, uuid)
  from public, anon;
grant execute on function public.select_generation_best(uuid, uuid)
  to authenticated, service_role;

commit;
