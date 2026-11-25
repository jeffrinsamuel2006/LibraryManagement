import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, ArrowLeftRight, LayoutDashboard, LogOut, Search, Plus, Trash2, Pencil, Bell, LibraryBig } from 'lucide-react';
import api from './api';

function Auth({ onLogin }) {
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const submit = async e => {
    e.preventDefault(); setError('');
    try {
      const { data } = await api.post(`/auth/${register ? 'register' : 'login'}`, form);
      onLogin(data);
    } catch (err) { setError(err.response?.data?.message || 'Unable to connect to server.'); }
  };
  return <div className="auth-bg"><form className="auth-card" onSubmit={submit}>
    <div className="brand-icon"><LibraryBig /></div><h1>Smart Library</h1><p className="muted">Your library, organised.</p>
    {register && <input required placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>}
    <input required type="email" placeholder="Email address" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
    <input required minLength="6" type="password" placeholder="Password (minimum 6 characters)" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
    {error && <p className="error">{error}</p>}<button className="primary full">{register?'Create account':'Log in'}</button>
    <p className="muted center">{register?'Already registered?':'New to the library?'} <button type="button" className="link" onClick={()=>{setRegister(!register);setError('')}}>{register?'Log in':'Create account'}</button></p>
  </form></div>;
}

