-- Migration to create initial database tables

-- achievement_templates table
create table public.achievement_templates (
  id uuid not null default gen_random_uuid (),
  achievement_type text not null,
  title text not null,
  description text not null,
  logo_url text not null,
  from_time timestamp with time zone not null,
  to_time timestamp with time zone not null,
  created_at timestamp with time zone null default now(),
  constraint achievement_templates_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_achievement_templates_time on public.achievement_templates using btree (from_time, to_time) TABLESPACE pg_default;

-- device_configs table
create table public.device_configs (
  id uuid not null default gen_random_uuid (),
  device_id text not null,
  name text not null,
  scan_type text not null,
  drink_menu_id uuid null,
  achievement_template_id uuid null,
  active boolean null default true,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint device_configs_pkey primary key (id),
  constraint device_configs_device_id_key unique (device_id),
  constraint device_configs_achievement_template_id_fkey foreign KEY (achievement_template_id) references achievement_templates (id) on delete set null,
  constraint device_configs_drink_menu_id_fkey foreign KEY (drink_menu_id) references drink_menu (id) on delete set null,
  constraint device_configs_scan_type_check check (
    (
      scan_type = any (array['drink'::text, 'achievement'::text])
    )
  ),
  constraint device_scan_type_check check (
    (
      (
        (scan_type = 'drink'::text)
        and (drink_menu_id is not null)
        and (achievement_template_id is null)
      )
      or (
        (scan_type = 'achievement'::text)
        and (drink_menu_id is null)
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_device_configs_device_id on public.device_configs using btree (device_id) TABLESPACE pg_default;

create index IF not exists idx_device_configs_active on public.device_configs using btree (active) TABLESPACE pg_default;

create trigger update_device_configs_updated_at BEFORE
update on device_configs for EACH row
execute FUNCTION update_updated_at_column ();

-- drink_orders table
create table public.drink_orders (
  id uuid not null default gen_random_uuid (),
  guest_id uuid not null,
  drink_menu_id uuid not null,
  quantity integer null default 1,
  status text null default 'logged'::text,
  ordered_at timestamp with time zone null default now(),
  constraint drink_orders_pkey primary key (id),
  constraint drink_orders_drink_menu_id_fkey foreign KEY (drink_menu_id) references drink_menu (id) on delete CASCADE,
  constraint drink_orders_guest_id_fkey foreign KEY (guest_id) references guests (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_drink_orders_guest_id on public.drink_orders using btree (guest_id) TABLESPACE pg_default;

create index IF not exists idx_drink_orders_drink_menu_id on public.drink_orders using btree (drink_menu_id) TABLESPACE pg_default;

-- food_menu table
create table public.food_menu (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  category text not null default 'breakfast'::text,
  available boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint food_menu_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_food_menu_available on public.food_menu using btree (available) TABLESPACE pg_default;

-- food_orders table
create table public.food_orders (
  id uuid not null default gen_random_uuid (),
  guest_id uuid not null,
  food_menu_id uuid not null,
  status text null default 'ordered'::text,
  ordered_at timestamp with time zone null default now(),
  constraint food_orders_pkey primary key (id),
  constraint food_orders_guest_id_key unique (guest_id),
  constraint food_orders_food_menu_id_fkey foreign KEY (food_menu_id) references food_menu (id) on delete CASCADE,
  constraint food_orders_guest_id_fkey foreign KEY (guest_id) references guests (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_food_orders_guest_id on public.food_orders using btree (guest_id) TABLESPACE pg_default;

create index IF not exists idx_food_orders_food_menu_id on public.food_orders using btree (food_menu_id) TABLESPACE pg_default;

-- guest_achievements table
create table public.guest_achievements (
  id uuid not null default gen_random_uuid (),
  guest_id uuid not null,
  achievement_template_id uuid not null,
  unlocked_at timestamp with time zone null default now(),
  constraint guest_achievements_pkey primary key (id),
  constraint guest_achievements_guest_id_achievement_template_id_key unique (guest_id, achievement_template_id),
  constraint guest_achievements_achievement_template_id_fkey foreign KEY (achievement_template_id) references achievement_templates (id) on delete CASCADE,
  constraint guest_achievements_guest_id_fkey foreign KEY (guest_id) references guests (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_guest_achievements_guest_id on public.guest_achievements using btree (guest_id) TABLESPACE pg_default;

create index IF not exists idx_guest_achievements_template_id on public.guest_achievements using btree (achievement_template_id) TABLESPACE pg_default;

-- guests table
create table public.guests (
  id uuid not null default gen_random_uuid (),
  name text not null,
  tag_uid text not null,
  created_at timestamp with time zone null default now(),
  gender text null default 'male'::text,
  constraint guests_pkey primary key (id),
  constraint guests_tag_uid_key unique (tag_uid),
  constraint guests_gender_check check (
    (
      gender = any (array['male'::text, 'female'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_guests_tag_uid on public.guests using btree (tag_uid) TABLESPACE pg_default;

create index IF not exists idx_guests_gender on public.guests using btree (gender) TABLESPACE pg_default;

-- recipes table
create table public.recipes (
  id uuid not null default gen_random_uuid (),
  drink_menu_id uuid not null,
  name character varying(255) not null,
  description text null,
  ingredients text[] not null,
  instructions text[] not null,
  video_url text null,
  prep_time character varying(50) null,
  difficulty character varying(20) null,
  serves integer null default 1,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint recipes_pkey primary key (id),
  constraint recipes_drink_menu_id_fkey foreign KEY (drink_menu_id) references drink_menu (id) on delete CASCADE,
  constraint recipes_difficulty_check check (
    (
      (difficulty)::text = any (
        (
          array[
            'Easy'::character varying,
            'Medium'::character varying,
            'Hard'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_recipes_drink_menu_id on public.recipes using btree (drink_menu_id) TABLESPACE pg_default;

create index IF not exists idx_recipes_difficulty on public.recipes using btree (difficulty) TABLESPACE pg_default;

create trigger update_recipes_updated_at BEFORE
update on recipes for EACH row
execute FUNCTION update_updated_at_column ();
