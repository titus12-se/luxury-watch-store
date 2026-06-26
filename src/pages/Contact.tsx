import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/components/ui/Toast';
import SectionTitle from '@/components/SectionTitle';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<any[]>([]);

  useState(() => {
    supabase.from('faqs').select('*').order('order', { ascending: true }).then(({ data }) => {
      setFaqs(data ?? []);
    });
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // In a real app, this would send to an edge function or email service
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    showToast('Message sent successfully!', 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <div className="relative h-[300px] overflow-hidden mb-16">
        <div className="absolute inset-0 bg-navy/60 z-10" />
        <img
          src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1600"
          alt="Contact"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center">
            <span className="text-gold text-xs uppercase tracking-[0.3em] mb-3 block">Get in Touch</span>
            <h1 className="font-serif text-4xl md:text-5xl text-white">Contact Us</h1>
          </div>
        </div>
      </div>

      <div className="section-padding max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-start gap-4 p-6 bg-white border border-gray-100">
              <MapPin className="w-5 h-5 text-gold shrink-0 mt-1" />
              <div>
                <h4 className="font-medium text-navy mb-1">Visit Us</h4>
                <p className="text-sm text-gray-500">Plot 42, Kampala Road<br />Kampala, Uganda</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white border border-gray-100">
              <Phone className="w-5 h-5 text-gold shrink-0 mt-1" />
              <div>
                <h4 className="font-medium text-navy mb-1">Call Us</h4>
                <a href="tel:+256708018549" className="text-sm text-gray-500 hover:text-gold transition-colors">+256 708 018549</a>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white border border-gray-100">
              <Mail className="w-5 h-5 text-gold shrink-0 mt-1" />
              <div>
                <h4 className="font-medium text-navy mb-1">Email Us</h4>
                <a href="mailto:hello@auraandanchor.com" className="text-sm text-gray-500 hover:text-gold transition-colors">hello@auraandanchor.com</a>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white border border-gray-100">
              <Clock className="w-5 h-5 text-gold shrink-0 mt-1" />
              <div>
                <h4 className="font-medium text-navy mb-1">Business Hours</h4>
                <p className="text-sm text-gray-500">Mon - Sat: 9:00 AM - 6:00 PM<br />Sun: Closed</p>
              </div>
            </div>
            <a
              href="https://wa.me/256708018549"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 text-white py-4 hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-2xl text-navy mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Subject</label>
                  <input
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gold resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <SectionTitle title="Frequently Asked Questions" subtitle="FAQ" />
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-navy text-sm">{faq.question}</span>
                {openFaq === faq.id ? (
                  <ChevronUp className="w-4 h-4 text-gold shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>
              {openFaq === faq.id && (
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
