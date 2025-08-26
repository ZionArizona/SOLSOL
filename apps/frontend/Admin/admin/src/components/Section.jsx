export default function Section({title, children}) {
  return (
    <section className="sc-section">
      <div className="sc-head">{title}</div>
      <div className="sc-body">{children}</div>
    </section>
  );
}
