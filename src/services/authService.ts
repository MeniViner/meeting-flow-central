export interface CurrentUser {
  spsClaimId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  employeeId: string;
  department: string;
}

class AuthService {
  async getCurrentUser(): Promise<CurrentUser | null> {
    return new Promise((resolve, reject) => {
      if (typeof SP === "undefined") {
        console.error("SP not loaded - SharePoint context not available");
        reject(new Error("SP not loaded"));
        return;
      }

      try {
        console.log("Getting SharePoint context...");
        let clientContext = new SP.ClientContext.get_current();
        let peopleManager = new SP.UserProfiles.PeopleManager(clientContext);
        let userProfileProperties = peopleManager.getMyProperties();
        clientContext.load(userProfileProperties);

        clientContext.executeQueryAsync(
          function onSuccess() {
            console.log("Successfully got SharePoint user properties");
            const employee = userProfileProperties.get_userProfileProperties();
            console.log("Raw SharePoint user properties:", employee);
            
            const spsClaimId = employee["SPS-ClaimID"] || "";
            const firstName = employee.FirstName || "";
            const lastName = employee.LastName || "";
            const email = employee.Email || "";
            const fullName = `${firstName} ${lastName}`.trim();
            const employeeId = employee.EmployeeID || "";
            const department = employee.Department || "";

            const userInfo = {
              spsClaimId,
              firstName,
              lastName,
              fullName,
              email,
              employeeId,
              department
            };
            
            console.log("Processed user info:", userInfo);
            resolve(userInfo);
          },
          function onFailure(sender, args) {
            console.error("Failed to get SharePoint user properties:", args.get_message());
            reject(new Error("Error loading current user from SP: " + args.get_message()));
          }
        );
      } catch (error) {
        console.error("Error in getCurrentUser:", error);
        reject(error);
      }
    });
  }
}

export const authService = new AuthService(); 