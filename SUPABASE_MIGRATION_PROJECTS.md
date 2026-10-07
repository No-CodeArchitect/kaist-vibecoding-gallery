# Supabase 마이그레이션 — 작품 등록 · 부대 교육 신청

교육생 **작품 등록**(구글 폼/시트 대체)과 **부대 AI 교육 신청**을 저장하는 테이블 2개입니다.
배포본에서는 이 SQL을 실행하기 전까지 작품 등록·교육 신청이 **저장되지 않고 오류**가 납니다.

## 실행 방법
Supabase 대시보드 → **SQL Editor** → New query → 아래 전체 붙여넣고 **Run**.

```sql
-- 교육생 작품 (1인 1작품). 등록 내용 + 썸네일 + AI 분석 결과
create table if not exists projects (
  id text primary key,
  cohort_id text not null,
  author_id text not null unique,
  author_name text not null,
  submission jsonb not null,
  status text not null default 'pending',
  needs_analysis boolean not null default true,
  ai jsonb,
  thumb_url text,
  thumb_path text,
  error text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  analyzed_at timestamptz,
  published_at timestamptz
);
create index if not exists projects_cohort_idx on projects (cohort_id);

-- 부대 AI 교육 신청
create table if not exists edu_requests (
  id text primary key,
  unit text not null,
  contact_name text not null,
  phone text not null,
  email text not null default '',
  headcount text not null default '',
  period text not null default '',
  message text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- 서버(service_role)만 접근. 공개 키로는 읽기·쓰기 불가.
alter table projects enable row level security;
alter table edu_requests enable row level security;
```

"Success. No rows returned" 가 뜨면 성공입니다.

## 실행 후 달라지는 점
- 섹션 갤러리의 **더미 작품 6개(p1~p6)가 사라지고**, 교육생이 등록해 분석이 끝난 실제 작품만 보입니다.
- 썸네일은 기존 `media` 버킷의 `thumbs/` 폴더에 저장됩니다(추가 설정 없음).
