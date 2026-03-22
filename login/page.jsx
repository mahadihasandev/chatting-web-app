"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  getRedirectResult,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { auth, db, googleProvider } from "@/lib/firebase";
import { setActiveUser } from "@/store/slices/userSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

async function persistGoogleUser(user, dispatch) {
  dispatch(setActiveUser(user));
  await set(ref(db, `users/${user.uid}`), {
    username: user.displayName,
    email: user.email,
    photo: user.photoURL,
  });
}

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgetOpen, setForgetOpen] = useState(false);
  const [forgetEmail, setForgetEmail] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();

  const fadeUp = {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.56, ease: [0.22, 1, 0.36, 1] },
  };
  const MotionSection = motion.section;

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result?.user) return;
        await persistGoogleUser(result.user, dispatch);
        toast.success("Welcome to BartaBox");
        router.push("/chat");
      })
      .catch((error) => {
        if (error?.code !== "auth/no-auth-event") {
          toast.error(error.code || "Google login failed");
        }
      })
      .finally(() => setGoogleLoading(false));
  }, [dispatch, router]);

  const handleLogin = async () => {
    if (!email || !pass) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      if (!userCredential.user.emailVerified) {
        toast.error("Verify your email before logging in");
        return;
      }

      dispatch(setActiveUser(userCredential.user));
      toast.success("Welcome back");
      router.push("/chat");
    } catch (error) {
      if (error?.code?.includes("auth/invalid-credential")) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.code || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await persistGoogleUser(result.user, dispatch);
      toast.success("Welcome to BartaBox");
      router.push("/chat");
    } catch (error) {
      const popupRestrictedErrors = [
        "auth/popup-blocked",
        "auth/popup-closed-by-user",
        "auth/cancelled-popup-request",
        "auth/operation-not-supported-in-this-environment",
      ];

      if (popupRestrictedErrors.includes(error.code)) {
        toast.info("Opening Google sign-in redirect...");
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      toast.error(error.code || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!forgetEmail) {
      toast.error("Enter your email first");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, forgetEmail);
      toast.success("Reset email sent");
      setForgetOpen(false);
      setForgetEmail("");
    } catch (error) {
      toast.error(error.code || "Failed to send reset email");
    }
  };

  return (
    <main className="auth-grid grid md:grid-cols-2 relative min-h-screen overflow-hidden bg-slate-50/50">
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute left-[-100px] top-[-50px] h-96 w-96 rounded-full bg-sky-300/40 blur-[80px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
          x: [0, 50, 0],
          y: [0, -50, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-100px] right-[-100px] h-96 w-96 rounded-full bg-indigo-300/40 blur-[80px] pointer-events-none" 
      />

      <MotionSection
        className="hidden md:flex flex-col items-center justify-center p-10 relative"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="w-full max-w-lg rounded-[2rem] p-10 bg-white/40 backdrop-blur-xl border border-white/40 shadow-2xl relative z-10 overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-20 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full bg-gradient-to-tr from-sky-400 to-cyan-300 opacity-20 blur-2xl"></div>
          
          <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Welcome back</h2>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">Fast, clean, and secure access to your realtime conversations.</p>
          
          <div className="mt-12 space-y-4 relative">
            <motion.div 
              animate={{ y: [0, -8, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="bg-white p-4 rounded-t-2xl rounded-br-2xl rounded-bl-sm shadow-md max-w-[80%] border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">AI</div>
                <div className="h-2 w-20 bg-slate-200 rounded-full"></div>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full mb-2"></div>
              <div className="h-2 w-3/4 bg-slate-100 rounded-full"></div>
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, 8, 0] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="bg-sky-50 p-4 rounded-t-2xl rounded-bl-2xl rounded-br-sm shadow-md max-w-[80%] ml-auto border border-sky-100"
            >
               <div className="flex items-center justify-end gap-3 mb-2">
                <div className="h-2 w-16 bg-sky-200 rounded-full"></div>
                <div className="w-8 h-8 rounded-full bg-sky-200 flex items-center justify-center text-sky-700 font-bold text-xs">You</div>
              </div>
              <div className="h-2 w-full bg-sky-200/50 rounded-full mb-2"></div>
              <div className="h-2 w-5/6 auto bg-sky-200/50 rounded-full ml-auto"></div>
            </motion.div>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="flex items-center justify-center px-6 py-10" {...fadeUp}>
        <Card className="glass-panel lift-card w-full max-w-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-3xl">Log in to BartaBox</CardTitle>
            <CardDescription>Continue with email or Google.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="secondary" size="lg" disabled={googleLoading} onClick={handleGoogle}>
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </Button>

            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
            <div className="relative">
              <Input
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Password"
                type={showPass ? "text" : "password"}
              />
              <button
                onClick={() => setShowPass((prev) => !prev)}
                className="absolute right-3 top-3 text-slate-500"
                type="button"
              >
                {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <button onClick={() => setForgetOpen(true)} type="button" className="text-left text-sm text-sky-700">
              Forgot password?
            </button>

            <Button className="w-full" size="lg" disabled={loading} onClick={handleLogin}>
              {loading ? "Logging in..." : "Log in"}
            </Button>

            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account? <Link className="font-semibold text-sky-600" href="/">Create one</Link>
            </p>
          </CardContent>
        </Card>
      </MotionSection>

      <Dialog open={forgetOpen} onOpenChange={setForgetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>Enter your account email to receive a reset link.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={forgetEmail} onChange={(e) => setForgetEmail(e.target.value)} placeholder="Email" type="email" />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleForgot}>Send reset email</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setForgetOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
