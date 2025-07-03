import { IframeHelperProvider } from "@/components/IframeHelper/IframeHelperProvider";
import { DesignSlider } from "./DesignSlider";
import { prisma } from "@/prisma";
import { NextSearchParams } from "@/types/schema/misc";
import { sortByIdOrder } from "@/utility/misc";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: NextSearchParams;
};
export default async function Page({ params, searchParams }: Props) {
  const search = await searchParams;
  const ids = `${search.ids}`.split(",");
  const finalUrl = search["final-url"]
    ? decodeURIComponent(`${search["final-url"]}`)
    : "https://www.imagepointe.com/design-library/";
  const designs = await prisma.design.findMany({
    where: {
      id: {
        in: ids.map((id) => +id),
      },
    },
    include: {
      defaultBackgroundColor: true,
    },
  });
  const sorted = sortByIdOrder(designs, ids, (design) => `${design.id}`);

  return (
    <IframeHelperProvider>
      <DesignSlider designs={sorted} finalUrl={finalUrl} />
    </IframeHelperProvider>
  );
}
