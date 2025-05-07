import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { waitForMs } from "@/utility/misc";
import {
  OrderWorkflow,
  OrderWorkflowInstance,
  OrderWorkflowStep,
  OrderWorkflowStepProceedListener,
  OrderWorkflowUser,
  Webstore,
  WebstoreCheckoutField,
  WebstoreUserRole,
} from "@prisma/client";

//using this data temporarily until i can get database access again
const TEMP_WEBSTORE: Webstore & {
  approvalDashboardViewerEmail: string;
  roles: (WebstoreUserRole & { users: OrderWorkflowUser[] })[];
  checkoutFields: WebstoreCheckoutField[];
  workflows: (OrderWorkflow & {
    instances: OrderWorkflowInstance[];
    steps: (OrderWorkflowStep & {
      proceedListeners: OrderWorkflowStepProceedListener[];
    })[];
  })[];
} = {
  id: 42,
  approvalDashboardViewerEmail: "dev.jose.smith@gmail.com",
  apiKey: process.env.TEMP_API_KEY_ENCRYPTED!,
  apiKeyEncryptIv: process.env.TEMP_API_KEY_ENCRYPT_IV!,
  apiKeyEncryptTag: process.env.TEMP_API_KEY_ENCRYPT_TAG!,
  apiSecret: process.env.TEMP_API_SECRET_ENCRYPTED!,
  apiSecretEncryptIv: process.env.TEMP_API_SECRET_ENCRYPT_IV!,
  apiSecretEncryptTag: process.env.TEMP_API_SECRET_ENCRYPT_TAG!,
  customOrderApprovedEmail: "",
  name: "Test Webstore",
  orderUpdatedEmails: "",
  organizationName: "Test Org",
  otherSupportEmails: "",
  salesPersonEmail: "",
  salesPersonName: "",
  shippingEmailFilename: "",
  url: "https://shippingteststore.unionwebstores.com/",
  useCustomOrderApprovedEmail: false,
  checkoutFields: [
    {
      id: 1,
      name: "budget_codes",
      label: "Budget Codes",
      options: "",
      type: "select",
      webstoreId: 42,
    },
    {
      id: 2,
      name: "purchase_order",
      label: "PO Number",
      options: "",
      type: "text",
      webstoreId: 42,
    },
  ],
  roles: [
    {
      id: 1,
      name: "Approver",
      webstoreId: 42,
      users: [
        {
          id: 1,
          email: "dev.rebecca.west@gmail.com",
          name: "Rebecca West",
        },
      ],
    },
    {
      id: 2,
      name: "Releaser",
      webstoreId: 42,
      users: [
        {
          id: 2,
          email: "dev.jose.smith@gmail.com",
          name: "Jose Smith",
        },
      ],
    },
  ],
  workflows: [
    {
      id: 1,
      name: "Test Workflow",
      webstoreId: 42,
      steps: [
        {
          id: 1,
          name: "Test Step 1",
          actionMessage: "",
          actionSubject: "",
          actionTarget: "approver",
          actionType: "",
          order: 0,
          otherActionTargets: "",
          proceedImmediatelyTo: null,
          workflowId: 1,
          proceedListeners: [
            {
              id: 1,
              from: "approver",
              goto: "",
              name: "Approver approves",
              stepId: 1,
              type: "approve",
            },
            {
              id: 2,
              from: "approver",
              goto: "",
              name: "Approver denies",
              stepId: 1,
              type: "deny",
            },
          ],
        },
        {
          id: 2,
          name: "Test Step 2",
          actionMessage: "",
          actionSubject: "",
          actionTarget: "dev.jose.smith@gmail.com",
          actionType: "",
          order: 1,
          otherActionTargets: "",
          proceedImmediatelyTo: null,
          workflowId: 1,
          proceedListeners: [
            {
              id: 3,
              from: "dev.jose.smith@gmail.com",
              goto: "",
              name: "Jose approves",
              stepId: 2,
              type: "approve",
            },
            {
              id: 4,
              from: "dev.jose.smith@gmail.com",
              goto: "",
              name: "Jose denies",
              stepId: 2,
              type: "deny",
            },
          ],
        },
      ],

      instances: [
        {
          id: 1,
          approvedByUserEmail: "",
          approvedComments: "",
          createdAt: new Date(),
          currentStep: 0,
          deniedByUserEmail: "",
          deniedReason: "",
          lastStartedAt: new Date(),
          parentWorkflowId: 1,
          purchaserEmail: "john.doe@example.com",
          purchaserName: "John Doe",
          status: "waiting",
          wooCommerceOrderId: 352,
        },
        {
          id: 2,
          approvedByUserEmail: "",
          approvedComments: "",
          createdAt: new Date(),
          currentStep: 1,
          deniedByUserEmail: "",
          deniedReason: "",
          lastStartedAt: new Date(),
          parentWorkflowId: 1,
          purchaserEmail: "jane.doe@example.com",
          purchaserName: "Jane Doe",
          status: "waiting",
          wooCommerceOrderId: 350,
        },
        {
          id: 3,
          approvedByUserEmail: "",
          approvedComments: "",
          createdAt: new Date(),
          currentStep: 1,
          deniedByUserEmail: "",
          deniedReason: "",
          lastStartedAt: new Date(),
          parentWorkflowId: 1,
          purchaserEmail: "john.doe@example.com",
          purchaserName: "John Doe",
          status: "waiting",
          wooCommerceOrderId: 348,
        },
      ],
    },
  ],
};

