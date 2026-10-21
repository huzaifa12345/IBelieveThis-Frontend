/** Render product descriptions with line breaks, bullets, and small headings. */
const ProductDescription = ({ text, className = 'description-text' }) => {
  if (!text) return null;

  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let list = [];

  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="desc-list">
        {list.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
    list = [];
  };

  lines.forEach((raw) => {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }
    if (/^[-•*]\s+/.test(trimmed)) {
      list.push(trimmed.replace(/^[-•*]\s+/, ''));
      return;
    }
    flushList();
    if (/:$/.test(trimmed) && trimmed.length < 80) {
      blocks.push(
        <h4 key={`h-${blocks.length}`} className="desc-heading">
          {trimmed}
        </h4>
      );
    } else {
      blocks.push(
        <p key={`p-${blocks.length}`} className="desc-para">
          {trimmed}
        </p>
      );
    }
  });
  flushList();

  return (
    <div className={className} style={{ whiteSpace: 'normal' }}>
      {blocks}
    </div>
  );
};

export default ProductDescription;
