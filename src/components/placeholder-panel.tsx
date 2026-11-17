type PlaceholderPanelProps = {
  title: string;
  description: string;
};

export function PlaceholderPanel({ title, description }: PlaceholderPanelProps) {
  return (
    <section className="panel">
      <h1>{title}</h1>
      <p>{description}</p>
      <p className="muted">
        This area is a navigation placeholder for a later MVP slice.
      </p>
    </section>
  );
}
