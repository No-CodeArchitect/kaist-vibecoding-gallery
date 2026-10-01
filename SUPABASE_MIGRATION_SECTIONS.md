# Supabase 마이그레이션 — 섹션(기수) 기능

섹션(여러 과정/기수)과 관리자 명단·코드 관리를 **영구 저장**하려면 아래 SQL을 한 번 실행하세요.
(실행 전에도 사이트는 안 깨집니다 — 테이블이 없으면 자동으로 임시(인메모리)로 동작합니다. 단, **배포본에서는 서버리스라 관리자에서 만든 섹션·명단이 저장되지 않으므로, 실제 운영 전 반드시 이 SQL을 실행**하세요.)

## 실행 방법
Supabase 대시보드 → **SQL Editor** → New query → 아래 전체 붙여넣고 **Run**.

```sql
-- 섹션(기수/과정)
create table if not exists cohorts (
  id text primary key,
  slug text unique not null,
  name text not null,
  scoring_open boolean not null default true,
  rank_revealed boolean not null default false,
  created_at timestamptz not null default now()
);

-- 교육생 명단·코드 (섹션별)
create table if not exists students (
  id text primary key,
  cohort_id text not null,
  name text not null,
  access_code text not null,
  created_at timestamptz not null default now()
);
create index if not exists students_cohort_idx on students (cohort_id);

-- 기존 데모 섹션/명단 승계 (선택 — 실제 운영 땐 관리자에서 새로 만들고 지우면 됩니다)
insert into cohorts (id, slug, name, scoring_open, rank_revealed)
values ('c1','1cha','AI 보수교육 1차', true, false)
on conflict (id) do nothing;

insert into students (id, cohort_id, name, access_code) values
 ('s1','c1','김도현','7GQ2AX'),
 ('s2','c1','이서준','4MP9KD'),
 ('s3','c1','박민재','QT1Z8B'),
 ('s4','c1','정우진','X3T6R9'),
 ('s5','c1','최유나','K9N2WY'),
 ('s6','c1','한지호','H5J7QP')
on conflict (id) do nothing;
```

"Success. No rows returned" 이 뜨면 성공입니다.

## 실행 후
- 관리자 콘솔(`/admin`)에서 **새 섹션 추가 / 명단 추가 → 코드 자동 생성**이 영구 저장됩니다.
- 각 섹션은 **고유 배부 링크**(`.../g/<slug>`)로 입장하며, 섹션 간 명단·채점·댓글·순위·프로젝트가 완전히 분리됩니다.
- 실제 운영 시: 데모 섹션(1차)과 6명 더미는 관리자에서 삭제하고, 실제 과정/명단으로 만드세요.

## 참고
- 섹션 링크 슬러그: 섹션 추가 시 "링크 주소"를 비우면 이름에서 자동 생성됩니다(한글 포함 가능). **영문 슬러그**(예: `bosu-2`)를 넣으면 공유가 더 깔끔합니다.
- 프로젝트(결과물)는 현재 기본 섹션(c1)에만 더미로 있습니다. 다른 섹션의 결과물은 이후 **섹션별 sync** 연동으로 채워집니다(후속 작업).
