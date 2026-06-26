import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div className="pt-24 pb-20">
      <div className="section-padding">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl text-navy mb-4">Privacy Policy</h1>
            <p className="text-gray-500">Last updated: June 26, 2026</p>
          </motion.div>

          <div className="space-y-8">
            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">Introduction</h2>
              <p className="text-gray-500 leading-relaxed">
                Aura & Anchor Collections ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">Information We Collect</h2>
              <ul className="space-y-3 text-gray-500">
                <li><strong className="text-navy">Personal Information:</strong> Name, email address, phone number, shipping address, and billing information when you create an account or place an order.</li>
                <li><strong className="text-navy">Payment Information:</strong> We do not store your mobile money or bank details. Payments are processed through secure third-party gateways.</li>
                <li><strong className="text-navy">Usage Data:</strong> Information about how you interact with our website, including pages visited, products viewed, and time spent.</li>
                <li><strong className="text-navy">Device Information:</strong> IP address, browser type, operating system, and device identifiers.</li>
              </ul>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">How We Use Your Information</h2>
              <ul className="space-y-3 text-gray-500">
                <li>• Process and fulfill your orders, including shipping and delivery</li>
                <li>• Communicate with you about your orders, account, and promotions</li>
                <li>• Provide customer support and respond to your inquiries</li>
                <li>• Improve our website, products, and services</li>
                <li>• Send marketing communications (with your consent)</li>
                <li>• Comply with legal obligations and prevent fraud</li>
              </ul>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">Data Sharing</h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="space-y-3 text-gray-500">
                <li>• <strong className="text-navy">Service Providers:</strong> Shipping carriers, payment processors, and IT service providers who help us operate our business.</li>
                <li>• <strong className="text-navy">Legal Requirements:</strong> When required by law, court order, or government regulation.</li>
                <li>• <strong className="text-navy">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets.</li>
              </ul>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">Data Security</h2>
              <p className="text-gray-500 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">Your Rights</h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="space-y-3 text-gray-500">
                <li>• Access the personal information we hold about you</li>
                <li>• Request correction of inaccurate information</li>
                <li>• Request deletion of your personal information</li>
                <li>• Object to processing for marketing purposes</li>
                <li>• Withdraw consent at any time</li>
              </ul>
              <p className="text-gray-500 mt-4">
                To exercise these rights, contact us at <a href="mailto:auraanchorcollections@gmail.com" className="text-gold hover:underline">auraanchorcollections@gmail.com</a>.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">Contact Us</h2>
              <p className="text-gray-500 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
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
