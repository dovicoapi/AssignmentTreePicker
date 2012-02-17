using System.Web;
using System.Web.SessionState;
using Dovico.AssignmentTree.Properties;
using Dovico.CommonLibrary;

namespace Dovico.AssignmentTree
{
    public class ClientToServerSideMethodHook : IHttpHandler, IRequiresSessionState
    {
        public void ProcessRequest(HttpContext hcContext)
        {
            HttpRequest hrRequest = hcContext.Request;

            string sUserToken = (string)hcContext.Session["USER_TOKEN"];
            CDovicoID idEmployee = CDovicoID.Parse((string)hcContext.Session["USER_EMPLOYEE_ID"]);
            string sAction = hrRequest.Form["Action"];
            string sConsumerSecret = Settings.Default.CONSUMER_SECRET;

            // plan to be able to support JSON at some point
            string sContentType = "text/xml";

            
            string sResponse = "";

            if (sAction == "AssignmentsGetRootAssignments")
            {
                // AssignmentsURI is passed up here too but is an empty string.
                sResponse = CAssignments.GetAssignments(idEmployee, sContentType, sConsumerSecret, sUserToken);
            }
            else if (sAction == "AssignmentsGetAssignmentsForURI")
            {
                string sAssignmentsURI = hrRequest.Form["AssignmentsURI"];
                sResponse = CAssignments.GetAssignments(sAssignmentsURI, sContentType, sConsumerSecret, sUserToken);
            }
            
                        
            hcContext.Response.ContentType = sContentType;
            hcContext.Response.Write(sResponse);
        }


        public bool IsReusable { get { return true; } }
    }
}