"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Sparkles,
  Package,
  Brain,
  Heart,
  BarChart3,
  Users,
  RefreshCw,
  ArrowRight,
  Star,
  Play,
  CheckCircle2,
} from "lucide-react";

// Animated blob background component
function FloatingBlob({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-40 ${className}`}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -40, 20, 0],
        scale: [1, 1.1, 0.95, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

// Demo screen component for the interactive preview
function DemoScreen({ step }: { step: number }) {
  const screens = [
    // Onboarding screen
    <div key="onboarding" className="p-4 h-full flex flex-col">
      <div className="text-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-honey-300 to-terracotta-400 mx-auto mb-3 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-display text-lg font-semibold text-navy-800">Welcome!</h3>
        <p className="text-xs text-navy-500">Let&apos;s set up learning</p>
      </div>
      <div className="space-y-3 flex-1">
        <div className="bg-white rounded-xl p-3 border border-cream-200">
          <p className="text-xs text-navy-500 mb-1">Child&apos;s name</p>
          <p className="text-sm font-medium text-navy-800">Emma</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-cream-200">
          <p className="text-xs text-navy-500 mb-1">Age</p>
          <p className="text-sm font-medium text-navy-800">2 years, 4 months</p>
        </div>
      </div>
      <div className="bg-terracotta-500 text-white text-center py-2.5 rounded-xl text-sm font-medium">
        Continue
      </div>
    </div>,
    // Toys screen
    <div key="toys" className="p-4 h-full flex flex-col">
      <h3 className="font-display text-lg font-semibold text-navy-800 mb-1">Your Toys</h3>
      <p className="text-xs text-navy-500 mb-3">We&apos;ll use what you have</p>
      <div className="space-y-2 flex-1 overflow-hidden">
        {[
          { emoji: "🧱", name: "Building Blocks" },
          { emoji: "🎨", name: "Crayons & Paper" },
          { emoji: "📚", name: "Picture Books" },
          { emoji: "🧩", name: "Shape Puzzles" },
        ].map((toy, i) => (
          <motion.div
            key={toy.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-2.5 border border-cream-200 flex items-center gap-2"
          >
            <span className="text-lg">{toy.emoji}</span>
            <span className="text-sm text-navy-700">{toy.name}</span>
          </motion.div>
        ))}
      </div>
      <div className="bg-terracotta-500 text-white text-center py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />
        Create Curriculum
      </div>
    </div>,
    // Activity screen
    <div key="activity" className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-navy-500">Activity 1 of 4</span>
        <span className="text-xs text-navy-500">15 min</span>
      </div>
      <div className="h-1 bg-cream-200 rounded-full mb-4">
        <div className="h-full w-1/4 bg-terracotta-500 rounded-full" />
      </div>
      <h3 className="font-display text-base font-semibold text-navy-800 mb-2">
        Color Sorting Adventure
      </h3>
      <div className="flex gap-1.5 mb-3">
        <span className="px-2 py-0.5 bg-terracotta-100 text-terracotta-700 rounded-full text-[10px]">
          Cognitive
        </span>
        <span className="px-2 py-0.5 bg-sage-100 text-sage-700 rounded-full text-[10px]">
          Fine Motor
        </span>
      </div>
      <div className="bg-cream-100 rounded-xl p-3 mb-3 flex-1">
        <p className="text-xs text-navy-600 mb-2 font-medium">Materials:</p>
        <ul className="text-xs text-navy-500 space-y-1">
          <li className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-terracotta-400" />
            Building Blocks
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-terracotta-400" />
            3 small bowls
          </li>
        </ul>
      </div>
      <div className="bg-terracotta-500 text-white text-center py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
        <CheckCircle2 className="w-4 h-4" />
        Complete Activity
      </div>
    </div>,
    // Feedback screen
    <div key="feedback" className="p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center">
          <Heart className="w-5 h-5 text-sage-600" />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold text-navy-800">How did it go?</h3>
          <p className="text-xs text-navy-500">Color Sorting</p>
        </div>
      </div>
      <p className="text-xs text-navy-600 mb-2">How engaged was Emma?</p>
      <div className="flex gap-1 mb-4">
        {["😴", "😐", "🙂", "😊", "🤩"].map((emoji, i) => (
          <div
            key={emoji}
            className={`flex-1 p-2 rounded-lg text-center text-lg ${
              i === 4 ? "bg-terracotta-100 border-2 border-terracotta-400" : "bg-cream-100"
            }`}
          >
            {emoji}
          </div>
        ))}
      </div>
      <p className="text-xs text-navy-600 mb-2">Did they complete it?</p>
      <div className="grid grid-cols-2 gap-2 mb-4 flex-1">
        {["Tried but didn't finish", "Completed", "Exceeded!"].map((label, i) => (
          <div
            key={label}
            className={`p-2 rounded-lg text-[10px] text-center ${
              i === 2 ? "bg-sage-100 border-2 border-sage-400 col-span-2" : "bg-cream-100"
            }`}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="bg-sage-600 text-white text-center py-2.5 rounded-xl text-sm font-medium">
        Next Activity →
      </div>
    </div>,
  ];

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {screens[step]}
    </motion.div>
  );
}

// Section wrapper with scroll animations
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// Feature card component
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: "terracotta" | "sage" | "honey" | "navy";
  delay: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const colorClasses = {
    terracotta: "bg-terracotta-100 text-terracotta-600",
    sage: "bg-sage-100 text-sage-600",
    honey: "bg-honey-100 text-honey-600",
    navy: "bg-navy-100 text-navy-600",
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-3xl p-6 shadow-sm border border-cream-200 hover:shadow-lg transition-shadow"
    >
      <div className={`w-12 h-12 rounded-2xl ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-display text-lg font-semibold text-navy-800 mb-2">{title}</h3>
      <p className="text-navy-500 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

// Step component for How It Works
function StepCard({
  number,
  title,
  description,
  icon: Icon,
  delay,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
  delay: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay }}
      className="relative text-center"
    >
      <div className="relative inline-block mb-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center mx-auto border-4 border-white shadow-lg">
          <Icon className="w-8 h-8 text-terracotta-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-terracotta-500 text-white flex items-center justify-center font-display font-bold text-sm shadow-md">
          {number}
        </div>
      </div>
      <h3 className="font-display text-xl font-semibold text-navy-800 mb-2">{title}</h3>
      <p className="text-navy-500 text-sm leading-relaxed max-w-xs mx-auto">{description}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  const [demoStep, setDemoStep] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  // Auto-cycle through demo screens
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-cream-100 overflow-x-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background blobs */}
        <FloatingBlob className="w-[600px] h-[600px] bg-terracotta-200 -top-40 -left-40" delay={0} />
        <FloatingBlob className="w-[500px] h-[500px] bg-sage-200 top-1/3 -right-32" delay={5} />
        <FloatingBlob className="w-[400px] h-[400px] bg-honey-200 -bottom-20 left-1/4" delay={10} />

        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="relative z-10 px-6 py-20">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Copy */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm text-terracotta-600 font-medium mb-6 shadow-sm border border-cream-200">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered Learning
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-navy-800 mb-6 leading-[1.1]"
              >
                Learning through
                <span className="block text-terracotta-500">play, every day</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg md:text-xl text-navy-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0"
              >
                Personalized activities created daily using{" "}
                <span className="text-terracotta-600 font-semibold">your own toys</span>.
                AI that adapts to how your child learns best.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-terracotta-500/25 hover:shadow-xl hover:shadow-terracotta-500/30 hover:-translate-y-0.5"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/app" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-cream-50 text-navy-700 px-8 py-4 rounded-2xl font-semibold text-lg transition-all border border-cream-300 hover:border-cream-400">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="mt-6 text-sm text-navy-400"
              >
                Perfect for parents, nannies, and grandparents
              </motion.p>
            </div>

            {/* Right side - Demo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative"
            >
              {/* Decorative elements */}
              <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-honey-300/50 blur-2xl" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-sage-300/50 blur-2xl" />

              {/* Phone frame */}
              <div className="relative mx-auto w-[280px] md:w-[320px]">
                <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-900 rounded-[3rem] shadow-2xl" />
                <div className="relative bg-cream-100 rounded-[2.5rem] m-2 overflow-hidden h-[560px] md:h-[640px]">
                  {/* Status bar */}
                  <div className="h-12 bg-cream-50 flex items-center justify-center">
                    <div className="w-20 h-5 bg-navy-800 rounded-full" />
                  </div>
                  {/* Screen content */}
                  <div className="h-[calc(100%-48px)]">
                    <DemoScreen step={demoStep} />
                  </div>
                </div>

                {/* Demo step indicators */}
                <div className="flex justify-center gap-2 mt-6">
                  {[0, 1, 2, 3].map((i) => (
                    <button
                      key={i}
                      onClick={() => setDemoStep(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        demoStep === i ? "bg-terracotta-500 w-6" : "bg-cream-300 hover:bg-cream-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-navy-300 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-navy-400"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <AnimatedSection className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 bg-sage-100 text-sage-700 rounded-full text-sm font-medium mb-4"
            >
              Simple as 1-2-3
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl font-semibold text-navy-800"
            >
              How It Works
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-cream-200 via-terracotta-200 to-cream-200" />

            <StepCard
              number={1}
              title="Add Your Toys"
              description="Tell us what toys and materials you have at home. No special purchases needed."
              icon={Package}
              delay={0}
            />
            <StepCard
              number={2}
              title="Get Daily Activities"
              description="AI creates personalized, age-appropriate activities using only what you have."
              icon={Brain}
              delay={0.2}
            />
            <StepCard
              number={3}
              title="Track & Improve"
              description="Quick feedback helps the AI learn what works best for your child."
              icon={BarChart3}
              delay={0.4}
            />
          </div>
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection className="py-24 px-6 relative">
        <FloatingBlob className="w-[400px] h-[400px] bg-sage-200/50 top-0 right-0" delay={3} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 bg-honey-100 text-honey-700 rounded-full text-sm font-medium mb-4"
            >
              Everything You Need
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl font-semibold text-navy-800 mb-4"
            >
              Designed for Real Families
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-navy-500 text-lg max-w-2xl mx-auto"
            >
              No complicated prep. No special training. Just meaningful learning moments with your little one.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Brain}
              title="AI-Powered Activities"
              description="Smart curriculum that understands child development and creates engaging, educational activities."
              color="terracotta"
              delay={0}
            />
            <FeatureCard
              icon={Package}
              title="Uses Your Own Toys"
              description="No need to buy anything new. Activities are designed around what you already have at home."
              color="sage"
              delay={0.1}
            />
            <FeatureCard
              icon={RefreshCw}
              title="Adapts to Feedback"
              description="The more you use it, the smarter it gets. Activities evolve based on what your child enjoys."
              color="honey"
              delay={0.2}
            />
            <FeatureCard
              icon={Star}
              title="Age-Appropriate"
              description="Activities perfectly matched to your child's developmental stage, from babies to preschoolers."
              color="navy"
              delay={0.3}
            />
            <FeatureCard
              icon={BarChart3}
              title="Track Development"
              description="See which skills your child is building: motor, language, cognitive, social-emotional, and more."
              color="terracotta"
              delay={0.4}
            />
            <FeatureCard
              icon={Users}
              title="Simple for Caregivers"
              description="Clear instructions anyone can follow. Perfect for nannies, grandparents, or busy parents."
              color="sage"
              delay={0.5}
            />
          </div>
        </div>
      </AnimatedSection>

      {/* Testimonial Section */}
      <AnimatedSection className="py-24 px-6 bg-gradient-to-br from-terracotta-500 to-terracotta-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-60 h-60 border-4 border-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-20 h-20 border-4 border-white rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 text-honey-300 fill-honey-300" />
              ))}
            </div>
            <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl text-white font-medium leading-relaxed mb-8">
              &ldquo;Our nanny loves it. Every morning there&apos;s a new set of activities ready,
              and she doesn&apos;t have to plan anything. My daughter is learning so much!&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-display text-xl">
                JM
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Jessica M.</p>
                <p className="text-terracotta-200 text-sm">Mother of Emma, 2 years old</p>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Final CTA Section */}
      <AnimatedSection className="py-32 px-6 relative overflow-hidden">
        <FloatingBlob className="w-[500px] h-[500px] bg-honey-200/50 -bottom-40 -left-40" delay={0} />
        <FloatingBlob className="w-[400px] h-[400px] bg-terracotta-200/50 -top-20 -right-20" delay={7} />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-honey-300 to-terracotta-400 mx-auto mb-8 flex items-center justify-center shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-navy-800 mb-6">
              Start your child&apos;s
              <span className="block text-terracotta-500">learning journey</span>
            </h2>
            <p className="text-lg text-navy-600 mb-10 max-w-xl mx-auto">
              Join families who are making the most of playtime. Set up takes just 2 minutes.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white px-10 py-5 rounded-2xl font-semibold text-xl transition-all shadow-lg shadow-terracotta-500/25 hover:shadow-xl hover:shadow-terracotta-500/30 hover:-translate-y-1"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="w-6 h-6" />
            </Link>
            <p className="mt-6 text-sm text-navy-400">
              No credit card required. Works on any device.
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="py-12 px-6 bg-navy-800 text-navy-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-400 to-terracotta-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl text-white">HomeschoolGPT</span>
          </div>
          <p className="text-sm text-navy-400">
            Made with love for little learners everywhere
          </p>
        </div>
      </footer>
    </div>
  );
}
