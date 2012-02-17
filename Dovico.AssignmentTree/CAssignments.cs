using Dovico.CommonLibrary;

namespace Dovico.AssignmentTree
{
    public class CAssignments
    {
        // Returns the first page of root level assignments for the employee specified
        public static string GetAssignments(CDovicoID idEmployee, string sContentType, string sConsumerSecret, string sUserToken)
        {
            // Build up the URI for a request of assignments for the specified employee and then call our overloaded function to do the rest of
            // the work.
            string sURI = CRestApiHelper.BuildURI(("Assignments/Employee/" + idEmployee.ToString() + "/"), "", "1");
            return GetAssignments(sURI, sContentType, sConsumerSecret, sUserToken);
        }


        // Returns the assignments for the URI requested (if there are multiple pages of data, pass in the NextPageURI. If you are trying to get
        // the child assignment items, pass in the GetAssignmentsURI value of the item you wish to drill down on)
        public static string GetAssignments(string sAssignmentsURI, string sContentType, string sConsumerSecret, string sUserToken)
        {
            // Request the list of child assignments
            return CRestApiHelper.MakeAPIRequest(sAssignmentsURI, "GET", sContentType, "", sConsumerSecret, sUserToken);
        }
    }
}