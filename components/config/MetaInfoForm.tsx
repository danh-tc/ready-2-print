"use client";

import type { MetaInfo, MetaStyle } from "@/store/useImpositionStore";
import { DEFAULT_META_STYLE } from "@/store/useImpositionStore";
import "./meta-info-form.scss";

interface Props {
  value: MetaInfo;
  onChange: (next: MetaInfo) => void;
  displayMeta: boolean;
  onDisplayMetaChange: (next: boolean) => void;
  metaStyle: MetaStyle;
  onMetaStyleChange: (next: MetaStyle) => void;
}

export const MetaInfoForm: React.FC<Props> = ({
  value,
  onChange,
  displayMeta,
  onDisplayMetaChange,
  metaStyle,
  onMetaStyleChange,
}) => (
  <div className={`rethink-meta-info-form${displayMeta ? "" : " rethink-meta-info-form--muted"}`}>
    <form className="rethink-meta-info-form__content">

      {/* Toggle metadata on/off */}
      <label className="rethink-meta-info-form__checkbox">
        <input
          type="checkbox"
          checked={displayMeta}
          onChange={(e) => onDisplayMetaChange(e.target.checked)}
          aria-label="Toggle printing metadata"
        />
        <span>Print metadata</span>
      </label>

      {/* Customer name */}
      <label className="rethink-meta-info-form__field">
        <span>Customer Name</span>
        <input
          className="rethink-input"
          type="text"
          value={value.customerName}
          onChange={(e) => onChange({ ...value, customerName: e.target.value })}
          disabled={!displayMeta}
        />
      </label>

      {/* Date */}
      <label className="rethink-meta-info-form__field">
        <span>Date</span>
        <input
          className="rethink-input"
          type="date"
          value={value.date}
          onChange={(e) => onChange({ ...value, date: e.target.value })}
          disabled={!displayMeta}
        />
      </label>

      {/* Description */}
      <label className="rethink-meta-info-form__field rethink-meta-info-form__field--wide">
        <span>Description</span>
        <input
          className="rethink-input"
          type="text"
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          disabled={!displayMeta}
          placeholder="Notes…"
        />
      </label>

      {/* Custom position section — only when meta is on */}
      {displayMeta && (
        <>
          <div className="rethink-meta-info-form__divider" />

          <label className="rethink-meta-info-form__checkbox">
            <input
              type="checkbox"
              checked={metaStyle.customPosition}
              onChange={(e) =>
                onMetaStyleChange({ ...metaStyle, customPosition: e.target.checked })
              }
            />
            <span>Custom position &amp; font size</span>
          </label>

          {metaStyle.customPosition && (
            <>
              <label className="rethink-meta-info-form__field rethink-meta-info-form__field--sm">
                <span>X (mm)</span>
                <input
                  className="rethink-input"
                  type="number"
                  step="0.5"
                  min="0"
                  value={metaStyle.x}
                  onChange={(e) =>
                    onMetaStyleChange({
                      ...metaStyle,
                      x: Number(e.target.value) || DEFAULT_META_STYLE.x,
                    })
                  }
                />
              </label>

              <label className="rethink-meta-info-form__field rethink-meta-info-form__field--sm">
                <span>Y (mm)</span>
                <input
                  className="rethink-input"
                  type="number"
                  step="0.5"
                  min="0"
                  value={metaStyle.y}
                  onChange={(e) =>
                    onMetaStyleChange({
                      ...metaStyle,
                      y: Number(e.target.value) || DEFAULT_META_STYLE.y,
                    })
                  }
                />
              </label>

              <label className="rethink-meta-info-form__field rethink-meta-info-form__field--sm">
                <span>Font size (pt)</span>
                <input
                  className="rethink-input"
                  type="number"
                  step="1"
                  min="6"
                  max="72"
                  value={metaStyle.fontSize}
                  onChange={(e) =>
                    onMetaStyleChange({
                      ...metaStyle,
                      fontSize: Number(e.target.value) || DEFAULT_META_STYLE.fontSize,
                    })
                  }
                />
              </label>
            </>
          )}
        </>
      )}
    </form>
  </div>
);
