//we have to do exact string matching because we're relying on the string we get back from woocommerce to determine what shipping was chosen for the order.
export const upsShippingCodes: { exactString: string; code: string }[] = [
  //domestic
  {
    exactString: "UPS 3-Day Select®",
    code: "12",
  },
  {
    exactString: "UPS® Ground",
    code: "03",
  },
  {
    exactString: "UPS 2nd Day Air®",
    code: "02",
  },
  {
    exactString: "UPS Next Day Air®",
    code: "01",
  },
  //intl
  {
    exactString: "UPS Worldwide Express™",
    code: "07",
  },
  {
    exactString: "UPS Worldwide Express Plus™",
    code: "54",
  },
  {
    exactString: "UPS Worldwide Expedited",
    code: "08",
  },
  {
    exactString: "UPS Worldwide Saver",
    code: "65",
  },
];
