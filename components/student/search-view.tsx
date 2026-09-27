"use client";

import * as React from "react";
import Link from "next/link";
import { searchAccessibleContent } from "@/actions/student";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Search,
  BookOpen,
  Video,
  FileText,
  Link as LinkIcon,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export function SearchView() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<{
    subjects: any[];
    contents: any[];
    resources: any[];
  }>({ subjects: [], contents: [], resources: [] });
  const [isSearching, setIsSearching] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);

  // Debounced search
  React.useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults({ subjects: [], contents: [], resources: [] });
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchAccessibleContent(query);
        setResults(res);
        setHasSearched(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const totalResultsCount =
    results.subjects.length + results.contents.length + results.resources.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          البحث في المقررات والمحتوى
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          ابحث في المواد، المحاضرات، السكاشن، والملفات المخصصة لك
        </p>
      </div>

      {/* Search Bar Input */}
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="اكتب اسم مادة، عنوان محاضرة، سكشن، أو كلمة مفتاحية..."
          className="h-12 pr-11 pl-11 rounded-2xl text-sm shadow-xs bg-card border-input"
          autoFocus
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        {isSearching && (
          <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-spin" />
        )}
      </div>

      {/* States: Idle, No Results, Results */}
      {!hasSearched && !isSearching && (
        <EmptyState
          icon={Search}
          title="ابدأ البحث الآن"
          description="أدخل حرفين على الأقل للبحث الفوري في كافة المحتويات والمواد المصرح لك بها"
        />
      )}

      {hasSearched && !isSearching && totalResultsCount === 0 && (
        <EmptyState
          icon={Search}
          title="لم يتم العثور على أي نتائج"
          description={`لم نجد نتائج مطابقة لـ "${query}". تأكد من صحة الكلمات أو جرب بحثاً آخر.`}
        />
      )}

      {totalResultsCount > 0 && (
        <div className="space-y-6">
          {/* Matching Subjects */}
          {results.subjects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                المواد المطابقة ({results.subjects.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.subjects.map((sub) => (
                  <Link key={sub.id} href={`/subjects/${sub.id}`}>
                    <Card className="apple-card p-4 hover:border-primary/40 transition-all flex items-center justify-between">
                      <div className="space-y-1 min-w-0 pr-2">
                        <Badge variant="outline" className="font-mono text-[10px] uppercase">
                          {sub.code}
                        </Badge>
                        <h4 className="font-bold text-sm text-foreground truncate">
                          {sub.name}
                        </h4>
                        {sub.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {sub.description}
                          </p>
                        )}
                      </div>
                      <ArrowLeft className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matching Contents (Lectures / Sections) */}
          {results.contents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                المحاضرات والسكاشن ({results.contents.length})
              </h3>
              <div className="space-y-2.5">
                {results.contents.map((content) => (
                  <Link key={content.id} href={`/content/${content.id}`}>
                    <Card className="apple-card p-4 hover:border-primary/40 transition-all flex items-center justify-between">
                      <div className="space-y-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={content.type === "lecture" ? "default" : "purple"} className="text-[10px]">
                            {content.type === "lecture" ? "محاضرة" : "سكشن"}
                          </Badge>
                          <span className="font-semibold text-sm text-foreground truncate">
                            {content.title}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {content.subjects?.name} ({content.subjects?.code})
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 rounded-xl text-xs gap-1">
                        <span>فتح</span>
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </Button>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matching Resources */}
          {results.resources.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-rose-500" />
                المرفقات والملفات ({results.resources.length})
              </h3>
              <div className="space-y-2.5">
                {results.resources.map((res) => (
                  <Link key={res.id} href={`/content/${res.content_id}`}>
                    <Card className="apple-card p-4 hover:border-primary/40 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="p-2 rounded-xl bg-muted text-muted-foreground shrink-0">
                          {res.type === "video" ? (
                            <Video className="h-4 w-4 text-red-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-semibold text-sm text-foreground truncate">
                            {res.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            ضمن: {res.contents?.title} ({res.contents?.subjects?.name})
                          </p>
                        </div>
                      </div>
                      <ArrowLeft className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

