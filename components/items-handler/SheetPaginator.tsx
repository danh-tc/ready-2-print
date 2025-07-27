import "./sheet-paginator.scss";

interface SheetPaginatorProps {
  totalSheets: number;
  currentSheet: number; // zero-based index
  onChange: (index: number) => void;
}

export const SheetPaginator: React.FC<SheetPaginatorProps> = ({
  totalSheets,
  currentSheet,
  onChange,
}) => {
  if (totalSheets <= 1) return null;

  const goPrev = () => onChange(Math.max(0, currentSheet - 1));
  const goNext = () => onChange(Math.min(totalSheets - 1, currentSheet + 1));

  return (
    <div className="sheet-paginator">
      <button
        onClick={goPrev}
        disabled={currentSheet === 0}
        aria-label="Previous sheet"
      >
        ◀
      </button>
      <span>
        Sheet {currentSheet + 1} of {totalSheets}
      </span>
      <button
        onClick={goNext}
        disabled={currentSheet === totalSheets - 1}
        aria-label="Next sheet"
      >
        ▶
      </button>
    </div>
  );
};
