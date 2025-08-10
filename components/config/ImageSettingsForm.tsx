"use client";
import "./image-settings-form.scss";

interface Props {
  value: { width: number; height: number };
  onChange: (next: Props["value"]) => void;
}

export const ImageSettingsForm: React.FC<Props> = ({ value, onChange }) => (
  <form className="rethink-image-settings-form">
    <div className="rethink-image-settings-form__dimensions">
      <label>
        Width (mm)
        <input
          className="rethink-input"
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
          className="rethink-input"
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
