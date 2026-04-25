import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const images = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const width = 200 + Math.floor(Math.random() * 200);
      return `https://picsum.photos/seed/intro-${i}/${width}/200`;
    });
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-[#EAE5D9] text-[#3A352D] flex flex-col items-center justify-center cursor-pointer overflow-hidden"
      onClick={onComplete}
    >
      <div className="relative flex flex-col items-center justify-center z-10 -mt-32">
        {/* Split Text */}
        <div className="font-serif font-bold tracking-widest text-6xl md:text-8xl lg:text-9xl flex flex-col items-center justify-center">
          {/* Top Half */}
          <div className="overflow-hidden" style={{ height: '0.6em' }}>
            <div style={{ lineHeight: '1.2em' }}>DIGITAL MoMA</div>
          </div>
          {/* Bottom Half */}
          <div className="overflow-hidden" style={{ height: '0.6em' }}>
            <motion.div 
              initial={{ y: '-1.2em' }} 
              animate={{ y: '-0.6em' }} 
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ lineHeight: '1.2em' }}
            >
              DIGITAL MoMA
            </motion.div>
          </div>
        </div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-6 text-center max-w-5xl text-[#5C554A] text-xs md:text-sm leading-relaxed px-6 tracking-widest"
        >
          Every artwork is a whisper of history; every interaction, a dialogue across time with artistic pioneers. Step into this sanctuary woven from data and color, and join us on an extraordinary journey into modern art.
        </motion.div>
      </div>

      {/* Marquee Images */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-0 left-0 w-full overflow-hidden flex items-end pb-8"
      >
        <div className="flex animate-marquee w-max">
          {[...images, ...images].map((img, i) => (
            <div key={i} className="h-20 md:h-32 w-auto shrink-0 mx-2 shadow-md bg-[#D3CDBF]/30">
              <img src={img} alt="" className="h-full w-auto object-cover" referrerPolicy="no-referrer" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Click anywhere hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1, delay: 3 }}
        className="absolute top-8 right-8 text-xs tracking-widest uppercase text-[#8C857B]"
      >
        Click anywhere to enter
      </motion.div>
    </div>
  );
}
