const API_URL = "https://fakestoreapi.com/products";
const $ = (selector) => document.querySelector(selector);
const state = { products: [], filtered: [], cart: [], favorites: new Set(), category: "all", query: "", sort: "featured", maxPrice: 1500, ratingOnly: false, page: 1, pageSize: 9, mode: "all" };
const currency = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const categoryNames = { "men-clothing":"Menswear", "women-clothing":"Womenswear", jewelery:"Accessories", electronics:"Tech" };
const categoryName = (slug) => categoryNames[slug] || slug.replaceAll("-", " ").replace(/\b\w/g, c => c.toUpperCase());
function escapeHTML(value=""){return String(value).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2300);}
function initIcons(){if(window.lucide)lucide.createIcons();}
function fallbackProducts(){return [
{id:101,title:"Fone sem fio Studio",description:"Som imersivo para acompanhar sua rotina.",category:"electronics",price:129.9,rating:4.7,thumbnail:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",discountPercentage:12},
{id:102,title:"Tênis Urban Move",description:"Conforto para todos os seus caminhos.",category:"men-clothing",price:289.9,rating:4.8,thumbnail:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",discountPercentage:15},
{id:103,title:"Bolsa Everyday",description:"Design versátil e espaço na medida.",category:"women-clothing",price:179.9,rating:4.6,thumbnail:"https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80",discountPercentage:10},
{id:104,title:"Essenciais de skincare",description:"Um ritual simples para cuidar de você.",category:"electronics",price:89.9,rating:4.9,thumbnail:"https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=500&q=80",discountPercentage:8},
{id:105,title:"Luminária minimalista",description:"Uma luz acolhedora para o seu espaço.",category:"jewelery",price:149.9,rating:4.5,thumbnail:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80",discountPercentage:18},
{id:106,title:"Relógio clássico",description:"Um detalhe atemporal para o seu estilo.",category:"jewelery",price:219.9,rating:4.7,thumbnail:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",discountPercentage:10}
];}
async function loadProducts(){
 const status=$("#apiStatus");
 try{
  const response=await fetch(API_URL,{headers:{Accept:"application/json"}});
  if(!response.ok) throw new Error("API indisponível");
  const data=await response.json();
  if(!Array.isArray(data)||!data.length) throw new Error("Sem produtos");
  state.products=data.map(p=>({ ...p, category: ({'men' : 'men-clothing', 'women' : 'women-clothing', 'jewelery' : 'jewelery', 'electronics' : 'electronics'})[p.category] || p.category, price:Number(p.price)*5.15, rating:Number(p.rating?.rate)||4.4, ratingCount:Number(p.rating?.count)||0, thumbnail:p.image, discountPercentage:0 }));
  status.classList.remove("offline");status.innerHTML="<span></span> FakeStoreAPI conectada";
 }catch(error){
  state.products=fallbackProducts();
  status.classList.add("offline");status.innerHTML="<span></span> Modo demonstração";
  toast("Não foi possível conectar à API. Exibindo produtos de demonstração.");
 }
 renderSideCategories();applyFilters();initIcons();
}
function renderSideCategories(){
 const counts={};state.products.forEach(p=>counts[p.category]=(counts[p.category]||0)+1);
 const cats=Object.entries(counts).sort((a,b)=>categoryName(a[0]).localeCompare(categoryName(b[0])));
 $("#sideCategories").innerHTML=`<button data-side-category="all" class="${state.category==="all"?"active":""}">Todas as categorias <small>${state.products.length}</small></button>`+cats.map(([cat,count])=>`<button data-side-category="${escapeHTML(cat)}" class="${state.category===cat?"active":""}">${escapeHTML(categoryName(cat))}<small>${count}</small></button>`).join("");
 $("#sideCategories").querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>setCategory(btn.dataset.sideCategory)));
}
function setCategory(category){
 state.category=category;state.page=1;
 document.querySelectorAll(".nav-category").forEach(b=>b.classList.toggle("active",b.dataset.category===category || (category!=="all"&&b.dataset.category===category)));
 renderSideCategories();applyFilters();
}
function applyFilters(){
 const q=state.query.trim().toLowerCase();
 state.filtered=state.products.filter(p=>(state.category==="all"||p.category===state.category)&&(Number(p.price)<=state.maxPrice)&&( !state.ratingOnly || Number(p.rating)>=4)&&( !q || `${p.title} ${p.description} ${p.category} ${p.brand||""}`.toLowerCase().includes(q))&&(state.mode!=="favorites"||state.favorites.has(p.id)));
 if(state.sort==="price-asc")state.filtered.sort((a,b)=>a.price-b.price);
 if(state.sort==="price-desc")state.filtered.sort((a,b)=>b.price-a.price);
 if(state.sort==="rating")state.filtered.sort((a,b)=>b.rating-a.rating);
 if(state.sort==="title")state.filtered.sort((a,b)=>a.title.localeCompare(b.title));
 renderProducts();renderFilters();
}
function renderProducts(){
 const visible=state.filtered.slice(0,state.page*state.pageSize);
 $("#resultsCount").textContent=`${state.filtered.length} ${state.filtered.length===1?"produto encontrado":"produtos encontrados"}`;
 $("#productGrid").innerHTML=visible.map((p,i)=>{
 const favorite=state.favorites.has(p.id), discounted=p.discountPercentage>8;
 return `<article class="product-card" style="animation-delay:${Math.min(i%9,8)*35}ms"><div class="product-media"><span class="product-badge ${discounted?"sale":""}">${discounted?`-${Math.round(p.discountPercentage)}% OFF`:"BOM ACHADO"}</span><button class="favorite-btn ${favorite?"active":""}" data-favorite="${p.id}" aria-label="${favorite?"Remover dos favoritos":"Adicionar aos favoritos"}"><i data-lucide="heart"></i></button><img src="${escapeHTML(p.thumbnail||p.images?.[0]||"")}" alt="${escapeHTML(p.title)}" loading="lazy" onerror="this.style.opacity='.15'"></div><div class="product-info"><span class="product-category">${escapeHTML(categoryName(p.category))}</span><h3 class="product-title">${escapeHTML(p.title)}</h3><div class="product-rating">★ <b>${Number(p.rating).toFixed(1)}</b><span>· ${p.ratingCount ? `${p.ratingCount} avaliações` : "nota demo"}</span></div><div class="product-bottom"><div><div class="product-price">${currency(p.price)}</div><small style="font-size:9px;color:var(--muted)">ou até 3x sem juros*</small></div><button class="add-cart" data-add="${p.id}" aria-label="Adicionar ${escapeHTML(p.title)} ao carrinho"><i data-lucide="plus"></i></button></div></div></article>`;
 }).join("");
 $("#emptyState").classList.toggle("hidden",state.filtered.length>0);
 $("#productGrid").classList.toggle("hidden",state.filtered.length===0);
 $("#loadMore").classList.toggle("hidden",visible.length>=state.filtered.length||state.filtered.length===0);
 initIcons();
}
function renderFilters(){
 const chips=[];
 if(state.query)chips.push(["Busca: "+state.query,()=>{state.query="";$("#searchInput").value="";applyFilters();}]);
 if(state.category!=="all")chips.push([categoryName(state.category),()=>setCategory("all")]);
 if(state.maxPrice<1500)chips.push([`Até ${currency(state.maxPrice)}`,()=>{state.maxPrice=1500;$("#priceRange").value=1500;$("#priceValue").textContent="R$ 1.500";applyFilters();}]);
 if(state.ratingOnly)chips.push(["4 estrelas ou mais",()=>{$("#ratingFilter").checked=false;state.ratingOnly=false;applyFilters();}]);
 if(state.mode==="favorites")chips.push(["Meus favoritos",()=>{state.mode="all";applyFilters();}]);
 $("#activeFilters").innerHTML=chips.map(([label],i)=>`<span class="filter-chip">${escapeHTML(label)} <button data-chip="${i}" aria-label="Remover filtro"><i data-lucide="x"></i></button></span>`).join("");
 $("#activeFilters").querySelectorAll("button").forEach((b,i)=>b.addEventListener("click",chips[i][1]));initIcons();
}
function addToCart(id){const p=state.products.find(p=>p.id===Number(id));if(!p)return;const item=state.cart.find(x=>x.id===p.id);if(item)item.qty++;else state.cart.push({...p,qty:1});renderCart();toast(`${p.title} adicionado ao carrinho`);}
function renderCart(){
 const count=state.cart.reduce((sum,p)=>sum+p.qty,0),total=state.cart.reduce((sum,p)=>sum+p.price*p.qty,0);
 $("#cartCount").textContent=count;$("#drawerCount").textContent=`(${count})`;$("#cartTotal").textContent=currency(total);$("#drawerTotal").textContent=currency(total);
 $("#cartItems").innerHTML=state.cart.length?state.cart.map(p=>`<div class="cart-line"><img src="${escapeHTML(p.thumbnail||"")}" alt=""><div><h4>${escapeHTML(p.title)}</h4><strong>${currency(p.price)}</strong><div class="quantity"><button data-qty="-1" data-id="${p.id}" aria-label="Diminuir quantidade">−</button><span>${p.qty}</span><button data-qty="1" data-id="${p.id}" aria-label="Aumentar quantidade">+</button></div></div><button class="remove-item" data-remove="${p.id}" aria-label="Remover produto"><i data-lucide="trash-2"></i></button></div>`).join(""):`<div class="cart-empty"><i data-lucide="shopping-bag"></i><h4>Seu carrinho está esperando</h4><p>Adicione alguns achados legais e eles vão aparecer aqui.</p></div>`;
 $("#cartItems").querySelectorAll("[data-qty]").forEach(b=>b.addEventListener("click",()=>{const item=state.cart.find(p=>p.id===Number(b.dataset.id));if(item){item.qty+=Number(b.dataset.qty);if(item.qty<1)state.cart=state.cart.filter(p=>p.id!==item.id);renderCart();}}));
 $("#cartItems").querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>{state.cart=state.cart.filter(p=>p.id!==Number(b.dataset.remove));renderCart();}));
 $("#cartFooter").classList.toggle("hidden",!state.cart.length);initIcons();
}
function toggleFavorite(id){id=Number(id);if(state.favorites.has(id)){state.favorites.delete(id);toast("Removido dos favoritos");}else{state.favorites.add(id);toast("Salvo nos seus favoritos");}$("#wishCount").textContent=state.favorites.size;applyFilters();}
function openDrawer(){ $("#overlay").classList.add("open");$("#cartDrawer").classList.add("open");document.body.style.overflow="hidden";}
function closeDrawer(){ $("#overlay").classList.remove("open");$("#cartDrawer").classList.remove("open");document.body.style.overflow="";}
$("#searchForm").addEventListener("submit",e=>{e.preventDefault();state.query=$("#searchInput").value;state.page=1;state.mode="all";applyFilters();$("#produtos").scrollIntoView({behavior:"smooth"});});
$("#searchInput").addEventListener("input",e=>{state.query=e.target.value;state.page=1;state.mode="all";applyFilters();});
$("#categoryNav").addEventListener("click",e=>{const btn=e.target.closest("[data-category]");if(btn)setCategory(btn.dataset.category);});
$("#sortSelect").addEventListener("change",e=>{state.sort=e.target.value;applyFilters();});
$("#priceRange").addEventListener("input",e=>{state.maxPrice=Number(e.target.value);$("#priceValue").textContent=state.maxPrice>=1500?"R$ 1.500":currency(state.maxPrice);applyFilters();});
$("#ratingFilter").addEventListener("change",e=>{state.ratingOnly=e.target.checked;applyFilters();});
$("#filterToggle").addEventListener("click",()=>$("#filterPanel").classList.toggle("open"));
$("#clearFilters").addEventListener("click",clearFilters);$("#emptyReset").addEventListener("click",clearFilters);
function clearFilters(){state.query="";state.category="all";state.maxPrice=1500;state.ratingOnly=false;state.mode="all";state.page=1;$("#searchInput").value="";$("#priceRange").value=1500;$("#priceValue").textContent="R$ 1.500";$("#ratingFilter").checked=false;renderSideCategories();applyFilters();}
$("#productGrid").addEventListener("click",e=>{const fav=e.target.closest("[data-favorite]"),add=e.target.closest("[data-add]");if(fav)toggleFavorite(fav.dataset.favorite);if(add)addToCart(add.dataset.add);});
$("#loadMore").addEventListener("click",()=>{state.page++;renderProducts();});
$("#cartOpen").addEventListener("click",openDrawer);$("#overlay").addEventListener("click",closeDrawer);document.querySelectorAll(".close-drawer").forEach(b=>b.addEventListener("click",closeDrawer));
$("#wishlistOpen").addEventListener("click",()=>{state.mode=state.mode==="favorites"?"all":"favorites";state.page=1;applyFilters();$("#produtos").scrollIntoView({behavior:"smooth"});toast(state.mode==="favorites"?"Mostrando seus favoritos":"Mostrando todos os produtos");});
$("#checkoutBtn").addEventListener("click",()=>toast("Checkout demonstrativo: nenhuma compra ou cobrança foi realizada."));
$("#themeToggle").addEventListener("click",()=>{document.body.classList.toggle("dark");const dark=document.body.classList.contains("dark");$("#themeToggle").innerHTML=`<i data-lucide="${dark?"sun":"moon"}"></i>`;localStorage.setItem("lowkey-theme",dark?"dark":"light");initIcons();});
if(localStorage.getItem("lowkey-theme")==="dark"){document.body.classList.add("dark");$("#themeToggle").innerHTML='<i data-lucide="sun"></i>';}
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("#searchInput").focus();}if(e.key==="Escape")closeDrawer();});
initIcons();renderCart();loadProducts();
