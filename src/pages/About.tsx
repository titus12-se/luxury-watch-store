import { motion } from 'framer-motion';
import { Shield, Award, Globe, Users } from 'lucide-react';
import SectionTitle from '@/components/SectionTitle';

export default function About() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <div className="relative h-[400px] overflow-hidden mb-16">
        <div className="absolute inset-0 bg-navy/60 z-10" />
        <img
          src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1600"
          alt="About Aura & Anchor"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center">
            <span className="text-gold text-xs uppercase tracking-[0.3em] mb-3 block">Our Story</span>
            <h1 className="font-serif text-4xl md:text-5xl text-white">Aura & Anchor Collections</h1>
          </div>
        </div>
      </div>

      <div className="section-padding max-w-4xl mx-auto">
        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <SectionTitle title="Crafted for the Discerning" subtitle="Our Heritage" />
          <p className="text-navy/70 leading-relaxed text-lg">
            Founded in 2020, Aura & Anchor Collections was born from a passion for horological excellence and a vision 
            to bring the world&apos;s finest timepieces to East Africa. What began as a curated selection for local collectors 
            has grown into the region&apos;s premier destination for luxury watches.
          </p>
          <p className="text-navy/70 leading-relaxed mt-4">
            We believe that a watch is more than an instrument of time — it is a statement of character, a companion 
            through life&apos;s defining moments, and a legacy to be passed down through generations. Every piece in our 
            collection is hand-selected for its craftsmanship, heritage, and enduring value.
          </p>
        </motion.div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {[
            { icon: Shield, title: 'Authenticity', desc: 'Every watch comes with a certificate of authenticity and manufacturer warranty.' },
            { icon: Award, title: 'Quality', desc: 'We source only from authorized distributors and renowned watchmakers.' },
            { icon: Globe, title: 'Reach', desc: 'Serving collectors across Uganda, Kenya, Tanzania, Rwanda, and beyond.' },
            { icon: Users, title: 'Service', desc: 'Personalized support from our team of horological enthusiasts.' },
          ].map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 bg-white border border-gray-100"
            >
              <value.icon className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3 className="font-serif text-lg text-navy mb-2">{value.title}</h3>
              <p className="text-sm text-gray-500">{value.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-navy p-8 text-white"
          >
            <span className="text-gold text-xs uppercase tracking-[0.3em] mb-3 block">Mission</span>
            <h3 className="font-serif text-2xl mb-4">To Make Luxury Accessible</h3>
            <p className="text-white/70 leading-relaxed">
              We are committed to bringing authentic luxury timepieces to East Africa with transparency, integrity, 
              and exceptional service. Our mission is to cultivate a community of watch enthusiasts who appreciate 
              the art of fine watchmaking.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 border border-gray-100"
          >
            <span className="text-gold text-xs uppercase tracking-[0.3em] mb-3 block">Vision</span>
            <h3 className="font-serif text-2xl text-navy mb-4">The Region&apos;s Finest Curator</h3>
            <p className="text-navy/70 leading-relaxed">
              To become East Africa&apos;s most trusted name in luxury watches — recognized for our curation, expertise, 
              and commitment to authenticity. We envision a future where every collector in the region has access 
              to the world&apos;s most prestigious timepieces.
            </p>
          </motion.div>
        </div>

        {/* Authenticity Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gold/5 border border-gold/20 p-8 text-center"
        >
          <Shield className="w-12 h-12 text-gold mx-auto mb-4" />
          <h3 className="font-serif text-2xl text-navy mb-3">Our Authenticity Guarantee</h3>
          <p className="text-navy/70 max-w-2xl mx-auto leading-relaxed">
            Every watch sold by Aura & Anchor Collections is guaranteed 100% authentic. We source directly from 
            authorized distributors and manufacturers. Each timepiece comes with original documentation, warranty 
            cards, and serial numbers that can be verified with the manufacturer. Your trust is our most valuable asset.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
