import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../../api/axiosClient';
import ProjectCard from '../../components/dashboard/ProjectCard';
import ProjectForm from '../../components/forms/ProjectForm';
import { Button, EmptyState, ErrorState, LoadingSpinner, Modal } from '../../components/common/UI';
import useResource from '../../hooks/useResource';
import { useToast } from '../../contexts/ToastContext';

const empty={title:'',shortDescription:'',description:'',technologies:[],demoUrl:'',githubUrl:'',status:'Đang phát triển',isFeatured:false,isVisible:true};
export default function ProjectsPage(){
  const {data:items,setData:setItems,loading,error,reload}=useResource('/projects');const [form,setForm]=useState(null);const [drag,setDrag]=useState(null);const fileRef=useRef();const {notify}=useToast();
  const save=async(e)=>{e.preventDefault();try{let item;if(form._id){({data:{item}}=await api.put(`/projects/${form._id}`,form))}else{({data:{item}}=await api.post('/projects',form))}if(form.file){const body=new FormData();body.append('image',form.file);({data:{item}}=await api.post(`/projects/${item._id}/thumbnail`,body))}setItems(form._id?items.map(x=>x._id===item._id?item:x):[...items,item]);setForm(null);notify('Đã lưu dự án')}catch(err){notify(err.response?.data?.message||'Không thể lưu dự án','error')}};
  const remove=async(id)=>{if(!confirm('Xóa dự án này?'))return;await api.delete(`/projects/${id}`);setItems(items.filter(x=>x._id!==id));notify('Đã xóa dự án')};
  const drop=async(target)=>{if(drag===null||drag===target)return;const next=[...items];const [moved]=next.splice(drag,1);next.splice(target,0,moved);setItems(next);setDrag(null);await api.put('/projects/reorder',{ids:next.map(x=>x._id)});notify('Đã đổi thứ tự dự án')};
  if(loading)return <LoadingSpinner/>;
  if(error)return <ErrorState message={error.response?.data?.message} onRetry={reload}/>;
  return <section><div className="flex items-end justify-between"><div><p className="eyebrow">Portfolio</p><h1 className="mt-2 text-3xl font-semibold">Dự án</h1></div><Button onClick={()=>setForm(empty)}><Plus size={16}/>Thêm dự án</Button></div><p className="mt-3 text-xs text-zinc-600">Kéo thả thẻ để thay đổi thứ tự hiển thị.</p><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.length?items.map((item,index)=><ProjectCard draggable onDragStart={()=>setDrag(index)} onDragOver={(e)=>e.preventDefault()} onDrop={()=>drop(index)} key={item._id} project={item} onEdit={()=>setForm(item)} onDelete={()=>remove(item._id)} onToggle={async()=>{const {data}=await api.put(`/projects/${item._id}`,{isFeatured:!item.isFeatured});setItems(items.map(x=>x._id===item._id?data.item:x))}}/>):<div className="md:col-span-2 xl:col-span-3"><EmptyState title="Chưa có dự án" description="Trưng bày những sản phẩm bạn tự hào nhất."/></div>}</div><Modal open={!!form} title={form?._id?'Sửa dự án':'Thêm dự án'} onClose={()=>setForm(null)}>{form&&<><ProjectForm form={form} setForm={setForm} onSubmit={save}/><input ref={fileRef} type="file" accept="image/*" className="mt-4 text-sm text-zinc-400" onChange={(e)=>setForm({...form,file:e.target.files[0]})}/></>}</Modal></section>;
}
