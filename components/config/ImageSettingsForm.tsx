import "./image-settings-form.scss";

interface Props {
  value: { width: number; height: number };
  onChange: (next: Props["value"]) => void;
}

export const ImageSettingsForm: React.FC<Props> = ({ value, onChange }) => (
  <form className="image-settings-form">
    <h3 className="image-settings-form__header">Image Settings</h3>
    <div className="image-settings-form__dimensions">
      <label>
        Width (mm)
        <input
          type="number"
          value={value.width}
          onChange={(e) =>
            onChange({ ...value, width: Number(e.target.value) })
          }
        />
      </label>
      <label>
        Height (mm)
        <input
          type="number"
          value={value.height}
          onChange={(e) =>
            onChange({ ...value, height: Number(e.target.value) })
          }
        />
      </label>
    </div>
  </form>
);
