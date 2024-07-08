import {
  Color,
  Design,
  DesignCategory,
  DesignSubcategory,
  DesignTag,
} from "@prisma/client";

const screenPrintId = 1;
const embroideryId = 2;
const tough = "Tough";
const fist = "Fist";
const labor = "Labor";

export type SeedDesign = Omit<
  Design,
  "id" | "defaultBackgroundColorId" | "imageId" | "status"
> & {
  subcategories: string[];
  tags: string[];
  status: "Published" | "Draft";
  defaultBackgroundColor: string;
  imageUrl: string;
};

export const designs: SeedDesign[] = [
  {
    designNumber: "104",
    name: "Test Design",
    description: "Test Description",
    featured: false,
    date: new Date("12/08/2022"),
    status: "Published",
    designTypeId: screenPrintId,
    subcategories: ["Labor Day", "Strike & Negotiations"],
    defaultBackgroundColor: "Black",
    imageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2024/02/567-15.png",
    tags: [tough, fist],
  },
  {
    designNumber: "105",
    name: "Test Design",
    description: "Test Description",
    featured: true,
    date: new Date("12/08/2014"),
    status: "Published",
    designTypeId: embroideryId,
    subcategories: ["Labor Day", "Best Sellers"],
    defaultBackgroundColor: "Black",
    imageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2024/02/758-6.jpg",
    tags: [tough, fist],
  },
  {
    designNumber: "106",
    name: "Test Design",
    description: "Test Description",
    featured: true,
    date: new Date("12/08/2016"),
    status: "Draft",
    designTypeId: screenPrintId,
    subcategories: ["Labor Day", "Strike & Negotiations"],
    defaultBackgroundColor: "Black",
    imageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2024/02/758-6.jpg",
    tags: [tough, fist],
  },
  {
    designNumber: "107",
    name: "Test Design",
    description: "Test Description",
    featured: true,
    date: new Date("12/08/2018"),
    status: "Published",
    designTypeId: embroideryId,
    subcategories: ["Best Sellers", "Strike & Negotiations"],
    defaultBackgroundColor: "Black",
    imageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2024/02/758-6.jpg",
    tags: [tough, fist],
  },
];
type SeedDesignCategory = Omit<DesignCategory, "id">;
type SeedDesignSubcategory = Omit<
  DesignSubcategory,
  "id" | "designCategoryId"
> & {
  category: string;
};
type SeedDesignTag = Omit<DesignTag, "id">;
type SeedColor = Omit<Color, "id">;

export const designCategories: SeedDesignCategory[] = [
  {
    designTypeId: screenPrintId,
    name: "Quick Search",
  },
  {
    designTypeId: screenPrintId,
    name: "Event/Awareness",
  },
  {
    designTypeId: screenPrintId,
    name: "Holiday",
  },
  {
    designTypeId: embroideryId,
    name: "International Union Logos",
  },
  {
    designTypeId: embroideryId,
    name: "Inspiration Board",
  },
];

export const designSubcategories: SeedDesignSubcategory[] = [
  {
    category: "Quick Search",
    name: "New Designs",
  },
  {
    category: "Quick Search",
    name: "Best Sellers",
  },
  {
    category: "Event/Awareness",
    name: "Strike & Negotiations",
  },
  {
    category: "Holiday",
    name: "Labor Day",
  },
  {
    category: "Holiday",
    name: "St. Patrick's Day",
  },
  {
    category: "Holiday",
    name: "Veterans Day",
  },
  {
    category: "International Union Logos",
    name: "APWU",
  },
  {
    category: "International Union Logos",
    name: "BAC",
  },
];

export const designTags: SeedDesignTag[] = [
  {
    name: tough,
  },
  {
    name: fist,
  },
  {
    name: labor,
  },
];

export const colors: SeedColor[] = [
  {
    hexCode: "000000",
    name: "Black",
  },
  {
    hexCode: "cb2423",
    name: "Flag Red",
  },
  {
    hexCode: "ff6511",
    name: "Safety Orange",
  },
  {
    hexCode: "907b54",
    name: "Coyote Brown",
  },
  {
    hexCode: "625f43",
    name: "Olive Drab Green",
  },
  {
    hexCode: "46326f",
    name: "Purple",
  },
];
