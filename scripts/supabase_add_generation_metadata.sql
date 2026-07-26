-- Apply once before relying on persisted FLUX.1 V3 seeds and QA contracts.
-- The application remains backward-compatible while this column is absent.

alter table public.images
  add column if not exists generation_metadata jsonb;

comment on column public.images.generation_metadata is
  'FLUX generation parameters, candidate index, prompt version and expected image topology.';

create index if not exists images_generation_prompt_version_idx
  on public.images ((generation_metadata ->> 'promptVersion'))
  where generation_metadata is not null;
