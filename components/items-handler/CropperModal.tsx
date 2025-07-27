import { useRef, useEffect } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "./cropper-modal.scss";
import { CropSettings } from "@/types/types";

interface CropperModalProps {
  src: string;
  aspectRatio: number | undefined;
  initialCrop?: CropSettings;
  onCancel: () => void;
  onCrop: (crop: { dataUrl: string; cropSettings: CropSettings }) => void;
}

export const CropperModal: React.FC<CropperModalProps> = ({
  src,
  aspectRatio,
  initialCrop,
  onCancel,
  onCrop,
}) => {
  const cropperRef = useRef<ReactCropperElement>(null);

  useEffect(() => {
    if (initialCrop && cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.setData(initialCrop);
    }
  }, [initialCrop, src]);

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    const cropSettings = cropper.getData(true) as CropSettings;
    const dataUrl = cropper.getCroppedCanvas().toDataURL();
    onCrop({ dataUrl, cropSettings });
  };
  debugger
  return (
    <div className="cropper-modal">
      <div className="cropper-modal__backdrop" onClick={onCancel} />
      <div className="cropper-modal__body">
        <div className="cropper-modal__cropper">
          <Cropper
            src={src}
            style={{ height: 370, width: "100%" }}
            aspectRatio={aspectRatio}
            guides={true}
            viewMode={1}
            background={false}
            responsive={true}
            autoCropArea={1}
            checkOrientation={false}
            ref={cropperRef}
          />
        </div>
        <div className="cropper-modal__toolbar">
          {/* Add rotate, flip, etc. here if you want */}
        </div>
        <div className="cropper-modal__actions">
          <button
            onClick={onCancel}
            className="cropper-modal__btn cropper-modal__btn--cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="cropper-modal__btn cropper-modal__btn--confirm"
          >
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
};
