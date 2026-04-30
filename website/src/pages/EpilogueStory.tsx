import React, { useRef } from 'react';
import NavigationBar from '../components/NavigationBar';
import { motion, useScroll } from 'motion/react';

const startAnimationImage = (imageNumber: number) =>
  new URL(`../../../Graph/Start_animation_image/Start_animation_${imageNumber}.png`, import.meta.url).href;

const epiloguePageImage = (pageNumber: number) =>
  new URL(`../../../Graph/Epilogue_image/Page ${pageNumber}.png`, import.meta.url).href;

const STORY_DATA = [
  {
    id: 1,
    title: "Welcome To The Data Story of MoMA",
    subtitle: "Uncovering the most important trends, context, and limitations",
    type: "intro",
    images: [
      startAnimationImage(3),
      startAnimationImage(4),
      startAnimationImage(16)
    ]
  },
  {
    id: 2,
    title: "Let’s Begin……",
    text: "The dataset reveals a compelling narrative about the evolution of the art world over time, reflecting broader social, cultural, and historical transformations. By examining patterns in artist demographics, artistic mediums, and geographic representation, we can better understand how art both shapes and is shaped by the world around it.",
    type: "text-only"
  },
  {
    id: 3,
    title: "Collection Growth and Evolution Across Time",
    text: <>The <strong>chronological distribution</strong> of the MoMA collection <strong>rose</strong> with the rise of modern art in the <strong>late 19th century</strong>, reaching a <strong>historical peak</strong> of <strong>about 1,500 pieces</strong> in the <strong>1970s</strong>, and then <strong>declined sharply</strong>, reflecting that artworks usually have a long time lag in entering the collection.</>,
    type: "text-image",
    image: epiloguePageImage(3)
  },
  {
    id: 4,
    title: "Most Prolific MoMA Artists",
    text: <>The top 5 Most Prolific MoMA Artists are: <strong>Eugène Atget (2725)</strong>, <strong>Pablo Picasso (1132)</strong>, <strong>Jean Dubuffet (987)</strong>, <strong>Henri Matisse (979)</strong> and <strong>Marc Chagall (972)</strong>. The image shows their creative journey through various types of works throughout their lives. Are any of your favorite artists among them?</>,
    type: "text-image",
    image: epiloguePageImage(4)
  },
  {
    id: 5,
    title: "Peak and Volatile Decay of Creative Output",
    text: <>At what age are artists most active? For artists whose works are included in MoMA, the period <strong>between 30 and 40 years old</strong> is the <strong>peak</strong> of their output. As they get older, their creative activity <strong>fluctuates and declines</strong>.</>,
    type: "text-image",
    image: epiloguePageImage(5)
  },
  {
    id: 6,
    title: "Geographic Concentration and Expansion",
    text: <>Artworks are heavily concentrated in the <strong>USA</strong> and <strong>Western Europe</strong>, reflecting historical dominance in the art world. But over time, there are signs of <strong>broader geographic representation</strong>, likely influenced by <strong>globalization</strong> and <strong>increased cultural exchange</strong>.</>,
    type: "text-image",
    image: epiloguePageImage(6)
  },
  {
    id: 7,
    title: "Diversification of Artistic Mediums",
    text: <>Over the past two centuries, artistic media have evolved alongside technology: <strong>illustrated books</strong> dominated the <strong>early 19th century</strong>, <strong>photography</strong> rose in the <strong>mid-19th century</strong>, and digital advances in the <strong>late 20th century</strong> led to video art and <strong>greater diversification</strong>.</>,
    type: "text-image",
    image: epiloguePageImage(7)
  },
  {
    id: 8,
    title: "Rising Representation of Female Artists",
    text: <>The dataset shows a <strong>steady rise in the proportion of female artists</strong> over time. Early records reveal <strong>strong gender imbalance</strong>, but this <strong>improves significantly from the mid-20th century</strong>, in line with women’s rights movements and increased institutional support.</>,
    type: "text-image",
    image: epiloguePageImage(8)
  },
  {
    id: 9,
    title: "Institutional Bias and Data Limitation",
    text: <>The dataset may reflect <strong>biases from major institutions</strong>, which tend to favor certain regions, artists or styles. As a result, some groups and forms of art may be underrepresented, limiting the dataset’s inclusiveness. Besides, <strong>missing or incomplete metadata</strong> can affect the accuracy of observed trends. Therefore, conclusions drawn from this data must be interpreted with caution, acknowledging that they reflect a <strong>specific institutional perspective</strong> rather than a universal history of art.</>,
    type: "text-only"
  },
  {
    id: 10,
    title: "Congratulations on completing your journey!",
    text: "Thank you for visiting our website and exploring modern art. We hope this has given you some new insights into art data visualization and will give you different expectations the next time you visit a museum.\n\nBye-bye!",
    type: "outro"
  }
];

