"use client";

type Props = {
  customProductId: number;
};
export function Editor({ customProductId }: Props) {
  return <h1>The id is {customProductId}</h1>;
}
