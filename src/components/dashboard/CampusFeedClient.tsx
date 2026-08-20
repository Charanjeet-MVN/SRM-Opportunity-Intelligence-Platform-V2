"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Heart,
  Bookmark,
  Share2,
  Plus,
  Search,
  Award,
  Zap,
  MessageSquare,
  Clock,
  TrendingUp,
  Flame,
  Compass,
} from "lucide-react";

interface Post {
  id: string;
  studentName: string;
  studentAvatar: string;
  registerNumber: string;
  title: string;
  description: string;
  type: "internship" | "hackathon" | "certification" | "project" | "club" | "general";
  date: string;
  likes: number;
  likedByUser: boolean;
  savedByUser: boolean;
  commentsCount: number;
}

const PRE_SEEDED_POSTS: Post[] = [
  {
    id: "post-1",
    studentName: "Aditya Varma",
    studentAvatar: "A",
    registerNumber: "RA2211003010045",
    title: "Secured Google STEP Summer Internship 2026!",
    description: "Incredibly excited to announce that I have been selected for the Google STEP Internship! Huge thanks to the SRM placement office and my mentors at Next Tech Lab for guidance through the DSA vector tracks.",
    type: "internship",
    date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    likes: 42,
    likedByUser: false,
    savedByUser: false,
    commentsCount: 5,
  },
  {
    id: "post-2",
    studentName: "Meera Krishnan",
    studentAvatar: "M",
    registerNumber: "RA2211003020088",
    title: "Won 1st Place at Meta Llama Hackathon!",
    description: "We built 'Campus Vector Assist' - a localized AI copilot for campus queries using Llama-3.1-70B model. Super proud of our team at MSC SRM for coding non-stop for 36 hours!",
    type: "hackathon",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likes: 58,
    likedByUser: false,
    savedByUser: false,
    commentsCount: 8,
  },
  {
    id: "post-3",
    studentName: "Rohan Das",
    studentAvatar: "R",
    registerNumber: "RA2211003010156",
    title: "Completed AWS Certified Cloud Practitioner!",
    description: "Earned my AWS CCP badge today. Moving next to Advanced Developer tracks to optimize our project deployments on AWS ECS and Lambda APIs.",
    type: "certification",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 19,
    likedByUser: false,
    savedByUser: false,
    commentsCount: 2,
  },
  {
    id: "post-4",
    studentName: "Sneha Reddy",
    studentAvatar: "S",
    registerNumber: "RA2211003030012",
    title: "Published Open-Source SRM Vector API Client",
    description: "Released a lightweight TypeScript library for mapping SRM courses database to custom vector index stores. Check out the GitHub repository!",
    type: "project",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 31,
    likedByUser: false,
    savedByUser: false,
    commentsCount: 4,
  },
];

