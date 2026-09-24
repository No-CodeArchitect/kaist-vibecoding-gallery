# Supabase 연결 (투표·댓글 영구 저장)

이걸 하면 채점·댓글·순위공개 상태가 **서버 재시작·배포·다중 접속에도 안전하게 유지**됩니다.
설정 전에는 인메모리로 동작하므로(재시작 시 초기화) 실제 투표 운영 전 꼭 해야 합니다.

## 1. Supabase 프로젝트 만들기 (무료, 5분)
1. https://supabase.com → 로그인 → **New project**
2. 이름 아무거나, **Region: Northeast Asia (Seoul 또는 Tokyo)** 권장, DB 비밀번호는 아무거나(직접 쓸 일 없음)
3. 생성 후 **Settings → API** 이동, 아래 두 개 복사:
   - **Project URL** (예: `https://abcd1234.supabase.co`)
   - **service_role** 키 (secret) — ⚠️ 절대 외부/클라이언트 노출 금지, 서버 전용

## 2. `.env` 에 추가
프로젝트 루트에 `.env` (없으면 `.env.example` 복사) 열고:
```
SUPABASE_URL=https://abcd1234.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...(service_role 키)
```

## 3. 스키마 만들기
Supabase 대시보드 → **SQL Editor** → New query → 아래 전체 붙여넣고 **Run**:

```sql
-- 운영 상태 (단일 행)
create table if not exists settings (
  id text primary key default 'default',
  scoring_open boolean not null default true,
  rank_revealed boolean not null default false
);
insert into settings (id) values ('default') on conflict (id) do nothing;

-- 채점
create table if not exists scores (
  project_id text not null,
  student_id text not null,
  completeness int not null check (completeness between 1 and 5),
  creativity int not null check (creativity between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (project_id, student_id)
);

-- 댓글
create table if not exists comments (
  id text primary key,
  project_id text not null,
  author_id text,
  author_name text,
  ai_nickname text,
  body text not null,
  is_author_reply boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists comments_project_idx on comments (project_id, created_at);
```

> RLS(행 수준 보안)는 켜지 않아도 됩니다. 이 앱은 **서버에서 service_role 키로만** 접근하므로 안전합니다. (service_role은 RLS를 우회) 대신 service_role 키가 클라이언트에 노출되지 않도록만 주의하세요.

## 4. 확인
- 로컬: `npm.cmd run dev` 재시작 → 채점/댓글 해보고, **서버를 껐다 켜도 남아있으면 성공**.
- (선택) Supabase → Table editor → `scores`/`comments` 에 행이 쌓이는지 확인.

## 5. 배포(Vercel) 시
- Vercel 프로젝트 → Settings → Environment Variables 에 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `ADMIN_PASSWORD` (그리고 sync용 `ANTHROPIC_API_KEY`, `SHEET_CSV_URL`) 등록 → 재배포.
- 이러면 여러 교육생이 각자 기기에서 접속해도 투표가 한곳(Supabase)에 모입니다.

---

### 참고: 지금 Supabase로 옮긴 것 / 아직 아닌 것
- ✅ 채점(scores), 댓글(comments), 운영상태(settings) → Supabase
- ⏳ 프로젝트 데이터(projects)·교육생 명단(roster) → 아직 파일/코드 기반. 다음 단계에서 원하면 Supabase로 옮길 수 있음(투표 자체는 지금 구성으로 충분히 운영 가능).
