

# React Vite + Redux Toolkit + TypeScript + Tailwind
## Project Architecutre 

### app/
- Only application level configuration belongs here
- **example:** redux provider, react router, theme provider, global error boundary 

### shared/
- this is code that does not know about products, users, or carts
- **example:** button, Loader, axios instance, basically resuseable things

### entities/
- to give all features same types

### features
#### this where application functionality lives.
example:
- auth/
- cart/
- product/
- wishlist/

Each feature own Redux slice, async thunks, selectors, feature UI, hooks

### widgets/
- A widget is a composition of multiple components.
- **example:** Navbar, Footer, Product Filter Panel

### Pages/
- represent routes
- pages mostly assemble widget and features, not contain complex bussiness logic.
- **example:** Products, Login, WishList

#### What Redux will manage
```txt
├─ src/
├── ├── products
├── ├── categories
├── ├── cart
├── ├── wishlist
├── ├── auth 
├── ├── ui
```