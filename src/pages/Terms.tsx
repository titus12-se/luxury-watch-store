import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <div className="pt-24 pb-20">
      <div className="section-padding">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl text-navy mb-4">Terms of Service</h1>
            <p className="text-gray-500">Last updated: June 26, 2026</p>
          </motion.div>

          <div className="space-y-8">
            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-500 leading-relaxed">
                By accessing or using the Aura & Anchor Collections website, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">2. Products and Pricing</h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                All products listed on our website are subject to availability. We make every effort to display accurate product information, pricing, and images. However, we cannot guarantee that all information is completely accurate at all times.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Prices are listed in Uganda Shillings (UGX) and include all applicable taxes. We reserve the right to change prices at any time without prior notice.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">3. Orders and Payment</h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                When you place an order, you agree to provide current, complete, and accurate purchase and account information. We reserve the right to refuse or cancel any order for any reason, including product availability, errors in product or pricing information, or suspected fraud.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Payment must be received before an order is processed. We accept MTN Mobile Money, Airtel Money, bank transfers, and cash on delivery for eligible orders.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">4. Shipping and Delivery</h2>
              <p className="text-gray-500 leading-relaxed">
                Delivery times are estimates and begin from the date of order confirmation, not the date of order placement. We are not responsible for delays caused by customs, carrier issues, or circumstances beyond our control. Risk of loss and title for items pass to you upon delivery.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">5. Returns and Refunds</h2>
              <p className="text-gray-500 leading-relaxed">
                We offer a 30-day return policy for unworn watches in original condition. Please refer to our <a href="/returns" className="text-gold hover:underline">Returns & Exchanges</a> page for detailed instructions. Refunds will be processed within 5-7 business days after we receive and inspect the returned item.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">6. Authenticity</h2>
              <p className="text-gray-500 leading-relaxed">
                All watches sold by Aura & Anchor Collections are 100% authentic. Each watch comes with a certificate of authenticity and manufacturer warranty. We source directly from authorized distributors and do not sell counterfeit or replica products.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">7. Intellectual Property</h2>
              <p className="text-gray-500 leading-relaxed">
                All content on this website, including text, images, logos, and designs, is the property of Aura & Anchor Collections and is protected by copyright and trademark laws. You may not use, reproduce, or distribute any content without our prior written consent.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-500 leading-relaxed">
                Aura & Anchor Collections shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or products. Our total liability shall not exceed the amount you paid for the product in question.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">9. Governing Law</h2>
              <p className="text-gray-500 leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of Uganda. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Uganda.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">10. Contact Information</h2>
              <p className="text-gray-500 leading-relaxed">
                For any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-gray-500 mt-2">
                Email: <a href="mailto:auraanchorcollections@gmail.com" className="text-gold hover:underline">auraanchorcollections@gmail.com</a><br />
                Phone: <a href="tel:+256708018549" className="text-gold hover:underline">+256 708 018549</a><br />
                Address: Plot 42, Kampala Road, Kampala, Uganda
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
