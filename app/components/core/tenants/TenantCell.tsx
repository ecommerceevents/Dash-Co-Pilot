interface Props {
  item: {
    id: string;
    name: string;
    slug: string;
  } | null;
}
export default function TenantCell({ item }: Props) {
  return (
    <div>
      {item ? (
        <a href={`/app/${item.slug}`} className="hover:underline" target="_blank" rel="noreferrer">
          <span>/app/{item.slug}</span>
        </a>
      ) : (
        <a href="/admin" className="font-medium text-theme-500 hover:underline" target="_blank" rel="noreferrer">
          <span>/admin</span>
        </a>
      )}
    </div>
  );
}
