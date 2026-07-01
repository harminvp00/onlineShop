import { useState } from "react";


function App() {

  const [product, setProduct] = useState([]);

  const handleDelete = async (id) => {
    alert(`Hello, You click at product number ${id} for delete it`)
  }

  const getProducts = async () => {
    await fetch('https://dummyjson.com/products')
      .then(res => res.json())
      .then(data => setProduct(data.products));

  }

  return (
   <div className='text-3xl'>
    <div className="flex justify-center items-center mt-5 ">
      <button className="bg-blue-500 font-bold text-white px-8 py-4" onClick={getProducts}> Get Products </button>
    </div>

     <div className="flex justify-center">
      {product.length === 0 ? 
      <p className="mt-[100px]"> <b> 404 </b> No products found </p>
      : 
        <div className="grid grid-cols-3">
          {
            product.map((ele, index)=>{
              return(
                <div key={index} className="relative border bg-[#f5f5f5] m-5 px-3 py-1">
                  <button onClick={() => handleDelete(ele.id)} className="absolute text-xl right-0 mx-1 py-1 px-2 bg-red-500 text-white p-1 cursor-pointer"> delete </button>
                  <img src={ele.images[0]} alt="" />
                  <h5> {ele.title} </h5>
                  <p className="text-[16px]"> {ele.description} </p>
                  <p className={`${ele.stock <= 0 ? "text-red-500" : "text-green-500"}`}> {ele.stock <= 0 ? "Not In Stock" : "In Stock"} </p>
                  <p> <b> {ele.brand} </b> </p>
                </div>
              )
              
            })
          }
        </div>
      }
     </div>
   </div>
  )
}

export default App