export default function CampusFeedClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostDesc, setNewPostDesc] = useState("");
  const [newPostType, setNewPostType] = useState<Post["type"]>("internship");
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedSearch, setFeedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("soip_campus_posts");
      if (saved) {
        setPosts(JSON.parse(saved));
      } else {
        setPosts(PRE_SEEDED_POSTS);
        localStorage.setItem("soip_campus_posts", JSON.stringify(PRE_SEEDED_POSTS));
      }
    } catch {
      setPosts(PRE_SEEDED_POSTS);
    }
  }, []);

  const persistPosts = (updated: Post[]) => {
    setPosts(updated);
    try {
      localStorage.setItem("soip_campus_posts", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // ─────────────── POST ACTIONS ───────────────
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostDesc.trim()) return;
    setIsPublishing(true);

    setTimeout(() => {
      const newPost: Post = {
        id: `post-${Date.now()}`,
        studentName: "My Portfolio", // Uses user profile fallback
        studentAvatar: "U",
        registerNumber: "RA2211003010001",
        title: newPostTitle.trim(),
        description: newPostDesc.trim(),
        type: newPostType,
        date: new Date().toISOString(),
        likes: 0,
        likedByUser: false,
        savedByUser: false,
        commentsCount: 0,
      };

      const updated = [newPost, ...posts];
      persistPosts(updated);
      setNewPostTitle("");
      setNewPostDesc("");
      setIsPublishing(false);
    }, 800);
  };

  const handleToggleLike = (id: string) => {
    const updated = posts.map((post) => {
      if (post.id === id) {
        return {
          ...post,
          likes: post.likedByUser ? post.likes - 1 : post.likes + 1,
          likedByUser: !post.likedByUser,
        };
      }
      return post;
    });
    persistPosts(updated);
  };

  const handleToggleSave = (id: string) => {
    const updated = posts.map((post) => {
      if (post.id === id) {
        return {
          ...post,
          savedByUser: !post.savedByUser,
        };
      }
      return post;
    });
    persistPosts(updated);
  };

  const handleSharePost = (post: Post) => {
    const shareUrl = `${window.location.origin}/opportunities?feed_post=${post.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(feedSearch.toLowerCase()) ||
        post.description.toLowerCase().includes(feedSearch.toLowerCase()) ||
        post.studentName.toLowerCase().includes(feedSearch.toLowerCase());
      const matchesType = selectedType === "all" || post.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [posts, feedSearch, selectedType]);

  // Spotlight Students list
  const spotlightStudents = [
    { name: "Charanjeet Singh", score: 245, achievements: 4, certifications: 3, avatar: "C" },
    { name: "Aishwarya Nair", score: 220, achievements: 3, certifications: 4, avatar: "A" },
    { name: "Meera Krishnan", score: 215, achievements: 3, certifications: 2, avatar: "M" },
    { name: "Rohan Das", score: 185, achievements: 2, certifications: 3, avatar: "R" },
  ];

  // Personal Timeline data
  const personalTimeline = [
    { title: "Earned Badge: Goal Achiever", desc: "Completed Learn React & Next.js 15 target goal", type: "badge", time: "2 hours ago" },
    { title: "Applied to Amazon SDE Intern", desc: "Submitted resume and completed initial assessment", type: "apply", time: "1 day ago" },
    { title: "Attended Next Tech Lab AI Hackathon", desc: "Demoed automated terminal agent project", type: "event", time: "2 days ago" },
    { title: "Joined SRM Intelligence Platform", desc: "Onboarded and established skill vector matches", type: "join", time: "3 days ago" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 font-mono text-zinc-300">
      {/* Left/Center Column: Post Publisher & Activity Feed */}
      <div className="flex-1 space-y-6">
        {/* Post Publisher Box */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold text-zinc-200">Share your SRM Career Achievement</h2>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase">Title</label>
                <input
                  type="text"
                  required
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="e.g. Won hackathon, Joined club..."
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase">Achievement Type</label>
                <select
                  value={newPostType}
                  onChange={(e) => setNewPostType(e.target.value as Post["type"])}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-300 cursor-pointer"
                >
                  <option value="internship">Internship Achievement</option>
                  <option value="hackathon">Hackathon Participation</option>
                  <option value="certification">Certification Earned</option>
                  <option value="project">Project Publication</option>
                  <option value="club">Club Achievement</option>
                  <option value="general">General Update</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase">Description</label>
              <textarea
                required
                rows={3}
                value={newPostDesc}
                onChange={(e) => setNewPostDesc(e.target.value)}
                placeholder="Details about your milestone..."
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200 leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPublishing}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Publish Post</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Feed Filtering Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/20 p-3 rounded-2xl border border-zinc-850/80">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={feedSearch}
              onChange={(e) => setFeedSearch(e.target.value)}
              placeholder="Search feed posts..."
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 pl-9 pr-4 text-xs focus:outline-none font-mono"
            />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto shrink-0 select-none">
            {["all", "internship", "hackathon", "certification", "project"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors shrink-0 ${
                  selectedType === type
                    ? "bg-purple-600 text-white border border-purple-500/20"
                    : "bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Posts feed */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700/60 transition-colors space-y-4 relative group"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-300 font-bold font-mono text-sm shrink-0">
                      {post.studentAvatar}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                        <span>{post.studentName}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono uppercase font-bold border ${
                          post.type === "internship"
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                            : post.type === "hackathon"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                            : post.type === "certification"
                            ? "bg-teal-500/10 text-teal-300 border-teal-500/20"
                            : "bg-zinc-850 text-zinc-400 border-zinc-800"
                        }`}>
                          {post.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 block font-light">
                        {post.registerNumber}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>

                {/* Post Body */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-zinc-200">{post.title}</h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-line font-light">
                    {post.description}
                  </p>
                </div>

                {/* Post Interactions */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-850/80 text-[10px] text-zinc-500 font-mono">
                  <div className="flex items-center gap-4">
                    {/* Like button */}
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        post.likedByUser
                          ? "text-red-400 font-bold"
                          : "hover:text-zinc-300"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${post.likedByUser ? "fill-red-400 text-red-400" : ""}`} />
                      <span>{post.likes} Likes</span>
                    </button>

                    {/* Comments indicator */}
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-600" />
                      <span>{post.commentsCount} Comments</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Bookmark button */}
                    <button
                      onClick={() => handleToggleSave(post.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        post.savedByUser
                          ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
                          : "bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300"
                      }`}
                      title="Save Post"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>

                    {/* Share button */}
                    <button
                      onClick={() => handleSharePost(post)}
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer relative"
                      title="Share Post"
                    >
                      {copiedId === post.id ? (
                        <span className="absolute bottom-full right-0 mb-1.5 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-[8px] text-purple-400 whitespace-nowrap">
                          Copied link!
                        </span>
                      ) : null}
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredPosts.length === 0 && (
            <div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl space-y-2 bg-zinc-900/15">
              <Award className="w-8 h-8 text-zinc-700 mx-auto" />
              <h3 className="text-xs font-bold text-zinc-400">No achievements matching search</h3>
              <p className="text-[10px] text-zinc-500">Publish a post at the top to be the first!</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Trending, Spotlight, and Activity Timeline */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        {/* 1. Student Spotlight */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold text-zinc-200">Student Spotlight</h2>
          </div>

          <div className="space-y-3 text-xs">
            {spotlightStudents.map((stud, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-[11px] text-indigo-400 shrink-0">
                    {stud.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-zinc-200 truncate leading-tight">{stud.name}</div>
                    <span className="text-[9px] text-zinc-500 block">
                      {stud.achievements} Achs · {stud.certifications} Certs
                    </span>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-purple-400 shrink-0">{stud.score} Pts</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Trending Section */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold text-zinc-200">Trending Now</h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Opportunities */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wide">Opportunities</span>
              <div className="space-y-1 select-none">
                <div className="flex items-center justify-between text-[11px] hover:text-zinc-200 transition-colors">
                  <span className="truncate">1. Google STEP Internship</span>
                  <span className="text-zinc-600 shrink-0 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-purple-450" />142 applicants</span>
                </div>
                <div className="flex items-center justify-between text-[11px] hover:text-zinc-200 transition-colors">
                  <span className="truncate">2. Microsoft Engage Mentorship</span>
                  <span className="text-zinc-600 shrink-0 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-purple-450" />98 applicants</span>
                </div>
              </div>
            </div>

            {/* Organizations */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wide">Organizations</span>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] hover:text-zinc-200 transition-colors">
                  <span className="truncate">Next Tech Lab</span>
                  <span className="text-[10px] text-purple-400 px-1.5 py-0.2 bg-purple-500/10 border border-purple-500/20 rounded">Active</span>
                </div>
                <div className="flex items-center justify-between text-[11px] hover:text-zinc-200 transition-colors">
                  <span className="truncate">Microsoft Student Chapter</span>
                  <span className="text-[10px] text-purple-400 px-1.5 py-0.2 bg-purple-500/10 border border-purple-500/20 rounded">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Personal Activity Timeline View */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-bold text-zinc-200 font-mono">My Activity Timeline</h2>
            </div>
            <span className="text-[9px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-full border border-zinc-800">
              Live Stream
            </span>
          </div>

          <div className="relative pl-5 border-l border-zinc-800/80 space-y-4 text-xs font-mono">
            {personalTimeline.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
                className="relative group/timeline"
              >
                {/* Glowing Node */}
                <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-zinc-950 border border-indigo-500/50 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 group-hover/timeline:scale-125 transition-transform" />
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-850 hover:border-zinc-750 transition-colors space-y-1">
                  <h4 className="text-[11px] font-bold text-zinc-200 group-hover/timeline:text-indigo-300 transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-light">{item.desc}</p>
                  <span className="text-[9px] text-zinc-500 block font-mono">{item.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
