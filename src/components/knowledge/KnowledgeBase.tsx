"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { formatRelativeTime } from "@/lib/utils";
import { BookOpen, Plus, FolderOpen, Search, Eye, Pencil, Trash2 } from "lucide-react";
import type { KnowledgeCategory, KnowledgeArticle } from "@/types/database";

type Props = { categories: KnowledgeCategory[]; articles: KnowledgeArticle[]; businessId: string };

export function KnowledgeBase({ categories: initCats, articles: initArts, businessId }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState(initCats);
  const [articles, setArticles] = useState(initArts);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [catOpen, setCatOpen] = useState(false);
  const [artOpen, setArtOpen] = useState(false);
  const [editArticle, setEditArticle] = useState<KnowledgeArticle | null>(null);

  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [artForm, setArtForm] = useState({ title: "", content: "", category_id: "", is_published: true });
  const [saving, setSaving] = useState(false);

  const filtered = articles.filter((a) => {
    const matchCat = !selectedCat || a.category_id === selectedCat;
    const matchSearch = a.question_en.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  async function createCategory() {
    if (!catForm.name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("knowledge_categories")
      .insert({ business_id: businessId, name_en: catForm.name, display_order: categories.length })
      .select().single();
    if (error) { toast.error(error.message); setSaving(false); return; }
    setCategories((p) => [...p, data]);
    setCatOpen(false);
    setCatForm({ name: "", description: "" });
    toast.success("Category created");
    setSaving(false);
  }

  async function createArticle() {
    if (!artForm.title.trim()) { toast.error("Title required"); return; }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("knowledge_articles")
      .insert({
        business_id: businessId,
        question_en: artForm.title,
        answer_en: artForm.content || "",
        category_id: artForm.category_id || categories[0]?.id,
        status: artForm.is_published ? "published" : "draft",
      })
      .select().single();
    if (error) { toast.error(error.message); setSaving(false); return; }
    setArticles((p) => [data, ...p]);
    setArtOpen(false);
    setArtForm({ title: "", content: "", category_id: "", is_published: true });
    toast.success("Article created");
    setSaving(false);
  }

  async function updateArticle() {
    if (!editArticle) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("knowledge_articles")
      .update({
        question_en: artForm.title,
        answer_en: artForm.content || "",
        category_id: artForm.category_id || editArticle.category_id,
        status: artForm.is_published ? "published" : "draft",
      })
      .eq("id", editArticle.id).select().single();
    if (error) { toast.error(error.message); setSaving(false); return; }
    setArticles((p) => p.map((a) => a.id === editArticle.id ? data : a));
    setEditArticle(null);
    toast.success("Article updated");
    setSaving(false);
  }

  async function deleteArticle(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("knowledge_articles").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setArticles((p) => p.filter((a) => a.id !== id));
    toast.success("Article deleted");
  }

  function openEdit(article: KnowledgeArticle) {
    setEditArticle(article);
    setArtForm({ title: article.question_en, content: article.answer_en ?? "", category_id: article.category_id, is_published: article.status === "published" });
  }

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Categories sidebar */}
      <div className="w-56 border-r border-charcoal-100 flex flex-col bg-white flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal-100">
          <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide">Categories</p>
          <button onClick={() => setCatOpen(true)} className="p-1 rounded hover:bg-charcoal-100 text-charcoal-400 hover:text-charcoal-700 transition-colors">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <button
            onClick={() => setSelectedCat(null)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCat ? "bg-gold-50 text-gold-700 font-medium" : "text-charcoal-600 hover:bg-charcoal-50"}`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            All articles
            <span className="ml-auto text-xs text-charcoal-400">{articles.length}</span>
          </button>
          {categories.map((cat) => {
            const count = articles.filter((a) => a.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${selectedCat === cat.id ? "bg-gold-50 text-gold-700 font-medium" : "text-charcoal-600 hover:bg-charcoal-50"}`}
              >
                <FolderOpen className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{cat.name_en}</span>
                <span className="ml-auto text-xs text-charcoal-400 flex-shrink-0">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-charcoal-100 bg-white">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..." className="w-full pl-9 pr-3 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400" />
          </div>
          <Button variant="gold" size="sm" onClick={() => setArtOpen(true)}>
            <Plus className="h-4 w-4" /> New Article
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <EmptyState icon={BookOpen} title="No articles found" description="Create your first article to build the knowledge base." action={<Button variant="gold" size="sm" onClick={() => setArtOpen(true)}><Plus className="h-4 w-4" /> New Article</Button>} />
          ) : (
            <div className="space-y-3">
              {filtered.map((article) => {
                const cat = categories.find((c) => c.id === article.category_id);
                return (
                  <div key={article.id} className="card p-4 hover:shadow-card-hover transition-shadow group">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-charcoal-800 truncate">{article.question_en}</h3>
                          <Badge variant={article.status === "published" ? "success" : "default"} size="sm">
                            {article.status === "published" ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-charcoal-400">
                          {cat && <span className="flex items-center gap-1"><FolderOpen className="h-3 w-3" />{cat.name_en}</span>}
                          <span>{formatRelativeTime(article.created_at)}</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.view_count} views</span>
                        </div>
                        {article.answer_en && (
                          <p className="text-sm text-charcoal-500 mt-1.5 line-clamp-2">{article.answer_en}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => openEdit(article)} className="p-1.5 rounded hover:bg-charcoal-100 text-charcoal-400 hover:text-charcoal-700 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteArticle(article.id)} className="p-1.5 rounded hover:bg-red-50 text-charcoal-400 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category modal */}
      <Modal open={catOpen} onClose={() => setCatOpen(false)} title="New Category" size="sm">
        <div className="space-y-4">
          <Input label="Category name *" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. FAQs, Policies" />
          <Input label="Description" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} placeholder="Optional description" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCatOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="gold" onClick={createCategory} loading={saving} className="flex-1">Create</Button>
          </div>
        </div>
      </Modal>

      {/* Article create modal */}
      <Modal open={artOpen} onClose={() => setArtOpen(false)} title="New Article" size="lg">
        <div className="space-y-4">
          <Input label="Article title *" value={artForm.title} onChange={(e) => setArtForm({ ...artForm, title: e.target.value })} placeholder="e.g. How to handle refund requests" />
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Category</label>
              <select value={artForm.category_id} onChange={(e) => setArtForm({ ...artForm, category_id: e.target.value })} className="w-full rounded-lg border border-charcoal-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
              </select>
            </div>
          )}
          <Textarea label="Content" value={artForm.content} onChange={(e) => setArtForm({ ...artForm, content: e.target.value })} rows={6} placeholder="Write your article content here…" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={artForm.is_published} onChange={(e) => setArtForm({ ...artForm, is_published: e.target.checked })} className="rounded accent-gold-500" />
            <span className="text-sm text-charcoal-700">Publish immediately</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setArtOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="gold" onClick={createArticle} loading={saving} className="flex-1">Create Article</Button>
          </div>
        </div>
      </Modal>

      {/* Article edit modal */}
      <Modal open={!!editArticle} onClose={() => setEditArticle(null)} title="Edit Article" size="lg">
        <div className="space-y-4">
          <Input label="Article title *" value={artForm.title} onChange={(e) => setArtForm({ ...artForm, title: e.target.value })} />
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Category</label>
              <select value={artForm.category_id} onChange={(e) => setArtForm({ ...artForm, category_id: e.target.value })} className="w-full rounded-lg border border-charcoal-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
              </select>
            </div>
          )}
          <Textarea label="Content" value={artForm.content} onChange={(e) => setArtForm({ ...artForm, content: e.target.value })} rows={6} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={artForm.is_published} onChange={(e) => setArtForm({ ...artForm, is_published: e.target.checked })} className="rounded accent-gold-500" />
            <span className="text-sm text-charcoal-700">Published</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditArticle(null)} className="flex-1">Cancel</Button>
            <Button variant="gold" onClick={updateArticle} loading={saving} className="flex-1">Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
