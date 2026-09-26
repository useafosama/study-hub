import * as React from "react";
import { getStudentBookmarks } from "@/actions/student";
import { BookmarksView } from "@/components/student/bookmarks-view";

export default async function StudentBookmarksPage() {
  const bookmarks = await getStudentBookmarks();

  return <BookmarksView initialBookmarks={bookmarks} />;
}
