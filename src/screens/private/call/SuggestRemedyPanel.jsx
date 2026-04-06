import { useState, useCallback } from "react";
import { IoClose, IoArrowBack, IoCheckmarkCircle } from "react-icons/io5";
import { useGetProductCategoriesQuery, useGetProductsQuery, useLazyGetProductBySlugQuery } from "../../../redux/mall/mallApi";
import { voiceSocket } from "../../../services/appServices/voiceSocketServices";

const SuggestRemedyPanel = ({ isOpen, onClose, roomId }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null); // product with full variant data
  const [selectedVariants, setSelectedVariants] = useState([]); // { skuCode, productId, productTitle, variantLabel, price, mrp, image }
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [variantLoading, setVariantLoading] = useState(false);

  const { data: catResponse, isLoading: catLoading, error: catError } = useGetProductCategoriesQuery(undefined, {
    skip: !isOpen,
  });

  const { data: prodResponse, isLoading: prodLoading, error: prodError } = useGetProductsQuery(
    { categoryId: selectedCategory?.ID, page: 1, limit: 10 },
    { skip: !selectedCategory },
  );

  const [fetchProductBySlug] = useLazyGetProductBySlugQuery();

  const categories = catResponse?.data || [];
  const products = prodResponse?.data || [];

  // Current view: "categories" | "products" | "variants"
  const currentView = selectedProduct ? "variants" : selectedCategory ? "products" : "categories";

  // Build a label from variant — prefer title, then attributes, then skuCode
  const getVariantLabel = (variant) => {
    if (variant.title) return variant.title;
    if (variant.attributes && variant.attributes.length > 0) {
      return variant.attributes.map((a) => `${a.name}: ${a.value}`).join(", ");
    }
    return variant.skuCode;
  };

  // Group variants by first attribute value (e.g. "gemstone", "ring", "pendant")
  const groupVariantsByType = (variants) => {
    if (!variants || variants.length === 0) return {};
    const firstAttrName = variants[0]?.attributes?.[0]?.name;
    if (!firstAttrName || variants.every((v) => !v.attributes?.length)) {
      return { All: variants };
    }
    return variants.reduce((groups, v) => {
      const key = v.attributes?.find((a) => a.name === firstAttrName)?.value || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(v);
      return groups;
    }, {});
  };

  const handleProductClick = useCallback(async (product) => {
    if (!product?.slug) {
      // No slug available — fall back to inline variant data
      setSelectedProduct(product);
      return;
    }
    setVariantLoading(true);
    try {
      const res = await fetchProductBySlug(product.slug).unwrap();
      const fullProduct = res?.data || res;
      // Ensure we got a valid product with variants
      if (fullProduct && typeof fullProduct === "object") {
        setSelectedProduct(fullProduct);
      } else {
        setSelectedProduct(product);
      }
    } catch {
      // If slug fetch fails, use the product data we already have (it has variants from list)
      setSelectedProduct(product);
    } finally {
      setVariantLoading(false);
    }
  }, [fetchProductBySlug]);

  const toggleVariant = (variant, product) => {
    if (!variant?.skuCode) return; // Guard against missing SKU
    setSelectedVariants((prev) => {
      const exists = prev.find((v) => v.skuCode === variant.skuCode);
      if (exists) return prev.filter((v) => v.skuCode !== variant.skuCode);
      return [...prev, {
        skuCode: variant.skuCode,
        variantId: variant._id,
        productId: product.ID || product._id,
        productSlug: product.slug || "",
        productTitle: product.title || "",
        variantLabel: getVariantLabel(variant),
        price: variant.price,
        mrp: variant.mrp,
        image: variant.images?.[0] || product.images?.[0],
      }];
    });
  };

  const isVariantSelected = (skuCode) => selectedVariants.some((v) => v.skuCode === skuCode);

  // Count selected variants for a given product ID
  const getCountForProduct = (productID) =>
    selectedVariants.filter((v) => v.productId === productID).length;

  const handleSend = () => {
    if (selectedVariants.length === 0 || !roomId) return;
    setSending(true);

    try {
      voiceSocket.emit("chat:message", {
        roomId,
        type: "products",
        sender: "astrologer",
        variantSkus: selectedVariants.map((v) => ({ slug: v.productSlug, variantSku: v.skuCode })),
        message: message.trim() || "",
      });
      handleClose();
    } catch (err) {
      console.error("Failed to send remedy suggestion:", err);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setSelectedProduct(null);
    setSelectedVariants([]);
    setMessage("");
    onClose();
  };

  const handleBack = () => {
    if (selectedProduct) {
      setSelectedProduct(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  if (!isOpen) return null;

  const headerTitle = currentView === "variants"
    ? selectedProduct?.title || "Variants"
    : currentView === "products"
    ? selectedCategory?.name
    : "Suggest Remedy";

  return (
    <div className="fixed inset-0 md:inset-auto md:right-0 md:top-0 md:bottom-0 md:w-[420px] bg-white flex flex-col shadow-[-2px_0_10px_rgba(0,0,0,0.1)] z-[1001]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
        {currentView !== "categories" && (
          <button onClick={handleBack} className="p-1.5 rounded-md hover:bg-gray-200 transition-colors" aria-label="Back">
            <IoArrowBack size={20} className="text-gray-600" />
          </button>
        )}
        <h3 className="text-lg font-semibold text-gray-900 flex-1 truncate">{headerTitle}</h3>
        {selectedVariants.length > 0 && currentView === "categories" && (
          <span className="text-xs font-semibold text-white px-2 py-0.5 rounded-full" style={{ background: "linear-gradient(135deg, #f75801, #d43400)" }}>
            {selectedVariants.length} selected
          </span>
        )}
        <button onClick={handleClose} className="p-2 rounded-md hover:bg-gray-200 transition-colors" aria-label="Close panel">
          <IoClose size={22} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ===== CATEGORIES VIEW ===== */}
        {currentView === "categories" && (
          <>
            {catLoading && <Spinner />}
            {catError && <ErrorMsg text="Failed to load categories" />}
            {!catLoading && !catError && categories.length === 0 && <EmptyMsg text="No remedy categories available" />}
            {!catLoading && !catError && categories.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((cat) => {
                  // Count from all selectedVariants whose productId belongs to this category
                  // We can't easily know here, so we just show total if needed
                  return (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat)}
                      className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-orange-400 hover:shadow-md active:scale-95 transition-all bg-white group relative"
                    >
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
        {currentView === "products" && (
          <>
            {(prodLoading || variantLoading) && <Spinner />}
            {prodError && <ErrorMsg text="Failed to load products" />}
            {!prodLoading && !variantLoading && !prodError && products.length === 0 && <EmptyMsg text="No products in this category" />}
            {!prodLoading && !variantLoading && !prodError && products.length > 0 && (
              <div className="flex flex-col gap-3">
                {products.map((product) => {
                  const variantCount = getCountForProduct(product.ID);
                  const dv = product.defaultVariant;
                  const productImage = product.images?.[0] || dv?.images?.[0] || product.variants?.[0]?.images?.[0];
                  const price = dv?.price ?? product.priceRange?.min ?? product.price;
                  const mrp = dv?.mrp ?? product.mrp;
                  const totalVariants = product.variants?.length || 0;
                  return (
                    <button
                      key={product._id}
                      onClick={() => handleProductClick(product)}
                      className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all text-left active:scale-[0.98] ${
                        variantCount > 0 ? "border-orange-500 bg-orange-50 shadow-sm" : "border-gray-200 hover:border-orange-300 bg-white"
                      }`}
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                        {productImage && <img src={productImage} alt={product.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />}
                        {variantCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: "#f75801" }}>
                            {variantCount}
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
                          {totalVariants > 1 && (
                            <span className="text-[10px] text-gray-400 ml-auto">{totalVariants} variants</span>
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

        {/* ===== VARIANTS VIEW ===== */}
        {currentView === "variants" && selectedProduct && (
          <>
            {(() => {
              const variants = selectedProduct.variants?.filter((v) => v.isActive !== false) || [];
              if (variants.length === 0) return <EmptyMsg text="No variants available for this product" />;
              const grouped = groupVariantsByType(variants);
              const groupKeys = Object.keys(grouped);
              const hasGroups = groupKeys.length > 1 || (groupKeys.length === 1 && groupKeys[0] !== "All");
              return (
                <div className="flex flex-col gap-4">
                  {groupKeys.map((groupName) => (
                    <div key={groupName}>
                      {hasGroups && (
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1 capitalize">{groupName}</p>
                      )}
                      <div className="flex flex-col gap-2">
                        {grouped[groupName].map((variant) => {
                          const selected = isVariantSelected(variant.skuCode);
                          const variantImage = variant.images?.[0] || selectedProduct.images?.[0];
                          const label = getVariantLabel(variant);
                          return (
                            <button
                              key={variant._id || variant.skuCode}
                              onClick={() => toggleVariant(variant, selectedProduct)}
                              className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all text-left active:scale-[0.98] ${
                                selected ? "border-orange-500 bg-orange-50 shadow-sm" : "border-gray-200 hover:border-orange-300 bg-white"
                              }`}
                            >
                              {variantImage ? (
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                  <img src={variantImage} alt={label} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                                  {selected && (
                                    <div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center">
                                      <IoCheckmarkCircle size={24} className="text-orange-600" />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center relative">
                                  <span className="text-[10px] text-gray-400">No img</span>
                                  {selected && (
                                    <div className="absolute inset-0 bg-orange-500/30 rounded-lg flex items-center justify-center">
                                      <IoCheckmarkCircle size={24} className="text-orange-600" />
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">SKU: {variant.skuCode}</p>
                                {variant.stock != null && (
                                  <p className={`text-[10px] mt-0.5 ${variant.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                                    {variant.stock > 0 ? `${variant.stock} in stock` : "Out of stock"}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-semibold text-orange-600">₹{variant.price?.toLocaleString("en-IN")}</span>
                                  {variant.mrp != null && variant.mrp > variant.price && (
                                    <span className="text-xs text-gray-400 line-through">₹{variant.mrp?.toLocaleString("en-IN")}</span>
                                  )}
                                  {variant.mrp != null && variant.mrp > variant.price && (
                                    <span className="text-[10px] font-semibold text-green-600">
                                      {Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)}% off
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Footer - Send bar */}
      {selectedVariants.length > 0 && (
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
              {sending ? "Sending..." : `Send (${selectedVariants.length})`}
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
