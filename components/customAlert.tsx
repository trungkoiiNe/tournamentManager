import { alert } from "@baronha/ting";

let currentAlert: any = null;

export const customAlert = (options: any, show = true) => {
  if (show) {
    currentAlert = alert(options);
  } else if (currentAlert) {
    currentAlert.close();
    currentAlert = null;
  }
};