const TEMP_ORDERS: WooCommerceOrder[] = [
  {
    id: 348,
    customerNote: "test comment test comment",
    dateCreated: new Date(),
    feeLines: [],
    lineItems: [
      {
        id: 1,
        name: "Test Product 1",
        price: 12.34,
        productId: 123,
        quantity: 13,
        total: "123.45",
        totalTax: "1.23",
      },
      {
        id: 2,
        name: "Test Product 2",
        price: 56.78,
        productId: 123,
        quantity: 42,
        total: "987.65",
        totalTax: "1.23",
      },
    ],
    metaData: [
      {
        id: 1,
        key: "purchase_order",
        value: "PO 123",
      },
      {
        id: 2,
        key: "budget_codes",
        value: "Budget 456",
      },
    ],
    shipping: {
      firstName: "John",
      lastName: "Doe",
      address1: "123 Main St.",
      address2: "",
      city: "Bigtown",
      company: "Test Company",
      country: "US",
      postcode: "12345",
      state: "IA",
    },
    shippingLines: [],
    shippingTotal: "12.34",
    subtotal: "98.76",
    total: "12.34",
    totalTax: "1.23",
  },
  {
    id: 350,
    customerNote: "test comment test comment",
    dateCreated: new Date(),
    feeLines: [],
    lineItems: [
      {
        id: 1,
        name: "Test Product 1",
        price: 12.34,
        productId: 123,
        quantity: 13,
        total: "123.45",
        totalTax: "1.23",
      },
      {
        id: 2,
        name: "Test Product 2",
        price: 56.78,
        productId: 123,
        quantity: 42,
        total: "987.65",
        totalTax: "1.23",
      },
    ],
    metaData: [
      {
        id: 1,
        key: "purchase_order",
        value: "PO 123",
      },
      {
        id: 2,
        key: "budget_codes",
        value: "Budget 456",
      },
    ],
    shipping: {
      firstName: "John",
      lastName: "Doe",
      address1: "123 Main St.",
      address2: "",
      city: "Bigtown",
      company: "Test Company",
      country: "US",
      postcode: "12345",
      state: "IA",
    },
    shippingLines: [],
    shippingTotal: "12.34",
    subtotal: "98.76",
    total: "12.34",
    totalTax: "1.23",
  },
  {
    id: 352,
    customerNote: "test comment test comment",
    dateCreated: new Date(),
    feeLines: [],
    lineItems: [
      {
        id: 1,
        name: "Test Product 1",
        price: 12.34,
        productId: 123,
        quantity: 13,
        total: "123.45",
        totalTax: "1.23",
      },
      {
        id: 2,
        name: "Test Product 2",
        price: 56.78,
        productId: 123,
        quantity: 42,
        total: "987.65",
        totalTax: "1.23",
      },
    ],
    metaData: [
      {
        id: 1,
        key: "purchase_order",
        value: "PO 123",
      },
      {
        id: 2,
        key: "budget_codes",
        value: "Budget 456",
      },
      {
        id: 3,
        key: "approver",
        value: "dev.rebecca.west@gmail.com",
      },
    ],
    shipping: {
      firstName: "John",
      lastName: "Doe",
      address1: "123 Main St.",
      address2: "",
      city: "Bigtown",
      company: "Test Company",
      country: "US",
      postcode: "12345",
      state: "IA",
    },
    shippingLines: [],
    shippingTotal: "12.34",
    subtotal: "98.76",
    total: "12.34",
    totalTax: "1.23",
  },
];

export async function TEMP_getWebstore(id: number) {
  if (id !== TEMP_WEBSTORE.id) return null;
  return TEMP_WEBSTORE;
}

export async function TEMP_getOrder(id: number) {
  await waitForMs(2000);
  return TEMP_ORDERS.find((order) => order.id === id);
}
