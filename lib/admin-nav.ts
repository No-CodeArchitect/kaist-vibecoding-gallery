// 관리자 콘솔 화면 주소 (/admin?tab=…&id=…&view=…). 왼쪽 메뉴·섹션 탭·이동 링크 공용.

export type AdminTab = "section" | "new-section" | "inquiries" | "media" | "admins";
export type SectionView = "overview" | "members" | "projects" | "ranking" | "comments";

export const ADMIN_TABS: AdminTab[] = ["section", "new-section", "inquiries", "media", "admins"];
export const SECTION_VIEWS: SectionView[] = ["overview", "members", "projects", "ranking", "comments"];

export function adminHref(tab: AdminTab, id?: string, view?: SectionView): string {
  const q = new URLSearchParams({ tab });
  if (id) q.set("id", id);
  if (view && view !== "overview") q.set("view", view);
  return `/admin?${q.toString()}`;
}
