import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { FullPageLoader } from '@/components/Loading';
import { formatDate } from '@/lib/utils';
import type { BlogPost } from '@/types';
import { BookOpen, Search, ArrowLeft, ArrowRight, Calendar, User, Eye, TrendingUp } from 'lucide-react';

const categories = ['all', 'education', 'smc', 'risk', 'psychology', 'news', 'beginner', 'advanced'];

const categoryLabels: Record<string, string> = {
  education: 'Education',
  smc: 'SMC Tutorials',
  risk: 'Risk Management',
  psychology: 'Trading Psychology',
  news: 'Market News',
  beginner: 'Beginner Guides',
  advanced: 'Advanced Guides',
};

const categoryColors: Record<string, string> = {
  education: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  smc: 'bg-gold-500/10 text-gold-400 border-gold-500/20',
  risk: 'bg-bear/10 text-bear border-bear/20',
  psychology: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  news: 'bg-navy-500/10 text-navy-300 border-navy-400/20',
  beginner: 'bg-bull/10 text-bull border-bull/20',
  advanced: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setPosts((data as BlogPost[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat;
  });

  if (loading) return <FullPageLoader message="Loading blog..." />;

  return (
    <div className="section-pad max-w-[1600px] mx-auto py-12">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Trading Blog</h1>
        <p className="text-soft">Trading education, SMC tutorials, risk management, and market insights</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-full rounded-xl pl-10 pr-4 py-3 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                category === cat ? 'btn-gold' : 'btn-ghost'
              }`}
            >
              {cat === 'all' ? 'All' : categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post, i) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="glass rounded-2xl overflow-hidden card-hover group animate-fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {post.cover_image && (
                <div className="aspect-video overflow-hidden bg-white/[0.02]">
                  <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-2xs px-2 py-0.5 rounded-full border ${categoryColors[post.category] ?? ''}`}>
                    {categoryLabels[post.category] ?? post.category}
                  </span>
                  <span className="text-2xs text-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDate(post.published_at)}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-base mb-2 line-clamp-2 group-hover:text-gold-400 transition-colors">{post.title}</h3>
                <p className="text-sm text-soft line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-2xs text-muted">
                  {post.author && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>}
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-16 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted opacity-50" />
          <p className="text-soft mb-2">No articles published yet.</p>
          <p className="text-sm text-muted">Check back soon for trading education and market insights.</p>
        </div>
      )}
    </div>
  );
}

export function BlogArticlePage({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data }) => {
        setPost((data as BlogPost) ?? null);
        setLoading(false);
        if (data) {
          supabase.from('blog_posts').update({ views: ((data as BlogPost).views ?? 0) + 1 }).eq('id', (data as BlogPost).id).then();
        }
      });
  }, [slug]);

  if (loading) return <FullPageLoader message="Loading article..." />;

  if (!post) {
    return (
      <div className="section-pad max-w-2xl mx-auto py-20 text-center">
        <p className="text-xl text-soft mb-4">Article not found.</p>
        <Link to="/blog" className="btn-gold px-6 py-3 rounded-xl inline-block">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="section-pad max-w-4xl mx-auto py-12">
      <Link to="/blog" className="flex items-center gap-2 text-sm text-soft hover:text-gold-400 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      <div className="flex items-center gap-2 mb-4">
        <span className={`text-2xs px-2.5 py-1 rounded-full border ${categoryColors[post.category] ?? ''}`}>
          {categoryLabels[post.category] ?? post.category}
        </span>
        <span className="text-2xs text-muted flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {formatDate(post.published_at)}
        </span>
        <span className="text-2xs text-muted flex items-center gap-1">
          <Eye className="w-3 h-3" /> {post.views} views
        </span>
      </div>

      <h1 className="font-display font-bold text-3xl md:text-4xl mb-4 leading-tight">{post.title}</h1>

      {post.author && (
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-500 to-navy-800 flex items-center justify-center font-bold">
            {post.author[0]}
          </div>
          <div>
            <p className="text-sm font-semibold">{post.author}</p>
            <p className="text-xs text-muted">Author</p>
          </div>
        </div>
      )}

      {post.cover_image && (
        <div className="aspect-video rounded-2xl overflow-hidden mb-8">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {post.excerpt && <p className="text-lg text-soft mb-6 font-medium">{post.excerpt}</p>}

      <div className="prose prose-invert max-w-none">
        {post.content?.split('\n').map((para, i) => (
          para.trim() ? <p key={i} className="text-soft leading-relaxed mb-4">{para}</p> : null
        ))}
      </div>

      <div className="mt-12 p-6 glass rounded-2xl text-center">
        <TrendingUp className="w-8 h-8 text-gold-400 mx-auto mb-3" />
        <h3 className="font-display font-semibold text-lg mb-2">Ready for Daily Analysis?</h3>
        <p className="text-sm text-soft mb-4">Access institutional-grade market analysis updated every day.</p>
        <Link to="/analysis" className="btn-gold px-6 py-3 rounded-xl inline-flex items-center gap-2 text-sm font-semibold">
          View Today's Analysis <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
