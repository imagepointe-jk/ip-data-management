import { ColorDTO } from "./common";

export type DesignDTO = {
  id: number;
  designTypeId: number;
  designType: {
    id: number;
  };
  designNumber: string;
  featured: boolean;
  status: string;
  date: Date;
  priority: number;
  description: string | null;
  defaultBackgroundColorId: number;
  defaultBackgroundColor: ColorDTO;
  designSubcategories: {
    id: number;
  }[];
  designTags: {
    id: number;
  }[];
  variations: VariationDTO[];
  imageUrl: string;
};

export type VariationDTO = {
  id: number;
  colorId: number;
  color: {
    id: number;
  };
  imageUrl: string;
  designSubcategories: {
    id: number;
  }[];
  designTags: {
    id: number;
  }[];
};

export type CategoryDTO = {
  id: number;
  designTypeId: number;
  designType: {
    id: number;
    name: string;
  };
  name: string;
  designSubcategories: {
    id: number;
    name: string;
  }[];
};
