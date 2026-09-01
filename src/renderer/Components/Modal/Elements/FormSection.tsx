import type {ReactNode} from 'react';

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function FormSection({title, description, icon, badge, headerAction, children, className = ''}: Props) {
  return (
    <section className={`flex flex-col gap-y-2 ${className}`}>
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-x-2">
          {icon && <div className="text-accent shrink-0">{icon}</div>}
          <div className="flex items-center gap-x-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">{title}</h3>
            {badge}
          </div>
        </div>
        {headerAction}
      </div>
      {description && <p className="text-xs text-muted -mt-1 px-0.5">{description}</p>}
      <div className={'flex flex-col gap-y-3.5 rounded-3xl bg-surface-secondary p-4 transition-colors'}>{children}</div>
    </section>
  );
}
