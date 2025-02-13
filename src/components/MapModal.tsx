"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";

const PropertiesMap = dynamic(() => import("@/components/PropertiesMap"), {
  ssr: false,
});

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MapModal({ isOpen, onClose }: MapModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[95vh] max-w-none">
        <DialogHeader>
          <DialogTitle>Map</DialogTitle>
        </DialogHeader>
        <div className="w-full h-[87dvh]">
          <PropertiesMap />
        </div>
      </DialogContent>
    </Dialog>
  );
}
