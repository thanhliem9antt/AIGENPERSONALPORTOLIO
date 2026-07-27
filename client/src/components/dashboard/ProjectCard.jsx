import { ExternalLink, Github, Pencil, Trash2 } from 'lucide-react';

export default function ProjectCard({ project, onEdit, onDelete, onToggle, ...dragProps }) {
  return (
    <article className="glass cursor-grab overflow-hidden rounded-3xl" {...dragProps}>
      <div
        className="h-40 bg-gradient-to-br from-violet-500/25 to-slate-900 bg-cover bg-center"
        style={project.thumbnailUrl ? { backgroundImage: `url(${project.thumbnailUrl})` } : undefined}
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{project.title}</h3>
            <p className="mt-1 text-xs text-zinc-500">{project.status}</p>
          </div>
          <button
            onClick={onToggle}
            className={`rounded-full px-2.5 py-1 text-[11px] ${project.isFeatured ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 text-zinc-500'}`}
          >
            {project.isFeatured ? 'Nổi bật' : 'Thường'}
          </button>
        </div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-400">{project.shortDescription}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.technologies?.map((x) => (
            <span key={x} className="rounded-full bg-white/5 px-2 py-1 text-[10px]">
              {x}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          {project.demoUrl && (
            <a aria-label="Demo" href={project.demoUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={17} />
            </a>
          )}
          {project.githubUrl && (
            <a aria-label="GitHub" href={project.githubUrl} target="_blank" rel="noreferrer">
              <Github size={17} />
            </a>
          )}
          <button className="ml-auto" onClick={onEdit} aria-label="Sửa">
            <Pencil size={17} />
          </button>
          <button onClick={onDelete} className="text-red-400" aria-label="Xóa">
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
