import React, { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Terminal, Shield, Code, FileText, Cpu, Trash2, ArrowRight, CheckCircle, AlertTriangle, Layers, Copy, Download, RefreshCw, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { motion } from "framer-motion";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectBaseUrl, setNewProjectBaseUrl] = useState("https://api.example.com");

  // Supabase auth state support
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [supabaseEmail, setSupabaseEmail] = useState("");
  const [supabasePassword, setSupabasePassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 6000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setLoadingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 80);

    const timer = setTimeout(() => {
      setInitializing(false);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const projectsQuery = trpc.projects.list.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();

  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: (res) => {
      toast.success("API project created successfully.");
      setNewProjectOpen(false);
      setNewProjectName("");
      setNewProjectDesc("");
      utils.projects.list.invalidate();
      setSelectedProjectId(res.id);
    },
    onError: (err) => toast.error(err.message)
  });

  const deleteProjectMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted.");
      setSelectedProjectId(null);
      utils.projects.list.invalidate();
    }
  });

  if (loading || initializing) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono relative overflow-hidden">
        {/* Subtle Ambient Radial Glow Behind Card */}
        <div className="absolute w-[600px] h-[600px] bg-red-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotateX: -30, rotateY: 30 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          className="space-y-8 text-center z-10 p-12 bg-zinc-950/90 backdrop-blur-xl border-2 border-red-600 shadow-[0_0_80px_rgba(220,38,38,0.4),16px_16px_0px_0px_rgba(255,255,255,0.1)] max-w-lg w-full mx-4"
          style={{ perspective: 1200 }}
        >
          {/* 3D Assembling Circuit Logo */}
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ 
              scale: [0.8, 1.05, 1], 
              opacity: 1, 
              y: [20, 0, 0],
              rotateY: [0, 15, 0, -15, 0],
              rotateX: [0, 8, 0, -8, 0]
            }}
            transition={{ 
              duration: 3, 
              times: [0, 0.4, 1],
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: "easeInOut" 
            }}
            className="w-72 h-36 mx-auto flex items-center justify-center p-4 bg-black border-2 border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.8),8px_8px_0px_0px_rgba(255,255,255,0.2)] relative"
          >
            {/* Glowing Fiber Optic Pulse Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-red-500/20 animate-pulse pointer-events-none" />
            <div className="w-24 h-20 flex items-center justify-center bg-zinc-950 border-2 border-red-500 font-black text-white tracking-widest text-4xl shadow-[0_0_30px_rgba(220,38,38,1)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 via-transparent to-red-600/40 animate-pulse" />
              <span className="relative z-10 bg-gradient-to-r from-white via-red-400 to-blue-400 bg-clip-text text-transparent">AF</span>
            </div>
          </motion.div>

          {/* Wordmark Assembly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-black tracking-widest uppercase mb-1 text-white">APIFORGE</h1>
            <p className="text-xs text-red-400 font-bold uppercase tracking-widest animate-pulse">
              Energizing Fiber-Optic Infrastructure & Security Meshes...
            </p>
          </motion.div>

          {/* Progress Energy Line & Percentage */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs text-zinc-400 uppercase tracking-widest px-2">
              <span>System Initialization</span>
              <span className="font-bold text-red-500">{loadingProgress}%</span>
            </div>
            <div className="w-64 h-2 bg-zinc-900 mx-auto overflow-hidden border border-zinc-700 relative">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 via-red-600 to-white shadow-[0_0_10px_rgba(220,38,38,1)]" 
                style={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Supabase auth state support & hooks already declared at top

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseEmail || !supabasePassword) {
      toast.error("Please enter email and password");
      return;
    }
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email: supabaseEmail, password: supabasePassword });
      if (error) toast.error(error.message);
      else {
        toast.success("Signup successful! Please check your email or sign in.");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: supabaseEmail, password: supabasePassword });
      if (error) toast.error(error.message);
      else {
        toast.success("Signed in successfully with Supabase!");
        setAuthModalOpen(false);
      }
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'azure' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      if (error.message.includes("not enabled")) {
        toast.error(`"${provider}" provider is not enabled in your Supabase project. Enable it in Supabase Dashboard > Authentication > Providers, or use Email/Password or Demo Mode.`);
      } else {
        toast.error(`Failed to sign in with ${provider}: ${error.message}`);
      }
    }
  };

  const handleDemoLogin = () => {
    setSupabaseUser({ id: "demo-user-1", email: "demo@apiiforge.dev", user_metadata: { name: "Demo Architect" } });
    setAuthModalOpen(false);
    toast.success("Logged in successfully as Demo Architect!");
  };

  const isAuthed = isAuthenticated || supabaseUser;

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col justify-between selection:bg-red-600 selection:text-white">
        {/* Header */}
        <header className="border-b border-black/10 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1], 
                rotateZ: [0, 3, -3, 0],
                boxShadow: [
                  "3px 3px 0px 0px rgba(0,0,0,1), 0 0 10px rgba(220,38,38,0.5)",
                  "3px 3px 0px 0px rgba(0,0,0,1), 0 0 20px rgba(59,130,246,0.8)",
                  "3px 3px 0px 0px rgba(0,0,0,1), 0 0 10px rgba(220,38,38,0.5)"
                ]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-12 h-9 flex items-center justify-center bg-zinc-950 border-2 border-red-600 font-black text-white tracking-wider text-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-transparent to-red-600/30 animate-pulse" />
              <span className="relative z-10 bg-gradient-to-r from-white via-red-400 to-blue-400 bg-clip-text text-transparent">AF</span>
            </motion.div>
            <span className="font-black tracking-tighter text-2xl uppercase">APIForge</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => setAuthModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase tracking-widest px-6 py-6 rounded-none">
              Create Account <Lock className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Auth Modal */}
        <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
          <DialogContent className="border border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white max-w-md">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl uppercase tracking-tight">
                {isSignUp ? "Supabase Sign Up" : "Supabase Sign In"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSupabaseAuth} className="space-y-4 pt-4">
              <div>
                <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <Input 
                    type="email" 
                    className="border-black rounded-none font-mono pl-10" 
                    placeholder="developer@apiforge.dev" 
                    value={supabaseEmail} 
                    onChange={(e) => setSupabaseEmail(e.target.value)} 
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <Input 
                    type="password" 
                    className="border-black rounded-none font-mono pl-10" 
                    placeholder="••••••••" 
                    value={supabasePassword} 
                    onChange={(e) => setSupabasePassword(e.target.value)} 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase py-6 rounded-none mt-2">
                {isSignUp ? "Create Supabase Account" : "Sign In with Supabase"}
              </Button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-300"></div>
                <span className="flex-shrink mx-4 font-mono text-[10px] uppercase text-zinc-500">Or continue with social</span>
                <div className="flex-grow border-t border-zinc-300"></div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleSocialLogin('google')} 
                  className="border-black rounded-none font-mono text-xs uppercase py-5"
                >
                  Google
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleSocialLogin('azure')} 
                  className="border-black rounded-none font-mono text-xs uppercase py-5"
                >
                  Microsoft
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleSocialLogin('github')} 
                  className="border-black rounded-none font-mono text-xs uppercase py-5"
                >
                  GitHub
                </Button>
              </div>

              <div className="text-center pt-2 space-y-2">
                <button 
                  type="button" 
                  onClick={() => setIsSignUp(!isSignUp)} 
                  className="font-mono text-xs text-zinc-600 underline hover:text-black block w-full"
                >
                  {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                </button>
                <button 
                  type="button" 
                  onClick={handleDemoLogin} 
                  className="font-mono text-xs text-red-600 font-bold hover:underline block w-full pt-1"
                >
                  ⚡ Instant Demo Access (Bypass Auth)
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Hero */}
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          <div className="lg:col-span-7">
            <div className="inline-flex items-center space-x-2 border border-black px-3 py-1 text-xs font-mono mb-6 bg-zinc-50">
              <span className="w-2 h-2 bg-red-600 animate-pulse" />
              <span>ENTERPRISE API INFRARED PLATFORM</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-8 uppercase break-words">
              Design APIs. <span className="text-red-600">Generate</span> Infrastructure. Test Everything.
            </h1>
            <p className="text-lg text-zinc-600 mb-10 font-sans leading-relaxed max-w-2xl">
              APIForge is the ultimate developer platform for architecting canonical API specs, generating deterministic FastAPI & Express backends, configuring middleware layers, scanning for security vulnerabilities, and exporting OpenAPI 3.0 documents instantly.
            </p>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setAuthModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white font-mono text-sm uppercase tracking-widest px-8 py-7 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
                Start Building Free <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5 border border-black p-6 sm:p-8 bg-zinc-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 mb-6 font-mono text-xs uppercase text-zinc-500">
              <span>Canonical Spec Preview</span>
              <span className="text-red-600 font-bold">YAML / JSON</span>
            </div>
            <pre className="font-mono text-xs text-zinc-800 overflow-x-auto leading-relaxed">
{`{
  "project": "Payment Gateway API",
  "version": "2.4.0",
  "runtime": "fastapi",
  "endpoints": [
    {
      "method": "POST",
      "path": "/api/v1/charges",
      "auth": "jwt",
      "middleware": ["rate_limit", "validation", "logging"],
      "response": "ChargeResponse"
    }
  ],
  "security_score": 98
}`}
            </pre>
          </div>
        </motion.main>

        {/* Features grid */}
        <section className="border-t border-black/10 bg-zinc-50 py-20 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <span className="text-red-600 font-mono text-xs uppercase tracking-widest block mb-2">ARCHITECTURAL CAPABILITIES</span>
              <h2 className="text-4xl font-black tracking-tight">ENGINEERED FOR SENIOR DEVELOPERS</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Visual API Designer", desc: "Design REST endpoints, HTTP verbs, path params, query strings, headers, and status codes." },
                { title: "Middleware Configurator", desc: "Wire authentication (JWT/API Key/OAuth2), rate limiting, CORS, logging, and caching layers." },
                { title: "Security Analyzer", desc: "Automated vulnerability scanner checking missing auth, exposed fields, and unsafe methods." },
                { title: "Code Generation", desc: "Deterministic scaffold generation for FastAPI (Python) and Express.js (Node.js)." },
                { title: "OpenAPI 3.0 Export", desc: "Export full specification as valid OpenAPI 3.0 YAML or JSON documents instantly." },
                { title: "AI Copilot & S3 Storage", desc: "Natural language design suggestions and S3-backed downloadable generation artifacts." }
              ].map((f, i) => (
                <div key={i} className="border border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                  <div>
                    <div className="w-3 h-3 bg-red-600 mb-6" />
                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                    <p className="text-zinc-600 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-black/10 py-8 px-8 flex flex-col md:flex-row items-center justify-between font-mono text-xs text-zinc-600 gap-4">
          <div>
            <span>© 2026 APIForge. Created and maintained by </span>
            <a href="https://probanjee.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-black font-bold underline">probanjee</a>.
          </div>
          <div className="flex items-center space-x-6">
            <a href="https://probanjee.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-black">
              <span className="w-2 h-2 bg-red-600 inline-block" />
              <span className="uppercase font-bold">Portfolio</span>
            </a>
            <a href="https://github.com/probanjee" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-black">
              <span className="w-2 h-2 bg-black inline-block" />
              <span className="uppercase font-bold">GitHub</span>
            </a>
          </div>
        </footer>
      </div>
    );
  }

  const projects = projectsQuery.data || [];
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  return (
    <div className="min-h-screen bg-white text-black flex flex-col selection:bg-red-600 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-black/10 px-8 py-4 flex items-center justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setSelectedProjectId(null)}>
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1], 
                rotateZ: [0, 3, -3, 0],
                boxShadow: [
                  "3px 3px 0px 0px rgba(0,0,0,1), 0 0 10px rgba(220,38,38,0.5)",
                  "3px 3px 0px 0px rgba(0,0,0,1), 0 0 20px rgba(59,130,246,0.8)",
                  "3px 3px 0px 0px rgba(0,0,0,1), 0 0 10px rgba(220,38,38,0.5)"
                ]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-11 h-8 flex items-center justify-center bg-zinc-950 border-2 border-red-600 font-black text-white tracking-wider text-base shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-transparent to-red-600/30 animate-pulse" />
              <span className="relative z-10 bg-gradient-to-r from-white via-red-400 to-blue-400 bg-clip-text text-transparent">AF</span>
            </motion.div>
            <span className="font-black tracking-tighter text-xl uppercase">APIForge</span>
          </div>
          <span className="text-zinc-300">/</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs uppercase text-zinc-500">Workspace:</span>
            <select 
              className="bg-zinc-100 border border-black/20 font-mono text-xs px-3 py-1.5 focus:outline-none"
              value={activeProject?.id || ""}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            >
              {projects.length === 0 && <option value="">No Projects Created</option>}
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} (v{p.version})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => setNewProjectOpen(true)} className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase tracking-wider rounded-none">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
          <div className="h-6 w-px bg-zinc-200" />
          <span className="font-mono text-xs text-zinc-600">{user?.name || supabaseUser?.email}</span>
          <Button variant="outline" onClick={async () => {
            if (supabaseUser) {
              await supabase.auth.signOut();
              setSupabaseUser(null);
            } else {
              logout();
            }
          }} className="font-mono text-xs uppercase rounded-none border-black">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {!activeProject ? (
          <div className="text-center py-24 border border-dashed border-black/30 p-12">
            <h2 className="text-3xl font-black mb-4">No API Projects Found</h2>
            <p className="text-zinc-600 mb-8 max-w-md mx-auto">Create your first API project to start designing endpoints, schemas, middleware, and generating infrastructure.</p>
            <Button onClick={() => setNewProjectOpen(true)} className="bg-black text-white font-mono text-xs uppercase px-6 py-6 rounded-none">
              <Plus className="w-4 h-4 mr-2" /> Create First Project
            </Button>
          </div>
        ) : (
          <ProjectWorkspace project={activeProject} onDelete={() => deleteProjectMutation.mutate({ id: activeProject.id })} />
        )}
      </main>

      {/* New Project Dialog */}
      <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
        <DialogContent className="border border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <DialogHeader>
            <DialogTitle className="font-black text-2xl uppercase tracking-tight">Create API Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">Project Name</label>
              <Input 
                className="border-black rounded-none font-mono" 
                placeholder="e.g. E-Commerce Checkout API" 
                value={newProjectName} 
                onChange={(e) => setNewProjectName(e.target.value)} 
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">Description</label>
              <Input 
                className="border-black rounded-none font-mono" 
                placeholder="Handles secure order checkout and payment processing" 
                value={newProjectDesc} 
                onChange={(e) => setNewProjectDesc(e.target.value)} 
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">Base URL</label>
              <Input 
                className="border-black rounded-none font-mono" 
                placeholder="https://api.shop.com" 
                value={newProjectBaseUrl} 
                onChange={(e) => setNewProjectBaseUrl(e.target.value)} 
              />
            </div>
            <Button 
              onClick={() => {
                const finalName = newProjectName.trim() || "Untitled API Project";
                createProjectMutation.mutate({ name: finalName, description: newProjectDesc, baseUrl: newProjectBaseUrl });
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase py-6 rounded-none mt-4"
            >
              {createProjectMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Initialize Project & DB
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectWorkspace({ project, onDelete }: { project: any; onDelete: () => void }) {
  const [activeTab, setActiveTab] = useState("designer");

  return (
    <div className="space-y-8">
      {/* Project Banner */}
      <div className="border border-black p-6 bg-zinc-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="w-3 h-3 bg-red-600" />
            <h1 className="text-3xl font-black tracking-tight">{project.name}</h1>
            <Badge variant="outline" className="border-black font-mono text-xs rounded-none">v{project.version}</Badge>
          </div>
          <p className="text-zinc-600 text-sm font-sans">{project.description || "No description provided."}</p>
          <div className="flex items-center space-x-4 mt-3 font-mono text-xs text-zinc-500">
            <span>Base URL: <strong className="text-black">{project.baseUrl}</strong></span>
            <span>•</span>
            <span>Slug: <strong className="text-black">{project.slug}</strong></span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onDelete} className="border-red-600 text-red-600 hover:bg-red-50 font-mono text-xs uppercase rounded-none">
            <Trash2 className="w-4 h-4 mr-2" /> Delete Project
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-8 bg-zinc-100 border border-black rounded-none p-0 h-auto">
          <TabsTrigger value="designer" className="font-mono text-xs uppercase py-3 rounded-none data-[state=active]:bg-black data-[state=active]:text-white">API Designer</TabsTrigger>
          <TabsTrigger value="schemas" className="font-mono text-xs uppercase py-3 rounded-none data-[state=active]:bg-black data-[state=active]:text-white">Schemas & GQL</TabsTrigger>
          <TabsTrigger value="middleware" className="font-mono text-xs uppercase py-3 rounded-none data-[state=active]:bg-black data-[state=active]:text-white">Middleware</TabsTrigger>
          <TabsTrigger value="security" className="font-mono text-xs uppercase py-3 rounded-none data-[state=active]:bg-black data-[state=active]:text-white">Security</TabsTrigger>
          <TabsTrigger value="code" className="font-mono text-xs uppercase py-3 rounded-none data-[state=active]:bg-black data-[state=active]:text-white">Code Gen</TabsTrigger>
          <TabsTrigger value="mock" className="font-mono text-xs uppercase py-3 rounded-none data-[state=active]:bg-black data-[state=active]:text-white">Mock Sandbox</TabsTrigger>
          <TabsTrigger value="team" className="font-mono text-xs uppercase py-3 rounded-none data-[state=active]:bg-black data-[state=active]:text-white">Team RBAC</TabsTrigger>
          <TabsTrigger value="ai" className="font-mono text-xs uppercase py-3 rounded-none data-[state=active]:bg-black data-[state=active]:text-white">AI Copilot</TabsTrigger>
        </TabsList>

        <div className="mt-6 border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <TabsContent value="designer">
            <ApiDesignerTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="schemas">
            <SchemaBuilderTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="middleware">
            <MiddlewareConfigTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="security">
            <SecurityAnalyzerTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="code">
            <CodeGeneratorTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="mock">
            <MockSandboxTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="team">
            <TeamRbacTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="ai">
            <AiCopilotTab projectId={project.id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function ApiDesignerTab({ projectId }: { projectId: number }) {
  const endpointsQuery = trpc.endpoints.list.useQuery({ projectId });
  const schemasQuery = trpc.schemas.list.useQuery({ projectId });
  const utils = trpc.useUtils();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE" | "PATCH">("GET");
  const [path, setPath] = useState("/api/v1/resource");
  const [summary, setSummary] = useState("");
  const [auth, setAuth] = useState("jwt");
  const [reqSchemaId, setReqSchemaId] = useState<number | null>(null);
  const [resSchemaId, setResSchemaId] = useState<number | null>(null);

  const saveMutation = trpc.endpoints.save.useMutation({
    onSuccess: () => {
      toast.success("Endpoint saved successfully.");
      setDialogOpen(false);
      utils.endpoints.list.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const deleteMutation = trpc.endpoints.delete.useMutation({
    onSuccess: () => {
      toast.success("Endpoint removed.");
      utils.endpoints.list.invalidate();
    }
  });

  const endpoints = endpointsQuery.data || [];
  const schemas = schemasQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase">Visual API Designer</h2>
          <p className="text-zinc-600 text-sm">Define REST endpoints, HTTP methods, authentication rules, and schemas.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-black text-white font-mono text-xs uppercase rounded-none">
          <Plus className="w-4 h-4 mr-2" /> Add Endpoint
        </Button>
      </div>

      <div className="border border-black overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100 border-b border-black font-mono text-xs uppercase">
              <th className="p-4">Method</th>
              <th className="p-4">Path</th>
              <th className="p-4">Summary</th>
              <th className="p-4">Auth</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono text-xs">No endpoints defined yet. Click "Add Endpoint" to begin.</td>
              </tr>
            ) : (
              endpoints.map(ep => (
                <tr key={ep.id} className="border-b border-black/10 hover:bg-zinc-50">
                  <td className="p-4 font-mono font-bold">
                    <span className={`px-2 py-1 text-xs uppercase ${
                      ep.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                      ep.method === 'POST' ? 'bg-green-100 text-green-800' :
                      ep.method === 'PUT' ? 'bg-amber-100 text-amber-800' :
                      ep.method === 'DELETE' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm">{ep.path}</td>
                  <td className="p-4 text-sm text-zinc-700">{ep.summary || "—"}</td>
                  <td className="p-4 font-mono text-xs uppercase"><Badge variant="outline" className="rounded-none">{ep.authentication}</Badge></td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" onClick={() => deleteMutation.mutate({ id: ep.id })} className="text-red-600 hover:text-red-700 h-8 w-8 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-black text-2xl uppercase">Define API Endpoint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">HTTP Method</label>
                <select className="w-full border border-black p-2 font-mono text-xs bg-white" value={method} onChange={(e: any) => setMethod(e.target.value)}>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">Authentication</label>
                <select className="w-full border border-black p-2 font-mono text-xs bg-white" value={auth} onChange={(e) => setAuth(e.target.value)}>
                  <option value="jwt">JWT Access Token</option>
                  <option value="api_key">API Key</option>
                  <option value="oauth2">OAuth2</option>
                  <option value="none">None (Public)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">Endpoint Path</label>
              <Input className="border-black rounded-none font-mono" placeholder="/api/v1/users/{id}" value={path} onChange={(e) => setPath(e.target.value)} />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">Summary</label>
              <Input className="border-black rounded-none font-mono" placeholder="Retrieve user profile by ID" value={summary} onChange={(e) => setSummary(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">Request Schema</label>
                <select className="w-full border border-black p-2 font-mono text-xs bg-white" value={reqSchemaId || ""} onChange={(e) => setReqSchemaId(e.target.value ? Number(e.target.value) : null)}>
                  <option value="">None</option>
                  {schemas.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">Response Schema</label>
                <select className="w-full border border-black p-2 font-mono text-xs bg-white" value={resSchemaId || ""} onChange={(e) => setResSchemaId(e.target.value ? Number(e.target.value) : null)}>
                  <option value="">None</option>
                  {schemas.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={() => saveMutation.mutate({ projectId, method, path, summary, authentication: auth, requestBodySchemaId: reqSchemaId, responseSchemaId: resSchemaId })} className="w-full bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase py-6 rounded-none mt-4">
              Save Endpoint
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SchemaBuilderTab({ projectId }: { projectId: number }) {
  const schemasQuery = trpc.schemas.list.useQuery({ projectId });
  const utils = trpc.useUtils();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [fieldsText, setFieldsText] = useState('{\n  "type": "object",\n  "properties": {\n    "name": { "type": "string" },\n    "email": { "type": "string" }\n  }\n}');

  const saveMutation = trpc.schemas.save.useMutation({
    onSuccess: () => {
      toast.success("Schema saved.");
      setDialogOpen(false);
      utils.schemas.list.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const deleteMutation = trpc.schemas.delete.useMutation({
    onSuccess: () => {
      toast.success("Schema deleted.");
      utils.schemas.list.invalidate();
    }
  });

  const schemas = schemasQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase">JSON Schema Builder</h2>
          <p className="text-zinc-600 text-sm">Define request and response body schemas with JSON validation rules.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-black text-white font-mono text-xs uppercase rounded-none">
          <Plus className="w-4 h-4 mr-2" /> Add Schema
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schemas.length === 0 ? (
          <div className="col-span-2 text-center py-16 border border-dashed border-black/30 font-mono text-xs text-zinc-500">
            No schemas defined. Click "Add Schema" to create data models.
          </div>
        ) : (
          schemas.map(s => (
            <div key={s.id} className="border border-black p-6 bg-zinc-50 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-lg">{s.name}</h3>
                  <p className="text-xs text-zinc-600">{s.description || "No description"}</p>
                </div>
                <Button variant="ghost" onClick={() => deleteMutation.mutate({ id: s.id })} className="text-red-600 h-8 w-8 p-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <pre className="bg-white border border-black/20 p-4 font-mono text-xs overflow-x-auto">
                {JSON.stringify(s.definition, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-black text-2xl uppercase">Define JSON Schema</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">Schema Name</label>
              <Input className="border-black rounded-none font-mono" placeholder="CreateUserPayload" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">Description</label>
              <Input className="border-black rounded-none font-mono" placeholder="Payload for user registration" value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">JSON Schema Definition (JSON)</label>
              <textarea 
                className="w-full border border-black p-4 font-mono text-xs h-40 bg-white focus:outline-none"
                value={fieldsText}
                onChange={(e) => setFieldsText(e.target.value)}
              />
            </div>
            <Button onClick={() => {
              try {
                const parsed = JSON.parse(fieldsText);
                const finalName = name.trim() || "NewSchema";
                saveMutation.mutate({ projectId, name: finalName, description: desc, definition: parsed });
              } catch (err) {
                toast.error("Invalid JSON format in schema definition.");
              }
            }} className="w-full bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase py-6 rounded-none mt-4">
              Save Schema
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MiddlewareConfigTab({ projectId }: { projectId: number }) {
  const mwQuery = trpc.middleware.list.useQuery({ projectId });
  const utils = trpc.useUtils();

  const saveMutation = trpc.middleware.save.useMutation({
    onSuccess: () => {
      toast.success("Middleware updated.");
      utils.middleware.list.invalidate();
    }
  });

  const mwList = mwQuery.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black uppercase">Middleware Configurator</h2>
        <p className="text-zinc-600 text-sm">Configure authentication, rate limiting, CORS, logging, and caching layers globally.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mwList.map(mw => (
          <div key={mw.id} className="border border-black p-6 bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-black text-lg">{mw.name}</h3>
                <span className={`px-2 py-0.5 font-mono text-xs ${mw.enabled ? 'bg-green-100 text-green-800' : 'bg-zinc-200 text-zinc-600'}`}>
                  {mw.enabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-500 uppercase mb-4">Type: {mw.type}</p>
              <pre className="bg-white border border-black/20 p-3 font-mono text-xs mb-4">
                {JSON.stringify(mw.config, null, 2)}
              </pre>
            </div>
            <Button 
              variant="outline" 
              onClick={() => saveMutation.mutate({ id: mw.id, projectId, name: mw.name, type: mw.type, enabled: mw.enabled ? 0 : 1, config: mw.config })}
              className="border-black font-mono text-xs uppercase rounded-none"
            >
              {mw.enabled ? 'Disable Middleware' : 'Enable Middleware'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityAnalyzerTab({ projectId }: { projectId: number }) {
  const scanMutation = trpc.security.scan.useMutation({
    onSuccess: () => toast.success("Security scan completed.")
  });
  const latestScanQuery = trpc.security.latest.useQuery({ projectId });

  const scan = latestScanQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase">Security Analyzer</h2>
          <p className="text-zinc-600 text-sm">Scan API specifications for vulnerabilities, missing authentication, and insecure methods.</p>
        </div>
        <Button onClick={() => scanMutation.mutate({ projectId })} className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase rounded-none">
          {scanMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Run Security Scan
        </Button>
      </div>

      {scan ? (
        <div className="space-y-6">
          <div className="border border-black p-6 bg-zinc-50 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <span className="font-mono text-xs uppercase text-zinc-500 block mb-1">Overall Security Posture Score</span>
              <h3 className="text-5xl font-black">{scan.score} <span className="text-2xl text-zinc-400">/ 100</span></h3>
            </div>
            <div className={`px-6 py-3 font-mono text-sm font-bold ${scan.score >= 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {scan.score >= 80 ? 'SECURE' : 'ACTION REQUIRED'}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-xl uppercase">Vulnerability Findings & Recommendations</h3>
            {(scan.findings as any[] || []).map((f: any, idx: number) => (
              <div key={idx} className="border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">{f.title}</h4>
                  <span className={`px-2 py-0.5 font-mono text-xs font-bold ${f.severity === 'HIGH' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
                    {f.severity}
                  </span>
                </div>
                <p className="text-zinc-600 text-sm mb-3">{f.description}</p>
                <div className="bg-zinc-50 border-l-2 border-red-600 p-3 font-mono text-xs">
                  <strong>Recommendation:</strong> {f.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-black/30 font-mono text-xs text-zinc-500">
          No security scan performed yet. Click "Run Security Scan" to analyze endpoints.
        </div>
      )}
    </div>
  );
}

function CodeGeneratorTab({ projectId }: { projectId: number }) {
  const [runtime, setRuntime] = useState<"fastapi" | "express">("fastapi");
  const [exportFormat, setExportFormat] = useState<"yaml" | "json">("json");
  const [generatedCode, setGeneratedCode] = useState("");
  const [openapiUrl, setOpenapiUrl] = useState("");

  const genCodeMutation = trpc.generator.generateCode.useMutation({
    onSuccess: (res) => {
      setGeneratedCode(res.code);
      toast.success("Code scaffold generated successfully.");
    }
  });

  const exportOpenApiMutation = trpc.generator.exportOpenAPI.useMutation({
    onSuccess: (res) => {
      setOpenapiUrl(res.url);
      toast.success("OpenAPI 3.0 document exported.");
    }
  });

  const artifactsQuery = trpc.generator.listArtifacts.useQuery({ projectId });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black uppercase">Code Generation Engine & OpenAPI Export</h2>
        <p className="text-zinc-600 text-sm">Generate production-ready backend scaffolds for FastAPI & Express.js and export OpenAPI 3.0 specifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-black p-6 bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-black text-lg mb-4">Backend Runtime Scaffolding</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">Target Runtime</label>
              <select className="w-full border border-black p-2 font-mono text-xs bg-white" value={runtime} onChange={(e: any) => setRuntime(e.target.value)}>
                <option value="fastapi">FastAPI (Python + Pydantic)</option>
                <option value="express">Express.js (Node.js)</option>
              </select>
            </div>
            <Button onClick={() => genCodeMutation.mutate({ projectId, runtime })} className="w-full bg-black text-white font-mono text-xs uppercase py-6 rounded-none">
              {genCodeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Generate Backend Scaffold
            </Button>
          </div>
        </div>

        <div className="border border-black p-6 bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-black text-lg mb-4">OpenAPI 3.0 Specification Export</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">Export Format</label>
              <select className="w-full border border-black p-2 font-mono text-xs bg-white" value={exportFormat} onChange={(e: any) => setExportFormat(e.target.value)}>
                <option value="json">JSON Format</option>
                <option value="yaml">YAML Format</option>
              </select>
            </div>
            <Button onClick={() => exportOpenApiMutation.mutate({ projectId, format: exportFormat })} className="w-full bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase py-6 rounded-none">
              {exportOpenApiMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Export OpenAPI 3.0 Document
            </Button>
            {openapiUrl && (
              <a href={openapiUrl} target="_blank" rel="noreferrer" className="block text-center font-mono text-xs text-blue-600 underline pt-2">
                Download Exported OpenAPI File →
              </a>
            )}
          </div>
        </div>
      </div>

      {generatedCode && (
        <div className="border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-lg uppercase">Generated Scaffold Code</h3>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(generatedCode); toast.success("Copied to clipboard!"); }} className="border-black font-mono text-xs uppercase rounded-none">
              <Copy className="w-4 h-4 mr-2" /> Copy Code
            </Button>
          </div>
          <pre className="bg-zinc-900 text-zinc-100 p-6 font-mono text-xs overflow-x-auto max-h-96">
            {generatedCode}
          </pre>
        </div>
      )}

      <div className="border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-black text-lg mb-4 uppercase">S3-Backed Generation Artifact History</h3>
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-zinc-100 border-b border-black">
              <th className="p-3">Runtime / Format</th>
              <th className="p-3">File Key</th>
              <th className="p-3">Timestamp</th>
              <th className="p-3 text-right">Download</th>
            </tr>
          </thead>
          <tbody>
            {(artifactsQuery.data || []).length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-zinc-500">No artifacts generated yet.</td></tr>
            ) : (
              (artifactsQuery.data || []).map(art => (
                <tr key={art.id} className="border-b border-black/10">
                  <td className="p-3 uppercase font-bold">{art.runtime}</td>
                  <td className="p-3 text-zinc-600">{art.fileKey}</td>
                  <td className="p-3">{new Date(art.createdAt).toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <a href={art.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-red-600 hover:underline">
                      <Download className="w-3 h-3 mr-1" /> Download
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AiCopilotTab({ projectId }: { projectId: number }) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: "Greetings! I am your APIForge AI Architect. Ask me to design APIs, suggest middleware architectures, or explain security findings." }
  ]);

  const copilotMutation = trpc.ai.copilot.useMutation({
    onSuccess: (res) => {
      setMessages(prev => [...prev, { role: "assistant", content: String(res.response) }]);
    },
    onError: (err) => toast.error(err.message)
  });

  const handleSend = () => {
    if (!prompt.trim()) return;
    const userMsg = prompt;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setPrompt("");
    copilotMutation.mutate({ prompt: userMsg, projectId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black uppercase">AI Architect Copilot</h2>
        <p className="text-zinc-600 text-sm">Natural language AI assistant for API design, schema generation, and security recommendations.</p>
      </div>

      <div className="border border-black p-6 bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <span className="font-mono text-[10px] uppercase text-zinc-400 mb-1">{m.role === 'user' ? 'Developer' : 'AI Architect'}</span>
              <div className={`p-4 max-w-2xl text-sm font-sans ${m.role === 'user' ? 'bg-black text-white' : 'bg-white border border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}>
                <Streamdown>{m.content}</Streamdown>
              </div>
            </div>
          ))}
          {copilotMutation.isPending && (
            <div className="flex items-center space-x-2 text-zinc-500 font-mono text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              <span>AI Architect is formulating solution...</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-black/10 flex space-x-3">
          <Input 
            className="border-black rounded-none font-mono bg-white flex-1"
            placeholder="e.g. Design a robust Stripe webhook endpoint with HMAC signature verification..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          />
          <Button onClick={handleSend} className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase px-8 rounded-none">
            Send Prompt
          </Button>
        </div>
      </div>
    </div>
  );
}

function MockSandboxTab({ projectId }: { projectId: number }) {
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("/api/v1/users");
  const [body, setBody] = useState('{\n  "name": "Alex Mercer",\n  "role": "engineer"\n}');
  const [responseResult, setResponseResult] = useState<any>(null);

  const mockMutation = trpc.mock.test.useMutation({
    onSuccess: (res) => {
      setResponseResult(res);
      toast.success(`Mock test executed in ${res.latencyMs}ms`);
    },
    onError: (err) => toast.error(err.message)
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black uppercase">Interactive Mock Testing Sandbox</h2>
        <p className="text-zinc-600 text-sm">Execute live test requests against your API endpoints with simulated latency, status codes, and headers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-black p-6 bg-zinc-50 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-black text-lg">Request Parameters</h3>
          <div className="grid grid-cols-3 gap-2">
            <select className="border border-black p-2 font-mono text-xs bg-white" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
            <input className="col-span-2 border border-black p-2 font-mono text-xs bg-white" value={path} onChange={(e) => setPath(e.target.value)} placeholder="/api/endpoint" />
          </div>
          {["POST", "PUT", "PATCH"].includes(method) && (
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-600 mb-1">Request Body (JSON)</label>
              <textarea className="w-full border border-black p-3 font-mono text-xs h-36 bg-white" value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
          )}
          <Button onClick={() => {
            let parsedBody = null;
            try {
              if (body) parsedBody = JSON.parse(body);
            } catch (e) {
              // ignore
            }
            mockMutation.mutate({ method, path, body: parsedBody });
          }} className="w-full bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase py-6 rounded-none">
            {mockMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Send Mock Request
          </Button>
        </div>

        <div className="border border-black p-6 bg-white space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-lg">Response Output</h3>
            {responseResult && (
              <div className="flex space-x-2 font-mono text-xs">
                <span className={`px-2 py-0.5 font-bold ${responseResult.status < 300 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {responseResult.status} OK
                </span>
                <span className="bg-zinc-100 px-2 py-0.5">{responseResult.latencyMs}ms</span>
              </div>
            )}
          </div>
          {responseResult ? (
            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-zinc-500 uppercase block mb-1">Response Headers</span>
                <pre className="bg-zinc-50 border border-black/20 p-2 overflow-x-auto">{JSON.stringify(responseResult.headers, null, 2)}</pre>
              </div>
              <div>
                <span className="text-zinc-500 uppercase block mb-1">Response Body</span>
                <pre className="bg-zinc-900 text-zinc-100 p-3 overflow-x-auto">{JSON.stringify(responseResult.data, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-400 font-mono text-xs border border-dashed border-black/20">
              Send a request to inspect the live mock response.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamRbacTab({ projectId }: { projectId: number }) {
  const membersQuery = trpc.team.list.useQuery({ projectId });
  const utils = trpc.useUtils();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER">("DEVELOPER");

  const inviteMutation = trpc.team.invite.useMutation({
    onSuccess: () => {
      toast.success("Team member invited successfully.");
      setEmail("");
      utils.team.list.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const removeMutation = trpc.team.remove.useMutation({
    onSuccess: () => {
      toast.success("Member removed.");
      utils.team.list.invalidate();
    }
  });

  const members = membersQuery.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black uppercase">Team Collaboration & RBAC</h2>
        <p className="text-zinc-600 text-sm">Manage project collaborators with Role-Based Access Control (OWNER, ADMIN, DEVELOPER, VIEWER).</p>
      </div>

      <div className="border border-black p-6 bg-zinc-50 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-black text-lg">Invite New Member</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input className="border-black rounded-none font-mono bg-white" placeholder="colleague@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select className="border border-black p-2 font-mono text-xs bg-white" value={role} onChange={(e: any) => setRole(e.target.value)}>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="DEVELOPER">Developer</option>
            <option value="VIEWER">Viewer</option>
          </select>
          <Button onClick={() => {
            if (!email) { toast.error("Please provide an email"); return; }
            inviteMutation.mutate({ projectId, email, role });
          }} className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase rounded-none">
            Send Invite
          </Button>
        </div>
      </div>

      <div className="border border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-zinc-100 border-b border-black uppercase">
              <th className="p-4">Email Address</th>
              <th className="p-4">Access Role</th>
              <th className="p-4">Invited At</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-zinc-500">No project members invited yet.</td></tr>
            ) : (
              members.map(m => (
                <tr key={m.id} className="border-b border-black/10">
                  <td className="p-4 font-bold">{m.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold ${
                      m.role === 'OWNER' ? 'bg-red-100 text-red-800' :
                      m.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      m.role === 'DEVELOPER' ? 'bg-blue-100 text-blue-800' : 'bg-zinc-200 text-zinc-800'
                    }`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="p-4">{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" onClick={() => removeMutation.mutate({ id: m.id })} className="text-red-600 hover:text-red-700 h-8 w-8 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
