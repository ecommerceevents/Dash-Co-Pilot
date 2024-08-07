export default function ImageOrSvg({ className, icon, title }: { className?: string; icon?: string | null; title?: string }) {
  if (!icon) {
    return null;
  }
  return (
    <>
      {icon.startsWith("<svg") ? (
        <div dangerouslySetInnerHTML={{ __html: icon.replace("<svg", `<svg class='${className}'`) ?? "" }} />
      ) : icon.includes("http") ? (
        <img className={className} src={icon} alt={title} />
      ) : (
        <></>
      )}
    </>
  );
}
