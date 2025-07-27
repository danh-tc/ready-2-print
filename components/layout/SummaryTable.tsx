import "./summary-table.scss";
interface Props {
  paper: { width: number; height: number };
  image: { width: number; height: number };
  layout: { rows: number; cols: number; totalSlots: number };
  gap: { horizontal: number; vertical: number };
  margin: { top: number; right: number; bottom: number; left: number };
}

export const SummaryTable: React.FC<Props> = ({
  paper,
  image,
  layout,
  gap,
  margin,
}) => {
  const printedWidth =
    layout.cols * image.width + (layout.cols - 1) * gap.horizontal;
  const printedHeight =
    layout.rows * image.height + (layout.rows - 1) * gap.vertical;

  const paperArea = paper.width * paper.height;
  const printedArea = printedWidth * printedHeight;
  const usagePercent = ((printedArea / paperArea) * 100).toFixed(2);

  return (
    <table className="summary-table">
      <tbody>
        <tr>
          <td>Paper Size</td>
          <td>
            {paper.width}mm × {paper.height}mm
          </td>
        </tr>
        <tr>
          <td>Margin (T/R/B/L)</td>
          <td>
            {margin.top} / {margin.right} / {margin.bottom} / {margin.left} mm
          </td>
        </tr>
        <tr>
          <td>Gap (Vertical x Horizontal)</td>
          <td>
            {gap.vertical}mm × {gap.horizontal}mm
          </td>
        </tr>
        <tr>
          <td>Image Size</td>
          <td>
            {image.width}mm × {image.height}mm
          </td>
        </tr>
        <tr>
          <td>Grid</td>
          <td>
            {layout.rows} rows × {layout.cols} columns
          </td>
        </tr>
        <tr>
          <td>Total Slots</td>
          <td>{layout.totalSlots}</td>
        </tr>
        <tr>
          <td>Printed Area (Including gap)</td>
          <td>
            {printedWidth.toFixed(1)}mm × {printedHeight.toFixed(1)}mm
          </td>
        </tr>
        <tr>
          <td>Usage</td>
          <td>{usagePercent}% of paper area</td>
        </tr>
      </tbody>
    </table>
  );
};
