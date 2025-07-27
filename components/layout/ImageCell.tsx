import "./image-cell.scss";

interface Props {
  width: number; // px
  height: number; // px
  children?: React.ReactNode;
}

export const ImageCell: React.FC<Props> = ({ width, height, children }) => (
  <div
    className="image-cell"
    style={{
      width,
      height,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);
