import { motion } from 'framer-motion';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

export default function SectionTitle({ title, subtitle, centered = true, light = false }: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${centered ? 'text-center' : ''}`}
    >
      {subtitle && (
        <span className={`text-xs uppercase tracking-[0.3em] mb-3 block ${light ? 'text-gold' : 'text-gold'}`}>
          {subtitle}
        </span>
      )}
      <h2 className={`font-serif text-3xl lg:text-4xl ${light ? 'text-white' : 'text-navy'}`}>
        {title}
      </h2>
      <div className={`h-[1px] w-16 bg-gold mt-4 ${centered ? 'mx-auto' : ''}`} />
    </motion.div>
  );
}
