// ./Frontend/src/context/CartContext.jsx 
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { cartAPI } from "../services/api";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

// Simple auth check
const useAuthCheck = () => {
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  };

  return { isAuthenticated };
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuthCheck();

  // Load cart from backend on mount
  useEffect(() => {
    if (isAuthenticated()) {
      loadCartFromBackend();
    } else {
      // If not authenticated, use localStorage
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, []);

  // Save to localStorage when cart changes (for guests)
  useEffect(() => {
    if (!isAuthenticated()) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // Load cart from backend
  const loadCartFromBackend = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await cartAPI.getCart();

      if (response && response.success && response.data) {
        const items = response.data.items || [];
        setCartItems(items);
        console.log("🛒 Cart loaded from backend:", items.length, "items");
      }
    } catch (err) {
      console.error("Failed to load cart from backend:", err.message);
      setError("Failed to load cart");
      // Fallback to localStorage
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart (with backend sync)
  const addToCart = async (product) => {
    // Check authentication
    if (!isAuthenticated()) {
      alert(" Please login to add items to cart");
      return false;
    }

    try {
      setLoading(true);
      console.log(" Adding to cart:", product.name);

      const response = await cartAPI.addToCart(
        product._id,
        product.quantity || 1
      );

      if (response && response.success && response.data) {
        const items = response.data.items || [];
        setCartItems(items);
        console.log(" Added to cart successfully");
        return true;
      } else {
        throw new Error("Failed to add to cart");
      }
    } catch (err) {
      console.error(" Failed to add to cart:", err.message);
      setError(err.message || "Failed to add to cart");

      // Fallback: Add to localStorage
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (item) =>
            item.product?._id === product._id || item._id === product._id
        );

        if (existingItem) {
          return prevItems.map((item) =>
            item.product?._id === product._id || item._id === product._id
              ? {
                  ...item,
                  quantity: item.quantity + (product.quantity || 1),
                }
              : item
          );
        } else {
          return [
            ...prevItems,
            {
              ...product,
              quantity: product.quantity || 1,
            },
          ];
        }
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const response = await cartAPI.removeFromCart(itemId);

      if (response && response.success && response.data) {
        const items = response.data.items || [];
        setCartItems(items);
        return true;
      } else {
        // Fallback: Remove from local state
        setCartItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
        return true;
      }
    } catch (err) {
      console.error("Failed to remove from cart:", err);
      // Fallback
      setCartItems((prevItems) =>
        prevItems.filter((item) => item._id !== itemId)
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    try {
      setLoading(true);
      const response = await cartAPI.updateCartItem(itemId, quantity);

      if (response && response.success && response.data) {
        const items = response.data.items || [];
        setCartItems(items);
      } else {
        // Fallback: Update local state
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, quantity } : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to update quantity:", err);
      // Fallback
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemId ? { ...item, quantity } : item
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.clearCart();

      if (response && response.success) {
        setCartItems([]);
        localStorage.removeItem("cart");
        return true;
      }
    } catch (err) {
      console.error("Failed to clear cart:", err);
      // Fallback
      setCartItems([]);
      localStorage.removeItem("cart");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calculate total items
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return cartItems.some(
      (item) => item.product?._id === productId || item._id === productId
    );
  };

  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    loadCartFromBackend,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