export default function EpilogueStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  return (
    <div className="h-screen w-full bg-[#EAE5D9] text-[#3A352D] font-sans overflow-hidden flex flex-col">
      <NavigationBar />
      
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-[#D95C3A] z-[60] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory custom-scrollbar relative pt-20"
      >
        {STORY_DATA.map((slide, index) => (
          <section 
            key={slide.id} 
            className="min-h-[calc(100vh-80px)] w-full snap-center flex items-center justify-center p-8 md:p-16 relative"
          >
             <SlideContent slide={slide} index={index} />
             
             {/* Page Indicator */}
             <div className="absolute bottom-8 right-8 text-sm font-mono text-[#8C857B]">
               {index + 1} / {STORY_DATA.length}
             </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function SlideContent({ slide, index }: { slide: any, index: number }) {
  if (slide.type === 'intro') {
    return (
      <div className="max-w-6xl w-full flex flex-col items-center text-center gap-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.5 }}
        >
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#3A352D] mb-4">{slide.title}</h1>
          <p className="text-xl text-[#8C857B] uppercase tracking-widest">{slide.subtitle}</p>
        </motion.div>
        
        <div className="flex gap-6 w-full justify-center">
          {slide.images.map((img: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              viewport={{ once: false, amount: 0.5 }}
              className="w-1/3 max-w-72 aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-white"
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === 'text-only') {
    return (
      <div className="max-w-4xl w-full flex flex-col items-center text-center gap-8">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.5 }}
          className="font-serif text-4xl md:text-6xl font-bold text-[#D95C3A]"
        >
          {slide.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false, amount: 0.5 }}
          className="text-xl md:text-2xl text-[#5C554A] leading-relaxed"
        >
          {slide.text}
        </motion.p>
      </div>
    );
  }

  if (slide.type === 'text-image') {
    const isEven = index % 2 === 0;
    return (
      <div className={`max-w-7xl w-full flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
        <motion.div
          initial={{ opacity: 0, x: isEven ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.5 }}
          className="flex-1 flex flex-col gap-6"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#D95C3A]">{slide.title}</h2>
          <p className="text-lg md:text-xl text-[#5C554A] leading-relaxed">{slide.text}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: isEven ? 50 : -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false, amount: 0.5 }}
          className="flex-[1.5] w-full rounded-xl overflow-hidden shadow-xl border border-[#D3CDBF]/50 bg-white p-3"
        >
          <img src={slide.image} alt={slide.title} className="w-full max-h-[58vh] object-contain rounded-lg" />
        </motion.div>
      </div>
    );
  }

  if (slide.type === 'outro') {
    return (
      <div className="max-w-6xl w-full flex flex-col items-center text-center gap-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.5 }}
          className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-[#D95C3A]"
        >
          {slide.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false, amount: 0.5 }}
          className="max-w-4xl text-xl md:text-2xl text-[#5C554A] leading-relaxed whitespace-pre-line"
        >
          {slide.text}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: false, amount: 0.5 }}
          className="flex flex-wrap justify-center items-center gap-8 mt-8 text-2xl md:text-4xl font-serif font-bold"
        >
          <span className="text-red-500">Thank you</span>
          <span className="text-pink-500">Merci</span>
          <span className="text-blue-600">Gracias</span>
          <span className="text-green-600">Danke</span>
          <span className="text-amber-700">Grazie</span>
          <span className="text-orange-400">谢谢</span>
          <span className="text-teal-600">ありがとう</span>
          <span className="text-purple-500">감사합니다</span>
          <span className="text-rose-400">شكرا</span>
        </motion.div>
      </div>
    );
  }

  return null;
}
