"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { auth, db, googleProvider } from "@/lib/firebase";
import { setActiveUser } from "@/store/slices/userSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

async function persistGoogleUser(user, dispatch) {
  dispatch(setActiveUser(user));
  await set(ref(db, `users/${user.uid}`), {
    username: user.displayName,
    email: user.email,
    photo: user.photoURL,
  });
}

export default function RegistrationPage() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

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
          toast.error(error.code || "Google sign-up failed");
        }
      })
      .finally(() => setGoogleLoading(false));
  }, [dispatch, router]);

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

      toast.error(error.code || "Google sign-up failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const fadeUp = {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.56, ease: [0.22, 1, 0.36, 1] },
  };
  const MotionSection = motion.section;

  const validate = () => {
    if (!email || !name || !pass || !confirmPass) {
      toast.error("All fields are required");
      return false;
    }
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      toast.error("Enter a valid email");
      return false;
    }
    if (name.length < 2 || name.length > 20) {
      toast.error("Display name must be 2-20 characters");
      return false;
    }
    if (pass.length < 8 || !/[A-Z]/.test(pass) || !/[a-z]/.test(pass) || !/\d/.test(pass)) {
      toast.error("Password needs 8+ chars, upper, lower, and number");
      return false;
    }
    if (pass !== confirmPass) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);

      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: "https://i.ibb.co/GQ4sL6n/default-avatar.png",
      });

      await sendEmailVerification(auth.currentUser);

      await set(ref(db, `users/${userCredential.user.uid}`), {
        username: name,
        email: userCredential.user.email,
        photo: "https://i.ibb.co/GQ4sL6n/default-avatar.png",
      });

      toast.success("Account created. Verify your email to login.");
      setTimeout(() => router.push("/login"), 800);
    } catch (error) {
      toast.error(error.code || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-grid grid md:grid-cols-2 relative min-h-screen overflow-hidden bg-slate-50/50">
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.7, 0.5],
          x: [0, 40, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[-50px] top-[10%] h-96 w-96 rounded-full bg-cyan-300/40 blur-[80px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.8, 0.4],
          y: [0, -60, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-100px] right-[-50px] h-[30rem] w-[30rem] rounded-full bg-purple-300/40 blur-[80px] pointer-events-none" 
      />

      <MotionSection className="flex items-center justify-center px-6 py-10" {...fadeUp}>
        <Card className="glass-panel lift-card w-full max-w-xl rounded-3xl z-10">
          <CardHeader>
            <CardTitle className="text-3xl">Create your BartaBox account</CardTitle>
            <CardDescription>Modern chat starts with one secure sign-up.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="secondary" size="lg" disabled={googleLoading} onClick={handleGoogle}>
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </Button>

            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" type="text" />

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

            <div className="relative">
              <Input
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Confirm password"
                type={showConfirmPass ? "text" : "password"}
              />
              <button
                onClick={() => setShowConfirmPass((prev) => !prev)}
                className="absolute right-3 top-3 text-slate-500"
                type="button"
              >
                {showConfirmPass ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <Button className="w-full" size="lg" onClick={handleRegister} disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-slate-500">
              Already have an account? <Link className="font-semibold text-sky-600" href="/login">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </MotionSection>

      <MotionSection
        className="hidden md:flex flex-col items-center justify-center p-10 relative"
        initial={{ opacity: 0, x: 34 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
      >
        <div className="w-full max-w-lg rounded-[2rem] p-10 bg-white/40 backdrop-blur-xl border border-white/40 shadow-2xl relative z-10 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-64 h-64 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-20 blur-3xl mix-blend-multiply"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 rounded-full bg-gradient-to-tr from-sky-400 to-cyan-300 opacity-20 blur-3xl mix-blend-multiply"></div>
          
          <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Chat. Connect. Belong.</h2>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            BartaBox keeps your social and messaging flow in one realtime space with cleaner focus and speed.
          </p>
          
          <div className="mt-10 grid grid-cols-2 gap-4 relative">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm rounded-2xl p-5 flex flex-col items-center justify-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                <div className="w-4 h-4 bg-sky-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-sm font-semibold text-slate-700 text-center">Realtime Sync</span>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm rounded-2xl p-5 flex flex-col items-center justify-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.757,3.951-5.445,3.951c-3.131,0-5.66-2.529-5.66-5.66s2.529-5.66,5.66-5.66c1.473,0,2.813,0.564,3.83,1.493l2.846-2.846C17.514,3.614,15.15,2.5,12.545,2.5c-5.463,0-9.897,4.433-9.897,9.896s4.433,9.896,9.897,9.896c5.78,0,9.626-4.064,9.626-9.803C22.171,11.53,22.062,10.875,21.854,10.239H12.545z" /></svg>
              </div>
              <span className="text-sm font-semibold text-slate-700 text-center">Google Auth</span>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm rounded-2xl p-5 flex flex-col items-center justify-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <div className="flex -space-x-2">
                  <div className="w-4 h-4 rounded-full bg-purple-400 border border-white"></div>
                  <div className="w-4 h-4 rounded-full bg-purple-500 border border-white"></div>
                  <div className="w-4 h-4 rounded-full bg-purple-600 border border-white"></div>
                </div>
              </div>
              <span className="text-sm font-semibold text-slate-700 text-center">Groups</span>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm rounded-2xl p-5 flex flex-col items-center justify-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center relative">
                <div className="w-5 h-4 bg-rose-500 rounded flex items-center justify-center m-1 relative">
                   <div className="absolute -right-1 -top-1 w-2 h-2 bg-red-600 rounded-full"></div>
                </div>
              </div>
              <span className="text-sm font-semibold text-slate-700 text-center">Live Messages</span>
            </motion.div>
          </div>
        </div>
      </MotionSection>
    </main>
  );
}
