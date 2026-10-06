import express from "express";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import {fileURLToPath} from "url";
import {MercadoPagoConfig, Preference} from "mercadopago";

dotenv.config();
const app=express(), PORT=process.env.PORT||3000;
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const DB=path.join(__dirname,"products.json");
app.use(express.json({limit:"5mb"}));
app.use(express.static(path.join(__dirname,"public")));

async function products(){return JSON.parse(await fs.readFile(DB,"utf8"))}
async function save(x){await fs.writeFile(DB,JSON.stringify(x,null,2))}
function auth(req,res,next){
  if(!process.env.ADMIN_PASSWORD || req.headers["x-admin-password"]!==process.env.ADMIN_PASSWORD)
    return res.status(401).json({error:"Não autorizado"});
  next();
}

app.get("/api/products",async(req,res)=>{
  const p=await products();
  const q=(req.query.q||"").toLowerCase();
  const cat=req.query.category||"";
  res.json(p.filter(x=>(!q||`${x.name} ${x.description} ${x.category}`.toLowerCase().includes(q))&&(!cat||x.category===cat)));
});
app.get("/api/products/:id",async(req,res)=>{
  const p=(await products()).find(x=>x.id===req.params.id);
  p?res.json(p):res.status(404).json({error:"Produto não encontrado"});
});
app.post("/api/products",auth,async(req,res)=>{
  const p=await products(), b=req.body;
  if(!b.name||Number(b.price)<0)return res.status(400).json({error:"Nome e preço obrigatórios"});
  const item={id:"p_"+Date.now(),name:String(b.name),price:Number(b.price),cost:Number(b.cost||0),stock:Number(b.stock||0),category:String(b.category||"Acessórios"),description:String(b.description||""),image:String(b.image||""),images:Array.isArray(b.images)?b.images:[],seller:"Sakura Guitars",sku:String(b.sku||""),supplier:String(b.supplier||""),supplierUrl:String(b.supplierUrl||""),shipping:String(b.shipping||"Frete calculado no checkout"),rating:Number(b.rating||5),reviews:Number(b.reviews||0),variations:Array.isArray(b.variations)?b.variations:[]};
  p.push(item);await save(p);res.json(item);
});
app.put("/api/products/:id",auth,async(req,res)=>{
  const p=await products(),i=p.findIndex(x=>x.id===req.params.id);
  if(i<0)return res.status(404).json({error:"Produto não encontrado"});
  p[i]={...p[i],...req.body,price:Number(req.body.price),cost:Number(req.body.cost||p[i].cost),stock:Number(req.body.stock)};
  await save(p);res.json(p[i]);
});
app.delete("/api/products/:id",auth,async(req,res)=>{await save((await products()).filter(x=>x.id!==req.params.id));res.json({ok:true})});

app.post("/api/create-checkout",async(req,res)=>{
  try{
    if(!process.env.MP_ACCESS_TOKEN||process.env.MP_ACCESS_TOKEN.includes("COLE_"))
      return res.status(503).json({error:"Configure MP_ACCESS_TOKEN no .env."});
    const catalog=await products(), items=Array.isArray(req.body.items)?req.body.items:[];
    const valid=items.map(i=>{
      const p=catalog.find(x=>x.id===i.id), q=Math.max(1,Math.min(99,Number(i.quantity||1)));
      if(!p||p.stock<q)throw Error(`Produto indisponível: ${i.id}`);
      return {id:p.id,title:p.name,quantity:q,unit_price:Number(p.price),currency_id:"BRL"};
    });
    if(!valid.length)return res.status(400).json({error:"Carrinho vazio"});
    const client=new MercadoPagoConfig({accessToken:process.env.MP_ACCESS_TOKEN});
    const pref=new Preference(client);
    const r=await pref.create({body:{items:valid,back_urls:{success:`${process.env.BASE_URL}/?pagamento=sucesso`,failure:`${process.env.BASE_URL}/?pagamento=falhou`,pending:`${process.env.BASE_URL}/?pagamento=pendente`},auto_return:"approved",statement_descriptor:"SAKURA GUITARS"}});
    res.json({url:r.init_point});
  }catch(e){console.error(e);res.status(500).json({error:e.message||"Erro no pagamento"})}
});

app.use((_,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log(`Sakura Guitars em http://localhost:${PORT}`));
