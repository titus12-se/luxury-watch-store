import { RefreshCw, Clock, Check, Package, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Returns() {
  return (
    <div className="pt-24 pb-20">
      <div className="section-padding">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl text-navy mb-4">Returns & Exchanges</h1>
            <p className="text-gray-500">We want you to love your timepiece. If you don't, we make returns easy.</p>
          </motion.div>

          <div className="bg-gold/10 p-6 border border-gold/20 mb-12 text-center">
            <h2 className="font-serif text-xl text-navy mb-2">30-Day Satisfaction Guarantee</h2>
            <p className="text-gray-600">
              Not completely satisfied with your purchase? Return it within 30 days for a full refund or exchange.
            </p>
          </div>

          <div className="space-y-8">
            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-6">Return Conditions</h2>
              <ul className="space-y-4">
                {[
                  { icon: Check, text: 'The watch must be in its original, unworn condition with no scratches or signs of wear.' },
                  { icon: Check, text: 'All original packaging, certificates, and accessories must be included.' },
                  { icon: Check, text: 'The return must be initiated within 30 days of the delivery date.' },
                  { icon: Check, text: 'Personalized or engraved watches are not eligible for return unless defective.' },
                  { icon: Check, text: 'Watches that have been resized or altered are not eligible for return.' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-gray-600">{item.text}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-6 flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-gold" /> How to Return
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { step: '1', title: 'Contact Us', desc: 'Email us at auraanchorcollections@gmail.com or WhatsApp +256 708 018549 with your order number and reason for return.' },
                  { step: '2', title: 'Ship the Item', desc: 'We will send you a return shipping label. Pack the watch securely in its original packaging and drop it off at any of our partner locations.' },
                  { step: '3', title: 'Receive Refund', desc: 'Once we receive and inspect the item, your refund will be processed within 5-7 business days to your original payment method.' },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="w-10 h-10 bg-gold text-navy rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                      {item.step}
                    </div>
                    <h3 className="font-medium text-navy mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4 flex items-center gap-3">
                <X className="w-5 h-5 text-gold" /> Items Not Eligible for Return
              </h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Watches that show signs of wear, scratches, or damage</li>
                <li>• Watches missing original packaging, certificates, or accessories</li>
                <li>• Personalized or engraved watches (unless defective)</li>
                <li>• Watches that have been resized or altered</li>
                <li>• Items returned after the 30-day window</li>
              </ul>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4 flex items-center gap-3">
                <Package className="w-5 h-5 text-gold" /> Exchanges
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                If you would like to exchange your watch for a different model, follow the same return process and place a new order for the desired item. We will process the exchange once the original item is received and inspected.
              </p>
              <p className="text-gray-500 leading-relaxed">
                If the new item costs more, you will be charged the difference. If it costs less, the difference will be refunded.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-gold" /> Refund Timeline
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Return received and inspected</span>
                  <span className="text-navy font-medium">1-2 business days</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Refund processed to original payment method</span>
                  <span className="text-navy font-medium">3-5 business days</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Mobile money / bank transfer visible</span>
                  <span className="text-navy font-medium">5-7 business days</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
