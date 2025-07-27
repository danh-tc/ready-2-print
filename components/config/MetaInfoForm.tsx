import "./meta-info-form.scss";

interface Props {
  value: {
    customerName: string;
    date: string;
    description: string;
  };
  onChange: (next: Props["value"]) => void;
  showMeta: boolean;
  onShowMetaChange: (next: boolean) => void;
}

export const MetaInfoForm: React.FC<Props> = ({
  value,
  onChange,
  showMeta,
  onShowMetaChange,
}) => (
  <div className="meta-info-form">
    <h3 className="meta-info-form__header">Meta Info</h3>
    <form className="meta-info-form__content">
      <label className="meta-info-form__checkbox">
        <input
          type="checkbox"
          checked={showMeta}
          onChange={(e) => onShowMetaChange(e.target.checked)}
        />
        Print metadata
      </label>
      <label className="meta-info-form__input">
        Customer Name
        <input
          type="text"
          value={value.customerName}
          onChange={(e) => onChange({ ...value, customerName: e.target.value })}
        />
      </label>
      <label className="meta-info-form__input">
        Date
        <input
          type="date"
          value={value.date}
          onChange={(e) => onChange({ ...value, date: e.target.value })}
        />
      </label>
      <label className="meta-info-form__input">
        Description
        <input
          type="text"
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </label>
    </form>
  </div>
);
