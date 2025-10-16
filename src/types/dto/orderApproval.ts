export type CheckoutFieldDTO = {
  id: number;
  name: string;
  label: string;
  type: string;
  options: string | null;
  order: number;
  style: string | null;
  userCanEdit: boolean;
};

export type WebstoreEditorData = {
  id: number;
  name: string;
  organizationName: string;
  url: string;
  salesPersonName: string;
  salesPersonEmail: string;
  otherSupportEmails: string | null;
  orderUpdatedEmails: string | null;
  notifyUpdaterOnOrderUpdate: boolean;
  reminderEmailTargets: string | null;
  sendReminderEmails: boolean;
  shippingEmailFilename: string;
  checkoutFields: CheckoutFieldDTO[];
  shippingSettings: {
    allowApproverChangeMethod: boolean;
    allowUpsToCanada: boolean;
  } | null;
  shippingMethods: {
    id: number;
  }[];
  approverDashboardViewerEmail: string;
  requirePinForApproval: boolean;
  allowOrderHelpRequest: boolean;
  autoCreateApprover: boolean;
  shippingEmailDestOverride: string | null;
};

export type WorkflowInstanceDTO = {
  id: number;
  status: string;
  wooCommerceOrderId: number;
  currentStep: number;
  createdAt: Date;
  lastStartedAt: Date;
};

export type StepDTO = {
  id: number;
  name: string;
  order: number;
  actionType: string;
  actionTarget: string | null;
  actionSubject: string | null;
  actionMessage: string | null;
  otherActionTargets: string | null;
  proceedImmediatelyTo: string | null;
};

export type ProceedListenerDTO = {
  id: number;
  name: string;
  type: string;
  from: string;
  goto: string;
};

export type WebstoreDataFull = WebstoreEditorData & {
  roles: {
    users: {
      id: number;
      name: string;
      email: string;
    }[];
  }[];
  workflows: {
    instances: WorkflowInstanceDTO[];
  }[];
};

export type WorkflowDataFull = {
  id: number;
  webstore: WebstoreDataFull;
  steps: {
    proceedListeners: ProceedListenerDTO[];
  }[];
};

export type WorkflowEditorData = {
  id: number;
  name: string;
  webstore: {
    id: number;
    roles: {
      users: {
        id: number;
        name: string;
        email: string;
      }[];
    }[];
  };
  steps: (StepDTO & {
    display: {
      positionX: number;
      positionY: number;
    } | null;
    proceedListeners: ProceedListenerDTO[];
  })[];
  firstStep: StepDTO | null;
  instances: {}[];
};

export type WebstoreLogDTO = {
  id: number;
  text: string;
  severity: string;
  event: string | null;
  createdAt: Date;
};
