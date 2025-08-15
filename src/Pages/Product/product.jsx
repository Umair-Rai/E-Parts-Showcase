import React, { useState } from "react";
import { X, Search } from "lucide-react";

const mockProducts = [
  {
    id: 1,
    name: "Hex Head Bolt",
    category: "GenSet Parts and Components",
    code: "GEN-HEX-010",
    spec: "M10 x 50 mm, Zinc Plated",
    image: "https://via.placeholder.com/150x150?text=Hex+Bolt",
    details: "Heavy-duty hex head bolt for generator assembly and fastening."
  },
  {
    id: 2,
    name: "Single Phase Electric Motor",
    category: "Mechanical Seals",
    code: "MS-MTR-220",
    spec: "1.5 kW, 220V, 50Hz",
    image: "https://via.placeholder.com/150x150?text=Electric+Motor",
    details: "Reliable single-phase motor ideal for seal pumps and rotating equipment."
  },
  {
    id: 3,
    name: "Hydraulic Gear Pump",
    category: "Water Pump Parts",
    code: "WPP-HYD-050",
    spec: "50 L/min, Cast Iron Housing",
    image: "https://via.placeholder.com/150x150?text=Hydraulic+Pump",
    details: "Robust gear pump suitable for high-pressure water pumping systems."
  },
  {
    id: 4,
    name: "Steel Spur Gear",
    category: "Pulleys",
    code: "PUL-GR-020",
    spec: "20 Teeth, Hardened Steel",
    image: "https://via.placeholder.com/150x150?text=Spur+Gear",
    details: "Precision-machined spur gear designed for power transmission applications."
  },
  {
    id: 5,
    name: "Stainless Steel Gate Valve",
    category: "Agricultural Parts",
    code: "AG-VLV-100",
    spec: "4-inch, SS304, Flanged Ends",
    image: "https://via.placeholder.com/150x150?text=Gate+Valve",
    details: "Durable gate valve for irrigation and agricultural water systems."
  },
  {
    id: 6,
    name: "Deep Groove Ball Bearing",
    category: "Bearings",
    code: "BRG-DGBB-6204",
    spec: "6204, High-Precision Steel",
    image: "https://via.placeholder.com/150x150?text=Ball+Bearing",
    details: "High-precision deep groove ball bearing suitable for industrial machinery."
  }
];

const categories = [
  "GenSet Parts and Components",
  "Mechanical Seals",
  "Water Pump Parts",
  "Pulleys",
  "Agricultural Parts",
  "Bearings"
];

export default function ProductCatalog() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filteredProducts = mockProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.spec.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(p.category);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-grey-1500 text-white px-4 py-8">
      {/* Search Bar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-2xl">
          <input
            type="text"
            placeholder="Search by name, code, or specification"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-gray-600 px-5 py-3 pr-12 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700"
          />
          <Search className="absolute right-4 top-3.5 text-gray-400" size={20} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="bg-gray-900 p-5 rounded-xl shadow-lg space-y-3 w-full lg:w-64">
          <h2 className="font-semibold text-lg border-b border-gray-700 pb-2 mb-3">Categories</h2>
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex items-center space-x-3 cursor-pointer hover:text-red-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="accent-red-700 w-5 h-5"
              />
              <span>{cat}</span>
            </label>
          ))}
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-gray-400">
              {filteredProducts.length} products found
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-900 rounded-xl shadow-lg overflow-hidden transform hover:shadow-red-800 hover:scale-105 transition-transform duration-300"
              >
                <div className="h-48 bg-white flex justify-center items-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full object-contain p-3"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold">{product.name}</h3>
                  <p className="text-sm text-gray-400">{product.spec}</p>
                  <button
                    className="mt-4 w-full bg-red-700 hover:bg-red-800 text-white py-2 rounded-full transition-colors"
                    onClick={() => setSelectedProduct(product)}
                  >
                    Quick View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={22} />
            </button>
            <div className="h-48 bg-white flex justify-center items-center rounded-lg">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="h-full object-contain p-3"
              />
            </div>
            <h2 className="text-xl font-bold mt-4">{selectedProduct.name}</h2>
            <p className="text-gray-400 mt-2">{selectedProduct.spec}</p>
            <p className="mt-4">{selectedProduct.details}</p>
          </div>
        </div>
      )}
    </div>
  );
}
