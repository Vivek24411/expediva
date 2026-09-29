import { motion } from 'framer-motion';
import { Seo } from '@/components/layout/Seo';

export default function Merch() {
  return (
    <>
      <Seo title="Expediva Merch" noIndex />

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-pitch px-6 pb-10 pt-[100px] text-white">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center blur-[2px] brightness-50"
          style={{ backgroundImage: "url('/cover-bg.png')" }}
        />
        <div className="absolute inset-0 bg-black/50" />

        <section className="relative z-10 mx-auto w-full max-w-5xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 font-serif text-4xl uppercase tracking-widest md:text-6xl"
          >
            Expediva Merch
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-3xl border border-white/20 bg-black/40 p-5 shadow-2xl backdrop-blur-md md:p-8"
          >
            <img
              src="/merch.png"
              alt="Expediva merchandise"
              className="mx-auto max-h-[65vh] w-full rounded-2xl object-contain"
            />
          </motion.div>
        </section>
      </main>
    </>
  );
}