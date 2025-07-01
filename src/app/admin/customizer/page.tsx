import { populateProductData } from "@/app/customizer/handleData";
import { CreateProduct } from "./CreateProduct";
import { ResultsExplorer } from "./ResultsExplorer";
import { prisma } from "@/prisma";
import { NextSearchParams } from "@/types/schema/misc";

type Props = {
  searchParams: NextSearchParams;
};
export default async function Customizer({ searchParams }: Props) {
  const search = await searchParams;
  const page = isNaN(+`${search.page}`) ? 1 : +`${search.page}`;
  const pageSize = 5;
  const [productSettings, allProductSettings] = await prisma.$transaction([
    prisma.customProductSettings.findMany({
      include: {
        variations: {
          include: {
            views: true,
          },
        },
      },
      take: pageSize,
      skip: pageSize * (page - 1),
    }),
    prisma.customProductSettings.findMany(),
  ]);
  const populatedProducts = await populateProductData(productSettings);

  return (
    <>
      <h1>Customizable Products</h1>
      <ResultsExplorer
        productListings={populatedProducts}
        pageSize={pageSize}
        totalRecords={allProductSettings.length}
      />
      <CreateProduct />
    </>
  );
}
