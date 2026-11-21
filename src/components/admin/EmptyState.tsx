export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="mb-4 opacity-40">{icon}</div>}
      <h3 className="font-grotesk font-bold text-black text-lg">{title}</h3>
      {description && <p className="mt-2 text-gray-500 text-sm">{description}</p>}
    </div>
  );
}
