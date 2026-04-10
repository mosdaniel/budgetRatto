import { useBudgetStore } from '../store/budgetStore'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { FileText, Download } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/format'


export default function Reportes() {
  const { gastos, presupuesto } = useBudgetStore()

  const monedaCodigo     = presupuesto?.moneda_codigo ?? 'MXN'
  const fmt              = (amount, dec = 2) => formatCurrency(amount, monedaCodigo, dec)
  const presupuestoTotal = presupuesto?.monto_total ?? 0
  const totalGastado     = gastos.reduce((s, g) => s + g.monto, 0)
  const saldo            = presupuestoTotal - totalGastado
  const porcentaje       = presupuestoTotal > 0
    ? ((totalGastado / presupuestoTotal) * 100).toFixed(1)
    : '0'

  // ── CSV Export ───────────────────────────────────────────────
  const exportarCSV = () => {
    const headers = ['#', 'Concepto', 'Categoría', 'Monto', '% del Presupuesto', 'Fecha']
    const rows = gastos.map((g, i) => [
      i + 1,
      g.nombre,
      g.categoria_nombre ?? 'Sin categoría',
      g.monto.toFixed(2),
      presupuestoTotal > 0
        ? `${((g.monto / presupuestoTotal) * 100).toFixed(1)}%`
        : '—',
      formatDate(g.creado_en),
    ])
    rows.push(['', 'TOTAL', '', totalGastado.toFixed(2), `${porcentaje}%`, ''])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(','))
      .join('\n')

    // BOM prefix ensures Excel reads UTF-8 correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `reporte-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── PDF Export ───────────────────────────────────────────────
  const exportarPDF = async () => {
    const { default: jsPDF }    = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc  = new jsPDF()
    const fecha = new Date().toLocaleDateString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric',
    })

    // Header band
    doc.setFillColor(25, 25, 25)
    doc.rect(0, 0, 210, 44, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Budget Manager', 14, 20)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(155, 155, 155)
    doc.text('Reporte de Gastos', 14, 30)
    doc.text(`Generado: ${fecha}`, 14, 37)

    // Summary section
    doc.setTextColor(30, 30, 30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumen del período', 14, 56)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const summaryRows = [
      ['Presupuesto total mensual', fmt(presupuestoTotal)],
      ['Total gastado',             fmt(totalGastado)],
      ['Saldo disponible',          fmt(saldo)],
      ['Porcentaje consumido',      `${porcentaje}%`],
    ]
    let y = 64
    summaryRows.forEach(([label, val]) => {
      doc.setTextColor(100, 100, 100)
      doc.text(label + ':', 14, y)
      doc.setTextColor(30, 30, 30)
      doc.setFont('helvetica', 'bold')
      doc.text(val, 90, y)
      doc.setFont('helvetica', 'normal')
      y += 7
    })

    // Detail table
    autoTable(doc, {
      startY: y + 6,
      head: [['#', 'Concepto', 'Categoría', 'Monto', '% Pres.', 'Fecha']],
      body: gastos.map((g, i) => [
        i + 1,
        g.nombre,
        g.categoria_nombre ?? 'Sin categoría',
        fmt(g.monto),
        presupuestoTotal > 0
          ? `${((g.monto / presupuestoTotal) * 100).toFixed(1)}%`
          : '—',
        formatDate(g.creado_en),
      ]),
      foot: [['', 'TOTAL', '', fmt(totalGastado), `${porcentaje}%`, '']],
      headStyles: {
        fillColor: [31, 31, 31],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      margin: { left: 14, right: 14 },
      columnStyles: { 0: { cellWidth: 10 }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    })

    doc.save(`reporte-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const summaryCards = [
    { label: 'Presupuesto total',  value: fmt(presupuestoTotal), color: '#4f8ef7' },
    { label: 'Total gastado',      value: fmt(totalGastado),     color: '#ef4444' },
    { label: 'Saldo disponible',   value: fmt(saldo),            color: saldo < 0 ? '#ef4444' : '#10b981' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reportes</h1>
          <p className="page-subtitle">Exporta y analiza tus gastos del período</p>
        </div>
        <div className="flex gap-sm">
          <Button id="btn-exportar-csv" variant="ghost" onClick={exportarCSV} disabled={gastos.length === 0}>
            <Download size={15} />
            Exportar CSV
          </Button>
          <Button id="btn-exportar-pdf" variant="primary" onClick={exportarPDF} disabled={gastos.length === 0}>
            <FileText size={15} />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-md)', marginBottom: 'var(--sp-xl)' }}>
        {summaryCards.map(({ label, value, color }) => (
          <Card key={label}>
            <div className="card-accent-line" style={{ background: color }} />
            <div className="card-label" style={{ marginBottom: 'var(--sp-sm)' }}>{label}</div>
            <div className="card-value card-value--md" style={{ color }}>{value}</div>
          </Card>
        ))}
      </div>

      {/* Detail table */}
      <Card>
        <div className="card-header" style={{ marginBottom: 'var(--sp-md)' }}>
          <span className="card-title">Detalle de gastos</span>
          <span className="text-secondary text-sm">
            {gastos.length} registro{gastos.length !== 1 ? 's' : ''}
          </span>
        </div>

        {gastos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">📄</div>
            <div className="empty-state-text">No hay gastos registrados para reportar.</div>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>#</th>
                  <th>Concepto</th>
                  <th>Categoría</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                  <th style={{ textAlign: 'right' }}>% Presupuesto</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((g, index) => (
                  <tr key={g.id}>
                    <td className="text-tertiary text-sm">{index + 1}</td>
                    <td style={{ fontWeight: 500 }}>{g.nombre}</td>
                    <td>
                      {g.categoria_nombre ? (
                        <Badge color={g.categoria_color} label={g.categoria_nombre} />
                      ) : (
                        <span className="text-secondary text-sm">Sin categoría</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {fmt(g.monto)}
                    </td>
                    <td style={{ textAlign: 'right' }} className="text-tertiary text-sm">
                      {presupuestoTotal > 0
                        ? `${((g.monto / presupuestoTotal) * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                    <td className="text-secondary text-sm">{formatDate(g.creado_en)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  <td colSpan={2}>TOTAL</td>
                  <td style={{ textAlign: 'right' }}>{fmt(totalGastado)}</td>
                  <td style={{ textAlign: 'right' }}>{porcentaje}%</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
