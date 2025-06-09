import { IframeHelperProvider } from "@/components/IframeHelper/IframeHelperProvider";
import { DesignSlider } from "./DesignSlider";
import { prisma } from "@/prisma";
import { NextSearchParams } from "@/types/schema/misc";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: NextSearchParams;
};
export default async function Page({ params, searchParams }: Props) {
  const search = await searchParams;
  const ids = `${search.ids}`.split(",").map((id) => +id);
  const designs = await prisma.design.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      defaultBackgroundColor: true,
    },
  });

  return (
    <IframeHelperProvider>
      <DesignSlider designs={designs} />
    </IframeHelperProvider>
  );
}
