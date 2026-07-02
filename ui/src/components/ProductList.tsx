import { useEffect } from "react";
import { loadProducts } from "../features/product/productSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";

export default function ProductList() {
  const dispatch = useAppDispatch();

  const { products, loading, error } = useAppSelector((state) => state.product);

  useEffect(() => {
    dispatch(loadProducts());
  }, [dispatch]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="grid grid-cols-9 gap-4 p-6 mx-15">
      {products.map((product) => (
        <div key={product.id} className="rounded-lg border p-4 shadow">

          <img src={product.images[0]} alt="product" />  
          <h2 className="font-bold">{product.title}</h2>
          <p>₹ {product.price}</p>
        </div>
      ))}
    </div>
  );
}
