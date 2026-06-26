import { Shield, Wrench, AlertTriangle, Clock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Warranty() {
  return (
    <div className="pt-24 pb-20">
      <div className="section-padding">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl text-navy mb-4">Warranty Information</h1>
            <p className="text-gray-500">Every timepiece is backed by comprehensive protection.</p>
          </motion.div>

          <div className="bg-gold/10 p-8 border border-gold/20 mb-12 text-center">
            <Shield className="w-12 h-12 text-gold mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-navy mb-2">2-Year Manufacturer Warranty</h2>
            <p className="text-gray-600">
              Every watch purchased from Aura & Anchor Collections comes with a minimum 2-year international manufacturer warranty covering defects in materials and workmanship.
            </p>
          </div>

          <div className="space-y-8">
            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">What Is Covered</h2>
              <ul className="space-y-3">
                {[
                  'Manufacturing defects in materials and workmanship',
                  'Movement malfunction under normal use conditions',
                  'Crown, pushers, and crown functions',
                  'Crystal defects (scratches are not covered)',
                  'Case and bracelet defects (excluding normal wear and tear)',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-gray-600">{text}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" /> What Is Not Covered
              </h2>
              <ul className="space-y-3">
                {[
                  'Normal wear and tear, scratches, or cosmetic damage',
                  'Damage caused by improper use, accidents, or abuse',
                  'Water damage from exceeding the stated resistance depth',
                  'Damage from unauthorized repairs or modifications',
                  'Battery replacement (for quartz watches after 3 years)',
                  'Strap, bracelet, or buckle wear and tear',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-gray-600">{text}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4 flex items-center gap-3">
                <Wrench className="w-5 h-5 text-gold" /> Servicing & Repairs
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                We have partnerships with certified watchmakers across East Africa to provide professional servicing, battery replacement, and strap changes. All warranty repairs are performed at no cost to you.
              </p>
              <p className="text-gray-500 leading-relaxed">
                For out-of-warranty repairs, we provide a detailed quote before any work begins. Our partners use only genuine parts and maintain the highest standards of craftsmanship.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-gold" /> How to Make a Warranty Claim
              </h2>
              <ol className="space-y-4">
                {[
                  'Contact us at auraanchorcollections@gmail.com or WhatsApp +256 708 018549 with your order number and a description of the issue.',
                  'Our team will assess your claim and provide instructions for returning the watch.',
                  'We will arrange shipping to our authorized service center at no cost to you.',
                  'Your watch will be inspected, repaired, and returned within 14-21 business days.',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-gold text-navy rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-gray-600">{text}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
