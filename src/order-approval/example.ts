//receive webhook
//determine organization
//create instance of workflow for that organization (assume only one possible workflow per org for now)
//find or create user to represent purchaser
//find the organization's approver
//create access code to link the purchaser with the instance
//create access code to link the approver with the instance
//start workflow

//send email to purchaser: we have received your order, waiting for approval, here are details
//CONTINUE
//send email to approver: we have received an order; WC order num; provide approve/deny "buttons" that link to page using access code
//WAIT
//IF (approve) FROM (purchaser):
//--send email to purchaser: your order has been approved
//--CONTINUE
//--send email to some other people
//--SET (workflow status) TO (approved)
//IF (deny) FROM (purchaser):
//--send email to purchaser: your order has been denied for the following reason; provide order details
//--cancel woocommerce order
//--SET (workflow status) TO (denied

const steps = [
  {
    id: 1,
    name: "Initial purchaser email",
    action: {
      target: "purchaser",
      type: "email",
      message:
        "We have received your order. Here are the order details: {details}",
    },
    proceed: {
      immediate: {
        goto: "next",
      },
    },
  },
  {
    id: 2,
    name: "Initial approver email",
    action: {
      target: "approver",
      type: "email",
      message:
        "We have received order number {number}. Please approve or deny it here: {approve button} {deny button}",
    },
    proceed: {
      onEvents: [
        {
          type: "approve",
          from: "purchaser",
          goto: 3,
        },
        {
          type: "deny",
          from: "purchaser",
          goto: 4,
        },
      ],
    },
  },
  {
    id: 3,
    name: "Send confirmations to purchaser",
    action: {
      target: "purchaser",
      type: "email",
      message: "Your order has been approved.",
    },
    proceed: {
      immediate: {
        goto: 5,
      },
    },
  },
  {
    id: 4,
    name: "Notify purchaser of denied order",
    action: {
      target: "purchaser",
      type: "email",
      message:
        "Your order has been denied for the following reason: {reason} Your order details were: {details}",
    },
    proceed: {
      immediate: {
        goto: 6,
      },
    },
  },
  {
    id: 5,
    name: "Mark workflow as approved",
    action: {
      type: "mark workflow approved",
    },
    proceed: {
      immediate: {
        goto: "end",
      },
    },
  },
  {
    id: 6,
    name: "Mark workflow as denied",
    action: {
      type: "mark workflow denied",
    },
    proceed: {
      immediate: {
        goto: "next",
      },
    },
  },
  {
    id: 7,
    name: "Cancel WooCommerce order",
    action: {
      type: "cancel woocommerce order",
    },
    proceed: {
      immediate: {
        goto: "end",
      },
    },
  },
];
