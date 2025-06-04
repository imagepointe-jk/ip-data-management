"use client";

import { PageNumbers } from "./PageNumbers";

//this component should replace the old PageControls in pretty much all cases, once there's time to migrate
type Props = {
  totalPages: number;
};
export function PageNavigation({ totalPages }: Props) {
  return (
    <>
      <PageNumbers totalPages={totalPages} />
    </>
  );
}
