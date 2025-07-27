import "./meta-info-form.scss";

interface Props {
  value: {
    customerName: string;
    date: string;
    description: string;
  };
  onChange: (next: Props["value"]) => void;
}

export const MetaInfoForm: React.FC<Props> = ({ value, onChange }) => (
  <form className="meta-info-form">
    <h3>Meta Info</h3>
    <label>
      Customer Name
      <input
        type="text"
        value={value.customerName}
        onChange={(e) => onChange({ ...value, customerName: e.target.value })}
      />
    </label>
    <label>
      Date
      <input
        type="date"
        value={value.date}
        onChange={(e) => onChange({ ...value, date: e.target.value })}
      />
    </label>
    <label>
      Description
      <input
        type="text"
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
      />
    </label>
  </form>
);
