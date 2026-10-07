# Supabase 마이그레이션 — 교육생 구글 로그인 · 섹션 가입 수락

교육생 로그인이 "이름 + 6자리 코드"에서 **구글 계정 로그인 → 섹션 가입 신청 → 관리자 수락**으로 바뀌었습니다.
가입 정보를 저장할 테이블 1개를 만듭니다. 이 SQL을 실행하기 전까지 배포본에서는 가입 신청이 오류가 납니다.

## 실행 방법
Supabase 대시보드 → **SQL Editor** → New query → 아래 전체 붙여넣고 **Run**.

```sql
-- 섹션 가입 (구글 계정 1개 : 섹션별 가입 1건)
create table if not exists memberships (
  id text primary key,              -- 이 섹션에서의 교육생 ID (채점·댓글·작품 작성자 ID)
  cohort_id text not null,
  google_sub text not null,         -- 구글 계정 고유 ID
  email text not null,
  google_name text not null default '',
  real_name text not null,          -- 관리자만 봄
  nickname text not null,           -- 사이트에 표시
  status text not null default 'pending',   -- pending / approved / rejected
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (cohort_id, google_sub)
);
create index if not exists memberships_sub_idx on memberships (google_sub);

alter table memberships enable row level security;
```

"Success. No rows returned" 가 뜨면 성공입니다.

## 참고
- 예전 `students` 테이블(이름·코드 명단)은 더 이상 쓰지 않습니다. 지워도 되고 남겨 둬도 됩니다.
- 교육생 구글 로그인은 관리자와 **같은 구글 OAuth 클라이언트·같은 리디렉션 주소**를 씁니다. 구글 콘솔에 주소를 추가할 필요는 없습니다.
- 단, 구글 콘솔의 **OAuth 동의 화면을 "프로덕션으로 게시"** 해야 아무 구글 계정이나 로그인할 수 있습니다. (테스트 상태면 등록한 테스트 사용자만 로그인됨)
