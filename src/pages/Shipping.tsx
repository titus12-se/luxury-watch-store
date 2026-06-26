import { Truck, Package, Clock, Globe, Shield, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Shipping() {
  return (
    <div className="pt-24 pb-20">
      <div className="section-padding">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl text-navy mb-4">Shipping & Delivery</h1>
            <p className="text-gray-500">We deliver across East Africa with care and precision.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Free on orders over UGX 500,000 in Uganda, UGX 750,000 in East Africa.' },
              { icon: Clock, title: 'Fast Delivery', desc: '1-2 days in Uganda, 3-5 days across East Africa.' },
              { icon: Shield, title: 'Insured Delivery', desc: 'Every shipment is fully insured and tracked.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 border border-gray-100 text-center">
                <item.icon className="w-8 h-8 text-gold mx-auto mb-3" />
                <h3 className="font-medium text-navy mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gold" /> Delivery Zones & Rates
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-navy">Country</th>
                      <th className="text-left px-4 py-3 font-medium text-navy">Zone</th>
                      <th className="text-right px-4 py-3 font-medium text-navy">Shipping Cost</th>
                      <th className="text-right px-4 py-3 font-medium text-navy">Free Over</th>
                      <th className="text-right px-4 py-3 font-medium text-navy">Delivery Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 text-navy">Uganda</td>
                      <td className="px-4 py-3 text-gray-500">Kampala</td>
                      <td className="px-4 py-3 text-right text-green-600">Free</td>
                      <td className="px-4 py-3 text-right text-gray-500">UGX 500,000</td>
                      <td className="px-4 py-3 text-right text-gray-500">1-2 days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-navy">Uganda</td>
                      <td className="px-4 py-3 text-gray-500">Other Cities</td>
                      <td className="px-4 py-3 text-right text-navy">UGX 15,000</td>
                      <td className="px-4 py-3 text-right text-gray-500">UGX 500,000</td>
                      <td className="px-4 py-3 text-right text-gray-500">2-4 days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-navy">Kenya</td>
                      <td className="px-4 py-3 text-gray-500">All Cities</td>
                      <td className="px-4 py-3 text-right text-navy">UGX 25,000</td>
                      <td className="px-4 py-3 text-right text-gray-500">UGX 750,000</td>
                      <td className="px-4 py-3 text-right text-gray-500">3-5 days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-navy">Tanzania</td>
                      <td className="px-4 py-3 text-gray-500">All Cities</td>
                      <td className="px-4 py-3 text-right text-navy">UGX 30,000</td>
                      <td className="px-4 py-3 text-right text-gray-500">UGX 750,000</td>
                      <td className="px-4 py-3 text-right text-gray-500">3-5 days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-navy">Rwanda</td>
                      <td className="px-4 py-3 text-gray-500">All Cities</td>
                      <td className="px-4 py-3 text-right text-navy">UGX 25,000</td>
                      <td className="px-4 py-3 text-right text-gray-500">UGX 750,000</td>
                      <td className="px-4 py-3 text-right text-gray-500">3-5 days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-navy">South Sudan</td>
                      <td className="px-4 py-3 text-gray-500">All Cities</td>
                      <td className="px-4 py-3 text-right text-navy">UGX 40,000</td>
                      <td className="px-4 py-3 text-right text-gray-500">UGX 1,000,000</td>
                      <td className="px-4 py-3 text-right text-gray-500">5-7 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4 flex items-center gap-3">
                <Package className="w-5 h-5 text-gold" /> Packaging
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Every watch is carefully packaged in a luxury presentation box with a certificate of authenticity, care instructions, and a soft microfiber cloth. The outer box is reinforced and tamper-evident to ensure your timepiece arrives in perfect condition.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Gift wrapping is available at no extra charge. Simply include a note during checkout, and we will wrap your watch with premium gift paper and a handwritten card.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4 flex items-center gap-3">
                <Globe className="w-5 h-5 text-gold" /> International Orders
              </h2>
              <p className="text-gray-500 leading-relaxed">
                We currently ship across all East African countries. For orders outside this region, please contact us directly at <a href="mailto:auraanchorcollections@gmail.com" className="text-gold hover:underline">auraanchorcollections@gmail.com</a> and we will arrange special shipping.
              </p>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">Tracking Your Order</h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Once your order is dispatched, you will receive an SMS and email with your tracking number and estimated delivery date. You can also track your order using the <a href="/track-order" className="text-gold hover:underline">Track Order</a> page on our website.
              </p>
              <p className="text-gray-500 leading-relaxed">
                If you have any questions about your delivery, our support team is available via WhatsApp at <a href="https://wa.me/256708018549" className="text-gold hover:underline">+256 708 018549</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
