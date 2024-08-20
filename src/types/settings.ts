export type AppSettings = {
  userApproveAnalytics: boolean | null;
  serverDisabledUntil: Date | null;
  serverEndTime: Date | null;
  activeTime: number;
  disableTime: number;
  activationKey: string | null;
  activeProject: string | null;
  userId: string | null;
  projects:
    | {
        id: string;
        name: string;
        directoryPath: string;
      }[]
    | null;
};
