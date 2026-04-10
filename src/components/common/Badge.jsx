/**
 * Badge — colored pill for category labels.
 * The color is dynamic (comes from the category's stored color value).
 * Background and border are derived from the color with opacity suffixes.
 */
export default function Badge({ color = '#4f8ef7', label }) {
  return (
    <span
      className="badge"
      style={{
        background: `${color}1a`,
        color: color,
        border: `1px solid ${color}33`,
      }}
    >
      <span className="badge-dot" style={{ background: color }} />
      {label}
    </span>
  )
}
