import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Point, Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import getCroppedImg from "@/lib/utils/imageCrop";
import { useLanguage } from "@/i18n/LanguageContext";

interface ImageCropperProps {
  image: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (croppedImage: Blob) => void;
  aspectRatio?: number;
}

const ImageCropper = ({
  image,
  open,
  onOpenChange,
  onCropComplete,
  aspectRatio = 1,
}: ImageCropperProps) => {
  const { t } = useLanguage();
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (crop: Point) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropAreaComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      if (!croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
        onOpenChange(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{t("providerProfile.edit") || "Crop Image"}</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full h-[400px] mt-4 bg-muted">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onCropComplete={onCropAreaComplete}
            onZoomChange={onZoomChange}
            cropShape="round"
            showGrid={false}
          />
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <span className="text-sm font-medium">Zoom</span>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
            />
          </div>
          
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              {t("providerProfile.cancel")}
            </Button>
            <Button onClick={handleSave} className="rounded-xl">
              {t("providerProfile.saveChanges") || "Save Crop"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
