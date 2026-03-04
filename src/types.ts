export interface PalletData {
  containerId: string;
  quantity: number;
  boxes: number;
  weight: number;
  description: string;
  palletId: string;
  originalRow: number;
}

export interface ContainerGroup {
  containerId: string;
  pallets: PalletData[];
  totalQuantity: number;
  totalBoxes: number;
  totalWeight: number;
}
