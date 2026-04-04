import { useState } from "react";
import { IoClose, IoArrowBack, IoCheckmarkCircle } from "react-icons/io5";
import { useGetProductCategoriesQuery, useGetProductsQuery } from "../../../redux/mall/mallApi";
import { voiceSocket } from "../../../services/appServices/voiceSocketServices";

const SuggestRemedyPanel = ({ isOpen, onClose, roomId }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const { data: catResponse, isLoading: catLoading, error: catError } = useGetProductCategoriesQuery(undefined, {
    skip: !isOpen,
  });

  const { data: prodResponse, isLoading: prodLoading, error: prodError } = useGetProductsQuery(
    { categoryId: selectedCategory?.ID, page: 1, limit: 10 },
    { skip: !selectedCategory },
  );

  const categories = catResponse?.data || [];
  const products = prodResponse?.data || [];

  const toggleProduct = (product) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.ID === product.ID);
      if (exists) return prev.filter((p) => p.ID !== product.ID);
      return [...prev, product];
    });
  };

  const handleSend = () => {
    if (selectedProducts.length === 0) return;
    setSending(true);

    voiceSocket.emit("chat:message", {
      roomId,
      type: "products",
      sender: "astrologer",
      productIds: selectedProducts.map((p) => p.ID),
      message: message.trim() || "",
    });

    setSending(false);
    handleClose();
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setSelectedProducts([]);
    setMessage("");
    onClose();
  };

  // Go back to categories — keep selections
  const handleBack = () => {
    setSelectedCategory(null);
  };

  if (!isOpen) return null;

  const isProductView = !!selectedCategory;

  // Count how many selected products belong to a given category
  const getCountForCategory = (catID) =>
    selectedProducts.filter((p) => p.category?.some?.((c) => c.ID === catID)).length;

  return (
    <div className="fixed inset-0 md:inset-auto md:right-0 md:top-0 md:bottom-0 md:w-[420px] bg-white flex flex-col shadow-[-2px_0_10px_rgba(0,0,0,0.1)] z-[1001]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
        {isProductView && (
          <button onClick={handleBack} className="p-1.5 rounded-md hover:bg-gray-200 transition-colors" aria-label="Back">
            <IoArrowBack size={20} className="text-gray-600" />
          </button>
        )}
        <h3 className="text-lg font-semibold text-gray-900 flex-1">
          {isProductView ? selectedCategory.name : "Suggest Remedy"}
        </h3>
        {selectedProducts.length > 0 && !isProductView && (
          <span className="text-xs font-semibold text-white px-2 py-0.5 rounded-full" style={{ background: "linear-gradient(135deg, #f75801, #d43400)" }}>
            {selectedProducts.length} selected
          </span>
        )}
        <button onClick={handleClose} className="p-2 rounded-md hover:bg-gray-200 transition-colors" aria-label="Close panel">
          <IoClose size={22} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ===== CATEGORIES VIEW ===== */}
        {!isProductView && (
          <>
            {catLoading && <Spinner />}
            {catError && <ErrorMsg text="Failed to load categories" />}
            {!catLoading && !catError && categories.length === 0 && <EmptyMsg text="No remedy categories available" />}
            {!catLoading && !catError && categories.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((cat) => {
                  const count = getCountForCategory(cat.ID);
                  return (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat)}
                      className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-orange-400 hover:shadow-md active:scale-95 transition-all bg-white group relative"
                    >
                      {count > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: "#f75801" }}>
                          {count}
                        </span>
                      )}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={cat.imgUrl} alt={cat.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                      </div>
                      <span className="text-sm font-medium text-gray-800 group-hover:text-orange-600 transition-colors text-center">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ===== PRODUCTS VIEW ===== */}
        {isProductView && (
          <>
            {prodLoading && <Spinner />}
            {prodError && <ErrorMsg text="Failed to load products" />}
            {!prodLoading && !prodError && products.length === 0 && <EmptyMsg text="No products in this category" />}
            {!prodLoading && !prodError && products.length > 0 && (
              <div className="flex flex-col gap-3">
                {products.map((product) => {
                  const isSelected = selectedProducts.some((p) => p.ID === product.ID);
                  const dv = product.defaultVariant;
                  const productImage = product.images?.[0] || dv?.images?.[0] || product.variants?.[0]?.images?.[0];
                  const price = dv?.price ?? product.priceRange?.min ?? product.price;
                  const mrp = dv?.mrp ?? product.mrp;
                  return (
                    <button
                      key={product._id}
                      onClick={() => toggleProduct(product)}
                      className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all text-left active:scale-[0.98] ${
                        isSelected ? "border-orange-500 bg-orange-50 shadow-sm" : "border-gray-200 hover:border-orange-300 bg-white"
                      }`}
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                        {productImage && <img src={productImage} alt={product.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />}
                        {isSelected && (
                          <div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center">
                            <IoCheckmarkCircle size={24} className="text-orange-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{product.short_description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {price != null && <span className="text-sm font-semibold text-orange-600">₹{price.toLocaleString("en-IN")}</span>}
                          {mrp != null && mrp > price && (
                            <span className="text-xs text-gray-400 line-through">₹{mrp.toLocaleString("en-IN")}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer - Send bar (visible whenever products are selected, on both views) */}
      {selectedProducts.length > 0 && (
        <div className="border-t bg-gray-50 p-3 sm:p-4 flex flex-col gap-2 safe-area-bottom">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message (optional)"
              className="flex-1 px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            />
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-4 py-2.5 sm:py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #f75801, #d43400)" }}
            >
              {sending ? "Sending..." : `Send (${selectedProducts.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===== Small helper components ===== */
const Spinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-8 h-8 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ErrorMsg = ({ text }) => (
  <div className="text-center py-12 text-red-500">
    <p className="text-sm">{text}</p>
  </div>
);

const EmptyMsg = ({ text }) => (
  <div className="text-center py-12 text-gray-400">
    <p className="text-sm">{text}</p>
  </div>
);

export default SuggestRemedyPanel;
