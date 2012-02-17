using Dovico.CommonLibrary;

namespace Dovico.AssignmentTree
{
    public class CEmployee
    {
        // Returns the Employee ID that belongs to the Data Access Token specified
        public static string GetEmployeeID(string sContentType, string sConsumerSecret, string sUserToken)
        {
            string sURI = CRestApiHelper.BuildURI("Employees/Me/", "", "1");
            return CRestApiHelper.MakeAPIRequest(sURI, "GET", sContentType, "", sConsumerSecret, sUserToken);
        }
    }
}