function App() {
  const [auth, setAuth] = useState(() => {
    const token=localStorage.getItem('libraryToken'); const user=localStorage.getItem('libraryUser');
    return token ? { token, user: JSON.parse(user || '{}') } : null;
  });
  const navigate=useNavigate();
  const login=data=>{localStorage.setItem('libraryToken',data.token);localStorage.setItem('libraryUser',JSON.stringify(data.user));setAuth(data);navigate('/')};
  const logout=()=>{localStorage.removeItem('libraryToken');localStorage.removeItem('libraryUser');setAuth(null);navigate('/')};
  if(!auth) return <Auth onLogin={login}/>;
  return <div className="app-shell">
    <aside className="sidebar"><div className="logo"><LibraryBig/><span>Smart Library</span></div>
      <nav><NavItem to="/" icon={<LayoutDashboard/>}>Dashboard</NavItem><NavItem to="/books" icon={<BookOpen/>}>Books</NavItem><NavItem to="/members" icon={<Users/>}>Members</NavItem><NavItem to="/loans" icon={<ArrowLeftRight/>}>Issue & Return</NavItem><NavItem to="/notifications" icon={<Bell/>}>Notifications</NavItem></nav>
      <button className="logout" onClick={logout}><LogOut size={18}/> Log out</button>
    </aside>
    <main className="main"><header className="topbar"><div><span className="muted small">LIBRARY MANAGEMENT</span><h2>Welcome, {auth.user?.name || 'Librarian'}</h2></div><div className="avatar">{(auth.user?.name||'L')[0].toUpperCase()}</div></header>
      <Routes><Route path="/" element={<Dashboard/>}/><Route path="/books" element={<Books/>}/><Route path="/members" element={<Members/>}/><Route path="/loans" element={<Loans/>}/><Route path="/notifications" element={<Notifications/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>
    </main>
  </div>;
}
function NavItem({to,icon,children}) { return <Link className="nav-item" to={to}>{icon}{children}</Link>; }
function useLoad(url) {
  const [data,setData]=useState([]),[reload,setReload]=useState(0),[error,setError]=useState('');
  useEffect(()=>{api.get(url).then(r=>{setData(r.data);setError('')}).catch(e=>setError(e.response?.data?.message||'Could not load data.'))},[url,reload]);
  return {data,error,refresh:()=>setReload(v=>v+1)};
}
function Dashboard(){
  const {data:stats,error}=useLoad('/dashboard'); const {data:loans}=useLoad('/loans');
  const cards=[['Total books',stats.totalBooks??0,BookOpen],['Library members',stats.totalMembers??0,Users],['Books issued',stats.issuedBooks??0,ArrowLeftRight],['Overdue books',stats.overdueBooks??0,Bell]];
  const recent=loans.slice(0,5);
  return <section><PageTitle title="Dashboard" sub="Overview of your library activity."/>
    {error&&<Notice>{error}</Notice>}<div className="stats">{cards.map(([label,value,Icon])=><div className="stat" key={label}><div className="stat-icon"><Icon/></div><p>{label}</p><strong>{value}</strong></div>)}</div>
    <div className="panel"><h3>Recent transactions</h3><LoanTable loans={recent}/></div>
  </section>;
}
function PageTitle({title,sub,action}){return <div className="page-title"><div><h1>{title}</h1><p className="muted">{sub}</p></div>{action}</div>}
function Notice({children}){return <p className="notice">{children}</p>}
function Books(){
  const {data:books,error,refresh}=useLoad('/books'); const [search,setSearch]=useState(''); const [editing,setEditing]=useState(null); const [form,setForm]=useState({title:'',author:'',category:'',isbn:'',totalCopies:1}); const [message,setMessage]=useState('');
  const filtered=books.filter(b=>[b.title,b.author,b.category,b.isbn].join(' ').toLowerCase().includes(search.toLowerCase()));
  const save=async e=>{e.preventDefault();setMessage('');try{if(editing)await api.put(`/books/${editing}`,form);else await api.post('/books',form);setEditing(null);setForm({title:'',author:'',category:'',isbn:'',totalCopies:1});refresh()}catch(err){setMessage(err.response?.data?.message||'Unable to save book.')}};
  const edit=b=>{setEditing(b._id);setForm({title:b.title,author:b.author,category:b.category,isbn:b.isbn,totalCopies:b.totalCopies})};
  const remove=async id=>{if(!confirm('Delete this book?'))return;try{await api.delete(`/books/${id}`);refresh()}catch(e){setMessage(e.response?.data?.message||'Unable to delete book.')}};
  return <section><PageTitle title="Books" sub="Add, manage and discover library books."/>
    <div className="panel"><h3>{editing?'Edit book':'Add a book'}</h3><form className="form-grid" onSubmit={save}>{[['title','Book title'],['author','Author'],['category','Category'],['isbn','ISBN']].map(([k,p])=><input key={k} required placeholder={p} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}<input required type="number" min="1" placeholder="Total copies" value={form.totalCopies} onChange={e=>setForm({...form,totalCopies:e.target.value})}/><button className="primary"><Plus size={16}/>{editing?'Update book':'Add book'}</button>{editing&&<button type="button" className="secondary" onClick={()=>{setEditing(null);setForm({title:'',author:'',category:'',isbn:'',totalCopies:1})}}>Cancel</button>}</form>{message&&<Notice>{message}</Notice>}</div>
    <div className="panel"><div className="panel-head"><h3>Book catalogue ({filtered.length})</h3><div className="search"><Search size={17}/><input placeholder="Search title, author, ISBN..." value={search} onChange={e=>setSearch(e.target.value)}/></div></div>{error&&<Notice>{error}</Notice>}
    <div className="table-wrap"><table><thead><tr><th>Book</th><th>Author</th><th>Category</th><th>ISBN</th><th>Available</th><th>Actions</th></tr></thead><tbody>{filtered.map(b=><tr key={b._id}><td className="strong">{b.title}</td><td>{b.author}</td><td>{b.category}</td><td>{b.isbn}</td><td>{b.availableCopies}/{b.totalCopies}</td><td><button className="icon-btn" onClick={()=>edit(b)} title="Edit"><Pencil size={16}/></button><button className="icon-btn danger" onClick={()=>remove(b._id)} title="Delete"><Trash2 size={16}/></button></td></tr>)}</tbody></table>{filtered.length===0&&<Empty>No books found. Add your first book above.</Empty>}</div></div>
  </section>;
}
function Members(){
  const {data:members,error,refresh}=useLoad('/members');const [search,setSearch]=useState('');const [editing,setEditing]=useState(null);const empty={name:'',email:'',phone:'',department:''};const [form,setForm]=useState(empty);const [message,setMessage]=useState('');
  const filtered=members.filter(m=>[m.name,m.email,m.phone,m.department].join(' ').toLowerCase().includes(search.toLowerCase()));
  const save=async e=>{e.preventDefault();setMessage('');try{if(editing)await api.put(`/members/${editing}`,form);else await api.post('/members',form);setForm(empty);setEditing(null);refresh()}catch(err){setMessage(err.response?.data?.message||'Unable to save member.')}};
  const remove=async id=>{if(!confirm('Delete this member?'))return;try{await api.delete(`/members/${id}`);refresh()}catch(e){setMessage(e.response?.data?.message||'Unable to delete member.')}};
  return <section><PageTitle title="Members" sub="Maintain student and library member details."/>
    <div className="panel"><h3>{editing?'Edit member':'Add a member'}</h3><form className="form-grid" onSubmit={save}><input required placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input required placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><input placeholder="Department / Class" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/><button className="primary"><Plus size={16}/>{editing?'Update member':'Add member'}</button>{editing&&<button type="button" className="secondary" onClick={()=>{setEditing(null);setForm(empty)}}>Cancel</button>}</form>{message&&<Notice>{message}</Notice>}</div>
    <div className="panel"><div className="panel-head"><h3>Members ({filtered.length})</h3><div className="search"><Search size={17}/><input placeholder="Search members..." value={search} onChange={e=>setSearch(e.target.value)}/></div></div>{error&&<Notice>{error}</Notice>}<div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Department</th><th>Actions</th></tr></thead><tbody>{filtered.map(m=><tr key={m._id}><td className="strong">{m.name}</td><td>{m.email}</td><td>{m.phone}</td><td>{m.department||'—'}</td><td><button className="icon-btn" onClick={()=>{setEditing(m._id);setForm({name:m.name,email:m.email,phone:m.phone,department:m.department||''})}}><Pencil size={16}/></button><button className="icon-btn danger" onClick={()=>remove(m._id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table>{filtered.length===0&&<Empty>No members found.</Empty>}</div></div>
  </section>;
}
function Loans(){
  const {data:loans,error,refresh}=useLoad('/loans');const {data:books,refresh:refreshBooks}=useLoad('/books');const {data:members}=useLoad('/members');
  const [form,setForm]=useState({bookId:'',memberId:'',dueDate:''});const [message,setMessage]=useState('');
  const issue=async e=>{e.preventDefault();setMessage('');try{await api.post('/loans',form);setForm({bookId:'',memberId:'',dueDate:''});refresh();refreshBooks()}catch(err){setMessage(err.response?.data?.message||'Unable to issue book.')}};
  const giveBack=async id=>{try{await api.patch(`/loans/${id}/return`);refresh();refreshBooks()}catch(e){setMessage(e.response?.data?.message||'Unable to return book.')}};
  return <section><PageTitle title="Issue & Return" sub="Track borrowed books and due dates."/>
    <div className="panel"><h3>Issue a book</h3><form className="form-grid" onSubmit={issue}><select required value={form.bookId} onChange={e=>setForm({...form,bookId:e.target.value})}><option value="">Select book</option>{books.filter(b=>b.availableCopies>0).map(b=><option key={b._id} value={b._id}>{b.title} ({b.availableCopies} available)</option>)}</select><select required value={form.memberId} onChange={e=>setForm({...form,memberId:e.target.value})}><option value="">Select member</option>{members.map(m=><option key={m._id} value={m._id}>{m.name}</option>)}</select><input required type="date" min={new Date().toISOString().slice(0,10)} value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/><button className="primary"><Plus size={16}/>Issue book</button></form>{message&&<Notice>{message}</Notice>}</div>
    <div className="panel"><h3>Transaction history</h3>{error&&<Notice>{error}</Notice>}<LoanTable loans={loans} onReturn={giveBack}/></div>
  </section>;
}
function LoanTable({loans,onReturn}){
  return <div className="table-wrap"><table><thead><tr><th>Book</th><th>Member</th><th>Issue date</th><th>Due date</th><th>Status</th>{onReturn&&<th>Action</th>}</tr></thead><tbody>{loans.map(l=>{const overdue=l.status==='Issued'&&new Date(l.dueDate)<new Date();return <tr key={l._id}><td className="strong">{l.book?.title||'Deleted book'}</td><td>{l.member?.name||'Deleted member'}</td><td>{new Date(l.issueDate).toLocaleDateString()}</td><td>{new Date(l.dueDate).toLocaleDateString()}</td><td><span className={`pill ${l.status==='Returned'?'green':overdue?'red':'blue'}`}>{l.status==='Returned'?'Returned':overdue?'Overdue':'Issued'}</span></td>{onReturn&&<td>{l.status==='Issued'&&<button className="small-btn" onClick={()=>onReturn(l._id)}>Return</button>}</td>}</tr>})}</tbody></table>{loans.length===0&&<Empty>No transactions yet.</Empty>}</div>;
}
function Notifications(){
  const {data:loans,error}=useLoad('/loans');const {data:books}=useLoad('/books');
  const overdue=loans.filter(l=>l.status==='Issued'&&new Date(l.dueDate)<new Date());
  const arrivals=books.slice(0,5);
  return <section><PageTitle title="Notifications" sub="Overdue reminders and recently added books."/>
    {error&&<Notice>{error}</Notice>}<div className="panel"><h3><Bell size={18}/> Overdue reminders ({overdue.length})</h3>{overdue.length?overdue.map(l=><div className="notice-row" key={l._id}><div><b>{l.book?.title}</b><p className="muted">Borrowed by {l.member?.name} · Due {new Date(l.dueDate).toLocaleDateString()}</p></div><span className="pill red">Overdue</span></div>):<Empty>No overdue books. Great work!</Empty>}</div>
    <div className="panel"><h3><BookOpen size={18}/> New arrivals</h3>{arrivals.length?arrivals.map(b=><div className="notice-row" key={b._id}><div><b>{b.title}</b><p className="muted">{b.author} · {b.category}</p></div><span className="pill green">New book</span></div>):<Empty>No books added yet.</Empty>}</div>
  </section>;
}
function Empty({children}){return <div className="empty">{children}</div>}
export default App;
