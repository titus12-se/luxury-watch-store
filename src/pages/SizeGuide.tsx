import { Ruler } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SizeGuide() {
  return (
    <div className="pt-24 pb-20">
      <div className="section-padding">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl text-navy mb-4">Watch Size Guide</h1>
            <p className="text-gray-500">Find the perfect fit for your wrist and style.</p>
          </motion.div>

          <div className="space-y-8">
            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4 flex items-center gap-3">
                <Ruler className="w-5 h-5 text-gold" /> Measuring Your Wrist
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Use a flexible measuring tape or a strip of paper. Wrap it around your wrist just below the wrist bone, where you normally wear a watch. Mark the point where the end meets, then measure the length. This is your wrist size.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { range: '14-16 cm', label: 'Small', size: '36-38mm case' },
                  { range: '16-18 cm', label: 'Medium', size: '40-42mm case' },
                  { range: '18-20 cm', label: 'Large', size: '44-46mm case' },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-gold font-bold text-lg mb-1">{item.range}</p>
                    <p className="font-medium text-navy mb-1">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.size}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-6">Case Size Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-navy">Case Diameter</th>
                      <th className="text-left px-4 py-3 font-medium text-navy">Style</th>
                      <th className="text-left px-4 py-3 font-medium text-navy">Best For</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 text-navy">34-36mm</td>
                      <td className="px-4 py-3 text-gray-500">Dress, Classic</td>
                      <td className="px-4 py-3 text-gray-500">Smaller wrists, formal occasions</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-navy">38-40mm</td>
                      <td className="px-4 py-3 text-gray-500">Dress, Everyday</td>
                      <td className="px-4 py-3 text-gray-500">Medium wrists, versatile wear</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-navy">41-42mm</td>
                      <td className="px-4 py-3 text-gray-500">Sport, Pilot</td>
                      <td className="px-4 py-3 text-gray-500">Medium to large wrists, statement piece</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-navy">43-44mm</td>
                      <td className="px-4 py-3 text-gray-500">Diver, Chronograph</td>
                      <td className="px-4 py-3 text-gray-500">Larger wrists, bold style</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-navy">45mm+</td>
                      <td className="px-4 py-3 text-gray-500">Tactical, Oversized</td>
                      <td className="px-4 py-3 text-gray-500">Very large wrists, maximum presence</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-navy mb-4">Strap & Bracelet Fit</h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                A well-fitted strap should allow you to slide one finger between the strap and your wrist. The watch should not slide up and down your arm, nor should it leave deep marks on your skin.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Most watches in our collection come with adjustable straps or bracelets. We can resize metal bracelets at no extra cost before shipping. Simply include your wrist measurement in the order notes at checkout.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
