using System;
using System.Xml;
using Dovico.AssignmentTree.Properties;
using Dovico.CommonLibrary;

namespace Dovico.AssignmentTree
{
    public partial class frm_main : System.Web.UI.Page
    {
        // Variable that will be grabbed by the .aspx page when rendering rather than us having to do special code to spit out JS on the fly.
        public string LOADING_MSG = "Loading...";


        protected void Page_Load(object sender, EventArgs e) 
        {
            // Default values for the error/information message section
            string sMessage = LOADING_MSG;
            bool bMessageIsError = false;


            // Grab the User Token that was passed in via the URI ( http://localhost/Dovico.AssignmentTree/{sUserToken} )
            string sUserToken = Page.RouteData.Values["sUserToken"].ToString();
            if (!string.IsNullOrWhiteSpace(sUserToken))
            {
                // Request the Employee ID that belongs to this token (will be needed by future calls for time, assignments, to retrieve 
                // information specific to the user that the token belongs to) and load the XML into an XmlDocument object
                XmlDocument xdDoc = new XmlDocument();
                xdDoc.LoadXml(CEmployee.GetEmployeeID(CRestApiHelper.MIME_TYPE_TEXT_XML, Settings.Default.CONSUMER_SECRET, sUserToken));

                // Grab the EmployeeID node. If a node was found then...
                XmlNode xnNode = xdDoc.SelectSingleNode("//Employees/Employee/ID");
                if (xnNode != null)
                {
                    // Grab the Employee ID value. If the person we're trying to log in with is the Admin user then...(can't track time with the
                    // admin user which is what this assignment tree was created for)
                    CDovicoID idEmployee = CDovicoID.Parse(xnNode.InnerText);
                    if (idEmployee == 99)
                    {
                        sMessage = "Please specify a Data Access Token of a standard DOVICO employee";
                        bMessageIsError = true;
                    }
                    else // NO problems with the ID...
                    {
                        Session["USER_TOKEN"] = sUserToken;
                        Session["USER_EMPLOYEE_ID"] = idEmployee.ToString();
                    } // End if (idEmployee == idAdminEmployee)
                }
                else // An error message was returned (e.g. bad token provided resulting in unauthorized error)
                {
                    // Build up the error message for the error/information message section
                    sMessage = xdDoc.SelectSingleNode("//Error/Description").InnerText + " (" + xdDoc.SelectSingleNode("//Error/Status").InnerText + ")";
                    bMessageIsError = true;
                } // End if (xnNode != null)
            } // End if (!string.IsNullOrWhiteSpace(sUserToken))
            

            // Set the initial message that the user will see and set the style to indicate if the message is informative or an error
            divMessage.InnerText = sMessage;
            divMessage.Attributes.Add("class", (bMessageIsError ? "divMessageError" : "divMessageNormal"));
        }
    }
}